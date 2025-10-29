import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress as MuiCircularProgress,
  Fade,
  Grow
} from '@mui/material'
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  Psychology as BrainIcon,
  PanTool as HandIcon,
  Group as GroupIcon,
  Mood as MoodIcon,
  Visibility as EyeIcon,
  NoteAdd as NoteIcon,
  HelpOutline as QuestionIcon,
  Chat as ChatIcon,
  Lightbulb as IdeaIcon
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(false)
  const [expandedSubjects, setExpandedSubjects] = useState({})
  const [expandedBehaviors, setExpandedBehaviors] = useState({})
  const [visibleSubjects, setVisibleSubjects] = useState({
    mathematics: true,
    physics: true,
    chemistry: true,
    english: true
  })
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // Period configurations
  const periods = {
    week: { label: 'This Week', range: 'Oct 22 - Oct 29, 2024' },
    month: { label: 'This Month', range: 'Oct 1 - Oct 29, 2024' },
    semester: { label: 'This Semester', range: 'Sep 1 - Dec 31, 2024' },
    custom: { label: 'Custom Range', range: 'Select dates' }
  }

  // Mock data - Overall Summary
  const overallSummary = {
    engagement: { value: 78, change: 5, trend: 'up' },
    studyHours: '24h 35m',
    classesAttended: { current: 18, total: 20, percentage: 90 },
    quizzes: { count: 12, average: 82 }
  }

  // Mock data - Subject Performance
  const subjects = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      color: '#2196F3',
      icon: '📐',
      engagement: 85,
      hours: '8h 45m',
      classes: 6,
      quizzes: { count: 4, average: 88 },
      status: 'Excellent',
      trend: [78, 80, 82, 81, 83, 85]
    },
    {
      id: 'physics',
      name: 'Physics',
      color: '#9C27B0',
      icon: '⚛️',
      engagement: 80,
      hours: '7h 20m',
      classes: 5,
      quizzes: { count: 3, average: 83 },
      status: 'Good',
      trend: [75, 76, 78, 79, 80, 80]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      color: '#4CAF50',
      icon: '🧪',
      engagement: 72,
      hours: '5h 30m',
      classes: 4,
      quizzes: { count: 3, average: 78 },
      status: 'Needs Focus',
      trend: [70, 71, 70, 72, 71, 72]
    },
    {
      id: 'english',
      name: 'English',
      color: '#FF9800',
      icon: '📚',
      engagement: 76,
      hours: '3h 0m',
      classes: 3,
      quizzes: { count: 2, average: 80 },
      status: 'Good',
      trend: [74, 75, 75, 76, 76, 76]
    }
  ]

  // Mock data - Engagement Trends
  const engagementTrends = [
    { date: 'Oct 15', mathematics: 78, physics: 75, chemistry: 70, english: 74 },
    { date: 'Oct 18', mathematics: 80, physics: 76, chemistry: 71, english: 75 },
    { date: 'Oct 21', mathematics: 82, physics: 78, chemistry: 70, english: 75 },
    { date: 'Oct 24', mathematics: 81, physics: 79, chemistry: 72, english: 76 },
    { date: 'Oct 27', mathematics: 83, physics: 80, chemistry: 71, english: 76 },
    { date: 'Oct 29', mathematics: 85, physics: 80, chemistry: 72, english: 76 }
  ]

  // Mock data - Behavioral Analysis
  const behaviors = [
    {
      id: 'cognitive',
      name: 'Cognitive Engagement',
      icon: <BrainIcon />,
      score: 82,
      color: '#2196F3',
      details: [
        { name: 'Active Listening', score: 85, change: 3 },
        { name: 'Note-taking', score: 78, change: -2 },
        { name: 'Problem-solving', score: 83, change: 5 }
      ]
    },
    {
      id: 'interactive',
      name: 'Interactive Participation',
      icon: <HandIcon />,
      score: 68,
      color: '#FF9800',
      details: [
        { name: 'Hand-raising', score: 65, change: -4 },
        { name: 'Asking Questions', score: 70, change: 2 },
        { name: 'Answering', score: 72, change: 3 }
      ]
    },
    {
      id: 'social',
      name: 'Social Learning',
      icon: <GroupIcon />,
      score: 75,
      color: '#9C27B0',
      details: [
        { name: 'Peer Collaboration', score: 78, change: 6 },
        { name: 'Group Discussion', score: 73, change: 4 },
        { name: 'Helping Others', score: 74, change: 2 }
      ]
    },
    {
      id: 'emotional',
      name: 'Emotional Indicators',
      icon: <MoodIcon />,
      score: 77,
      color: '#4CAF50',
      details: [
        { name: 'Interest', score: 82, change: 5 },
        { name: 'Confusion', score: 25, change: -3, inverse: true },
        { name: 'Satisfaction', score: 80, change: 4 }
      ]
    },
    {
      id: 'focus',
      name: 'Focus Level',
      icon: <EyeIcon />,
      score: 79,
      color: '#E91E63',
      details: [
        { name: 'Sustained Attention', score: 82, change: 3 },
        { name: 'Distraction Rate', score: 18, change: -3, inverse: true },
        { name: 'Fatigue Indicators', score: 22, change: -5, inverse: true }
      ]
    }
  ]

  // Mock data - Milestones
  const milestones = [
    { 
      id: 1, 
      title: '7-day engagement streak', 
      date: 'Oct 15-21', 
      icon: <FireIcon />, 
      color: '#FF5722' 
    },
    { 
      id: 2, 
      title: 'Perfect attendance this month', 
      date: '18/18 classes', 
      icon: <CheckIcon />, 
      color: '#4CAF50' 
    },
    { 
      id: 3, 
      title: '90%+ on 3 quizzes', 
      date: 'Math quizzes', 
      icon: <StarIcon />, 
      color: '#FFD700' 
    },
    { 
      id: 4, 
      title: 'Most improved in Physics', 
      date: '12% increase', 
      icon: <TrendingUpIcon />, 
      color: '#2196F3' 
    },
    { 
      id: 5, 
      title: 'Active participant', 
      date: 'Asked 15 questions', 
      icon: <TrophyIcon />, 
      color: '#9C27B0' 
    }
  ]

  // Mock data - Areas for Improvement
  const improvements = [
    {
      id: 1,
      subject: 'Chemistry',
      issue: 'Chemistry needs more focus',
      score: 72,
      description: 'Your engagement is below your average',
      tip: 'Schedule extra study time for Chemistry topics',
      icon: '🧪',
      color: '#FFA726'
    },
    {
      id: 2,
      subject: 'Participation',
      issue: 'Hand-raising decreased by 4%',
      score: 65,
      description: 'Try participating more actively in class',
      tip: 'Prepare one question before each class',
      icon: '✋',
      color: '#FFB74D'
    },
    {
      id: 3,
      subject: 'Time Management',
      issue: 'Afternoon classes show lower engagement',
      score: 68,
      description: 'Energy levels dip in afternoon sessions',
      tip: 'Take short breaks between morning and afternoon sessions',
      icon: '⏰',
      color: '#FFCC80'
    }
  ]

  // Mock data - Recent Classes
  const recentClasses = [
    {
      date: 'Oct 29',
      time: '10:00 AM',
      subject: 'Mathematics',
      duration: '45m',
      engagement: 82,
      behaviors: ['hand-raised', 'note-taking'],
      quiz: { taken: true, score: 88 },
      notes: 'Hand raised 2x, Note-taking active'
    },
    {
      date: 'Oct 28',
      time: '2:00 PM',
      subject: 'Physics',
      duration: '50m',
      engagement: 71,
      behaviors: ['collaboration'],
      quiz: { taken: false },
      notes: 'Collaborated with peers'
    },
    {
      date: 'Oct 28',
      time: '11:00 AM',
      subject: 'Chemistry',
      duration: '40m',
      engagement: 65,
      behaviors: ['distracted'],
      quiz: { taken: true, score: 75 },
      notes: 'Seemed distracted mid-class'
    },
    {
      date: 'Oct 27',
      time: '10:30 AM',
      subject: 'Mathematics',
      duration: '45m',
      engagement: 88,
      behaviors: ['hand-raised', 'questions'],
      quiz: { taken: false },
      notes: 'Very engaged, asked 3 questions'
    },
    {
      date: 'Oct 27',
      time: '1:00 PM',
      subject: 'English',
      duration: '50m',
      engagement: 74,
      behaviors: ['participation'],
      quiz: { taken: true, score: 80 },
      notes: 'Good participation'
    },
    {
      date: 'Oct 26',
      time: '9:00 AM',
      subject: 'Physics',
      duration: '45m',
      engagement: 85,
      behaviors: ['focus'],
      quiz: { taken: true, score: 90 },
      notes: 'Excellent focus'
    },
    {
      date: 'Oct 25',
      time: '2:30 PM',
      subject: 'Chemistry',
      duration: '40m',
      engagement: 68,
      behaviors: ['low-energy'],
      quiz: { taken: false },
      notes: 'Low energy detected'
    },
    {
      date: 'Oct 25',
      time: '10:00 AM',
      subject: 'Mathematics',
      duration: '45m',
      engagement: 86,
      behaviors: ['problem-solving'],
      quiz: { taken: true, score: 92 },
      notes: 'Active problem-solving'
    },
    {
      date: 'Oct 24',
      time: '11:30 AM',
      subject: 'Physics',
      duration: '50m',
      engagement: 78,
      behaviors: ['group-work'],
      quiz: { taken: false },
      notes: 'Good group work'
    },
    {
      date: 'Oct 24',
      time: '9:00 AM',
      subject: 'Mathematics',
      duration: '45m',
      engagement: 83,
      behaviors: ['focus'],
      quiz: { taken: false },
      notes: 'Steady focus'
    }
  ]

  // Handlers
  const handlePeriodChange = (event) => {
    setLoading(true)
    setSelectedPeriod(event.target.value)
    setTimeout(() => setLoading(false), 800)
  }

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }))
  }

  const toggleBehavior = (behaviorId) => {
    setExpandedBehaviors(prev => ({
      ...prev,
      [behaviorId]: !prev[behaviorId]
    }))
  }

  const toggleSubjectVisibility = (subjectId) => {
    setVisibleSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }))
  }

  const handleDownloadReport = () => {
    console.log('Downloading report as PDF...')
    // Implement PDF download logic
  }

  const handleShareReport = () => {
    setShareDialogOpen(true)
  }

  const handlePrintReport = () => {
    window.print()
  }

  const getEngagementColor = (score) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 70) return '#FF9800'
    return '#F44336'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return '#4CAF50'
      case 'Good': return '#2196F3'
      case 'Needs Focus': return '#FF9800'
      default: return '#757575'
    }
  }

  const getBehaviorIcon = (behavior) => {
    const icons = {
      'hand-raised': <HandIcon fontSize="small" />,
      'note-taking': <NoteIcon fontSize="small" />,
      'questions': <QuestionIcon fontSize="small" />,
      'collaboration': <GroupIcon fontSize="small" />,
      'participation': <ChatIcon fontSize="small" />,
      'focus': <EyeIcon fontSize="small" />,
      'problem-solving': <IdeaIcon fontSize="small" />,
      'group-work': <GroupIcon fontSize="small" />,
      'distracted': '😴',
      'low-energy': '😔'
    }
    return icons[behavior] || null
  }

  // Circular Progress Component
  const CircularProgress = ({ value, size = 120, color }) => {
    const circumference = 2 * Math.PI * 40
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>
            {value}%
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#F5F5F5',
      pb: 6
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: '#2196F3',
        color: 'white',
        p: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ReportIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reports
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Your comprehensive learning progress and engagement insights
        </Typography>
      </Box>

      <Box sx={{ px: 4 }}>
        {/* Period Selector */}
        <Fade in timeout={400}>
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Report Period
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {periods[selectedPeriod].range}
                  </Typography>
                </Box>
                <FormControl sx={{ minWidth: 200 }}>
                  <Select
                    value={selectedPeriod}
                    onChange={handlePeriodChange}
                    sx={{ 
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3'
                      }
                    }}
                  >
                    {Object.entries(periods).map(([key, { label }]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <MuiCircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Overall Performance Summary */}
            <Grow in timeout={600}>
              <Card sx={{ mb: 4, boxShadow: 4, background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1976D2' }}>
                    🎯 Overall Performance Summary
                  </Typography>
                  <Grid container spacing={4}>
                    {/* Engagement Score */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress 
                          value={overallSummary.engagement.value} 
                          color={getEngagementColor(overallSummary.engagement.value)}
                        />
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                          Overall Engagement
                        </Typography>
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`+${overallSummary.engagement.change}% from last period`}
                          size="small"
                          sx={{ 
                            mt: 1, 
                            bgcolor: '#E8F5E9', 
                            color: '#4CAF50',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Study Hours */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          width: 120, 
                          height: 120, 
                          borderRadius: '50%',
                          bgcolor: '#FFF3E0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          border: '8px solid #FF9800'
                        }}>
                          <TimerIcon sx={{ fontSize: 50, color: '#FF9800' }} />
                        </Box>
                        <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: '#FF9800' }}>
                          {overallSummary.studyHours}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Total Study Hours
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Classes Attended */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          width: 120, 
                          height: 120, 
                          borderRadius: '50%',
                          bgcolor: '#E8F5E9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          border: '8px solid #4CAF50'
                        }}>
                          <SchoolIcon sx={{ fontSize: 50, color: '#4CAF50' }} />
                        </Box>
                        <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: '#4CAF50' }}>
                          {overallSummary.classesAttended.current}/{overallSummary.classesAttended.total}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Classes Attended
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: '#4CAF50' }}>
                          {overallSummary.classesAttended.percentage}% attendance
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Quizzes */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          width: 120, 
                          height: 120, 
                          borderRadius: '50%',
                          bgcolor: '#F3E5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          border: '8px solid #9C27B0'
                        }}>
                          <TrophyIcon sx={{ fontSize: 50, color: '#9C27B0' }} />
                        </Box>
                        <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: '#9C27B0' }}>
                          {overallSummary.quizzes.count}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Quizzes Completed
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: '#9C27B0' }}>
                          {overallSummary.quizzes.average}% average score
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grow>

            {/* Subject Performance Cards */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
              📚 Subject-Wise Performance
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {subjects.map((subject, index) => (
                <Grid item xs={12} md={6} key={subject.id}>
                  <Grow in timeout={800 + index * 100}>
                    <Card sx={{ 
                      boxShadow: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h4" sx={{ mr: 1 }}>{subject.icon}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {subject.name}
                            </Typography>
                          </Box>
                          <Chip
                            label={subject.status}
                            sx={{
                              bgcolor: getStatusColor(subject.status),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Engagement</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: subject.color }}>
                              {subject.engagement}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Study Time</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              {subject.hours}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Classes</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {subject.classes} sessions
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Quiz Average</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {subject.quizzes.average}% ({subject.quizzes.count} quizzes)
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Mini Sparkline */}
                        <Box sx={{ height: 60, mt: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={subject.trend.map((val, idx) => ({ value: val, index: idx }))}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={subject.color} 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>

                        <Button
                          fullWidth
                          onClick={() => toggleSubject(subject.id)}
                          endIcon={expandedSubjects[subject.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                          {expandedSubjects[subject.id] ? 'Hide Details' : 'View Details'}
                        </Button>

                        <Collapse in={expandedSubjects[subject.id]}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              You're doing great in {subject.name}! 
                              {subject.status === 'Excellent' && ' Keep up the amazing work!'}
                              {subject.status === 'Good' && ' A little more effort and you\'ll be excellent!'}
                              {subject.status === 'Needs Focus' && ' Let\'s work together to improve this!'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Your engagement trend shows {subject.trend[subject.trend.length - 1] > subject.trend[0] ? 'positive growth' : 'steady performance'} over time.
                            </Typography>
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>

            {/* Engagement Trends Chart & Milestones */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Engagement Trends */}
              <Grid item xs={12} lg={8}>
                <Fade in timeout={1200}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
                        📈 Engagement Trends
                      </Typography>
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {subjects.map(subject => (
                          <Chip
                            key={subject.id}
                            label={subject.name}
                            onClick={() => toggleSubjectVisibility(subject.id)}
                            sx={{
                              bgcolor: visibleSubjects[subject.id] ? subject.color : '#E0E0E0',
                              color: visibleSubjects[subject.id] ? 'white' : 'text.secondary',
                              fontWeight: 600,
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={engagementTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#757575"
                              style={{ fontSize: '0.875rem' }}
                            />
                            <YAxis 
                              stroke="#757575"
                              style={{ fontSize: '0.875rem' }}
                              domain={[0, 100]}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '0.875rem', fontWeight: 600 }}
                            />
                            {visibleSubjects.mathematics && (
                              <Line 
                                type="monotone" 
                                dataKey="mathematics" 
                                stroke="#2196F3" 
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                name="Mathematics"
                              />
                            )}
                            {visibleSubjects.physics && (
                              <Line 
                                type="monotone" 
                                dataKey="physics" 
                                stroke="#9C27B0" 
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                name="Physics"
                              />
                            )}
                            {visibleSubjects.chemistry && (
                              <Line 
                                type="monotone" 
                                dataKey="chemistry" 
                                stroke="#4CAF50" 
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                name="Chemistry"
                              />
                            )}
                            {visibleSubjects.english && (
                              <Line 
                                type="monotone" 
                                dataKey="english" 
                                stroke="#FF9800" 
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                name="English"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Milestones */}
              <Grid item xs={12} lg={4}>
                <Fade in timeout={1400}>
                  <Card sx={{ boxShadow: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
                        🏆 Milestones & Achievements
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {milestones.map((milestone, index) => (
                          <Grow in timeout={1500 + index * 100} key={milestone.id}>
                            <Card 
                              sx={{ 
                                bgcolor: '#F5F5F5',
                                boxShadow: 'none',
                                border: `2px solid ${milestone.color}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: 3
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ 
                                    bgcolor: milestone.color,
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    color: 'white'
                                  }}>
                                    {milestone.icon}
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                      {milestone.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {milestone.date}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grow>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>

            {/* Behavioral Analysis */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
              🧠 Behavioral Analysis
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {behaviors.map((behavior, index) => (
                <Grid item xs={12} md={6} lg={4} key={behavior.id}>
                  <Grow in timeout={1600 + index * 100}>
                    <Card sx={{ 
                      boxShadow: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            bgcolor: `${behavior.color}20`,
                            borderRadius: 2,
                            p: 1,
                            mr: 2,
                            color: behavior.color
                          }}>
                            {behavior.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {behavior.name}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: behavior.color }}>
                              {behavior.score}%
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          {behavior.details.map((detail, idx) => (
                            <Box key={idx} sx={{ mb: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {detail.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {detail.score}%
                                  </Typography>
                                  <Chip
                                    icon={detail.change > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`${detail.change > 0 ? '+' : ''}${detail.change}%`}
                                    size="small"
                                    sx={{
                                      bgcolor: detail.change > 0 ? '#E8F5E9' : '#FFEBEE',
                                      color: detail.change > 0 ? '#4CAF50' : '#F44336',
                                      fontWeight: 600,
                                      height: 20,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Box>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={detail.score}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#E0E0E0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: behavior.color,
                                    borderRadius: 3
                                  }
                                }}
                              />
                            </Box>
                          ))}
                        </Box>

                        <Button
                          fullWidth
                          size="small"
                          onClick={() => toggleBehavior(behavior.id)}
                          endIcon={expandedBehaviors[behavior.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {expandedBehaviors[behavior.id] ? 'Hide Insights' : 'Show Insights'}
                        </Button>

                        <Collapse in={expandedBehaviors[behavior.id]}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Your {behavior.name.toLowerCase()} shows positive trends. Keep engaging actively in your learning process!
                            </Typography>
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>

            {/* Areas for Improvement */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
              💡 Areas for Growth
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {improvements.map((improvement, index) => (
                <Grid item xs={12} md={4} key={improvement.id}>
                  <Grow in timeout={2000 + index * 100}>
                    <Card sx={{ 
                      boxShadow: 3,
                      bgcolor: '#FFF9F5',
                      borderLeft: `4px solid ${improvement.color}`,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" sx={{ mr: 2 }}>{improvement.icon}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {improvement.subject}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: improvement.color }}>
                          {improvement.issue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {improvement.description}
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2,
                          border: `1px solid ${improvement.color}`
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: improvement.color }}>
                            💡 Tip: {improvement.tip}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>

            {/* Class-by-Class Breakdown */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976D2' }}>
              📋 Recent Classes Breakdown
            </Typography>
            <Fade in timeout={2200}>
              <Card sx={{ boxShadow: 3, mb: 4 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Engagement</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Behaviors</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Quiz</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentClasses.map((classItem, index) => {
                        const subjectData = subjects.find(s => s.name === classItem.subject)
                        return (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:hover': { bgcolor: '#F5F5F5' },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {classItem.date}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {classItem.time}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={classItem.subject}
                                size="small"
                                sx={{
                                  bgcolor: `${subjectData?.color}20`,
                                  color: subjectData?.color,
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>{classItem.duration}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${classItem.engagement}%`}
                                size="small"
                                sx={{
                                  bgcolor: getEngagementColor(classItem.engagement),
                                  color: 'white',
                                  fontWeight: 700
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {classItem.behaviors.map((behavior, idx) => (
                                  <Tooltip key={idx} title={behavior}>
                                    <Box sx={{ 
                                      bgcolor: '#E0E0E0',
                                      borderRadius: 1,
                                      p: 0.5,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}>
                                      {getBehaviorIcon(behavior)}
                                    </Box>
                                  </Tooltip>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {classItem.quiz.taken ? (
                                <Chip
                                  label={`${classItem.quiz.score}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: getEngagementColor(classItem.quiz.score),
                                    color: 'white',
                                    fontWeight: 700
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No quiz
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {classItem.notes}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Fade>

            {/* Export Options */}
            <Fade in timeout={2400}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    📤 Export & Share
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadReport}
                      sx={{
                        bgcolor: '#2196F3',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#1976D2'
                        }
                      }}
                    >
                      Download as PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShareReport}
                      sx={{
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#1976D2',
                          bgcolor: '#E3F2FD'
                        }
                      }}
                    >
                      Share with Parent
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrintReport}
                      sx={{
                        borderColor: '#757575',
                        color: '#757575',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#424242',
                          bgcolor: '#F5F5F5'
                        }
                      }}
                    >
                      Print Report
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </>
        )}
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Report with Parent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will send a copy of your progress report to your parent's email address.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Report Period: {periods[selectedPeriod].range}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              console.log('Sharing report with parent...')
              setShareDialogOpen(false)
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Reports

