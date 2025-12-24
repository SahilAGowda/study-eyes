/**
 * StudyEye Classroom Dashboard
 * 
 * Main dashboard component for real-time classroom engagement monitoring.
 * Integrates multi-student tracking, temporal behavior analysis, and comprehensive UI overlays.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { processingOrchestrator, initializeAllServices } from '../services';
import MultiStudentOverlay from './MultiStudentOverlay';
import type { ProcessingState } from '../services/processingOrchestrator';
import type { ClassroomState, StudentState } from '../types/studentState';
import type { BehaviorAnalysis } from '../services/temporalBehaviorEngine';

interface StudyEyeClassroomDashboardProps {
  className?: string;
  showDebugInfo?: boolean;
  enableMultiStudentTracking?: boolean;
  maxStudents?: number;
  anonymizeStudents?: boolean;
}

interface DashboardState {
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'checking';
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'checking';
}

export const StudyEyeClassroomDashboard: React.FC<StudyEyeClassroomDashboardProps> = ({
  className = '',
  showDebugInfo = false,
  enableMultiStudentTracking = true,
  maxStudents = 20,
  anonymizeStudents = true
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isInitialized: false,
    isProcessing: false,
    error: null,
    cameraPermission: 'prompt',
    microphonePermission: 'prompt'
  });

  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [classroomState, setClassroomState] = useState<ClassroomState | null>(null);
  const [behaviorAnalyses, setBehaviorAnalyses] = useState<Map<string, BehaviorAnalysis> | null>(null);

  /**
   * Initialize camera and microphone
   */
  const initializeMedia = useCallback(async () => {
    try {
      setDashboardState(prev => ({ ...prev, cameraPermission: 'checking', microphonePermission: 'checking' }));

      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setDashboardState(prev => ({
        ...prev,
        cameraPermission: 'granted',
        microphonePermission: 'granted',
        error: null
      }));

      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera/microphone';
      setDashboardState(prev => ({
        ...prev,
        cameraPermission: 'denied',
        microphonePermission: 'denied',
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  /**
   * Initialize StudyEye services
   */
  const initializeServices = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) {
      throw new Error('Video element or stream not available');
    }

    try {
      // Configure orchestrator for multi-student tracking
      processingOrchestrator.updateConfig({
        enableMultiStudentTracking,
        maxStudents,
        temporalAnalysisEnabled: true,
        targetFPS: 15
      });

      // Initialize all services
      await initializeAllServices(videoRef.current, streamRef.current);

      // Set up state update callback
      processingOrchestrator.onStateUpdate((state) => {
        setProcessingState(state);
        setClassroomState(state.classroomState);
        setBehaviorAnalyses(state.behaviorAnalyses);
      });

      setDashboardState(prev => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize services';
      setDashboardState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [enableMultiStudentTracking, maxStudents]);

  /**
   * Start processing
   */
  const startProcessing = useCallback(() => {
    if (!dashboardState.isInitialized) {
      setDashboardState(prev => ({ ...prev, error: 'Services not initialized' }));
      return;
    }

    try {
      processingOrchestrator.startProcessing();
      setDashboardState(prev => ({ ...prev, isProcessing: true, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start processing';
      setDashboardState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [dashboardState.isInitialized]);

  /**
   * Stop processing
   */
  const stopProcessing = useCallback(() => {
    processingOrchestrator.stopProcessing();
    setDashboardState(prev => ({ ...prev, isProcessing: false }));
  }, []);

  /**
   * Full initialization sequence
   */
  const initialize = useCallback(async () => {
    try {
      const stream = await initializeMedia();
      
      // Wait for video to be ready
      if (videoRef.current) {
        await new Promise<void>((resolve) => {
          const video = videoRef.current!;
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.addEventListener('loadeddata', () => resolve(), { once: true });
          }
        });
      }

      await initializeServices();
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }, [initializeMedia, initializeServices]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (dashboardState.isProcessing) {
        processingOrchestrator.stopProcessing();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [dashboardState.isProcessing]);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className={`studyeye-classroom-dashboard ${className}`}>
      {/* Main Video Display */}
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {/* Multi-Student Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        />
        
        {/* Multi-Student Overlay Component */}
        <MultiStudentOverlay
          videoElement={videoRef.current}
          classroomState={classroomState}
          behaviorAnalyses={behaviorAnalyses}
          canvasRef={canvasRef}
          showConfidence={showDebugInfo}
          showAttentionTarget={true}
          showBehaviorHistory={showDebugInfo}
          anonymizeStudents={anonymizeStudents}
        />

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <StatusIndicator
            dashboardState={dashboardState}
            processingState={processingState}
            classroomState={classroomState}
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
          <ControlButton
            onClick={dashboardState.isProcessing ? stopProcessing : startProcessing}
            disabled={!dashboardState.isInitialized}
            variant={dashboardState.isProcessing ? 'stop' : 'start'}
          >
            {dashboardState.isProcessing ? 'Stop' : 'Start'} Monitoring
          </ControlButton>
          
          <ControlButton
            onClick={() => processingOrchestrator.reset()}
            disabled={dashboardState.isProcessing}
            variant="reset"
          >
            Reset
          </ControlButton>
        </div>

        {/* Error Display */}
        {dashboardState.error && (
          <div className="absolute top-4 right-4 z-20">
            <ErrorDisplay error={dashboardState.error} />
          </div>
        )}
      </div>

      {/* Classroom Analytics Panel */}
      {classroomState && (
        <ClassroomAnalyticsPanel
          classroomState={classroomState}
          behaviorAnalyses={behaviorAnalyses}
          showDebugInfo={showDebugInfo}
        />
      )}

      {/* Debug Information */}
      {showDebugInfo && processingState && (
        <DebugPanel processingState={processingState} />
      )}
    </div>
  );
};

/**
 * Status Indicator Component
 */
interface StatusIndicatorProps {
  dashboardState: DashboardState;
  processingState: ProcessingState | null;
  classroomState: ClassroomState | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  dashboardState,
  processingState,
  classroomState
}) => {
  const getStatusColor = () => {
    if (dashboardState.error) return 'bg-red-500';
    if (!dashboardState.isInitialized) return 'bg-yellow-500';
    if (!dashboardState.isProcessing) return 'bg-gray-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (dashboardState.error) return 'Error';
    if (!dashboardState.isInitialized) return 'Initializing...';
    if (!dashboardState.isProcessing) return 'Ready';
    return 'Monitoring';
  };

  return (
    <div className="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {processingState && (
        <div className="text-xs text-gray-300 mt-1">
          FPS: {processingState.fps} | Students: {classroomState?.activeStudents || 0}
        </div>
      )}
    </div>
  );
};

/**
 * Control Button Component
 */
interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'start' | 'stop' | 'reset';
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  disabled = false,
  variant,
  children
}) => {
  const getButtonClass = () => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors';
    
    if (disabled) {
      return `${baseClass} bg-gray-600 text-gray-400 cursor-not-allowed`;
    }
    
    switch (variant) {
      case 'start':
        return `${baseClass} bg-green-600 hover:bg-green-700 text-white`;
      case 'stop':
        return `${baseClass} bg-red-600 hover:bg-red-700 text-white`;
      case 'reset':
        return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white`;
      default:
        return `${baseClass} bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClass()}
    >
      {children}
    </button>
  );
};

/**
 * Error Display Component
 */
interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="bg-red-600 text-white px-4 py-2 rounded-lg max-w-sm">
      <div className="font-medium text-sm">Error</div>
      <div className="text-xs mt-1">{error}</div>
    </div>
  );
};

/**
 * Classroom Analytics Panel Component
 */
interface ClassroomAnalyticsPanelProps {
  classroomState: ClassroomState;
  behaviorAnalyses: Map<string, BehaviorAnalysis> | null;
  showDebugInfo: boolean;
}

const ClassroomAnalyticsPanel: React.FC<ClassroomAnalyticsPanelProps> = ({
  classroomState,
  behaviorAnalyses,
  showDebugInfo
}) => {
  return (
    <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Classroom Analytics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{classroomState.activeStudents}</div>
          <div className="text-sm text-gray-600">Active Students</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(classroomState.averageEngagement)}%
          </div>
          <div className="text-sm text-gray-600">Avg Engagement</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{classroomState.alerts.length}</div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {classroomState.engagementDistribution.high}
          </div>
          <div className="text-sm text-gray-600">High Engagement</div>
        </div>
      </div>

      {/* Engagement Distribution */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Engagement Distribution</h4>
        <div className="flex gap-2">
          {Object.entries(classroomState.engagementDistribution).map(([level, count]) => (
            <div key={level} className="flex-1 text-center">
              <div className={`h-2 rounded ${
                level === 'high' ? 'bg-green-500' :
                level === 'medium' ? 'bg-yellow-500' :
                level === 'low' ? 'bg-orange-500' : 'bg-red-500'
              }`} style={{ width: `${(count / classroomState.activeStudents) * 100}%` }} />
              <div className="text-xs mt-1 capitalize">{level}: {count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      {classroomState.alerts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Recent Alerts</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {classroomState.alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`p-2 rounded text-sm ${
                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <div className="font-medium">{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                <div>{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Debug Panel Component
 */
interface DebugPanelProps {
  processingState: ProcessingState;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ processingState }) => {
  return (
    <div className="mt-4 bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Processing:</strong> {processingState.isProcessing ? 'Active' : 'Inactive'}
        </div>
        <div>
          <strong>FPS:</strong> {processingState.fps}
        </div>
        <div>
          <strong>Frame Count:</strong> {processingState.frameCount}
        </div>
        <div>
          <strong>Faces Detected:</strong> {processingState.faceDetection?.faceCount || 0}
        </div>
      </div>
      
      {processingState.classroomState && (
        <div className="mt-4">
          <strong>Students:</strong>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-32">
            {JSON.stringify(
              Array.from(processingState.classroomState.students.entries()).map(([id, student]) => ({
                id,
                active: student.isActive,
                engagement: student.engagement.score,
                behavior: student.behavior.primaryBehavior
              })),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default StudyEyeClassroomDashboard;