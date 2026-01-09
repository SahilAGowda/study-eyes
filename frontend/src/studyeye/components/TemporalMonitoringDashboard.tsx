/**
 * TemporalMonitoringDashboard Component
 * 
 * Integrated dashboard with temporal modeling features:
 * - Teacher voice enrollment
 * - Keyword detection for note-taking mode
 * - Real session analytics
 * - Noise/unauthorized speaker alerts
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { processingOrchestrator, initializeAllServices } from '../services';
import { getKeywordDetector, KeywordDetector } from '../services/keywordDetector';
import { getSessionTracker, SessionTracker } from '../services/sessionTracker';
import MultiStudentOverlay from './MultiStudentOverlay';
import TeacherVoicePanel from './TeacherVoicePanel';
import SessionAnalyticsPanel from './SessionAnalyticsPanel';
import AudioActivityIndicator from './AudioActivityIndicator';
import type { ProcessingState } from '../services/processingOrchestrator';
import type { ClassroomState } from '../types/studentState';
import type { BehaviorAnalysis } from '../services/temporalBehaviorEngine';
import type { VoiceProfile, VoiceEnrollmentProgress } from '../types';
import type { SessionMetrics } from '../services/sessionTracker';

interface NoiseAlert {
  id: string;
  timestamp: number;
  type: 'unauthorized_speaker' | 'noise' | 'student_talking';
  message: string;
}

interface DashboardState {
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'checking';
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'checking';
}

export const TemporalMonitoringDashboard: React.FC = () => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const keywordDetectorRef = useRef<KeywordDetector | null>(null);
  const sessionTrackerRef = useRef<SessionTracker | null>(null);

  // Dashboard state
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isInitialized: false,
    isProcessing: false,
    error: null,
    cameraPermission: 'prompt',
    microphonePermission: 'prompt',
  });

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [classroomState, setClassroomState] = useState<ClassroomState | null>(null);
  const [behaviorAnalyses, setBehaviorAnalyses] = useState<Map<string, BehaviorAnalysis> | null>(null);

  // Voice enrollment state
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState<VoiceEnrollmentProgress>({
    isEnrolling: false,
    progress: 0,
    remainingSeconds: 0,
    samplesCollected: 0,
    requiredSamples: 30,
  });
  const [hasVoiceProfile, setHasVoiceProfile] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);

  // Audio state
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [speakerSimilarity, setSpeakerSimilarity] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Keyword detection state
  const [isKeywordDetectionActive, setIsKeywordDetectionActive] = useState(false);
  const [isNoteTakingMode, setIsNoteTakingMode] = useState(false);
  const [noteTakingRemainingSeconds, setNoteTakingRemainingSeconds] = useState(0);
  const [lastKeywordDetected, setLastKeywordDetected] = useState<string | null>(null);

  // Session analytics state
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [currentBehavior, setCurrentBehavior] = useState('no_face_detected');
  const [currentEngagement, setCurrentEngagement] = useState(0);

  // Noise alerts
  const [noiseAlerts, setNoiseAlerts] = useState<NoiseAlert[]>([]);

  // Initialize media
  const initializeMedia = useCallback(async () => {
    try {
      setDashboardState(prev => ({ ...prev, cameraPermission: 'checking', microphonePermission: 'checking' }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setDashboardState(prev => ({
        ...prev,
        cameraPermission: 'granted',
        microphonePermission: 'granted',
        error: null,
      }));

      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera/microphone';
      setDashboardState(prev => ({
        ...prev,
        cameraPermission: 'denied',
        microphonePermission: 'denied',
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Initialize services
  const initializeServices = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) {
      throw new Error('Video element or stream not available');
    }

    try {
      processingOrchestrator.updateConfig({
        enableMultiStudentTracking: true,
        maxStudents: 20,
        temporalAnalysisEnabled: true,
        targetFPS: 15,
      });

      await initializeAllServices(videoRef.current, streamRef.current);

      // Initialize keyword detector
      keywordDetectorRef.current = getKeywordDetector();
      if (KeywordDetector.isSupported()) {
        keywordDetectorRef.current.initialize();
        setupKeywordDetectorEvents();
      }

      // Initialize session tracker
      sessionTrackerRef.current = getSessionTracker();

      // Set up state update callback
      processingOrchestrator.onStateUpdate((state) => {
        setProcessingState(state);
        setClassroomState(state.classroomState);
        setBehaviorAnalyses(state.behaviorAnalyses);
        
        // Update audio state
        if (state.audioActivity) {
          setIsSpeaking(state.audioActivity.isSpeaking);
          setAudioLevel(state.audioActivity.audioLevel);
          setIsTeacherSpeaking(state.audioActivity.isTeacherSpeaking || false);
          setSpeakerSimilarity(state.audioActivity.speakerSimilarity || 0);

          // Check for unauthorized speaker
          if (state.audioActivity.unauthorizedSpeakerDetected && hasVoiceProfile) {
            addNoiseAlert('unauthorized_speaker', 'Unauthorized speaker detected');
            sessionTrackerRef.current?.recordUnauthorizedSpeaker();
          }
        }

        // Update behavior and engagement
        if (state.classroomState) {
          const firstStudent = Array.from(state.classroomState.students.values()).find(s => s.isActive);
          if (firstStudent) {
            const behavior = firstStudent.behavior.primaryBehavior;
            setCurrentBehavior(behavior);
            setCurrentEngagement(firstStudent.engagement.score);
            
            // Update session tracker
            sessionTrackerRef.current?.updateBehavior(behavior, isNoteTakingMode);
            sessionTrackerRef.current?.recordEngagement(firstStudent.engagement.score);
          }
        }

        // Update session metrics
        if (sessionTrackerRef.current?.isSessionActive()) {
          setSessionMetrics(sessionTrackerRef.current.getMetrics());
        }
      });

      setDashboardState(prev => ({ ...prev, isInitialized: true, error: null }));
      setHasVoiceProfile(processingOrchestrator.hasTeacherVoiceProfile());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize services';
      setDashboardState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [hasVoiceProfile, isNoteTakingMode]);

  // Setup keyword detector events
  const setupKeywordDetectorEvents = () => {
    const detector = keywordDetectorRef.current;
    if (!detector) {
      console.warn('[Dashboard] Cannot setup keyword events - detector not available');
      return;
    }

    console.log('[Dashboard] Setting up keyword detector events');

    detector.on('keyword_detected', (event) => {
      console.log('[Dashboard] 🎯 Keyword detected:', event.keyword);
      setLastKeywordDetected(event.keyword || null);
      sessionTrackerRef.current?.recordKeywordDetected(event.keyword || '');
    });

    detector.on('note_taking_started', (event) => {
      console.log('[Dashboard] 📝 Note-taking mode started');
      setIsNoteTakingMode(true);
    });

    detector.on('note_taking_ended', () => {
      console.log('[Dashboard] 📝 Note-taking mode ended');
      setIsNoteTakingMode(false);
      setNoteTakingRemainingSeconds(0);
    });
    
    detector.on('speech_recognized', (event) => {
      // Log speech for debugging (can be removed later)
      console.log('[Dashboard] 🎙️ Speech recognized:', event.transcript);
    });
    
    detector.on('error', (event) => {
      console.error('[Dashboard] Keyword detector error:', event.transcript);
    });
  };

  // Add noise alert
  const addNoiseAlert = (type: NoiseAlert['type'], message: string) => {
    const alert: NoiseAlert = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
    };
    setNoiseAlerts(prev => [alert, ...prev].slice(0, 50));
  };

  // Start processing
  const startProcessing = useCallback(() => {
    if (!dashboardState.isInitialized) return;

    processingOrchestrator.startProcessing();
    sessionTrackerRef.current?.startSession();
    setDashboardState(prev => ({ ...prev, isProcessing: true, error: null }));
  }, [dashboardState.isInitialized]);

  // Stop processing
  const stopProcessing = useCallback(() => {
    processingOrchestrator.stopProcessing();
    const report = sessionTrackerRef.current?.endSession();
    if (report) {
      console.log('Session Report:', report);
    }
    setDashboardState(prev => ({ ...prev, isProcessing: false }));
  }, []);

  // Start teacher voice enrollment
  const handleStartEnrollment = async () => {
    setIsEnrolling(true);
    
    const progressInterval = setInterval(() => {
      const progress = processingOrchestrator.getEnrollmentProgress();
      setEnrollmentProgress(progress);
    }, 100);

    try {
      const profile = await processingOrchestrator.enrollTeacherVoice(12);
      setVoiceProfile(profile);
      setHasVoiceProfile(true);
      processingOrchestrator.enableVoiceVerification(0.7);
    } catch (error) {
      console.error('Enrollment failed:', error);
      setDashboardState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Enrollment failed' 
      }));
    } finally {
      clearInterval(progressInterval);
      setIsEnrolling(false);
      setEnrollmentProgress({
        isEnrolling: false,
        progress: 0,
        remainingSeconds: 0,
        samplesCollected: 0,
        requiredSamples: 30,
      });
    }
  };

  // Clear voice profile
  const handleClearProfile = () => {
    processingOrchestrator.clearTeacherVoiceProfile();
    setHasVoiceProfile(false);
    setVoiceProfile(null);
  };

  // Toggle keyword detection
  const handleToggleKeywordDetection = () => {
    const detector = keywordDetectorRef.current;
    if (!detector) {
      console.error('[Dashboard] Keyword detector not available');
      return;
    }

    if (isKeywordDetectionActive) {
      console.log('[Dashboard] Stopping keyword detection');
      detector.stopListening();
      setIsKeywordDetectionActive(false);
    } else {
      // Make sure it's initialized
      if (!KeywordDetector.isSupported()) {
        console.error('[Dashboard] Web Speech API not supported');
        setDashboardState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser. Try Chrome.' }));
        return;
      }
      
      console.log('[Dashboard] Starting keyword detection');
      const started = detector.startListening();
      if (started) {
        setIsKeywordDetectionActive(true);
      } else {
        console.error('[Dashboard] Failed to start keyword detection');
        setDashboardState(prev => ({ ...prev, error: 'Failed to start keyword detection. Check microphone permissions.' }));
      }
    }
  };

  // Dismiss alert
  const handleDismissAlert = (id: string) => {
    setNoiseAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Clear all alerts
  const handleClearAllAlerts = () => {
    setNoiseAlerts([]);
  };

  // Update note-taking remaining time
  useEffect(() => {
    if (!isNoteTakingMode) return;

    const interval = setInterval(() => {
      const remaining = keywordDetectorRef.current?.getNoteTakingRemainingSeconds() || 0;
      setNoteTakingRemainingSeconds(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [isNoteTakingMode]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeMedia();
        
        if (videoRef.current) {
          await new Promise<void>((resolve) => {
            const video = videoRef.current!;
            if (video.readyState >= 2) resolve();
            else video.addEventListener('loadeddata', () => resolve(), { once: true });
          });
        }

        await initializeServices();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();

    return () => {
      if (dashboardState.isProcessing) {
        processingOrchestrator.stopProcessing();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      keywordDetectorRef.current?.dispose();
    };
  }, []);

  return (
    <Box sx={{ p: 2, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Main Video Area */}
        <Box sx={{ flex: '1 1 65%', minWidth: 400 }}>
          <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              autoPlay
              muted
              playsInline
            />
            
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />

            <MultiStudentOverlay
              videoElement={videoRef.current}
              classroomState={classroomState}
              behaviorAnalyses={behaviorAnalyses}
              canvasRef={canvasRef}
              showConfidence={false}
              showAttentionTarget={true}
              showBehaviorHistory={false}
              anonymizeStudents={false}
            />

            {/* Note-Taking Mode Overlay */}
            {isNoteTakingMode && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(33, 150, 243, 0.9)',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  📝 Note-Taking Mode - {Math.ceil(noteTakingRemainingSeconds)}s
                </Typography>
              </Box>
            )}

            {/* Controls */}
            <Box sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color={dashboardState.isProcessing ? 'error' : 'success'}
                onClick={dashboardState.isProcessing ? stopProcessing : startProcessing}
                disabled={!dashboardState.isInitialized}
              >
                {dashboardState.isProcessing ? 'Stop' : 'Start'} Monitoring
              </Button>
            </Box>

            {/* Status */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', px: 2, py: 1, borderRadius: 1 }}>
              <Typography variant="body2">
                {!dashboardState.isInitialized ? 'Initializing...' : 
                 !dashboardState.isProcessing ? 'Ready' : 
                 `Monitoring • FPS: ${processingState?.fps || 0}`}
              </Typography>
            </Box>
          </Paper>

          {/* Error Display */}
          {dashboardState.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {dashboardState.error}
            </Alert>
          )}
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Audio Activity */}
            <AudioActivityIndicator
              isActive={dashboardState.isProcessing}
              audioLevel={audioLevel}
              isSpeaking={isSpeaking}
              lastUpdated={new Date()}
            />

            {/* Teacher Voice & Keywords Panel */}
            <TeacherVoicePanel
              isEnrolling={isEnrolling}
              enrollmentProgress={enrollmentProgress}
              hasVoiceProfile={hasVoiceProfile}
              voiceProfile={voiceProfile}
              onStartEnrollment={handleStartEnrollment}
              onClearProfile={handleClearProfile}
              isTeacherSpeaking={isTeacherSpeaking}
              speakerSimilarity={speakerSimilarity}
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              isKeywordDetectionActive={isKeywordDetectionActive}
              isNoteTakingMode={isNoteTakingMode}
              noteTakingRemainingSeconds={noteTakingRemainingSeconds}
              lastKeywordDetected={lastKeywordDetected}
              onToggleKeywordDetection={handleToggleKeywordDetection}
              noiseAlerts={noiseAlerts}
              onDismissAlert={handleDismissAlert}
              onClearAllAlerts={handleClearAllAlerts}
            />

            {/* Session Analytics */}
            <SessionAnalyticsPanel
              metrics={sessionMetrics}
              isSessionActive={dashboardState.isProcessing}
              currentBehavior={currentBehavior}
              currentEngagement={currentEngagement}
              isNoteTakingMode={isNoteTakingMode}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TemporalMonitoringDashboard;
