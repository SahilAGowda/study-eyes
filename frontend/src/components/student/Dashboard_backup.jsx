import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  Visibility as EyeIcon,
  Timer as TimerIcon,
  Assessment as ChartIcon,
  ArrowForward as ArrowIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/apiService'

const Dashboard = ({ isStudying, setIsStudying }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login')
    } else {
      setLoading(false)
    }
  }, [navigate])

  const handleStartStudying = async () => {
    try {
      if (apiService.isAuthenticated()) {
        await apiService.startSession()
      }
      setIsStudying(true)
      navigate('/student/study')
    } catch (err) {
      console.error('Error starting session:', err)
      setIsStudying(true)
      navigate('/student/study')
    }
  }

  // Student stats
  const stats = [
    {
      title: 'Study Time',
      value: '12.5h',
      subtitle: 'This week',
      icon: <TimerIcon />,
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      change: '+2.5h',
      trend: 'up'
    },
    {
      title: 'Focus Score',
      value: '87%',
      subtitle: 'Average',
      icon: <BrainIcon />,
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Streak',
      value: '7',
      subtitle: 'Days',
      icon: <FireIcon />,
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      change: '+1',
      trend: 'up'
    },
    {
      title: 'Achievements',
      value: '24',
      subtitle: 'Earned',
      icon: <TrophyIcon />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      change: '+3',
      trend: 'up'
    }
  ]

  const recentSessions = [
    { date: 'Today', duration: '2h 15m', focus: 92, attention: 88 },
    { date: 'Yesterday', duration: '1h 45m', focus: 85, attention: 82 },
    { date: '2 days ago', duration: '3h 0m', focus: 78, attention: 75 }
  ]

  const goals = [
    { title: 'Weekly Study Goal', current: 12.5, target: 20, unit: 'hours' },
    { title: 'Focus Improvement', current: 87, target: 90, unit: '%' },
    { title: 'Session Streak', current: 7, target: 14, unit: 'days' }
  ]

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      p: { xs: 2, md: 4 }
    }}>
      {/* Welcome Header with Enhanced Design */}
      <Box sx={{ 
        mb: 5,
        p: 4,
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            mb: 1.5,
            background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            Welcome back, {user?.username || 'Student'}! 👋
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.95, 
            fontWeight: 400,
            letterSpacing: '0.5px'
          }}>
            Ready to boost your focus and productivity today?
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                overflow: 'visible',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: stat.gradient,
                  borderRadius: '20px 20px 0 0'
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: `0 24px 48px ${stat.color}40`,
                  border: `1px solid ${stat.color}50`,
                  '& .stat-icon': {
                    transform: 'scale(1.15) rotate(8deg)',
                    boxShadow: `0 8px 24px ${stat.color}60`
                  },
                  '& .stat-value': {
                    transform: 'scale(1.05)'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    className="stat-icon"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: stat.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 20px ${stat.color}50`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '18px',
                        background: stat.gradient,
                        opacity: 0.3,
                        filter: 'blur(8px)',
                        zIndex: -1
                      }
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: 'white', fontSize: 28 } })}
                  </Box>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                    label={stat.change}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      '& .MuiChip-icon': {
                        color: stat.color
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                  {stat.title}
                </Typography>
                <Typography 
                  className="stat-value"
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'text.primary', 
                    mb: 0.5,
                    background: stat.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={7}>
          {/* Start Session Card */}
          <Paper
            sx={{
              p: 5,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 24px 70px rgba(102, 126, 234, 0.5)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-30%',
                left: '-10%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite reverse'
              },
              '@keyframes float': {
                '0%, 100%': { transform: 'translate(0, 0)' },
                '50%': { transform: 'translate(20px, 20px)' }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <EyeIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Ready to Study?
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Start a new session with AI-powered focus tracking
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon sx={{ fontSize: 24 }} />}
                onClick={handleStartStudying}
                disabled={isStudying || loading}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)'
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(0.98)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    color: 'rgba(102, 126, 234, 0.5)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {loading ? 'Loading...' : isStudying ? 'Session Active' : 'Start Study Session'}
              </Button>
            </Box>
          </Paper>

          {/* Recent Sessions */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Recent Sessions
              </Typography>
              <Button
                endIcon={<ArrowIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                onClick={() => navigate('/student/reports')}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentSessions.map((session, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      borderColor: 'rgba(102, 126, 234, 0.4)',
                      transform: 'translateX(8px) scale(1.01)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        opacity: 0.3,
                        filter: 'blur(8px)',
                        zIndex: -1
                      }
                    }}
                  >
                    <TimerIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {session.date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Duration: {session.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Focus
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {session.focus}%
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Attention
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {session.attention}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={5}>
          {/* Goals Progress */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)'
              }}>
                <TrophyIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Your Goals
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {goals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100
                return (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {goal.current}/{goal.target} {goal.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 10,
                        borderRadius: 10,
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 10,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      {progress.toFixed(0)}% Complete
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<ChartIcon />}
                fullWidth
                onClick={() => navigate('/student/analytics')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    borderColor: '#2196f3',
                    bgcolor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                View Analytics
              </Button>
              <Button
                variant="outlined"
                startIcon={<EyeIcon />}
                fullWidth
                onClick={() => navigate('/student/engagement')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    borderColor: '#4caf50',
                    bgcolor: 'rgba(76, 175, 80, 0.04)'
                  }
                }}
              >
                My Engagement
              </Button>
            </Box>
          </Paper>

          {/* Today's Tip */}
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CheckIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Today's Tip
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
              Take a 5-minute break every 25 minutes to maintain optimal focus levels. Your brain needs rest to perform at its best!
            </Typography>
          </Paper>

          {/* Weekly Overview */}
          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              This Week
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TimerIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Sessions</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Completed</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>15</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrainIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Avg Focus</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>This week</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>87%</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SpeedIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Productivity</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Score</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>92%</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Upcoming Features */}
          <Paper sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <TrophyIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Achievements
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95, mb: 2 }}>
              Keep up the great work! You're on track to unlock new achievements.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="7 Day Streak" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }} />
              <Chip label="Focus Master" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }} />
              <Chip label="Early Bird" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
