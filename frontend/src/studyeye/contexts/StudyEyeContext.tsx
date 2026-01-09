/**
 * StudyEyeContext
 * 
 * Global state management for StudyEye system using React Context.
 * Manages camera, audio, behavior, engagement, mode, and privacy settings.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.6
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  FaceDetectionResult,
  GazeData,
  EmotionResult,
  ObjectDetectionResult,
  AudioData,
  BehaviorResult,
  EngagementScore,
  OperationMode,
  ClassroomOutput,
  ExamOutput,
} from '../types';
import type { ProcessingState } from '../services/processingOrchestrator';
import type { TimelineDataPoint } from '../types';
import { processingOrchestrator, getTemporalAnalyzer } from '../services';
import { getSessionTracker } from '../services/sessionTracker';

export interface StudyEyeState {
  // Session state
  isSessionActive: boolean;
  sessionStartTime: Date | null;
  
  // Camera and audio
  videoElement: HTMLVideoElement | null;
  audioStream: MediaStream | null;
  isCameraActive: boolean;
  isMicrophoneActive: boolean;
  
  // Processing state
  isProcessing: boolean;
  fps: number;
  
  // AI results
  faceDetection: FaceDetectionResult | null;
  gazeResult: GazeData | null;
  emotionResult: EmotionResult | null;
  objectDetections: ObjectDetectionResult[];
  audioActivity: AudioData | null;
  behaviorResult: BehaviorResult | null;
  engagementScore: EngagementScore | null;
  
  // Timeline data
  timelineData: TimelineDataPoint[];
  
  // Mode and privacy
  mode: OperationMode;
  anonymizationEnabled: boolean;
  blurIntensity: number;
  
  // Errors
  error: string | null;
}

export interface StudyEyeContextValue {
  state: StudyEyeState;
  
  // Session control
  startSession: (videoElement: HTMLVideoElement, audioStream?: MediaStream) => Promise<void>;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Mode control
  setMode: (mode: OperationMode) => void;
  
  // Privacy control
  setAnonymization: (enabled: boolean) => void;
  setBlurIntensity: (intensity: number) => void;
  
  // State updates
  updateState: (updates: Partial<StudyEyeState>) => void;
  
  // Get formatted output
  getOutput: () => ClassroomOutput | ExamOutput;
}

const StudyEyeContext = createContext<StudyEyeContextValue | undefined>(undefined);

export const StudyEyeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StudyEyeState>({
    isSessionActive: false,
    sessionStartTime: null,
    videoElement: null,
    audioStream: null,
    isCameraActive: false,
    isMicrophoneActive: false,
    isProcessing: false,
    fps: 0,
    faceDetection: null,
    gazeResult: null,
    emotionResult: null,
    objectDetections: [],
    audioActivity: null,
    behaviorResult: null,
    engagementScore: null,
    timelineData: [],
    mode: 'classroom',
    anonymizationEnabled: false,
    blurIntensity: 50,
    error: null,
  });

  // Update state from processing orchestrator
  useEffect(() => {
    const unsubscribe = processingOrchestrator.onStateUpdate((processingState: ProcessingState) => {
      setState((prev) => ({
        ...prev,
        isProcessing: processingState.isProcessing,
        fps: processingState.fps,
        faceDetection: processingState.faceDetection,
        gazeResult: processingState.gazeResult,
        emotionResult: processingState.emotionResult,
        objectDetections: processingState.objectDetections,
        audioActivity: processingState.audioActivity,
        behaviorResult: processingState.behaviorResult,
        engagementScore: processingState.engagementScore,
      }));
    });

    return unsubscribe;
  }, []);

  // Update timeline data periodically
  useEffect(() => {
    if (!state.isSessionActive) return;

    const interval = setInterval(() => {
      const temporalAnalyzer = getTemporalAnalyzer();
      const timeline = temporalAnalyzer.getTimeline();
      setState((prev) => ({
        ...prev,
        timelineData: timeline.map((point) => ({
          timestamp: point.timestamp,
          engagement: point.score || 0,
          behavior: '',
          confidence: 0,
          engagementScore: point.score,
          isAlert: (point as any).isAlert || false,
        })),
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [state.isSessionActive]);

  const startSession = useCallback(
    async (videoElement: HTMLVideoElement, audioStream?: MediaStream) => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        // Initialize orchestrator
        await processingOrchestrator.initialize(videoElement, audioStream || null);

        // Start processing
        processingOrchestrator.startProcessing();
        
        // Start session tracking for reports
        const sessionTracker = getSessionTracker();
        sessionTracker.startSession();

        setState((prev) => ({
          ...prev,
          isSessionActive: true,
          sessionStartTime: new Date(),
          videoElement,
          audioStream: audioStream || null,
          isCameraActive: true,
          isMicrophoneActive: !!audioStream,
        }));

        console.log('StudyEye session started');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
        setState((prev) => ({ ...prev, error: errorMessage }));
        console.error('Failed to start session:', error);
        throw error;
      }
    },
    []
  );

  const stopSession = useCallback(() => {
    // End session tracking and save report
    const sessionTracker = getSessionTracker();
    const report = sessionTracker.endSession();
    if (report) {
      console.log('📊 Session report saved:', report.summary);
    }
    
    processingOrchestrator.stopProcessing();
    processingOrchestrator.reset();

    setState((prev) => ({
      ...prev,
      isSessionActive: false,
      sessionStartTime: null,
      isProcessing: false,
      faceDetection: null,
      gazeResult: null,
      emotionResult: null,
      objectDetections: [],
      audioActivity: null,
      behaviorResult: null,
      engagementScore: null,
      timelineData: [],
    }));

    console.log('StudyEye session stopped');
  }, []);

  const pauseSession = useCallback(() => {
    processingOrchestrator.stopProcessing();
    setState((prev) => ({ ...prev, isProcessing: false }));
    console.log('StudyEye session paused');
  }, []);

  const resumeSession = useCallback(() => {
    processingOrchestrator.startProcessing();
    setState((prev) => ({ ...prev, isProcessing: true }));
    console.log('StudyEye session resumed');
  }, []);

  const setMode = useCallback((mode: OperationMode) => {
    setState((prev) => ({ ...prev, mode }));
    console.log(`Mode changed to: ${mode}`);
  }, []);

  const setAnonymization = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, anonymizationEnabled: enabled }));
  }, []);

  const setBlurIntensity = useCallback((intensity: number) => {
    setState((prev) => ({ ...prev, blurIntensity: intensity }));
  }, []);

  const updateState = useCallback((updates: Partial<StudyEyeState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const getOutput = useCallback(() => {
    const output = processingOrchestrator.getClassroomOutput();
    if (output) {
      return output;
    }
    // Return default output
    return processingOrchestrator.getOutput(state.mode);
  }, [state.mode]);

  const value: StudyEyeContextValue = {
    state,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    setMode,
    setAnonymization,
    setBlurIntensity,
    updateState,
    getOutput,
  };

  return <StudyEyeContext.Provider value={value}>{children}</StudyEyeContext.Provider>;
};

/**
 * Hook to use StudyEye context
 */
export const useStudyEyeContext = (): StudyEyeContextValue => {
  const context = useContext(StudyEyeContext);
  if (!context) {
    throw new Error('useStudyEyeContext must be used within StudyEyeProvider');
  }
  return context;
};

export default StudyEyeContext;
