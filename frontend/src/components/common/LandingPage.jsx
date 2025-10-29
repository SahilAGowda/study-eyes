import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  School as StudentIcon,
  Person as TeacherIcon,
  AdminPanelSettings as ManagementIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingIcon,
  Visibility as EyeIcon,
  Assessment as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Track your focus and study habits',
      icon: <StudentIcon sx={{ fontSize: 60 }} />,
      color: '#2196f3',
      bgGradient: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
      features: [
        'Real-time focus tracking',
        'Study session analytics'
      ],
      route: '/student-login'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      subtitle: 'Monitor class engagement and performance',
      icon: <TeacherIcon sx={{ fontSize: 60 }} />,
      color: '#4caf50',
      bgGradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
      features: [
        'Class overview dashboard',
        'Student insights'
      ],
      route: '/teacher-login'
    },
    {
      id: 'management',
      title: 'Management',
      subtitle: 'School-wide analytics and insights',
      icon: <ManagementIcon sx={{ fontSize: 60 }} />,
      color: '#ff9800',
      bgGradient: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
      features: [
        'School-wide statistics',
        'Teacher performance'
      ],
      route: '/management-login'
    }
  ];

  const features = [
    {
      icon: <EyeIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Real-time Eye Tracking',
      description: 'Advanced computer vision technology for accurate attention monitoring'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'Comprehensive Analytics',
      description: 'Detailed insights and reports for better learning outcomes'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: 'Privacy First',
      description: 'Secure data handling with face-blurring and consent management'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Real-time Processing',
      description: 'Instant feedback and alerts for immediate improvement'
    }
  ];

  const handleRoleSelect = (role) => {
    // For now, navigate to login with role parameter
    // In a real app, you'd have separate login pages for each role
    navigate(`/login?role=${role.id}`);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        zIndex: 0,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        {/* Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'white',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(135deg, white 0%, #a5b4fc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Study Eyes
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              AI-Powered Multimodal Student
              Engagement Monitoring System
              with Enhanced Behavioral Recognition for
              Classroom and E-Learning Environments        </Typography>
            <Chip
              label="🚀 Powered by AI & Computer Vision"
              sx={{
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontWeight: 600,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
              }}
            />
          </Box>
        </Fade>

        {/* Role Selection Cards */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: 'white',
              mb: 4,
              fontSize: { xs: '1.5rem', sm: '1.8rem' }
            }}
          >
            Choose Your Role
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {roleOptions.map((role, index) => (
              <Grid item xs={12} sm={6} md={role.id === 'student' ? 8 : 6} lg={4} key={role.id}>
                <Zoom in timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${role.color}10 0%, rgba(15, 23, 42, 0.8) 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${role.color}20`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: role.bgGradient,
                        zIndex: 1,
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${role.color}20`,
                        border: `1px solid ${role.color}40`,
                        '& .role-icon': {
                          transform: 'scale(1.05)',
                        },
                        '& .role-arrow': {
                          transform: 'translateX(4px)',
                        }
                      },
                    }}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <CardContent sx={{ p: role.id === 'student' ? 4 : 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Icon and Title */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                          className="role-icon"
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 3,
                            background: role.bgGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            boxShadow: `0 8px 20px ${role.color}30`,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {React.cloneElement(role.icon, {
                            sx: { color: 'white', fontSize: 35 }
                          })}
                        </Box>

                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: 'white',
                            mb: 1,
                            fontSize: '1.3rem'
                          }}
                        >
                          {role.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}
                        >
                          {role.subtitle}
                        </Typography>
                      </Box>

                      {/* Features List */}
                      <Box sx={{ flex: 1, mb: 3 }}>
                        {role.features.map((feature, featureIndex) => (
                          <Box
                            key={featureIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1.5,
                              p: 1,
                              borderRadius: 1.5,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                                transform: 'translateX(4px)',
                              }
                            }}
                          >
                            <Box sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: role.bgGradient,
                              mr: 1.5,
                              flexShrink: 0,
                            }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 500,
                                fontSize: '0.85rem'
                              }}
                            >
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowIcon className="role-arrow" sx={{ transition: 'all 0.3s ease' }} />}
                        fullWidth
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          background: role.bgGradient,
                          boxShadow: `0 4px 15px ${role.color}20`,
                          '&:hover': {
                            background: role.bgGradient,
                            boxShadow: `0 6px 20px ${role.color}30`,
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        Access {role.title} Portal
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Slide direction="up" in timeout={1200}>
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: 'white',
                mb: 4,
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }}
            >
              Why Choose Study Eyes?
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 2,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }
                    }}
                  >
                    <Box sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        mb: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: 1.5,
                        fontSize: '0.9rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Slide>

        {/* Call to Action */}
        <Fade in timeout={1500}>
          <Box sx={{ textAlign: 'center' }}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '1.8rem' }
                }}
              >
                Ready to Transform Learning?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  maxWidth: '500px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                Join thousands of students, teachers, and institutions already using Study Eyes
                to enhance focus, improve learning outcomes, and create better educational experiences.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GroupIcon />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Get Started Today
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LandingPage;
