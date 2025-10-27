import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Psychology as EngagementIcon } from '@mui/icons-material'

const MyEngagement = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EngagementIcon color="primary" />
          My Engagement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your engagement levels and focus patterns during study sessions.
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

export default MyEngagement
