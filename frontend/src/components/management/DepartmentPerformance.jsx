import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Business as DepartmentIcon } from '@mui/icons-material'

const DepartmentPerformance = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DepartmentIcon color="primary" />
          Department Performance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and analyze performance metrics across different departments.
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

export default DepartmentPerformance

