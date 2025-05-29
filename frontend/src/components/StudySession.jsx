import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Paper,
  Alert,
  Chip,
  Divider,
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
  Refresh as RefreshIcon
} from '@mui/icons-material'
import cameraService from '../services/cameraService'
import { useWebSocket } from '../contexts/WebSocketContext'
import CameraOverlay from './CameraOverlay.jsx'

const StudySession = ({ isStudying, setIsStudying, setStudyData }) => {
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
  
  // Real-time tracking data from WebSocket
  const [eyeStrainLevel, setEyeStrainLevel] = useState(0)
  const [postureScore, setPostureScore] = useState(85)
  const [attentionLevel, setAttentionLevel] = useState(90)
  const [alerts, setAlerts] = useState([])
  
  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null)
      console.log('🎥 Starting camera initialization...')
      
      // First try to stop any existing camera streams
      cameraService.stopCamera()
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (videoRef.current) {
        console.log('📹 Video element found, initializing camera...')
        await cameraService.initializeCamera(videoRef.current)
        setCameraEnabled(true)
        console.log('✅ Camera initialized successfully')
        
        // Start eye tracking via WebSocket
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
      
      // Provide specific help for common errors
      if (error.name === 'NotReadableError' || errorMessage.includes('already in use')) {
        errorMessage = 'Camera is in use by another application. Please close other browser tabs or applications using the camera, then click "Fix Camera" below.'
      }
      
      setCameraError(errorMessage)
      setCameraEnabled(false)
    }
  }, [startTracking])

  // Handle camera restart with longer delay
  const handleCameraRestart = async () => {
    setCameraError(null)
    setCameraEnabled(false)
    
    // Stop all existing streams
    cameraService.stopCamera()
    
    // Wait longer for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Try again
    initializeCamera()
  }

  // Initialize camera when study session starts
  useEffect(() => {
    if (isStudying && !cameraEnabled && !cameraError) {
      // Delay to ensure component is fully mounted
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
    }
  }, [eyeTrackingData])

  // Handle attention alerts
  useEffect(() => {
    if (attentionAlerts.length > 0) {
      setAlerts(prev => [...attentionAlerts, ...prev.slice(0, 2)])
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#1e1e1e' }}>
          <Typography variant="h5" gutterBottom>
            No Active Study Session
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start a new study session from the dashboard to begin monitoring
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Camera Error Display */}
      {cameraError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                onClick={handleCameraRestart}
                startIcon={<RefreshIcon />}
              >
                Fix Camera
              </Button>
              <Button 
                size="small" 
                onClick={() => window.open('https://www.webcamtests.com/', '_blank')}
              >
                Test Camera
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Camera Issue: {cameraError}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            💡 Quick fix: Close all other browser tabs, wait 10 seconds, then click "Fix Camera"
          </Typography>
        </Alert>
      )}      {/* Session Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(76, 175, 80, 0.15))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2196f3, #4caf50)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196f3, #4caf50)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Study Session Active
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontFamily: 'monospace', 
                fontWeight: 700,
                color: '#2196f3',
                textShadow: '0 0 20px rgba(33, 150, 243, 0.5)',
                letterSpacing: '0.1em',
              }}
            >
              {formatTime(sessionTime)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Camera Status */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {cameraEnabled ? (
                <CameraIcon sx={{ color: '#4caf50' }} />
              ) : (
                <CameraOffIcon sx={{ color: '#f44336' }} />
              )}
              <Typography variant="body2" color="text.secondary">
                {cameraEnabled ? 'Camera Active' : 'Camera Disabled'}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
              onClick={handlePauseResume}
              size="large"
              sx={{
                borderColor: '#ff9800',
                color: '#ff9800',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: '#ff9800',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                },
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="contained"
              startIcon={<StopIcon />}
              onClick={handleStopSession}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #f44336, #e57373)',
                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Stop Session
            </Button>
          </Box>
        </Box>
      </Paper>      {/* Enhanced Eye Tracking Camera */}
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(63, 81, 181, 0.15))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #9c27b0, #3f51b5)',
          },
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 25px 50px rgba(156, 39, 176, 0.25)',
            borderColor: 'rgba(156, 39, 176, 0.5)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #9c27b0, #3f51b5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <CameraIcon sx={{ fontSize: '2rem', color: '#9c27b0' }} />
          Eye Tracking Preview
        </Typography>
        
        {/* Camera Status Alerts */}
        {!cameraEnabled && !cameraError && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              background: 'rgba(33, 150, 243, 0.15)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(33, 150, 243, 0.4)',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            icon={<CameraIcon sx={{ color: '#2196f3' }} />}
          >
            🎥 Initializing camera... Please allow camera access when prompted
          </Alert>
        )}
        
        {cameraError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              background: 'rgba(244, 67, 54, 0.15)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(244, 67, 54, 0.4)',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            icon={<CameraOffIcon sx={{ color: '#f44336' }} />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            Camera access failed. Please check permissions and try again.
          </Alert>
        )}
        
        {/* Enhanced Camera Container */}
        <Box 
          sx={{ 
            position: 'relative', 
            display: 'inline-block',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.2), rgba(63, 81, 181, 0.2))',
            p: 3,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.5)',
              transform: 'scale(1.02)',
            },
          }}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            style={{
              width: '480px',
              height: '360px',
              borderRadius: '16px',
              transform: 'scaleX(-1)', // Mirror effect for natural selfie view
              backgroundColor: '#1a1a1a',
              display: 'block',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              objectFit: 'cover',
            }}
            autoPlay
            muted
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
              p: 2.5,
              minWidth: '140px',
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
                variant="h5" 
                sx={{ 
                  color: attentionLevel >= 80 ? '#4caf50' : attentionLevel >= 60 ? '#ff9800' : '#f44336',
                  fontWeight: 800,
                  textShadow: '0 0 15px currentColor',
                  fontSize: '1.8rem',
                }}
              >
                {Math.round(attentionLevel)}%
              </Typography>
              <Box sx={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                mt: 1,
                overflow: 'hidden',
              }}>
                <Box sx={{
                  width: `${attentionLevel}%`,
                  height: '100%',
                  backgroundColor: attentionLevel >= 80 ? '#4caf50' : attentionLevel >= 60 ? '#ff9800' : '#f44336',
                  borderRadius: '2px',
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
                fontSize: 80, 
                mb: 3, 
                color: 'rgba(255, 255, 255, 0.6)',
                filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.3))',
              }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: 'white',
                textAlign: 'center',
                textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)',
                mb: 1,
              }}>
                {cameraError ? 'Camera Unavailable' : 'Initializing Camera...'}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                textAlign: 'center',
                maxWidth: '350px',
                lineHeight: 1.6,
              }}>
                {cameraError ? 'Please check camera permissions and refresh the page' : 'Setting up your personalized eye tracking system'}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Camera Controls */}
        {cameraEnabled && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: '16px',
                fontWeight: 600,
                border: '2px solid rgba(156, 39, 176, 0.5)',
                color: '#9c27b0',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'rgba(156, 39, 176, 0.1)',
                  borderColor: '#9c27b0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Refresh Camera
            </Button>
          </Box>
        )}
      </Paper>

      {/* Real-time Monitoring */}
      <Grid container spacing={3} sx={{ mb: 4 }}>        {/* Eye Health */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(76, 175, 80, 0.2)',
              borderColor: 'rgba(76, 175, 80, 0.5)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EyeIcon sx={{ 
                  mr: 2, 
                  color: getHealthColor(100 - eyeStrainLevel),
                  fontSize: '2rem',
                  filter: `drop-shadow(0 0 10px ${getHealthColor(100 - eyeStrainLevel)}50)`,
                }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Eye Health</Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                mb: 2, 
                color: getHealthColor(100 - eyeStrainLevel),
                fontWeight: 700,
                textShadow: `0 0 20px ${getHealthColor(100 - eyeStrainLevel)}50`,
              }}>
                {Math.round(100 - eyeStrainLevel)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100 - eyeStrainLevel}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(100 - eyeStrainLevel)}, ${getHealthColor(100 - eyeStrainLevel)}80)`,
                    borderRadius: 5,
                    boxShadow: `0 0 15px ${getHealthColor(100 - eyeStrainLevel)}40`,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                Eye strain level: {Math.round(eyeStrainLevel)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>        {/* Posture */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(255, 152, 0, 0.2)',
              borderColor: 'rgba(255, 152, 0, 0.5)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PostureIcon sx={{ 
                  mr: 2, 
                  color: getHealthColor(postureScore),
                  fontSize: 32,
                  filter: `drop-shadow(0 0 8px ${getHealthColor(postureScore)}40)`,
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${getHealthColor(postureScore)}, ${getHealthColor(postureScore)}80)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Posture
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  color: getHealthColor(postureScore),
                  fontWeight: 700,
                  textShadow: `0 0 20px ${getHealthColor(postureScore)}40`,
                }}
              >
                {Math.round(postureScore)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={postureScore}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(postureScore)}, ${getHealthColor(postureScore)}80)`,
                    borderRadius: 5,
                    boxShadow: `0 0 15px ${getHealthColor(postureScore)}40`,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                🏃 Spine alignment detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>        {/* Attention */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15), rgba(63, 81, 181, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(63, 81, 181, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(63, 81, 181, 0.2)',
              borderColor: 'rgba(63, 81, 181, 0.5)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimerIcon sx={{ 
                  mr: 2, 
                  color: getHealthColor(attentionLevel),
                  fontSize: 32,
                  filter: `drop-shadow(0 0 8px ${getHealthColor(attentionLevel)}40)`,
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${getHealthColor(attentionLevel)}, ${getHealthColor(attentionLevel)}80)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Attention
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  color: getHealthColor(attentionLevel),
                  fontWeight: 700,
                  textShadow: `0 0 20px ${getHealthColor(attentionLevel)}40`,
                }}
              >
                {Math.round(attentionLevel)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={attentionLevel}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getHealthColor(attentionLevel)}, ${getHealthColor(attentionLevel)}80)`,
                    borderRadius: 5,
                    boxShadow: `0 0 15px ${getHealthColor(attentionLevel)}40`,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                🎯 Focus level tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>      {/* Alerts and Recommendations */}
      {alerts.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 87, 34, 0.15))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ffc107, #ff5722)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertIcon sx={{ 
                mr: 2, 
                color: '#ff9800',
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.4))',
              }} />
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ⚠️ Health Alerts
              </Typography>
            </Box>
            <Button 
              size="small" 
              onClick={handleClearAlerts}
              sx={{
                background: 'linear-gradient(45deg, rgba(255, 152, 0, 0.2), rgba(255, 193, 7, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '12px',
                color: '#ff9800',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255, 152, 0, 0.3), rgba(255, 193, 7, 0.3))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                },
              }}
            >
              Clear All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert, index) => (
              <Alert 
                key={index} 
                severity={index === 0 ? "warning" : "info"}
                sx={{ 
                  background: 'rgba(255, 152, 0, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
                  borderRadius: '12px',
                  '& .MuiAlert-icon': {
                    filter: 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.3))',
                  },
                }}
              >
                {alert}
              </Alert>
            ))}
          </Box>
        </Paper>
      )}      {/* Session Stats */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.15), rgba(33, 150, 243, 0.15))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(103, 58, 183, 0.3)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #673ab7, #2196f3)',
          },
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #673ab7, #2196f3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          📊 Session Statistics
        </Typography>
        <Divider sx={{ mb: 3, background: 'rgba(103, 58, 183, 0.2)' }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.05))',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(33, 150, 243, 0.2)',
                },
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2196f3',
                  textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
                  mb: 1,
                }}
              >
                {Math.floor(sessionTime / 60)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                ⏱️ Minutes Studied
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.05))',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(76, 175, 80, 0.2)',
                },
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#4caf50',
                  textShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
                  mb: 1,
                }}
              >
                {Math.floor(sessionTime / 1200)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                👁️ Eye Breaks Taken
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.05))',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(255, 152, 0, 0.2)',
                },
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#ff9800',
                  textShadow: '0 0 20px rgba(255, 152, 0, 0.3)',
                  mb: 1,
                }}
              >
                {Math.round(attentionLevel)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                🎯 Avg Attention
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.05))',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(156, 39, 176, 0.2)',
                },
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#9c27b0',
                  textShadow: '0 0 20px rgba(156, 39, 176, 0.3)',
                  mb: 1,
                }}
              >
                {Math.round((postureScore + (100 - eyeStrainLevel) + attentionLevel) / 3)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                💚 Health Score
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default StudySession
