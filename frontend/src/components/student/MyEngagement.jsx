import React, { useState } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Tooltip,
} from '@mui/material'
import {
  Psychology as EngagementIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalFireDepartment as FireIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  Lightbulb as InsightIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Mood as MoodIcon,
  Visibility as FocusIcon,
  Psychology as CognitiveIcon,
  PanTool as InteractiveIcon,
} from '@mui/icons-material'

const MyEngagement = () => {
  const [chartView, setChartView] = useState('week') // 'week' or 'month'
  const [selectedSession, setSelectedSession] = useState(null)

  // Mock data - Overall stats
  const overallEngagement = 78
  const todayFocusTime = { hours: 2, minutes: 45 }
  const weeklyAverage = 75
  const weeklyChange = 3
  const streak = 5

  // Mock data - Engagement over time (last 14 days)
  const engagementData = [
    { date: 'Oct 15', engagement: 72 },
    { date: 'Oct 16', engagement: 75 },
    { date: 'Oct 17', engagement: 71 },
    { date: 'Oct 18', engagement: 78 },
    { date: 'Oct 19', engagement: 76 },
    { date: 'Oct 20', engagement: 80 },
    { date: 'Oct 21', engagement: 77 },
    { date: 'Oct 22', engagement: 74 },
    { date: 'Oct 23', engagement: 79 },
    { date: 'Oct 24', engagement: 81 },
    { date: 'Oct 25', engagement: 76 },
    { date: 'Oct 26', engagement: 78 },
    { date: 'Oct 27', engagement: 82 },
    { date: 'Oct 28', engagement: 75 },
  ]

  // Mock data - Behavior breakdown
  const behaviorScores = [
    { name: 'Cognitive Engagement', score: 82, color: '#2196F3', icon: <CognitiveIcon /> },
    { name: 'Interactive Participation', score: 68, color: '#4CAF50', icon: <InteractiveIcon /> },
    { name: 'Social Learning', score: 71, color: '#FF9800', icon: <GroupIcon /> },
    { name: 'Emotional State', score: 75, color: '#9C27B0', icon: <MoodIcon /> },
    { name: 'Focus Level', score: 79, color: '#F44336', icon: <FocusIcon /> },
  ]

  // Mock data - Heatmap (engagement by day and time)
  const heatmapData = {
    Monday: { '9AM': 85, '10AM': 82, '11AM': 78, '2PM': 72, '3PM': 68 },
    Tuesday: { '9AM': 88, '10AM': 84, '11AM': 79, '2PM': 75, '3PM': 70 },
    Wednesday: { '9AM': 80, '10AM': 76, '11AM': 74, '2PM': 65, '3PM': 62 },
    Thursday: { '9AM': 83, '10AM': 79, '11AM': 75, '2PM': 70, '3PM': 66 },
    Friday: { '9AM': 75, '10AM': 72, '11AM': 68, '2PM': 58, '3PM': 52 },
  }

  const timeSlots = ['9AM', '10AM', '11AM', '2PM', '3PM']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Mock data - Recent sessions
  const recentSessions = [
    { subject: 'Mathematics', date: 'Today', time: '10:00 AM', duration: '45 min', engagement: 82, summary: 'Excellent focus' },
    { subject: 'Physics', date: 'Yesterday', time: '2:00 PM', duration: '50 min', engagement: 71, summary: 'Good participation' },
    { subject: 'Chemistry', date: 'Yesterday', time: '11:00 AM', duration: '40 min', engagement: 65, summary: 'Lost focus midway' },
    { subject: 'Mathematics', date: 'Oct 27', time: '10:00 AM', duration: '45 min', engagement: 88, summary: 'Very engaged' },
    { subject: 'English', date: 'Oct 27', time: '9:00 AM', duration: '50 min', engagement: 74, summary: 'Decent focus' },
  ]

  // Mock data - Insights
  const insights = [
    'You focus best in morning classes - schedule study time accordingly',
    'Your engagement drops around 20 minutes in - try taking short breaks',
    'Friday afternoons are tough - consider lighter tasks then',
  ]

  // Helper functions
  const getEngagementColor = (score) => {
    if (score >= 75) return '#4CAF50'
    if (score >= 50) return '#FF9800'
    return '#F44336'
  }

  const getHeatmapColor = (value) => {
    if (value >= 75) return '#1565C0' // Dark blue
    if (value >= 50) return '#42A5F5' // Medium blue
    return '#90CAF9' // Light blue
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F5F5F5', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        color: 'white',
        py: 4,
        px: 3,
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <EngagementIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              My Engagement
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            Track your focus levels, participation patterns, and discover when you learn best
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Top Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Overall Engagement Score */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)', 
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.25)',
                borderColor: 'rgba(33, 150, 243, 0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2196F3, #1976D2)',
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                  Overall Engagement
                </Typography>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  background: `linear-gradient(135deg, ${getEngagementColor(overallEngagement)}, ${getEngagementColor(overallEngagement)}dd)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  textShadow: '0 0 30px rgba(33, 150, 243, 0.3)',
                }}>
                  {overallEngagement}%
                </Typography>
                <Chip 
                  label={overallEngagement >= 75 ? '🎉 Excellent!' : overallEngagement >= 50 ? '👍 Good' : '💪 Keep Going'}
                  size="small"
                  sx={{ 
                    background: `linear-gradient(135deg, ${getEngagementColor(overallEngagement)}, ${getEngagementColor(overallEngagement)}dd)`,
                    color: 'white',
                    fontWeight: 700,
                    px: 1.5,
                    boxShadow: `0 4px 12px ${getEngagementColor(overallEngagement)}40`,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Focus Time */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)', 
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.25)',
                borderColor: 'rgba(76, 175, 80, 0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4CAF50, #66BB6A)',
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                    borderRadius: '8px',
                    p: 0.5,
                    display: 'flex',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }}>
                    <TimerIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Today's Focus Time
                  </Typography>
                </Box>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {todayFocusTime.hours}h {todayFocusTime.minutes}m
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Average */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(123, 31, 162, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(156, 39, 176, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)', 
                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.25)',
                borderColor: 'rgba(156, 39, 176, 0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #9C27B0, #BA68C8)',
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                  This Week's Average
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {weeklyAverage}%
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16, color: 'white !important' }} />}
                    label={`+${weeklyChange}%`}
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Streak Counter */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02) rotate(-1deg)', 
                boxShadow: '0 16px 48px rgba(255, 152, 0, 0.5)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <FireIcon sx={{ 
                    fontSize: 32,
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
                    animation: 'flicker 2s infinite',
                    '@keyframes flicker': {
                      '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.8, transform: 'scale(1.1)' },
                    }
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.95, letterSpacing: '1px' }}>
                    STREAK
                  </Typography>
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 0.5, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {streak} Days
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600 }}>
                  Keep it going! 🎉
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Engagement Chart and Behavior Breakdown Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Engagement Over Time Chart */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(33, 150, 243, 0.1)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.12)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(33, 150, 243, 0.18)',
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    borderRadius: '10px',
                    p: 1,
                    display: 'flex',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  }}>
                    <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Engagement Over Time
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant={chartView === 'week' ? 'contained' : 'outlined'}
                    onClick={() => setChartView('week')}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      ...(chartView === 'week' && {
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      })
                    }}
                  >
                    Week
                  </Button>
                  <Button 
                    size="small" 
                    variant={chartView === 'month' ? 'contained' : 'outlined'}
                    onClick={() => setChartView('month')}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      ...(chartView === 'month' && {
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      })
                    }}
                  >
                    Month
                  </Button>
                </Box>
              </Box>
              
              {/* Simple line chart visualization */}
              <Box sx={{ position: 'relative', height: 250 }}>
                <svg width="100%" height="100%" viewBox="0 0 600 250" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#E0E0E0" strokeWidth="1" />
                  <line x1="0" y1="125" x2="600" y2="125" stroke="#E0E0E0" strokeWidth="1" />
                  <line x1="0" y1="200" x2="600" y2="200" stroke="#E0E0E0" strokeWidth="1" />
                  
                  {/* Line chart */}
                  <polyline
                    points={engagementData.map((d, i) => {
                      const x = (i / (engagementData.length - 1)) * 600
                      const y = 250 - (d.engagement / 100) * 250
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none"
                    stroke="#2196F3"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {engagementData.map((d, i) => {
                    const x = (i / (engagementData.length - 1)) * 600
                    const y = 250 - (d.engagement / 100) * 250
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#2196F3"
                        stroke="white"
                        strokeWidth="2"
                      />
                    )
                  })}
                </svg>
                
                {/* X-axis labels */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {engagementData.filter((_, i) => i % 3 === 0).map((d, i) => (
                    <Typography key={i} variant="caption" color="text.secondary">
                      {d.date}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Behavior Breakdown */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(156, 39, 176, 0.1)',
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.12)',
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(156, 39, 176, 0.18)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                  borderRadius: '10px',
                  p: 1,
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                }}>
                  <EngagementIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Behavior Breakdown
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {behaviorScores.map((behavior, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: behavior.color, display: 'flex' }}>
                          {behavior.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {behavior.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: behavior.color }}>
                        {behavior.score}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={behavior.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#E0E0E0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: behavior.color,
                          borderRadius: 4,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Study Patterns Heatmap */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(33, 150, 243, 0.1)',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.12)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(33, 150, 243, 0.18)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
            }}>
              <CalendarIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Study Patterns Heatmap
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
            Discover when you're most focused throughout the week ⏰
          </Typography>
          
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 600 }}>
              {/* Heatmap grid */}
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Box sx={{ width: 100 }} /> {/* Spacer for day labels */}
                {timeSlots.map((time) => (
                  <Box key={time} sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {time}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {days.map((day) => (
                <Box key={day} sx={{ display: 'flex', mb: 1 }}>
                  <Box sx={{ width: 100, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {day}
                    </Typography>
                  </Box>
                  {timeSlots.map((time) => {
                    const value = heatmapData[day][time]
                    return (
                      <Tooltip key={time} title={`${day} ${time}: ${value}%`} arrow>
                        <Box
                          sx={{
                            flex: 1,
                            height: 50,
                            mx: 0.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${getHeatmapColor(value)}, ${getHeatmapColor(value)}dd)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: `0 2px 8px ${getHeatmapColor(value)}40`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.1) translateY(-4px)',
                              boxShadow: `0 8px 24px ${getHeatmapColor(value)}60`,
                              borderColor: 'rgba(255, 255, 255, 0.6)',
                              zIndex: 10,
                            }
                          }}
                        >
                          <Typography variant="caption" sx={{ 
                            color: 'white', 
                            fontWeight: 700,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            fontSize: '0.75rem',
                          }}>
                            {value}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    )
                  })}
                </Box>
              ))}
              
              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: '#90CAF9' }} />
                  <Typography variant="caption">Low (&lt;50%)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: '#42A5F5' }} />
                  <Typography variant="caption">Medium (50-75%)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: '#1565C0' }} />
                  <Typography variant="caption">High (75%+)</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Recent Sessions and Insights Row */}
        <Grid container spacing={3}>
          {/* Recent Sessions Timeline */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(76, 175, 80, 0.1)',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.12)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(76, 175, 80, 0.18)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                  borderRadius: '10px',
                  p: 1,
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                }}>
                  <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Recent Sessions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentSessions.map((session, index) => (
                  <Card 
                    key={index}
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 245, 0.8) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(227, 242, 253, 0.9) 0%, rgba(187, 222, 251, 0.8) 100%)',
                        transform: 'translateX(12px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(33, 150, 243, 0.2)',
                        borderColor: 'rgba(33, 150, 243, 0.3)',
                      }
                    }}
                    onClick={() => setSelectedSession(selectedSession === index ? null : index)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <SchoolIcon sx={{ fontSize: 18, color: '#2196F3' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {session.subject}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {session.date} • {session.time} • {session.duration}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={`${session.engagement}%`}
                            size="small"
                            sx={{
                              bgcolor: getEngagementColor(session.engagement),
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                      {selectedSession === index && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                          <Typography variant="body2" color="text.secondary">
                            💡 {session.summary}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Insights & Recommendations */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              borderRadius: '20px',
              border: '2px solid rgba(33, 150, 243, 0.2)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(33, 150, 243, 0.3)',
                transform: 'translateY(-4px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                borderRadius: '50%',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  borderRadius: '10px',
                  p: 1,
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                }}>
                  <InsightIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #1976D2, #0D47A1)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Insights & Tips
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {insights.map((insight, index) => (
                  <Card key={index} sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(33, 150, 243, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.2)',
                      borderColor: 'rgba(33, 150, 243, 0.3)',
                    }
                  }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 500 }}>
                        💡 {insight}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default MyEngagement
