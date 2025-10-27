import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material'
import Navbar from './Navbar'

const DRAWER_WIDTH = 260

/**
 * Unified Layout component for all role-based portals
 * @param {string} role - User role (student, teacher, management)
 * @param {Array} menuItems - Array of menu items with { path, label, icon }
 */
const Layout = ({ role, menuItems = [] }) => {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setDesktopOpen(!desktopOpen)
    }
  }

  const handleMobileClose = () => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  // Role-specific colors
  const roleColors = {
    student: {
      primary: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      light: 'rgba(33, 150, 243, 0.08)'
    },
    teacher: {
      primary: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      light: 'rgba(76, 175, 80, 0.08)'
    },
    management: {
      primary: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      light: 'rgba(255, 152, 0, 0.08)'
    },
    admin: {
      primary: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      light: 'rgba(156, 39, 176, 0.08)'
    }
  }

  const currentRoleColor = roleColors[role?.toLowerCase()] || roleColors.student

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2.5,
          background: currentRoleColor.gradient,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 80
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {role?.charAt(0).toUpperCase() + role?.slice(1)} Portal
          </Typography>
          <Chip
            label={role?.toUpperCase()}
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 20
            }}
          />
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleMobileClose}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? currentRoleColor.light : 'transparent',
                  color: isActive ? currentRoleColor.primary : 'text.primary',
                  transition: 'all 0.3s ease',
                  border: isActive ? `2px solid ${currentRoleColor.primary}` : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: currentRoleColor.light,
                    transform: 'translateX(4px)',
                    borderColor: currentRoleColor.primary
                  },
                  ...(isActive && {
                    boxShadow: `0 4px 12px ${currentRoleColor.light}`,
                    fontWeight: 600
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? currentRoleColor.primary : 'text.secondary',
                    minWidth: 40,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Study Eyes v1.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{
            width: { md: desktopOpen ? DRAWER_WIDTH : 0 },
            flexShrink: { md: 0 },
            transition: 'width 0.3s ease'
          }}
        >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 'none',
              boxShadow: '4px 0 12px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 'none',
              boxShadow: '4px 0 12px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              height: '100%'
            }
          }}
        >
          {drawer}
        </Drawer>
        </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          transition: 'all 0.3s ease',
          backgroundColor: '#f8fafc'
        }}
      >
        {/* Mobile Menu Toggle Button */}
        {isMobile && (
          <Box sx={{ p: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: currentRoleColor.light
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Page Content - Rendered via Outlet */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
      </Box>
    </Box>
  )
}

export default Layout
