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
  LinearProgress,
  Chip,
  Fade,
  Grow,
  Drawer,
  Fab,
  Badge
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
  CheckCircle as CheckIcon,
  AutoAwesome as SparkleIcon,
  Chat as ChatIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/apiService'
import ChatBot from '../common/ChatBot'

const Dashboard = ({ isStudying, setIsStudying }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

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
      p: 0,
      pt: 0
    }}>
      {/* Enhanced Welcome Header */}
      <Fade in timeout={800}>
        <Box sx={{ 
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-40%',
            left: '-8%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite reverse'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(30px, 30px) scale(1.1)' }
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <SparkleIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    Welcome back, {user?.username || 'Student'}! 👋
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  opacity: 0.95, 
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  Ready to boost your focus and productivity today?
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon sx={{ fontSize: 26 }} />}
                onClick={handleStartStudying}
                disabled={isStudying || loading}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 800,
                  px: 5,
                  py: 2.5,
                  borderRadius: '18px',
                  textTransform: 'none',
                  fontSize: '1.15rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.98)',
                    transform: 'translateY(-3px) scale(1.03)',
                    boxShadow: '0 14px 35px rgba(0, 0, 0, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(0.99)'
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
          </Box>
        </Box>
      </Fade>

      {/* Enhanced Stats Grid */}
      <Box sx={{ px: { xs: 2, md: 4 }, mb: 5 }}>
        <Grid container spacing={3} sx={{ maxWidth: '100%' }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in timeout={600 + index * 100}>
              <Card
                sx={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'visible',
                  transition: 'all 0.3s ease',
                  border: '1px solid #E5E7EB',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: stat.gradient,
                    borderRadius: '16px 16px 0 0'
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    borderColor: '#D1D5DB',
                    '& .stat-icon': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
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
                        boxShadow: `0 4px 12px ${stat.color}40`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                        bgcolor: 'transparent',
                        color: stat.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: 'none',
                        '& .MuiChip-icon': {
                          color: stat.color
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: '#6B7280', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5, 
                    display: 'block', 
                    mb: 1.5,
                    fontSize: '0.8rem'
                  }}>
                    {stat.title}
                  </Typography>
                  <Typography 
                    className="stat-value"
                    variant="h2" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 1,
                      color: stat.color,
                      transition: 'all 0.4s ease',
                      fontSize: '3rem',
                      lineHeight: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}>
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
        </Grid>
      </Box>

      {/* Main Content Grid - Recent Sessions and Goals */}
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} sx={{ maxWidth: '100%' }}>
        {/* Recent Sessions Column */}
        <Grid item xs={12} md={6}>

          {/* Enhanced Recent Sessions */}
          <Fade in timeout={1200}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: '20px', 
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TimerIcon sx={{ color: 'white', fontSize: 26 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem' }}>
                    Recent Sessions
                  </Typography>
                </Box>
                <Button
                  endIcon={<ArrowIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    color: '#8B5CF6',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.08)'
                    }
                  }}
                  onClick={() => navigate('/student/reports')}
                >
                  View All
                </Button>
              </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {recentSessions.map((session, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      background: '#F3F4F6',
                      borderColor: '#D1D5DB',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <TimerIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#111827', fontSize: '1.05rem' }}>
                      {session.date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.9rem' }}>
                      Duration: {session.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.8rem', display: 'block', mb: 0.5 }}>
                        Focus
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.25rem', lineHeight: 1 }}>
                        {session.focus}%
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.8rem', display: 'block', mb: 0.5 }}>
                        Attention
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#3B82F6', fontSize: '1.25rem', lineHeight: 1 }}>
                        {session.attention}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Goals Column */}
        <Grid item xs={12} md={6}>
          {/* Enhanced Goals Progress */}
          <Fade in timeout={1000}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: '20px', 
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrophyIcon sx={{ color: 'white', fontSize: 26 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem' }}>
                  Your Goals
                </Typography>
              </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {goals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100
                return (
                  <Box 
                    key={index}
                    sx={{
                      mb: 0
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.95rem' }}>
                        {goal.current}/{goal.target} {goal.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 10,
                        borderRadius: 10,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 10,
                          background: index === 0 ? 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)' : 
                                     index === 1 ? 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)' :
                                     'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600, mt: 1.5, display: 'block', fontSize: '0.85rem' }}>
                      {progress.toFixed(0)}% Complete
                    </Typography>
                  </Box>
                )
              })}
            </Box>
            </Paper>
          </Fade>
        </Grid>
        </Grid>
      </Box>

      {/* Floating Chat Button */}
      <Fade in timeout={1500}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)'
            },
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
        >
          <Badge
            badgeContent="AI"
            color="success"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 18,
                minWidth: 18,
                top: -4,
                right: -4
              }
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </Badge>
        </Fab>
      </Fade>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 420 },
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ChatBot onClose={() => setChatOpen(false)} />
        </Box>
      </Drawer>
    </Box>
  )
}

export default Dashboard
