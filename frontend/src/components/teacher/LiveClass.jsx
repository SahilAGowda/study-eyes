import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Fade
} from '@mui/material'
import { 
  VideoCall as LiveClassIcon,
  PlayArrow as PlayIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material'

const LiveClass = () => {
  const navigate = useNavigate()
  
  // Mock data for live classes
  const upcomingClasses = [
    { 
      title: 'Mathematics - Algebra', 
      time: 'Today, 10:00 AM', 
      duration: '1h 30m', 
      students: 24,
      status: 'upcoming'
    },
    { 
      title: 'Physics - Mechanics', 
      time: 'Today, 2:00 PM', 
      duration: '2h 0m', 
      students: 18,
      status: 'upcoming'
    },
    { 
      title: 'Chemistry - Organic', 
      time: 'Tomorrow, 9:00 AM', 
      duration: '1h 45m', 
      students: 21,
      status: 'scheduled'
    }
  ]

  const recentClasses = [
    { 
      title: 'Biology - Cell Structure', 
      date: 'Yesterday', 
      duration: '1h 45m', 
      students: 22,
      avgAttention: 88,
      completion: 95
    },
    { 
      title: 'English - Literature', 
      date: '2 days ago', 
      duration: '2h 0m', 
      students: 19,
      avgAttention: 82,
      completion: 91
    },
    { 
      title: 'History - World War II', 
      date: '3 days ago', 
      duration: '1h 30m', 
      students: 25,
      avgAttention: 85,
      completion: 93
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196f3, #9c27b0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            📹 Live Classes
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ 
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            Conduct live classes with real-time student monitoring
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Upcoming Classes */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              boxShadow: 'none'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  📅 Upcoming Classes
                </Typography>
                <Button
                  endIcon={<ArrowIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    color: '#2196f3',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(33, 150, 243, 0.08)'
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {upcomingClasses.map((classItem, index) => (
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
                        borderColor: 'rgba(33, 150, 243, 0.4)',
                      },
                    }}
                  >
                    <CardContent sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              mb: 1
                            }}
                          >
                            {classItem.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon sx={{ fontSize: 16 }} />
                              {classItem.time}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196f3' }}>
                              {classItem.duration}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Chip 
                            icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                            label={`${classItem.students} students`} 
                            size="small" 
                            sx={{ 
                              background: 'rgba(33, 150, 243, 0.2)',
                              color: '#2196f3',
                              border: '1px solid rgba(33, 150, 243, 0.3)',
                              fontWeight: 600,
                            }}
                          />
                          {classItem.status === 'upcoming' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PlayIcon />}
                              onClick={() => navigate('/teacher/live-session', { 
                                state: { classInfo: classItem } 
                              })}
                              sx={{
                                background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                                }
                              }}
                            >
                              Start
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Recent Classes */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1200}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(156, 39, 176, 0.3)',
              boxShadow: 'none'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  📚 Recent Classes
                </Typography>
                <Button
                  endIcon={<ArrowIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    color: '#9c27b0',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.08)'
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentClasses.map((classItem, index) => (
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
                        borderColor: 'rgba(156, 39, 176, 0.4)',
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
                            background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {classItem.date}
                        </Typography>
                        <Box sx={{ flex: 1, mx: 4 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {classItem.title}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Duration</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                              {classItem.duration}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Chip 
                            label={`${classItem.avgAttention}%`} 
                            size="small" 
                            sx={{ 
                              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                              color: 'white',
                              fontWeight: 600,
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                            }}
                          />
                          <Chip 
                            label={`${classItem.students} students`} 
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
      </Grid>
    </Container>
  )
}

export default LiveClass

