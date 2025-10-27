# Role-Based Routing Implementation Guide

## Overview
The application now supports role-based routing with three distinct user roles:
- **Student** - Access to study sessions, analytics, and personal settings
- **Teacher** - Access to live classes, student monitoring, and reports
- **Management/Admin** - Access to system-wide reports, analytics, and settings

## Route Structure

### Student Routes (prefix: `/student`)
- `/student/dashboard` - Student Dashboard
- `/student/study` - Study Session
- `/student/study-fullscreen` - Fullscreen Study Session
- `/student/analytics` - Personal Analytics
- `/student/settings` - Student Settings
- `/student/camera-test` - Camera Test
- `/student/focus-test` - Focus Test
- `/student/engagement` - My Engagement
- `/student/notifications` - Notifications
- `/student/quizzes` - Quizzes
- `/student/reports` - Reports

### Teacher Routes (prefix: `/teacher`)
- `/teacher/dashboard` - Teacher Dashboard
- `/teacher/live-class` - Live Class Management
- `/teacher/students` - Students Overview
- `/teacher/quizzes-exams` - Quizzes & Exams
- `/teacher/reports-analytics` - Reports & Analytics
- `/teacher/settings` - Teacher Settings

### Management Routes (prefix: `/management`)
- `/management/dashboard` - Management Dashboard
- `/management/reports` - Management Reports
- `/management/students-analytics` - Students Analytics
- `/management/teachers` - Teachers Overview
- `/management/department-performance` - Department Performance
- `/management/system-settings` - System Settings

## Key Files

### 1. `src/routes.jsx`
Central configuration for all routes:
- `roleRoutes` - Defines routes for each role
- `publicRoutes` - Public routes (landing, login, register)
- `getDefaultRoute(role)` - Returns default dashboard based on role
- `hasRoleAccess(userRole, requiredRole)` - Checks role access

### 2. `src/components/common/PrivateRoute.jsx`
Authentication and authorization guard:
- Checks if user is authenticated
- Validates role-based access with `requiredRole` prop
- Redirects unauthorized users to appropriate dashboard

### 3. `src/App.jsx`
Main routing configuration:
- Uses `roleRoutes` to dynamically generate routes
- Implements `RoleBasedRedirect` for default redirects
- Maintains backward compatibility with legacy routes

### 4. `src/components/common/Navbar.jsx`
Role-aware navigation:
- Displays navigation items based on user role
- Shows role badge
- Highlights active route

### 5. `src/contexts/AuthContext.tsx`
Authentication context:
- Stores user data including role
- Provides `isAuthenticated`, `user`, `login`, `logout`
- Fixed localStorage token key typo

## How It Works

### 1. User Login
When a user logs in, their data (including role) is stored:
```javascript
const userData = {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
  role: "student", // or "teacher" or "management"
  token: "jwt_token_here"
}
login(userData)
```

### 2. Route Protection
Routes are protected by `PrivateRoute` with role validation:
```jsx
<Route
  path="/student/dashboard"
  element={
    <PrivateRoute requiredRole="student">
      <StudentDashboard />
    </PrivateRoute>
  }
/>
```

### 3. Automatic Redirection
- Unauthenticated users → `/login`
- Wrong role access → User's appropriate dashboard
- Unknown routes → Role-based default dashboard

### 4. Navigation Updates
The navbar automatically shows role-specific menu items:
- Student sees: Dashboard, Study Session, Analytics, Settings
- Teacher sees: Dashboard, Live Class, Students, Reports, Settings
- Management sees: Dashboard, Reports, Students, Teachers, Settings

## Testing the Implementation

### For Students:
1. Login with a student account (role: "student")
2. Navigate to `/student/dashboard` ✅
3. Try accessing `/teacher/dashboard` → Redirects to `/student/dashboard` ✅
4. Navbar shows student-specific items ✅

### For Teachers:
1. Login with a teacher account (role: "teacher")
2. Navigate to `/teacher/live-class` ✅
3. Try accessing `/student/study` → Redirects to `/teacher/dashboard` ✅
4. Navbar shows teacher-specific items ✅

### For Management:
1. Login with a management account (role: "management" or "admin")
2. Navigate to `/management/reports` ✅
3. Try accessing `/student/dashboard` → Redirects to `/management/dashboard` ✅
4. Navbar shows management-specific items ✅

## Backward Compatibility

Legacy routes are automatically redirected:
- `/dashboard` → `/student/dashboard`
- `/study` → `/student/study`
- `/analytics` → `/student/analytics`
- `/settings` → `/student/settings`

## Adding New Routes

### 1. Add route to `src/routes.jsx`:
```javascript
export const roleRoutes = {
  student: [
    // ... existing routes
    { path: 'new-feature', element: NewFeatureComponent, requiresAuth: true },
  ],
}
```

### 2. Add navigation item to `src/components/common/Navbar.jsx`:
```javascript
const roleNavItems = {
  student: [
    // ... existing items
    { path: '/student/new-feature', label: 'New Feature', icon: <NewIcon /> },
  ],
}
```

### 3. Create the component:
```javascript
// src/components/student/NewFeature.jsx
import React from 'react'
import { Container, Typography } from '@mui/material'

const NewFeature = () => {
  return (
    <Container>
      <Typography variant="h4">New Feature</Typography>
      {/* Your component content */}
    </Container>
  )
}

export default NewFeature
```

## Security Notes

- All role-based routes are protected by `PrivateRoute`
- Role validation happens on both client and should be validated on server
- User role is stored in localStorage and should be verified with backend
- Token expiration should be handled by the backend API

## Next Steps

1. **Update Login Component** - Ensure login returns user data with role
2. **Backend Integration** - Verify role from backend on each protected route
3. **Role Selection** - Add UI for role selection during registration
4. **Session Management** - Implement token refresh and expiration handling
5. **Testing** - Add comprehensive tests for role-based routing
