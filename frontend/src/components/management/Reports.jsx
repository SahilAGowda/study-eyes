import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  RadarChart, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
   AreaChart, Area, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

// Mock Data
const mockData = {
  departments: [
    { name: 'Computer Science', teachers: 8, students: 135, engagement: 80, attendance: 91, quizAvg: 82, studyHours: 2430, trend: 'up' },
    { name: 'Mathematics', teachers: 8, students: 156, engagement: 78, attendance: 90, quizAvg: 84, studyHours: 2808, trend: 'up' },
    { name: 'Biology', teachers: 7, students: 142, engagement: 76, attendance: 88, quizAvg: 79, studyHours: 2556, trend: 'up' },
    { name: 'Chemistry', teachers: 5, students: 98, engagement: 75, attendance: 89, quizAvg: 80, studyHours: 1764, trend: 'up' },
    { name: 'Physics', teachers: 6, students: 132, engagement: 72, attendance: 85, quizAvg: 76, studyHours: 2376, trend: 'flat' },
    { name: 'English', teachers: 8, students: 184, engagement: 70, attendance: 87, quizAvg: 74, studyHours: 3312, trend: 'down' }
  ],
  teachers: [
    { name: 'Dr. Sarah Johnson', department: 'Computer Science', engagement: 92, rank: 1 },
    { name: 'Prof. Michael Chen', department: 'Mathematics', engagement: 89, rank: 2 },
    { name: 'Dr. Emily Rodriguez', department: 'Biology', engagement: 87, rank: 3 },
    { name: 'Dr. James Wilson', department: 'Chemistry', engagement: 85, rank: 4 },
    { name: 'Prof. Lisa Thompson', department: 'Physics', engagement: 83, rank: 5 },
    { name: 'Dr. Robert Brown', department: 'Computer Science', engagement: 45, rank: 38 },
    { name: 'Ms. Amanda Davis', department: 'English', engagement: 42, rank: 39 },
    { name: 'Mr. Christopher Lee', department: 'Mathematics', engagement: 38, rank: 40 },
    { name: 'Dr. Patricia Miller', department: 'Biology', engagement: 35, rank: 41 },
    { name: 'Prof. David Taylor', department: 'English', engagement: 32, rank: 42 }
  ],
  students: [
    { tier: 'High (75%+)', count: 612, percentage: 72 },
    { tier: 'Medium (60-74%)', count: 161, percentage: 19 },
    { tier: 'Low (40-59%)', count: 51, percentage: 6 },
    { tier: 'At Risk (<40%)', count: 23, percentage: 3 }
  ],
  engagementOverTime: [
    { week: 'Week 1', overall: 30, compsci: 45, math: 60, biology: 50, chemistry: 23 , physics: 56, english: 63 },
    { week: 'Week 2', overall: 40, compsci: 50, math: 40, biology: 58, chemistry: 30, physics: 57, english: 65 },
    { week: 'Week 3', overall: 75, compsci: 57, math: 50, biology: 73, chemistry: 30, physics: 75, english: 67 },
    { week: 'Week 4', overall: 74, compsci: 80, math: 78, biology: 76, chemistry: 75, physics: 72, english: 70 }
  ],
  behavioralInsights: [
    { category: 'Cognitive Engagement', value: 78, fullMark: 100 },
    { category: 'Interactive Participation', value: 72, fullMark: 100 },
    { category: 'Social Learning', value: 74, fullMark: 100 },
    { category: 'Emotional Indicators', value: 76, fullMark: 100 },
    { category: 'Focus Level', value: 75, fullMark: 100 }
  ],
  issues: [
    { issue: 'English department 4% below target', type: 'regular', priority: 'medium', status: 'pending' },
    { issue: '23 students at risk - intervention needed', type: 'regular', priority: 'high', status: 'pending' },
    { issue: 'Friday attendance 8% lower', type: 'regular', priority: 'medium', status: 'pending' },
    { issue: 'Physics quiz scores trending down', type: 'regular', priority: 'medium', status: 'pending' },
    { issue: 'Schedule professional development for English dept', type: 'ai', priority: 'high', status: 'new' },
    { issue: 'Implement peer tutoring for at-risk students', type: 'ai', priority: 'high', status: 'new' },
    { issue: 'Consider interactive Friday sessions', type: 'ai', priority: 'medium', status: 'new' },
    { issue: 'Review Physics teaching materials', type: 'ai', priority: 'medium', status: 'new' }
  ],
  systemUsage: [
    { feature: 'Live Classes', sessions: 1245 },
    { feature: 'Quizzes Taken', sessions: 7128 },
    { feature: 'Reports Generated', sessions: 456 },
    { feature: 'Messages Sent', sessions: 2341 }
  ],
  quizStats: {
    totalQuizzes: 342,
    completionRate: 84,
    averageScore: 76,
    aiGenerated: 58
  }
};

const COLORS = ['#FF9800', '#FFB74D', '#FFC107', '#FFD54F', '#FFE082', '#FFF8E1'];

// CSS styles (you can move these to a separate CSS file if preferred)
const styles = `
  :root {
    --primary-orange: #FF9800;
    --orange-light: #FFB74D;
    --orange-dark: #F57C00;
    --orange-bg: #FFF8E1;
  }
  
  .bg-primary-orange { background-color: var(--primary-orange); }
  .text-primary-orange { color: var(--primary-orange); }
  .border-primary-orange { border-color: var(--primary-orange); }
  
  .btn-orange {
    background-color: var(--primary-orange);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .btn-orange:hover {
    background-color: var(--orange-dark);
  }
  
  .card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e5e7eb;
  }
  
  .metric-card {
    background: linear-gradient(135deg, var(--primary-orange), var(--orange-light));
    color: white;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }
  
  .trend-up { color: #10b981; }
  .trend-down { color: #ef4444; }
  
  .tab-active {
    background-color: var(--primary-orange);
    color: white;
  }
  
  .tab-inactive {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .recharts-wrapper {
    margin: 0 auto;
  }
`;

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedReportType, setSelectedReportType] = useState('Comprehensive');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showTopPerformers, setShowTopPerformers] = useState(true);
  const [issueFilter, setIssueFilter] = useState('all');

  // Filtered data based on selections
  const filteredDepartments = useMemo(() => {
    if (selectedDepartment === 'All Departments') return mockData.departments;
    return mockData.departments.filter(dept => dept.name === selectedDepartment);
  }, [selectedDepartment]);

  // Sorted data
  const sortedDepartments = useMemo(() => {
    if (!sortConfig.key) return filteredDepartments;
    
    return [...filteredDepartments].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredDepartments, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const exportReport = (format) => {
    alert(`Exporting ${selectedReportType} report for ${selectedPeriod} in ${format.toUpperCase()} format...`);
  };

  const generateReport = () => {
    alert(`Generating ${selectedReportType} report for ${selectedPeriod}...`);
  };

  const filteredIssues = mockData.issues.filter(issue => {
    if (issueFilter === 'ai' && issue.type !== 'ai') return false;
    if (issueFilter === 'regular' && issue.type !== 'regular') return false;
    if (issueFilter === 'high' && issue.priority !== 'high') return false;
    return true;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-orange mb-2">
              Educational Institution Management Dashboard
            </h1>
            <p className="text-gray-600">Comprehensive Analytics & Performance Monitoring</p>
          </div>

          {/* 1. Report Configuration */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Report Configuration</h2>
            
            {/* Time Period Tabs */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
              <div className="flex space-x-2">
                {['This Week', 'This Month', 'This Semester', 'This Year', 'Custom'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                >
                  <option>All Departments</option>
                  {mockData.departments.map(dept => (
                    <option key={dept.name} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select 
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                >
                  <option>Comprehensive</option>
                  <option>Engagement Only</option>
                  <option>Academic</option>
                  <option>Attendance</option>
                </select>
              </div>
              
              <div>
                <button onClick={generateReport} className="btn-orange w-full">
                  Generate Report
                </button>
              </div>
              
              <div>
                <div className="flex space-x-2">
                  <button onClick={() => exportReport('pdf')} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">
                    PDF
                  </button>
                  <button onClick={() => exportReport('csv')} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">
                    CSV
                  </button>
                  <button onClick={() => exportReport('excel')} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-2">Overall Engagement</h3>
              <div className="text-4xl font-bold mb-1">74%</div>
              <div className="text-sm opacity-90">
                <span className="trend-up">↑3%</span> from last period
              </div>
            </div>
            
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-2">Total Active Users</h3>
              <div className="text-4xl font-bold mb-1">889</div>
              <div className="text-sm opacity-90">
                847 students + 42 teachers
              </div>
            </div>
            
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-2">System Usage</h3>
              <div className="text-4xl font-bold mb-1">18,450</div>
              <div className="text-sm opacity-90">
                hours total
              </div>
            </div>
            
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
              <div className="text-4xl font-bold mb-1">84%</div>
              <div className="text-sm opacity-90">
                quiz average
              </div>
            </div>
          </div>

          {/* 3. Department Performance Comparison */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Department Performance Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Department {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('teachers')}
                    >
                      Teachers {sortConfig.key === 'teachers' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('students')}
                    >
                      Students {sortConfig.key === 'students' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('engagement')}
                    >
                      Avg Engagement {sortConfig.key === 'engagement' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('attendance')}
                    >
                      Attendance {sortConfig.key === 'attendance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quizAvg')}
                    >
                      Quiz Avg {sortConfig.key === 'quizAvg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('studyHours')}
                    >
                      Study Hours {sortConfig.key === 'studyHours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-3 border-b-2 border-gray-200">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDepartments.map((dept, index) => (
                    <tr key={dept.name} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-medium">{dept.name}</td>
                      <td className="p-3 border-b border-gray-200">{dept.teachers}</td>
                      <td className="p-3 border-b border-gray-200">{dept.students}</td>
                      <td className="p-3 border-b border-gray-200">
                        <span className="text-primary-orange font-semibold">{dept.engagement}%</span>
                      </td>
                      <td className="p-3 border-b border-gray-200">{dept.attendance}%</td>
                      <td className="p-3 border-b border-gray-200">{dept.quizAvg}%</td>
                      <td className="p-3 border-b border-gray-200">{dept.studyHours.toLocaleString()}h</td>
                      <td className="p-3 border-b border-gray-200">
                        <span className={dept.trend === 'up' ? 'trend-up' : dept.trend === 'down' ? 'trend-down' : 'text-yellow-600'}>
                          {dept.trend === 'up' ? '↑' : dept.trend === 'down' ? '↓' : '→'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Engagement Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Engagement Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.engagementOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="overall" stroke="#FF9800" strokeWidth={3} name="Overall" />
                  <Line type="monotone" dataKey="compsci" stroke="#FF5722" strokeWidth={2} name="Comp Sci" />
                  <Line type="monotone" dataKey="math" stroke="#4CAF50" strokeWidth={2} name="Math" />
                  <Line type="monotone" dataKey="biology" stroke="#2196F3" strokeWidth={2} name="Biology" />
                  <Line type="monotone" dataKey="chemistry" stroke="#9C27B0" strokeWidth={2} name="Chemistry" />
                  <Line type="monotone" dataKey="physics" stroke="#FF9800" strokeWidth={2} name="Physics" />
                  <Line type="monotone" dataKey="english" stroke="#607D8B" strokeWidth={2} name="English" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600">
                <p>• Target line: 75% (shown in orange)</p>
                <p>• Peak engagement: Weekday mornings 9-11 AM</p>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Engagement Heatmap</h2>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center font-medium p-2">{day}</div>
                ))}
                {Array.from({length: 7}, (_, i) => (
                  Array.from({length: 24}, (_, j) => (
                    <div 
                      key={`${i}-${j}`}
                      className="w-3 h-3 border"
                      style={{ backgroundColor: i < 5 && j >= 9 && j <= 11 ? '#FF9800' : i < 5 && j >= 14 && j <= 16 ? '#FFB74D' : '#f3f4f6' }}
                    />
                  ))
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-orange"></div>
                  <span>High (90-100%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-light"></div>
                  <span>Medium (70-89%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200"></div>
                  <span>Low (70%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Student Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Student Performance Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.students}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({tier, percentage}) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockData.students.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {mockData.students.map((student, index) => (
                  <div key={student.tier} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                      <span className="text-sm">{student.tier}</span>
                    </div>
                    <span className="text-sm font-medium">{student.count} students</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Department-wise Performance</h2>
              <div className="space-y-4">
                {mockData.departments.map((dept, index) => (
                  <div key={dept.name} className="border-l-4 pl-4" style={{borderColor: COLORS[index % COLORS.length]}}>
                    <h3 className="font-medium">{dept.name}</h3>
                    <div className="text-sm text-gray-600">
                      High: {Math.floor(dept.students * 0.72)}, 
                      Medium: {Math.floor(dept.students * 0.19)}, 
                      Low: {Math.floor(dept.students * 0.06)}, 
                      At Risk: {Math.floor(dept.students * 0.03)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Teacher Performance Metrics */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Teacher Performance Metrics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div>Teachers meeting targets (75%): <span className="font-semibold">35/42 (83%)</span></div>
                  <div>Average classes per teacher: <span className="font-semibold">3.7</span></div>
                  <div>Average students per teacher: <span className="font-semibold">20.2</span></div>
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-4">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { range: '90%+', count: 8 },
                    { range: '80-89%', count: 15 },
                    { range: '70-79%', count: 12 },
                    { range: '60-69%', count: 5 },
                    { range: '<60%', count: 2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <div className="flex space-x-4 mb-4">
                  <button 
                    onClick={() => setShowTopPerformers(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      showTopPerformers ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Top 5 Performers
                  </button>
                  <button 
                    onClick={() => setShowTopPerformers(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      !showTopPerformers ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Bottom 5 Performers
                  </button>
                </div>
                
                <div className="space-y-3">
                  {mockData.teachers
                    .filter(teacher => showTopPerformers ? teacher.rank <= 5 : teacher.rank >= 38)
                    .map((teacher, index) => (
                    <div key={teacher.name} className={`p-3 rounded-lg border ${showTopPerformers ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-gray-600">{teacher.department}</div>
                        </div>
                        <div className={`text-lg font-bold ${showTopPerformers ? 'text-green-600' : 'text-red-600'}`}>
                          {teacher.engagement}%
                        </div>
                      </div>
                      {showTopPerformers && (
                        <div className="text-xs text-green-600 mt-1">Rank #{teacher.rank}</div>
                      )}
                      {!showTopPerformers && (
                        <div className="text-xs text-red-600 mt-1">Rank #{teacher.rank} - Support needed</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7. Attendance & Participation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Attendance by Department</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockData.departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#FF9800" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-sm text-gray-600">
                Institution Average: <span className="font-semibold">89%</span> (↑2% from last period)
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Participation Metrics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Questions Asked</span>
                  <span className="font-semibold text-primary-orange">1,248</span>
                </div>
                <div className="text-xs text-gray-600 ml-4">Average: 1.5 per student/week</div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Quizzes Completed</span>
                  <span className="font-semibold text-primary-orange">7,128</span>
                </div>
                <div className="text-xs text-gray-600 ml-4">84% completion rate</div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Group Activities</span>
                  <span className="font-semibold text-primary-orange">342</span>
                </div>
                <div className="text-xs text-gray-600 ml-4">Sessions conducted</div>
              </div>
            </div>
          </div>

          {/* 8. Quiz & Assessment Analytics */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quiz & Assessment Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Overall Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-orange">{mockData.quizStats.totalQuizzes}</div>
                    <div className="text-sm text-gray-600">Total Quizzes</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-orange">{mockData.quizStats.completionRate}%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-orange">{mockData.quizStats.averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-orange">{mockData.quizStats.aiGenerated}%</div>
                    <div className="text-sm text-gray-600">AI Generated</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Question Difficulty Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Easy Questions</span>
                    <span className="font-semibold text-green-600">78% avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medium Questions</span>
                    <span className="font-semibold text-yellow-600">76% avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hard Questions</span>
                    <span className="font-semibold text-red-600">68% avg</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-4">Department Quiz Scores</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockData.departments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quizAvg" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 9. Behavioral Insights */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Behavioral Insights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Institution-wide Aggregate Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockData.behavioralInsights}>
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#FF9800"
                      fill="#FF9800"
                      fillOpacity={0.3}
                    />
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {mockData.behavioralInsights.map((category, index) => (
                    <div key={category.category} className="flex justify-between items-center">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-orange h-2 rounded-full" 
                            style={{width: `${category.value}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-8">{category.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Highest performance: Cognitive Engagement (78%)</li>
                    <li>• Growth area: Interactive Participation (72%)</li>
                    <li>• All categories above 70% threshold</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 10. System Usage Statistics */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">System Usage Statistics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform Engagement</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-primary-orange">4,234</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-primary-orange">38 min</div>
                    <div className="text-sm text-gray-600">Avg Session</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-primary-orange">9-11 AM</div>
                    <div className="text-sm text-gray-600">Peak Hours</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-primary-orange">Tue-Thu</div>
                    <div className="text-sm text-gray-600">Most Active</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Feature Usage Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockData.systemUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 11. Growth & Trends */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Growth & Trends</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">74%</div>
                <div className="text-sm text-gray-600">Engagement</div>
                <div className="text-xs text-green-600">↑3% from last month</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600">Attendance</div>
                <div className="text-xs text-green-600">↑2% from last month</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">76%</div>
                <div className="text-sm text-gray-600">Quiz Scores</div>
                <div className="text-xs text-green-600">↑1% from last month</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">889</div>
                <div className="text-sm text-gray-600">Active Users</div>
                <div className="text-xs text-green-600">↑15 from last month</div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.engagementOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="overall" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} name="Overall Trend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 12. Issues & Recommendations */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Issues & Recommendations</h2>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={() => setIssueFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  issueFilter === 'all' ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                }`}
              >
                All Issues
              </button>
              <button 
                onClick={() => setIssueFilter('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  issueFilter === 'high' ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                }`}
              >
                High Priority
              </button>
              <button 
                onClick={() => setIssueFilter('ai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  issueFilter === 'ai' ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                }`}
              >
                AI Recommendations
              </button>
              <button 
                onClick={() => setIssueFilter('regular')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  issueFilter === 'regular' ? 'btn-orange' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Regular Issues
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Identified Concerns</h3>
                <div className="space-y-3">
                  {filteredIssues.filter(issue => issue.type === 'regular').map((issue, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{issue.issue}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.priority}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">{issue.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {filteredIssues.filter(issue => issue.type === 'ai').map((issue, index) => (
                    <div key={index} className="p-4 border border-primary-orange bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{issue.issue}</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary-orange text-white">
                          AI
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">{issue.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>Educational Institution Management Dashboard • Last updated: {new Date().toLocaleDateString()}</p>
            <p>Data represents institutional performance metrics for the selected time period</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;