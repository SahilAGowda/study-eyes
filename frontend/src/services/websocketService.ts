import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }
  private connect(): void {
    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.emit('connection_status', { connected: false, reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }
      
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection_error', { error: error.message });
      this.handleReconnection();
    });

    // Eye tracking events
    this.socket.on('eye_tracking_data', (data) => {
      this.emit('eye_tracking_data', data);
    });

    this.socket.on('attention_alert', (data) => {
      this.emit('attention_alert', data);
    });

    this.socket.on('focus_score_update', (data) => {
      this.emit('focus_score_update', data);
    });

    // Session events
    this.socket.on('session_started', (data) => {
      this.emit('session_started', data);
    });

    this.socket.on('session_paused', (data) => {
      this.emit('session_paused', data);
    });

    this.socket.on('session_resumed', (data) => {
      this.emit('session_resumed', data);
    });

    this.socket.on('session_ended', (data) => {
      this.emit('session_ended', data);
    });

    // Analytics events
    this.socket.on('analytics_update', (data) => {
      this.emit('analytics_update', data);
    });

    // Error events
    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      this.emit('error', data);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Public methods for sending events
  public startTracking(sessionId: string, token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('start_tracking', { session_id: sessionId, token });
    } else {
      console.warn('WebSocket not connected. Cannot start tracking.');
    }
  }

  public stopTracking(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('stop_tracking', { session_id: sessionId });
    } else {
      console.warn('WebSocket not connected. Cannot stop tracking.');
    }
  }

  public pauseTracking(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('pause_tracking', { session_id: sessionId });
    } else {
      console.warn('WebSocket not connected. Cannot pause tracking.');
    }
  }

  public resumeTracking(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('resume_tracking', { session_id: sessionId });
    } else {
      console.warn('WebSocket not connected. Cannot resume tracking.');
    }
  }

  public sendEyeTrackingData(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('eye_tracking_data', data);
    }
  }

  public sendCameraFrame(frameData: string): void {
    if (this.socket?.connected) {
      this.socket.emit('camera_frame', { frame: frameData });
    }
  }

  // Event listener management
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Connection management
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Authentication
  public authenticate(token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { token });
    }
  }

  // Get connection statistics
  public getConnectionStats(): any {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
      transport: this.socket?.io.engine.transport.name,
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
