import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
  Chip,
  Avatar,
  Button
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const DRAWER_WIDTH = 260

/**
 * Unified Layout component for all role-based portals
 * @param {string} role - User role (student, teacher, management)
 * @param {Array} menuItems - Array of menu items with { path, label, icon }
 */
const Layout = ({ role, menuItems = [] }) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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
  
  const handleDrawerOpen = () => {
    if (isMobile) {
      setMobileOpen(true)
    } else {
      setDesktopOpen(true)
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      {/* Sidebar Header with Logo */}
      <Box
        sx={{
          p: 3,
          background: currentRoleColor.gradient,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                backdropFilter: 'blur(10px)'
              }}
            >
              👁️
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Study Eyes
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                Attention Analytics
              </Typography>
            </Box>
          </Box>
          {!isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white', ml: 'auto' }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        {/* User Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 600
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.username || 'User'}
            </Typography>
            <Chip
              label={role?.toUpperCase()}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 18,
                mt: 0.5
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleMobileClose}
                sx={{
                  borderRadius: '10px',
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? currentRoleColor.primary : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: isActive ? currentRoleColor.primary : currentRoleColor.light,
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)'
                    }
                  },
                  ...(isActive && {
                    boxShadow: `0 4px 12px ${currentRoleColor.primary}40`,
                    fontWeight: 600,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: 'white',
                      borderRadius: '0 4px 4px 0'
                    }
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : currentRoleColor.primary,
                    minWidth: 40,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Footer with Logout */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 500,
            py: 1,
            '&:hover': {
              borderColor: currentRoleColor.primary,
              color: currentRoleColor.primary,
              bgcolor: currentRoleColor.light
            }
          }}
        >
          Logout
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
          Study Eyes v1.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
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
              boxShadow: '8px 0 24px rgba(0, 0, 0, 0.12)',
              position: 'relative',
              height: '100%',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)'
              }
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
          minHeight: '100vh',
          overflow: 'auto',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          position: 'relative'
        }}
      >
        {/* Top Bar for Mobile */}
        {isMobile && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1100,
              bgcolor: 'white',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: currentRoleColor.primary,
                '&:hover': {
                  bgcolor: currentRoleColor.light
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Study Eyes
            </Typography>
          </Box>
        )}

        {/* Floating Menu Button when Sidebar is Collapsed (Desktop) */}
        {!isMobile && !desktopOpen && (
          <IconButton
            onClick={handleDrawerOpen}
            sx={{
              position: 'fixed',
              left: 16,
              top: 16,
              zIndex: 1200,
              bgcolor: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              color: currentRoleColor.primary,
              '&:hover': {
                bgcolor: currentRoleColor.light,
                transform: 'scale(1.1)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Content - Rendered via Outlet */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
