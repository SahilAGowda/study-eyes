import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { Quiz as QuizIcon } from '@mui/icons-material'

const QuizzesExams = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuizIcon color="primary" />
          Quizzes & Exams
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage quizzes and exams for your students.
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

export default QuizzesExams

