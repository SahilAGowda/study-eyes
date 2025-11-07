import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { Award, Flame, Target, Clock, TrendingUp, TrendingDown, Users, Brain, Heart, Eye, BarChart3, Calendar, MessageCircle, Download, Settings, HelpCircle, Zap, Star, CheckCircle, Activity } from 'lucide-react';
import CountUp from 'react-countup';

// Mock data
const studentData = {
  name: "test1",
  engagement: 78,
  lastWeekEngagement: 73,
  todayFocus: { current: 165, goal: 180 },
  weeklyAverage: 75,
  streak: 5,
  chartData: [
    { day: 'Oct 24', date: '24', engagement: 72, subject: 'Math' },
    { day: 'Oct 25', date: '25', engagement: 75, subject: 'Physics' },
    { day: 'Oct 26', date: '26', engagement: 78, subject: 'Chemistry' },
    { day: 'Oct 27', date: '27', engagement: 80, subject: 'Math' },
    { day: 'Oct 28', date: '28', engagement: 76, subject: 'English' },
    { day: 'Oct 29', date: '29', engagement: 74, subject: 'Physics' },
    { day: 'Oct 30', date: '30', engagement: 77, subject: 'Chemistry' },
    { day: 'Oct 31', date: '31', engagement: 79, subject: 'Math' },
    { day: 'Nov 1', date: '1', engagement: 82, subject: 'English' },
    { day: 'Nov 2', date: '2', engagement: 85, subject: 'Physics' },
    { day: 'Nov 3', date: '3', engagement: 81, subject: 'Math' },
    { day: 'Nov 4', date: '4', engagement: 78, subject: 'Chemistry' },
    { day: 'Nov 5', date: '5', engagement: 80, subject: 'Physics' },
    { day: 'Nov 6', date: '6', engagement: 82, subject: 'Math' }
  ],
  behaviors: [
    { name: 'Cognitive', score: 82, icon: Brain, feedback: 'Strong focus! 💪', color: '#8B5CF6', bgColor: '#F3E8FF' },
    { name: 'Interactive', score: 68, icon: MessageCircle, feedback: 'Try asking more questions 🙋', color: '#10B981', bgColor: '#D1FAE5' },
    { name: 'Social', score: 71, icon: Users, feedback: 'Good collaboration 🤝', color: '#3B82F6', bgColor: '#DBEAFE' },
    { name: 'Emotional', score: 75, icon: Heart, feedback: 'Positive vibes 😊', color: '#EC4899', bgColor: '#FCE7F3' },
    { name: 'Focus', score: 79, icon: Eye, feedback: 'Solid attention span 👁️', color: '#F59E0B', bgColor: '#FEF3C7' }
  ],
  recentSessions: [
    { 
      id: 1, 
      subject: 'Mathematics', 
      date: 'Today', 
      time: '10:00 AM', 
      duration: 45, 
      engagement: 82, 
      highlights: ['Hand raised 2x', 'Active note-taking', 'Stayed focused'],
      mood: 'Interested throughout',
      color: '#3B82F6'
    },
    { 
      id: 2, 
      subject: 'Physics', 
      date: 'Yesterday', 
      time: '2:00 PM', 
      duration: 50, 
      engagement: 71, 
      highlights: ['Collaborated with peers', 'Good participation'],
      mood: 'Engaged',
      color: '#10B981'
    },
    { 
      id: 3, 
      subject: 'Chemistry', 
      date: 'Yesterday', 
      time: '11:00 AM', 
      duration: 40, 
      engagement: 65, 
      highlights: ['Lost focus midway'],
      mood: 'Distracted',
      color: '#F59E0B'
    },
    { 
      id: 4, 
      subject: 'Mathematics', 
      date: 'Oct 27', 
      time: '9:00 AM', 
      duration: 55, 
      engagement: 88, 
      highlights: ['Excellent engagement', 'Asked insightful questions'],
      mood: 'Very engaged',
      color: '#3B82F6'
    },
    { 
      id: 5, 
      subject: 'English', 
      date: 'Oct 27', 
      time: '1:00 PM', 
      duration: 45, 
      engagement: 74, 
      highlights: ['Decent focus', 'Participated in discussion'],
      mood: 'Focused',
      color: '#8B5CF6'
    }
  ],
  achievements: [
    { 
      id: 1, 
      name: '5-Day Streak', 
      icon: '🔥', 
      description: 'Consecutive days of high engagement',
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    { 
      id: 2, 
      name: 'Focus Master', 
      icon: '🎯', 
      description: '3 sessions with >80% engagement',
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    },
    { 
      id: 3, 
      name: 'Active Participant', 
      icon: '🙋', 
      description: 'Asked 10+ questions this week',
      color: '#10B981',
      bgColor: '#D1FAE5'
    }
  ],
  insights: [
    { 
      icon: '🌅', 
      title: 'Morning magic', 
      description: 'You\'re 23% more focused 9-11 AM. Schedule important study then!',
      action: 'Learn More'
    },
    { 
      icon: '⏸️', 
      title: 'Break reminder', 
      description: 'Your focus dips after 25 minutes. Try short breaks!',
      action: 'Apply Tip'
    },
    { 
      icon: '📈', 
      title: 'Trend alert', 
      description: 'Math engagement up 15% this week - great work!',
      action: 'View Details'
    },
    { 
      icon: '🤝', 
      title: 'Social boost', 
      description: 'Group study sessions increase your retention by 18%',
      action: 'Join Group'
    }
  ]
};

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xl">
        <p className="font-bold text-gray-800 text-sm">{`${label}, Nov ${data.date}`}</p>
        <p className="text-blue-600 font-bold text-lg">{`Engagement: ${payload[0].value}%`}</p>
        <p className="text-gray-600 text-sm">{`Subject: ${data.subject}`}</p>
      </div>
    );
  }
  return null;
};

// Heatmap data generation
const generateHeatmapData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];
  
  const data = days.map(day => {
    const dayData = { day };
    hours.forEach((hour, index) => {
      let score = 60;
      if (index < 3) score += 20;
      if (day === 'Fri' && index > 4) score -= 15;
      if (day === 'Sat' || day === 'Sun') score -= 10;
      dayData[hour] = Math.max(40, Math.min(95, score + (Math.random() - 0.5) * 10));
    });
    return dayData;
  });
  
  return { days, hours, data };
};

const heatmapData = generateHeatmapData();

const getHeatmapColor = (value) => {
  if (value >= 85) return '#7C3AED';
  if (value >= 70) return '#3B82F6';
  if (value >= 60) return '#93C5FD';
  return '#DBEAFE';
};

const getHeatmapEmoji = (value) => {
  if (value >= 85) return '🔥';
  if (value >= 70) return '😊';
  if (value >= 60) return '😐';
  return '😴';
};

// Enhanced Circular Progress Component
const CircularProgress = ({ percentage, color = '#3B82F6', size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1500 ease-out"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">
          <CountUp end={percentage} duration={1500} suffix="%" />
        </span>
      </div>
    </div>
  );
};

// Enhanced Progress Bar
const ProgressBar = ({ percentage, color = '#3B82F6', height = 'h-3' }) => {
  return (
    <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden relative`}>
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
        style={{ 
          width: `${percentage}%`,
          background: color
        }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>
  );
};

// Floating Animation Component
const FloatingElement = ({ children, delay = 0, duration = 3 }) => {
  return (
    <div 
      className="animate-bounce"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  );
};

// Pulse Animation Component
const PulseAnimation = ({ children, color = '#3B82F6' }) => {
  return (
    <div 
      className="relative"
      style={{
        animation: 'pulse-ring 2s infinite'
      }}
    >
      {children}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: color,
          animation: 'pulse 2s infinite'
        }}
      ></div>
    </div>
  );
};

const MyEngagement = () => {
  const [activeChartPeriod, setActiveChartPeriod] = useState('14D');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getEngagementMessage = () => {
    if (studentData.engagement >= 80) return "You're crushing it this week!";
    if (studentData.engagement >= 70) return "Keep the momentum going!";
    return "Let's boost your focus today!";
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      {/* Enhanced Hero Banner */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-blue-50"></div>
        <div className="relative bg-white/80 backdrop-blur-sm">
          {/* Floating decorative elements */}
          <div className="absolute top-8 left-8 w-4 h-4 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-16 right-16 w-6 h-6 bg-purple-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-8 left-1/4 w-3 h-3 bg-green-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-12 right-1/3 w-5 h-5 bg-orange-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="max-w-7xl mx-auto text-center py-20 px-4">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <PulseAnimation color="#3B82F6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </PulseAnimation>
            </div>
            <h1 
              className={`text-6xl md:text-7xl font-bold mb-6 transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, #1E40AF, #3B82F6, #1D4ED8)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Great to see you, {studentData.name}! ✨
            </h1>
            <p 
              className={`text-2xl md:text-3xl font-medium transition-all duration-700 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ color: '#374151' }}
            >
              {getEngagementMessage()}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Live Data</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Real-time Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Enhanced Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Overall Engagement */}
          <div 
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            onMouseEnter={() => setHoveredCard('engagement')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'engagement' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Overall Engagement</h3>
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <CircularProgress percentage={studentData.engagement} color="#3B82F6" />
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">This week</p>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">
                      +{studentData.engagement - studentData.lastWeekEngagement}% from last week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Focus Time */}
          <div 
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            onMouseEnter={() => setHoveredCard('focus')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'focus' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Focus Time</h3>
                <div className="p-3 bg-green-500 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-gray-800">
                    {Math.floor(studentData.todayFocus.current / 60)}h {studentData.todayFocus.current % 60}m
                  </span>
                  <FloatingElement delay={0.5}>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </FloatingElement>
                </div>
                <div className="space-y-2">
                  <ProgressBar 
                    percentage={(studentData.todayFocus.current / studentData.todayFocus.goal) * 100} 
                    color="#10B981" 
                  />
                  <p className="text-sm text-gray-500">
                    {Math.round((studentData.todayFocus.current / studentData.todayFocus.goal) * 100)}% of your daily goal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Average */}
          <div 
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            onMouseEnter={() => setHoveredCard('weekly')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'weekly' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Weekly Average</h3>
                <div className="p-3 bg-purple-500 rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-800">
                  <CountUp end={studentData.weeklyAverage} duration={1500} suffix="%" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">Best week this month!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div 
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            onMouseEnter={() => setHoveredCard('streak')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              transform: hoveredCard === 'streak' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Streak</h3>
                <div className="p-3 bg-orange-500 rounded-2xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-gray-800">
                    <CountUp end={studentData.streak} duration={1500} suffix=" days" />
                  </span>
                  <FloatingElement delay={0}>
                    <div className="text-3xl animate-pulse">🔥</div>
                  </FloatingElement>
                </div>
                <div className="space-y-2">
                  <ProgressBar 
                    percentage={(studentData.streak / 7) * 100} 
                    color="#F59E0B" 
                  />
                  <p className="text-sm text-gray-500">
                    {7 - studentData.streak} more days for 7-day badge!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Engagement Journey Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
              <span className="mr-3">📈</span>
              Your Learning Journey
            </h2>
            <div className="flex space-x-3">
              {['7D', '14D', '30D', 'This Month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setActiveChartPeriod(period)}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeChartPeriod === period
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentData.chartData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={14}
                  fontWeight="500"
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={14}
                  fontWeight="500"
                  domain={[60, 90]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl">
              <span className="text-2xl">🏆</span>
              <span className="text-gray-700 font-medium">Your best day: Monday (85%)</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-2xl">
              <span className="text-2xl">📊</span>
              <span className="text-gray-700 font-medium">Most consistent: Tue-Thu (80%+ average)</span>
            </div>
          </div>
        </div>

        {/* Enhanced Behavior Breakdown */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <span className="mr-3">🧠</span>
            What Makes You Engaged?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {studentData.behaviors.map((behavior, index) => {
              const IconComponent = behavior.icon;
              return (
                <div 
                  key={behavior.name}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-xl transition-all duration-500 cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    transform: 'translateY(20px)',
                    animation: 'slideUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="text-center space-y-4">
                    <div 
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: behavior.color }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{behavior.name}</h3>
                    <div className="relative">
                      <CircularProgress 
                        percentage={behavior.score} 
                        color={behavior.color}
                        size={100}
                        strokeWidth={6}
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{behavior.feedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Study Patterns Heatmap */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <span className="mr-3">⏰</span>
            When Are You Most Focused?
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid grid-cols-9 gap-2 text-sm">
                    <div className="h-10"></div>
                    {heatmapData.hours.map((hour) => (
                      <div key={hour} className="h-10 flex items-center justify-center text-gray-600 font-semibold">
                        {hour}
                      </div>
                    ))}
                    {heatmapData.data.map((day) => (
                      <React.Fragment key={day.day}>
                        <div className="h-10 flex items-center justify-center text-gray-600 font-semibold">
                          {day.day}
                        </div>
                        {heatmapData.hours.map((hour) => (
                          <div
                            key={`${day.day}-${hour}`}
                            className="h-10 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg border border-gray-100"
                            style={{ 
                              backgroundColor: getHeatmapColor(day[hour]),
                              boxShadow: day[hour] >= 70 ? `0 4px 12px ${getHeatmapColor(day[hour])}40` : 'none'
                            }}
                            title={`${day.day}, ${hour}: ${Math.round(day[hour])}% engagement`}
                          >
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                              {getHeatmapEmoji(day[hour])}
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 text-xl">Key Insights</h3>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-2xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌅</span>
                    <span className="text-sm text-blue-800 font-medium">You're a morning person! 23% higher focus before noon</span>
                  </div>
                </div>
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-2xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📉</span>
                    <span className="text-sm text-orange-800 font-medium">Friday afternoons are tough - schedule lighter tasks</span>
                  </div>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-2xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">☀️</span>
                    <span className="text-sm text-purple-800 font-medium">Peak performance: 9-11 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Sessions & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Sessions */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="mr-3">📚</span>
              Your Recent Classes
            </h2>
            <div className="space-y-6">
              {studentData.recentSessions.map((session, index) => (
                <div 
                  key={session.id}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: 'translateX(-20px)',
                    animation: 'slideIn 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-start space-x-6">
                    <div 
                      className="w-6 h-20 rounded-full flex-shrink-0"
                      style={{ backgroundColor: session.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{session.subject}</h3>
                        <span className="text-sm text-gray-500 font-medium">{session.date} • {session.time}</span>
                      </div>
                      <div className="flex items-center space-x-6 mb-4">
                        <span className="text-sm text-gray-600 font-medium">{session.duration} min</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-bold text-gray-800">{session.engagement}%</span>
                          <div className="relative">
                            <CircularProgress percentage={session.engagement} color={session.color} size={50} strokeWidth={4} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {session.highlights.map((highlight, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">😊 {session.mood}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Study Coach Insights */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">💡</span>
              Your Personal Study Coach
            </h2>
            <div className="space-y-6">
              {studentData.insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="group p-6 border border-gray-200 rounded-2xl  hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    transform: 'translateY(20px)',
                    animation: 'slideUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{insight.description}</p>
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white border border-gray-300 hover:border-blue-400 transition-all duration-200 flex items-center space-x-1 px-3 py-1 rounded-md shadow-sm">
                        <span>{insight.action}</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Achievements */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <span className="mr-3">🏆</span>
            Your Badges
          </h2>
          <div className="flex flex-wrap gap-8 justify-center">
            {studentData.achievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                className="group flex flex-col items-center space-y-4 cursor-pointer"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  transform: 'scale(0.8)',
                  animation: 'scaleIn 0.6s ease-out forwards'
                }}
              >
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: achievement.color }}
                >
                  {achievement.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-lg">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 font-medium max-w-40">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Download, title: 'Download Report', desc: 'PDF with full analysis', color: '#3B82F6', bgColor: '#DBEAFE' },
            { icon: Target, title: 'Set Study Goals', desc: 'Opens goal setting modal', color: '#10B981', bgColor: '#D1FAE5' },
            { icon: Calendar, title: 'View Schedule', desc: 'Links to calendar', color: '#8B5CF6', bgColor: '#F3E8FF' },
            { icon: HelpCircle, title: 'Need Help?', desc: 'Contact teacher/support', color: '#F59E0B', bgColor: '#FEF3C7' }
          ].map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.title}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 text-left"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transform: 'translateY(30px)',
                  animation: 'slideUp 0.6s ease-out forwards'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: action.color }}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">{action.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MyEngagement;