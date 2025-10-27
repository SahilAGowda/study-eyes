import React, { useState } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Visibility as EyeIcon,
  HealthAndSafety as HealthIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'

const Analytics = ({ studyData }) => {
  const [selectedTab, setSelectedTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  // Mock data for analytics
  const weeklyData = [
    { day: 'Mon', studyTime: 4.5, eyeBreaks: 12, attentionScore: 85 },
    { day: 'Tue', studyTime: 3.2, eyeBreaks: 8, attentionScore: 78 },
    { day: 'Wed', studyTime: 5.1, eyeBreaks: 15, attentionScore: 92 },
    { day: 'Thu', studyTime: 2.8, eyeBreaks: 6, attentionScore: 72 },
    { day: 'Fri', studyTime: 4.0, eyeBreaks: 10, attentionScore: 88 },
    { day: 'Sat', studyTime: 6.2, eyeBreaks: 18, attentionScore: 95 },
    { day: 'Sun', studyTime: 3.5, eyeBreaks: 9, attentionScore: 82 }
  ]

  const totalWeeklyTime = weeklyData.reduce((sum, day) => sum + day.studyTime, 0)
  const avgAttentionScore = Math.round(weeklyData.reduce((sum, day) => sum + day.attentionScore, 0) / weeklyData.length)
  const totalEyeBreaks = weeklyData.reduce((sum, day) => sum + day.eyeBreaks, 0)

  const formatTime = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#4caf50'
    if (score >= 70) return '#ff9800'
    return '#f44336'
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          📊 Study Analytics
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          Track your study patterns and health metrics over time
        </Typography>
      </Box>      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(33, 150, 243, 0.2)',
              borderColor: 'rgba(33, 150, 243, 0.5)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimerIcon sx={{ 
                  mr: 2, 
                  color: '#2196f3',
                  fontSize: 32,
                  filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.4))',
                }} />
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
                  Weekly Total
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2196f3',
                  textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
                  mb: 1,
                }}
              >
                {formatTime(totalWeeklyTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                ⏱️ Study time this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(76, 175, 80, 0.2)',
              borderColor: 'rgba(76, 175, 80, 0.5)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingIcon sx={{ 
                  mr: 2, 
                  color: '#4caf50',
                  fontSize: 32,
                  filter: 'drop-shadow(0 0 8px rgba(76, 175, 80, 0.4))',
                }} />
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Avg Attention
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: getScoreColor(avgAttentionScore),
                  textShadow: `0 0 20px ${getScoreColor(avgAttentionScore)}40`,
                  mb: 1,
                }}
              >
                {avgAttentionScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                🎯 Focus level average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(255, 152, 0, 0.2)',
              borderColor: 'rgba(255, 152, 0, 0.5)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EyeIcon sx={{ 
                  mr: 2, 
                  color: '#ff9800',
                  fontSize: 32,
                  filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.4))',
                }} />
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Eye Breaks
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#ff9800',
                  textShadow: '0 0 20px rgba(255, 152, 0, 0.3)',
                  mb: 1,
                }}
              >
                {totalEyeBreaks}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                👁️ Breaks taken this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(156, 39, 176, 0.3)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(156, 39, 176, 0.2)',
              borderColor: 'rgba(156, 39, 176, 0.5)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HealthIcon sx={{ 
                  mr: 2, 
                  color: '#9c27b0',
                  fontSize: 32,
                  filter: 'drop-shadow(0 0 8px rgba(156, 39, 176, 0.4))',
                }} />
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
                  Health Score
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: getScoreColor(87),
                  textShadow: `0 0 20px ${getScoreColor(87)}40`,
                  mb: 1,
                }}
              >
                87%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                💚 Overall health rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>      {/* Detailed Analytics */}
      <Paper 
        elevation={3} 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15), rgba(103, 58, 183, 0.15))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(63, 81, 181, 0.3)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          background: 'rgba(63, 81, 181, 0.1)',
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(63, 81, 181, 0.1)',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, rgba(63, 81, 181, 0.2), rgba(103, 58, 183, 0.2))',
                  color: '#3f51b5',
                },
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label="📅 Daily Breakdown" />
            <Tab label="💚 Health Trends" />
            <Tab label="🎯 Goals & Progress" />
          </Tabs>
        </Box>        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ p: 4 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              📊 Weekly Study Breakdown
            </Typography>
            <Grid container spacing={2}>
              {weeklyData.map((day, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      borderColor: 'rgba(63, 81, 181, 0.4)',
                    },
                  }}>
                    <CardContent sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            minWidth: 60,
                            fontWeight: 700,
                            background: `linear-gradient(45deg, ${getScoreColor(day.attentionScore)}, ${getScoreColor(day.attentionScore)}80)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {day.day}
                        </Typography>
                        <Box sx={{ flex: 1, mx: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Study Time</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#3f51b5' }}>
                              {formatTime(day.studyTime)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(day.studyTime / 8) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
                                borderRadius: 4,
                                boxShadow: '0 0 10px rgba(63, 81, 181, 0.3)',
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Chip 
                            label={`${day.attentionScore}%`} 
                            size="small" 
                            sx={{ 
                              background: `linear-gradient(45deg, ${getScoreColor(day.attentionScore)}, ${getScoreColor(day.attentionScore)}80)`,
                              color: 'white',
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${getScoreColor(day.attentionScore)}40`,
                            }}
                          />
                          <Chip 
                            label={`${day.eyeBreaks} breaks`} 
                            size="small" 
                            sx={{
                              background: 'rgba(255, 152, 0, 0.2)',
                              color: '#ff9800',
                              border: '1px solid rgba(255, 152, 0, 0.3)',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 4 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              💚 Health & Wellness Trends
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(76, 175, 80, 0.2)',
                  },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      👁️ Eye Health Trend
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                      Average eye strain levels over the past week
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 600 }}>Excellent:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ 
                          flex: 1, 
                          mx: 2, 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            borderRadius: 5,
                            boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4caf50' }}>75%</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      🎉 Your eye health has improved by 12% this week!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(255, 152, 0, 0.2)',
                  },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      🏃 Posture Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                      Spinal alignment and sitting posture
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 600 }}>Good:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={82} 
                        sx={{ 
                          flex: 1, 
                          mx: 2, 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                            borderRadius: 5,
                            boxShadow: '0 0 15px rgba(255, 152, 0, 0.4)',
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ff9800' }}>82%</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      💡 Consider adjusting your chair height for better alignment
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 4 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              🎯 Study Goals & Progress
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(156, 39, 176, 0.2)',
                  },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      📊 Weekly Goal Progress
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>25h / 40h target</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#9c27b0' }}>62.5%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={62.5}
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                            borderRadius: 6,
                            boxShadow: '0 0 15px rgba(156, 39, 176, 0.4)',
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label="On Track" 
                        sx={{
                          background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        }}
                        size="small" 
                      />
                      <Chip 
                        label="3 days remaining" 
                        sx={{
                          background: 'rgba(33, 150, 243, 0.2)',
                          color: '#2196f3',
                          border: '1px solid rgba(33, 150, 243, 0.3)',
                          fontWeight: 600,
                        }}
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(76, 175, 80, 0.2)',
                  },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      🔥 Monthly Streak
                    </Typography>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#4caf50', 
                        mb: 1,
                        textShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
                        textAlign: 'center',
                      }}
                    >
                      18
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500, textAlign: 'center' }}>
                      Consecutive days of study
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label="🏆 Personal Best!" 
                        sx={{
                          background: 'linear-gradient(45deg, #ffc107, #ffb300)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                        }}
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Analytics
