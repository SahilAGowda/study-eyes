import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  School as StudyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Visibility as EyeIcon
} from '@mui/icons-material'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/study', label: 'Study Session', icon: <StudyIcon /> },
    { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> }
  ]
  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 30, 0.95))',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ 
            mr: 2,
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #1cb5e0)',
              transform: 'scale(1.1)',
              boxShadow: '0 0 20px rgba(33, 150, 243, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <EyeIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196f3, #21cbf3, #9c27b0)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 3s ease infinite',
            fontSize: '1.5rem',
          }}
        >
          Study Eyes
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{
                backgroundColor: location.pathname === item.path 
                  ? 'rgba(33, 150, 243, 0.2)' 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 16px',
                backdropFilter: 'blur(10px)',
                border: location.pathname === item.path 
                  ? '1px solid rgba(33, 150, 243, 0.3)' 
                  : '1px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.15)',
                  borderColor: 'rgba(33, 150, 243, 0.5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.2)',
                },
                ...(location.pathname === item.path && {
                  boxShadow: '0 0 15px rgba(33, 150, 243, 0.3)',
                }),
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
