import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  Button, 
  IconButton, 
  InputBase, 
  Menu, 
  MenuItem, 
  Chip, 
  Card, 
  CardContent, 
  Badge, 
  Divider, 
  Avatar, 
  Tooltip,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment
} from '@mui/material'
import { 
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ChartIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  NotificationsOff as NotificationsOffIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/apiService'
import { format, formatDistanceToNow } from 'date-fns'

// Icon mapping for notification types
const notificationIcons = {
  quiz: <QuizIcon sx={{ color: '#9c27b0' }} />,
  engagement_positive: <TrendingUpIcon sx={{ color: '#4caf50' }} />,
  engagement_negative: <TrendingDownIcon sx={{ color: '#ff9800' }} />,
  teacher: <PersonIcon sx={{ color: '#4caf50' }} />,
  achievement: <TrophyIcon sx={{ color: '#ffc107' }} />,
  system: <InfoIcon sx={{ color: '#2196f3' }} />,
  calendar: <CalendarIcon sx={{ color: '#009688' }} />,
  performance: <ChartIcon sx={{ color: '#e91e63' }} />
};

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'quiz',
    title: 'New Quiz Available: Mathematics - Quadratic Equations',
    body: 'Your teacher has assigned a new quiz on Quadratic Equations. Complete it by Friday, 5 PM.',
    sender: 'Mr. Johnson',
    subject: 'Mathematics',
    timestamp: new Date(2023, 10, 28, 9, 30),
    read: false,
    priority: true,
    action: 'Take Quiz'
  },
  {
    id: 2,
    type: 'quiz',
    title: 'Quiz Reminder: Complete Physics quiz by 5 PM today',
    body: 'Don\'t forget to complete your Physics quiz on Thermodynamics before the deadline.',
    sender: 'Ms. Williams',
    subject: 'Physics',
    timestamp: new Date(2023, 10, 28, 10, 15),
    read: false,
    priority: true,
    action: 'Take Quiz'
  },
  {
    id: 3,
    type: 'quiz',
    title: 'Quiz Result: You scored 88% on Algebra Quiz!',
    body: 'Great job! You scored 88% on your Algebra quiz. Review your answers to learn from mistakes.',
    sender: 'System',
    subject: 'Mathematics',
    timestamp: new Date(2023, 10, 27, 14, 45),
    read: true,
    priority: false,
    action: 'View Results'
  },
  {
    id: 4,
    type: 'engagement_positive',
    title: 'Great Job! 7-day engagement streak achieved 🔥',
    body: 'You\'ve maintained excellent focus for 7 consecutive days. Keep up the good work!',
    sender: 'System',
    subject: 'Engagement',
    timestamp: new Date(2023, 10, 28, 8, 0),
    read: false,
    priority: false,
    action: 'View Stats'
  },
  {
    id: 5,
    type: 'engagement_negative',
    title: 'Heads up: Your focus dropped below 70% in yesterday\'s Chemistry class',
    body: 'We noticed your attention level was lower than usual. Here are some tips to improve focus.',
    sender: 'System',
    subject: 'Chemistry',
    timestamp: new Date(2023, 10, 27, 16, 30),
    read: true,
    priority: false,
    action: 'View Details'
  },
  {
    id: 6,
    type: 'engagement_positive',
    title: 'Well Done! You improved participation by 15% this week',
    body: 'Your class participation has significantly improved this week. Your teachers have noticed!',
    sender: 'System',
    subject: 'Engagement',
    timestamp: new Date(2023, 10, 26, 15, 0),
    read: true,
    priority: false,
    action: 'View Stats'
  },
  {
    id: 7,
    type: 'engagement_negative',
    title: 'Reminder: You haven\'t attended any classes today',
    body: 'We noticed you haven\'t joined any scheduled classes today. Is everything okay?',
    sender: 'System',
    subject: 'Attendance',
    timestamp: new Date(2023, 10, 28, 13, 0),
    read: false,
    priority: false,
    action: 'View Schedule'
  },
  {
    id: 8,
    type: 'teacher',
    title: 'Mr. Smith commented on your Math performance: "Excellent work on quadratics!"',
    body: 'Your Math teacher left a positive comment on your recent assignment. Check it out!',
    sender: 'Mr. Smith',
    subject: 'Mathematics',
    timestamp: new Date(2023, 10, 27, 11, 20),
    read: false,
    priority: false,
    action: 'View Comment'
  },
  {
    id: 9,
    type: 'teacher',
    title: 'Ms. Johnson shared study materials for tomorrow\'s Physics exam',
    body: 'New study materials have been shared to help you prepare for your upcoming Physics exam.',
    sender: 'Ms. Johnson',
    subject: 'Physics',
    timestamp: new Date(2023, 10, 26, 16, 45),
    read: true,
    priority: false,
    action: 'View Materials'
  },
  {
    id: 10,
    type: 'teacher',
    title: 'Reminder from Mrs. Brown: Project submission due Friday',
    body: 'Don\'t forget to submit your Biology project by Friday. Contact me if you need help.',
    sender: 'Mrs. Brown',
    subject: 'Biology',
    timestamp: new Date(2023, 10, 25, 14, 30),
    read: true,
    priority: true,
    action: 'View Project'
  },
  {
    id: 11,
    type: 'achievement',
    title: '🎉 Achievement Unlocked: Perfect Attendance for October!',
    body: 'Congratulations! You\'ve achieved perfect attendance for the entire month of October.',
    sender: 'System',
    subject: 'Achievements',
    timestamp: new Date(2023, 10, 28, 9, 0),
    read: false,
    priority: false,
    action: 'View Badge'
  },
  {
    id: 12,
    type: 'achievement',
    title: '🏆 New Badge Earned: \'Active Participant\' - Asked 20+ questions this month',
    body: 'Your active participation in class discussions has earned you a new badge!',
    sender: 'System',
    subject: 'Achievements',
    timestamp: new Date(2023, 10, 27, 10, 0),
    read: true,
    priority: false,
    action: 'View Badge'
  },
  {
    id: 13,
    type: 'achievement',
    title: '⭐ Milestone Reached: 50 hours of study time completed!',
    body: 'You\'ve reached an important milestone in your learning journey. Keep it up!',
    sender: 'System',
    subject: 'Achievements',
    timestamp: new Date(2023, 10, 26, 11, 15),
    read: true,
    priority: false,
    action: 'View Stats'
  },
  {
    id: 14,
    type: 'achievement',
    title: '🎯 Goal Completed: Maintained 80%+ engagement for 7 days',
    body: 'You\'ve successfully completed your weekly engagement goal. Set a new goal now!',
    sender: 'System',
    subject: 'Goals',
    timestamp: new Date(2023, 10, 25, 16, 0),
    read: true,
    priority: false,
    action: 'Set New Goal'
  },
  {
    id: 15,
    type: 'system',
    title: 'System Maintenance: Study Eyes will be offline tomorrow 2-3 AM',
    body: 'We\'re performing scheduled maintenance. The system will be unavailable for approximately 1 hour.',
    sender: 'System',
    subject: 'Maintenance',
    timestamp: new Date(2023, 10, 28, 12, 0),
    read: false,
    priority: false,
    action: 'Acknowledge'
  },
  {
    id: 16,
    type: 'system',
    title: 'New Feature: Check out the updated Analytics dashboard!',
    body: 'We\'ve added new visualizations and insights to help you track your progress better.',
    sender: 'System',
    subject: 'Updates',
    timestamp: new Date(2023, 10, 27, 9, 45),
    read: true,
    priority: false,
    action: 'Explore Now'
  },
  {
    id: 17,
    type: 'system',
    title: 'Privacy Update: Review our updated data handling policy',
    body: 'We\'ve updated our privacy policy. Please take a moment to review the changes.',
    sender: 'System',
    subject: 'Privacy',
    timestamp: new Date(2023, 10, 26, 13, 30),
    read: true,
    priority: true,
    action: 'Review Policy'
  },
  {
    id: 18,
    type: 'system',
    title: 'Tip: Did you know you can customize your study goals?',
    body: 'Set personalized study goals to track your progress and stay motivated!',
    sender: 'System',
    subject: 'Tips',
    timestamp: new Date(2023, 10, 25, 10, 30),
    read: true,
    priority: false,
    action: 'Set Goals'
  },
  {
    id: 19,
    type: 'calendar',
    title: 'Upcoming Class: Mathematics at 10:00 AM tomorrow',
    body: 'Don\'t forget your Mathematics class tomorrow morning. Topic: Calculus Fundamentals.',
    sender: 'System',
    subject: 'Mathematics',
    timestamp: new Date(2023, 10, 28, 15, 0),
    read: false,
    priority: false,
    action: 'View Schedule'
  },
  {
    id: 20,
    type: 'calendar',
    title: 'Class Cancelled: Physics class on Oct 30 has been rescheduled',
    body: 'Your Physics class has been rescheduled to Nov 2 at the same time.',
    sender: 'Ms. Williams',
    subject: 'Physics',
    timestamp: new Date(2023, 10, 27, 13, 15),
    read: true,
    priority: true,
    action: 'View Schedule'
  },
  {
    id: 21,
    type: 'calendar',
    title: 'New Class Added: Extra Chemistry session on Friday 3 PM',
    body: 'An additional Chemistry review session has been added to help prepare for next week\'s exam.',
    sender: 'Mr. Davis',
    subject: 'Chemistry',
    timestamp: new Date(2023, 10, 26, 14, 0),
    read: true,
    priority: false,
    action: 'Add to Calendar'
  },
  {
    id: 22,
    type: 'performance',
    title: 'Insight: You perform best in morning classes (9-11 AM)',
    body: 'Based on your engagement data, we\'ve noticed you have higher focus levels during morning sessions.',
    sender: 'System',
    subject: 'Performance',
    timestamp: new Date(2023, 10, 28, 11, 0),
    read: false,
    priority: false,
    action: 'View Insights'
  },
  {
    id: 23,
    type: 'performance',
    title: 'Pattern Detected: Chemistry engagement drops after 20 minutes',
    body: 'We\'ve noticed your focus tends to decrease after 20 minutes in Chemistry classes. Try taking short breaks.',
    sender: 'System',
    subject: 'Chemistry',
    timestamp: new Date(2023, 10, 27, 15, 30),
    read: true,
    priority: false,
    action: 'View Pattern'
  },
  {
    id: 24,
    type: 'performance',
    title: 'Suggestion: Take short breaks every 35 minutes for optimal focus',
    body: 'Based on your study patterns, we recommend taking 5-minute breaks every 35 minutes to maintain focus.',
    sender: 'System',
    subject: 'Study Tips',
    timestamp: new Date(2023, 10, 26, 10, 45),
    read: true,
    priority: false,
    action: 'Learn More'
  }
];

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    realTime: true,
    dailyDigest: false,
    weeklyDigest: false,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    types: {
      quiz: true,
      engagement: true,
      teacher: true,
      achievement: true,
      system: true,
      calendar: true,
      performance: true
    }
  });

  // Stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    pending: notifications.filter(n => !n.read && n.action).length,
    today: notifications.filter(n => {
      const today = new Date();
      return n.timestamp.getDate() === today.getDate() && 
             n.timestamp.getMonth() === today.getMonth() && 
             n.timestamp.getFullYear() === today.getFullYear();
    }).length
  };

  // Filter and sort notifications
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply tab filter
    if (tabValue === 1) { // Unread
      filtered = filtered.filter(n => !n.read);
    } else if (tabValue === 2) { // Important
      filtered = filtered.filter(n => n.priority);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => {
        if (typeFilter === 'quiz') return n.type === 'quiz';
        if (typeFilter === 'engagement') return n.type === 'engagement_positive' || n.type === 'engagement_negative';
        if (typeFilter === 'teacher') return n.type === 'teacher';
        if (typeFilter === 'achievement') return n.type === 'achievement';
        if (typeFilter === 'system') return n.type === 'system';
        if (typeFilter === 'calendar') return n.type === 'calendar';
        if (typeFilter === 'performance') return n.type === 'performance';
        return true;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.body.toLowerCase().includes(query) ||
        n.sender.toLowerCase().includes(query) ||
        n.subject.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === 'priority') {
      filtered.sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return b.timestamp - a.timestamp;
      });
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, tabValue, sortBy, typeFilter, searchQuery]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Clear all read notifications
  const clearAllRead = () => {
    setNotifications(prev => 
      prev.filter(n => !n.read)
    );
  };

  // Toggle notification priority
  const togglePriority = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, priority: !n.priority } : n)
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== id)
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timestamp >= today) {
      return `Today at ${format(timestamp, 'h:mm a')}`;
    } else if (timestamp >= yesterday) {
      return `Yesterday at ${format(timestamp, 'h:mm a')}`;
    } else {
      return format(timestamp, 'MMM d, yyyy');
    }
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  // Handle settings open
  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  // Handle settings close
  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Handle settings change
  const handleSettingsChange = (section, setting) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    setNotificationSettings(prev => ({
      ...prev,
      [section]: section === 'types' || section === 'quietHours'
        ? { ...prev[section], [setting]: value }
        : value
    }));
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    if (type === 'engagement_positive') return notificationIcons.engagement_positive;
    if (type === 'engagement_negative') return notificationIcons.engagement_negative;
    return notificationIcons[type] || <NotificationsIcon sx={{ color: '#2196f3' }} />;
  };

  // Get notification color
  const getNotificationColor = (type) => {
    if (type === 'quiz') return '#9c27b0';
    if (type === 'engagement_positive') return '#4caf50';
    if (type === 'engagement_negative') return '#ff9800';
    if (type === 'teacher') return '#4caf50';
    if (type === 'achievement') return '#ffc107';
    if (type === 'system') return '#2196f3';
    if (type === 'calendar') return '#009688';
    if (type === 'performance') return '#e91e63';
    return '#2196f3';
  };

  // Priority notifications
  const priorityNotifications = filteredNotifications.filter(n => n.priority);
  
  // Regular notifications (non-priority)
  const regularNotifications = filteredNotifications.filter(n => !n.priority);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ color: '#2196f3' }} />
          Notifications
          <Chip 
            label={`${stats.total} notifications`} 
            size="small" 
            sx={{ 
              ml: 2, 
              bgcolor: '#2196f3', 
              color: 'white',
              fontWeight: 500
            }} 
          />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with alerts, messages, and important updates about your learning journey.
        </Typography>
      </Box>
      
      {/* Controls Section */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: { xs: 2, md: 0 } }}
            >
              <Tab label="All" />
              <Tab 
                label={
                  <Badge badgeContent={stats.unread} color="primary">
                    Unread
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={priorityNotifications.length} color="warning">
                    Important
                  </Badge>
                } 
              />
            </Tabs>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  displayEmpty
                  variant="outlined"
                  sx={{ borderRadius: '8px' }}
                  startAdornment={
                    <InputAdornment position="start">
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Sort:
                      </Typography>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  displayEmpty
                  variant="outlined"
                  sx={{ borderRadius: '8px' }}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="quiz">Quizzes</MenuItem>
                  <MenuItem value="engagement">Engagement</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                  <MenuItem value="achievement">Achievements</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="calendar">Calendar</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                startIcon={<CheckCircleIcon />}
                sx={{ 
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                Mark all read
              </Button>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={clearAllRead}
                disabled={notifications.filter(n => n.read).length === 0}
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    bgcolor: 'rgba(244, 67, 54, 0.04)'
                  }
                }}
              >
                Clear read
              </Button>
              
              <IconButton 
                size="small" 
                onClick={handleSettingsOpen}
                sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '8px'
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <InputBase
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={handleSearchChange}
            startAdornment={
              <SearchIcon color="action" sx={{ mr: 1 }} />
            }
            fullWidth
            sx={{ 
              p: 1, 
              borderRadius: '8px', 
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.06)'
              }
            }}
          />
        </Box>
      </Paper>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              borderRadius: '12px', 
              bgcolor: 'rgba(33, 150, 243, 0.08)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: '#2196f3' }}>
              <VisibilityOffIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {stats.unread} Unread
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.unread > 0 ? 'You have unread notifications' : 'All caught up!'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              borderRadius: '12px', 
              bgcolor: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: '#ff9800' }}>
              <PinIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {stats.pending} Require Action
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.pending > 0 ? 'Items need your attention' : 'No pending actions'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              borderRadius: '12px', 
              bgcolor: 'rgba(76, 175, 80, 0.08)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: '#4caf50' }}>
              <CalendarIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {stats.today} New Today
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(), 'EEEE, MMMM d')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Notifications Feed */}
      <Box sx={{ mb: 4 }}>
        {/* Empty state */}
        {filteredNotifications.length === 0 && (
          <Paper 
            sx={{ 
              p: 5, 
              textAlign: 'center',
              borderRadius: '12px',
              bgcolor: '#f5f5f5'
            }}
          >
            <NotificationsOffIcon sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {searchQuery 
                ? 'No matching notifications found' 
                : tabValue === 1 
                  ? 'You\'re all caught up! 🎉' 
                  : tabValue === 2 
                    ? 'No important notifications' 
                    : 'No notifications yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery 
                ? 'Try adjusting your search or filters' 
                : 'We\'ll notify you when something important happens'}
            </Typography>
          </Paper>
        )}
        
        {/* Priority Notifications */}
        {priorityNotifications.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                color: '#f57c00',
                fontWeight: 600
              }}
            >
              <StarIcon sx={{ mr: 1, fontSize: 20 }} />
              Priority Notifications
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {priorityNotifications.map((notification) => (
                <Paper
                  key={notification.id}
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    borderLeft: `4px solid ${notification.read ? '#ffc107' : '#ff9800'}`,
                    bgcolor: notification.read ? 'rgba(255, 193, 7, 0.05)' : 'rgba(255, 152, 0, 0.08)',
                    display: 'flex',
                    gap: 2,
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {/* Left: Icon */}
                  <Avatar
                    sx={{
                      bgcolor: `${getNotificationColor(notification.type)}20`,
                      color: getNotificationColor(notification.type),
                      width: 48,
                      height: 48
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  
                  {/* Center: Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: notification.read ? 500 : 700,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={getRelativeTime(notification.timestamp)}
                        size="small"
                        sx={{
                          ml: 1,
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: 'rgba(0, 0, 0, 0.06)'
                        }}
                      />
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {notification.body}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={notification.subject}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: `${getNotificationColor(notification.type)}10`,
                          color: getNotificationColor(notification.type)
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        From: {notification.sender}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Right: Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: getNotificationColor(notification.type),
                        '&:hover': {
                          bgcolor: getNotificationColor(notification.type),
                          filter: 'brightness(0.9)'
                        },
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 2
                      }}
                    >
                      {notification.action}
                    </Button>
                    
                    <Box>
                      <IconButton
                        size="small"
                        onClick={handleMenuOpen}
                        aria-controls={`notification-menu-${notification.id}`}
                        aria-haspopup="true"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        id={`notification-menu-${notification.id}`}
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem onClick={() => {
                          markAsRead(notification.id);
                          handleMenuClose();
                        }}>
                          {notification.read ? 'Mark as unread' : 'Mark as read'}
                        </MenuItem>
                        <MenuItem onClick={() => {
                          togglePriority(notification.id);
                          handleMenuClose();
                        }}>
                          Unpin this notification
                        </MenuItem>
                        <MenuItem onClick={() => {
                          deleteNotification(notification.id);
                          handleMenuClose();
                        }}>
                          Delete
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                          Mute similar notifications
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                  
                  {/* Unread indicator */}
                  {!notification.read && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: -2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#2196f3'
                      }}
                    />
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Regular Notifications */}
        {regularNotifications.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {regularNotifications.map((notification) => (
              <Paper
                key={notification.id}
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  borderLeft: `4px solid ${notification.read ? 'transparent' : '#2196f3'}`,
                  bgcolor: notification.read ? 'rgba(0, 0, 0, 0.02)' : 'white',
                  display: 'flex',
                  gap: 2,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Left: Icon */}
                <Avatar
                  sx={{
                    bgcolor: `${getNotificationColor(notification.type)}20`,
                    color: getNotificationColor(notification.type),
                    width: 48,
                    height: 48
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
                
                {/* Center: Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: notification.read ? 500 : 700,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Chip
                      label={getRelativeTime(notification.timestamp)}
                      size="small"
                      sx={{
                        ml: 1,
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: 'rgba(0, 0, 0, 0.06)'
                      }}
                    />
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {notification.body}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={notification.subject}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: `${getNotificationColor(notification.type)}10`,
                        color: getNotificationColor(notification.type)
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      From: {notification.sender}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Right: Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: getNotificationColor(notification.type),
                      color: getNotificationColor(notification.type),
                      '&:hover': {
                        borderColor: getNotificationColor(notification.type),
                        bgcolor: `${getNotificationColor(notification.type)}10`
                      },
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 2
                    }}
                  >
                    {notification.action}
                  </Button>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={handleMenuOpen}
                      aria-controls={`notification-menu-${notification.id}`}
                      aria-haspopup="true"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                      id={`notification-menu-${notification.id}`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem onClick={() => {
                        markAsRead(notification.id);
                        handleMenuClose();
                      }}>
                        {notification.read ? 'Mark as unread' : 'Mark as read'}
                      </MenuItem>
                      <MenuItem onClick={() => {
                        togglePriority(notification.id);
                        handleMenuClose();
                      }}>
                        {notification.priority ? 'Unpin this notification' : 'Pin this notification'}
                      </MenuItem>
                      <MenuItem onClick={() => {
                        deleteNotification(notification.id);
                        handleMenuClose();
                      }}>
                        Delete
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        Mute similar notifications
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
                
                {/* Unread indicator */}
                {!notification.read && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: -2,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#2196f3'
                    }}
                  />
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            Notification Preferences
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Delivery Methods
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.email}
                  onChange={handleSettingsChange('email')}
                  color="primary"
                />
              }
              label="Email notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.push}
                  onChange={handleSettingsChange('push')}
                  color="primary"
                />
              }
              label="Push notifications"
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Frequency
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.realTime}
                  onChange={handleSettingsChange('realTime')}
                  color="primary"
                />
              }
              label="Real-time notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.dailyDigest}
                  onChange={handleSettingsChange('dailyDigest')}
                  color="primary"
                />
              }
              label="Daily digest"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.weeklyDigest}
                  onChange={handleSettingsChange('weeklyDigest')}
                  color="primary"
                />
              }
              label="Weekly summary"
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Quiet Hours
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.quietHours.enabled}
                  onChange={handleSettingsChange('quietHours', 'enabled')}
                  color="primary"
                />
              }
              label="Enable quiet hours"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="Start time"
                  type="time"
                  value={notificationSettings.quietHours.start}
                  onChange={handleSettingsChange('quietHours', 'start')}
                  disabled={!notificationSettings.quietHours.enabled}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End time"
                  type="time"
                  value={notificationSettings.quietHours.end}
                  onChange={handleSettingsChange('quietHours', 'end')}
                  disabled={!notificationSettings.quietHours.enabled}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Notification Types
          </Typography>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.quiz}
                  onChange={handleSettingsChange('types', 'quiz')}
                  color="primary"
                />
              }
              label="Quiz notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.engagement}
                  onChange={handleSettingsChange('types', 'engagement')}
                  color="primary"
                />
              }
              label="Engagement alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.teacher}
                  onChange={handleSettingsChange('types', 'teacher')}
                  color="primary"
                />
              }
              label="Teacher messages"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.achievement}
                  onChange={handleSettingsChange('types', 'achievement')}
                  color="primary"
                />
              }
              label="Achievements & milestones"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.system}
                  onChange={handleSettingsChange('types', 'system')}
                  color="primary"
                />
              }
              label="System updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.calendar}
                  onChange={handleSettingsChange('types', 'calendar')}
                  color="primary"
                />
              }
              label="Schedule & calendar"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.types.performance}
                  onChange={handleSettingsChange('types', 'performance')}
                  color="primary"
                />
              }
              label="Performance insights"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSettingsClose} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Notifications

