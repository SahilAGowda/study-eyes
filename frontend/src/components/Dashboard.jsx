import React, { useState, useEffect, useCallback } from 'react'
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
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Visibility as EyeIcon,
  TrendingUp as TrendingIcon,
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import apiService from '../services/apiService'

const Dashboard = ({ studyData, isStudying, setIsStudying }) => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For development: Use dev endpoint if not authenticated
      if (!apiService.isAuthenticated()) {
        console.log('Not authenticated, using development endpoint')
        try {
          // Call the dev endpoint directly
          const response = await fetch('http://localhost:5000/api/analytics/dashboard/dev')
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setDashboardData(data)
          return
        } catch (devError) {
          console.error('Dev endpoint failed:', devError)
          // Fall back to navigate to login
          navigate('/login')
          return
        }
      }
      
      const data = await apiService.getDashboardData('week')
      setDashboardData(data)
    } catch (err) {
      setError(err.message)
      console.error('Error loading dashboard data:', err)
      
      // If it's an authentication error, don't redirect automatically
      // as the interceptor will handle it
      if (err.status !== 401) {
        // For non-auth errors, we can show mock data
        setDashboardData({
          today: {
            date: new Date().toISOString().split('T')[0],
            total_sessions: 0,
            total_study_time: 0,
            average_focus_percentage: 0,
            average_attention_score: 0,
            productivity_score: 0,
          },
          weekly: {
            total_study_time: 0,
            total_sessions: 0,
            average_focus_percentage: 0,
            productivity_score: 0,
          },
          recent_sessions: []
        })
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    // Check if user is authenticated before loading data
    if (apiService.isAuthenticated()) {
      loadDashboardData()
    } else {
      // If not authenticated, redirect to login
      navigate('/login')
    }
  }, [navigate, loadDashboardData])

  const handleStartStudying = async () => {
    try {
      if (apiService.isAuthenticated()) {
        await apiService.startSession()
      }
      setIsStudying(true)
      navigate('/study')
    } catch (err) {
      console.error('Error starting session:', err)
      // Continue with local mode
      setIsStudying(true)
      navigate('/study')
    }
  }
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Use real data if available, fallback to local data
  const todayStats = dashboardData ? [
    {
      title: 'Study Time',
      value: formatTime(dashboardData.today.total_study_time || 0),
      icon: <TimerIcon />,
      color: '#2196f3'
    },
    {
      title: 'Sessions',
      value: dashboardData.today.total_sessions || 0,
      icon: <EyeIcon />,
      color: '#4caf50'
    },
    {
      title: 'Focus Score',
      value: `${Math.round(dashboardData.today.average_focus_percentage || 0)}%`,
      icon: <TrendingIcon />,
      color: '#ff9800'
    },
    {
      title: 'Productivity',
      value: `${Math.round(dashboardData.today.productivity_score || 0)}%`,
      icon: <HealthIcon />,
      color: '#9c27b0'
    }
  ] : [
    {
      title: 'Study Time',
      value: formatTime(studyData.totalTime),
      icon: <TimerIcon />,
      color: '#2196f3'
    },
    {
      title: 'Eye Breaks',
      value: studyData.eyeBreaks,
      icon: <EyeIcon />,
      color: '#4caf50'
    },
    {
      title: 'Attention Score',
      value: `${studyData.attentionScore}%`,
      icon: <TrendingIcon />,
      color: '#ff9800'
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: <HealthIcon />,
      color: '#9c27b0'
    }
  ]
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          Unable to load dashboard data: {error}. Using offline mode.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, Student!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track your study sessions with AI-powered eye and posture monitoring
        </Typography>
      </Box>      {/* Quick Start Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(156, 39, 176, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #2196f3, #21cbf3, #9c27b0)',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Ready to start studying?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            AI monitoring will track your eye movements, posture, and attention levels
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={handleStartStudying}
            disabled={isStudying || loading}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: '15px',
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976d2, #1cb5e0)',
                boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-3px)',
              },
              '&:disabled': {
                background: 'rgba(33, 150, 243, 0.3)',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Loading...
              </>
            ) : isStudying ? (
              'Study Session Active'
            ) : (
              'Start Study Session'
            )}
          </Button>
        </Box>
      </Paper>      {/* Today's Statistics */}
      <Typography variant="h4" gutterBottom sx={{ 
        mb: 4, 
        fontWeight: 700,
        background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Today's Progress
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {todayStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${stat.color}30`,
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 40px ${stat.color}20`,
                  borderColor: `${stat.color}50`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      background: `linear-gradient(45deg, ${stat.color}, ${stat.color}80)`,
                      borderRadius: '12px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 15px ${stat.color}30`,
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: 'white', fontSize: '1.5rem' } })}
                  </Box>
                  <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                  }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ 
                  fontWeight: 700,
                  color: stat.color,
                  textShadow: `0 0 20px ${stat.color}50`,
                }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>      {/* Weekly Progress */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #4caf50, #2196f3)',
          },
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600,
          color: '#4caf50',
          mb: 3,
        }}>
          Weekly Study Goal
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              25 hours / 40 hours
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
              62.5%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={62.5}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="On Track" 
            sx={{
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
            }}
          />
          <Chip 
            label="3 days left" 
            sx={{
              background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
            }}
          />
        </Box>
      </Paper>      {/* Recent Activity */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(33, 150, 243, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(156, 39, 176, 0.2)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #9c27b0, #2196f3)',
          },
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600,
          color: '#9c27b0',
          mb: 3,
        }}>
          Recent Study Sessions
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ 
            fontSize: '1.1rem',
            textAlign: 'center',
            py: 3,
          }}>
            No recent sessions. Start your first study session to see activity here!
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Dashboard
