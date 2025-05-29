import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link
} from '@mui/material'
import apiService from '../services/apiService'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiService.login(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // Try to create a demo account and login
      await apiService.register('demo', 'demo@example.com', 'demo123')
      await apiService.login('demo@example.com', 'demo123')
      navigate('/')
    } catch (err) {
      // If demo account already exists, just try to login
      try {
        await apiService.login('demo@example.com', 'demo123')
        navigate('/')
      } catch (loginErr) {
        setError('Demo login failed. Please create an account.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '90vh',
          justifyContent: 'center',
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 6, 
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4caf50, #2196f3, #9c27b0)',
              animation: 'gradient-shift 3s ease-in-out infinite',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4caf50, #2196f3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '40px',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              👁️
            </Box>
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4caf50, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Study Eyes
            </Typography>
            <Typography 
              component="h2" 
              variant="h6" 
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              Sign in to your account
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': {
                  filter: 'drop-shadow(0 0 4px rgba(244, 67, 54, 0.3))',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="✉️ Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4caf50',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4caf50',
                      borderWidth: '2px',
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#4caf50',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="🔒 Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4caf50',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4caf50',
                      borderWidth: '2px',
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#4caf50',
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 2, 
                mb: 3,
                py: 2,
                borderRadius: '16px',
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049, #5eb55e)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(76, 175, 80, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {loading ? '🔄 Signing In...' : '🚀 Sign In'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleDemoLogin}
              disabled={loading}
              sx={{ 
                mb: 4,
                py: 2,
                borderRadius: '16px',
                border: '2px solid #2196f3',
                color: '#2196f3',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '2px solid #2196f3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)',
                },
                '&:disabled': {
                  border: '2px solid rgba(33, 150, 243, 0.3)',
                  color: 'rgba(33, 150, 243, 0.5)',
                },
              }}
            >
              {loading ? '⏳ Loading Demo...' : '🎯 Try Demo Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  variant="body1"
                  sx={{
                    color: '#2196f3',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#42a5f5',
                      textDecoration: 'underline',
                      textShadow: '0 0 8px rgba(33, 150, 243, 0.4)',
                    },
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
