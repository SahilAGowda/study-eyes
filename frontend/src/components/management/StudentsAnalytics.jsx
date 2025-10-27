import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Analytics as AnalyticsIcon } from '@mui/icons-material'

const StudentsAnalytics = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon color="primary" />
          Students Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive analytics and insights about student performance across the institution.
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

export default StudentsAnalytics
