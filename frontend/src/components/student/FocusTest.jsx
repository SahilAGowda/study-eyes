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

// This component has been cleaned and is reserved for the new StudyEye implementation.
// Camera service has been removed.

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
    setCameraError('Camera service removed - awaiting new StudyEye implementation')
  }

  const stopCamera = () => {
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
          Test camera and eye tracking functionality (Awaiting new StudyEye implementation)
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Camera and tracking services have been removed. This component is reserved for the new StudyEye monitoring system.
        </Alert>

        {cameraError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {cameraError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Videocam />}
            onClick={startCamera}
            size="large"
            disabled
          >
            Start Camera (Disabled)
          </Button>
          <Button
            variant="outlined"
            startIcon={<VideocamOff />}
            onClick={stopCamera}
            size="large"
            disabled={!cameraEnabled}
          >
            Stop Camera
          </Button>
        </Box>

        {/* Camera Feed Placeholder */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <video
            ref={videoRef}
            style={{
              width: '640px',
              height: '480px',
              backgroundColor: '#000',
              borderRadius: '8px',
              transform: 'scaleX(-1)'
            }}
            autoPlay
            muted
            playsInline
          />
        </Box>

        {/* Mock Focus Metrics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
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
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(focusData.attentionScore)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eye Strain Level
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
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(100 - focusData.eyeStrain)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blink Rate
                </Typography>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {Math.round(focusData.blinkRate)} /min
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Normal range: 15-20 blinks per minute
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Looking at Screen
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: focusData.lookingAtScreen ? '#4caf50' : '#f44336',
                    mb: 2 
                  }}
                >
                  {focusData.lookingAtScreen ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time gaze detection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default FocusTest
