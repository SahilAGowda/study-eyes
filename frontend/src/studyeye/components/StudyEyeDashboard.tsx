/**
 * StudyEyeDashboard Component
 * 
 * Main dashboard integrating all StudyEye components.
 * Manages session lifecycle and coordinates all UI elements.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.6
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Paper,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { StudyEyeProvider, useStudyEyeContext } from '../contexts';
import { VideoFeedDisplay } from './VideoFeedDisplay';
import { EngagementScoreCard } from './EngagementScoreCard';
import { TemporalTimeline } from './TemporalTimeline';
import { BehaviorIndicator } from './BehaviorIndicator';
import { EmotionIndicator } from './EmotionIndicator';
import { AudioActivityIndicator } from './AudioActivityIndicator';
import { VoiceEnrollment } from './VoiceEnrollment';
import { VoiceVerificationIndicator } from './VoiceVerificationIndicator';
import { PrivacyControls } from './PrivacyControls';
import { errorHandler } from '../services';
import { processingOrchestrator } from '../services/processingOrchestrator';

/**
 * Dashboard content component (uses context)
 */
const DashboardContent: React.FC = () => {
  const {
    state,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    setMode,
    setAnonymization,
    setBlurIntensity,
  } = useStudyEyeContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showVoiceEnrollment, setShowVoiceEnrollment] = useState(false);
  const [voiceVerificationEnabled, setVoiceVerificationEnabled] = useState(false);
  const [hasVoiceProfile, setHasVoiceProfile] = useState(false);

  // Check browser compatibility on mount
  useEffect(() => {
    const compatibility = errorHandler.checkBrowserCompatibility();
    if (!compatibility.compatible) {
      setAlertMessage(
        `Browser compatibility issues: ${compatibility.issues.join(', ')}`
      );
      setAlertOpen(true);
    }
  }, []);

  // Handle session start
  const handleStart = async () => {
    if (!videoRef.current) {
      setAlertMessage('Video element not ready');
      setAlertOpen(true);
      return;
    }

    setIsInitializing(true);

    try {
      // Request camera access
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      setCameraStream(videoStream);
      videoRef.current.srcObject = videoStream;
      await videoRef.current.play();

      // Request microphone access (optional)
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setAudioStream(micStream);
      } catch (error) {
        console.warn('Microphone access denied, continuing without audio:', error);
      }

      // Start session
      await startSession(videoRef.current, micStream || undefined);

      setAlertMessage('Session started successfully!');
      setAlertOpen(true);
    } catch (error) {
      const errorInfo = errorHandler.handleError(error);
      setAlertMessage(errorInfo.userMessage);
      setAlertOpen(true);
      console.error('Failed to start session:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle session stop
  const handleStop = () => {
    stopSession();

    // Stop media streams
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setAlertMessage('Session stopped');
    setAlertOpen(true);
  };

  // Handle pause/resume
  const handlePauseResume = () => {
    if (state.isProcessing) {
      pauseSession();
      setAlertMessage('Session paused');
    } else {
      resumeSession();
      setAlertMessage('Session resumed');
    }
    setAlertOpen(true);
  };

  // Calculate engagement trend
  const getEngagementTrend = (): 'up' | 'down' | 'flat' => {
    if (state.timelineData.length < 2) return 'flat';
    const recent = state.timelineData.slice(-5);
    const avg = recent.reduce((sum, d) => sum + d.engagementScore, 0) / recent.length;
    const current = state.engagementScore?.score || 0;
    if (current > avg + 5) return 'up';
    if (current < avg - 5) return 'down';
    return 'flat';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          StudyEye Monitoring System
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Real-time engagement and behavior tracking with privacy-first design
        </Typography>
      </Box>

      {/* Session Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {!state.isSessionActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={isInitializing ? <CircularProgress size={20} /> : <StartIcon />}
              onClick={handleStart}
              disabled={isInitializing}
              size="large"
            >
              {isInitializing ? 'Initializing...' : 'Start Session'}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStop}
                size="large"
              >
                Stop Session
              </Button>
              <Button
                variant="outlined"
                startIcon={<PauseIcon />}
                onClick={handlePauseResume}
                size="large"
              >
                {state.isProcessing ? 'Pause' : 'Resume'}
              </Button>
            </>
          )}

          {/* Session Info */}
          {state.isSessionActive && (
            <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                FPS: <strong>{state.fps}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Mode: <strong>{state.mode === 'classroom' ? 'Classroom' : 'Exam'}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Privacy Controls */}
      <Box sx={{ mb: 3 }}>
        <PrivacyControls
          mode={state.mode}
          anonymizationEnabled={state.anonymizationEnabled}
          blurIntensity={state.blurIntensity}
          cameraPermission={state.isCameraActive}
          microphonePermission={state.isMicrophoneActive}
          onModeChange={setMode}
          onAnonymizationChange={setAnonymization}
          onBlurIntensityChange={setBlurIntensity}
        />
      </Box>

      {/* Main Dashboard Grid */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Video Feed */}
        <Box sx={{ flex: '1 1 65%', minWidth: '300px' }}>
          <VideoFeedDisplay
            videoElement={videoRef.current}
            behaviorResult={state.behaviorResult}
            faceDetection={state.faceDetection}
            mode={state.mode}
            anonymizationEnabled={state.anonymizationEnabled}
            blurIntensity={state.blurIntensity}
            isLive={state.isSessionActive}
            emotionResult={state.emotionResult}
            gazeData={state.gazeResult}
          />

          {/* Hidden video element */}
          <video
            ref={videoRef}
            style={{ 
              display: 'none',
              filter: 'none',
              WebkitFilter: 'none',
            }}
            playsInline
            muted
            autoPlay
          />

          {/* Timeline */}
          {state.mode === 'classroom' && (
            <Box sx={{ mt: 3 }}>
              <TemporalTimeline data={state.timelineData} />
            </Box>
          )}
        </Box>

        {/* Right Column - Metrics */}
        <Box sx={{ flex: '1 1 30%', minWidth: '300px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Engagement Score */}
            {state.mode === 'classroom' && (
              <Box>
                <EngagementScoreCard
                  score={state.engagementScore?.score || 0}
                  trend={getEngagementTrend()}
                  lastUpdated={undefined}
                />
              </Box>
            )}

            {/* Behavior Indicator with Emotion */}
            {state.behaviorResult && (
              <Box>
                <BehaviorIndicator
                  behaviorClass={state.behaviorResult.behaviorClass}
                  confidence={state.behaviorResult.confidence}
                  lastUpdated={new Date(state.behaviorResult.timestamp)}
                  emotion={state.emotionResult?.primaryEmotion}
                  emotionConfidence={state.emotionResult?.confidence}
                />
              </Box>
            )}

            {/* Dedicated Emotion Indicator */}
            {state.emotionResult && (
              <Box>
                <EmotionIndicator
                  emotion={state.emotionResult.primaryEmotion}
                  confidence={state.emotionResult.confidence}
                  lastUpdated={new Date()}
                />
              </Box>
            )}

            {/* Audio Activity */}
            {state.isMicrophoneActive && state.audioActivity && (
              <Box>
                <AudioActivityIndicator
                  isActive={state.isMicrophoneActive}
                  audioLevel={state.audioActivity.audioLevel}
                  isSpeaking={state.audioActivity.isSpeaking}
                  lastUpdated={new Date()}
                />
              </Box>
            )}

            {/* Voice Verification */}
            {state.isMicrophoneActive && (
              <Box>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Voice Verification
                  </Typography>
                  
                  {!hasVoiceProfile ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => setShowVoiceEnrollment(true)}
                      fullWidth
                    >
                      Enable Voice Verification
                    </Button>
                  ) : (
                    <>
                      {state.audioActivity && (
                        <VoiceVerificationIndicator
                          audioData={state.audioActivity}
                          enabled={voiceVerificationEnabled}
                          hasProfile={hasVoiceProfile}
                        />
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          processingOrchestrator.clearTeacherVoiceProfile();
                          setHasVoiceProfile(false);
                          setVoiceVerificationEnabled(false);
                          setAlertMessage('Voice profile cleared');
                          setAlertOpen(true);
                        }}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Clear Voice Profile
                      </Button>
                    </>
                  )}
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Voice Enrollment Modal */}
      {showVoiceEnrollment && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <VoiceEnrollment
            onEnrollmentComplete={(profile) => {
              console.log('Teacher voice enrolled:', profile);
              setHasVoiceProfile(true);
              setVoiceVerificationEnabled(true);
              setShowVoiceEnrollment(false);
              setAlertMessage('Voice verification enabled successfully!');
              setAlertOpen(true);
            }}
            onCancel={() => {
              setShowVoiceEnrollment(false);
            }}
            enrollmentFunction={(duration) => processingOrchestrator.enrollTeacherVoice(duration)}
            getProgressFunction={() => processingOrchestrator.getEnrollmentProgress()}
          />
        </Box>
      )}

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {state.error}
        </Alert>
      )}

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertMessage.includes('error') || alertMessage.includes('failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

/**
 * Main StudyEyeDashboard component with provider
 */
export const StudyEyeDashboard: React.FC = () => {
  return (
    <StudyEyeProvider>
      <DashboardContent />
    </StudyEyeProvider>
  );
};

export default StudyEyeDashboard;
