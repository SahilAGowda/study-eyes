import React, { useState, useEffect } from 'react'
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
  Stack,
  Avatar,
} from '@mui/material'
import {
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Visibility as EyeIcon,
  People as PeopleIcon,
  Videocam as CameraIcon,
  VideocamOff as CameraOffIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'

// This component has been cleaned and is reserved for the new StudyEye implementation.
// Camera and monitoring services have been removed.

const LiveSession = () => {
  const navigate = useNavigate()

  const [classInfo, setClassInfo] = useState({
    title: 'Live Class Session',
    students: 24,
  })
  
  const [isLive, setIsLive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [studentEngagement, setStudentEngagement] = useState(0)

  useEffect(() => {
    let interval
    if (isLive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLive, isPaused])

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
      {/* Session Header */}
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
            {!isLive ? (
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartLive}
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

      {/* Placeholder for Camera Feed - Reserved for new StudyEye implementation */}
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
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box>
          <CameraOffIcon sx={{ fontSize: 80, color: '#9c27b0', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 600 }}>
            Camera Feed Reserved
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            This area is reserved for the new StudyEye monitoring system
          </Typography>
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
                <ErrorIcon sx={{ fontSize: 18, color: '#757575' }} />
                <Typography variant="body2">Camera (Awaiting StudyEye)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon sx={{ fontSize: 18, color: '#757575' }} />
                <Typography variant="body2">Connection (Awaiting StudyEye)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isLive ? <CheckIcon sx={{ fontSize: 18, color: '#4caf50' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#757575' }} />}
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
