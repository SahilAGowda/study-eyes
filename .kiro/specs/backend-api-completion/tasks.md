# Implementation Plan

- [ ] 1. Database Schema and Models Setup
  - Create all new database models for quiz, live class, and engagement tracking
  - Add migration scripts for schema changes
  - _Requirements: 1, 2, 5, 6, 16, 17, 18, 19, 20_

- [ ] 1.1 Create Quiz and Question Models
  - Implement Quiz model with all fields (title, subject, topic, duration, etc.)
  - Implement Question model supporting multiple question types
  - Implement QuizAttempt and QuestionResponse models
  - Add relationships between models
  - _Requirements: 2_

- [x] 1.2 Create Live Class Models


  - Implement LiveClass model with scheduling and status tracking
  - Implement ClassEnrollment model for student-class relationships
  - Add room_id field for WebSocket room management
  - _Requirements: 5_


- [ ] 1.3 Create Enhanced ClassEngagement Model
  - Implement comprehensive eye tracking fields (gaze, blinks, fixations, saccades, pupil dilation)
  - Add emotion and drowsiness detection fields
  - Add head pose and posture fields
  - Add distraction detection fields (phone usage, multiple faces, conversation)
  - Add audio analysis fields
  - Add composite scoring fields (attention_score, engagement_level)
  - _Requirements: 6, 16, 17, 18, 19, 20_

- [ ] 1.4 Create Supporting Models
  - Implement Notification model with type enum and read status
  - Implement Department model for organizational structure
  - Implement QuestionBank model for reusable questions
  - Add user role field to User model (student, teacher, management, admin)
  - _Requirements: 1, 7, 14_

- [ ] 1.5 Create Database Migration Scripts
  - Generate Alembic migration for all new models
  - Test migration on development database
  - Add indexes for frequently queried fields (user_id, class_id, quiz_id, timestamp)
  - _Requirements: All_

- [ ] 2. Core Attention Detection Service
  - Implement sophisticated multi-factor attention detection algorithms
  - This is the CORE functionality of the system
  - _Requirements: 6, 16, 17, 18, 19, 20_


- [x] 2.1 Implement Visual Attention Analysis

  - Create `calculate_visual_attention_score()` function with 100-point scoring
  - Implement gaze direction analysis (on-screen, on-content detection)
  - Implement gaze stability calculation
  - Implement fixation duration analysis (optimal 200-400ms)
  - Implement saccade frequency analysis (optimal 2.5-4.5 per second)
  - Implement blink rate analysis (normal 15-20 per minute)
  - Implement eye openness scoring
  - Implement pupil dilation analysis for cognitive load
  - Implement reading pattern detection (left-right scanning)
  - _Requirements: 17_


- [ ] 2.2 Implement Drowsiness Detection
  - Create `detect_drowsiness_from_eyes()` function using Eye Aspect Ratio (EAR)
  - Implement EAR calculation from eye landmarks
  - Set thresholds: Alert (>0.25), Drowsy (0.15-0.25), Eyes Closed (<0.15)
  - Implement blink duration analysis (>500ms indicates drowsiness)
  - Calculate drowsiness level (0-100 scale)
  - Add critical alerts for drowsy students
  - _Requirements: 17, 19_


- [ ] 2.3 Implement Emotional Engagement Analysis
  - Create `calculate_emotional_engagement_score()` function
  - Implement emotion classification (focused, confused, bored, frustrated, happy, sad, neutral, drowsy, anxious)
  - Implement emotion confidence and intensity calculation
  - Implement yawning detection from facial landmarks
  - Implement facial tension analysis
  - Implement confusion detection (furrowed brow, erratic gaze)
  - Implement frustration detection (facial tension, rapid head movements)
  - Implement interest level calculation from emotion history
  - Apply drowsiness penalties (50% for drowsy, 70% for eyes closed)

  - _Requirements: 19_

- [ ] 2.4 Implement Head Pose and Posture Analysis
  - Create `analyze_head_pose()` function
  - Calculate pitch, yaw, and roll angles
  - Detect optimal viewing position
  - Implement distance from camera measurement
  - Detect head nodding (falling asleep indicator)

  - Calculate head pose score (0-100)
  - _Requirements: 18_

- [ ] 2.5 Implement Distraction Detection
  - Create `detect_phone_usage()` using object detection (YOLO or similar)
  - Implement phone detection confidence scoring
  - Create `detect_multiple_faces()` for conversation detection
  - Implement face counting and location tracking
  - Create `detect_conversation()` combining audio and visual analysis
  - Implement looking away duration tracking
  - Create `classify_activity()` function (focused, using_phone, talking, looking_away, etc.)
  - Create `classify_distraction_type()` function
  - Calculate distraction score with penalties
  - _Requirements: 16, 20_

- [x] 2.6 Implement Audio Analysis

  - Create `analyze_audio()` function
  - Implement speech detection
  - Implement ambient noise level measurement
  - Implement multiple voice detection
  - Calculate audio engagement score
  - _Requirements: 20_

- [x] 2.7 Implement Master Attention Score Calculation

  - Create `calculate_attention_score()` with weighted algorithm
  - Set weights: Visual Attention (35%), Emotional Engagement (25%), Head Pose (15%), Distraction (15%), Audio (5%), Interaction (5%)
  - Apply critical penalties for drowsiness and eyes closed
  - Implement engagement level classification (high, medium, low, disengaged)
  - _Requirements: 6, 16_

- [x] 2.8 Implement Anomaly Detection and Alerts



  - Create `detect_anomalies()` for unusual patterns
  - Create `generate_attention_alerts()` for real-time teacher notifications
  - Create `generate_intervention_recommendations()` for struggling students
  - Implement alert thresholds and notification triggers
  - _Requirements: 6, 7_

- [ ] 3. Quiz Management System
  - Implement complete quiz creation, management, and analytics
  - _Requirements: 2, 3, 4, 14_

- [ ] 3.1 Create Quiz Service
  - Implement `create_quiz()` method
  - Implement `update_quiz()` method
  - Implement `delete_quiz()` method
  - Implement `publish_quiz()` method
  - Implement `duplicate_quiz()` method
  - Add validation for quiz data
  - _Requirements: 2_

- [ ] 3.2 Create Question Management
  - Implement `add_question()` method supporting all question types
  - Implement `update_question()` method
  - Implement `delete_question()` method
  - Implement question ordering and validation
  - _Requirements: 2_

- [ ] 3.3 Create Quiz Taking Service
  - Implement `start_attempt()` method
  - Implement `save_progress()` with auto-save functionality
  - Implement `submit_attempt()` method
  - Implement time limit enforcement and auto-submit
  - Implement `calculate_score()` for different question types
  - Implement `get_results()` with feedback and explanations
  - _Requirements: 4_

- [ ] 3.4 Create Quiz Analytics Service
  - Implement `get_quiz_analytics()` with completion rates and average scores
  - Implement `get_question_analytics()` for question-level statistics
  - Calculate difficulty metrics based on student performance
  - Identify problematic questions
  - _Requirements: 2_

- [ ] 3.5 Create AI Quiz Generation Service (Optional)
  - Implement `generate_quiz()` method using AI API (OpenAI or similar)
  - Implement `generate_questions()` with prompt engineering
  - Implement `validate_generated_questions()` for quality control
  - Add teacher review and edit functionality
  - _Requirements: 3_

- [ ] 3.6 Create Question Bank Service
  - Implement question bank CRUD operations
  - Implement question search and filtering by subject, topic, difficulty
  - Implement question tagging system
  - Track question usage statistics and performance
  - _Requirements: 14_

- [ ] 4. Quiz API Endpoints
  - Create RESTful API endpoints for quiz management
  - _Requirements: 2, 3, 4, 14_

- [ ] 4.1 Implement Quiz Management Endpoints
  - POST /api/quizzes - Create quiz
  - GET /api/quizzes - List quizzes with filters
  - GET /api/quizzes/:id - Get quiz details
  - PUT /api/quizzes/:id - Update quiz
  - DELETE /api/quizzes/:id - Delete quiz
  - POST /api/quizzes/:id/publish - Publish quiz
  - POST /api/quizzes/:id/duplicate - Duplicate quiz
  - Add authentication and authorization checks
  - _Requirements: 2_

- [ ] 4.2 Implement Question Management Endpoints
  - POST /api/quizzes/:id/questions - Add question
  - PUT /api/quizzes/:id/questions/:qid - Update question
  - DELETE /api/quizzes/:id/questions/:qid - Delete question
  - Add validation for question data
  - _Requirements: 2_

- [ ] 4.3 Implement Quiz Taking Endpoints
  - POST /api/quiz-attempts - Start attempt
  - GET /api/quiz-attempts/:id - Get attempt details
  - PUT /api/quiz-attempts/:id - Save progress
  - POST /api/quiz-attempts/:id/submit - Submit quiz
  - GET /api/quiz-attempts/:id/results - Get results
  - GET /api/students/quizzes - Get student's quizzes
  - _Requirements: 4_

- [ ] 4.4 Implement Quiz Analytics Endpoints
  - GET /api/teachers/quizzes/:id/analytics - Quiz analytics
  - GET /api/teachers/quizzes/:id/results - All student results
  - Add data aggregation and statistics
  - _Requirements: 2_

- [ ] 4.5 Implement AI Generation Endpoint (Optional)
  - POST /api/quizzes/generate-ai - Generate quiz with AI
  - Add async processing for long-running generation
  - _Requirements: 3_

- [ ] 4.6 Implement Question Bank Endpoints
  - GET /api/question-bank - List questions
  - POST /api/question-bank - Add question
  - GET /api/question-bank/:id - Get question
  - PUT /api/question-bank/:id - Update question
  - DELETE /api/question-bank/:id - Delete question
  - GET /api/question-bank/search - Search questions
  - _Requirements: 14_

- [ ] 5. Live Class Management System
  - Implement live class creation, scheduling, and monitoring
  - _Requirements: 5, 6_

- [ ] 5.1 Create Live Class Service
  - Implement `create_class()` method
  - Implement `start_class()` method
  - Implement `end_class()` method
  - Implement `enroll_student()` method
  - Implement `get_active_students()` method
  - Implement `get_class_statistics()` method
  - _Requirements: 5_

- [ ] 5.2 Create Class Engagement Processing
  - Implement `process_engagement_data()` method
  - Store real-time engagement data in database
  - Calculate and update attention scores
  - Detect and flag anomalies
  - _Requirements: 6_

- [ ] 5.3 Create Class Analytics Service
  - Calculate aggregate class engagement metrics
  - Generate per-student engagement reports
  - Identify students needing intervention
  - Calculate teacher performance metrics
  - _Requirements: 6, 9_

- [ ] 6. Live Class API Endpoints
  - Create RESTful API endpoints for live class management
  - _Requirements: 5, 6_

- [ ] 6.1 Implement Class Management Endpoints
  - POST /api/classes - Create class
  - GET /api/classes - List classes
  - GET /api/classes/:id - Get class details
  - PUT /api/classes/:id - Update class
  - DELETE /api/classes/:id - Delete class
  - POST /api/classes/:id/start - Start class
  - POST /api/classes/:id/end - End class
  - _Requirements: 5_

- [ ] 6.2 Implement Class Enrollment Endpoints
  - POST /api/classes/:id/enroll - Enroll student
  - GET /api/classes/:id/students - Get enrolled students
  - DELETE /api/classes/:id/students/:sid - Remove student
  - _Requirements: 5_

- [ ] 6.3 Implement Class Monitoring Endpoints
  - GET /api/classes/:id/engagement - Get real-time engagement
  - GET /api/classes/:id/students/:sid/engagement - Get student engagement
  - GET /api/classes/:id/alerts - Get attention alerts
  - _Requirements: 6_

- [ ] 7. WebSocket Real-Time Communication
  - Implement WebSocket handlers for live class monitoring
  - _Requirements: 5, 6, 13_

- [ ] 7.1 Setup WebSocket Infrastructure
  - Configure Flask-SocketIO
  - Implement JWT authentication for WebSocket connections
  - Create room management for class sessions
  - Implement connection/disconnection handlers
  - _Requirements: 13_

- [ ] 7.2 Implement Client-to-Server Events
  - Handle 'connect' event with authentication
  - Handle 'join_class' event
  - Handle 'leave_class' event
  - Handle 'engagement_data' event with real-time processing
  - Handle 'subscribe_notifications' event
  - _Requirements: 6, 13_

- [ ] 7.3 Implement Server-to-Client Events
  - Emit 'class_started' event
  - Emit 'class_ended' event
  - Emit 'student_joined' event
  - Emit 'student_left' event
  - Emit 'engagement_update' event with aggregated data
  - Emit 'attention_alert' event for low attention
  - Emit 'new_notification' event
  - _Requirements: 6, 7, 13_

- [ ] 7.4 Implement Real-Time Data Processing
  - Process incoming engagement data in real-time
  - Calculate attention scores on-the-fly
  - Detect anomalies and trigger alerts
  - Broadcast updates to teacher dashboard
  - Implement data batching for performance
  - _Requirements: 6, 13_

- [ ] 8. Notification System
  - Implement comprehensive notification system
  - _Requirements: 7_

- [ ] 8.1 Create Notification Service
  - Implement `create_notification()` method
  - Implement `send_notification()` method
  - Implement `mark_as_read()` method
  - Implement `get_user_notifications()` method
  - Implement `send_bulk_notifications()` method
  - _Requirements: 7_

- [ ] 8.2 Implement Notification Triggers
  - Create notification on quiz assignment
  - Create notification 15 minutes before class
  - Create notification on grade posting
  - Create notification on attention alerts
  - Create notification for system announcements
  - _Requirements: 7_

- [ ] 8.3 Create Notification API Endpoints
  - GET /api/notifications - Get user notifications
  - PUT /api/notifications/:id/read - Mark as read
  - PUT /api/notifications/read-all - Mark all as read
  - DELETE /api/notifications/:id - Delete notification
  - _Requirements: 7_

- [ ] 9. Teacher Analytics and Dashboard
  - Implement teacher-specific analytics and reporting
  - _Requirements: 9, 10_

- [ ] 9.1 Create Teacher Dashboard Service
  - Implement `get_teacher_dashboard()` method
  - Aggregate data: active classes, pending quizzes, student count
  - Calculate average engagement across all classes
  - Identify students needing attention
  - _Requirements: 9_

- [ ] 9.2 Create Student Overview for Teachers
  - Implement `get_teacher_students()` method
  - Implement `get_student_data_for_teacher()` method
  - Show engagement history, quiz performance, attendance
  - Generate intervention recommendations
  - _Requirements: 9, 15_

- [ ] 9.3 Create Teacher Analytics Endpoints
  - GET /api/teachers/dashboard - Teacher dashboard
  - GET /api/teachers/students - List students
  - GET /api/teachers/students/:id - Student details
  - GET /api/teachers/analytics - Teacher analytics
  - _Requirements: 9_

- [ ] 10. Management Analytics and Reporting
  - Implement system-wide analytics for management
  - _Requirements: 8, 9, 12_

- [ ] 10.1 Create Management Dashboard Service
  - Implement `get_management_dashboard()` method
  - Aggregate system-wide statistics
  - Calculate department performance metrics
  - Identify top teachers and at-risk students
  - _Requirements: 8_

- [ ] 10.2 Create Department Analytics Service
  - Implement `get_department_analytics()` method
  - Calculate per-department engagement, completion rates
  - Compare departments and identify trends
  - _Requirements: 8_

- [ ] 10.3 Create Teacher Performance Service
  - Implement `get_teacher_performance()` method
  - Rank teachers by engagement scores
  - Identify teachers needing support
  - _Requirements: 9_

- [ ] 10.4 Create Student Performance Service
  - Implement `get_student_performance()` method
  - Generate comprehensive student reports
  - Identify weak areas and provide recommendations
  - _Requirements: 10_

- [ ] 10.5 Create Management API Endpoints
  - GET /api/management/dashboard - Management dashboard
  - GET /api/management/departments - List departments
  - GET /api/management/departments/:id - Department details
  - GET /api/management/teachers - List teachers
  - GET /api/management/students - List students
  - GET /api/management/analytics - System analytics
  - _Requirements: 8, 9_

- [ ] 11. User Role Management
  - Implement role-based access control
  - _Requirements: 1_

- [ ] 11.1 Implement Role Management
  - Add role field to User model
  - Implement role validation
  - Create role assignment endpoint
  - Update authentication to include role
  - _Requirements: 1_

- [ ] 11.2 Implement Authorization Middleware
  - Create role-checking decorators
  - Apply role checks to all endpoints
  - Implement permission validation
  - _Requirements: 1_

- [ ] 11.3 Create Role Management Endpoints
  - POST /api/management/users/:id/role - Update user role
  - GET /api/management/users - List all users
  - Add role filtering and search
  - _Requirements: 1_

- [ ] 12. System Settings and Configuration
  - Implement system-wide settings management
  - _Requirements: 11_

- [ ] 12.1 Create Settings Service
  - Implement settings storage (database or config file)
  - Implement `get_system_settings()` method
  - Implement `update_system_settings()` method
  - Support settings: engagement thresholds, notification preferences, quiz defaults
  - _Requirements: 11_

- [ ] 12.2 Create Settings API Endpoints
  - GET /api/management/settings - Get settings
  - PUT /api/management/settings - Update settings
  - Add validation for setting values
  - _Requirements: 11_

- [ ] 13. Data Export and Reporting
  - Implement data export functionality
  - _Requirements: 12_

- [ ] 13.1 Create Export Service
  - Implement CSV export functionality
  - Implement JSON export functionality
  - Implement PDF export functionality (optional)
  - Support filtering by date range, department, data type
  - _Requirements: 12_

- [ ] 13.2 Create Export API Endpoint
  - POST /api/management/export - Export data
  - Implement async processing for large exports
  - Generate download links with expiration
  - _Requirements: 12_

- [ ] 14. Testing and Quality Assurance
  - Implement comprehensive testing
  - _Requirements: All_

- [ ] 14.1 Write Unit Tests for Attention Detection
  - Test visual attention score calculation
  - Test emotional engagement score calculation
  - Test drowsiness detection algorithm
  - Test distraction detection
  - Test attention score weighting
  - _Requirements: 6, 16, 17, 18, 19, 20_

- [ ] 14.2 Write Unit Tests for Quiz System
  - Test quiz creation and validation
  - Test question management
  - Test quiz scoring for all question types
  - Test quiz attempt workflow
  - _Requirements: 2, 3, 4_

- [ ] 14.3 Write Integration Tests
  - Test quiz workflow end-to-end
  - Test live class workflow end-to-end
  - Test WebSocket communication
  - Test notification delivery
  - _Requirements: All_

- [ ] 14.4 Write API Endpoint Tests
  - Test all quiz endpoints
  - Test all class endpoints
  - Test all analytics endpoints
  - Test authentication and authorization
  - _Requirements: All_

- [ ] 14.5 Perform Load Testing
  - Test WebSocket with 100+ concurrent connections
  - Test database performance with large datasets
  - Test real-time engagement data processing throughput
  - _Requirements: 6, 13_

- [ ] 15. Documentation and Deployment
  - Create documentation and prepare for deployment
  - _Requirements: All_

- [ ] 15.1 Create API Documentation
  - Document all endpoints with OpenAPI/Swagger
  - Include request/response examples
  - Document authentication requirements
  - _Requirements: All_

- [ ] 15.2 Create Developer Documentation
  - Write setup guide
  - Document development workflow
  - Create contribution guidelines
  - Document attention detection algorithms
  - _Requirements: All_

- [ ] 15.3 Setup Deployment Configuration
  - Configure environment variables
  - Setup database connection pooling
  - Configure logging and monitoring
  - Setup error tracking (Sentry or similar)
  - _Requirements: All_

- [ ] 15.4 Create Database Backup Strategy
  - Implement automated backups
  - Test backup restoration
  - Document backup procedures
  - _Requirements: All_
