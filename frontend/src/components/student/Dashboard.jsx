import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  LinearProgress,
  Paper,
  Alert,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Assessment as AssessmentIcon,
  Psychology as FocusIcon,
  RemoveRedEye as EyeTrackingIcon,
  PersonOutline as PersonIcon,
  MoreVert as MoreIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import apiService from '../../services/apiService';

const Dashboard = ({ isStudying, setIsStudying }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

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
      navigate('/study-fullscreen')
    } catch (err) {
      console.error('Error starting session:', err)
      setIsStudying(true)
      navigate('/study-fullscreen')
    }
  }

  // Mock student data for teacher view
  const recentStudentActivity = [
    { id: 1, name: 'Alice Johnson', session: '2h 15m', focus: 92, attention: 88, status: 'excellent' },
    { id: 2, name: 'Bob Smith', session: '1h 45m', focus: 78, attention: 75, status: 'good' },
    { id: 3, name: 'Charlie Brown', session: '3h 0m', focus: 85, attention: 82, status: 'good' },
    { id: 4, name: 'Diana Prince', session: '1h 30m', focus: 65, attention: 70, status: 'needs-attention' },
    { id: 5, name: 'Ethan Hunt', session: '2h 40m', focus: 90, attention: 89, status: 'excellent' },
  ]

  const todayStats = [
    {
      title: 'Active Students',
      value: '24',
      subtitle: 'Currently studying',
      icon: <PersonIcon />,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Avg. Focus Score',
      value: '84%',
      subtitle: 'Class average',
      icon: <FocusIcon />,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Total Study Time',
      value: '48h',
      subtitle: 'Today\'s total',
      icon: <TimerIcon />,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Attention Alerts',
      value: '3',
      subtitle: 'Requires attention',
      icon: <WarningIcon />,
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      change: '-2',
      trend: 'down'
    }
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#10b981'
      case 'good': return '#3b82f6'
      case 'needs-attention': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0f172a',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Container 
        maxWidth={false}
        sx={{ 
          py: 4, 
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          width: '100%',
          maxWidth: 'none !important',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {error && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              '& .MuiAlert-icon': {
                color: '#fbbf24'
              }
            }} 
            icon={<WarningIcon />}
          >
            Unable to load dashboard data: {error}. Using offline mode.
          </Alert>
        )}

        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={8} lg={9}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ 
                  width: 72, 
                  height: 72, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '2.25rem',
                  boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.6)',
                  }
                }}>
                  👨‍🏫
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 900,
                    color: 'white',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    background: 'linear-gradient(135deg, white 0%, #a5b4fc 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
                  }}>
                    Teacher Dashboard
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 500,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    lineHeight: 1.4,
                  }}>
                    Monitor student focus, attention, and study performance in real-time
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} lg={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip 
                icon={<CalendarIcon sx={{ fontSize: 20 }} />}
                label={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 700,
                  px: 3,
                  py: 3,
                  fontSize: '0.95rem',
                  height: 'auto',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.25)',
                    border: '2px solid rgba(99, 102, 241, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }} justifyContent="center">
          {todayStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} xl={3} key={index}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${stat.color}15 0%, rgba(15, 23, 42, 0.9) 100%)`,
                  backdropFilter: 'blur(25px)',
                  border: `2px solid ${stat.color}25`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%',
                  minHeight: 200,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: stat.bgGradient,
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 25px 50px ${stat.color}30, 0 0 0 1px ${stat.color}40`,
                    border: `2px solid ${stat.color}50`,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .stat-value': {
                      transform: 'scale(1.05)',
                    }
                  },
                }}
              >
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      className="stat-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: stat.bgGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 12px 30px ${stat.color}40`,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          inset: -2,
                          borderRadius: 3,
                          background: stat.bgGradient,
                          opacity: 0.3,
                          filter: 'blur(8px)',
                          zIndex: -1,
                        }
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        sx: { color: 'white', fontSize: 28 } 
                      })}
                    </Box>
                    <Chip 
                      icon={stat.trend === 'up' ? <TrendingIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                      label={stat.change}
                      size="medium"
                      sx={{
                        height: 32,
                        bgcolor: stat.trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        border: `2px solid ${stat.trend === 'up' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        px: 2,
                        '& .MuiChip-icon': {
                          fontSize: 18,
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 700,
                      mb: 2,
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: 2,
                      display: 'block'
                    }}>
                      {stat.title}
                    </Typography>
                    <Typography 
                      className="stat-value"
                      variant="h2" 
                      sx={{ 
                        fontWeight: 900,
                        mb: 1,
                        color: 'white',
                        fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                        lineHeight: 1,
                        transition: 'all 0.3s ease',
                        textShadow: `0 0 20px ${stat.color}50`,
                        background: `linear-gradient(135deg, white 0%, ${stat.color} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3} justifyContent="center" sx={{ flex: 1 }}>
          {/* Recent Student Activity */}
          <Grid item xs={12} md={12} lg={8} xl={9}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4,
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                backdropFilter: 'blur(25px)',
                border: '2px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '2px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 15px 35px rgba(99, 102, 241, 0.6)',
                    }
                  }}>
                    <EyeTrackingIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: 'white', 
                      fontSize: '1.5rem',
                      mb: 0.5,
                      background: 'linear-gradient(135deg, white 0%, #a5b4fc 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Student Activity Monitor
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                      fontSize: '1rem'
                    }}>
                      Real-time focus and attention tracking
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  size="medium"
                  sx={{
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    color: '#a5b4fc',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#6366f1',
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                    }
                  }}
                >
                  View All
                </Button>
              </Box>

              <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}>Student</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}>Session</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}>Focus Score</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}>Attention</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}>Status</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(15, 23, 42, 0.95)', py: 2 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStudentActivity.map((student) => (
                      <TableRow 
                        key={student.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                          }
                        }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36,
                              bgcolor: 'rgba(99, 102, 241, 0.2)',
                              color: '#a5b4fc',
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          {student.session}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 80 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={student.focus}
                                sx={{
                                  height: 6,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 1,
                                    bgcolor: student.focus >= 80 ? '#10b981' : student.focus >= 60 ? '#f59e0b' : '#ef4444',
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, minWidth: 40 }}>
                              {student.focus}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {student.attention}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          <Chip 
                            label={student.status.replace('-', ' ')}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(student.status)}15`,
                              color: getStatusColor(student.status),
                              border: `1px solid ${getStatusColor(student.status)}30`,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              textTransform: 'capitalize',
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
                          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={12} lg={4} xl={3}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              height: 'fit-content',
              position: 'sticky',
              top: 20
            }}>
              {/* Class Performance */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                    boxShadow: '0 15px 30px rgba(16, 185, 129, 0.2)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 25px rgba(16, 185, 129, 0.6)',
                    }
                  }}>
                    <AssessmentIcon sx={{ color: 'white', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 800, 
                      color: 'white', 
                      fontSize: '1.25rem',
                      mb: 0.5,
                      background: 'linear-gradient(135deg, white 0%, #10b981 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Class Performance
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}>
                      Weekly overview
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      Avg. Study Time
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>
                      25h / 40h
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={62.5}
                    sx={{
                      height: 10,
                      borderRadius: 2,
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 1, color: '#10b981', fontWeight: 600, display: 'block' }}>
                    62.5% Complete • 3 days remaining
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<CheckIcon sx={{ fontSize: 16 }} />}
                    label="On Track" 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontWeight: 700,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  />
                  <Chip 
                    icon={<FireIcon sx={{ fontSize: 16 }} />}
                    label="5 Day Streak" 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      fontWeight: 700,
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  />
                </Box>
              </Paper>

              {/* Quick Actions */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 3,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3, fontSize: '1rem' }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={handleStartStudying}
                    disabled={isStudying || loading}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 12px 25px rgba(99, 102, 241, 0.4)',
                      },
                      '&:disabled': {
                        background: 'rgba(99, 102, 241, 0.3)',
                      }
                    }}
                  >
                    {loading ? 'Loading...' : isStudying ? 'Session Active' : 'Start Monitoring'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Paper>

              {/* Top Performers */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <TrophyIcon sx={{ color: '#fbbf24', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                    Top Performers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { name: 'Alice Johnson', score: 92, rank: 1 },
                    { name: 'Ethan Hunt', score: 90, rank: 2 },
                    { name: 'Charlie Brown', score: 85, rank: 3 },
                  ].map((student) => (
                    <Box 
                      key={student.rank}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: student.rank === 1 ? '#fbbf24' : student.rank === 2 ? '#94a3b8' : '#cd7f32',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.875rem'
                        }}
                      >
                        {student.rank}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {student.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 700 }}>
                        {student.score}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 

export default Dashboard;