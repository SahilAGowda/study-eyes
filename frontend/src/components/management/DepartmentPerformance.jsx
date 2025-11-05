import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BookOpen,
  Clock,
  Target,
  Award,
  ChevronRight,
  Star,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  DollarSign,
  Zap,
  User,
  Trophy,
  X
} from 'lucide-react';

const DepartmentPerformance = () => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [comparisonMode, setComparisonMode] = useState('Side-by-Side');
  const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
  const [sortBy, setSortBy] = useState('engagement');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);

  // Mock data
  const departments = [
    {
      name: 'Computer Science',
      teachers: 8,
      students: 135,
      classes: 32,
      engagement: 80,
      attendance: 91,
      quizAvg: 82,
      studyHours: 2430,
      rank: 1,
      trend: 'up',
      ratio: 16.9,
      high: 108,
      medium: 21,
      low: 5,
      atRisk: 1,
      budget: 125000,
      quizzes: 56,
      head: 'Dr. Kumar',
      headYears: 5,
      satisfaction: 4.5,
      headGrowth: 5
    },
    {
      name: 'Mathematics',
      teachers: 8,
      students: 156,
      classes: 38,
      engagement: 78,
      attendance: 90,
      quizAvg: 84,
      studyHours: 2808,
      rank: 2,
      trend: 'up',
      ratio: 19.5,
      high: 125,
      medium: 23,
      low: 6,
      atRisk: 2,
      budget: 118000,
      quizzes: 62,
      head: 'Prof. Smith',
      headYears: 8,
      satisfaction: 4.3,
      headGrowth: 4
    },
    {
      name: 'Biology',
      teachers: 7,
      students: 142,
      classes: 34,
      engagement: 76,
      attendance: 88,
      quizAvg: 79,
      studyHours: 2556,
      rank: 3,
      trend: 'up',
      ratio: 20.3,
      high: 109,
      medium: 26,
      low: 6,
      atRisk: 1,
      budget: 98000,
      quizzes: 48,
      head: 'Dr. Patel',
      headYears: 3,
      satisfaction: 4.4,
      headGrowth: 3
    },
    {
      name: 'Chemistry',
      teachers: 5,
      students: 98,
      classes: 24,
      engagement: 75,
      attendance: 89,
      quizAvg: 80,
      studyHours: 1764,
      rank: 4,
      trend: 'stable',
      ratio: 19.6,
      high: 74,
      medium: 18,
      low: 5,
      atRisk: 1,
      budget: 85000,
      quizzes: 35,
      head: 'Ms. Lee',
      headYears: 4,
      satisfaction: 4.2,
      headGrowth: 0
    },
    {
      name: 'Physics',
      teachers: 6,
      students: 132,
      classes: 28,
      engagement: 72,
      attendance: 85,
      quizAvg: 76,
      studyHours: 2376,
      rank: 5,
      trend: 'stable',
      ratio: 22.0,
      high: 95,
      medium: 28,
      low: 7,
      atRisk: 2,
      budget: 92000,
      quizzes: 42,
      head: 'Mr. Chen',
      headYears: 2,
      satisfaction: 4.0,
      headGrowth: -2
    },
    {
      name: 'English',
      teachers: 8,
      students: 184,
      classes: 44,
      engagement: 70,
      attendance: 87,
      quizAvg: 74,
      studyHours: 3312,
      rank: 6,
      trend: 'down',
      ratio: 23.0,
      high: 101,
      medium: 44,
      low: 22,
      atRisk: 17,
      budget: 105000,
      quizzes: 68,
      head: 'Dr. Brown',
      headYears: 6,
      satisfaction: 3.8,
      headGrowth: -4
    }
  ];

  // Trend data for 30 days
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    ComputerScience: 75 + Math.random() * 10 + (i > 15 ? 5 : 0),
    Mathematics: 74 + Math.random() * 8 + (i > 10 ? 4 : 0),
    Biology: 73 + Math.random() * 6 + (i > 5 ? 3 : 0),
    Chemistry: 74 + Math.random() * 3,
    Physics: 74 + Math.random() * 4 - (i > 20 ? 2 : 0),
    English: 74 + Math.random() * 6 - (i > 15 ? 4 : 0)
  }));

  // Radar chart data
  const radarData = departments.map(dept => ({
    department: dept.name.split(' ')[0], // Shortened name for chart
    engagement: dept.engagement,
    attendance: dept.attendance,
    quizAvg: dept.quizAvg,
    satisfaction: (dept.satisfaction * 20), // Convert to percentage
    teachers: (dept.teachers / 8) * 100 // Normalize to 100%
  }));

  // Grouped bar chart data
  const barChartData = departments.map(dept => ({
    name: dept.name.split(' ')[0],
    engagement: dept.engagement,
    attendance: dept.attendance,
    quizAvg: dept.quizAvg
  }));

  // Color scheme
  const colors = ['#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#ff5722', '#795548'];

  // Student outcome distribution
  const studentOutcomes = [
    { category: 'High (75%+)', ComputerScience: 80, Mathematics: 80, Biology: 77, Chemistry: 76, Physics: 72, English: 55 },
    { category: 'Medium (60-74%)', ComputerScience: 16, Mathematics: 15, Biology: 18, Chemistry: 18, Physics: 21, English: 24 },
    { category: 'Low (40-59%)', ComputerScience: 4, Mathematics: 4, Biology: 4, Chemistry: 5, Physics: 5, English: 12 },
    { category: 'At Risk (<40%)', ComputerScience: 1, Mathematics: 1, Biology: 1, Chemistry: 1, Physics: 2, English: 9 }
  ];

  // Sort departments
  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [departments, sortBy, sortOrder]);

  // Utility functions
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 2) return 'text-yellow-600';
    if (rank <= 4) return 'text-green-600';
    return 'text-orange-600';
  };

  const getStatusColor = (ratio) => {
    if (ratio <= 18) return 'text-green-600';
    if (ratio <= 22) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportReport = () => {
    const csv = [
      ['Department', 'Teachers', 'Students', 'Classes', 'Engagement', 'Attendance', 'Quiz Avg', 'Rank'],
      ...departments.map(dept => [
        dept.name, dept.teachers, dept.students, dept.classes,
        dept.engagement + '%', dept.attendance + '%', dept.quizAvg + '%', dept.rank
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'department-performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get selected department details
  const selectedDeptData = departments.find(d => d.name === selectedDepartment);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
         <div className="mb-6">
        <h1 className="text-4xl font-bold text-orange-400 text-center mb-2">Department Performance Overview</h1>
        <p className="text-gray-600 text-center">Comprehensive overview of Department performance and engagement</p>
      </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md bg-white px-3 py-2"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Semester</option>
                <option>Custom</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <select 
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value)}
                className="border border-gray-300 rounded-md  bg-white px-3 py-2"
              >
                <option>Side-by-Side</option>
                <option>Trends</option>
                <option>Rankings</option>
              </select>
            </div>
            
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Performing</p>
                <p className="text-lg font-bold text-green-600">Computer Science</p>
                <p className="text-sm text-gray-500">80% engagement</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-lg font-bold text-orange-600">English</p>
                <p className="text-sm text-gray-500">70% engagement</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Average</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Comprehensive Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Department Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    Department {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('teachers')}
                  >
                    Teachers {sortBy === 'teachers' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('students')}
                  >
                    Students {sortBy === 'students' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('classes')}
                  >
                    Classes {sortBy === 'classes' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('engagement')}
                  >
                    Avg Engagement {sortBy === 'engagement' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('attendance')}
                  >
                    Attendance {sortBy === 'attendance' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('quizAvg')}
                  >
                    Quiz Avg {sortBy === 'quizAvg' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('studyHours')}
                  >
                    Study Hours {sortBy === 'studyHours' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-center py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('rank')}
                  >
                    Rank {sortBy === 'rank' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDepartments.map((dept, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDepartment(dept.name);
                      setShowDepartmentDetails(true);
                    }}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.name}</span>
                        {getTrendIcon(dept.trend)}
                      </div>
                    </td>
                    <td className="text-center py-3">{dept.teachers}</td>
                    <td className="text-center py-3">{dept.students}</td>
                    <td className="text-center py-3">{dept.classes}</td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${getRankColor(dept.rank)}`}>
                        {dept.engagement}%
                      </span>
                    </td>
                    <td className="text-center py-3">{dept.attendance}%</td>
                    <td className="text-center py-3">{dept.quizAvg}%</td>
                    <td className="text-center py-3">{dept.studyHours.toLocaleString()}h</td>
                    <td className="text-center py-3">
                      <span className={`font-bold ${getRankColor(dept.rank)}`}>
                        #{dept.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Engagement" dataKey="engagement" stroke="#ff9800" fill="#ff9800" fillOpacity={0.1} />
                <Radar name="Attendance" dataKey="attendance" stroke="#4caf50" fill="#4caf50" fillOpacity={0.1} />
                <Radar name="Quiz Avg" dataKey="quizAvg" stroke="#2196f3" fill="#2196f3" fillOpacity={0.1} />
                <Radar name="Satisfaction" dataKey="satisfaction" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.1} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Metric Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#ff9800" name="Engagement" />
                <Bar dataKey="attendance" fill="#4caf50" name="Attendance" />
                <Bar dataKey="quizAvg" fill="#2196f3" name="Quiz Avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ComputerScience" stroke="#ff9800" strokeWidth={2} name="Computer Science" />
              <Line type="monotone" dataKey="Mathematics" stroke="#4caf50" strokeWidth={2} name="Mathematics" />
              <Line type="monotone" dataKey="Biology" stroke="#2196f3" strokeWidth={2} name="Biology" />
              <Line type="monotone" dataKey="Chemistry" stroke="#9c27b0" strokeWidth={2} name="Chemistry" />
              <Line type="monotone" dataKey="Physics" stroke="#ff5722" strokeWidth={2} name="Physics" />
              <Line type="monotone" dataKey="English" stroke="#795548" strokeWidth={2} name="English" />
              <Line type="monotone" dataKey={() => 75} stroke="#666" strokeDasharray="5 5" name="Target (75%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Deep Dive */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Department Deep Dive</h3>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {departments.map(dept => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          {selectedDeptData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedDeptData.teachers}</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedDeptData.students}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedDeptData.engagement}%</div>
                  <div className="text-sm text-gray-600">Avg Engagement</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedDeptData.classes}</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
              </div>
              
              {/* Student Distribution */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-3">Student Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High', value: selectedDeptData.high, color: '#4caf50' },
                        { name: 'Medium', value: selectedDeptData.medium, color: '#ff9800' },
                        { name: 'Low', value: selectedDeptData.low, color: '#ffeb3b' },
                        { name: 'At Risk', value: selectedDeptData.atRisk, color: '#f44336' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {['#4caf50', '#ff9800', '#ffeb3b', '#f44336'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>High (75%+):</span>
                    <span className="font-medium">{selectedDeptData.high}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium (60-74%):</span>
                    <span className="font-medium">{selectedDeptData.medium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low (40-59%):</span>
                    <span className="font-medium">{selectedDeptData.low}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>At Risk (40%):</span>
                    <span className="font-medium">{selectedDeptData.atRisk}</span>
                  </div>
                </div>
              </div>
              
              {/* Class Performance */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-3">Class Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Classes:</span>
                    <span className="font-medium">{selectedDeptData.classes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization Rate:</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quiz Completion:</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Quiz Score:</span>
                    <span className="font-medium">{selectedDeptData.quizAvg}%</span>
                  </div>
                </div>
              </div>
              
              {/* Strengths & Weaknesses */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-3">Strengths & Weaknesses</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Highest engagement ({selectedDeptData.engagement}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Strong teacher performance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Could improve attendance ({selectedDeptData.attendance}% vs target 95%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Rankings & Resource Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Department Rankings</h3>
            <div className="space-y-3">
              {sortedDepartments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      {index === 0 && <span className="text-yellow-600">🥇</span>}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && <span className="text-orange-600">🥉</span>}
                      {index > 2 && <span className="text-gray-600 font-bold">#{dept.rank}</span>}
                    </div>
                    <div>
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-gray-600">
                        {dept.rank === 1 && 'Excellent performance'}
                        {dept.rank === 2 && 'Strong showing'}
                        {dept.rank === 3 && 'Above target'}
                        {dept.rank === 4 && 'Meeting target'}
                        {dept.rank === 5 && 'Needs focus'}
                        {dept.rank === 6 && 'Needs support'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getRankColor(dept.rank)}`}>{dept.engagement}%</div>
                    <div className="text-sm text-gray-600">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Department</th>
                    <th className="text-center py-2">Teachers</th>
                    <th className="text-center py-2">Students</th>
                    <th className="text-center py-2">Ratio</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDepartments.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{dept.name}</td>
                      <td className="text-center py-2">{dept.teachers}</td>
                      <td className="text-center py-2">{dept.students}</td>
                      <td className="text-center py-2">1:{dept.ratio}</td>
                      <td className="text-center py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          dept.ratio <= 18 ? 'bg-green-100 text-green-600' :
                          dept.ratio <= 22 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {dept.ratio <= 18 ? 'Optimal' : dept.ratio <= 22 ? 'Good' : 'High'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Outcomes Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Student Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentOutcomes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ComputerScience" stackId="a" fill="#ff9800" name="Computer Science" />
              <Bar dataKey="Mathematics" stackId="a" fill="#4caf50" name="Mathematics" />
              <Bar dataKey="Biology" stackId="a" fill="#2196f3" name="Biology" />
              <Bar dataKey="Chemistry" stackId="a" fill="#9c27b0" name="Chemistry" />
              <Bar dataKey="Physics" stackId="a" fill="#ff5722" name="Physics" />
              <Bar dataKey="English" stackId="a" fill="#795548" name="English" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Heads Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Department Heads Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Head</th>
                  <th className="text-center py-2">Department</th>
                  <th className="text-center py-2">Years Leading</th>
                  <th className="text-center py-2">Dept Engagement</th>
                  <th className="text-center py-2">Teacher Satisfaction</th>
                  <th className="text-center py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{dept.head}</td>
                    <td className="text-center py-2">{dept.name}</td>
                    <td className="text-center py-2">{dept.headYears}</td>
                    <td className="text-center py-2">{dept.engagement}%</td>
                    <td className="text-center py-2">{dept.satisfaction}/5</td>
                    <td className="text-center py-2">
                      <div className="flex items-center justify-center gap-1">
                        <span className={dept.headGrowth > 0 ? 'text-green-600' : dept.headGrowth < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {dept.headGrowth > 0 ? '+' : ''}{dept.headGrowth}%
                        </span>
                        {dept.headGrowth > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : 
                         dept.headGrowth < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                         <Minus className="w-4 h-4 text-gray-500" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issues & Action Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Issues & Action Items</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-600">Critical Issues</h4>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium">English Department</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    3 teachers below target, 17 at-risk students, highest ratio (1:23)
                  </div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Physics Department</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Declining engagement trend (-2%)
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Institution-wide</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Friday attendance consistently low
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-600">Action Items</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">English Department</div>
                      <div className="text-sm text-gray-600">Schedule training workshop, assign mentor teachers, hire 2 additional teachers</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Physics Department</div>
                      <div className="text-sm text-gray-600">Review curriculum, implement interactive teaching methods</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Institution-wide</div>
                      <div className="text-sm text-gray-600">Engaging Friday activities, interdepartmental collaboration program</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Comparative Insights & Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Key Findings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>STEM departments outperforming humanities (avg 76% vs 70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>English dept teacher:student ratio highest (1:23) - impacts engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Computer Science best practices: interactive labs, peer learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>English needs 2 additional teachers to reach optimal ratio</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-600">Strategic Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Hire 2 English teachers to reduce ratio</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Implement Computer Science teaching methods in other departments</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Increase professional development budget for English</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Create interdepartmental teaching observation program</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 text-purple-600">Best Practices to Share</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-700">Computer Science</div>
                <div className="text-sm text-gray-600">Gamification and hands-on projects</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-700">Mathematics</div>
                <div className="text-sm text-gray-600">Regular formative assessments</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-700">Biology</div>
                <div className="text-sm text-gray-600">Group lab activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPerformance;