# Study Eyes API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.study-eyes.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-01-01T10:00:00Z"
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "message": "Login successful"
}
```

#### POST /auth/logout
Logout user and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### GET /auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-01-01T10:00:00Z",
      "last_login": "2024-01-15T09:30:00Z",
      "study_streak": 7,
      "total_study_time": 3600
    }
  }
}
```

### Session Management

#### POST /sessions/start
Start a new study session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subject": "Mathematics",
  "planned_duration": 3600,
  "session_type": "focused_study",
  "notes": "Algebra practice session"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": 123,
      "user_id": 1,
      "subject": "Mathematics",
      "planned_duration": 3600,
      "actual_duration": null,
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": null,
      "is_active": true,
      "session_type": "focused_study",
      "notes": "Algebra practice session"
    }
  },
  "message": "Study session started successfully"
}
```

#### GET /sessions/current
Get current active session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": 123,
      "user_id": 1,
      "subject": "Mathematics",
      "planned_duration": 3600,
      "current_duration": 1800,
      "start_time": "2024-01-15T10:00:00Z",
      "is_active": true,
      "session_type": "focused_study",
      "real_time_stats": {
        "attention_score": 85.2,
        "focus_level": "high",
        "distraction_count": 3,
        "break_recommendations": 1
      }
    }
  }
}
```

#### POST /sessions/{session_id}/pause
Pause an active study session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": 123,
      "is_paused": true,
      "pause_time": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Session paused successfully"
}
```

#### POST /sessions/{session_id}/resume
Resume a paused study session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": 123,
      "is_paused": false,
      "resume_time": "2024-01-15T10:35:00Z"
    }
  },
  "message": "Session resumed successfully"
}
```

#### POST /sessions/{session_id}/end
End a study session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "notes": "Completed algebra exercises 1-20",
  "self_rating": 4
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": 123,
      "actual_duration": 3240,
      "end_time": "2024-01-15T10:54:00Z",
      "is_active": false,
      "session_summary": {
        "average_attention": 82.5,
        "focus_periods": 6,
        "distraction_events": 8,
        "productivity_score": 78
      }
    }
  },
  "message": "Session ended successfully"
}
```

#### GET /sessions
Get user's session history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `subject` (optional): Filter by subject
- `start_date` (optional): Filter sessions after date
- `end_date` (optional): Filter sessions before date

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": 123,
        "subject": "Mathematics",
        "actual_duration": 3240,
        "start_time": "2024-01-15T10:00:00Z",
        "end_time": "2024-01-15T10:54:00Z",
        "productivity_score": 78,
        "average_attention": 82.5
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_sessions": 95,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Analytics

#### GET /analytics/dashboard
Get dashboard analytics data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): today|week|month|year (default: week)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": "week",
    "summary": {
      "total_sessions": 12,
      "total_study_time": 43200,
      "average_session_duration": 3600,
      "average_attention_score": 78.5,
      "productivity_trend": "increasing",
      "study_streak": 7
    },
    "daily_stats": [
      {
        "date": "2024-01-15",
        "sessions": 2,
        "study_time": 7200,
        "average_attention": 82.1,
        "productivity_score": 85
      }
    ],
    "focus_patterns": {
      "peak_hours": ["09:00", "14:00"],
      "attention_by_hour": [
        {"hour": "09:00", "attention": 85.2},
        {"hour": "10:00", "attention": 82.1}
      ]
    },
    "distractions": {
      "total_count": 45,
      "common_types": [
        {"type": "phone_notification", "count": 15},
        {"type": "background_noise", "count": 12}
      ]
    }
  }
}
```

#### GET /analytics/insights
Get personalized insights and recommendations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "insights": [
      {
        "type": "peak_performance",
        "title": "Your peak focus time is 9-10 AM",
        "description": "You show 23% higher attention during morning hours",
        "recommendation": "Schedule important tasks during this time",
        "confidence": 0.89
      },
      {
        "type": "break_pattern",
        "title": "Take breaks every 45 minutes",
        "description": "Your attention drops significantly after 45 minutes",
        "recommendation": "Set a timer for regular breaks",
        "confidence": 0.76
      }
    ],
    "goals": {
      "weekly_target": 20,
      "current_progress": 15,
      "days_remaining": 2,
      "on_track": true
    },
    "improvements": {
      "attention_improvement": 12.5,
      "session_length_improvement": 8.3,
      "consistency_score": 85
    }
  }
}
```

#### GET /analytics/export
Export user's study data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `format`: json|csv (required)
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `include_tracking_data` (optional): true|false (default: false)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "export_url": "https://api.study-eyes.com/exports/user_1_20240115.json",
    "expires_at": "2024-01-16T10:00:00Z",
    "file_size": "2.5MB",
    "record_count": 1250
  },
  "message": "Export generated successfully"
}
```

### User Management

#### PUT /users/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "timezone": "America/New_York",
  "study_goals": {
    "daily_target": 2,
    "weekly_target": 14
  },
  "preferences": {
    "break_reminders": true,
    "email_notifications": false,
    "tracking_sensitivity": "medium"
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "timezone": "America/New_York",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

#### GET /users/stats
Get user statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "lifetime_stats": {
      "total_sessions": 245,
      "total_study_hours": 489.5,
      "average_session_rating": 4.2,
      "account_age_days": 90,
      "current_streak": 15,
      "longest_streak": 23
    },
    "achievements": [
      {
        "id": "first_session",
        "name": "Getting Started",
        "description": "Complete your first study session",
        "unlocked_at": "2024-01-01T10:30:00Z"
      },
      {
        "id": "week_streak",
        "name": "Consistent Learner",
        "description": "Study for 7 consecutive days",
        "unlocked_at": "2024-01-08T09:15:00Z"
      }
    ],
    "goals": {
      "current_weekly_goal": 20,
      "current_weekly_progress": 15,
      "goal_completion_rate": 0.85
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client to Server Events

#### start_tracking
Start eye tracking for a session.
```javascript
socket.emit('start_tracking', {
  token: 'your-jwt-token',
  session_id: 123
});
```

#### stop_tracking
Stop eye tracking.
```javascript
socket.emit('stop_tracking', {
  token: 'your-jwt-token'
});
```

#### pause_tracking
Pause eye tracking.
```javascript
socket.emit('pause_tracking', {
  token: 'your-jwt-token'
});
```

#### resume_tracking
Resume eye tracking.
```javascript
socket.emit('resume_tracking', {
  token: 'your-jwt-token'
});
```

### Server to Client Events

#### connected
Connection established successfully.
```javascript
socket.on('connected', (data) => {
  console.log(data.message); // "Connected to Study Eyes tracking service"
});
```

#### tracking_data
Real-time eye tracking data.
```javascript
socket.on('tracking_data', (data) => {
  console.log('Real-time data:', data);
  // {
  //   session_id: 123,
  //   timestamp: "2024-01-15T10:15:30Z",
  //   attention_score: 85.2,
  //   focus_level: "high",
  //   gaze_direction_x: 0.23,
  //   gaze_direction_y: -0.15,
  //   blink_detected: false,
  //   head_pitch: 2.1,
  //   head_yaw: -1.8,
  //   distraction_type: null
  // }
});
```

#### tracking_started
Tracking session started.
```javascript
socket.on('tracking_started', (data) => {
  console.log(data.message); // "Eye tracking started"
});
```

#### tracking_stopped
Tracking session stopped.
```javascript
socket.on('tracking_stopped', (data) => {
  console.log(data.message); // "Eye tracking stopped"
});
```

#### error
Error occurred.
```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `AUTH_INVALID` | Invalid or expired token |
| `AUTH_INSUFFICIENT` | Insufficient permissions |
| `USER_NOT_FOUND` | User does not exist |
| `USER_EXISTS` | User already exists |
| `SESSION_NOT_FOUND` | Session does not exist |
| `SESSION_ACTIVE` | Session already active |
| `SESSION_INACTIVE` | No active session |
| `VALIDATION_ERROR` | Request validation failed |
| `CAMERA_ERROR` | Camera access or processing error |
| `TRACKING_ERROR` | Eye tracking system error |
| `DATABASE_ERROR` | Database operation failed |
| `RATE_LIMIT` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Session management: 10 requests per minute
- Analytics endpoints: 20 requests per minute
- WebSocket connections: 1 connection per user

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (max: 100, default: 20)

Response includes pagination metadata:
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 95,
    "has_next": true,
    "has_prev": false,
    "limit": 20
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Common Filters
- `start_date`: ISO date string
- `end_date`: ISO date string
- `subject`: Subject name
- `session_type`: Session type

### Sorting
- `sort_by`: Field to sort by
- `sort_order`: asc|desc (default: desc)

Example:
```
GET /api/sessions?start_date=2024-01-01&sort_by=start_time&sort_order=asc
```
