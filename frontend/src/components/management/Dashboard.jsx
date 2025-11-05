import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, BookOpen, TrendingUp, AlertCircle, Server, Clock, Calendar, Download, Bell, Settings, UserPlus, Database, Award, Target, Zap, Eye, CheckCircle } from 'lucide-react';

const ManagementDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const refreshTimer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const departmentData = [
    { name: 'Math', engagement: 78, teachers: 8, students: 156, classesToday: 28, trend: '↑' },
    { name: 'Physics', engagement: 72, teachers: 6, students: 132, classesToday: 22, trend: '→' },
    { name: 'Chemistry', engagement: 75, teachers: 5, students: 98, classesToday: 18, trend: '↑' },
    { name: 'English', engagement: 70, teachers: 8, students: 184, classesToday: 32, trend: '↓' },
    { name: 'Biology', engagement: 76, teachers: 7, students: 142, classesToday: 26, trend: '↑' },
    { name: 'Comp Sci', engagement: 80, teachers: 8, students: 135, classesToday: 30, trend: '↑' }
  ];

  const engagementTrends = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    Math: 75 + Math.random() * 8,
    Physics: 69 + Math.random() * 8,
    Chemistry: 72 + Math.random() * 8,
    English: 67 + Math.random() * 8,
    Biology: 73 + Math.random() * 8,
    CompSci: 77 + Math.random() * 8,
    Overall: 72 + Math.random() * 6
  }));

  const topTeachers = [
    { name: 'Ms. Johnson', dept: 'Mathematics', engagement: 88, students: 42 },
    { name: 'Mr. Chen', dept: 'Comp Sci', engagement: 86, students: 38 },
    { name: 'Dr. Williams', dept: 'Biology', engagement: 85, students: 40 },
    { name: 'Prof. Davis', dept: 'Chemistry', engagement: 83, students: 35 },
    { name: 'Ms. Taylor', dept: 'Physics', engagement: 82, students: 37 }
  ];

  const studentDistribution = [
    { name: 'High Performers (75%+)', value: 612, percentage: 72, color: '#4CAF50' },
    { name: 'Medium (60-74%)', value: 161, percentage: 19, color: '#FF9800' },
    { name: 'Low (40-59%)', value: 51, percentage: 6, color: '#FFC107' },
    { name: 'At Risk (<40%)', value: 23, percentage: 3, color: '#F44336' }
  ];

  const alerts = [
    { type: 'critical', message: 'Server load high - 95% capacity', time: '5m ago' },
    { type: 'warning', message: 'Physics Dept - 3 teachers below 70% engagement', time: '12m ago' },
    { type: 'warning', message: '15 students flagged for low attendance this week', time: '28m ago' },
    { type: 'info', message: 'Chemistry lab session canceled - rescheduled', time: '1h ago' }
  ];

  const upcomingEvents = [
    { title: 'Mid-term Exams', date: 'Nov 10-15', type: 'exam' },
    { title: 'Parent-Teacher Meetings', date: 'Nov 20-22', type: 'meeting' },
    { title: 'System Maintenance', date: 'Nov 25, 2AM-3AM', type: 'system' },
    { title: 'Semester End', date: 'Dec 15', type: 'academic' }
  ];

  const systemStats = [
    { title: 'Total Students', value: '847', subtitle: 'Across all departments', icon: Users, color: '#FF9800', change: '+12', trend: 'up' },
    { title: 'Total Teachers', value: '42', subtitle: 'Active faculty members', icon: UserPlus, color: '#2196F3', change: '+2', trend: 'up' },
    { title: 'Active Classes', value: '156', subtitle: 'Today', icon: BookOpen, color: '#4CAF50', change: '+8', trend: 'up' },
    { title: 'System Uptime', value: '99.8%', subtitle: 'Last 30 days', icon: Server, color: '#9C27B0', change: '+0.2%', trend: 'up' }
  ];

  const activityStats = [
    { title: 'Live Classes Now', value: '24', subtitle: 'Currently in session', icon: Activity, color: '#E91E63' },
    { title: 'Students Online', value: '542', subtitle: 'Active right now', icon: Eye, color: '#00BCD4' },
    { title: 'Avg System Engagement', value: '74%', subtitle: 'Institution-wide', icon: TrendingUp, color: '#8BC34A', change: '↑3%' }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, change, trend, color }) => (
    <div 
      className="relative overflow-hidden transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(color, 0.15)}, ${hexToRgba(color, 0.05)})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hexToRgba(color, 0.3)}`,
        borderRadius: '20px',
        padding: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
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
          filter: `drop-shadow(0 0 12px ${hexToRgba(color, 0.4)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={32} />
        </div>
        {change && (
          <div style={{ 
            background: trend === 'up' ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 'linear-gradient(135deg, #F44336, #E57373)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: trend === 'up' ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(244, 67, 54, 0.3)'
          }}>
            {change}
          </div>
        )}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#64748B',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: 700,
        color: color,
        textShadow: `0 0 20px ${hexToRgba(color, 0.3)}`,
        marginBottom: '4px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#94A3B8'
      }}>
        {subtitle}
      </div>
    </div>
  );

  const AlertBadge = ({ type, message, time }) => {
    const styles = {
      critical: { bg: 'rgba(244, 67, 54, 0.1)', border: 'rgba(244, 67, 54, 0.3)', text: '#F44336' },
      warning: { bg: 'rgba(255, 152, 0, 0.1)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' },
      info: { bg: 'rgba(33, 150, 243, 0.1)', border: 'rgba(33, 150, 243, 0.3)', text: '#2196F3' }
    };

    return (
      <div 
        className="transition-all duration-300 cursor-pointer"
        style={{
          background: styles[type].bg,
          border: `1px solid ${styles[type].border}`,
          borderRadius: '16px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(8px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={20} style={{ color: styles[type].text, marginTop: '2px', flexShrink: 0 }} />
          <div className="flex-1">
            <div style={{ fontSize: '14px', fontWeight: 600, color: styles[type].text, marginBottom: '4px' }}>
              {message}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{time}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      padding: 0
    }}>
      {/* Enhanced Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
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
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div>
              <h1 style={{ 
                fontSize: '44px', 
                fontWeight: 700, 
                marginBottom: '12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                Welcome back, Admin! 👋
              </h1>
              <p style={{ 
                fontSize: '18px', 
                opacity: 0.95,
                fontWeight: 500,
                letterSpacing: '0.3px'
              }}>
                Monday, October 29, 2024 • {currentTime.toLocaleTimeString()}
              </p>
              <div className="flex gap-6 mt-4" style={{ fontSize: '15px', opacity: 0.9 }}>
                <span>📚 6 departments</span>
                <span>👨‍🏫 42 teachers</span>
                <span>👥 847 students</span>
              </div>
            </div>
            <button
              style={{
                background: 'white',
                color: '#FF9800',
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
              <Download size={20} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* System Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {systemStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Real-Time Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {activityStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Department Performance */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(245, 124, 0, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px'
          }}>
            📊 Department Performance Overview
          </h2>
          <div style={{ marginBottom: '32px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="engagement" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9800" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#F57C00" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRadius: '12px 0 0 12px' }}>Department</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Teachers</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Students</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Engagement</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Classes Today</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRadius: '0 12px 12px 0' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, i) => (
                  <tr 
                    key={i} 
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 152, 0, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: 600, color: '#1E293B', borderRadius: '12px 0 0 12px' }}>{dept.name}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{dept.teachers}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{dept.students}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontWeight: 700,
                        color: dept.engagement >= 75 ? '#4CAF50' : '#FF9800',
                        background: dept.engagement >= 75 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '8px'
                      }}>
                        {dept.engagement}%
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#475569' }}>{dept.classesToday}</td>
                    <td style={{ padding: '16px', fontSize: '20px', borderRadius: '0 12px 12px 0' }}>{dept.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engagement Trends */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px'
          }}>
            📈 Engagement Trends - Last 30 Days
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={engagementTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="day" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Overall" stroke="#000000" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Math" stroke="#FF6B6B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Physics" stroke="#4ECDC4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Chemistry" stroke="#45B7D1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="English" stroke="#FFA07A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Biology" stroke="#98D8C8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="CompSci" stroke="#FF9800" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Teacher and Student Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Teacher Performance */}
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
              marginBottom: '24px'
            }}>
              👨‍🏫 Teacher Performance Summary
            </h2>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 600, marginBottom: '4px' }}>Top Performing Teacher</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#2E7D32' }}>Ms. Johnson - 88% avg</div>
              </div>
              <div style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#2196F3', fontWeight: 600, marginBottom: '4px' }}>Teachers Above Target (&gt;75%)</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1565C0' }}>35/42 (83%)</div>
              </div>
              <div style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#FF9800', fontWeight: 600, marginBottom: '4px' }}>Teachers Needing Support</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#E65100' }}>3</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>🏆 Top 5 Teachers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topTeachers.map((teacher, i) => (
                  <div 
                    key={i}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.background = 'rgba(33, 150, 243, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '15px' }}>{teacher.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{teacher.dept} • {teacher.students} students</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#4CAF50' }}>{teacher.engagement}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Analytics */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(56, 142, 60, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px'
            }}>
              👥 Student Analytics Summary
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={studentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {studentDistribution.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: item.color }}></div>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Overall Attendance</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#4CAF50' }}>89%</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Quiz Completion</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#4CAF50' }}>84%</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Avg Study Hours</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#4CAF50' }}>18.5h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and System Health */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Recent Alerts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(211, 47, 47, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🚨 Recent Alerts & Issues
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ 
                  padding: '6px 12px', 
                  background: 'rgba(244, 67, 54, 0.1)', 
                  color: '#F44336',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid rgba(244, 67, 54, 0.3)'
                }}>
                  2 Critical
                </div>
                <div style={{ 
                  padding: '6px 12px', 
                  background: 'rgba(255, 152, 0, 0.1)', 
                  color: '#FF9800',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}>
                  8 Warning
                </div>
                <div style={{ 
                  padding: '6px 12px', 
                  background: 'rgba(33, 150, 243, 0.1)', 
                  color: '#2196F3',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}>
                  15 Info
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert, i) => (
                <AlertBadge key={i} {...alert} />
              ))}
            </div>
          </div>

          {/* System Health */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(123, 31, 162, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(156, 39, 176, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px'
            }}>
              💻 System Health
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Server Status</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#4CAF50' }}>Healthy ✓</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Database</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#4CAF50' }}>Optimal</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>API Response</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#2196F3' }}>142ms</span>
              </div>
              <div style={{
                padding: '16px',
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Storage Used</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF9800' }}>68%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '68%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #FF9800, #F57C00)',
                    borderRadius: '6px',
                    boxShadow: '0 0 12px rgba(255, 152, 0, 0.5)'
                  }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>340GB / 500GB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Overview and Events */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Quiz & Assessment Overview */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.15), rgba(81, 45, 168, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(103, 58, 183, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #673AB7, #512DA8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px'
            }}>
              📝 Quiz & Assessment Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#2196F3', fontWeight: 600, marginBottom: '8px' }}>Total Quizzes</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#1565C0', marginBottom: '4px' }}>342</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>This month</div>
              </div>
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 600, marginBottom: '8px' }}>Completion Rate</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#2E7D32' }}>84%</div>
              </div>
              <div style={{
                background: 'rgba(156, 39, 176, 0.1)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#9C27B0', fontWeight: 600, marginBottom: '8px' }}>Average Score</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#6A1B9A' }}>76%</div>
              </div>
              <div style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '13px', color: '#FF9800', fontWeight: 600, marginBottom: '8px' }}>AI-Generated</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#E65100', marginBottom: '4px' }}>198</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>58% of total</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15), rgba(0, 151, 167, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 188, 212, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px'
            }}>
              📅 Upcoming Events & Schedules
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingEvents.map((event, i) => (
                <div 
                  key={i}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.background = 'rgba(0, 188, 212, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 188, 212, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  <Calendar size={24} style={{ color: '#00BCD4', marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '15px', marginBottom: '4px' }}>{event.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(245, 124, 0, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px'
          }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: Download, label: 'Generate Report', primary: true },
              { icon: Users, label: 'View Teachers' },
              { icon: Users, label: 'View Students' },
              { icon: Database, label: 'Departments' },
              { icon: Settings, label: 'Settings' },
              { icon: Bell, label: 'Announcement' }
            ].map((action, i) => (
              <button
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  background: action.primary ? 'linear-gradient(135deg, #FF9800, #F57C00)' : 'rgba(255, 255, 255, 0.8)',
                  color: action.primary ? 'white' : '#FF9800',
                  border: action.primary ? 'none' : '2px solid #FF9800',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: action.primary ? '0 8px 20px rgba(255, 152, 0, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 152, 0, 0.4)';
                  } else {
                    e.currentTarget.style.background = 'rgba(255, 152, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 152, 0, 0.3)';
                  } else {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <action.icon size={20} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;