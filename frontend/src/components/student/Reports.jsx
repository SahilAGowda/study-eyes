import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, Button, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Select, MenuItem, FormControl, Tooltip
} from '@mui/material'
import {
  Assessment as ReportIcon, Delete as DeleteIcon
} from '@mui/icons-material'
import { getSessionTracker } from '../../studyeye/services/sessionTracker'
import {
  getSessionsByPeriod, clearStoredSessions, deleteSession
} from '../../studyeye/services/sessionStorage'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [sessions, setSessions] = useState([])
  const sessionTracker = getSessionTracker()

  useEffect(() => {
    loadSessions()
  }, [selectedPeriod])

  // Reload when session ends
  useEffect(() => {
    const interval = setInterval(() => {
      if (!sessionTracker.isSessionActive()) {
        loadSessions()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadSessions = () => {
    const periodSessions = getSessionsByPeriod(selectedPeriod)
    setSessions(periodSessions)
  }

  const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId)
    loadSessions()
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all session history?')) {
      clearStoredSessions()
      loadSessions()
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 60) return '#FF9800'
    return '#F44336'
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return '#4CAF50'
      case 'good': return '#2196F3'
      case 'fair': return '#FF9800'
      default: return '#F44336'
    }
  }

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'fair': return 'Fair'
      case 'needs_improvement': return 'Needs Work'
      default: return rating
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F5F5F5', pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#2196F3', color: 'white', p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportIcon sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Session Reports</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            {sessions.length > 0 && (
              <Button variant="outlined" color="error" size="small" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Session History Table */}
        {sessions.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No sessions yet. Start a study session to see reports here.
            </Typography>
          </Card>
        ) : (
          <Card sx={{ boxShadow: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Focus %</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Engagement</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Distractions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{session.date}</Typography>
                        <Typography variant="caption" color="text.secondary">{session.time}</Typography>
                      </TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={session.focusPercentage}
                            sx={{ 
                              width: 50, height: 6, borderRadius: 3, bgcolor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(session.focusPercentage) } 
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(session.focusPercentage) }}>
                            {session.focusPercentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(session.engagementScore) }}>
                          {session.engagementScore}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={session.distractionCount} 
                          size="small"
                          sx={{ 
                            bgcolor: session.distractionCount > 5 ? '#FFEBEE' : '#E8F5E9',
                            color: session.distractionCount > 5 ? '#F44336' : '#4CAF50',
                            fontWeight: 600
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getRatingLabel(session.overallRating)} 
                          size="small"
                          sx={{ bgcolor: getRatingColor(session.overallRating), color: 'white', fontWeight: 600 }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteSession(session.id)} sx={{ color: '#F44336' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default Reports
