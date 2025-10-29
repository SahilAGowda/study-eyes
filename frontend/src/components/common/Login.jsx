import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import apiService from '../../services/apiService'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get role from URL params
  const role = new URLSearchParams(location.search).get('role') || 'student'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

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
      const { user, token } = await apiService.login(formData.email, formData.password)
      
      console.log('Login response - user:', user)
      console.log('Login response - user.role:', user.role)
      console.log('Expected role from URL:', role)
      
      // TEMPORARY FIX: If backend doesn't return role, use the portal role
      // This allows testing until backend is updated to return roles
      const userRole = user.role ? user.role.toLowerCase() : role.toLowerCase()
      const expectedRole = role.toLowerCase()
      
      console.log('User role (normalized):', userRole)
      console.log('Expected role (normalized):', expectedRole)
      
      // Skip validation if backend doesn't provide role (temporary)
      if (user.role && userRole !== expectedRole) {
        setError(`This account is registered as a ${userRole}. Please use the ${userRole} login portal.`)
        setLoading(false)
        return
      }
      
      // Prepare user data with role (use portal role if backend doesn't provide one)
      const userData = {
        ...user,
        token,
        role: userRole
      }
      
      // Login will automatically redirect based on role
      login(userData, location.state?.from?.pathname)
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', error)
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
      const { user, token } = await apiService.login('demo@example.com', 'demo123')
      
      const userData = {
        ...user,
        token,
        role: user.role || 'student'
      }
      
      login(userData)
    } catch (e) {
      // If demo account already exists, just try to login
      try {
        const { user, token } = await apiService.login('demo@example.com', 'demo123')
        
        const userData = {
          ...user,
          token,
          role: user.role || 'student'
        }
        
        login(userData)
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
          elevation={0} 
          sx={{ 
            p: 6, 
            width: '100%',
            maxWidth: '480px',
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(156, 39, 176, 0.1))',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2196f3, #21cbf3, #9c27b0)',
              boxShadow: '0 0 15px rgba(33, 150, 243, 0.3)',
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
              Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
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
                  color: 'white',
                  '& input': {
                    color: 'white',
                  },
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
                  color: 'rgba(255, 255, 255, 0.7)',
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
                  color: 'white',
                  '& input': {
                    color: 'white',
                  },
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
                  color: 'rgba(255, 255, 255, 0.7)',
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
                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2, #1cb5e0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(33, 150, 243, 0.3)',
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
                  href={`/register?role=${role}`} 
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
