import React, { useState } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Modal,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Divider,
  Alert,
} from '@mui/material'
import {
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PlayArrow as StartIcon,
  Visibility as ReviewIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  EmojiEvents as TrophyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Science as ScienceIcon,
  Calculate as MathIcon,
  Book as BookIcon,
  Language as LanguageIcon,
} from '@mui/icons-material'

const Quizzes = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0) // 0: All, 1: Completed, 2: Pending
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizStartTime, setQuizStartTime] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Mock data - Stats
  const stats = {
    totalQuizzes: 24,
    averageScore: 82,
    pendingCount: 3,
  }

  // Mock data - Pending quizzes
  const pendingQuizzes = [
    {
      id: 'p1',
      subject: 'Mathematics',
      title: 'Linear Equations Quiz',
      generatedDate: 'Oct 29, 10:30 AM',
      questionCount: 5,
      estimatedTime: '~5 minutes',
      reason: 'Low engagement detected',
      questions: [
        { id: 1, question: 'Solve for x: 2x + 5 = 15', options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'], correct: 0 },
        { id: 2, question: 'What is the slope of y = 3x + 2?', options: ['2', '3', '5', '1'], correct: 1 },
        { id: 3, question: 'Simplify: 4(x + 3)', options: ['4x + 3', '4x + 12', 'x + 12', '4x + 7'], correct: 1 },
        { id: 4, question: 'Solve: x/2 = 8', options: ['x = 4', 'x = 16', 'x = 10', 'x = 6'], correct: 1 },
        { id: 5, question: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correct: 1 },
      ]
    },
    {
      id: 'p2',
      subject: 'Physics',
      title: "Newton's Laws Review",
      generatedDate: 'Oct 28, 2:45 PM',
      questionCount: 4,
      estimatedTime: '~4 minutes',
      reason: 'Teacher requested check',
      questions: [
        { id: 1, question: "What is Newton's First Law?", options: ['F = ma', 'Object at rest stays at rest', 'Action-reaction', 'Gravity'], correct: 1 },
        { id: 2, question: 'Force equals mass times...?', options: ['Velocity', 'Acceleration', 'Distance', 'Time'], correct: 1 },
        { id: 3, question: 'Unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1 },
        { id: 4, question: 'If mass doubles, force...?', options: ['Halves', 'Doubles', 'Stays same', 'Quadruples'], correct: 1 },
      ]
    },
    {
      id: 'p3',
      subject: 'Chemistry',
      title: 'Periodic Table Quiz',
      generatedDate: 'Oct 27, 11:20 AM',
      questionCount: 3,
      estimatedTime: '~3 minutes',
      reason: 'Topic completion',
      questions: [
        { id: 1, question: 'Symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
        { id: 2, question: 'Atomic number of Carbon?', options: ['6', '12', '8', '14'], correct: 0 },
        { id: 3, question: 'Most reactive metal?', options: ['Iron', 'Sodium', 'Francium', 'Gold'], correct: 2 },
      ]
    },
  ]

  // Mock data - Completed quizzes
  const completedQuizzes = [
    { id: 'c1', subject: 'Mathematics', title: 'Quadratic Equations', date: 'Oct 28, 2:35 PM', score: 88, total: 4, answered: 4, time: '3m 24s' },
    { id: 'c2', subject: 'Physics', title: 'Motion & Velocity', date: 'Oct 28, 11:15 AM', score: 92, total: 5, answered: 5, time: '4m 10s' },
    { id: 'c3', subject: 'Chemistry', title: 'Chemical Bonding', date: 'Oct 27, 3:20 PM', score: 75, total: 4, answered: 3, time: '5m 45s' },
    { id: 'c4', subject: 'Mathematics', title: 'Algebra Basics', date: 'Oct 27, 10:05 AM', score: 95, total: 4, answered: 4, time: '2m 50s' },
    { id: 'c5', subject: 'English', title: 'Grammar Quiz', date: 'Oct 26, 1:30 PM', score: 80, total: 5, answered: 4, time: '4m 30s' },
    { id: 'c6', subject: 'Physics', title: 'Force & Energy', date: 'Oct 26, 11:00 AM', score: 85, total: 4, answered: 4, time: '3m 55s' },
    { id: 'c7', subject: 'Mathematics', title: 'Trigonometry', date: 'Oct 25, 2:15 PM', score: 78, total: 4, answered: 3, time: '6m 20s' },
    { id: 'c8', subject: 'Chemistry', title: 'Acids & Bases', date: 'Oct 25, 12:40 PM', score: 90, total: 5, answered: 5, time: '4m 05s' },
    { id: 'c9', subject: 'Mathematics', title: 'Geometry', date: 'Oct 24, 10:20 AM', score: 82, total: 5, answered: 4, time: '5m 10s' },
  ]

  // Subject performance
  const subjectPerformance = [
    { subject: 'Mathematics', average: 85, count: 12, color: '#2196F3' },
    { subject: 'Physics', average: 83, count: 8, color: '#9C27B0' },
    { subject: 'Chemistry', average: 81, count: 4, color: '#4CAF50' },
    { subject: 'English', average: 80, count: 2, color: '#FF9800' },
  ]

  // Helper functions
  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'
    if (score >= 70) return '#FF9800'
    return '#F44336'
  }

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Mathematics': return <MathIcon />
      case 'Physics': return <ScienceIcon />
      case 'Chemistry': return <ScienceIcon />
      case 'English': return <LanguageIcon />
      default: return <BookIcon />
    }
  }

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Mathematics': return '#2196F3'
      case 'Physics': return '#9C27B0'
      case 'Chemistry': return '#4CAF50'
      case 'English': return '#FF9800'
      default: return '#757575'
    }
  }

  // Filter quizzes based on tab and filters
  const getFilteredQuizzes = () => {
    let quizzes = []
    
    if (activeTab === 0) { // All
      quizzes = [...pendingQuizzes.map(q => ({ ...q, status: 'pending' })), ...completedQuizzes.map(q => ({ ...q, status: 'completed' }))]
    } else if (activeTab === 1) { // Completed
      quizzes = completedQuizzes.map(q => ({ ...q, status: 'completed' }))
    } else { // Pending
      quizzes = pendingQuizzes.map(q => ({ ...q, status: 'pending' }))
    }

    // Filter by subject
    if (selectedSubject !== 'all') {
      quizzes = quizzes.filter(q => q.subject === selectedSubject)
    }

    // Filter by search
    if (searchQuery) {
      quizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return quizzes
  }

  // Start quiz
  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers({})
    setQuizStartTime(Date.now())
    setShowResults(false)
    setQuizModalOpen(true)
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex })
  }

  // Next question
  const handleNextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show results
      setShowResults(true)
    }
  }

  // Calculate score
  const calculateScore = () => {
    let correct = 0
    currentQuiz.questions.forEach((q, idx) => {
      if (answers[q.id] === q.correct) correct++
    })
    return Math.round((correct / currentQuiz.questions.length) * 100)
  }

  // Close quiz modal
  const handleCloseQuiz = () => {
    setQuizModalOpen(false)
    setCurrentQuiz(null)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
  }

  const filteredQuizzes = getFilteredQuizzes()

  return (
    <Box sx={{ minHeight: '100vh', background: '#F5F5F5', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        color: 'white',
        py: 4,
        px: 3,
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <QuizIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Quizzes
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            Test your knowledge with AI-generated quizzes and track your progress
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Top Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.15)',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(33, 150, 243, 0.25)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #2196F3, #1976D2)', borderRadius: '8px', p: 0.5, display: 'flex' }}>
                    <QuizIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total Quizzes
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#2196F3' }}>
                  {stats.totalQuizzes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(76, 175, 80, 0.25)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', borderRadius: '8px', p: 0.5, display: 'flex' }}>
                    <TrophyIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Average Score
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#4CAF50' }}>
                  {stats.averageScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Great work!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(255, 152, 0, 0.25)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #FF9800, #F57C00)', borderRadius: '8px', p: 0.5, display: 'flex' }}>
                    <ClockIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Pending Quizzes
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#FF9800' }}>
                  {stats.pendingCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waiting for you
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Action - Pending Quiz Alert */}
        {pendingQuizzes.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              border: '2px solid rgba(33, 150, 243, 0.3)',
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
            action={
              <Button 
                variant="contained" 
                size="large"
                startIcon={<StartIcon />}
                onClick={() => handleStartQuiz(pendingQuizzes[0])}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  fontWeight: 700,
                  px: 3,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2, #1565C0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
                  }
                }}
              >
                Start Now
              </Button>
            }
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {pendingQuizzes[0].subject} Quiz Ready!
            </Typography>
            <Typography variant="body2">
              {pendingQuizzes[0].title} • {pendingQuizzes[0].questionCount} questions • {pendingQuizzes[0].estimatedTime}
            </Typography>
          </Alert>
        )}

        {/* Filters and Tabs */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label="All" sx={{ fontWeight: 600, textTransform: 'none' }} />
                <Tab label="Completed" sx={{ fontWeight: 600, textTransform: 'none' }} />
                <Tab label="Pending" sx={{ fontWeight: 600, textTransform: 'none' }} />
              </Tabs>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                label="Subject"
              >
                <MenuItem value="all">All Subjects</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="English">English</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Quiz Cards Grid */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {filteredQuizzes.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
                    <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No quizzes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or check back later for new quizzes
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <Grid item xs={12} sm={6} key={quiz.id}>
                    {quiz.status === 'pending' ? (
                      // Pending Quiz Card
                      <Card sx={{
                        borderRadius: '16px',
                        border: `2px solid ${getSubjectColor(quiz.subject)}40`,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        boxShadow: `0 4px 12px ${getSubjectColor(quiz.subject)}20`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${getSubjectColor(quiz.subject)}30`,
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Chip 
                              icon={getSubjectIcon(quiz.subject)}
                              label={quiz.subject}
                              size="small"
                              sx={{ 
                                background: `linear-gradient(135deg, ${getSubjectColor(quiz.subject)}, ${getSubjectColor(quiz.subject)}dd)`,
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            <Chip label="Pending" size="small" color="warning" sx={{ fontWeight: 600 }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {quiz.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Generated {quiz.generatedDate}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Chip label={`${quiz.questionCount} questions`} size="small" variant="outlined" />
                            <Chip label={quiz.estimatedTime} size="small" variant="outlined" icon={<ClockIcon />} />
                          </Box>
                          <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                            <Typography variant="caption">
                              {quiz.reason}
                            </Typography>
                          </Alert>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={() => handleStartQuiz(quiz)}
                            sx={{
                              background: `linear-gradient(135deg, ${getSubjectColor(quiz.subject)}, ${getSubjectColor(quiz.subject)}dd)`,
                              fontWeight: 700,
                              py: 1.5,
                              borderRadius: '12px',
                              boxShadow: `0 4px 12px ${getSubjectColor(quiz.subject)}40`,
                              '&:hover': {
                                boxShadow: `0 6px 20px ${getSubjectColor(quiz.subject)}50`,
                              }
                            }}
                          >
                            Start Quiz
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      // Completed Quiz Card
                      <Card sx={{
                        borderRadius: '16px',
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Chip 
                              icon={getSubjectIcon(quiz.subject)}
                              label={quiz.subject}
                              size="small"
                              sx={{ 
                                background: `linear-gradient(135deg, ${getSubjectColor(quiz.subject)}, ${getSubjectColor(quiz.subject)}dd)`,
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h4" sx={{ fontWeight: 800, color: getScoreColor(quiz.score), lineHeight: 1 }}>
                                {quiz.score}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {quiz.answered}/{quiz.total}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {quiz.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            {quiz.date} • {quiz.time}
                          </Typography>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ReviewIcon />}
                            sx={{
                              borderRadius: '12px',
                              fontWeight: 600,
                              borderColor: getSubjectColor(quiz.subject),
                              color: getSubjectColor(quiz.subject),
                              '&:hover': {
                                borderColor: getSubjectColor(quiz.subject),
                                background: `${getSubjectColor(quiz.subject)}10`,
                              }
                            }}
                          >
                            Review Answers
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

        </Grid>
      </Container>

      {/* Quiz Taking Modal */}
      <Modal
        open={quizModalOpen}
        onClose={handleCloseQuiz}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 700,
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          p: 4,
        }}>
          {currentQuiz && (
            <>
              {!showResults ? (
                <>
                  {/* Quiz Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Chip 
                        label={currentQuiz.subject}
                        size="small"
                        sx={{ 
                          background: `linear-gradient(135deg, ${getSubjectColor(currentQuiz.subject)}, ${getSubjectColor(currentQuiz.subject)}dd)`,
                          color: 'white',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {currentQuiz.title}
                      </Typography>
                    </Box>
                    <IconButton onClick={handleCloseQuiz}>
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Question {currentQuestion + 1} of {currentQuiz.questions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(((currentQuestion + 1) / currentQuiz.questions.length) * 100)}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={((currentQuestion + 1) / currentQuiz.questions.length) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getSubjectColor(currentQuiz.subject)}, ${getSubjectColor(currentQuiz.subject)}dd)`,
                        }
                      }}
                    />
                  </Box>

                  {/* Question */}
                  <Paper sx={{ p: 3, mb: 3, background: '#F5F5F5', borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      {currentQuiz.questions[currentQuestion].question}
                    </Typography>

                    <RadioGroup
                      value={answers[currentQuiz.questions[currentQuestion].id] ?? ''}
                      onChange={(e) => handleAnswerSelect(currentQuiz.questions[currentQuestion].id, parseInt(e.target.value))}
                    >
                      {currentQuiz.questions[currentQuestion].options.map((option, idx) => (
                        <FormControlLabel
                          key={idx}
                          value={idx}
                          control={<Radio />}
                          label={option}
                          sx={{
                            mb: 1,
                            p: 2,
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: answers[currentQuiz.questions[currentQuestion].id] === idx ? getSubjectColor(currentQuiz.subject) : '#E0E0E0',
                            background: answers[currentQuiz.questions[currentQuestion].id] === idx ? `${getSubjectColor(currentQuiz.subject)}10` : 'white',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: getSubjectColor(currentQuiz.subject),
                              background: `${getSubjectColor(currentQuiz.subject)}05`,
                            }
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </Paper>

                  {/* Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={currentQuestion < currentQuiz.questions.length - 1 ? <NextIcon /> : <CheckIcon />}
                      onClick={handleNextQuestion}
                      disabled={answers[currentQuiz.questions[currentQuestion].id] === undefined}
                      sx={{
                        background: `linear-gradient(135deg, ${getSubjectColor(currentQuiz.subject)}, ${getSubjectColor(currentQuiz.subject)}dd)`,
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        boxShadow: `0 4px 12px ${getSubjectColor(currentQuiz.subject)}40`,
                      }}
                    >
                      {currentQuestion < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  {/* Results Screen */}
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%', 
                      background: `linear-gradient(135deg, ${getScoreColor(calculateScore())}, ${getScoreColor(calculateScore())}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 3,
                      boxShadow: `0 8px 24px ${getScoreColor(calculateScore())}40`,
                    }}>
                      <Typography variant="h2" sx={{ fontWeight: 900, color: 'white' }}>
                        {calculateScore()}%
                      </Typography>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {calculateScore() >= 90 ? '🎉 Excellent Work!' : calculateScore() >= 70 ? '👍 Great Job!' : '💪 Keep Learning!'}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      You got {currentQuiz.questions.filter((q, idx) => answers[q.id] === q.correct).length} out of {currentQuiz.questions.length} questions correct
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* Question Review */}
                    <Box sx={{ textAlign: 'left', mt: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                        Review Your Answers
                      </Typography>
                      {currentQuiz.questions.map((q, idx) => {
                        const isCorrect = answers[q.id] === q.correct
                        return (
                          <Paper key={idx} sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: '12px',
                            border: `2px solid ${isCorrect ? '#4CAF50' : '#F44336'}`,
                            background: isCorrect ? '#E8F5E9' : '#FFEBEE',
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: isCorrect ? '#4CAF50' : '#F44336',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                                  {idx + 1}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                  {q.question}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Your answer: <strong>{q.options[answers[q.id]]}</strong>
                                </Typography>
                                {!isCorrect && (
                                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                                    Correct answer: {q.options[q.correct]}
                                  </Typography>
                                )}
                              </Box>
                              {isCorrect ? (
                                <CheckIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                              ) : (
                                <CloseIcon sx={{ color: '#F44336', fontSize: 28 }} />
                              )}
                            </Box>
                          </Paper>
                        )
                      })}
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleCloseQuiz}
                      sx={{
                        mt: 4,
                        background: `linear-gradient(135deg, ${getSubjectColor(currentQuiz.subject)}, ${getSubjectColor(currentQuiz.subject)}dd)`,
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: '12px',
                      }}
                    >
                      Close
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default Quizzes

