import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './components/Dashboard'
import StudySession from './components/StudySession'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import Navbar from './components/Navbar'
import CameraTest from './components/CameraTest'
import FocusTest from './components/FocusTest'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#bbdefb',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    secondary: {
      main: '#7c4dff',
      light: '#e8eaf6',
      dark: '#5c35d9',
      contrastText: '#fff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      alternate: '#f3f6f9'
    },
    text: {
      primary: '#2d3748',
      secondary: '#64748b',
    },
    success: {
      main: '#4caf50',
      light: '#e8f5e9',
      dark: '#388e3c',
    },
    info: {
      main: '#0288d1',
      light: '#e3f2fd',
      dark: '#01579b',
    },
    warning: {
      main: '#ff9800',
      light: '#fff3e0',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#ffebee',
      dark: '#d32f2f',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.75,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '8px 20px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          boxShadow: 'none',
          '&.MuiChip-outlined': {
            borderWidth: '1.5px',
          },
        },
        filled: {
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.12)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.08)',
          borderColor: 'rgba(76, 175, 80, 0.16)',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.08)',
          borderColor: 'rgba(244, 67, 54, 0.16)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderColor: 'rgba(255, 152, 0, 0.16)',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          borderColor: 'rgba(33, 150, 243, 0.16)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
})

function App() {
  const [isStudying, setIsStudying] = useState(false)
  const [studyData, setStudyData] = useState({
    totalTime: 0,
    eyeBreaks: 0,
    postureFeedback: [],
    attentionScore: 0
  })

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <WebSocketProvider>
            <Box
              sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Navbar />
              <Container 
                maxWidth={false}
                sx={{
                  flex: 1,
                  py: 3,
                  px: { xs: 2, sm: 3, md: 4 },
                  width: '100%'
                }}
              >
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Dashboard 
                          studyData={studyData} 
                          isStudying={isStudying}
                          setIsStudying={setIsStudying}
                        />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/study"
                    element={
                      <PrivateRoute>
                        <StudySession 
                          isStudying={isStudying}
                          setIsStudying={setIsStudying}
                          studyData={studyData}
                          setStudyData={setStudyData}
                        />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <Analytics studyData={studyData} />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/camera-test"
                    element={
                      <PrivateRoute>
                        <CameraTest />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/focus-test"
                    element={
                      <PrivateRoute>
                        <FocusTest />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Container>
            </Box>
          </WebSocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
