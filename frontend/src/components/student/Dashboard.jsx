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
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      setLoading(false)
    }
  }, [navigate, isAuthenticated])

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

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
      value: '7 Days',
      subtitle: 'Current streak',
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
    },
    {
      title: 'Avg Session',
      value: '2.5h',
      subtitle: 'Duration',
      icon: <SpeedIcon />,
      color: '#e91e63',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
      change: '+0.5h',
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
          p: { xs: 3, md: 5 },
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
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    mb: 1.5,
                    textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  Welcome back, {user?.username || 'Student'}! 👋
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.95, 
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    fontSize: { xs: '1rem', md: '1.2rem' }
                  }}
                >
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
                  fontWeight: 700,
                  px: 4.5,
                  py: 2.2,
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
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
            <Grid item xs={12} sm={6} md={4} key={index}>
            <Grow in timeout={600 + index * 100}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${hexToRgba(stat.color, 0.15)}, ${hexToRgba(stat.color, 0.05)})`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${hexToRgba(stat.color, 0.3)}`,
                  borderRadius: '16px',
                  overflow: 'visible',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${hexToRgba(stat.color, 0.2)}`,
                    borderColor: `${hexToRgba(stat.color, 0.5)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        mr: 2,
                        color: stat.color,
                        fontSize: 32,
                        filter: `drop-shadow(0 0 8px ${stat.color}40)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { fontSize: 32, color: stat.color } })}
                    </Box>
                    <Typography 
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        background: stat.gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: stat.color,
                      textShadow: `0 0 20px ${stat.color}30`,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
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
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: 'none'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #8B5CF6, #7C3AED)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  📅 Recent Sessions
                </Typography>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentSessions.map((session, index) => (
                <Card 
                  key={index}
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          minWidth: 100,
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, #8B5CF6, #7C3AED)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {session.date}
                      </Typography>
                      <Box sx={{ flex: 1, mx: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Duration</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                            {session.duration}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Chip 
                          label={`${session.focus}%`} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                          }}
                        />
                        <Chip 
                          label={`${session.attention}%`} 
                          size="small" 
                          sx={{
                            background: 'rgba(33, 150, 243, 0.2)',
                            color: '#2196f3',
                            border: '1px solid rgba(33, 150, 243, 0.3)',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Goals Column - REDESIGNED for consistency */}
        <Grid item xs={12} md={6}>
          {/* Enhanced Goals Progress - Matches Recent Sessions styling */}
          <Fade in timeout={1000}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(247, 115, 22, 0.15), rgba(234, 88, 12, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(247, 115, 22, 0.3)',
              boxShadow: 'none',
              height: '100%', // Match height with Recent Sessions
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header - Consistent with Recent Sessions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #F97316, #EA580C)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🎯 Your Goals
                </Typography>
                <Button
                  endIcon={<ArrowIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    color: '#F97316',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(247, 115, 22, 0.08)'
                    }
                  }}
                  onClick={() => navigate('/student/reports')}
                >
                  View All
                </Button>
              </Box>

              {/* Goals Cards - Consistent spacing and styling */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {goals.map((goal, index) => {
                  const progress = (goal.current / goal.target) * 100
                  const gradients = [
                    'linear-gradient(45deg, #F97316, #EA580C)',
                    'linear-gradient(45deg, #8B5CF6, #7C3AED)',
                    'linear-gradient(45deg, #4caf50, #66bb6a)'
                  ]
                  const colors = ['#F97316', '#8B5CF6', '#4caf50']
                  
                  return (
                    <Card 
                      key={index}
                      sx={{ 
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease',
                        flex: 1, // Equal height distribution
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateX(8px)', // Match Recent Sessions hover
                          boxShadow: `0 8px 25px ${hexToRgba(colors[index], 0.25)}`,
                          borderColor: `${hexToRgba(colors[index], 0.4)}`,
                        },
                      }}
                    >
                      <CardContent sx={{ py: 3, px: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Title and Value Row - Consistent alignment */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: 2 
                        }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: '1rem',
                              color: 'text.primary'
                            }}
                          >
                            {goal.title}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700, 
                              color: colors[index], 
                              fontSize: '0.95rem',
                              whiteSpace: 'nowrap',
                              ml: 2
                            }}
                          >
                            {goal.current}/{goal.target} {goal.unit}
                          </Typography>
                        </Box>

                        {/* Progress Bar - Consistent height and styling */}
                        <Box sx={{ mb: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 10, // Consistent height
                              borderRadius: 5,
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                              '& .MuiLinearProgress-bar': {
                                background: gradients[index],
                                borderRadius: 5,
                                boxShadow: `0 0 12px ${hexToRgba(colors[index], 0.4)}`,
                              }
                            }}
                          />
                        </Box>

                        {/* Progress Percentage - Consistent typography */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.875rem',
                            color: 'text.secondary'
                          }}
                        >
                          {progress.toFixed(0)}% Complete
                        </Typography>
                      </CardContent>
                    </Card>
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
