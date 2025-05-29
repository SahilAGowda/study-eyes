import React, { useState } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  TextField,
  MenuItem,
  Alert
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Visibility as EyeIcon,
  HealthAndSafety as HealthIcon,
  Timer as TimerIcon,
  Save as SaveIcon
} from '@mui/icons-material'

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      eyeBreakReminder: true,
      postureAlert: true,
      studyGoalReminder: true,
      dailySummary: false
    },
    eyeBreak: {
      interval: 20, // minutes
      duration: 20, // seconds
      enabled: true
    },
    posture: {
      sensitivity: 75,
      enabled: true
    },
    study: {
      dailyGoal: 8, // hours
      weeklyGoal: 40, // hours
      sessionReminder: 30 // minutes
    },
    ai: {
      attentionTracking: true,
      faceDetection: true,
      postureAnalysis: true
    }
  })

  const [saveStatus, setSaveStatus] = useState('')

  const handleSwitchChange = (category, setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: event.target.checked
      }
    }))
  }

  const handleSliderChange = (category, setting) => (event, newValue) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: newValue
      }
    }))
  }

  const handleNumberChange = (category, setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: parseFloat(event.target.value) || 0
      }
    }))
  }

  const handleSaveSettings = () => {
    // Simulate saving settings
    setSaveStatus('success')
    setTimeout(() => setSaveStatus(''), 3000)
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #673ab7, #9c27b0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ⚙️ Settings
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          Customize your Study Eyes experience
        </Typography>
      </Box>

      {saveStatus && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            background: 'rgba(76, 175, 80, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.3))',
            },
          }}
        >
          ✅ Settings saved successfully!
        </Alert>
      )}      <Grid container spacing={3}>
        {/* Notifications Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.05))',
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
                background: 'linear-gradient(90deg, #2196f3, #42a5f5)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <NotificationsIcon sx={{ 
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
                🔔 Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.eyeBreakReminder}
                    onChange={handleSwitchChange('notifications', 'eyeBreakReminder')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      👁️ Eye break reminders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get notified when it's time for an eye break
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.postureAlert}
                    onChange={handleSwitchChange('notifications', 'postureAlert')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      🏃 Posture alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive alerts for poor posture detection
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.studyGoalReminder}
                    onChange={handleSwitchChange('notifications', 'studyGoalReminder')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      🎯 Study goal reminders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stay motivated with goal progress updates
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.dailySummary}
                    onChange={handleSwitchChange('notifications', 'dailySummary')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      📊 Daily summary notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get daily study and health summaries
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Grid>        {/* Eye Care Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
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
                background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <EyeIcon sx={{ 
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
                👁️ Eye Care
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.eyeBreak.enabled}
                  onChange={handleSwitchChange('eyeBreak', 'enabled')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4caf50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Enable eye break reminders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow the 20-20-20 rule for healthy eyes
                  </Typography>
                </Box>
              }
              sx={{ mb: 4 }}
            />

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⏰ Break interval: {settings.eyeBreak.interval} minutes
              </Typography>
              <Slider
                value={settings.eyeBreak.interval}
                onChange={handleSliderChange('eyeBreak', 'interval')}
                min={10}
                max={60}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.eyeBreak.enabled}
                sx={{
                  color: '#4caf50',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⏱️ Break duration: {settings.eyeBreak.duration} seconds
              </Typography>
              <Slider
                value={settings.eyeBreak.duration}
                onChange={handleSliderChange('eyeBreak', 'duration')}
                min={10}
                max={60}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.eyeBreak.enabled}
                sx={{
                  color: '#4caf50',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>        {/* Posture Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
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
                background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <HealthIcon sx={{ 
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
                🏃 Posture Monitoring
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.posture.enabled}
                  onChange={handleSwitchChange('posture', 'enabled')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ff9800',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ff9800',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Enable posture monitoring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor your sitting posture and get alerts
                  </Typography>
                </Box>
              }
              sx={{ mb: 4 }}
            />

            <Box>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⚠️ Alert sensitivity: {settings.posture.sensitivity}%
              </Typography>
              <Slider
                value={settings.posture.sensitivity}
                onChange={handleSliderChange('posture', 'sensitivity')}
                min={25}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.posture.enabled}
                sx={{
                  color: '#ff9800',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(255, 152, 0, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                💡 Higher sensitivity means more frequent posture alerts
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Study Goals */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(156, 39, 176, 0.3)',
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
                background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TimerIcon sx={{ 
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
                🎯 Study Goals
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                label="📅 Daily study goal (hours)"
                type="number"
                value={settings.study.dailyGoal}
                onChange={handleNumberChange('study', 'dailyGoal')}
                inputProps={{ min: 1, max: 16, step: 0.5 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />

              <TextField
                label="📊 Weekly study goal (hours)"
                type="number"
                value={settings.study.weeklyGoal}
                onChange={handleNumberChange('study', 'weeklyGoal')}
                inputProps={{ min: 5, max: 100, step: 1 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />

              <TextField
                label="🔔 Session reminder interval (minutes)"
                type="number"
                value={settings.study.sessionReminder}
                onChange={handleNumberChange('study', 'sessionReminder')}
                inputProps={{ min: 15, max: 120, step: 5 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>        {/* AI Features */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.2)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #9c27b0, #e91e63)',
                animation: 'gradient-shift 3s ease-in-out infinite',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box
                sx={{
                  mr: 2,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  filter: 'drop-shadow(0 0 8px rgba(156, 39, 176, 0.4))',
                }}
              >
                🤖
              </Box>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI Features
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        👁️
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.attentionTracking}
                            onChange={handleSwitchChange('ai', 'attentionTracking')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Attention Tracking
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Monitor focus levels and detect distractions using advanced AI algorithms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        🎯
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.faceDetection}
                            onChange={handleSwitchChange('ai', 'faceDetection')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Face Detection
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Detect when you're away from your study area and track presence
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        🏃
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.postureAnalysis}
                            onChange={handleSwitchChange('ai', 'postureAnalysis')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Posture Analysis
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Real-time spinal alignment monitoring and posture correction
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ 
                px: 6,
                py: 2,
                borderRadius: '25px',
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049, #5eb55e)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '& .MuiButton-startIcon': {
                  marginRight: '12px',
                  fontSize: '24px',
                },
              }}
            >
              💾 Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Settings
