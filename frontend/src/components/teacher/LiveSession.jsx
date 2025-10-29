import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  CircularProgress,
} from '@mui/material'
import {
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Visibility as EyeIcon,
  People as PeopleIcon,
  NotificationImportant as AlertIcon,
  Videocam as CameraIcon,
  VideocamOff as CameraOffIcon,
  Refresh as RefreshIcon,
  VideoCall as LiveIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import cameraService from '../../services/cameraService'
import CameraOverlay from '../student/CameraOverlay'

const LiveSession = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef = useRef(null)

  const [classInfo, setClassInfo] = useState({
    title: 'Live Class Session',
    students: 24,
  })
  
  const [isLive, setIsLive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeStudents, setActiveStudents] = useState(0)
  const [studentEngagement, setStudentEngagement] = useState(0)
  const [eyeTrackingData, setEyeTrackingData] = useState(null)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    initializeCamera()
    return () => {
      if (cameraService.isActiveCamera()) {
        cameraService.stopCamera()
      }
    }
  }, [])

  useEffect(() => {
    let interval
    if (isLive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLive, isPaused])

  const initializeCamera = async () => {
    try {
      if (videoRef.current) {
        await cameraService.initializeCamera(videoRef.current)
        setCameraEnabled(true)
        setCameraError(null)
      }
    } catch (error) {
      console.error('Camera initialization failed:', error)
      setCameraError(error.message)
      setCameraEnabled(false)
    }
  }

  const handleCameraRestart = async () => {
    setCameraError(null)
    await initializeCamera()
  }

  const handleStartLive = () => {
    setIsLive(true)
    setSessionTime(0)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleEndSession = () => {
    setIsLive(false)
    setIsPaused(false)
    setSessionTime(0)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getEngagementColor = (value) => {
    if (value >= 70) return '#4caf50'
    if (value >= 40) return '#ff9800'
    return '#f44336'
  }

  const getEngagementMessage = (value) => {
    if (value >= 70) return 'Excellent engagement! Students are focused.'
    if (value >= 40) return 'Moderate engagement. Consider interactive activities.'
    if (value > 0) return 'Low engagement. Try asking questions or changing pace.'
    return 'Waiting for class to start...'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Session Header - Glassmorphic Style */}
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
              {classInfo.title}
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
            
            {!isLive ? (
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartLive}
                disabled={!cameraEnabled}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Live Class
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
                  onClick={isPaused ? handleResume : handlePause}
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
                  onClick={handleEndSession}
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
                  End Class
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 2.5, 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Students
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {classInfo.students}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#e3f2fd', width: 56, height: 56 }}>
                <PeopleIcon sx={{ color: '#2196f3', fontSize: 28 }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 2.5, 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Active Now
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {activeStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / {classInfo.students}
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: '#e8f5e9', width: 56, height: 56 }}>
                <CheckIcon sx={{ color: '#4caf50', fontSize: 28 }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 2.5, 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Engagement
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: getEngagementColor(studentEngagement) }}>
                    {studentEngagement}%
                  </Typography>
                  {studentEngagement >= 70 ? (
                    <TrendingUpIcon sx={{ color: '#4caf50' }} />
                  ) : studentEngagement > 0 ? (
                    <TrendingDownIcon sx={{ color: '#ff9800' }} />
                  ) : null}
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: `${getEngagementColor(studentEngagement)}15`, width: 56, height: 56 }}>
                <EyeIcon sx={{ color: getEngagementColor(studentEngagement), fontSize: 28 }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Camera Feed - Glassmorphic Style */}
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
          Teacher Camera Feed
        </Typography>
        
        {/* Camera Status Alerts */}
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
                onClick={handleCameraRestart}
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
              width: '800px',
              height: '600px',
              borderRadius: '16px',
              transform: 'scaleX(-1)',
              backgroundColor: '#000000',
              display: 'block',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              objectFit: 'cover',
            }}
            autoPlay
            muted
            playsInline
          />
          
          {/* Camera Overlay */}
          {cameraEnabled && <CameraOverlay eyeTrackingData={eyeTrackingData} />}
          
          {/* Live Indicator */}
          {isLive && cameraEnabled && (
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
        </Box>
      </Paper>

      {/* Engagement & Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#757575' }}>
              Class Stats
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Students</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {activeStudents}/{classInfo.students}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Engagement</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: getEngagementColor(studentEngagement) }}>
                  {studentEngagement}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={studentEngagement} 
                  sx={{ 
                    mt: 1,
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getEngagementColor(studentEngagement),
                    }
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: `${getEngagementColor(studentEngagement)}08`, borderRadius: 2, border: `1px solid ${getEngagementColor(studentEngagement)}30` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#757575' }}>
              Engagement Insight
            </Typography>
            <Typography variant="body2" sx={{ color: '#1a1a1a', lineHeight: 1.6 }}>
              {getEngagementMessage(studentEngagement)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#757575' }}>
              System Status
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {cameraEnabled ? <CheckIcon sx={{ fontSize: 18, color: '#4caf50' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#f44336' }} />}
                <Typography variant="body2">Camera</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isConnected ? <CheckIcon sx={{ fontSize: 18, color: '#4caf50' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#f44336' }} />}
                <Typography variant="body2">Connection</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isLive ? <CheckIcon sx={{ fontSize: 18, color: '#f44336' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#757575' }} />}
                <Typography variant="body2">{isLive ? 'Live' : 'Offline'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default LiveSession
