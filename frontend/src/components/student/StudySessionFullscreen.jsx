import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Alert,
  Chip,
  IconButton,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material'
import {
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Visibility as EyeIcon,
  StraightenOutlined as PostureIcon,
  NotificationImportant as AlertIcon,
  Videocam as CameraIcon,
  VideocamOff as CameraOffIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material'
import cameraService from '../../services/cameraService'
import { useWebSocket } from '../../contexts/WebSocketContext'
import CameraOverlay from './CameraOverlay.jsx'

const StudySessionFullscreen = ({ isStudying, setIsStudying, setStudyData }) => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const { 
    isConnected, 
    eyeTrackingData, 
    attentionAlerts,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    clearAlerts 
  } = useWebSocket()
  
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)
  
  // Real-time tracking data from WebSocket
  const [eyeStrainLevel, setEyeStrainLevel] = useState(0)
  const [postureScore, setPostureScore] = useState(85)
  const [attentionLevel, setAttentionLevel] = useState(90)
  const [alerts, setAlerts] = useState([])
  const [sessionStats, setSessionStats] = useState({
    focusPeaks: 0,
    distractionEvents: 0,
    avgFocus: 0,
    studyStreak: 0
  })

  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null)
      console.log('🎥 Starting camera initialization...')
      
      cameraService.stopCamera()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (videoRef.current) {
        console.log('📹 Video element found, initializing camera...')
        await cameraService.initializeCamera(videoRef.current)
        setCameraEnabled(true)
        console.log('✅ Camera initialized successfully')
        
        const mockSessionId = Date.now().toString()
        setSessionId(mockSessionId)
        startTracking(mockSessionId, 'mock-token')
        console.log('👁️ Eye tracking started for session:', mockSessionId)
      } else {
        throw new Error('Video element not found')
      }
    } catch (error) {
      console.error('❌ Camera initialization error:', error)
      let errorMessage = error.message || 'Failed to initialize camera'
      
      if (error.name === 'NotReadableError' || errorMessage.includes('already in use')) {
        errorMessage = 'Camera is in use by another application. Please close other browser tabs or applications using the camera.'
      }
      
      setCameraError(errorMessage)
      setCameraEnabled(false)
    }
  }, [startTracking])

  const handleCameraRestart = async () => {
    setCameraError(null)
    setCameraEnabled(false)
    cameraService.stopCamera()
    await new Promise(resolve => setTimeout(resolve, 2000))
    initializeCamera()
  }

  // Initialize camera when study session starts
  useEffect(() => {
    if (isStudying && !cameraEnabled && !cameraError) {
      const timer = setTimeout(() => {
        initializeCamera()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isStudying, cameraEnabled, cameraError, initializeCamera])

  // Auto-start study session when component mounts
  useEffect(() => {
    if (!isStudying) {
      setIsStudying(true)
    }
  }, [isStudying, setIsStudying])

  // Session timer
  useEffect(() => {
    let interval = null
    if (isStudying && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(time => time + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isStudying, isPaused])

  // Update real-time data from WebSocket
  useEffect(() => {
    if (eyeTrackingData) {
      setEyeStrainLevel(prev => {
        const newLevel = eyeTrackingData.eye_strain_level || prev
        return Math.min(100, Math.max(0, newLevel))
      })
      
      setPostureScore(eyeTrackingData.posture_score || 85)
      setAttentionLevel(eyeTrackingData.attention_score * 100 || 90)
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        avgFocus: Math.round((prev.avgFocus + (eyeTrackingData.attention_score * 100)) / 2),
        focusPeaks: eyeTrackingData.attention_score > 0.8 ? prev.focusPeaks + 1 : prev.focusPeaks,
        distractionEvents: eyeTrackingData.attention_score < 0.5 ? prev.distractionEvents + 1 : prev.distractionEvents
      }))
    }
  }, [eyeTrackingData])

  // Handle attention alerts
  useEffect(() => {
    if (attentionAlerts.length > 0) {
      setAlerts(prev => [...attentionAlerts, ...prev.slice(0, 4)])
    }
  }, [attentionAlerts])

  const stopCamera = () => {
    if (cameraEnabled) {
      cameraService.stopCamera()
      setCameraEnabled(false)
      
      if (sessionId) {
        stopTracking(sessionId)
      }
    }
  }

  const handleStopSession = () => {
    stopCamera()
    setIsStudying(false)
    setStudyData(prev => ({
      ...prev,
      totalTime: prev.totalTime + sessionTime,
      attentionScore: Math.round((prev.attentionScore + attentionLevel) / 2)
    }))
    navigate('/')
  }

  const handlePauseResume = () => {
    if (isPaused) {
      if (sessionId) {
        resumeTracking(sessionId)
      }
      setIsPaused(false)
    } else {
      if (sessionId) {
        pauseTracking(sessionId)
      }
      setIsPaused(true)
    }
  }

  const handleClearAlerts = () => {
    setAlerts([])
    clearAlerts()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getHealthColor = (value) => {
    if (value >= 80) return '#4caf50'
    if (value >= 60) return '#ff9800'
    return '#f44336'
  }

  if (!isStudying) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        p: 4
      }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', backgroundColor: '#1e1e1e', maxWidth: 500 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
            No Active Study Session
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
            Start a new study session from the dashboard to begin monitoring
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            size="large"
            sx={{ px: 4, py: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Control Bar */}
      <Paper
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          p: 2,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Side - Session Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              onClick={() => setShowSidebar(!showSidebar)}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                Study Session Active
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 700,
                  color: '#2196f3',
                  textShadow: '0 0 20px rgba(33, 150, 243, 0.5)',
                }}
              >
                {formatTime(sessionTime)}
              </Typography>
            </Box>
          </Box>

          {/* Center - Camera Status */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            {cameraEnabled ? (
              <CameraIcon sx={{ color: '#4caf50' }} />
            ) : (
              <CameraOffIcon sx={{ color: '#f44336' }} />
            )}
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {cameraEnabled ? 'Camera Active' : 'Camera Disabled'}
            </Typography>
          </Box>

          {/* Right Side - Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Toggle Mute">
              <IconButton
                onClick={() => setIsMuted(!isMuted)}
                sx={{ color: 'white' }}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
              onClick={handlePauseResume}
              sx={{
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: '#ff9800',
                },
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<StopIcon />}
              onClick={handleStopSession}
              sx={{
                background: 'linear-gradient(45deg, #f44336, #e57373)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                },
              }}
            >
              Stop Session
            </Button>
            
            <Tooltip title="Toggle Fullscreen">
              <IconButton
                onClick={toggleFullscreen}
                sx={{ color: 'white' }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        pt: 10, // Account for fixed top bar
      }}>
        {/* Camera Section - Takes up most of the screen */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          position: 'relative'
        }}>
          {/* Camera Error Display */}
          {cameraError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                maxWidth: 600,
                background: 'rgba(244, 67, 54, 0.15)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(244, 67, 54, 0.4)',
              }}
              action={
                <Button 
                  size="small" 
                  onClick={handleCameraRestart}
                  startIcon={<RefreshIcon />}
                >
                  Fix Camera
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Camera Issue: {cameraError}
              </Typography>
            </Alert>
          )}

          {/* Enhanced Camera Container */}
          <Box 
            sx={{ 
              position: 'relative', 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.2), rgba(63, 81, 181, 0.2))',
              p: 3,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              maxWidth: '90vw',
              maxHeight: '80vh',
              width: '100%',
              aspectRatio: '16/9',
            }}
          >
            {/* Video Element - Now much larger */}
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                transform: 'scaleX(-1)', // Mirror effect for natural selfie view
                backgroundColor: '#1a1a1a',
                display: 'block',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                objectFit: 'cover',
              }}
              autoPlay
              muted={isMuted}
              playsInline
            />
            
            {/* Camera Overlay for Face Landmarks and Focus Display */}
            <CameraOverlay
              videoRef={videoRef}
              eyeTrackingData={eyeTrackingData}
              focusScore={attentionLevel}
              isConnected={isConnected}
            />
            
            {/* Live Indicator */}
            {isConnected && cameraEnabled && (
              <Chip
                label="🔴 LIVE"
                color="error"
                size="medium"
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'rgba(244, 67, 54, 0.95)',
                  backdropFilter: 'blur(15px)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 6px 25px rgba(244, 67, 54, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'livePulse 2s infinite',
                  '@keyframes livePulse': {
                    '0%': { 
                      transform: 'scale(1)',
                      boxShadow: '0 6px 25px rgba(244, 67, 54, 0.4)',
                    },
                    '50%': { 
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 30px rgba(244, 67, 54, 0.6)',
                    },
                    '100%': { 
                      transform: 'scale(1)',
                      boxShadow: '0 6px 25px rgba(244, 67, 54, 0.4)',
                    },
                  },
                }}
              />
            )}
            
            {/* Focus Score Display */}
            {cameraEnabled && isConnected && (
              <Box sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                p: 3,
                minWidth: '160px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}>
                  FOCUS SCORE
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: attentionLevel >= 80 ? '#4caf50' : attentionLevel >= 60 ? '#ff9800' : '#f44336',
                    fontWeight: 800,
                    textShadow: '0 0 15px currentColor',
                    fontSize: '2.5rem',
                  }}
                >
                  {Math.round(attentionLevel)}%
                </Typography>
                <Box sx={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  mt: 1,
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    width: `${attentionLevel}%`,
                    height: '100%',
                    backgroundColor: attentionLevel >= 80 ? '#4caf50' : attentionLevel >= 60 ? '#ff9800' : '#f44336',
                    borderRadius: '3px',
                    boxShadow: '0 0 10px currentColor',
                    transition: 'all 0.3s ease',
                  }} />
                </Box>
              </Box>
            )}
            
            {/* Connection Status */}
            {isConnected && cameraEnabled && (
              <Box sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'rgba(76, 175, 80, 0.9)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                px: 2,
                py: 1,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box sx={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  animation: 'connectedBlink 1.5s infinite',
                  '@keyframes connectedBlink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                  },
                }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
                  CONNECTED
                </Typography>
              </Box>
            )}
            
            {/* Camera Offline Overlay */}
            {!cameraEnabled && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
              }}>
                <CameraOffIcon sx={{ 
                  fontSize: 120, 
                  mb: 3, 
                  color: 'rgba(255, 255, 255, 0.6)',
                  filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.3))',
                }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  textAlign: 'center',
                  textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)',
                  mb: 2,
                }}>
                  {cameraError ? 'Camera Unavailable' : 'Initializing Camera...'}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  textAlign: 'center',
                  maxWidth: '500px',
                  lineHeight: 1.6,
                }}>
                  {cameraError ? 'Please check camera permissions and refresh the page' : 'Setting up your personalized eye tracking system'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Sidebar - Real-time Stats */}
        <Box sx={{ 
          width: 300,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          {/* Real-time Stats */}
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(76, 175, 80, 0.15))',
            border: '1px solid rgba(33, 150, 243, 0.3)',
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
              📊 Live Stats
            </Typography>
            
            {/* Eye Health */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EyeIcon sx={{ color: getHealthColor(100 - eyeStrainLevel), mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Eye Health
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: getHealthColor(100 - eyeStrainLevel),
                fontWeight: 700,
                mb: 1,
              }}>
                {Math.round(100 - eyeStrainLevel)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100 - eyeStrainLevel}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(100 - eyeStrainLevel)}, ${getHealthColor(100 - eyeStrainLevel)}80)`,
                    borderRadius: 4,
                  }
                }}
              />
            </Box>

            {/* Posture */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PostureIcon sx={{ color: getHealthColor(postureScore), mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Posture
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: getHealthColor(postureScore),
                fontWeight: 700,
                mb: 1,
              }}>
                {Math.round(postureScore)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={postureScore}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(postureScore)}, ${getHealthColor(postureScore)}80)`,
                    borderRadius: 4,
                  }
                }}
              />
            </Box>

            {/* Attention */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ color: getHealthColor(attentionLevel), mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Attention
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: getHealthColor(attentionLevel),
                fontWeight: 700,
                mb: 1,
              }}>
                {Math.round(attentionLevel)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={attentionLevel}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(attentionLevel)}, ${getHealthColor(attentionLevel)}80)`,
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Session Summary */}
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(63, 81, 181, 0.15))',
            border: '1px solid rgba(156, 39, 176, 0.3)',
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
              📈 Session Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Focus Peaks:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {sessionStats.focusPeaks}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Distractions:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {sessionStats.distractionEvents}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Avg Focus:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {sessionStats.avgFocus}%
              </Typography>
            </Box>
          </Paper>

          {/* Alerts */}
          {alerts.length > 0 && showAlerts && (
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 87, 34, 0.15))',
              border: '1px solid rgba(255, 152, 0, 0.3)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                  ⚠️ Alerts
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setShowAlerts(false)}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {alerts.slice(0, 3).map((alert, index) => (
                  <Alert 
                    key={index} 
                    severity="warning"
                    sx={{ 
                      mb: 1,
                      background: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                    }}
                  >
                    <Typography variant="caption">
                      {alert}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Fab
          color="primary"
          onClick={() => setShowSidebar(!showSidebar)}
          sx={{
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #2196f3)',
            },
          }}
        >
          <AnalyticsIcon />
        </Fab>
        
        <Fab
          color="secondary"
          onClick={handleClearAlerts}
          sx={{
            background: 'linear-gradient(45deg, #ff9800, #ffc107)',
            '&:hover': {
              background: 'linear-gradient(45deg, #f57c00, #ff9800)',
            },
          }}
        >
          <AlertIcon />
        </Fab>
      </Box>
    </Box>
  )
}

export default StudySessionFullscreen

