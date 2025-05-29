// Real WebSocket service for Study Eyes
import { io, Socket } from 'socket.io-client';

interface TrackingData {
  session_id: string;
  timestamp: string;
  attention_score: number;
  focus_level: string;
  distraction_type: string;
  fatigue_level: string;
  eye_strain_level: number;
  posture_score: number;
  gaze_direction_x: number;
  gaze_direction_y: number;
  left_eye_ratio: number;
  right_eye_ratio: number;
  blink_detected: boolean;
  head_pitch: number;
  head_yaw: number;
  head_roll: number;
  is_focused: boolean;
  data?: {
    face_landmarks?: any;
    [key: string]: any;
  };
}

interface ConnectionStatus {
  connected: boolean;
  reason?: string;
}

type EventCallback = (data: any) => void;

class RealWebSocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, EventCallback[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }
  private connect() {
    try {
      // First try to connect without auth to see if server is available
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('connection_error', { error: 'Failed to create connection' });
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection_error', { error: error.message || 'Connection failed' });
    });

    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });    this.socket.on('tracking_data', (data: TrackingData) => {
      // Transform backend data to frontend format
      const transformedData = {
        timestamp: data.timestamp,
        attention_score: data.attention_score,
        focus_level: data.focus_level,
        distraction_type: data.distraction_type,
        fatigue_level: data.fatigue_level,
        eye_strain_level: data.eye_strain_level,
        posture_score: data.posture_score,
        gaze: {
          x: data.gaze_direction_x,
          y: data.gaze_direction_y
        },
        eyes: {
          left_ratio: data.left_eye_ratio,
          right_ratio: data.right_eye_ratio,
          blink_detected: data.blink_detected
        },
        head_pose: {
          pitch: data.head_pitch,
          yaw: data.head_yaw,
          roll: data.head_roll
        },
        face_landmarks: data.data?.face_landmarks || null, // Include face landmarks if available
        is_focused: data.is_focused
      };

      this.emit('eye_tracking_data', transformedData);
      this.emit('focus_score_update', { score: data.attention_score });
      
      // Check for attention alerts
      if (data.attention_score < 60) {
        this.emit('attention_alert', {
          type: 'low_attention',
          message: 'Your attention level is low. Take a break or refocus.',
          severity: 'warning',
          timestamp: data.timestamp
        });
      }
      
      if (data.distraction_type !== 'none') {
        this.emit('attention_alert', {
          type: 'distraction',
          message: `Distraction detected: ${data.distraction_type}`,
          severity: 'info',
          timestamp: data.timestamp
        });
      }
      
      if (data.eye_strain_level > 20) {
        this.emit('attention_alert', {
          type: 'eye_strain',
          message: 'High eye strain detected. Consider taking a break.',
          severity: 'warning',
          timestamp: data.timestamp
        });
      }
    });

    this.socket.on('tracking_started', (data) => {
      console.log('Tracking started:', data);
      this.emit('tracking_status', { status: 'started', data });
    });

    this.socket.on('tracking_stopped', (data) => {
      console.log('Tracking stopped:', data);
      this.emit('tracking_status', { status: 'stopped', data });
    });

    this.socket.on('tracking_paused', (data) => {
      console.log('Tracking paused:', data);
      this.emit('tracking_status', { status: 'paused', data });
    });

    this.socket.on('tracking_resumed', (data) => {
      console.log('Tracking resumed:', data);
      this.emit('tracking_status', { status: 'resumed', data });
    });

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      this.emit('connection_error', { error: data.message || 'Unknown error' });
    });
  }

  public startTracking(sessionId: string, token: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      this.emit('connection_error', { error: 'Not connected to server' });
      return;
    }

    this.socket.emit('start_tracking', {
      session_id: sessionId,
      token: token
    });
  }

  public stopTracking(sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    const token = localStorage.getItem('token');
    this.socket.emit('stop_tracking', {
      session_id: sessionId,
      token: token
    });
  }

  public pauseTracking(sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    const token = localStorage.getItem('token');
    this.socket.emit('pause_tracking', {
      session_id: sessionId,
      token: token
    });
  }

  public resumeTracking(sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    const token = localStorage.getItem('token');
    this.socket.emit('resume_tracking', {
      session_id: sessionId,
      token: token
    });
  }

  public on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create and export a singleton instance
const realWebSocketService = new RealWebSocketService();
export default realWebSocketService;
