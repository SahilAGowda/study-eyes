import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Plus, Sparkles, Filter, Download, Eye, Edit2, Trash2, Clock, Users, CheckCircle, FileText, X, ChevronDown, TrendingUp, Award, Target, Zap, Book, Calendar, BarChart3 } from 'lucide-react';

const EnhancedQuizzesExams = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [createTab, setCreateTab] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const quizzes = [
    { id: 1, subject: 'Mathematics', topic: 'Quadratic Equations', date: 'Oct 28, 2024', questions: 5, status: 'Completed', completed: 18, total: 24, avgScore: 82 },
    { id: 2, subject: 'Physics', topic: "Newton's Laws", date: 'Oct 27, 2024', questions: 4, status: 'Completed', completed: 25, total: 28, avgScore: 78 },
    { id: 3, subject: 'Chemistry', topic: 'Periodic Table', date: 'Oct 26, 2024', questions: 6, status: 'Completed', completed: 19, total: 20, avgScore: 85 },
    { id: 4, subject: 'Mathematics', topic: 'Algebra', date: 'Oct 25, 2024', questions: 4, status: 'In Progress', completed: 15, total: 22, avgScore: 79 },
    { id: 5, subject: 'Physics', topic: 'Energy', date: 'Oct 24, 2024', questions: 5, status: 'Draft', completed: 0, total: 28, avgScore: null },
    { id: 6, subject: 'Biology', topic: 'Cell Structure', date: 'Oct 23, 2024', questions: 7, status: 'Completed', completed: 22, total: 24, avgScore: 88 },
    { id: 7, subject: 'Chemistry', topic: 'Chemical Bonding', date: 'Oct 22, 2024', questions: 5, status: 'Completed', completed: 20, total: 20, avgScore: 91 },
    { id: 8, subject: 'Mathematics', topic: 'Trigonometry', date: 'Oct 21, 2024', questions: 6, status: 'In Progress', completed: 12, total: 24, avgScore: 74 },
  ];

  const scoreDistribution = [
    { range: '0-20', count: 2 },
    { range: '21-40', count: 3 },
    { range: '41-60', count: 5 },
    { range: '61-80', count: 8 },
    { range: '81-100', count: 10 },
  ];

  const performanceData = [
    { name: 'Excellent', value: 10, color: '#10b981' },
    { name: 'Good', value: 8, color: '#3b82f6' },
    { name: 'Average', value: 5, color: '#f59e0b' },
    { name: 'Needs Work', value: 3, color: '#ef4444' },
  ];

  const studentResults = [
    { name: 'Emma Wilson', score: 95, time: '12 min', status: 'Completed' },
    { name: 'Liam Chen', score: 88, time: '15 min', status: 'Completed' },
    { name: 'Sophia Rodriguez', score: 82, time: '18 min', status: 'Completed' },
    { name: 'Noah Patel', score: 76, time: '20 min', status: 'Completed' },
    { name: 'Olivia Kim', score: 70, time: '14 min', status: 'Completed' },
    { name: 'James Taylor', score: 0, time: '-', status: 'Not Started' },
  ];

  const questionAnalysis = [
    { question: 'Q1: Basic quadratic formula', correct: 85 },
    { question: 'Q2: Factoring quadratics', correct: 92 },
    { question: 'Q3: Vertex form conversion', correct: 68 },
    { question: 'Q4: Discriminant analysis', correct: 78 },
    { question: 'Q5: Real-world application', correct: 81 },
  ];

  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Quiz generated successfully! Review the questions below.');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#ecfdf5', text: '#065f46', border: '#d1fae5', lightBg: '#10b981' };
      case 'In Progress': return { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe', lightBg: '#3b82f6' };
      case 'Draft': return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', lightBg: '#64748b' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', lightBg: '#64748b' };
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': { bg: '#1e40af', border: '#3b82f6', hover: '#1e3a8a' },
      'Physics': { bg: '#059669', border: '#10b981', hover: '#047857' },
      'Chemistry': { bg: '#dc2626', border: '#ef4444', hover: '#b91c1c' },
      'Biology': { bg: '#7c3aed', border: '#8b5cf6', hover: '#6d28d9' },
    };
    return colors[subject] || colors['Mathematics'];
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter = filterStatus === 'all' || quiz.status.toLowerCase().replace(' ', '') === filterStatus;
    const matchesSubjectFilter = filterSubject === 'all' || quiz.subject === filterSubject;
    return matchesSearch && matchesStatusFilter && matchesSubjectFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .glass-effect {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .shadow-elegant {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .shadow-elevated {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        }
        .shadow-floating {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-0">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-slate-200 shadow-elegant">
          <div className="px-8 py-12">
            <div className="flex justify-between items-center flex-wrap gap-6">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                  Quizzes & Exams
                </h1>
                <p className="text-lg text-slate-600 font-medium">
                  Create, manage, and analyze student assessments with ease
                </p>
              </div>
              <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-elevated hover:shadow-floating hover:bg-blue-700 hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-200 outline-none"
                >
                  <Plus className="w-5 h-5" />
                  Create Quiz
                </button>
                <button
                  onClick={() => { setShowCreateModal(true); setCreateTab('ai'); }}
                  className="flex items-center gap-3 px-6 py-4 bg-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-elevated hover:shadow-floating hover:bg-purple-700 hover:-translate-y-0.5 focus:ring-4 focus:ring-purple-200 outline-none"
                >
                  <Sparkles className="w-5 h-5" />
                  AI Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 -mt-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Quizzes', value: '24', icon: <FileText className="w-6 h-6" />, color: '#3b82f6', bgColor: '#eff6ff', hoverColor: '#dbeafe' },
              { title: 'Pending Review', value: '8', icon: <Clock className="w-6 h-6" />, color: '#f59e0b', bgColor: '#fffbeb', hoverColor: '#fef3c7' },
              { title: 'Average Score', value: '78%', icon: <TrendingUp className="w-6 h-6" />, color: '#10b981', bgColor: '#ecfdf5', hoverColor: '#d1fae5' },
              { title: 'Total Students', value: '156', icon: <Users className="w-6 h-6" />, color: '#8b5cf6', bgColor: '#f5f3ff', hoverColor: '#ede9fe' }
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-xl p-6 transition-all duration-300 cursor-pointer animate-fade-in-up shadow-elegant hover:shadow-elevated hover:-translate-y-1 border border-slate-100"
                style={{ 
                  backgroundColor: stat.bgColor,
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = stat.hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = stat.bgColor;
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: stat.color, color: 'white' }}
                  >
                    {stat.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.title}</h3>
                </div>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-8 mb-8">
          <div className="glass-effect rounded-xl p-6 shadow-elegant border border-slate-100 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search quizzes by subject or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-slate-900 placeholder-slate-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-4 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium transition-all duration-300 bg-white text-slate-900"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="inprogress">In Progress</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-4 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium transition-all duration-300 bg-white text-slate-900"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const statusStyle = getStatusColor(quiz.status);
              const subjectColor = getSubjectColor(quiz.subject);
              const completion = quiz.total > 0 ? Math.round((quiz.completed/quiz.total)*100) : 0;
              
              return (
                <div 
                  key={quiz.id}
                  className="rounded-xl overflow-hidden transition-all duration-300 cursor-pointer bg-white shadow-elegant hover:shadow-elevated border border-slate-100 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div 
                    className="p-5 text-white relative overflow-hidden"
                    style={{ 
                      backgroundColor: subjectColor.bg,
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 opacity-20" style={{ backgroundColor: subjectColor.border }}></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 opacity-20" style={{ backgroundColor: subjectColor.border }}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{quiz.subject}</h3>
                          <p className="text-sm opacity-90">{quiz.topic}</p>
                        </div>
                        <Book className="w-5 h-5 opacity-80" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span 
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ 
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`
                        }}
                      >
                        {quiz.status}
                      </span>
                      <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {quiz.date}
                      </span>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 font-medium text-sm">Questions</span>
                        <span className="font-bold text-slate-800">{quiz.questions}</span>
                      </div>
                      
                      {quiz.status !== 'Draft' && (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-600 font-medium text-sm">Completion</span>
                            <span className="font-bold text-slate-800">
                              {quiz.completed}/{quiz.total}
                              <span className="text-xs ml-1 text-slate-500">({completion}%)</span>
                            </span>
                          </div>
                          
                          {quiz.avgScore && (
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }}>
                              <span className="text-slate-600 font-medium text-sm">Avg Score</span>
                              <span className="font-bold text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {quiz.avgScore}%
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {quiz.status === 'Completed' && (
                        <button
                          onClick={() => { setSelectedQuiz(quiz); setShowResultsModal(true); }}
                          className="flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300"
                        >
                          <Eye className="w-4 h-4" />
                          Results
                        </button>
                      )}
                      <button 
                        className="flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        className="px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Quiz Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-floating border border-slate-200 animate-slide-in">
              <div className="sticky top-0 p-6 bg-white border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-slate-900">Create New Quiz</h2>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-all duration-300 hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => setCreateTab('manual')}
                    className={`flex-1 py-4 rounded-lg font-semibold text-base transition-all duration-300 ${
                      createTab === 'manual' 
                        ? 'bg-blue-600 text-white shadow-elevated' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Manual Creation
                  </button>
                  <button
                    onClick={() => setCreateTab('ai')}
                    className={`flex-1 py-4 rounded-lg font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                      createTab === 'ai'
                        ? 'bg-purple-600 text-white shadow-elevated' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Generated
                  </button>
                </div>

                {createTab === 'manual' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                      <select 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                      >
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Topic</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Quadratic Equations" 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</label>
                        <input 
                          type="number" 
                          placeholder="30" 
                          className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                      />
                    </div>
                    <button 
                      className="w-full py-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-elevated hover:shadow-floating mt-6"
                    >
                      Create Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                      <select 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                      >
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Topic/Chapter</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Quadratic Equations" 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Questions</label>
                        <select 
                          className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                        >
                          <option>5</option>
                          <option>10</option>
                          <option>15</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                        <select 
                          className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Based On</label>
                      <select 
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white text-slate-900"
                      >
                        <option>Recent class content</option>
                        <option>Specific topic</option>
                        <option>Previous assessments</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={isGenerating}
                      className="w-full py-4 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-elevated hover:shadow-floating mt-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Quiz with AI
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {showResultsModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-floating border border-slate-200 animate-slide-in">
              <div 
                className="sticky top-0 p-8 z-10 text-white"
                style={{ backgroundColor: getSubjectColor(selectedQuiz.subject).bg }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedQuiz.subject} - {selectedQuiz.topic}</h2>
                    <p className="text-lg opacity-90 font-medium">Quiz Results & Analysis</p>
                  </div>
                  <button 
                    onClick={() => setShowResultsModal(false)} 
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-300"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div className="rounded-xl p-5 bg-white bg-opacity-20 backdrop-blur-sm">
                    <p className="text-white text-sm mb-2 opacity-90 font-semibold">Completion Rate</p>
                    <p className="text-3xl font-bold text-white flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      {Math.round((selectedQuiz.completed/selectedQuiz.total)*100)}%
                    </p>
                  </div>
                  <div className="rounded-xl p-5 bg-white bg-opacity-20 backdrop-blur-sm">
                    <p className="text-white text-sm mb-2 opacity-90 font-semibold">Average Score</p>
                    <p className="text-3xl font-bold text-white flex items-center gap-2">
                      <Award className="w-6 h-6" />
                      {selectedQuiz.avgScore}%
                    </p>
                  </div>
                  <div className="rounded-xl p-5 bg-white bg-opacity-20 backdrop-blur-sm">
                    <p className="text-white text-sm mb-2 opacity-90 font-semibold">Total Students</p>
                    <p className="text-3xl font-bold text-white flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      {selectedQuiz.completed}/{selectedQuiz.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Distribution */}
                  <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-elegant">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      Score Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Performance Breakdown */}
                  <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-elegant">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-purple-600" />
                      Performance Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {performanceData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Analysis */}
                <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-elegant">
                  <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    Question-wise Analysis
                  </h3>
                  <div className="space-y-4">
                    {questionAnalysis.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700 w-72">{q.question}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                            style={{ 
                              width: `${q.correct}%`,
                              background: q.correct >= 80 ? '#10b981' :
                                        q.correct >= 60 ? '#3b82f6' :
                                        '#f59e0b'
                            }}
                          >
                            <span className="text-xs font-bold text-white">{q.correct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Results Table */}
                <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-elegant">
                  <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Student Results
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-4 px-4 text-sm font-bold text-slate-700 rounded-l-lg">Student</th>
                          <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Score</th>
                          <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Time</th>
                          <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Status</th>
                          <th className="text-left py-4 px-4 text-sm font-bold text-slate-700 rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentResults.map((student, idx) => (
                          <tr 
                            key={idx} 
                            className="transition-all hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <td className="py-4 px-4 text-sm font-bold text-slate-800">{student.name}</td>
                            <td className="py-4 px-4">
                              <span 
                                className="text-sm font-bold px-3 py-1 rounded-lg"
                                style={{
                                  background: student.score >= 80 ? '#ecfdf5' : 
                                            student.score >= 60 ? '#eff6ff' :
                                            student.score > 0 ? '#fffbeb' : '#f8fafc',
                                  color: student.score >= 80 ? '#065f46' : 
                                        student.score >= 60 ? '#1e40af' :
                                        student.score > 0 ? '#92400e' : '#64748b'
                                }}
                              >
                                {student.score}%
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.time}</td>
                            <td className="py-4 px-4">
                              <span 
                                className="px-3 py-1 rounded-lg text-xs font-bold"
                                style={{
                                  background: student.status === 'Completed' ? '#ecfdf5' : '#f8fafc',
                                  color: student.status === 'Completed' ? '#065f46' : '#64748b',
                                  border: student.status === 'Completed' ? '1px solid #d1fae5' : '1px solid #e2e8f0'
                                }}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button 
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-all duration-300 px-3 py-1 rounded-lg hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    className="flex-1 py-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-elevated hover:shadow-floating flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                  <button 
                    className="flex-1 py-4 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition-all duration-300 shadow-elegant hover:shadow-elevated flex items-center justify-center gap-2"
                  >
                    Share Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuizzesExams;