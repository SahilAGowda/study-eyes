import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { WebSocketProvider } from './contexts/WebSocketContext'
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
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(30, 30, 30, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(42, 42, 42, 0.9))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(42, 42, 42, 0.9))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976d2, #1cb5e0)',
            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(33, 150, 243, 0.5)',
          '&:hover': {
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 10,
          background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(33, 150, 243, 0.2)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: 'rgba(33, 150, 243, 0.3)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WebSocketProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      studyData={studyData} 
                      isStudying={isStudying}
                      setIsStudying={setIsStudying}
                    />
                  } 
                />
                <Route 
                  path="/study" 
                  element={
                    <StudySession 
                      isStudying={isStudying}
                      setIsStudying={setIsStudying}
                      studyData={studyData}
                      setStudyData={setStudyData}
                    />
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={<Analytics studyData={studyData} />} 
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/camera-test" element={<CameraTest />} />
                <Route path="/focus-test" element={<FocusTest />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WebSocketProvider>
    </ThemeProvider>
  )
}

export default App
