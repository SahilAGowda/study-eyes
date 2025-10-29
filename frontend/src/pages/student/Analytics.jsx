import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Brain,
  Clock,
  Target,
  TrendingUp,
  Download,
  Info,
  Calendar,
  Zap,
  Users,
  Heart,
  Eye,
  BookOpen,
  Coffee,
  Award,
  Sun,
  Moon,
  Sunrise,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState('last30');
  const [viewType, setViewType] = useState('overview');
  const [activeTab, setActiveTab] = useState('cognitive');
  const [showComparative, setShowComparative] = useState(false);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState(null);

  // Mock data based on requirements
  const learningPatterns = {
    peakTime: { start: '9:00 AM', end: '11:00 AM', improvement: 23 },
    focusDuration: { current: 32, previous: 24, target: 45 },
    learningStyle: { visual: 68, auditory: 22, kinesthetic: 10 },
    consistencyScore: 78
  };

  const heatmapData = [
    { day: 'Mon', '6AM': 0, '7AM': 45, '8AM': 72, '9AM': 88, '10AM': 85, '11AM': 82, '12PM': 78, '1PM': 75, '2PM': 75, '3PM': 68, '4PM': 62, '5PM': 58, '6PM': 55, '7PM': 60, '8PM': 65, '9PM': 52, '10PM': 0 },
    { day: 'Tue', '6AM': 0, '7AM': 48, '8AM': 75, '9AM': 86, '10AM': 83, '11AM': 78, '12PM': 76, '1PM': 74, '2PM': 72, '3PM': 65, '4PM': 60, '5PM': 56, '6PM': 52, '7PM': 58, '8PM': 62, '9PM': 50, '10PM': 0 },
    { day: 'Wed', '6AM': 0, '7AM': 42, '8AM': 70, '9AM': 82, '10AM': 79, '11AM': 76, '12PM': 72, '1PM': 70, '2PM': 68, '3PM': 62, '4PM': 58, '5PM': 54, '6PM': 50, '7PM': 56, '8PM': 60, '9PM': 48, '10PM': 0 },
    { day: 'Thu', '6AM': 0, '7AM': 46, '8AM': 73, '9AM': 85, '10AM': 81, '11AM': 77, '12PM': 74, '1PM': 72, '2PM': 70, '3PM': 64, '4PM': 59, '5PM': 55, '6PM': 51, '7PM': 57, '8PM': 63, '9PM': 49, '10PM': 0 },
    { day: 'Fri', '6AM': 0, '7AM': 40, '8AM': 68, '9AM': 78, '10AM': 75, '11AM': 70, '12PM': 66, '1PM': 64, '2PM': 60, '3PM': 52, '4PM': 48, '5PM': 45, '6PM': 42, '7PM': 48, '8PM': 55, '9PM': 45, '10PM': 0 },
    { day: 'Sat', '6AM': 0, '7AM': 0, '8AM': 0, '9AM': 65, '10AM': 72, '11AM': 68, '12PM': 65, '1PM': 66, '2PM': 65, '3PM': 60, '4PM': 58, '5PM': 0, '6PM': 0, '7PM': 0, '8PM': 0, '9PM': 0, '10PM': 0 },
    { day: 'Sun', '6AM': 0, '7AM': 0, '8AM': 0, '9AM': 62, '10AM': 70, '11AM': 66, '12PM': 64, '1PM': 65, '2PM': 62, '3PM': 58, '4PM': 55, '5PM': 0, '6PM': 0, '7PM': 0, '8PM': 0, '9PM': 0, '10PM': 0 }
  ];

  const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];

  const behaviorTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    cognitive: 75 + Math.random() * 15 + (i * 0.3),
    interactive: 65 + Math.random() * 10,
    social: 70 + Math.random() * 12 + (i * 0.4),
    emotional: 74 + Math.random() * 8 + (Math.sin(i / 3) * 5),
    focus: 76 + Math.random() * 10 + (i * 0.2)
  }));

  const cognitiveBreakdown = [
    { name: 'Active Listening', value: 85, trend: 'up' },
    { name: 'Note-taking', value: 78, trend: 'up' },
    { name: 'Problem Solving', value: 82, trend: 'stable' },
    { name: 'Reading Focus', value: 80, trend: 'up' }
  ];

  const participationBySubject = [
    { subject: 'Math', questions: 12, accuracy: 88, engagement: 85 },
    { subject: 'Physics', questions: 8, accuracy: 82, engagement: 78 },
    { subject: 'Chemistry', questions: 6, accuracy: 75, engagement: 72 },
    { subject: 'English', questions: 10, accuracy: 90, engagement: 80 }
  ];

  const sessionDurationDist = [
    { duration: '0-15 min', count: 8, effectiveness: 62 },
    { duration: '15-30 min', count: 18, effectiveness: 78 },
    { duration: '30-45 min', count: 32, effectiveness: 85 },
    { duration: '45-60 min', count: 14, effectiveness: 79 },
    { duration: '60+ min', count: 6, effectiveness: 65 }
  ];

  const subjectTimeDistribution = [
    { name: 'Math', value: 35, score: 88, color: '#2196F3' },
    { name: 'Physics', value: 25, score: 85, color: '#9C27B0' },
    { name: 'Chemistry', value: 20, score: 72, color: '#4CAF50' },
    { name: 'English', value: 15, score: 90, color: '#FF9800' },
    { name: 'Other', value: 5, score: 78, color: '#607D8B' }
  ];

  const sleepCorrelation = [
    { sleep: 5, engagement: 62 },
    { sleep: 5.5, engagement: 65 },
    { sleep: 6, engagement: 68 },
    { sleep: 6.5, engagement: 74 },
    { sleep: 7, engagement: 82 },
    { sleep: 7.5, engagement: 85 },
    { sleep: 8, engagement: 87 },
    { sleep: 8.5, engagement: 86 },
    { sleep: 9, engagement: 84 }
  ];

  const timeOfDayPerformance = [
    { time: 'Morning', Math: 88, Physics: 85, Chemistry: 78, English: 86 },
    { time: 'Afternoon', Math: 75, Physics: 72, Chemistry: 68, English: 78 },
    { time: 'Evening', Math: 70, Physics: 68, Chemistry: 65, English: 75 }
  ];

  const radarData = [
    { subject: 'Math', morning: 88, afternoon: 75, evening: 70 },
    { subject: 'Physics', morning: 85, afternoon: 72, evening: 68 },
    { subject: 'Chemistry', morning: 78, afternoon: 68, evening: 65 },
    { subject: 'English', morning: 86, afternoon: 78, evening: 75 }
  ];

  const insights = [
    {
      icon: Sun,
      title: "Morning momentum",
      message: "You're 23% more focused in morning hours. Schedule challenging subjects before 11 AM.",
      type: "positive"
    },
    {
      icon: Clock,
      title: "Sweet spot sessions",
      message: "Your 30-40 minute study sessions show 85% engagement vs 65% for longer sessions.",
      type: "positive"
    },
    {
      icon: AlertCircle,
      title: "Afternoon dip",
      message: "Chemistry engagement drops 15% in afternoon classes. Try a light snack before class.",
      type: "attention"
    },
    {
      icon: Users,
      title: "Collaboration boost",
      message: "Group study sessions improve your retention by 18%. Consider more collaborative work.",
      type: "positive"
    }
  ];

  const goals = [
    { id: 1, title: "Maintain 80%+ daily engagement", progress: 71, current: 5, target: 7, unit: "days" },
    { id: 2, title: "Ask 10 questions this week", progress: 70, current: 7, target: 10, unit: "questions" },
    { id: 3, title: "Complete all quizzes same-day", progress: 67, current: 8, target: 12, unit: "quizzes" }
  ];

  const getHeatmapColor = (value) => {
    if (value === 0) return '#F5F5F5';
    if (value < 20) return '#E3F2FD';
    if (value < 40) return '#BBDEFB';
    if (value < 60) return '#64B5F6';
    if (value < 75) return '#2196F3';
    if (value < 85) return '#1976D2';
    return '#0D47A1';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-600">Deep dive into your learning patterns and study habits</p>
          </div>
        </div>
      </div>

      {/* Time Period & Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimePeriod('last7')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'last7' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimePeriod('last30')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'last30' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimePeriod('semester')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'semester' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Semester
            </button>
            <button
              onClick={() => setTimePeriod('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timePeriod === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="comparison">Comparison</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Learning Pattern Overview - Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Peak Performance Time */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Sunrise className="w-8 h-8 opacity-90" />
            <Info className="w-4 h-4 opacity-70 cursor-pointer" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-2">Peak Performance Time</h3>
          <p className="text-2xl font-bold mb-1">
            {learningPatterns.peakTime.start} - {learningPatterns.peakTime.end}
          </p>
          <p className="text-sm opacity-80">
            You're {learningPatterns.peakTime.improvement}% more focused in morning hours
          </p>
        </div>

        {/* Average Focus Duration */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Focus Duration</h3>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {learningPatterns.focusDuration.current} minutes
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(learningPatterns.focusDuration.current / learningPatterns.focusDuration.target) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{learningPatterns.focusDuration.target}m</span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ {learningPatterns.focusDuration.current - learningPatterns.focusDuration.previous} minutes from last month
          </p>
        </div>

        {/* Learning Style */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Learning Style Indicator</h3>
          <p className="text-2xl font-bold text-gray-800 mb-3">
            Visual Learner - {learningPatterns.learningStyle.visual}%
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${learningPatterns.learningStyle.visual}%` }} />
              </div>
              <span className="text-xs text-gray-600 w-8">{learningPatterns.learningStyle.visual}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">You engage most with visual content</p>
        </div>

        {/* Consistency Score */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-green-500" />
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Consistency Score</h3>
          <div className="flex items-center gap-4 mb-2">
            <p className="text-4xl font-bold text-gray-800">{learningPatterns.consistencyScore}</p>
            <span className="text-gray-400 text-xl">/100</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 ${
                  i < Math.floor(learningPatterns.consistencyScore / 20) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </div>
            ))}
          </div>
          <p className="text-sm text-green-600">Steady improvement in routine</p>
        </div>
      </div>

      {/* Weekly Engagement Heatmap */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Weekly Engagement Heatmap</h2>
            <p className="text-sm text-gray-600">Hourly engagement patterns throughout the week</p>
          </div>
          <Calendar className="w-6 h-6 text-blue-500" />
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex">
              <div className="w-16 flex-shrink-0" />
              <div className="flex-1 flex">
                {hours.map((hour) => (
                  <div key={hour} className="flex-1 min-w-[60px] text-center text-xs font-medium text-gray-600 mb-2">
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {heatmapData.map((row) => (
              <div key={row.day} className="flex mb-1">
                <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-700 flex items-center">
                  {row.day}
                </div>
                <div className="flex-1 flex gap-1">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 min-w-[60px] h-12 rounded cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 relative group"
                      style={{ backgroundColor: getHeatmapColor(row[hour]) }}
                      onClick={() => setSelectedHeatmapCell({ day: row.day, hour, value: row[hour] })}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-gray-800 bg-white px-2 py-1 rounded shadow">
                          {row[hour]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <strong>Pattern detected:</strong> You're most engaged Monday mornings (9-11 AM)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Low</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 90].map((val) => (
                <div key={val} className="w-6 h-4 rounded" style={{ backgroundColor: getHeatmapColor(val) }} />
              ))}
            </div>
            <span className="text-xs text-gray-600">High</span>
          </div>
        </div>
      </div>

      {/* Behavioral Analytics Dashboard */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Behavioral Analytics</h2>
          <p className="text-sm text-gray-600">Deep dive into your engagement patterns by category</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'cognitive', label: 'Cognitive', icon: Brain },
            { id: 'interactive', label: 'Interactive', icon: Zap },
            { id: 'social', label: 'Social', icon: Users },
            { id: 'emotional', label: 'Emotional', icon: Heart },
            { id: 'focus', label: 'Focus', icon: Eye }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'cognitive' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cognitive Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={behaviorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Engagement %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cognitive" stroke="#2196F3" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Sub-Behavior Breakdown</h4>
                  <div className="space-y-3">
                    {cognitiveBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.value}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 w-10">{item.value}%</span>
                          {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Correlation Insight</h4>
                      <p className="text-sm text-gray-700">
                        Your note-taking frequency improves by 22% on days when you get 7+ hours of sleep. 
                        Consider prioritizing rest before important classes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactive' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Participation Across Subjects</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={participationBySubject}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" />
                    <YAxis yAxisId="left" label={{ value: 'Questions', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="questions" fill="#2196F3" name="Questions Asked" />
                    <Bar yAxisId="right" dataKey="accuracy" fill="#4CAF50" name="Response Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Questions This Week</p>
                  <p className="text-3xl font-bold text-gray-800">36</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Average Response Rate</p>
                  <p className="text-3xl font-bold text-gray-800">85%</p>
                  <p className="text-xs text-gray-600 mt-1">Excellent engagement</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium mb-1">💡 Insight</p>
                  <p className="text-xs text-gray-700">
                    You participate 40% more in Math than Chemistry. Consider asking more questions in Chemistry to boost understanding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Mode Effectiveness</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { mode: 'Solo Study', engagement: 76, retention: 72 },
                      { mode: 'Group Study', engagement: 79, retention: 85 },
                      { mode: 'Peer Teaching', engagement: 82, retention: 90 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mode" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="engagement" fill="#2196F3" name="Engagement %" />
                      <Bar dataKey="retention" fill="#4CAF50" name="Retention %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Collaboration Frequency</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Group Sessions</span>
                        <span className="text-lg font-bold text-gray-800">8/month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }} />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Peer Help (Given)</span>
                        <span className="text-lg font-bold text-gray-800">12 times</span>
                      </div>
                      <p className="text-xs text-gray-600">Teaching others improves your retention</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Impact:</strong> Group study boosts your Chemistry scores by 15% compared to solo study.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emotional' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotional Engagement Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={behaviorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="emotional" stackId="1" stroke="#E91E63" fill="#E91E63" fillOpacity={0.6} name="Overall Emotion" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Subject-wise Emotions</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { subject: 'Math', interest: 88, confusion: 15, frustration: 8 },
                      { subject: 'Physics', interest: 82, confusion: 22, frustration: 12 },
                      { subject: 'Chemistry', interest: 70, confusion: 35, frustration: 25 },
                      { subject: 'English', interest: 85, confusion: 10, frustration: 5 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="interest" fill="#4CAF50" name="Interest" />
                      <Bar dataKey="confusion" fill="#FF9800" name="Confusion" />
                      <Bar dataKey="frustration" fill="#F44336" name="Frustration" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Alert Detected</h4>
                        <p className="text-sm text-gray-700">
                          Frustration spikes in Physics after 15 minutes. Consider breaking lessons into shorter segments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Satisfaction Trend</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Satisfaction</span>
                      <span className="text-xl font-bold text-gray-800">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }} />
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 5% improvement over last month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Focus Duration Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={behaviorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="focus" stroke="#673AB7" strokeWidth={2} dot={{ r: 2 }} name="Focus Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg. Time to First Distraction</p>
                  <p className="text-3xl font-bold text-gray-800">28 min</p>
                  <p className="text-xs text-green-600 mt-1">↑ 4 min improvement</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Daily Distractions</p>
                  <p className="text-3xl font-bold text-gray-800">5.2</p>
                  <p className="text-xs text-orange-600 mt-1">↓ 1.8 from last month</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Recovery Speed</p>
                  <p className="text-3xl font-bold text-gray-800">2.5 min</p>
                  <p className="text-xs text-gray-600 mt-1">Time to refocus</p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">Distraction Frequency by Time</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { time: '8-10 AM', distractions: 2 },
                    { time: '10-12 PM', distractions: 3 },
                    { time: '12-2 PM', distractions: 5 },
                    { time: '2-4 PM', distractions: 7 },
                    { time: '4-6 PM', distractions: 6 },
                    { time: '6-8 PM', distractions: 4 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="distractions" fill="#F44336" name="Distractions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Study Habits & Insights - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Study Habits Analysis - Left Column (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Study Habits Analysis</h2>

          <div className="space-y-6">
            {/* Session Duration Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Duration Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sessionDurationDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="duration" />
                  <YAxis yAxisId="left" label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Effectiveness %', angle: 90, position: 'insideRight' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#2196F3" name="Session Count" />
                  <Bar yAxisId="right" dataKey="effectiveness" fill="#4CAF50" name="Effectiveness %" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Sweet spot:</strong> Your 30-45 minute sessions show 85% engagement vs 65% for 60+ minute sessions
              </p>
            </div>

            {/* Subject Time Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Study Time vs Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={subjectTimeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectTimeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {subjectTimeDistribution.map((subject) => (
                    <div key={subject.name} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: subject.color }} />
                          <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{subject.score}%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {subject.value}% of study time
                        {subject.score > subject.value * 2 && (
                          <span className="text-green-600 ml-2">✓ Efficient!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> You spend 30% time on Math but score 88% - very efficient! 
                  Consider more time on Chemistry (20% time, 72% score) to improve performance.
                </p>
              </div>
            </div>

            {/* Break Patterns */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Break Patterns</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Coffee className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Average Break Frequency</p>
                  <p className="text-2xl font-bold text-gray-800">Every 35 min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Average Break Duration</p>
                  <p className="text-2xl font-bold text-gray-800">6 minutes</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-sm text-gray-700 font-medium mb-1">Optimal Pattern</p>
                  <p className="text-xs text-gray-700">5-min break every 35 min for peak focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Insights Panel - Right Column (1/3) */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-800">Insights for You</h2>
          </div>

          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 ${
                  insight.type === 'positive'
                    ? 'bg-white border border-green-200'
                    : 'bg-white border border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'positive' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <insight.icon className={`w-5 h-5 ${
                      insight.type === 'positive' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-800">AI Prediction</h4>
            </div>
            <p className="text-sm text-gray-700">
              Based on your patterns, you might feel tired during tomorrow's 2 PM Chemistry class. 
              Consider a light snack and quick walk beforehand.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Correlations */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Correlations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sleep vs Engagement */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sleep vs Engagement Correlation</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sleep" name="Hours of Sleep" label={{ value: 'Hours of Sleep', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="engagement" name="Engagement %" label={{ value: 'Engagement %', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={sleepCorrelation} fill="#2196F3" />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Finding:</strong> 7+ hours of sleep correlates with 18% higher engagement
            </p>
          </div>

          {/* Time of Day Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Time of Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={[
                { subject: 'Morning', value: 85 },
                { subject: 'Afternoon', value: 71 },
                { subject: 'Evening', value: 68 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Engagement" dataKey="value" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Best time:</strong> Morning classes show 84% average engagement
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Study Environment Impact</h4>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">82%</p>
                <p className="text-sm text-gray-600">Classroom</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">68%</p>
                <p className="text-sm text-gray-600">Home</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Classroom environment boosts your focus</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Optimal Quiz Timing</h4>
            <p className="text-sm text-gray-700 mb-3">
              Your quiz performance peaks when taken 1-3 hours after class ends.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '88%' }} />
              </div>
              <span className="text-sm font-semibold text-gray-800">88%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Analytics & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Comparative Analytics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Comparative Analytics</h2>
              <p className="text-sm text-gray-600">Anonymous benchmarking with your peers</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showComparative}
                onChange={(e) => setShowComparative(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Enable</span>
            </label>
          </div>

          {showComparative ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Overall Ranking</p>
                  <p className="text-3xl font-bold">Top 25%</p>
                  <p className="text-xs opacity-80 mt-1">Among your grade level</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Question Activity</p>
                  <p className="text-3xl font-bold">2.1x</p>
                  <p className="text-xs opacity-80 mt-1">More than average student</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Consistency</p>
                  <p className="text-3xl font-bold">Top 30%</p>
                  <p className="text-xs opacity-80 mt-1">Study routine rating</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How You Compare</h3>
                <div className="space-y-3">
                  {[
                    { metric: 'Daily Engagement', you: 79, avg: 68, unit: '%' },
                    { metric: 'Focus Duration', you: 32, avg: 25, unit: 'min' },
                    { metric: 'Questions Per Week', you: 9, avg: 4, unit: '' },
                    { metric: 'Session Frequency', you: 4, avg: 3, unit: '/day' }
                  ].map((item) => (
                    <div key={item.metric} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">Avg: {item.avg}{item.unit}</span>
                          <span className="text-sm font-semibold text-blue-600">You: {item.you}{item.unit}</span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-2">
                        <div className="absolute bg-gray-400 h-2 rounded-full" style={{ width: `${(item.avg / Math.max(item.you, item.avg)) * 100}%` }} />
                        <div className="absolute bg-blue-500 h-2 rounded-full" style={{ width: `${(item.you / Math.max(item.you, item.avg)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  <strong>Privacy Note:</strong> All comparisons are anonymous and aggregated. No individual student data is shared.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">Comparative analytics is currently disabled</p>
              <p className="text-sm text-gray-500">Enable it to see how your patterns compare with peers</p>
            </div>
          )}
        </div>

        {/* Goal Tracking */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Your Goals</h2>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">{goal.title}</h4>
                  {goal.progress >= 70 && <Award className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        goal.progress >= 100 ? 'bg-green-500' : goal.progress >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className="font-semibold text-gray-800">{goal.progress}%</span>
                </div>
                {goal.progress >= 70 && goal.progress < 100 && (
                  <p className="text-xs text-blue-600 mt-2">
                    You're {goal.target - goal.current} {goal.unit} away from your goal!
                  </p>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            Set New Goal
          </button>
        </div>
      </div>

      {/* Export & Sharing Options */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Export & Share Your Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Create Custom Report
          </button>
          <button className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Share with Guardian
          </button>
          <button className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Export Raw Data (CSV)
          </button>
        </div>
      </div>

      {/* Heatmap Cell Detail Modal */}
      {selectedHeatmapCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedHeatmapCell(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {selectedHeatmapCell.day} at {selectedHeatmapCell.hour}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Level</span>
                <span className="text-xl font-bold text-blue-600">{selectedHeatmapCell.value}%</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 mb-1"><strong>Primary Subject:</strong> Mathematics</p>
                <p className="text-sm text-gray-700 mb-1"><strong>Key Behaviors:</strong> Active listening, note-taking</p>
                <p className="text-sm text-gray-700"><strong>Focus Quality:</strong> High</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  This time slot shows {selectedHeatmapCell.value >= 80 ? 'excellent' : selectedHeatmapCell.value >= 60 ? 'good' : 'moderate'} engagement. 
                  {selectedHeatmapCell.value >= 80 && ' Keep this momentum going!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedHeatmapCell(null)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

