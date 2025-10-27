import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  Chip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  School as StudyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  RemoveRedEye as EyeIcon,
  Psychology as BrainIcon,
  VideoCall as LiveClassIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  Business as ManagementIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const userRole = user?.role?.toLowerCase() || 'student'

  // Role-specific navigation items
  const roleNavItems = {
    student: [
      { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/student/study', label: 'Study Session', icon: <StudyIcon /> },
      { path: '/student/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
      { path: '/student/settings', label: 'Settings', icon: <SettingsIcon /> }
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/teacher/live-class', label: 'Live Class', icon: <LiveClassIcon /> },
      { path: '/teacher/students', label: 'Students', icon: <PeopleIcon /> },
      { path: '/teacher/reports-analytics', label: 'Reports', icon: <ReportsIcon /> },
      { path: '/teacher/settings', label: 'Settings', icon: <SettingsIcon /> }
    ],
    management: [
      { path: '/management/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/management/reports', label: 'Reports', icon: <ReportsIcon /> },
      { path: '/management/students-analytics', label: 'Students', icon: <PeopleIcon /> },
      { path: '/management/teachers', label: 'Teachers', icon: <PeopleIcon /> },
      { path: '/management/system-settings', label: 'Settings', icon: <SettingsIcon /> }
    ],
    admin: [
      { path: '/management/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/management/reports', label: 'Reports', icon: <ReportsIcon /> },
      { path: '/management/students-analytics', label: 'Students', icon: <PeopleIcon /> },
      { path: '/management/teachers', label: 'Teachers', icon: <PeopleIcon /> },
      { path: '/management/system-settings', label: 'Settings', icon: <SettingsIcon /> }
    ]
  }

  // Get navigation items based on user role
  const navItems = isAuthenticated ? (roleNavItems[userRole] || roleNavItems.student) : []

  return (
    <>
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
          }
          
          @keyframes gradient-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        `}
      </style>
      
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1.5, px: { xs: 2, sm: 3 } }} disableGutters>
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                      animation: 'pulse-glow 2s ease-in-out infinite',
                    }}
                  />
                  <IconButton
                    size="large"
                    sx={{ 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      width: '48px',
                      height: '48px',
                      position: 'relative',
                      zIndex: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <EyeIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Box>
                
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    Study Eye
                    <BrainIcon sx={{ fontSize: 20, color: '#a855f7', ml: 0.5 }} />
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(148, 163, 184, 0.8)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Attention Analytics
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Role Badge */}
            {isAuthenticated && (
              <Chip
                label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                size="small"
                sx={{
                  mr: 2,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                  color: '#a855f7',
                  fontWeight: 600,
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontSize: '0.75rem',
                }}
              />
            )}

            {/* Navigation Items */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? '#ffffff' : 'rgba(203, 213, 225, 0.9)',
                      backgroundColor: isActive 
                        ? 'rgba(99, 102, 241, 0.15)' 
                        : 'transparent',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      border: isActive 
                        ? '1px solid rgba(99, 102, 241, 0.3)' 
                        : '1px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        borderColor: 'rgba(99, 102, 241, 0.4)',
                        transform: 'translateY(-2px)',
                        color: '#ffffff',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                        '&::before': {
                          left: '100%',
                        },
                      },
                      ...(isActive && {
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        '& .MuiButton-startIcon': {
                          animation: 'float 2s ease-in-out infinite',
                        },
                      }),
                      '& .MuiButton-startIcon': {
                        marginRight: '8px',
                        fontSize: '1.2rem',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  )
}

export default Navbar