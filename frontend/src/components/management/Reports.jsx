import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Assessment as ReportsIcon } from '@mui/icons-material'

const ManagementReports = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportsIcon color="primary" />
          Management Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate comprehensive reports for institutional oversight and decision making.
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

export default ManagementReports
