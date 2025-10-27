import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'

const Notifications = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon color="primary" />
          Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your notification preferences and view recent alerts.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This feature is under development and will be available soon.
        </Typography>
      </Paper>
    </Container>
  )
}

export default Notifications
