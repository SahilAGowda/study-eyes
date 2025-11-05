import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Download, TrendingUp, TrendingDown, Users, BookOpen, Clock, Award, Calendar, Brain, MessageCircle, Heart, Eye, Zap, ChevronRight, Filter, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TeacherAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBehavior, setSelectedBehavior] = useState('cognitive');
  const [expandedClass, setExpandedClass] = useState(null);

  // Mock Data
  const overviewStats = [
    {
      title: 'Overall Engagement',
      value: '76%',
      change: '+4%',
      trend: 'up',
      icon: <TrendingUp />,
      color: '#4CAF50',
      subtitle: 'Across all classes'
    },
    {
      title: 'Total Classes',
      value: '6',
      change: '+1',
      trend: 'up',
      icon: <BookOpen />,
      color: '#2196F3',
      subtitle: '94 total students'
    },
    {
      title: 'Study Hours',
      value: '1,240h',
      change: '+120h',
      trend: 'up',
      icon: <Clock />,
      color: '#FF9800',
      subtitle: 'This month'
    },
    {
      title: 'Quiz Completion',
      value: '85%',
      change: '+3%',
      trend: 'up',
      icon: <Award />,
      color: '#9C27B0',
      subtitle: '24 quizzes'
    }
  ];

  const classPerformance = [
    { name: 'Math 12A', engagement: 82, students: 24, attendance: 90, quizAvg: 84, trend: 'up', color: '#4CAF50' },
    { name: 'Physics 11B', engagement: 68, students: 28, attendance: 85, quizAvg: 76, trend: 'down', color: '#FF5722' },
    { name: 'Math 12B', engagement: 78, students: 22, attendance: 88, quizAvg: 81, trend: 'neutral', color: '#FFC107' },
    { name: 'Chem 11A', engagement: 75, students: 20, attendance: 92, quizAvg: 80, trend: 'up', color: '#4CAF50' },
    { name: 'Physics 12A', engagement: 71, students: 16, attendance: 87, quizAvg: 78, trend: 'neutral', color: '#FFC107' },
    { name: 'Chem 12B', engagement: 79, students: 18, attendance: 89, quizAvg: 82, trend: 'up', color: '#4CAF50' }
  ];

  const engagementTrends = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    'Math 12A': 75 + Math.random() * 15,
    'Physics 11B': 60 + Math.random() * 15,
    'Math 12B': 70 + Math.random() * 15,
    'Chem 11A': 68 + Math.random() * 15,
    'Physics 12A': 65 + Math.random() * 15,
    'Chem 12B': 72 + Math.random() * 15
  }));

  const behavioralData = {
    cognitive: [
      { class: 'Math 12A', score: 85 },
      { class: 'Physics 11B', score: 72 },
      { class: 'Math 12B', score: 80 },
      { class: 'Chem 11A', score: 78 },
      { class: 'Physics 12A', score: 75 },
      { class: 'Chem 12B', score: 82 }
    ],
    interactive: [
      { class: 'Math 12A', score: 70 },
      { class: 'Physics 11B', score: 65 },
      { class: 'Math 12B', score: 72 },
      { class: 'Chem 11A', score: 68 },
      { class: 'Physics 12A', score: 66 },
      { class: 'Chem 12B', score: 71 }
    ],
    social: [
      { class: 'Math 12A', score: 78 },
      { class: 'Physics 11B', score: 70 },
      { class: 'Math 12B', score: 76 },
      { class: 'Chem 11A', score: 73 },
      { class: 'Physics 12A', score: 72 },
      { class: 'Chem 12B', score: 79 }
    ],
    emotional: [
      { class: 'Math 12A', score: 80 },
      { class: 'Physics 11B', score: 72 },
      { class: 'Math 12B', score: 78 },
      { class: 'Chem 11A', score: 76 },
      { class: 'Physics 12A', score: 74 },
      { class: 'Chem 12B', score: 81 }
    ],
    focus: [
      { class: 'Math 12A', score: 82 },
      { class: 'Physics 11B', score: 68 },
      { class: 'Math 12B', score: 79 },
      { class: 'Chem 11A', score: 77 },
      { class: 'Physics 12A', score: 73 },
      { class: 'Chem 12B', score: 83 }
    ]
  };

  const performanceDistribution = [
    { name: 'High Performers (75%+)', value: 68, color: '#4CAF50' },
    { name: 'Medium (60-74%)', value: 18, color: '#FFC107' },
    { name: 'Low (40-59%)', value: 6, color: '#FF9800' },
    { name: 'At Risk (<40%)', value: 2, color: '#F44336' }
  ];

  const quizPerformance = [
    { subject: 'Math', score: 84, quizzes: 8 },
    { subject: 'Physics', score: 76, quizzes: 8 },
    { subject: 'Chemistry', score: 80, quizzes: 8 }
  ];

  const insights = [
    { 
      text: "Physics 11B engagement drops after 20 min - consider breaks",
      type: 'warning',
      icon: <AlertCircle className="w-5 h-5" />
    },
    { 
      text: "Morning classes 15% more engaged than afternoon",
      type: 'info',
      icon: <TrendingUp className="w-5 h-5" />
    },
    { 
      text: "Interactive activities boost engagement by 22%",
      type: 'success',
      icon: <CheckCircle className="w-5 h-5" />
    },
    { 
      text: "Friday attendance is 8% lower - consider engaging content",
      type: 'warning',
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  const behaviorTabs = [
    { id: 'cognitive', label: 'Cognitive', icon: <Brain />, avg: 82 },
    { id: 'interactive', label: 'Interactive', icon: <MessageCircle />, avg: 68 },
    { id: 'social', label: 'Social Learning', icon: <Users />, avg: 75 },
    { id: 'emotional', label: 'Emotional', icon: <Heart />, avg: 77 },
    { id: 'focus', label: 'Focus Level', icon: <Eye />, avg: 79 }
  ];

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48" 
             style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"
             style={{ animation: 'float 10s ease-in-out infinite reverse' }}></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Reports & Analytics 📊</h1>
              <p className="text-lg text-green-100">Comprehensive insights across all your classes</p>
            </div>
            <button className="bg-white text-green-600 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-green-50 transition-all hover:shadow-lg hover:-translate-y-1">
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>

          {/* Period Selector */}
          <div className="mt-6 flex gap-3 flex-wrap">
            {['week', 'month', 'semester', 'custom'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'bg-green-500 text-white hover:bg-green-400'
                }`}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : period === 'semester' ? 'This Semester' : 'Custom Range'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(stat.color, 0.15)}, ${hexToRgba(stat.color, 0.05)})`,
                border: `1px solid ${hexToRgba(stat.color, 0.3)}`,
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s backwards`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ 
                  background: hexToRgba(stat.color, 0.2),
                  color: stat.color 
                }}>
                  {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
                </div>
                <h3 className="font-semibold text-gray-700">{stat.title}</h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Class Performance Comparison */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            📚 Class Performance Overview
          </h2>
          
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                />
                <Bar dataKey="engagement" radius={[8, 8, 0, 0]}>
                  {classPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Class Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Engagement</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quiz Avg</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trend</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {classPerformance.map((cls, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedClass(expandedClass === index ? null : index)}
                  >
                    <td className="py-4 px-4 font-semibold">{cls.name}</td>
                    <td className="py-4 px-4">{cls.students}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold" style={{ color: cls.color }}>{cls.engagement}%</span>
                    </td>
                    <td className="py-4 px-4">{cls.attendance}%</td>
                    <td className="py-4 px-4">{cls.quizAvg}%</td>
                    <td className="py-4 px-4">
                      {cls.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : cls.trend === 'down' ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedClass === index ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border border-purple-200">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            📈 30-Day Engagement Trends
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={engagementTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#666" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#666" label={{ value: 'Engagement %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                }}
              />
              <Legend />
              {Object.keys(engagementTrends[0]).filter(k => k !== 'day').map((key, i) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={classPerformance[i]?.color || '#666'} 
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Behavioral Analysis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            🧠 Behavioral Analysis
          </h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {behaviorTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBehavior(tab.id)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedBehavior === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                <span>{tab.label}</span>
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-lg text-sm">{tab.avg}%</span>
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={behavioralData[selectedBehavior]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="class" type="category" stroke="#666" width={100} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              />
              <Bar dataKey="score" fill="#2196F3" radius={[0, 8, 8, 0]}>
                {behavioralData[selectedBehavior].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${210 + entry.score}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Distribution & Quiz Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Distribution */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border border-orange-200">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              🎯 Student Performance Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value} students</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Performance */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6 border border-indigo-200">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              ✅ Quiz Performance Summary
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">24</p>
                <p className="text-sm text-gray-600">Total Quizzes</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">85%</p>
                <p className="text-sm text-gray-600">Completion</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">78%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quizPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="subject" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                />
                <Bar dataKey="score" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border border-pink-200">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
            💡 AI-Powered Insights & Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-5 rounded-2xl flex items-start gap-4 ${
                  insight.type === 'success' ? 'bg-green-100 border border-green-200' :
                  insight.type === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-blue-100 border border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${
                  insight.type === 'success' ? 'bg-green-200 text-green-700' :
                  insight.type === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                  'bg-blue-200 text-blue-700'
                }`}>
                  {insight.icon}
                </div>
                <p className="text-gray-700 font-medium">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default TeacherAnalytics;