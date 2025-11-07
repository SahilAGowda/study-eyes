import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BookOpen,
  Clock,
  Target,
  AlertTriangle,
  Mail,
  Eye,
  FileText,
  Calendar,
  Phone,
  Award,
  ChevronRight,
  Star,
  BookMarked,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

const TeachersOverview = () => {
  // State management
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mock data
  const teachers = [
    { id: 'TCH-012', name: 'Sarah Johnson', department: 'Mathematics', classes: 4, students: 94, engagement: 82, quizAvg: 84, attendance: 91, trend: 'up', status: 'Top Performer' },
    { id: 'TCH-024', name: 'Robert Chen', department: 'Physics', classes: 3, students: 84, engagement: 79, quizAvg: 81, attendance: 95, trend: 'up', status: 'Good' },
    { id: 'TCH-007', name: 'Maria Garcia', department: 'Biology', classes: 4, students: 102, engagement: 81, quizAvg: 83, attendance: 89, trend: 'stable', status: 'Top Performer' },
    { id: 'TCH-031', name: 'David Kim', department: 'Computer Science', classes: 4, students: 88, engagement: 85, quizAvg: 88, attendance: 97, trend: 'up', status: 'Excellent' },
    { id: 'TCH-019', name: 'Jennifer Brown', department: 'Chemistry', classes: 3, students: 72, engagement: 77, quizAvg: 79, attendance: 93, trend: 'stable', status: 'Good' },
    { id: 'TCH-045', name: 'Michael Lee', department: 'English', classes: 4, students: 96, engagement: 68, quizAvg: 70, attendance: 85, trend: 'down', status: 'Needs Support' },
    { id: 'TCH-003', name: 'Lisa Anderson', department: 'Mathematics', classes: 3, students: 78, engagement: 80, quizAvg: 82, attendance: 98, trend: 'up', status: 'Good' },
    { id: 'TCH-028', name: 'James Wilson', department: 'Physics', classes: 4, students: 92, engagement: 74, quizAvg: 76, attendance: 91, trend: 'stable', status: 'Fair' },
    { id: 'TCH-014', name: 'Emily Davis', department: 'Biology', classes: 3, students: 68, engagement: 83, quizAvg: 85, attendance: 94, trend: 'up', status: 'Good' },
    { id: 'TCH-036', name: 'Christopher Moore', department: 'Computer Science', classes: 4, students: 84, engagement: 88, quizAvg: 90, attendance: 96, trend: 'up', status: 'Excellent' },
    { id: 'TCH-052', name: 'Amanda Rodriguez', department: 'Chemistry', classes: 3, students: 65, engagement: 76, quizAvg: 78, attendance: 92, trend: 'up', status: 'Good' },
    { id: 'TCH-041', name: 'Thomas Wright', department: 'English', classes: 4, students: 89, engagement: 71, quizAvg: 73, attendance: 87, trend: 'down', status: 'Fair' },
    { id: 'TCH-017', name: 'Patricia Taylor', department: 'Mathematics', classes: 5, students: 112, engagement: 75, quizAvg: 77, attendance: 94, trend: 'stable', status: 'Good' },
    { id: 'TCH-029', name: 'Daniel Martinez', department: 'Physics', classes: 3, students: 76, engagement: 78, quizAvg: 80, attendance: 95, trend: 'up', status: 'Good' },
    { id: 'TCH-038', name: 'Jessica Thompson', department: 'Biology', classes: 4, students: 95, engagement: 79, quizAvg: 81, attendance: 88, trend: 'stable', status: 'Good' },
    { id: 'TCH-022', name: 'Kevin White', department: 'Computer Science', classes: 4, students: 87, engagement: 82, quizAvg: 84, attendance: 93, trend: 'up', status: 'Top Performer' },
    { id: 'TCH-047', name: 'Michelle Clark', department: 'Chemistry', classes: 3, students: 71, engagement: 74, quizAvg: 76, attendance: 90, trend: 'stable', status: 'Fair' },
    { id: 'TCH-033', name: 'Ryan Lewis', department: 'English', classes: 4, students: 93, engagement: 69, quizAvg: 71, attendance: 86, trend: 'down', status: 'Needs Support' },
    { id: 'TCH-015', name: 'Laura Hall', department: 'Mathematics', classes: 3, students: 73, engagement: 81, quizAvg: 83, attendance: 96, trend: 'up', status: 'Top Performer' },
    { id: 'TCH-051', name: 'Mark Adams', department: 'Physics', classes: 4, students: 90, engagement: 77, quizAvg: 79, attendance: 92, trend: 'stable', status: 'Good' }
  ];

  const departmentData = [
    { department: 'Computer Science', teachers: 8, avgEngagement: 80, aboveTarget: 7, belowTarget: 1 },
    { department: 'Mathematics', teachers: 8, avgEngagement: 78, aboveTarget: 7, belowTarget: 1 },
    { department: 'Biology', teachers: 7, avgEngagement: 76, aboveTarget: 6, belowTarget: 1 },
    { department: 'Chemistry', teachers: 5, avgEngagement: 75, aboveTarget: 5, belowTarget: 0 },
    { department: 'Physics', teachers: 6, avgEngagement: 72, aboveTarget: 5, belowTarget: 1 },
    { department: 'English', teachers: 8, avgEngagement: 70, aboveTarget: 5, belowTarget: 3 }
  ];

  const performanceData = [
    { name: 'Excellent (85%+)', value: 12, color: '#2d5016' },
    { name: 'Good (75-84%)', value: 23, color: '#4caf50' },
    { name: 'Fair (65-74%)', value: 5, color: '#ffeb3b' },
    { name: 'Needs Improvement (<65%)', value: 2, color: '#ff9800' }
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    engagement: 70 + Math.random() * 15 + (i > 20 ? 5 : 0)
  }));

  const effectivenessData = Array.from({ length: 20 }, () => ({
    classSize: 15 + Math.random() * 25,
    engagement: 65 + Math.random() * 25
  }));

  const experienceData = [
    { range: '0-2 years', teachers: 8, engagement: 74 },
    { range: '3-5 years', teachers: 15, engagement: 77 },
    { range: '6-10 years', teachers: 12, engagement: 79 },
    { range: '10+ years', teachers: 7, engagement: 78 }
  ];

  const quizCreators = [
    { teacher: 'David Kim', department: 'Computer Science', quizzes: 28, completion: 92, score: 82 },
    { teacher: 'Sarah Johnson', department: 'Mathematics', quizzes: 24, completion: 88, score: 84 },
    { teacher: 'Maria Garcia', department: 'Biology', quizzes: 22, completion: 86, score: 83 },
    { teacher: 'Jennifer Brown', department: 'Chemistry', quizzes: 20, completion: 84, score: 79 },
    { teacher: 'Christopher Moore', department: 'Computer Science', quizzes: 18, completion: 90, score: 88 }
  ];

  // Filter and search logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = selectedDepartment === 'All Departments' || 
                               teacher.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [teachers, searchQuery, selectedDepartment]);

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return '#2d5016';
      case 'Top Performer': return '#4caf50';
      case 'Good': return '#8bc34a';
      case 'Fair': return '#ffeb3b';
      case 'Needs Support': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportData = () => {
    const csv = [
      ['Name', 'Department', 'Classes', 'Students', 'Engagement', 'Quiz Avg', 'Attendance', 'Status'],
      ...filteredTeachers.map(teacher => [
        teacher.name, teacher.department, teacher.classes, teacher.students,
        teacher.engagement + '%', teacher.quizAvg + '%', teacher.attendance + '%', teacher.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers-overview.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="mb-6">
        <h1 className="text-4xl font-bold text-orange-400 text-center mb-2">Teacher Overview</h1>
        <p className="text-gray-600 text-center">Comprehensive overview of teacher performance and engagement</p>
      </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Semester</option>
                <option>Custom</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option>All Departments</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Computer Science</option>
                <option>English</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300  bg-white rounded-md"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active (this week)</p>
                <p className="text-2xl font-bold text-gray-900">40</p>
                <p className="text-sm text-green-600">95%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Class Engagement</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meeting Target ( &gt; 75% )</p>
                <p className="text-2xl font-bold text-gray-900">35</p>
                <p className="text-sm text-green-600">83%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Support</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-orange-600">7%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Department Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Department</th>
                    <th className="text-center py-2">Teachers</th>
                    <th className="text-center py-2">Avg Engagement</th>
                    <th className="text-center py-2">Above Target</th>
                    <th className="text-center py-2">Below Target</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{dept.department}</td>
                      <td className="text-center py-2">{dept.teachers}</td>
                      <td className="text-center py-2">{dept.avgEngagement}%</td>
                      <td className="text-center py-2 text-green-600">{dept.aboveTarget}</td>
                      <td className="text-center py-2 text-red-600">{dept.belowTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Teacher List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Teacher Performance</h3>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setShowProfileModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{teacher.name}</h4>
                        <p className="text-xs text-gray-500">{teacher.id}</p>
                      </div>
                    </div>
                    {getTrendIcon(teacher.trend)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{teacher.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes:</span>
                      <span className="font-medium">{teacher.classes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{teacher.students}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Engagement:</span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getStatusColor(teacher.status)}20`,
                          color: getStatusColor(teacher.status)
                        }}
                      >
                        {teacher.engagement}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quiz Avg:</span>
                      <span className="font-medium">{teacher.quizAvg}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className="font-medium">{teacher.attendance}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getStatusColor(teacher.status)}20`,
                          color: getStatusColor(teacher.status)
                        }}
                      >
                        {teacher.status}
                      </span>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Mail className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <FileText className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Teacher</th>
                    <th className="text-center py-2">Department</th>
                    <th className="text-center py-2">Classes</th>
                    <th className="text-center py-2">Students</th>
                    <th className="text-center py-2">Engagement</th>
                    <th className="text-center py-2">Quiz Avg</th>
                    <th className="text-center py-2">Attendance</th>
                    <th className="text-center py-2">Status</th>
                    <th className="text-center py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-xs text-gray-500">{teacher.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3">{teacher.department}</td>
                      <td className="text-center py-3">{teacher.classes}</td>
                      <td className="text-center py-3">{teacher.students}</td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">{teacher.engagement}%</span>
                          {getTrendIcon(teacher.trend)}
                        </div>
                      </td>
                      <td className="text-center py-3">{teacher.quizAvg}%</td>
                      <td className="text-center py-3">{teacher.attendance}%</td>
                      <td className="text-center py-3">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getStatusColor(teacher.status)}20`,
                            color: getStatusColor(teacher.status)
                          }}
                        >
                          {teacher.status}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowProfileModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#ff9800" 
                strokeWidth={2}
                dot={{ fill: '#ff9800' }}
              />
              <Line 
                type="monotone" 
                dataKey={() => 75} 
                stroke="#4caf50" 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Teaching Effectiveness Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Class Size Impact</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart data={effectivenessData}>
                <CartesianGrid />
                <XAxis dataKey="classSize" name="Class Size" />
                <YAxis dataKey="engagement" name="Engagement %" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="engagement" fill="#ff9800" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Experience vs Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Quality & Student Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quiz & Assessment Quality</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">342</div>
                <div className="text-sm text-gray-600">Quizzes Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">84%</div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">58%</div>
                <div className="text-sm text-gray-600">AI-generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">76%</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Teacher</th>
                    <th className="text-center py-2">Quizzes</th>
                    <th className="text-center py-2">Completion</th>
                    <th className="text-center py-2">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {quizCreators.map((creator, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{creator.teacher}</td>
                      <td className="text-center py-2">{creator.quizzes}</td>
                      <td className="text-center py-2">{creator.completion}%</td>
                      <td className="text-center py-2">{creator.score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Student Feedback Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.2/5</div>
                <div className="text-sm text-gray-600">Overall Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.3/5</div>
                <div className="text-sm text-gray-600">Teaching Clarity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.1/5</div>
                <div className="text-sm text-gray-600">Responsiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4.0/5</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Top Rated Teachers</h4>
              <div className="space-y-2">
                {['David Kim', 'Sarah Johnson', 'Maria Garcia', 'Emily Davis', 'Christopher Moore'].map((name, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance & Professional Development */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance & Punctuality</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">97%</div>
                <div className="text-sm text-gray-600">Overall Teacher Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1,232</div>
                <div className="text-sm text-gray-600">Classes Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">8</div>
                <div className="text-sm text-gray-600">Absences This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">99%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Professional Development</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">420h</div>
                <div className="text-sm text-gray-600">PD Hours Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">90%</div>
                <div className="text-sm text-gray-600">Meeting Target</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommended Training</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Engagement strategies for afternoon classes</div>
                <div>• Advanced quiz creation techniques</div>
                <div>• Handling low-performing students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers & Teachers Needing Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top 5 Teachers</h3>
            <div className="space-y-3">
              {[
                { name: 'David Kim', department: 'Computer Science', engagement: 88, students: 88, classes: 4, achievement: 'Highest engagement' },
                { name: 'Maria Garcia', department: 'Biology', engagement: 85, students: 102, classes: 4, achievement: 'Best quiz scores' },
                { name: 'Sarah Johnson', department: 'Mathematics', engagement: 82, students: 94, classes: 4, achievement: 'Top student feedback' },
                { name: 'Emily Davis', department: 'Biology', engagement: 83, students: 68, classes: 3, achievement: 'Most improved' },
                { name: 'Lisa Anderson', department: 'Mathematics', engagement: 80, students: 78, classes: 3, achievement: 'Perfect attendance' }
              ].map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{teacher.engagement}%</div>
                    <div className="text-sm text-gray-600">{teacher.achievement}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Teachers Needing Support</h3>
            <div className="space-y-3">
              {[
                { name: 'Michael Lee', department: 'English', engagement: 68, issue: 'Low engagement', recommendation: 'Peer mentoring + training' },
                { name: 'James Wilson', department: 'Physics', engagement: 74, issue: 'Declining trend', recommendation: 'Review teaching methods' },
                { name: 'Ryan Lewis', department: 'English', engagement: 69, issue: 'Attendance issues', recommendation: 'Check workload' }
              ].map((teacher, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.department}</div>
                      <div className="text-sm text-orange-600 mt-1">{teacher.engagement}% engagement</div>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Issue: {teacher.issue}</div>
                    <div className="text-gray-600">Recommendation: {teacher.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Key Findings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>83% teachers meeting target - strong performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>English department needs support - 3 teachers below target</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Average class size optimal at 22 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Teachers with 4+ classes show 5% lower engagement</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-blue-600">Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Provide targeted training for English department</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Consider reducing workload for teachers with >100 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Share best practices from top performers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span>Schedule peer observation sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Profile Modal */}
        {showProfileModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTeacher.name}</h2>
                      <p className="text-gray-600">{selectedTeacher.id} • {selectedTeacher.department}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(selectedTeacher.trend)}
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getStatusColor(selectedTeacher.status)}20`,
                            color: getStatusColor(selectedTeacher.status)
                          }}
                        >
                          {selectedTeacher.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedTeacher.classes}</div>
                    <div className="text-sm text-gray-600">Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedTeacher.students}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedTeacher.engagement}%</div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Mail className="w-4 h-4" />
                        Send Message
                      </button>
                      <button className="w-full flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                        <Calendar className="w-4 h-4" />
                        Schedule Meeting
                      </button>
                      <button className="w-full flex items-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100">
                        <BookMarked className="w-4 h-4" />
                        Assign Training
                      </button>
                      <button className="w-full flex items-center gap-2 p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Recent Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Class Engagement:</span>
                        <span className="font-medium">{selectedTeacher.engagement}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quiz Average:</span>
                        <span className="font-medium">{selectedTeacher.quizAvg}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendance Rate:</span>
                        <span className="font-medium">{selectedTeacher.attendance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student Satisfaction:</span>
                        <span className="font-medium">4.2/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersOverview;