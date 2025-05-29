import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import realWebSocketService from '../services/realWebSocketService';

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  eyeTrackingData: any;
  focusScore: number;
  attentionAlerts: any[];
  startTracking: (sessionId: string, token: string) => void;
  stopTracking: (sessionId: string) => void;
  pauseTracking: (sessionId: string) => void;
  resumeTracking: (sessionId: string) => void;
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [eyeTrackingData, setEyeTrackingData] = useState<any>(null);
  const [focusScore, setFocusScore] = useState(100);
  const [attentionAlerts, setAttentionAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Setup WebSocket event listeners
    realWebSocketService.on('connection_status', (data: { connected: boolean; reason?: string }) => {
      setIsConnected(data.connected);
      if (!data.connected && data.reason) {
        setConnectionError(`Connection lost: ${data.reason}`);
      } else if (data.connected) {
        setConnectionError(null);
      }
    });

    realWebSocketService.on('connection_error', (data: { error: string }) => {
      setConnectionError(data.error);
    });

    realWebSocketService.on('eye_tracking_data', (data: any) => {
      setEyeTrackingData(data);
    });

    realWebSocketService.on('focus_score_update', (data: { score: number }) => {
      setFocusScore(data.score);
    });

    realWebSocketService.on('attention_alert', (data: any) => {
      setAttentionAlerts(prev => [
        ...prev.slice(-9), // Keep last 9 alerts
        {
          ...data,
          id: Date.now(),
          timestamp: data.timestamp || new Date().toISOString()
        }
      ]);
    });

    realWebSocketService.on('tracking_status', (data: any) => {
      console.log('Tracking status:', data);
      if (data.status === 'started') {
        setAttentionAlerts([]); // Clear previous alerts
      }
    });

    realWebSocketService.on('error', (data: any) => {
      console.error('WebSocket error:', data);
      setConnectionError(data.error || 'WebSocket error occurred');
    });

    // Initialize connection status
    setIsConnected(realWebSocketService.getConnectionStatus());

    // Cleanup function
    return () => {
      // Note: realWebSocketService handles cleanup internally
    };
  }, []);

  const startTracking = (sessionId: string, token: string) => {
    console.log('Starting tracking for session:', sessionId);
    realWebSocketService.startTracking(sessionId, token);
  };

  const stopTracking = (sessionId: string) => {
    console.log('Stopping tracking for session:', sessionId);
    realWebSocketService.stopTracking(sessionId);
  };

  const pauseTracking = (sessionId: string) => {
    console.log('Pausing tracking for session:', sessionId);
    realWebSocketService.pauseTracking(sessionId);
  };

  const resumeTracking = (sessionId: string) => {
    console.log('Resuming tracking for session:', sessionId);
    realWebSocketService.resumeTracking(sessionId);
  };

  const clearAlerts = () => {
    setAttentionAlerts([]);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionError,
    eyeTrackingData,
    focusScore,
    attentionAlerts,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    clearAlerts,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
