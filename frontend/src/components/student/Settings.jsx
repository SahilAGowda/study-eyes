import React, { useState } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  TextField,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  Checkbox,
  Tooltip,
  InputAdornment,
  Stack,
  Snackbar
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Visibility as EyeIcon,
  HealthAndSafety as HealthIcon,
  Timer as TimerIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  AccessTime as AccessTimeIcon,
  Videocam as CameraIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  DataUsage as DataIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Mic as MicIcon,
  Tune as TuneIcon,
  AccessTime as TimeIcon,
  DoNotDisturb as DoNotDisturbIcon,
  AddAPhoto as AddPhotoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Language as LanguageIcon,
  Public as PublicIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  Download as DownloadIcon,
  DeleteForever as DeleteForeverIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Smartphone as SmartphoneIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

// Constants for dropdown options
const GRADE_OPTIONS = [
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 
  'Grade 11', 'Grade 12', 'College Freshman', 'College Sophomore',
  'College Junior', 'College Senior', 'Graduate Student'
];

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 
  'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian'
];

const TIMEZONE_OPTIONS = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00',
  'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00',
  'UTC+12:00'
];

const DATA_RETENTION_OPTIONS = [
  '1 month', '3 months', '6 months', '1 year', '2 years', 'Until manually deleted'
];

const NOTIFICATION_FREQUENCY_OPTIONS = [
  'Instant', 'Hourly', 'Daily', 'Weekly', 'Real-time', 'As needed'
];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' }
];

// Mock parent emails for demonstration
const PARENT_EMAILS = [
  { email: 'parent1@example.com', verified: true },
  { email: 'parent2@example.com', verified: false }
];

// Auto-delete options
const AUTO_DELETE_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '30days', label: 'After 30 days' },
  { value: '90days', label: 'After 90 days' },
  { value: '1year', label: 'After 1 year' }
];

// Notification frequency options
const NOTIFICATION_FREQUENCY = {
  quiz: [
    { value: 'immediately', label: 'Immediately' },
    { value: 'daily', label: 'Daily Summary' },
    { value: 'weekly', label: 'Weekly Summary' }
  ],
  engagement: [
    { value: 'realtime', label: 'Real-time Updates' },
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' }
  ],
  teacher: [
    { value: 'immediately', label: 'Immediately' },
    { value: 'daily', label: 'Once Daily' },
    { value: 'weekly', label: 'Weekly Summary' }
  ],
  achievement: [
    { value: 'immediately', label: 'Immediately' },
    { value: 'daily', label: 'Daily Roundup' },
    { value: 'weekly', label: 'Weekly Roundup' }
  ],
  schedule: [
    { value: 'immediately', label: 'Immediately' },
    { value: 'daily', label: 'Daily Schedule' },
    { value: 'weekly', label: 'Weekly Schedule' }
  ],
  system: [
    { value: 'critical', label: 'Critical Only' },
    { value: 'important', label: 'Important & Critical' },
    { value: 'all', label: 'All Updates' }
  ]
};

// Connected accounts data
const CONNECTED_ACCOUNTS = [
  {
    platform: 'Google',
    connected: false,
    email: '',
    icon: <GoogleIcon />,
    color: '#DB4437'
  },
  {
    platform: 'Microsoft',
    connected: false,
    email: '',
    icon: <MicrosoftIcon />,
    color: '#00A4EF'
  }
];

// Settings sections
const SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: <PersonIcon /> },
  { id: 'privacy', label: 'Privacy & Data', icon: <DataIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'study', label: 'Study Preferences', icon: <TuneIcon /> },
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
  { id: 'camera', label: 'Camera & Audio', icon: <CameraIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'help', label: 'Help & Support', icon: <HelpIcon /> },
  { id: 'about', label: 'About', icon: <InfoIcon /> }
];

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');
  const [openDialog, setOpenDialog] = useState('');
  
  // Unified settings state
  const [settings, setSettings] = useState({
    profile: {
      fullName: 'Test User',
      email: 'test1@student.com',
      studentId: 'STU-2024-001',
      grade: 'Grade 10',
      dob: '',
      phone: '',
      username: 'test1',
      language: 'English',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      avatar: null,
      connectedAccounts: {
        google: false,
        microsoft: false
      },
      parentEmails: []
    },
    privacy: {
      masterToggle: true,
      videoAnalysis: true,
      audioAnalysis: true,
      physiologicalSignals: true,
      screenActivity: true,
      dataRetention: '6 months',
      anonymousBenchmarking: false,
      shareWithTeachers: true,
      shareWithParents: true,
      participateInResearch: false,
      saveSessionRecordings: false,
      autoDeleteRecordings: '7 days'
    },
    notifications: {
      inApp: true,
      email: true,
      sms: false,
      push: true,
      eyeBreakReminder: true,
      postureAlert: true,
      studyGoalReminder: true,
      dailySummary: true,
      sessionAlerts: true,
      achievementAlerts: true,
      types: {
        quiz: { enabled: true, frequency: 'Instant' },
        engagement: { enabled: true, frequency: 'Real-time' },
        teacher: { enabled: true, frequency: 'Instant' },
        achievement: { enabled: true, frequency: 'Instant' },
        schedule: { enabled: true, frequency: 'Instant' },
        system: { enabled: true, frequency: 'As needed' }
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
        days: {
          mon: false, tue: false, wed: false,
          thu: false, fri: false, sat: true, sun: true
        }
      },
      sound: {
        enabled: true,
        volume: 70
      }
    },
    study: {
      focusMode: false,
      dailyGoal: 4,
      weeklyGoal: 20,
      sessionReminder: 30,
      ai: {
        attentionTracking: true,
        faceDetection: true,
        postureAnalysis: true
      }
    },
    eyeBreak: {
      enabled: true,
      interval: 20,
      duration: 20
    },
    posture: {
      enabled: true,
      sensitivity: 75
    }
  });

  // Core settings handlers
  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category, subcategory, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category]?.[subcategory],
          [setting]: value
        }
      }
    }));
  };

  // Input type handlers
  const handleSwitchChange = (category, setting) => (event) => {
    handleSettingChange(category, setting, event.target.checked);
  };

  const handleSliderChange = (category, setting) => (event, value) => {
    handleSettingChange(category, setting, value);
  };

  const handleNumberChange = (category, setting) => (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      handleSettingChange(category, setting, value);
    }
  };

  // Specialized notification handlers
  const handleNotificationSettingChange = (type, field, value) => {
    handleNestedSettingChange('notifications', 'types', type, {
      ...settings.notifications.types[type],
      [field]: value
    });
  };

  const handleQuietHoursSettingChange = (field, value) => {
    handleNestedSettingChange('notifications', 'quietHours', field, value);
  };

  // Handler for quiet hours day toggle
  const handleQuietHoursDayToggle = (day) => {
    // Implementation for quiet hours toggle
    console.log('Toggling quiet hours for:', day);
  };

  const [passwordValues, setPasswordValues] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false
  });

  // Password state only (everything else is in settings)
  const [passwordValues, setPasswordValues] = useState({
    eyeBreak: {
      interval: 20, // minutes
      duration: 20, // seconds
      enabled: true
    },
    posture: {
      sensitivity: 75,
      enabled: true
    },
    study: {
      dailyGoal: 8, // hours
      weeklyGoal: 40, // hours
      sessionReminder: 30 // minutes
    },
    ai: {
      attentionTracking: true,
      faceDetection: true,
      postureAnalysis: true
    }
  });

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Handle profile change
  const handleProfileChange = (field) => (event) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle privacy change
  const handlePrivacyChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPrivacy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification change
  const handleNotificationChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification type change
  const handleNotificationTypeChange = (type, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setNotifications(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: {
          ...prev.types[type],
          [field]: value
        }
      }
    }));
  };

  // Handle quiet hours change
  const handleQuietHoursChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setNotifications(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  // Handle quiet hours days change
  const handleQuietHoursDayChange = (day) => (event) => {
    setNotifications(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        days: {
          ...prev.quietHours.days,
          [day]: event.target.checked
        }
      }
    }));
  };

  // Handle study preferences change
  const handleStudyPrefChange = (category, setting) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : (event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value);
    
    setStudyPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // Handle password change
  const handlePasswordChange = (field) => (event) => {
    setPasswordValues(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordValues(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle dialog open
  const handleOpenDialog = (dialog) => {
    setOpenDialog(dialog);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog('');
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // Simulate saving settings
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Handle add parent email
  const handleAddParentEmail = (email) => {
    if (email && !profile.parentEmails.includes(email)) {
      setProfile(prev => ({
        ...prev,
        parentEmails: [...prev.parentEmails, email]
      }));
    }
  };

  // Handle remove parent email
  const handleRemoveParentEmail = (email) => {
    setProfile(prev => ({
      ...prev,
      parentEmails: prev.parentEmails.filter(e => e !== email)
    }));
  };

  // Handle avatar change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar remove
  const handleAvatarRemove = () => {
    setProfile(prev => ({
      ...prev,
      avatar: null
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontWeight: 700,
            color: '#2196f3'
          }}
        >
          <SettingsIcon sx={{ fontSize: 32 }} />
          Settings
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          Customize your Study Eyes experience and manage your account
        </Typography>
      </Box>

      {saveStatus && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            background: 'rgba(76, 175, 80, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.3))',
            },
          }}
        >
          ✅ Settings saved successfully!
        </Alert>
      )}
      
      {/* Main Layout: Sidebar + Content */}
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: '16px',
              overflow: 'hidden',
              height: '100%'
            }}
          >
            <List component="nav" sx={{ p: 1 }}>
              {SECTIONS.map((section) => (
                <ListItem 
                  key={section.id} 
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={activeSection === section.id}
                    onClick={() => handleSectionChange(section.id)}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        color: '#2196f3',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.15)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#2196f3',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={section.label} 
                      primaryTypographyProps={{ 
                        fontWeight: activeSection === section.id ? 600 : 400 
                      }}
                    />
                    {activeSection === section.id && (
                      <Box 
                        sx={{ 
                          width: 4, 
                          height: 24, 
                          bgcolor: '#2196f3',
                          borderRadius: 4,
                          ml: 1
                        }} 
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Right Content Area */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: '16px',
              minHeight: 600
            }}
          >
            {/* Profile & Account Section */}
            {activeSection === 'profile' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Profile & Account
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Personal Information Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Personal Information" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          {/* Profile Picture */}
                          <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ position: 'relative', mb: 2 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <IconButton 
                                    sx={{ 
                                      bgcolor: 'primary.main', 
                                      color: 'white',
                                      '&:hover': { bgcolor: 'primary.dark' },
                                      width: 32,
                                      height: 32,
                                    }}
                                  >
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                }
                              >
                                <Avatar 
                                  sx={{ 
                                    width: 120, 
                                    height: 120,
                                    border: '4px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: 48,
                                    bgcolor: 'primary.main',
                                  }}
                                >
                                  {profile.fullName.charAt(0).toUpperCase()}
                                </Avatar>
                              </Badge>
                            </Box>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<AddIcon />}
                              sx={{ mb: 1 }}
                            >
                              Upload Photo
                            </Button>
                            <Typography variant="caption" color="text.secondary">
                              JPG, PNG (max 5MB)
                            </Typography>
                          </Grid>
                          
                          {/* Personal Details */}
                          <Grid item xs={12} sm={9}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Full Name"
                                  value={profile.name}
                                  onChange={handleProfileChange('name')}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Email Address"
                                  value={profile.email}
                                  onChange={handleProfileChange('email')}
                                  variant="outlined"
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Chip 
                                          label="Verified" 
                                          size="small" 
                                          color="success" 
                                          icon={<CheckCircleIcon />} 
                                        />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Student ID"
                                  value={profile.studentId}
                                  variant="outlined"
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                  sx={{
                                    "& .MuiInputBase-input.Mui-disabled": {
                                      WebkitTextFillColor: "#666",
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                  <InputLabel id="grade-label">Grade/Year</InputLabel>
                                  <Select
                                    labelId="grade-label"
                                    value={profile.grade}
                                    onChange={handleProfileChange('grade')}
                                    label="Grade/Year"
                                  >
                                    {GRADE_OPTIONS.map((grade) => (
                                      <MenuItem key={grade} value={grade}>
                                        {grade}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Date of Birth"
                                  type="date"
                                  value={profile.dob}
                                  onChange={handleProfileChange('dob')}
                                  variant="outlined"
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  helperText="Optional"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Phone Number"
                                  value={profile.phone}
                                  onChange={handleProfileChange('phone')}
                                  variant="outlined"
                                  placeholder="+XX XXX-XXX-XXXX"
                                  helperText="Optional, for alerts"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Account Settings Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Account Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Username"
                              value={profile.username}
                              onChange={handleProfileChange('username')}
                              variant="outlined"
                              helperText="Used for login"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                              <Button
                                variant="outlined"
                                startIcon={<LockIcon />}
                                onClick={() => handleOpenDialog('changePassword')}
                                sx={{ mt: -3 }}
                              >
                                Change Password
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel id="language-label">Preferred Language</InputLabel>
                              <Select
                                labelId="language-label"
                                value={profile.language}
                                onChange={handleProfileChange('language')}
                                label="Preferred Language"
                              >
                                {LANGUAGE_OPTIONS.map((language) => (
                                  <MenuItem key={language} value={language}>
                                    {language}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel id="timezone-label">Time Zone</InputLabel>
                              <Select
                                labelId="timezone-label"
                                value={profile.timezone}
                                onChange={handleProfileChange('timezone')}
                                label="Time Zone"
                              >
                                {TIMEZONE_OPTIONS.map((timezone) => (
                                  <MenuItem key={timezone} value={timezone}>
                                    {timezone}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <AccessTimeIcon fontSize="small" color="action" />
                                  <Typography variant="caption" color="text.secondary">
                                    Auto-detected based on your location
                                  </Typography>
                                </Box>
                              </FormHelperText>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Connected Accounts Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Connected Accounts" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <List disablePadding>
                          {/* Google Account */}
                          <ListItem
                            secondaryAction={
                              CONNECTED_ACCOUNTS[0].connected ? (
                                <Button 
                                  variant="outlined" 
                                  color="error" 
                                  size="small"
                                  startIcon={<LinkOffIcon />}
                                >
                                  Disconnect
                                </Button>
                              ) : (
                                <Button 
                                  variant="outlined" 
                                  color="primary" 
                                  size="small"
                                  startIcon={<LinkIcon />}
                                >
                                  Connect
                                </Button>
                              )
                            }
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#DB4437' }}>G</Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary="Google Account" 
                              secondary={
                                CONNECTED_ACCOUNTS[0].connected ? 
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {CONNECTED_ACCOUNTS[0].email}
                                    <Chip 
                                      label="Connected" 
                                      size="small" 
                                      color="success" 
                                      sx={{ height: 20, fontSize: '0.7rem' }} 
                                    />
                                  </Box> : 
                                  "Not connected"
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                          
                          {/* Microsoft Account */}
                          <ListItem
                            secondaryAction={
                              CONNECTED_ACCOUNTS[1].connected ? (
                                <Button 
                                  variant="outlined" 
                                  color="error" 
                                  size="small"
                                  startIcon={<LinkOffIcon />}
                                >
                                  Disconnect
                                </Button>
                              ) : (
                                <Button 
                                  variant="outlined" 
                                  color="primary" 
                                  size="small"
                                  startIcon={<LinkIcon />}
                                >
                                  Connect
                                </Button>
                              )
                            }
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#0078D4' }}>M</Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary="Microsoft Account" 
                              secondary={
                                CONNECTED_ACCOUNTS[1].connected ? 
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {CONNECTED_ACCOUNTS[1].email}
                                    <Chip 
                                      label="Connected" 
                                      size="small" 
                                      color="success" 
                                      sx={{ height: 20, fontSize: '0.7rem' }} 
                                    />
                                  </Box> : 
                                  "Not connected"
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                          
                          {/* Parent/Guardian Emails */}
                          <ListItem
                            secondaryAction={
                              <Button 
                                variant="outlined" 
                                color="primary" 
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog('addParentEmail')}
                              >
                                Add Email
                              </Button>
                            }
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#4CAF50' }}>P</Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary="Parent/Guardian Emails" 
                              secondary="Add emails to share progress reports"
                            />
                          </ListItem>
                          
                          {PARENT_EMAILS.map((parent) => (
                            <ListItem key={parent.id} sx={{ pl: 9 }}>
                              <ListItemText 
                                primary={
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {parent.email}
                                    {parent.verified && (
                                      <Chip 
                                        label="Verified" 
                                        size="small" 
                                        color="success" 
                                        sx={{ height: 20, fontSize: '0.7rem' }} 
                                      />
                                    )}
                                  </Box>
                                }
                              />
                              <IconButton edge="end" aria-label="delete" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Danger Zone Card */}
                  <Grid item xs={12}>
                    <Card 
                      elevation={1} 
                      sx={{ 
                        borderRadius: '12px',
                        border: '1px solid rgba(244, 67, 54, 0.5)',
                      }}
                    >
                      <CardHeader 
                        title={
                          <Typography variant="h6" color="error">
                            Danger Zone
                          </Typography>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '8px' }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Deactivate Account
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                Temporarily disable your account. You can reactivate it anytime.
                              </Typography>
                              <Button 
                                variant="outlined" 
                                color="warning"
                                onClick={() => handleOpenDialog('deactivateAccount')}
                              >
                                Deactivate Account
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, border: '1px solid rgba(244, 67, 54, 0.5)', borderRadius: '8px', bgcolor: 'rgba(244, 67, 54, 0.03)' }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Delete Account Permanently
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                This action cannot be undone. All your data will be permanently deleted.
                              </Typography>
                              <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleOpenDialog('deleteAccount')}
                              >
                                Delete Account
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Privacy & Data Section */}
            {activeSection === 'privacy' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Privacy & Data
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Data Collection Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Data Collection" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Box sx={{ mb: 3 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.masterToggle} 
                                onChange={handlePrivacyChange('masterToggle')}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="subtitle1" fontWeight={500}>
                                Enable engagement monitoring
                              </Typography>
                            }
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
                            Allow Study Eyes to monitor your engagement and provide insights
                          </Typography>
                          
                          {!privacy.masterToggle && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              Turning this off will limit many features of Study Eyes, including personalized insights, focus tracking, and engagement analytics.
                            </Alert>
                          )}
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                          What We Collect
                        </Typography>
                        
                        <FormGroup sx={{ ml: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.videoAnalysis} 
                                onChange={handlePrivacyChange('videoAnalysis')}
                                color="primary"
                                disabled={!privacy.masterToggle}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Video Analysis
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow facial expression and posture analysis
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.audioAnalysis} 
                                onChange={handlePrivacyChange('audioAnalysis')}
                                color="primary"
                                disabled={!privacy.masterToggle}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Audio Analysis
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow voice and speech pattern analysis
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.physiologicalSignals} 
                                onChange={handlePrivacyChange('physiologicalSignals')}
                                color="primary"
                                disabled={!privacy.masterToggle}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Physiological Signals
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow heart rate and fatigue estimation (rPPG from video)
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.screenActivity} 
                                onChange={handlePrivacyChange('screenActivity')}
                                color="primary"
                                disabled={!privacy.masterToggle}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Screen Activity
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Track focus on study materials during online sessions
                                </Typography>
                              </Box>
                            }
                          />
                        </FormGroup>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Data Retention Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Data Retention" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                          <InputLabel id="data-retention-label">Data storage duration</InputLabel>
                          <Select
                            labelId="data-retention-label"
                            value={privacy.dataRetention}
                            onChange={handlePrivacyChange('dataRetention')}
                            label="Data storage duration"
                          >
                            {DATA_RETENTION_OPTIONS.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            How long we keep your engagement data
                          </FormHelperText>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<CloudDownloadIcon />}
                            fullWidth
                          >
                            Download My Data
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<DeleteForeverIcon />}
                            fullWidth
                          >
                            Delete All My Data
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Privacy Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Privacy Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.anonymousBenchmarking} 
                                onChange={handlePrivacyChange('anonymousBenchmarking')}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Anonymous Benchmarking
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow my anonymized data to be used for class/grade comparisons
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.shareWithTeachers} 
                                onChange={handlePrivacyChange('shareWithTeachers')}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Share with Teachers
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow teachers to see my detailed engagement data
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.shareWithParents} 
                                onChange={handlePrivacyChange('shareWithParents')}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Share with Parents
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow parents to see my progress reports
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={privacy.participateInResearch} 
                                onChange={handlePrivacyChange('participateInResearch')}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  Participate in Research
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Allow anonymized data to improve Study Eyes algorithms
                                </Typography>
                              </Box>
                            }
                          />
                        </FormGroup>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Session Recording Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Session Recording" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={privacy.saveSessionRecordings} 
                              onChange={handlePrivacyChange('saveSessionRecordings')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                Save Session Recordings
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Store recordings of your study sessions
                              </Typography>
                            </Box>
                          }
                        />
                        
                        {privacy.saveSessionRecordings && (
                          <Box sx={{ mt: 2, ml: 4 }}>
                            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                              <InputLabel id="auto-delete-label">Auto-delete recordings after</InputLabel>
                              <Select
                                labelId="auto-delete-label"
                                value={privacy.autoDeleteRecordings}
                                onChange={handlePrivacyChange('autoDeleteRecordings')}
                                label="Auto-delete recordings after"
                              >
                                {AUTO_DELETE_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            
                            <Alert severity="info" sx={{ mt: 2 }}>
                              Recordings are stored locally and are only accessible to you.
                            </Alert>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Notifications
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Notification Preferences Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Notification Preferences" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        {/* Delivery Methods */}
                        <Typography variant="subtitle2" gutterBottom>
                          Delivery Methods
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={6} md={3}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.inApp} 
                                  onChange={handleNotificationChange('inApp')}
                                  color="primary"
                                />
                              }
                              label="In-App Notifications"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.email} 
                                  onChange={handleNotificationChange('email')}
                                  color="primary"
                                />
                              }
                              label="Email Notifications"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.sms} 
                                  onChange={handleNotificationChange('sms')}
                                  color="primary"
                                />
                              }
                              label="SMS Notifications"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.push} 
                                  onChange={handleNotificationChange('push')}
                                  color="primary"
                                />
                              }
                              label="Push Notifications"
                            />
                          </Grid>
                        </Grid>
                        
                        {/* Notification Types */}
                        <Typography variant="subtitle2" gutterBottom>
                          Notification Types
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Quiz Notifications */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.quiz.enabled} 
                                  onChange={handleNotificationTypeChange('quiz', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  Quiz Notifications
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • New quiz available
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Quiz reminder before deadline
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Quiz results posted
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.quiz.enabled}
                            >
                              <InputLabel id="quiz-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="quiz-frequency-label"
                                value={notifications.types.quiz.frequency}
                                onChange={handleNotificationTypeChange('quiz', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.quiz.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Engagement Alerts */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.engagement.enabled} 
                                  onChange={handleNotificationTypeChange('engagement', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  Engagement Alerts
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • Daily engagement summary
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Low focus warnings
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Streak achievements
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.engagement.enabled}
                            >
                              <InputLabel id="engagement-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="engagement-frequency-label"
                                value={notifications.types.engagement.frequency}
                                onChange={handleNotificationTypeChange('engagement', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.engagement.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Teacher Messages */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.teacher.enabled} 
                                  onChange={handleNotificationTypeChange('teacher', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  Teacher Messages
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • Direct messages from teachers
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Class announcements
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Material shared
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.teacher.enabled}
                            >
                              <InputLabel id="teacher-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="teacher-frequency-label"
                                value={notifications.types.teacher.frequency}
                                onChange={handleNotificationTypeChange('teacher', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.teacher.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Achievement Notifications */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.achievement.enabled} 
                                  onChange={handleNotificationTypeChange('achievement', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  Achievement Notifications
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • Badges and milestones
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Goal completions
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.achievement.enabled}
                            >
                              <InputLabel id="achievement-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="achievement-frequency-label"
                                value={notifications.types.achievement.frequency}
                                onChange={handleNotificationTypeChange('achievement', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.achievement.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Schedule Reminders */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.schedule.enabled} 
                                  onChange={handleNotificationTypeChange('schedule', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  Schedule Reminders
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • Class starting in 10 minutes
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Upcoming assignments
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Schedule changes
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.schedule.enabled}
                            >
                              <InputLabel id="schedule-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="schedule-frequency-label"
                                value={notifications.types.schedule.frequency}
                                onChange={handleNotificationTypeChange('schedule', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.schedule.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* System Updates */}
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={notifications.types.system.enabled} 
                                  onChange={handleNotificationTypeChange('system', 'enabled')}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body1" fontWeight={500}>
                                  System Updates
                                </Typography>
                              }
                            />
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                • New features
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Maintenance notices
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              variant="outlined" 
                              size="small" 
                              sx={{ minWidth: 200 }}
                              disabled={!notifications.types.system.enabled}
                            >
                              <InputLabel id="system-frequency-label">Frequency</InputLabel>
                              <Select
                                labelId="system-frequency-label"
                                value={notifications.types.system.frequency}
                                onChange={handleNotificationTypeChange('system', 'frequency')}
                                label="Frequency"
                              >
                                {NOTIFICATION_FREQUENCY.system.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Quiet Hours Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Quiet Hours" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={notifications.quietHours.enabled} 
                              onChange={handleQuietHoursChange('enabled')}
                              color="primary"
                            />
                          }
                          label="Enable Quiet Hours"
                        />
                        
                        {notifications.quietHours.enabled && (
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Start Time"
                                  type="time"
                                  value={notifications.quietHours.start}
                                  onChange={handleQuietHoursChange('start')}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{
                                    step: 300, // 5 min
                                  }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="End Time"
                                  type="time"
                                  value={notifications.quietHours.end}
                                  onChange={handleQuietHoursChange('end')}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{
                                    step: 300, // 5 min
                                  }}
                                  fullWidth
                                />
                              </Grid>
                            </Grid>
                            
                            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                              Do Not Disturb Days
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {DAYS_OF_WEEK.map((day) => (
                                <Chip
                                  key={day}
                                  label={day}
                                  onClick={() => handleQuietHoursDayToggle(day)}
                                  color={notifications.quietHours.days.includes(day) ? "primary" : "default"}
                                  variant={notifications.quietHours.days.includes(day) ? "filled" : "outlined"}
                                />
                              ))}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                              No notifications will be sent during these days/times
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Notification Sound Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Notification Sound" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={notifications.sound.enabled} 
                              onChange={(e) => setNotifications({
                                ...notifications,
                                sound: {
                                  ...notifications.sound,
                                  enabled: e.target.checked
                                }
                              })}
                              color="primary"
                            />
                          }
                          label="Enable Notification Sounds"
                        />
                        
                        {notifications.sound.enabled && (
                          <Box sx={{ mt: 3 }}>
                            <Typography gutterBottom>Volume: {notifications.sound.volume}%</Typography>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <VolumeUpIcon color="action" />
                              </Grid>
                              <Grid item xs>
                                <Slider
                                  value={notifications.sound.volume}
                                  onChange={(e, newValue) => setNotifications({
                                    ...notifications,
                                    sound: {
                                      ...notifications.sound,
                                      volume: newValue
                                    }
                                  })}
                                  aria-labelledby="notification-volume-slider"
                                />
                              </Grid>
                            </Grid>
                            
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<VolumeUpIcon />}
                              sx={{ mt: 2 }}
                            >
                              Test Sound
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Study Preferences Section */}
            {activeSection === 'study' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Study Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Focus Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Focus Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={settings.study.focusMode} 
                              onChange={(e) => handleSettingChange('study', 'focusMode', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">
                                Focus Mode
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Minimize distractions during study sessions
                              </Typography>
                            </Box>
                          }
                        />
                        
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Eye Break Reminders
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={settings.eyeBreak.enabled} 
                                onChange={(e) => handleSettingChange('eyeBreak', 'enabled', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable eye break reminders"
                          />
                          
                          {settings.eyeBreak.enabled && (
                            <Box sx={{ mt: 2, ml: 4 }}>
                              <Typography gutterBottom>
                                Remind every {settings.eyeBreak.interval} minutes
                              </Typography>
                              <Slider
                                value={settings.eyeBreak.interval}
                                onChange={(e, newValue) => handleSettingChange('eyeBreak', 'interval', newValue)}
                                aria-labelledby="eye-break-interval-slider"
                                valueLabelDisplay="auto"
                                step={5}
                                marks
                                min={10}
                                max={60}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Recommended: 20 minutes (20-20-20 rule)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Posture Alerts
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={settings.posture.enabled} 
                                onChange={(e) => handleSettingChange('posture', 'enabled', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable posture reminders"
                          />
                          
                          {settings.posture.enabled && (
                            <Box sx={{ mt: 2, ml: 4 }}>
                              <Typography gutterBottom>
                                Sensitivity: {settings.posture.sensitivity}
                              </Typography>
                              <Slider
                                value={settings.posture.sensitivity}
                                onChange={(e, newValue) => handleSettingChange('posture', 'sensitivity', newValue)}
                                aria-labelledby="posture-sensitivity-slider"
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                min={1}
                                max={10}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Higher values will trigger alerts more frequently
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Break Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Break Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={settings.study.autoBreak} 
                              onChange={(e) => handleSettingChange('study', 'autoBreak', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">
                                Automatic Break Scheduling
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Suggest breaks based on your study duration
                              </Typography>
                            </Box>
                          }
                        />
                        
                        {settings.study.autoBreak && (
                          <Box sx={{ mt: 3, ml: 4 }}>
                            <Typography gutterBottom>
                              Break duration: {settings.study.breakDuration} minutes
                            </Typography>
                            <Slider
                              value={settings.study.breakDuration}
                              onChange={(e, newValue) => handleSettingChange('study', 'breakDuration', newValue)}
                              aria-labelledby="break-duration-slider"
                              valueLabelDisplay="auto"
                              step={1}
                              marks
                              min={1}
                              max={15}
                            />
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Study Session Preferences
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Preferred Study Method</FormLabel>
                            <RadioGroup
                              defaultValue="pomodoro"
                              name="study-method-group"
                            >
                              <FormControlLabel value="pomodoro" control={<Radio />} label="Pomodoro Technique (25/5)" />
                              <FormControlLabel value="flowtime" control={<Radio />} label="Flowtime Technique (flexible)" />
                              <FormControlLabel value="custom" control={<Radio />} label="Custom Schedule" />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Study Goals Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Study Goals" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Daily Study Target
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <TextField
                                type="number"
                                label="Hours"
                                defaultValue={2}
                                InputProps={{ inputProps: { min: 0, max: 12 } }}
                                sx={{ width: 100 }}
                              />
                              <Typography>hours</Typography>
                              <TextField
                                type="number"
                                label="Minutes"
                                defaultValue={30}
                                InputProps={{ inputProps: { min: 0, max: 59 } }}
                                sx={{ width: 100 }}
                              />
                              <Typography>minutes</Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Weekly Study Target
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <TextField
                                type="number"
                                label="Hours"
                                defaultValue={15}
                                InputProps={{ inputProps: { min: 0, max: 80 } }}
                                sx={{ width: 100 }}
                              />
                              <Typography>hours</Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={true}
                                  color="primary"
                                />
                              }
                              label="Send me weekly progress reports against my goals"
                            />
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            AI Assistance
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={settings.ai.suggestions} 
                                onChange={(e) => handleSettingChange('ai', 'suggestions', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable AI study suggestions based on my performance"
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={settings.ai.voiceCommands} 
                                onChange={(e) => handleSettingChange('ai', 'voiceCommands', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable voice commands during study sessions"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Appearance
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Theme Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Theme Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Color Theme
                        </Typography>
                        
                        <FormControl component="fieldset" sx={{ mt: 1 }}>
                          <RadioGroup
                            defaultValue="blue"
                            name="theme-color-group"
                          >
                            <FormControlLabel 
                              value="blue" 
                              control={<Radio />} 
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#2196F3' }} />
                                  <Typography>Blue (Default)</Typography>
                                </Box>
                              } 
                            />
                            <FormControlLabel 
                              value="purple" 
                              control={<Radio />} 
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#9C27B0' }} />
                                  <Typography>Purple</Typography>
                                </Box>
                              } 
                            />
                            <FormControlLabel 
                              value="green" 
                              control={<Radio />} 
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                                  <Typography>Green</Typography>
                                </Box>
                              } 
                            />
                            <FormControlLabel 
                              value="orange" 
                              control={<Radio />} 
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#FF9800' }} />
                                  <Typography>Orange</Typography>
                                </Box>
                              } 
                            />
                          </RadioGroup>
                        </FormControl>
                        
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Display Mode
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mt: 1 }}>
                            <RadioGroup
                              defaultValue="light"
                              name="theme-mode-group"
                            >
                              <FormControlLabel 
                                value="light" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LightModeIcon fontSize="small" />
                                    <Typography>Light Mode</Typography>
                                  </Box>
                                } 
                              />
                              <FormControlLabel 
                                value="dark" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DarkModeIcon fontSize="small" />
                                    <Typography>Dark Mode</Typography>
                                  </Box>
                                } 
                              />
                              <FormControlLabel 
                                value="system" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SettingsBrightnessIcon fontSize="small" />
                                    <Typography>Use System Setting</Typography>
                                  </Box>
                                } 
                              />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Display Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Display Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Text Size
                        </Typography>
                        
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <Typography variant="caption">A</Typography>
                            </Grid>
                            <Grid item xs>
                              <Slider
                                defaultValue={1}
                                step={0.25}
                                marks
                                min={0.75}
                                max={1.5}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}x`}
                              />
                            </Grid>
                            <Grid item>
                              <Typography variant="h6">A</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Layout Density
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mt: 1 }}>
                            <RadioGroup
                              defaultValue="comfortable"
                              name="layout-density-group"
                            >
                              <FormControlLabel value="compact" control={<Radio />} label="Compact" />
                              <FormControlLabel value="comfortable" control={<Radio />} label="Comfortable (Default)" />
                              <FormControlLabel value="spacious" control={<Radio />} label="Spacious" />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ mt: 3 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                defaultChecked={true}
                                color="primary"
                              />
                            }
                            label="Show animations and transitions"
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                defaultChecked={true}
                                color="primary"
                              />
                            }
                            label="Show engagement metrics on dashboard"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}

            {/* Camera & Audio Section */}
            {activeSection === 'camera' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Camera & Audio
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Camera Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Camera Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                        action={
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<CameraIcon />}
                          >
                            Test Camera
                          </Button>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Camera Device
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel id="camera-select-label">Select Camera</InputLabel>
                            <Select
                              labelId="camera-select-label"
                              id="camera-select"
                              defaultValue="default"
                              label="Select Camera"
                            >
                              <MenuItem value="default">Default Camera (Webcam)</MenuItem>
                              <MenuItem value="integrated">Integrated Camera</MenuItem>
                              <MenuItem value="external">External USB Camera</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Video Quality
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel id="video-quality-label">Video Quality</InputLabel>
                            <Select
                              labelId="video-quality-label"
                              id="video-quality"
                              defaultValue="medium"
                              label="Video Quality"
                            >
                              <MenuItem value="low">Low (360p) - Less bandwidth</MenuItem>
                              <MenuItem value="medium">Medium (480p) - Recommended</MenuItem>
                              <MenuItem value="high">High (720p) - More bandwidth</MenuItem>
                            </Select>
                          </FormControl>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Higher quality requires more bandwidth and processing power
                          </Typography>
                        </Box>
                        
                        <Box>
                          <FormControlLabel
                            control={
                              <Switch 
                                defaultChecked={true}
                                color="primary"
                              />
                            }
                            label="Enable background blur"
                          />
                          
                          <FormControlLabel
                            control={
                              <Switch 
                                defaultChecked={false}
                                color="primary"
                              />
                            }
                            label="Show camera preview during sessions"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Audio Settings Card */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ borderRadius: '12px', height: '100%' }}>
                      <CardHeader 
                        title="Audio Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                        action={
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<MicIcon />}
                          >
                            Test Mic
                          </Button>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Microphone Device
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel id="mic-select-label">Select Microphone</InputLabel>
                            <Select
                              labelId="mic-select-label"
                              id="mic-select"
                              defaultValue="default"
                              label="Select Microphone"
                            >
                              <MenuItem value="default">Default Microphone</MenuItem>
                              <MenuItem value="integrated">Integrated Microphone</MenuItem>
                              <MenuItem value="headset">Headset Microphone</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Microphone Volume
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <MicOffIcon fontSize="small" />
                            <Slider
                              defaultValue={75}
                              aria-label="Microphone Volume"
                              valueLabelDisplay="auto"
                            />
                            <MicIcon fontSize="small" />
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Speaker Device
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel id="speaker-select-label">Select Speaker</InputLabel>
                            <Select
                              labelId="speaker-select-label"
                              id="speaker-select"
                              defaultValue="default"
                              label="Select Speaker"
                            >
                              <MenuItem value="default">Default Speaker</MenuItem>
                              <MenuItem value="integrated">Integrated Speaker</MenuItem>
                              <MenuItem value="headphones">Headphones</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Speaker Volume
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <VolumeOffIcon fontSize="small" />
                            <Slider
                              defaultValue={60}
                              aria-label="Speaker Volume"
                              valueLabelDisplay="auto"
                            />
                            <VolumeUpIcon fontSize="small" />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Advanced Settings Card */}
                  <Grid item xs={12}>
                    <Card elevation={1} sx={{ borderRadius: '12px' }}>
                      <CardHeader 
                        title="Advanced Settings" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={true}
                                  color="primary"
                                />
                              }
                              label="Noise suppression"
                            />
                            
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={true}
                                  color="primary"
                                />
                              }
                              label="Echo cancellation"
                            />
                            
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={false}
                                  color="primary"
                                />
                              }
                              label="Auto gain control"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={true}
                                  color="primary"
                                />
                              }
                              label="Automatically adjust lighting"
                            />
                            
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={false}
                                  color="primary"
                                />
                              }
                              label="High dynamic range (HDR)"
                            />
                            
                            <FormControlLabel
                              control={
                                <Switch 
                                  defaultChecked={true}
                                  color="primary"
                                />
                              }
                              label="Mute microphone when joining sessions"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Security Section */}
            {activeSection === 'security' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Security
                </Typography>
                
                {/* Content will be added here */}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Help & Support Section */}
            {activeSection === 'help' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Help & Support
                </Typography>
                
                {/* Content will be added here */}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* About Section */}
            {activeSection === 'about' && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  About
                </Typography>
                
                {/* Content will be added here */}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogs */}
      {/* Change Password Dialog */}
      <Dialog 
        open={openDialog === 'changePassword'} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              margin="dense"
              label="Current Password"
              type={passwordValues.showCurrent ? "text" : "password"}
              fullWidth
              variant="outlined"
              value={passwordValues.current}
              onChange={handlePasswordChange('current')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('showCurrent')}
                      edge="end"
                    >
                      {passwordValues.showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="New Password"
              type={passwordValues.showNew ? "text" : "password"}
              fullWidth
              variant="outlined"
              value={passwordValues.new}
              onChange={handlePasswordChange('new')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('showNew')}
                      edge="end"
                    >
                      {passwordValues.showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordValues.confirm}
              onChange={handlePasswordChange('confirm')}
            />
            
            {/* Password strength indicator */}
            {passwordValues.new && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Password Strength
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordValues.new.length > 8 ? 100 : (passwordValues.new.length * 12.5)} 
                      color={
                        passwordValues.new.length < 4 ? "error" : 
                        passwordValues.new.length < 8 ? "warning" : "success"
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {passwordValues.new.length < 4 ? "Weak" : 
                     passwordValues.new.length < 8 ? "Medium" : "Strong"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained" 
            color="primary"
            disabled={
              !passwordValues.current || 
              !passwordValues.new || 
              !passwordValues.confirm || 
              passwordValues.new !== passwordValues.confirm ||
              passwordValues.new.length < 8
            }
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Deactivate Account Dialog */}
      <Dialog
        open={openDialog === 'deactivateAccount'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Deactivate Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to deactivate your account? Your account will be temporarily disabled and you won't be able to access Study Eyes.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can reactivate your account at any time by logging in again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={handleCloseDialog}>
            Deactivate Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={openDialog === 'deleteAccount'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteForeverIcon color="error" />
          Delete Account Permanently
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body1" paragraph>
            Are you absolutely sure you want to delete your account? This will:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              Permanently delete your profile and personal information
            </Typography>
            <Typography component="li" variant="body2">
              Remove all your study sessions, engagement data, and analytics
            </Typography>
            <Typography component="li" variant="body2">
              Cancel your access to all courses and materials
            </Typography>
          </Box>
          <TextField
            margin="dense"
            label="Type 'DELETE' to confirm"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleCloseDialog}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Parent Email Dialog */}
      <Dialog
        open={openDialog === 'addParentEmail'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Parent/Guardian Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Add your parent or guardian's email to share progress reports and important updates.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Parent/Guardian Email"
            type="email"
            fullWidth
            variant="outlined"
            placeholder="parent@example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Add Email
          </Button>
        </DialogActions>
      </Dialog>      <Grid container spacing={3}>
        {/* Notifications Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #2196f3, #42a5f5)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <NotificationsIcon sx={{ 
                mr: 2, 
                color: '#2196f3',
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.4))',
              }} />
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🔔 Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.eyeBreakReminder}
                    onChange={handleSwitchChange('notifications', 'eyeBreakReminder')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      👁️ Eye break reminders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get notified when it's time for an eye break
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.postureAlert}
                    onChange={handleSwitchChange('notifications', 'postureAlert')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      🏃 Posture alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive alerts for poor posture detection
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.studyGoalReminder}
                    onChange={handleSwitchChange('notifications', 'studyGoalReminder')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      🎯 Study goal reminders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stay motivated with goal progress updates
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.dailySummary}
                    onChange={handleSwitchChange('notifications', 'dailySummary')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      📊 Daily summary notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get daily study and health summaries
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Grid>        {/* Eye Care Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <EyeIcon sx={{ 
                mr: 2, 
                color: '#4caf50',
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(76, 175, 80, 0.4))',
              }} />
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                👁️ Eye Care
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.eyeBreak.enabled}
                  onChange={handleSwitchChange('eyeBreak', 'enabled')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4caf50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Enable eye break reminders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow the 20-20-20 rule for healthy eyes
                  </Typography>
                </Box>
              }
              sx={{ mb: 4 }}
            />

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⏰ Break interval: {settings.eyeBreak.interval} minutes
              </Typography>
              <Slider
                value={settings.eyeBreak.interval}
                onChange={handleSliderChange('eyeBreak', 'interval')}
                min={10}
                max={60}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.eyeBreak.enabled}
                sx={{
                  color: '#4caf50',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⏱️ Break duration: {settings.eyeBreak.duration} seconds
              </Typography>
              <Slider
                value={settings.eyeBreak.duration}
                onChange={handleSliderChange('eyeBreak', 'duration')}
                min={10}
                max={60}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.eyeBreak.enabled}
                sx={{
                  color: '#4caf50',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>        {/* Posture Settings */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <HealthIcon sx={{ 
                mr: 2, 
                color: '#ff9800',
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.4))',
              }} />
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🏃 Posture Monitoring
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.posture.enabled}
                  onChange={handleSwitchChange('posture', 'enabled')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ff9800',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ff9800',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Enable posture monitoring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor your sitting posture and get alerts
                  </Typography>
                </Box>
              }
              sx={{ mb: 4 }}
            />

            <Box>
              <Typography gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ⚠️ Alert sensitivity: {settings.posture.sensitivity}%
              </Typography>
              <Slider
                value={settings.posture.sensitivity}
                onChange={handleSliderChange('posture', 'sensitivity')}
                min={25}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                disabled={!settings.posture.enabled}
                sx={{
                  color: '#ff9800',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 15px rgba(255, 152, 0, 0.4)',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                💡 Higher sensitivity means more frequent posture alerts
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Study Goals */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(156, 39, 176, 0.3)',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TimerIcon sx={{ 
                mr: 2, 
                color: '#9c27b0',
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(156, 39, 176, 0.4))',
              }} />
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🎯 Study Goals
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                label="📅 Daily study goal (hours)"
                type="number"
                value={settings.study.dailyGoal}
                onChange={handleNumberChange('study', 'dailyGoal')}
                inputProps={{ min: 1, max: 16, step: 0.5 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />

              <TextField
                label="📊 Weekly study goal (hours)"
                type="number"
                value={settings.study.weeklyGoal}
                onChange={handleNumberChange('study', 'weeklyGoal')}
                inputProps={{ min: 5, max: 100, step: 1 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />

              <TextField
                label="🔔 Session reminder interval (minutes)"
                type="number"
                value={settings.study.sessionReminder}
                onChange={handleNumberChange('study', 'sessionReminder')}
                inputProps={{ min: 15, max: 120, step: 5 }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9c27b0',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9c27b0',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>        {/* AI Features */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.2)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #9c27b0, #e91e63)',
                animation: 'gradient-shift 3s ease-in-out infinite',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box
                sx={{
                  mr: 2,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  filter: 'drop-shadow(0 0 8px rgba(156, 39, 176, 0.4))',
                }}
              >
                🤖
              </Box>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI Features
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        👁️
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.attentionTracking}
                            onChange={handleSwitchChange('ai', 'attentionTracking')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Attention Tracking
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Monitor focus levels and detect distractions using advanced AI algorithms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        🎯
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.faceDetection}
                            onChange={handleSwitchChange('ai', 'faceDetection')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Face Detection
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Detect when you're away from your study area and track presence
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                      border: '1px solid rgba(156, 39, 176, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontSize: '16px',
                        }}
                      >
                        🏃
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.ai.postureAnalysis}
                            onChange={handleSwitchChange('ai', 'postureAnalysis')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#9c27b0',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#9c27b0',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Posture Analysis
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Real-time spinal alignment monitoring and posture correction
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ 
                px: 6,
                py: 2,
                borderRadius: '25px',
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049, #5eb55e)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '& .MuiButton-startIcon': {
                  marginRight: '12px',
                  fontSize: '24px',
                },
              }}
            >
              💾 Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Settings
