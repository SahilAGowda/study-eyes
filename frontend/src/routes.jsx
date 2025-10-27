import React from 'react'
import { Navigate } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  School as StudyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  VideoCall as LiveClassIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  Notifications as NotificationsIcon,
  Quiz as QuizIcon,
  TrendingUp as EngagementIcon,
  Business as DepartmentIcon,
  AdminPanelSettings as SystemIcon
} from '@mui/icons-material'

// Student Components
import StudentDashboard from './components/student/Dashboard'
import StudySession from './components/student/StudySession'
import StudySessionFullscreen from './components/student/StudySessionFullscreen'
import StudentAnalytics from './components/student/Analytics'
import StudentSettings from './components/student/Settings'
import CameraTest from './components/student/CameraTest'
import FocusTest from './components/student/FocusTest'
import MyEngagement from './components/student/MyEngagement'
import Notifications from './components/student/Notifications'
import Quizzes from './components/student/Quizzes'
import Reports from './components/student/Reports'

// Teacher Components
import TeacherDashboard from './components/teacher/Dashboard'
import LiveClass from './components/teacher/LiveClass'
import QuizzesExams from './components/teacher/QuizzesExams'
import ReportsAnalytics from './components/teacher/ReportsAnalytics'
import TeacherSettings from './components/teacher/Settings'
import StudentsOverview from './components/teacher/StudentsOverview'

// Management Components
import ManagementDashboard from './components/management/Dashboard'
import ManagementReports from './components/management/Reports'
import DepartmentPerformance from './components/management/DepartmentPerformance'
import StudentsAnalytics from './components/management/StudentsAnalytics'
import SystemSettings from './components/management/SystemSettings'
import TeachersOverview from './components/management/TeachersOverview'

// Common Components
import LandingPage from './components/common/LandingPage'
import Login from './components/common/Login'
import Register from './components/common/Register'

/**
 * Route configuration for role-based access
 * Each role has its own set of routes with nested paths
 */
export const roleRoutes = {
  student: [
    { path: 'dashboard', element: StudentDashboard, requiresAuth: true },
    { path: 'study', element: StudySession, requiresAuth: true },
    { path: 'study-fullscreen', element: StudySessionFullscreen, requiresAuth: true },
    { path: 'analytics', element: StudentAnalytics, requiresAuth: true },
    { path: 'settings', element: StudentSettings, requiresAuth: true },
    { path: 'camera-test', element: CameraTest, requiresAuth: true },
    { path: 'focus-test', element: FocusTest, requiresAuth: true },
    { path: 'engagement', element: MyEngagement, requiresAuth: true },
    { path: 'notifications', element: Notifications, requiresAuth: true },
    { path: 'quizzes', element: Quizzes, requiresAuth: true },
    { path: 'reports', element: Reports, requiresAuth: true },
  ],
  teacher: [
    { path: 'dashboard', element: TeacherDashboard, requiresAuth: true },
    { path: 'live-class', element: LiveClass, requiresAuth: true },
    { path: 'quizzes-exams', element: QuizzesExams, requiresAuth: true },
    { path: 'reports-analytics', element: ReportsAnalytics, requiresAuth: true },
    { path: 'settings', element: TeacherSettings, requiresAuth: true },
    { path: 'students', element: StudentsOverview, requiresAuth: true },
  ],
  management: [
    { path: 'dashboard', element: ManagementDashboard, requiresAuth: true },
    { path: 'reports', element: ManagementReports, requiresAuth: true },
    { path: 'department-performance', element: DepartmentPerformance, requiresAuth: true },
    { path: 'students-analytics', element: StudentsAnalytics, requiresAuth: true },
    { path: 'system-settings', element: SystemSettings, requiresAuth: true },
    { path: 'teachers', element: TeachersOverview, requiresAuth: true },
  ],
}

/**
 * Public routes accessible without authentication
 */
export const publicRoutes = [
  { path: '/', element: LandingPage },
  { path: '/login', element: Login },
  { path: '/register', element: Register },
]

/**
 * Get default redirect path based on user role
 */
export const getDefaultRoute = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return '/student/dashboard'
    case 'teacher':
      return '/teacher/dashboard'
    case 'management':
    case 'admin':
      return '/management/dashboard'
    default:
      return '/student/dashboard'
  }
}

/**
 * Check if user has access to a specific role route
 */
export const hasRoleAccess = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false
  return userRole.toLowerCase() === requiredRole.toLowerCase()
}

/**
 * Sidebar menu items for each role
 * These are the main navigation items shown in the sidebar
 */
export const roleMenuItems = {
  student: [
    { path: '/student/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/student/engagement', label: 'My Engagement', icon: <EngagementIcon /> },
    { path: '/student/study', label: 'Study Session', icon: <StudyIcon /> },
    { path: '/student/quizzes', label: 'Quizzes', icon: <QuizIcon /> },
    { path: '/student/reports', label: 'Reports', icon: <ReportsIcon /> },
    { path: '/student/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { path: '/student/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { path: '/student/settings', label: 'Settings', icon: <SettingsIcon /> },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/teacher/live-class', label: 'Live Class', icon: <LiveClassIcon /> },
    { path: '/teacher/students', label: 'Students', icon: <PeopleIcon /> },
    { path: '/teacher/quizzes-exams', label: 'Quizzes & Exams', icon: <QuizIcon /> },
    { path: '/teacher/reports-analytics', label: 'Reports & Analytics', icon: <ReportsIcon /> },
    { path: '/teacher/settings', label: 'Settings', icon: <SettingsIcon /> },
  ],
  management: [
    { path: '/management/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/management/reports', label: 'Reports', icon: <ReportsIcon /> },
    { path: '/management/students-analytics', label: 'Students Analytics', icon: <AnalyticsIcon /> },
    { path: '/management/teachers', label: 'Teachers Overview', icon: <PeopleIcon /> },
    { path: '/management/department-performance', label: 'Department Performance', icon: <DepartmentIcon /> },
    { path: '/management/system-settings', label: 'System Settings', icon: <SystemIcon /> },
  ],
  admin: [
    { path: '/management/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/management/reports', label: 'Reports', icon: <ReportsIcon /> },
    { path: '/management/students-analytics', label: 'Students Analytics', icon: <AnalyticsIcon /> },
    { path: '/management/teachers', label: 'Teachers Overview', icon: <PeopleIcon /> },
    { path: '/management/department-performance', label: 'Department Performance', icon: <DepartmentIcon /> },
    { path: '/management/system-settings', label: 'System Settings', icon: <SystemIcon /> },
  ]
}

/**
 * Get menu items for a specific role
 */
export const getMenuItems = (role) => {
  return roleMenuItems[role?.toLowerCase()] || roleMenuItems.student
}
