class MockWebSocketService {
  private eventHandlers: Map<string, Function[]> = new Map();
  private isConnectionActive = false;
  private focusSimulationInterval: NodeJS.Timeout | null = null;
  private sessionActive = false;

  constructor() {
    // Simulate connection
    setTimeout(() => {
      this.isConnectionActive = true;
      this.emit('connection_status', { connected: true });
    }, 1000);
  }

  // Start mock focus detection simulation
  public startTracking(sessionId: string, token: string): void {
    console.log('Starting mock tracking for session:', sessionId);
    this.sessionActive = true;
    this.emit('session_started', { session_id: sessionId });
    
    // Start generating mock focus detection data
    this.focusSimulationInterval = setInterval(() => {
      this.generateMockFocusData();
    }, 1000);
  }

  public stopTracking(sessionId: string): void {
    console.log('Stopping mock tracking for session:', sessionId);
    this.sessionActive = false;
    if (this.focusSimulationInterval) {
      clearInterval(this.focusSimulationInterval);
      this.focusSimulationInterval = null;
    }
    this.emit('session_ended', { session_id: sessionId });
  }

  public pauseTracking(sessionId: string): void {
    if (this.focusSimulationInterval) {
      clearInterval(this.focusSimulationInterval);
      this.focusSimulationInterval = null;
    }
    this.emit('session_paused', { session_id: sessionId });
  }

  public resumeTracking(sessionId: string): void {
    if (this.sessionActive) {
      this.focusSimulationInterval = setInterval(() => {
        this.generateMockFocusData();
      }, 1000);
    }
    this.emit('session_resumed', { session_id: sessionId });
  }

  private generateMockFocusData() {
    if (!this.sessionActive) return;

    // Generate realistic mock focus detection data
    const timestamp = Date.now();
    const baseAttention = 75 + Math.sin(timestamp / 20000) * 20; // Smooth wave between 55-95
    const noise = (Math.random() - 0.5) * 10; // Add some noise
    const attention_score = Math.max(0, Math.min(1, (baseAttention + noise) / 100));
    
    const eyeStrainBase = 15 + Math.sin(timestamp / 30000) * 10; // Varies between 5-25
    const eye_strain_level = Math.max(0, Math.min(50, eyeStrainBase + (Math.random() - 0.5) * 5));
    
    const postureBase = 85 + Math.sin(timestamp / 25000) * 10; // Varies between 75-95
    const posture_score = Math.max(60, Math.min(100, postureBase + (Math.random() - 0.5) * 5));
    
    const mockData = {
      timestamp,
      attention_score,
      eye_strain_level,
      posture_score,
      blink_rate: Math.random() * 5 + 15, // 15-20 blinks per minute
      gaze_position: {
        x: 0.5 + (Math.random() - 0.5) * 0.3, // Center with some movement
        y: 0.5 + (Math.random() - 0.5) * 0.3
      },
      focus_zones: {
        screen_center: attention_score > 0.7,
        peripheral: attention_score < 0.5
      },
      session_active: true
    };

    this.emit('eye_tracking_data', mockData);
    this.emit('focus_score_update', { score: Math.round(attention_score * 100) });

    // Occasionally generate attention alerts
    if (attention_score < 0.4 && Math.random() < 0.15) {
      this.emit('attention_alert', {
        type: 'low_attention',
        message: 'Low attention detected - consider taking a short break',
        severity: 'warning',
        timestamp: new Date(),
        id: Date.now()
      });
    }

    if (eye_strain_level > 30 && Math.random() < 0.1) {
      this.emit('attention_alert', {
        type: 'eye_strain',
        message: 'High eye strain detected - look away from screen for 20 seconds',
        severity: 'error',
        timestamp: new Date(),
        id: Date.now()
      });
    }

    if (posture_score < 70 && Math.random() < 0.08) {
      this.emit('attention_alert', {
        type: 'posture',
        message: 'Poor posture detected - adjust your sitting position',
        severity: 'warning',
        timestamp: new Date(),
        id: Date.now()
      });
    }
  }

  // Event listener management
  public on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!this.eventHandlers.has(event)) return;

    if (callback) {
      const callbacks = this.eventHandlers.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventHandlers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Connection management
  public isConnected(): boolean {
    return this.isConnectionActive;
  }

  public disconnect(): void {
    this.isConnectionActive = false;
    if (this.focusSimulationInterval) {
      clearInterval(this.focusSimulationInterval);
      this.focusSimulationInterval = null;
    }
  }

  // Mock methods for compatibility
  public sendEyeTrackingData(data: any): void {
    console.log('Mock: Eye tracking data sent', data);
  }

  public sendCameraFrame(frameData: string): void {
    console.log('Mock: Camera frame sent');
  }

  public authenticate(token: string): void {
    console.log('Mock: Authenticated with token');
  }

  public getConnectionStats(): any {
    return {
      connected: this.isConnected(),
      mock: true,
      sessionActive: this.sessionActive
    };
  }
}

// Create singleton instance
const mockWebSocketService = new MockWebSocketService();

export default mockWebSocketService;
