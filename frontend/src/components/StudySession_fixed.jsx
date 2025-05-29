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
      )}

      {/* Session Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#1e1e1e' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Study Session Active
            </Typography>
            <Typography variant="h2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {formatTime(sessionTime)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Camera Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStopSession}
              size="large"
            >
              Stop Session
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Camera Preview */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, backgroundColor: '#1e1e1e' }}>
        <Typography variant="h6" gutterBottom>
          Eye Tracking Preview
        </Typography>
        {!cameraEnabled && !cameraError && (
          <Alert severity="info" sx={{ mb: 2 }}>
            🎥 Initializing camera... Please wait
          </Alert>
        )}
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <video
            ref={videoRef}
            style={{
              width: '320px',
              height: '240px',
              borderRadius: '8px',
              transform: 'scaleX(-1)', // Mirror effect
              backgroundColor: '#000',
              display: 'block',
            }}
            autoPlay
            muted
            playsInline
          />
          {isConnected && cameraEnabled && (
            <Chip
              label="🟢 Connected"
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
            />
          )}
          {!cameraEnabled && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white'
            }}>
              <CameraOffIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">
                {cameraError ? 'Camera Error' : 'Initializing...'}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Real-time Monitoring */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Eye Health */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e1e1e' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EyeIcon sx={{ mr: 2, color: getHealthColor(100 - eyeStrainLevel) }} />
                <Typography variant="h6">Eye Health</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 2, color: getHealthColor(100 - eyeStrainLevel) }}>
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
                    backgroundColor: getHealthColor(100 - eyeStrainLevel),
                    borderRadius: 4,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Eye strain level: {Math.round(eyeStrainLevel)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Posture */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e1e1e' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PostureIcon sx={{ mr: 2, color: getHealthColor(postureScore) }} />
                <Typography variant="h6">Posture</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 2, color: getHealthColor(postureScore) }}>
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
                    backgroundColor: getHealthColor(postureScore),
                    borderRadius: 4,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Spine alignment detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attention */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e1e1e' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimerIcon sx={{ mr: 2, color: getHealthColor(attentionLevel) }} />
                <Typography variant="h6">Attention</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 2, color: getHealthColor(attentionLevel) }}>
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
                    backgroundColor: getHealthColor(attentionLevel),
                    borderRadius: 4,
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Focus level tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Recommendations */}
      {alerts.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#1e1e1e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertIcon sx={{ mr: 2, color: '#ff9800' }} />
              <Typography variant="h6">Health Alerts</Typography>
            </Box>
            <Button size="small" onClick={handleClearAlerts}>
              Clear All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {alerts.map((alert, index) => (
              <Alert 
                key={index} 
                severity={index === 0 ? "warning" : "info"}
                sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}
              >
                {alert}
              </Alert>
            ))}
          </Box>
        </Paper>
      )}

      {/* Session Stats */}
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e1e' }}>
        <Typography variant="h6" gutterBottom>
          Session Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {Math.floor(sessionTime / 60)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minutes Studied
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {Math.floor(sessionTime / 1200)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eye Breaks Taken
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {Math.round(attentionLevel)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Attention
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {Math.round((postureScore + (100 - eyeStrainLevel) + attentionLevel) / 3)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Health Score
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default StudySession
