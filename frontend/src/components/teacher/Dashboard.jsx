import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Users, TrendingUp, Bell, ClipboardList, Play, Eye, Calendar,
  BookOpen, Send, Plus, AlertCircle, CheckCircle, Trophy,
  Lightbulb, MessageSquare, ArrowUp, ArrowDown, Minus,
  Clock, MapPin, BarChart3, FileText, Settings, ChevronRight
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveEngagement, setLiveEngagement] = useState(68);

  const dashboardData = {
    teacher: {
      name: "Mr. John Smith",
      email: "teachtest@gmail.com",
      subjects: ["Mathematics", "Physics"],
      totalClasses: 6
    },
    stats: {
      totalStudents: 94,
      avgEngagement: 76,
      engagementTrend: 4,
      activeAlerts: 5,
      pendingQuizzes: 8
    },
    todayClasses: [
      { id: 1, name: "Mathematics - Grade 12A", time: "10:00 AM - 10:45 AM", room: "Room 301", students: 24, status: "completed", engagement: 82 },
      { id: 2, name: "Physics - Grade 11B", time: "11:30 AM - 12:15 PM", room: "Room 205", students: 28, status: "live", engagement: 68 },
      { id: 3, name: "Mathematics - Grade 12B", time: "2:00 PM - 2:45 PM", room: "Online", students: 22, status: "upcoming", engagement: null },
      { id: 4, name: "Chemistry - Grade 10A", time: "3:30 PM - 4:15 PM", room: "Lab 102", students: 20, status: "upcoming", engagement: null }
    ],
    allClasses: [
      { name: "Mathematics - Grade 12A", students: 24, engagement: 82, trend: "up" },
      { name: "Mathematics - Grade 12B", students: 22, engagement: 78, trend: "neutral" },
      { name: "Physics - Grade 11B", students: 28, engagement: 68, trend: "down" },
      { name: "Chemistry - Grade 10A", students: 20, engagement: 75, trend: "up" },
      { name: "Physics - Grade 11A", students: 18, engagement: 71, trend: "neutral" },
      { name: "Chemistry - Grade 10B", students: 16, engagement: 73, trend: "up" }
    ],
    engagementTrend: [
      { day: 'Mon', math12A: 78, math12B: 72, physics11B: 70, chem10A: 73, physics11A: 68, chem10B: 71 },
      { day: 'Tue', math12A: 80, math12B: 74, physics11B: 68, chem10A: 75, physics11A: 70, chem10B: 72 },
      { day: 'Wed', math12A: 82, math12B: 76, physics11B: 72, chem10A: 76, physics11A: 71, chem10B: 73 },
      { day: 'Thu', math12A: 85, math12B: 78, physics11B: 71, chem10A: 74, physics11A: 72, chem10B: 74 },
      { day: 'Fri', math12A: 83, math12B: 77, physics11B: 69, chem10A: 75, physics11A: 70, chem10B: 72 },
      { day: 'Sat', math12A: 81, math12B: 79, physics11B: 67, chem10A: 76, physics11A: 71, chem10B: 73 },
      { day: 'Sun', math12A: 82, math12B: 78, physics11B: 68, chem10A: 75, physics11A: 71, chem10B: 73 }
    ],
    alerts: [
      { id: 1, type: "warning", title: "Low Engagement Alert", description: "Grade 11B Physics - 60% of students distracted", time: "15 min ago", action: "Generate Quiz" },
      { id: 2, type: "danger", title: "Student Concern", description: "Sarah Martinez - Below 50% for 3 consecutive classes", time: "2 hours ago", action: "View Profile" },
      { id: 3, type: "info", title: "Quiz Completion", description: "Mathematics Quiz - 18/24 students completed • Avg: 78%", time: "4 hours ago", action: "View Results" },
      { id: 4, type: "success", title: "Achievement", description: "Grade 12A achieved 85%+ engagement this week!", time: "Today", action: "View Report" }
    ],
    topPerformers: [
      { name: "Alex Johnson", engagement: 92, subject: "Mathematics", avatar: "AJ" },
      { name: "Emily Chen", engagement: 89, subject: "Physics", avatar: "EC" },
      { name: "Michael Brown", engagement: 87, subject: "Chemistry", avatar: "MB" }
    ],
    needsSupport: [
      { name: "Sarah Martinez", engagement: 48, concern: "3 consecutive low classes", avatar: "SM" },
      { name: "James Wilson", engagement: 52, concern: "Frequent distraction", avatar: "JW" },
      { name: "Lisa Anderson", engagement: 55, concern: "Low participation", avatar: "LA" }
    ],
    recentQuizzes: [
      { subject: "Mathematics", topic: "Quadratic Equations", date: "Oct 28", completion: "18/24", percentage: 75, avgScore: 82, status: "completed" },
      { subject: "Physics", topic: "Newton's Laws", date: "Oct 27", completion: "25/28", percentage: 89, avgScore: 78, status: "completed" },
      { subject: "Chemistry", topic: "Periodic Table", date: "Oct 26", completion: "19/20", percentage: 95, avgScore: 85, status: "completed" }
    ],
    upcomingEvents: [
      { title: "Parent-Teacher Meeting", date: "Nov 5, 2024", type: "meeting" },
      { title: "Mid-term Exams", date: "Nov 10-15, 2024", type: "exam" },
      { title: "Professional Development", date: "Nov 20, 2024", type: "workshop" }
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const engagementTimer = setInterval(() => {
      setLiveEngagement(prev => Math.max(50, Math.min(85, prev + Math.floor(Math.random() * 5) - 2)));
    }, 5000);
    return () => clearInterval(engagementTimer);
  }, []);

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatTime = () => {
    return currentTime.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, change, trend, color, badge }) => (
    <div 
      className="transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(color, 0.15)}, ${hexToRgba(color, 0.05)})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hexToRgba(color, 0.3)}`,
        borderRadius: '20px',
        padding: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${hexToRgba(color, 0.2)}`;
        e.currentTarget.style.borderColor = hexToRgba(color, 0.5);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = hexToRgba(color, 0.3);
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div style={{ 
          color: color,
          filter: `drop-shadow(0 0 12px ${hexToRgba(color, 0.4)})`
        }}>
          <Icon size={32} />
        </div>
        {badge && (
          <div style={{
            background: hexToRgba(color, 0.2),
            color: color,
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 700, color: color, textShadow: `0 0 20px ${hexToRgba(color, 0.3)}`, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
        {subtitle}
      </div>
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: trend === 'up' ? '#4CAF50' : '#FF9800' }}>
          {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {change}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      padding: 0
    }}>
      {/* Enhanced Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        color: 'white',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40%',
          left: '-8%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, 30px) scale(1.1); }
          }
        `}</style>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', margin: '0 auto' }}>
          <div className="flex justify-between items-start flex-wrap gap-6">
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: '44px', 
                fontWeight: 700, 
                marginBottom: '12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {getGreeting()}, {dashboardData.teacher.name}! 👋
              </h1>
              <p style={{ fontSize: '18px', opacity: 0.95, fontWeight: 500, marginBottom: '16px' }}>
                You have {dashboardData.todayClasses.length} classes today • {dashboardData.stats.totalStudents} students • {dashboardData.stats.activeAlerts} pending alerts
              </p>
              <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '24px' }}>
                {formatTime()}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/teacher/temporal-monitoring')}
                  style={{
                    background: 'white',
                    color: '#4CAF50',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <Play size={20} />
                  Start Live Class
                </button>
                <div style={{ fontSize: '14px', opacity: 0.9, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💡 Tip: Students are most engaged during morning sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 48px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard 
            icon={Users} 
            title="Total Students" 
            value={dashboardData.stats.totalStudents}
            subtitle={`Across ${dashboardData.teacher.totalClasses} classes`}
            change="3 new enrollments"
            trend="up"
            color="#4CAF50"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Avg Engagement" 
            value={`${dashboardData.stats.avgEngagement}%`}
            subtitle="Class average today"
            change={`${dashboardData.stats.engagementTrend}% from yesterday`}
            trend="up"
            color="#2196F3"
          />
          <StatCard 
            icon={Bell} 
            title="Active Alerts" 
            value={dashboardData.stats.activeAlerts}
            subtitle="Require attention"
            badge={dashboardData.stats.activeAlerts}
            color="#FF9800"
          />
          <StatCard 
            icon={ClipboardList} 
            title="Pending Quizzes" 
            value={dashboardData.stats.pendingQuizzes}
            subtitle="Awaiting review"
            color="#9C27B0"
          />
        </div>

        {/* Today's Schedule and Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Today's Schedule */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Calendar size={24} style={{ color: '#2196F3' }} />
              Today's Schedule
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dashboardData.todayClasses.map((classItem) => {
                const statusStyles = {
                  completed: { bg: 'rgba(158, 158, 158, 0.2)', text: '#757575', border: 'rgba(158, 158, 158, 0.3)' },
                  live: { bg: 'rgba(76, 175, 80, 0.2)', text: '#4CAF50', border: 'rgba(76, 175, 80, 0.4)' },
                  upcoming: { bg: 'rgba(33, 150, 243, 0.2)', text: '#2196F3', border: 'rgba(33, 150, 243, 0.3)' }
                };
                const style = statusStyles[classItem.status];
                
                return (
                  <div 
                    key={classItem.id}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>{classItem.name}</h3>
                          <span style={{
                            padding: '4px 12px',
                            background: style.bg,
                            color: style.text,
                            border: `1px solid ${style.border}`,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            animation: classItem.status === 'live' ? 'pulse 2s infinite' : 'none'
                          }}>
                            {classItem.status === 'live' && <Play size={12} />}
                            {classItem.status === 'completed' && <CheckCircle size={12} />}
                            {classItem.status === 'upcoming' && <Clock size={12} />}
                            {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4" style={{ fontSize: '13px', color: '#64748B' }}>
                          <span className="flex items-center gap-1"><Clock size={14} /> {classItem.time}</span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> {classItem.room}</span>
                          <span className="flex items-center gap-1"><Users size={14} /> {classItem.students} students</span>
                        </div>
                      </div>
                      {classItem.engagement && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '28px', 
                            fontWeight: 700,
                            color: classItem.engagement >= 75 ? '#4CAF50' : classItem.engagement >= 60 ? '#FF9800' : '#F44336'
                          }}>
                            {classItem.status === 'live' ? liveEngagement : classItem.engagement}%
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Engagement</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(56, 142, 60, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700,
              color: '#1E293B',
              marginBottom: '20px'
            }}>
              ⚡ Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: Play, label: "Start Live Class", primary: true, route: '/teacher/temporal-monitoring' },
                { icon: Plus, label: "Create Quiz", route: '/teacher/quizzes-exams' },
                { icon: Users, label: "View Students", route: '/teacher/students-overview' },
                { icon: BarChart3, label: "Generate Report", route: '/teacher/reports-analytics' },
                { icon: Send, label: "Send Announcement" },
                { icon: BookOpen, label: "Upload Materials" }
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => action.route && navigate(action.route)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    background: action.primary ? 'linear-gradient(135deg, #4CAF50, #388E3C)' : 'rgba(255, 255, 255, 0.8)',
                    color: action.primary ? 'white' : '#4CAF50',
                    border: action.primary ? 'none' : '2px solid #4CAF50',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: action.primary ? '0 6px 16px rgba(76, 175, 80, 0.3)' : 'none',
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = action.primary ? 'translateY(-3px)' : 'translateX(4px)';
                    e.currentTarget.style.boxShadow = action.primary ? '0 10px 24px rgba(76, 175, 80, 0.4)' : '0 4px 12px rgba(76, 175, 80, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) translateX(0)';
                    e.currentTarget.style.boxShadow = action.primary ? '0 6px 16px rgba(76, 175, 80, 0.3)' : 'none';
                  }}
                >
                  <action.icon size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Class Engagement Overview */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(123, 31, 162, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <BarChart3 size={24} style={{ color: '#9C27B0' }} />
            Class Engagement Overview
          </h2>
          
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardData.allClasses.map((classItem, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div style={{ width: '220px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  {classItem.name}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    flex: 1, 
                    height: '40px', 
                    background: 'rgba(0, 0, 0, 0.1)', 
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${classItem.engagement}%`,
                      background: classItem.engagement >= 75 ? 'linear-gradient(90deg, #4CAF50, #66BB6A)' :
                                 classItem.engagement >= 60 ? 'linear-gradient(90deg, #FFC107, #FFD54F)' :
                                 'linear-gradient(90deg, #FF9800, #FFB74D)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: '0 16px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'white',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.5s ease'
                    }}>
                      {classItem.engagement}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {classItem.trend === 'up' && <ArrowUp size={16} style={{ color: '#4CAF50' }} />}
                    {classItem.trend === 'down' && <ArrowDown size={16} style={{ color: '#FF9800' }} />}
                    {classItem.trend === 'neutral' && <Minus size={16} style={{ color: '#9E9E9E' }} />}
                    <span style={{ fontSize: '13px', color: '#64748B', minWidth: '80px' }}>
                      {classItem.students} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>
              📊 7-Day Engagement Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis domain={[0, 100]} stroke="#64748B" />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(156, 39, 176, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="math12A" stroke="#4CAF50" strokeWidth={2} name="Math 12A" dot={false} />
                <Line type="monotone" dataKey="math12B" stroke="#8BC34A" strokeWidth={2} name="Math 12B" dot={false} />
                <Line type="monotone" dataKey="physics11B" stroke="#2196F3" strokeWidth={2} name="Physics 11B" dot={false} />
                <Line type="monotone" dataKey="chem10A" stroke="#FF9800" strokeWidth={2} name="Chemistry 10A" dot={false} />
                <Line type="monotone" dataKey="physics11A" stroke="#03A9F4" strokeWidth={2} name="Physics 11A" dot={false} />
                <Line type="monotone" dataKey="chem10B" stroke="#FFC107" strokeWidth={2} name="Chemistry 10B" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts and Student Performance */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Recent Alerts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(245, 124, 0, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Bell size={24} style={{ color: '#FF9800' }} />
                Recent Alerts
              </h2>
              <div className="flex gap-2">
                {['All', 'Urgent', 'Info'].map((filter, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '6px 16px',
                      background: i === 0 ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                      color: i === 0 ? '#FF9800' : '#64748B',
                      border: i === 0 ? '1px solid rgba(255, 152, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 152, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      if (i !== 0) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      }
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {dashboardData.alerts.map((alert) => {
                const alertStyles = {
                  warning: { icon: AlertCircle, bg: 'rgba(255, 152, 0, 0.1)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' },
                  danger: { icon: AlertCircle, bg: 'rgba(244, 67, 54, 0.1)', border: 'rgba(244, 67, 54, 0.3)', text: '#F44336' },
                  info: { icon: Bell, bg: 'rgba(33, 150, 243, 0.1)', border: 'rgba(33, 150, 243, 0.3)', text: '#2196F3' },
                  success: { icon: Trophy, bg: 'rgba(76, 175, 80, 0.1)', border: 'rgba(76, 175, 80, 0.3)', text: '#4CAF50' }
                };
                const style = alertStyles[alert.type];
                const IconComponent = style.icon;

                return (
                  <div
                    key={alert.id}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: '16px',
                      padding: '16px',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${style.border}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent size={20} style={{ color: style.text, marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: style.text, marginBottom: '6px' }}>
                          {alert.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                          {alert.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{alert.time}</span>
                          <button style={{
                            fontSize: '13px',
                            color: style.text,
                            fontWeight: 700,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}>
                            {alert.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Performance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Performers */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 179, 0, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Trophy size={20} style={{ color: '#FFC107' }} />
                Top Performers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dashboardData.topPerformers.map((student, idx) => (
                  <div
                    key={idx}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFC107, #FFA000)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                    }}>
                      {student.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{student.subject}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#4CAF50' }}>{student.engagement}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Support */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(211, 47, 47, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '16px'
              }}>
                ⚠️ Needs Support
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dashboardData.needsSupport.map((student, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      borderRadius: '14px',
                      padding: '12px'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(244, 67, 54, 0.2)',
                        color: '#F44336',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}>
                        {student.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{student.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{student.concern}</div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#F44336' }}>{student.engagement}%</div>
                    </div>
                    <button
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        color: '#F44336',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 67, 54, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 67, 54, 0.1)';
                      }}
                    >
                      <MessageSquare size={14} />
                      Reach Out
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Summary and Events */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Quiz Summary */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.15), rgba(81, 45, 168, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(103, 58, 183, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #673AB7, #512DA8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ClipboardList size={24} style={{ color: '#673AB7' }} />
                Quiz Summary
              </h2>
              <button
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #673AB7, #512DA8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 16px rgba(103, 58, 183, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(103, 58, 183, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(103, 58, 183, 0.3)';
                }}
              >
                <Plus size={16} />
                Create New Quiz
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {dashboardData.recentQuizzes.map((quiz, idx) => (
                <div
                  key={idx}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    padding: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(103, 58, 183, 0.2)',
                          color: '#673AB7',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {quiz.subject}
                        </span>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>{quiz.topic}</h3>
                      </div>
                      <div className="flex items-center gap-3" style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                        <span>{quiz.date}</span>
                        <span>•</span>
                        <span>{quiz.completion} ({quiz.percentage}%)</span>
                        <span>•</span>
                        <span style={{ fontWeight: 600 }}>Avg: {quiz.avgScore}%</span>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        background: quiz.status === 'completed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                        color: quiz.status === 'completed' ? '#4CAF50' : '#2196F3',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {quiz.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <button style={{
                      padding: '10px 20px',
                      background: 'rgba(103, 58, 183, 0.1)',
                      color: '#673AB7',
                      border: '1px solid rgba(103, 58, 183, 0.3)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}>
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: '16px',
              background: 'rgba(103, 58, 183, 0.1)',
              borderRadius: '14px',
              border: '1px solid rgba(103, 58, 183, 0.3)'
            }}>
              <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 600 }}>
                🤖 AI generated 12 quizzes this week
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Average response rate: 85% • Most common topic: Algebra
              </div>
            </div>
          </div>

          {/* Events and Reminders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Upcoming Events */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15), rgba(0, 151, 167, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 188, 212, 0.3)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={20} style={{ color: '#00BCD4' }} />
                Upcoming Events
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dashboardData.upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: '4px solid #00BCD4',
                      paddingLeft: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{event.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.15), rgba(194, 24, 91, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(233, 30, 99, 0.3)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
                📌 Reminders
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { text: 'Grade quiz submissions by tomorrow', color: '#FF9800' },
                  { text: 'Attendance report due Friday', color: '#FF9800' },
                  { text: 'Review new study materials', color: '#2196F3' }
                ].map((reminder, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: reminder.color,
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <div style={{ fontSize: '13px', color: '#475569' }}>{reminder.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Insights */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lightbulb size={24} style={{ color: '#8B5CF6' }} />
            Teaching Insights & Tips
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { icon: TrendingUp, title: 'Peak Performance Hours', text: 'Your morning classes show 15% higher engagement than afternoon sessions', color: '#8B5CF6' },
              { icon: BookOpen, title: 'Interactive Boost', text: 'Interactive activities boost engagement by 22% in Physics classes', color: '#2196F3' },
              { icon: ClipboardList, title: 'Quiz Timing', text: 'Students perform best on quizzes within 2 hours of class completion', color: '#4CAF50' },
              { icon: Clock, title: 'Break Recommendation', text: 'Consider 5-minute breaks in sessions longer than 40 minutes', color: '#FF9800' }
            ].map((insight, idx) => (
              <div
                key={idx}
                className="transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${hexToRgba(insight.color, 0.3)}`,
                  borderRadius: '16px',
                  padding: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${hexToRgba(insight.color, 0.2)}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start gap-3">
                  <insight.icon size={20} style={{ color: insight.color, marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      {insight.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      {insight.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;