import React, { useState, useRef, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material'
import { Videocam, VideocamOff } from '@mui/icons-material'
import cameraService from '../services/cameraService'

function FocusTest() {
  const videoRef = useRef(null)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [focusData, setFocusData] = useState({
    attentionScore: 85,
    eyeStrain: 15,
    blinkRate: 20,
    lookingAtScreen: true
  })

  // Mock real-time data updates
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setFocusData(prev => ({
          attentionScore: Math.max(0, Math.min(100, prev.attentionScore + (Math.random() - 0.5) * 10)),
          eyeStrain: Math.max(0, Math.min(100, prev.eyeStrain + (Math.random() - 0.5) * 5)),
          blinkRate: Math.max(10, Math.min(40, prev.blinkRate + (Math.random() - 0.5) * 4)),
          lookingAtScreen: Math.random() > 0.3
        }))
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isTracking])

  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('Starting camera...')
      
      if (videoRef.current) {
        await cameraService.initializeCamera(videoRef.current)
        setCameraEnabled(true)
        setIsTracking(true)
        console.log('Camera and tracking started successfully')
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError(error.message)
    }
  }

  const stopCamera = () => {
    cameraService.stopCamera()
    setCameraEnabled(false)
    setIsTracking(false)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#1e1e1e' }}>
        <Typography variant="h4" gutterBottom>
          Focus Detection Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Test camera and eye tracking functionality without authentication
        </Typography>

        {cameraError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {cameraError}
            <Button size="small" onClick={startCamera} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {!cameraEnabled ? (
            <Button
              variant="contained"
              startIcon={<Videocam />}
              onClick={startCamera}
              size="large"
            >
              Start Camera & Focus Detection
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<VideocamOff />}
              onClick={stopCamera}
              size="large"
            >
              Stop Camera
            </Button>
          )}
        </Box>

        {cameraEnabled && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Camera Preview
            </Typography>
            <video
              ref={videoRef}
              style={{
                width: '320px',
                height: '240px',
                borderRadius: '8px',
                transform: 'scaleX(-1)',
                border: '2px solid #333'
              }}
              autoPlay
              muted
              playsInline
            />
          </Box>
        )}

        {isTracking && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#1e1e1e' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attention Score
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ color: getScoreColor(focusData.attentionScore), mb: 2 }}
                  >
                    {Math.round(focusData.attentionScore)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={focusData.attentionScore}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(focusData.attentionScore),
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#1e1e1e' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Eye Strain
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ color: getScoreColor(100 - focusData.eyeStrain), mb: 2 }}
                  >
                    {Math.round(focusData.eyeStrain)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={focusData.eyeStrain}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(100 - focusData.eyeStrain),
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#1e1e1e' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Blink Rate
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#2196f3', mb: 2 }}>
                    {Math.round(focusData.blinkRate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blinks per minute
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#1e1e1e' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Screen Focus
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: focusData.lookingAtScreen ? '#4caf50' : '#f44336',
                      mb: 2 
                    }}
                  >
                    {focusData.lookingAtScreen ? 'YES' : 'NO'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Looking at screen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Instructions:
          </Typography>
          <Typography variant="body1" color="text.secondary">
            1. Click "Start Camera & Focus Detection" to begin
            <br />
            2. Allow camera access when prompted
            <br />
            3. Look at the screen to see real-time focus tracking
            <br />
            4. The system will track your attention, eye strain, and blink rate
          </Typography>
        </Box>
      </Paper>    </Container>
  )
}

export default FocusTest
