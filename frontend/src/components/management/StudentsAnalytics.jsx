import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Download, TrendingUp, TrendingDown, AlertTriangle, Users, Activity, Calendar, Award } from 'lucide-react';

const ManagementAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [deptFilter, setDeptFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mock data generation
  const departments = ['Comp Sci', 'Math', 'Biology', 'Chemistry', 'Physics', 'English'];
  const grades = [9, 10, 11, 12];

  const deptBreakdown = [
    { dept: 'Comp Sci', total: 135, high: 108, medium: 21, low: 5, atRisk: 1 },
    { dept: 'Math', total: 156, high: 125, medium: 24, low: 6, atRisk: 1 },
    { dept: 'Biology', total: 142, high: 109, medium: 26, low: 6, atRisk: 1 },
    { dept: 'Chemistry', total: 98, high: 74, medium: 18, low: 5, atRisk: 1 },
    { dept: 'Physics', total: 132, high: 95, medium: 28, low: 7, atRisk: 2 },
    { dept: 'English', total: 184, high: 101, medium: 44, low: 22, atRisk: 17 }
  ];

  const performanceDistribution = [
    { name: 'High Performers (75%+)', value: 612, percentage: 72, color: '#4CAF50' },
    { name: 'Medium (60-74%)', value: 161, percentage: 19, color: '#FFC107' },
    { name: 'Low (40-59%)', value: 51, percentage: 6, color: '#FF9800' },
    { name: 'At Risk (<40%)', value: 23, percentage: 3, color: '#F44336' }
  ];

  const engagementTrends = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    overall: 70 + Math.random() * 15,
    grade9: 68 + Math.random() * 12,
    grade10: 72 + Math.random() * 13,
    grade11: 74 + Math.random() * 14,
    grade12: 76 + Math.random() * 12
  }));

  const behaviorData = [
    { dept: 'Comp Sci', cognitive: 82, interactive: 78, social: 76, emotional: 79, focus: 80 },
    { dept: 'Math', cognitive: 80, interactive: 74, social: 72, emotional: 77, focus: 78 },
    { dept: 'Biology', cognitive: 79, interactive: 73, social: 75, emotional: 78, focus: 76 },
    { dept: 'Chemistry', cognitive: 77, interactive: 71, social: 73, emotional: 76, focus: 74 },
    { dept: 'Physics', cognitive: 78, interactive: 72, social: 74, emotional: 77, focus: 75 },
    { dept: 'English', cognitive: 70, interactive: 65, social: 70, emotional: 68, focus: 67 }
  ];

  const studyTimeDistribution = [
    { range: '0-10h', count: 125, percentage: 15 },
    { range: '10-20h', count: 398, percentage: 47 },
    { range: '20-30h', count: 268, percentage: 32 },
    { range: '30+h', count: 56, percentage: 6 }
  ];

  const studyVsEngagement = Array.from({ length: 50 }, () => ({
    studyTime: Math.random() * 40,
    engagement: 40 + Math.random() * 50
  }));

  const scoreDistribution = [
    { range: '0-50', count: 15 },
    { range: '51-60', count: 42 },
    { range: '61-70', count: 128 },
    { range: '71-80', count: 285 },
    { range: '81-90', count: 243 },
    { range: '91-100', count: 134 }
  ];

  const topStudents = [
    { rank: 1, name: 'Emily Chen', id: 'STU-042', grade: 12, engagement: 95, attendance: 100, quizAvg: 94, dept: 'Physics' },
    { rank: 2, name: 'Alex Johnson', id: 'STU-038', grade: 12, engagement: 94, attendance: 98, quizAvg: 92, dept: 'Math' },
    { rank: 3, name: 'Sarah Kumar', id: 'STU-091', grade: 11, engagement: 93, attendance: 100, quizAvg: 93, dept: 'Biology' },
    { rank: 4, name: 'Michael Zhang', id: 'STU-115', grade: 12, engagement: 92, attendance: 97, quizAvg: 91, dept: 'Comp Sci' },
    { rank: 5, name: 'Priya Patel', id: 'STU-067', grade: 11, engagement: 91, attendance: 99, quizAvg: 90, dept: 'Chemistry' },
    { rank: 6, name: 'James Wilson', id: 'STU-143', grade: 12, engagement: 90, attendance: 98, quizAvg: 92, dept: 'Math' },
    { rank: 7, name: 'Sophia Lee', id: 'STU-089', grade: 11, engagement: 90, attendance: 100, quizAvg: 89, dept: 'Physics' },
    { rank: 8, name: 'David Brown', id: 'STU-124', grade: 12, engagement: 89, attendance: 96, quizAvg: 90, dept: 'Biology' }
  ];

  const atRiskStudents = [
    { name: 'Student A', id: 'STU-156', grade: 10, engagement: 38, attendance: 65, concern: 'Low engagement + attendance', action: 'Intervention' },
    { name: 'Student B', id: 'STU-234', grade: 9, engagement: 35, attendance: 58, concern: 'Poor attendance', action: 'Intervention' },
    { name: 'Student C', id: 'STU-412', grade: 11, engagement: 39, attendance: 72, concern: 'Low engagement', action: 'Monitoring' },
    { name: 'Student D', id: 'STU-587', grade: 10, engagement: 37, attendance: 61, concern: 'Multiple concerns', action: 'Intervention' },
    { name: 'Student E', id: 'STU-698', grade: 9, engagement: 36, attendance: 68, concern: 'Declining performance', action: 'Support' }
  ];

  const gradeDistribution = [
    { grade: 'Grade 9', count: 198, engagement: 70 },
    { grade: 'Grade 10', count: 215, engagement: 73 },
    { grade: 'Grade 11', count: 223, engagement: 75 },
    { grade: 'Grade 12', count: 211, engagement: 77 }
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTopStudents = useMemo(() => {
    let sorted = [...topStudents];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [sortConfig]);

  const exportData = () => {
    alert('Export functionality would generate CSV/Excel file with filtered data');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-orange-400 text-center mb-2">Student Analytics Dashboard</h1>
        <p className="text-gray-600 text-center">Comprehensive overview of student performance and engagement</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Semester</option>
            <option>Custom</option>
          </select>
          
          <select 
            value={deptFilter} 
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option>All</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>

          <select 
            value={gradeFilter} 
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg  bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option>All Grades</option>
            {grades.map(g => <option key={g}>Grade {g}</option>)}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button 
            onClick={exportData}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">847</p>
            </div>
            <Users className="text-orange-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active This Week</p>
              <p className="text-3xl font-bold text-gray-800">798</p>
              <p className="text-green-600 text-sm">94%</p>
            </div>
            <Activity className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Engagement</p>
              <p className="text-3xl font-bold text-gray-800">74%</p>
            </div>
            <TrendingUp className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Attendance</p>
              <p className="text-3xl font-bold text-gray-800">89%</p>
            </div>
            <Calendar className="text-purple-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">At Risk Students</p>
              <p className="text-3xl font-bold text-gray-800">23</p>
              <p className="text-red-600 text-sm">3%</p>
            </div>
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${percentage}%`}
              >
                {performanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 col-span-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Department Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-center">Total</th>
                  <th className="px-4 py-2 text-center">High</th>
                  <th className="px-4 py-2 text-center">Medium</th>
                  <th className="px-4 py-2 text-center">Low</th>
                  <th className="px-4 py-2 text-center">At Risk</th>
                </tr>
              </thead>
              <tbody>
                {deptBreakdown.map((dept, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{dept.dept}</td>
                    <td className="px-4 py-2 text-center">{dept.total}</td>
                    <td className="px-4 py-2 text-center text-green-600">{dept.high}</td>
                    <td className="px-4 py-2 text-center text-yellow-600">{dept.medium}</td>
                    <td className="px-4 py-2 text-center text-orange-600">{dept.low}</td>
                    <td className="px-4 py-2 text-center text-red-600">{dept.atRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Engagement Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Engagement Trends (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagementTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Engagement %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="overall" stroke="#FF9800" strokeWidth={2} name="Overall" />
            <Line type="monotone" dataKey="grade9" stroke="#2196F3" name="Grade 9" />
            <Line type="monotone" dataKey="grade10" stroke="#4CAF50" name="Grade 10" />
            <Line type="monotone" dataKey="grade11" stroke="#9C27B0" name="Grade 11" />
            <Line type="monotone" dataKey="grade12" stroke="#F44336" name="Grade 12" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Behavioral Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Behavioral Analysis by Department</h2>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-orange-50 rounded">
            <p className="text-2xl font-bold text-orange-600">78%</p>
            <p className="text-sm text-gray-600">Cognitive</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">72%</p>
            <p className="text-sm text-gray-600">Interactive</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">74%</p>
            <p className="text-sm text-gray-600">Social Learning</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <p className="text-2xl font-bold text-purple-600">76%</p>
            <p className="text-sm text-gray-600">Emotional</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded">
            <p className="text-2xl font-bold text-indigo-600">75%</p>
            <p className="text-sm text-gray-600">Focus Level</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={behaviorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dept" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cognitive" stackId="a" fill="#FF9800" />
            <Bar dataKey="interactive" stackId="a" fill="#2196F3" />
            <Bar dataKey="social" stackId="a" fill="#4CAF50" />
            <Bar dataKey="emotional" stackId="a" fill="#9C27B0" />
            <Bar dataKey="focus" stackId="a" fill="#3F51B5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance & Quiz Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Analytics</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">89%</p>
              <p className="text-sm text-gray-600">Overall</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">342</p>
              <p className="text-sm text-gray-600">Perfect (40%)</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-600">45</p>
              <p className="text-sm text-gray-600">Frequent Abs</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Performance</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">7,128</p>
              <p className="text-sm text-gray-600">Total Quizzes</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">84%</p>
              <p className="text-sm text-gray-600">Completion</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">76%</p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <p className="text-2xl font-bold text-orange-600">234</p>
              <p className="text-sm text-gray-600">90%+ (28%)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Study Time Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Study Time Analysis</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-orange-50 rounded">
            <p className="text-2xl font-bold text-orange-600">18,450h</p>
            <p className="text-sm text-gray-600">Total Hours</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">21.8h</p>
            <p className="text-sm text-gray-600">Avg/Week</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">9-11 AM</p>
            <p className="text-sm text-gray-600">Peak Time</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <p className="text-2xl font-bold text-purple-600">38 min</p>
            <p className="text-sm text-gray-600">Avg Session</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studyTimeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="studyTime" name="Study Time (h)" />
              <YAxis dataKey="engagement" name="Engagement %" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Students" data={studyVsEngagement} fill="#FF9800" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & At Risk Students */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Performers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('rank')}>Rank</th>
                  <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>Name</th>
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-center cursor-pointer" onClick={() => handleSort('engagement')}>Eng%</th>
                  <th className="px-2 py-2 text-center cursor-pointer" onClick={() => handleSort('attendance')}>Att%</th>
                  <th className="px-2 py-2 text-center">Quiz</th>
                </tr>
              </thead>
              <tbody>
                {sortedTopStudents.map((student, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 font-bold text-orange-600">#{student.rank}</td>
                    <td className="px-2 py-2">{student.name}</td>
                    <td className="px-2 py-2 text-gray-600">{student.id}</td>
                    <td className="px-2 py-2 text-center">{student.engagement}%</td>
                    <td className="px-2 py-2 text-center">{student.attendance}%</td>
                    <td className="px-2 py-2 text-center">{student.quizAvg}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            At Risk Students
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-2 py-2 text-left">Name</th>
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-center">Eng%</th>
                  <th className="px-2 py-2 text-center">Att%</th>
                  <th className="px-2 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((student, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2">{student.name}</td>
                    <td className="px-2 py-2 text-gray-600">{student.id}</td>
                    <td className="px-2 py-2 text-center text-red-600">{student.engagement}%</td>
                    <td className="px-2 py-2 text-center text-orange-600">{student.attendance}%</td>
                    <td className="px-2 py-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{student.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade Distribution & Learning Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grade Distribution & Engagement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#FF9800" name="Students" />
              <Bar yAxisId="right" dataKey="engagement" fill="#4CAF50" name="Engagement %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Learning Patterns</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Preferred Learning Modes</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2" style={{width: '68%'}}>
                      <span className="text-white text-xs font-medium">68%</span>
                    </div>
                  </div>
                  <span className="text-sm w-20">Visual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2" style={{width: '22%'}}>
                      <span className="text-white text-xs font-medium">22%</span>
                    </div>
                  </div>
                  <span className="text-sm w-20">Auditory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2" style={{width: '10%'}}>
                      <span className="text-white text-xs font-medium">10%</span>
                    </div>
                  </div>
                  <span className="text-sm w-20">Kinesthetic</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Session Duration Insights</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-lg font-bold text-purple-600">38 min</p>
                  <p className="text-xs text-gray-600">Average Session</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-lg font-bold text-green-600">35-45 min</p>
                  <p className="text-xs text-gray-600">Optimal Range</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Peak Engagement Times</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-yellow-100 p-2 rounded">
                  <p className="font-medium">8-10 AM</p>
                  <p className="text-yellow-700">High</p>
                </div>
                <div className="bg-green-100 p-2 rounded">
                  <p className="font-medium">10-12 PM</p>
                  <p className="text-green-700">Peak</p>
                </div>
                <div className="bg-orange-100 p-2 rounded">
                  <p className="font-medium">2-4 PM</p>
                  <p className="text-orange-700">Medium</p>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <p className="font-medium">4-6 PM</p>
                  <p className="text-red-700">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Tracking */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Intervention Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Students Flagged for Support</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <div className="flex items-center gap-3">
                  <Award className="text-orange-600" size={24} />
                  <div>
                    <p className="font-medium">Academic Concerns</p>
                    <p className="text-sm text-gray-600">Low grades, quiz performance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600">23</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div className="flex items-center gap-3">
                  <Calendar className="text-red-600" size={24} />
                  <div>
                    <p className="font-medium">Attendance Issues</p>
                    <p className="text-sm text-gray-600">Frequent absences</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-purple-600" size={24} />
                  <div>
                    <p className="font-medium">Behavioral Alerts</p>
                    <p className="text-sm text-gray-600">Engagement, participation</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium">Total Unique Students</p>
                    <p className="text-sm text-gray-600">Requiring intervention</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">67</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Intervention Outcomes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Improved', value: 42, color: '#4CAF50' },
                    { name: 'Still Struggling', value: 18, color: '#F44336' },
                    { name: 'Recently Flagged', value: 7, color: '#FFC107' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value} (${Math.round(value/67*100)}%)`}
                >
                  <Cell fill="#4CAF50" />
                  <Cell fill="#F44336" />
                  <Cell fill="#FFC107" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Improved after support
                </span>
                <span className="font-bold text-green-600">42 (63%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Still struggling
                </span>
                <span className="font-bold text-red-600">18 (27%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Recently flagged
                </span>
                <span className="font-bold text-yellow-600">7 (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-orange-600" size={24} />
          Key Insights & Recommendations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Key Findings
            </h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm">✓ <span className="font-medium">72% students performing well</span> - above target threshold</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm">⚠️ <span className="font-medium">English department has highest at-risk count (17)</span> - needs immediate support</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm">📈 <span className="font-medium">Morning engagement 18% higher than afternoon</span> - optimal learning window identified</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm">📉 <span className="font-medium">Friday attendance 8% below average</span> - pattern requiring attention</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Recommended Actions
            </h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded shadow-sm border-l-4 border-orange-500">
                <p className="text-sm font-medium text-gray-800">Implement peer tutoring program</p>
                <p className="text-xs text-gray-600">Target 23 at-risk students with mentorship from high performers</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-800">Schedule engaging Friday activities</p>
                <p className="text-xs text-gray-600">Improve end-of-week attendance with interactive sessions</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border-l-4 border-red-500">
                <p className="text-sm font-medium text-gray-800">Provide English department resources</p>
                <p className="text-xs text-gray-600">Additional teaching support and intervention strategies</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-800">Expand morning session strategies</p>
                <p className="text-xs text-gray-600">Replicate successful 9-11 AM engagement tactics across all periods</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementAnalytics;