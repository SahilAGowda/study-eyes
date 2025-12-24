# Backend API Completion - Design Document

## Overview

This design document outlines the architecture and implementation approach for completing the Study Eyes backend API. The system will be built as an extension to the existing Flask application, adding new routes, models, services, and WebSocket handlers to support quiz management, live classes, multi-factor attention detection, notifications, and comprehensive analytics.

### Design Goals

1. **Extensibility**: Build on existing architecture without breaking current functionality
2. **Real-time Performance**: Support WebSocket communication for live class monitoring
3. **Scalability**: Design for handling multiple concurrent live classes and quiz sessions
4. **Accuracy**: Implement sophisticated multi-factor attention detection algorithms
5. **Maintainability**: Follow existing code patterns and maintain clear separation of concerns

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Student UI │ Teacher UI │ Management UI                     │
└────────┬────────────┬────────────┬──────────────────────────┘
         │            │            │
         │ HTTP/REST  │ WebSocket  │
         │            │            │
┌────────▼────────────▼────────────▼──────────────────────────┐
│                   Flask Backend API                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Route Layer (Blueprints)                 │   │
│  │  Auth │ Quiz │ Class │ Analytics │ Notifications     │   │
│  └────────┬──────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼──────────────────────────────────────────────┐   │
│  │              Service Layer                             │   │
│  │  Quiz Service │ Attention Service │ WebSocket Service │   │
│  │  Notification Service │ Analytics Service             │   │
│  └────────┬──────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼──────────────────────────────────────────────┐   │
│  │              Data Layer (SQLAlchemy)                   │   │
│  │  User │ Quiz │ Question │ Class │ Engagement          │   │
│  └────────┬──────────────────────────────────────────────┘   │
└───────────┼───────────────────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────────┐
│                    PostgreSQL Database                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│              External Services (Optional)                       │
│  OpenAI API │ MediaPipe │ Redis Cache │ Email Service         │
└────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: Flask with Flask-SocketIO
- **Database**: PostgreSQL (or SQLite for development)
- **ORM**: SQLAlchemy
- **Real-time**: Flask-SocketIO with WebSocket support
- **Authentication**: JWT (Flask-JWT-Extended)
- **AI/ML**: MediaPipe for face detection, OpenCV for image processing
- **Caching**: Redis (optional, for session data)
- **Task Queue**: Celery (optional, for async tasks like AI quiz generation)

## Components and Interfaces

### 1. Database Models

#### Quiz Model
```python
class Quiz(db.Model):
    id: Integer (Primary Key)
    teacher_id: Integer (Foreign Key -> User)
    title: String(200)
    subject: String(100)
    topic: String(200)
    description: Text
    duration_minutes: Integer
    passing_score: Integer
    max_attempts: Integer
    is_published: Boolean
    is_ai_generated: Boolean
    deadline: DateTime
    created_at: DateTime
    updated_at: DateTime
    
    # Relationships
    questions: List[Question]
    attempts: List[QuizAttempt]
```

#### Question Model
```python
class Question(db.Model):
    id: Integer (Primary Key)
    quiz_id: Integer (Foreign Key -> Quiz)
    question_type: Enum (multiple_choice, true_false, short_answer, essay, matching, fill_blank)
    question_text: Text
    options: JSON  # Array of options for multiple choice
    correct_answers: JSON  # Array or single value
    points: Integer
    difficulty: Enum (easy, medium, hard)
    tags: JSON  # Array of tags
    explanation: Text
    order_index: Integer
    created_at: DateTime
```

#### QuizAttempt Model
```python
class QuizAttempt(db.Model):
    id: Integer (Primary Key)
    quiz_id: Integer (Foreign Key -> Quiz)
    student_id: Integer (Foreign Key -> User)
    start_time: DateTime
    end_time: DateTime
    status: Enum (in_progress, completed, submitted, abandoned)
    score: Float
    time_spent_seconds: Integer
    responses: JSON  # Array of question responses
    created_at: DateTime
```

#### QuestionResponse Model
```python
class QuestionResponse(db.Model):
    id: Integer (Primary Key)
    attempt_id: Integer (Foreign Key -> QuizAttempt)
    question_id: Integer (Foreign Key -> Question)
    response: JSON  # Student's answer
    is_correct: Boolean
    points_earned: Float
    time_spent_seconds: Integer
    feedback: Text
```

#### LiveClass Model
```python
class LiveClass(db.Model):
    id: Integer (Primary Key)
    teacher_id: Integer (Foreign Key -> User)
    title: String(200)
    subject: String(100)
    description: Text
    scheduled_start: DateTime
    scheduled_end: DateTime
    actual_start: DateTime
    actual_end: DateTime
    status: Enum (scheduled, active, completed, cancelled)
    room_id: String(100)  # Unique identifier for WebSocket room
    max_students: Integer
    created_at: DateTime
    
    # Relationships
    enrollments: List[ClassEnrollment]
    engagement_data: List[ClassEngagement]
```

#### ClassEnrollment Model
```python
class ClassEnrollment(db.Model):
    id: Integer (Primary Key)
    class_id: Integer (Foreign Key -> LiveClass)
    student_id: Integer (Foreign Key -> User)
    enrolled_at: DateTime
    attendance_status: Enum (present, absent, late)
    joined_at: DateTime
    left_at: DateTime
```

#### ClassEngagement Model
```python
class ClassEngagement(db.Model):
    id: Integer (Primary Key)
    class_id: Integer (Foreign Key -> LiveClass)
    student_id: Integer (Foreign Key -> User)
    timestamp: DateTime
    
    # Eye tracking metrics (CORE FOCUS DETECTION)
    gaze_x: Float  # Horizontal gaze position
    gaze_y: Float  # Vertical gaze position
    gaze_on_screen: Boolean
    gaze_on_content_area: Boolean  # Looking at main content vs edges
    gaze_stability: Float  # How steady the gaze is (0-1)
    saccade_frequency: Float  # Rapid eye movements per minute
    fixation_duration: Float  # Average time eyes stay in one place (ms)
    blink_rate: Float  # Blinks per minute
    blink_duration_avg: Float  # Average blink duration (ms)
    eye_openness_left: Float  # 0-1 scale
    eye_openness_right: Float  # 0-1 scale
    pupil_dilation_left: Float  # mm
    pupil_dilation_right: Float  # mm
    eye_aspect_ratio: Float  # EAR for drowsiness detection
    
    # Advanced eye analysis
    reading_pattern_detected: Boolean  # Left-right scanning pattern
    cognitive_load_indicator: Float  # Based on pupil dilation changes
    visual_attention_score: Float  # 0-100, core metric
    
    # Head pose metrics
    head_pitch: Float
    head_yaw: Float
    head_roll: Float
    distance_cm: Float
    
    # Emotion and behavior (CORE ENGAGEMENT DETECTION)
    primary_emotion: Enum (focused, confused, bored, frustrated, happy, sad, neutral, drowsy, anxious)
    emotion_confidence: Float  # 0-1
    secondary_emotion: Enum  # Secondary detected emotion
    emotion_intensity: Float  # How strong the emotion is (0-1)
    
    # Facial expression analysis
    is_yawning: Boolean
    yawn_frequency: Integer  # Yawns in last 5 minutes
    is_smiling: Boolean
    eyebrow_raised: Boolean  # Indicates surprise or confusion
    mouth_open: Boolean
    facial_tension: Float  # Indicates stress/concentration
    
    # Drowsiness and fatigue detection (CRITICAL)
    drowsiness_level: Float  # 0-100, higher = more drowsy
    is_drowsy: Boolean  # Alert flag
    eye_closure_duration: Float  # Seconds eyes closed
    head_nodding_detected: Boolean  # Falling asleep indicator
    fatigue_score: Float  # 0-100
    
    # Engagement indicators
    is_actively_engaged: Boolean  # Overall engagement flag
    confusion_detected: Boolean  # Needs help
    frustration_detected: Boolean  # Struggling
    interest_level: Float  # 0-100
    
    # Audio metrics
    is_speaking: Boolean
    ambient_noise_level: Float
    
    # Distraction detection
    is_using_phone: Boolean
    phone_detection_confidence: Float
    is_talking_to_others: Boolean
    multiple_faces_detected: Boolean
    face_count: Integer
    looking_away_duration: Integer  # seconds
    
    # Activity classification
    activity_type: Enum (focused_on_screen, reading, writing, using_phone, talking, looking_away, absent)
    distraction_type: Enum (none, phone, conversation, looking_away, other_device, multiple_people)
    
    # Composite score
    attention_score: Float  # 0-100
    engagement_level: Enum (high, medium, low, disengaged)
```

#### Notification Model
```python
class Notification(db.Model):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key -> User)
    type: Enum (quiz_assigned, class_starting, grade_posted, system_announcement, attention_alert)
    title: String(200)
    message: Text
    related_id: Integer  # ID of related quiz, class, etc.
    related_type: String(50)  # Type of related entity
    is_read: Boolean
    read_at: DateTime
    created_at: DateTime
```

#### Department Model
```python
class Department(db.Model):
    id: Integer (Primary Key)
    name: String(100)
    code: String(20)
    description: Text
    head_teacher_id: Integer (Foreign Key -> User)
    created_at: DateTime
    
    # Relationships
    teachers: List[User]
    students: List[User]
```

#### QuestionBank Model
```python
class QuestionBank(db.Model):
    id: Integer (Primary Key)
    teacher_id: Integer (Foreign Key -> User)
    question_text: Text
    question_type: Enum
    options: JSON
    correct_answers: JSON
    subject: String(100)
    topic: String(200)
    difficulty: Enum
    tags: JSON
    usage_count: Integer
    avg_correct_rate: Float
    created_at: DateTime
    updated_at: DateTime
```

### 2. API Endpoints

#### Quiz Management Endpoints

```
POST   /api/quizzes                    # Create new quiz
GET    /api/quizzes                    # List quizzes (with filters)
GET    /api/quizzes/:id                # Get quiz details
PUT    /api/quizzes/:id                # Update quiz
DELETE /api/quizzes/:id                # Delete quiz
POST   /api/quizzes/:id/publish        # Publish quiz
POST   /api/quizzes/:id/duplicate      # Duplicate quiz

POST   /api/quizzes/:id/questions      # Add question to quiz
PUT    /api/quizzes/:id/questions/:qid # Update question
DELETE /api/quizzes/:id/questions/:qid # Delete question

POST   /api/quizzes/generate-ai        # AI-generate quiz
```

#### Quiz Taking Endpoints

```
POST   /api/quiz-attempts               # Start quiz attempt
GET    /api/quiz-attempts/:id           # Get attempt details
PUT    /api/quiz-attempts/:id           # Save progress
POST   /api/quiz-attempts/:id/submit    # Submit quiz
GET    /api/quiz-attempts/:id/results   # Get results

GET    /api/students/quizzes            # Get student's quizzes
GET    /api/students/quizzes/:id        # Get specific quiz for taking
```

#### Live Class Endpoints

```
POST   /api/classes                     # Create live class
GET    /api/classes                     # List classes
GET    /api/classes/:id                 # Get class details
PUT    /api/classes/:id                 # Update class
DELETE /api/classes/:id                 # Delete class

POST   /api/classes/:id/start           # Start live class
POST   /api/classes/:id/end             # End live class
POST   /api/classes/:id/enroll          # Enroll student
GET    /api/classes/:id/students        # Get enrolled students
GET    /api/classes/:id/engagement      # Get real-time engagement data
```

#### Notification Endpoints

```
GET    /api/notifications               # Get user notifications
PUT    /api/notifications/:id/read      # Mark as read
PUT    /api/notifications/read-all      # Mark all as read
DELETE /api/notifications/:id           # Delete notification
```

#### Teacher Analytics Endpoints

```
GET    /api/teachers/dashboard          # Teacher dashboard data
GET    /api/teachers/students           # List students
GET    /api/teachers/students/:id       # Get student details
GET    /api/teachers/analytics          # Teacher analytics
GET    /api/teachers/quizzes/:id/analytics  # Quiz analytics
```

#### Management Endpoints

```
GET    /api/management/dashboard        # Management dashboard
GET    /api/management/departments      # List departments
GET    /api/management/departments/:id  # Department details
GET    /api/management/teachers         # List teachers
GET    /api/management/students         # List students
GET    /api/management/analytics        # System-wide analytics
POST   /api/management/users/:id/role   # Update user role
GET    /api/management/settings         # Get system settings
PUT    /api/management/settings         # Update system settings
POST   /api/management/export           # Export data
```

#### Question Bank Endpoints

```
GET    /api/question-bank               # List questions
POST   /api/question-bank               # Add question
GET    /api/question-bank/:id           # Get question
PUT    /api/question-bank/:id           # Update question
DELETE /api/question-bank/:id           # Delete question
GET    /api/question-bank/search        # Search questions
```

### 3. WebSocket Events

#### Client -> Server Events

```javascript
// Connection
'connect' - Establish WebSocket connection
'authenticate' - Send JWT token for authentication
'disconnect' - Close connection

// Live Class
'join_class' - Join a live class room
'leave_class' - Leave a live class room
'engagement_data' - Send real-time engagement metrics

// Notifications
'subscribe_notifications' - Subscribe to notification channel
```

#### Server -> Client Events

```javascript
// Live Class
'class_started' - Class has started
'class_ended' - Class has ended
'student_joined' - Student joined the class
'student_left' - Student left the class
'engagement_update' - Real-time engagement data update
'attention_alert' - Student attention dropped

// Notifications
'new_notification' - New notification received

// Quiz
'quiz_assigned' - New quiz assigned
'quiz_deadline_reminder' - Quiz deadline approaching
```

### 4. Service Layer

#### QuizService

```python
class QuizService:
    def create_quiz(teacher_id, quiz_data) -> Quiz
    def update_quiz(quiz_id, quiz_data) -> Quiz
    def delete_quiz(quiz_id) -> bool
    def publish_quiz(quiz_id) -> Quiz
    def duplicate_quiz(quiz_id) -> Quiz
    
    def add_question(quiz_id, question_data) -> Question
    def update_question(question_id, question_data) -> Question
    def delete_question(question_id) -> bool
    
    def get_quiz_analytics(quiz_id) -> dict
    def get_question_analytics(question_id) -> dict
```

#### AIQuizGeneratorService

```python
class AIQuizGeneratorService:
    def generate_quiz(subject, topic, question_count, difficulty) -> dict
    def generate_questions(prompt, count) -> List[dict]
    def validate_generated_questions(questions) -> List[dict]
```

#### QuizAttemptService

```python
class QuizAttemptService:
    def start_attempt(student_id, quiz_id) -> QuizAttempt
    def save_progress(attempt_id, responses) -> QuizAttempt
    def submit_attempt(attempt_id) -> QuizAttempt
    def calculate_score(attempt_id) -> float
    def get_results(attempt_id) -> dict
```

#### LiveClassService

```python
class LiveClassService:
    def create_class(teacher_id, class_data) -> LiveClass
    def start_class(class_id) -> LiveClass
    def end_class(class_id) -> LiveClass
    def enroll_student(class_id, student_id) -> ClassEnrollment
    def get_active_students(class_id) -> List[dict]
    def get_class_statistics(class_id) -> dict
```

#### AttentionDetectionService

```python
class AttentionDetectionService:
    # Core processing
    def process_engagement_data(class_id, student_id, data) -> ClassEngagement
    def calculate_attention_score(engagement_data) -> float
    
    # Eye tracking analysis (CORE FOCUS)
    def analyze_eye_tracking(eye_data) -> dict
    def calculate_visual_attention_score(eye_data) -> float
    def detect_gaze_on_content(gaze_x, gaze_y, screen_dimensions) -> bool
    def calculate_gaze_stability(gaze_history) -> float
    def analyze_saccades(eye_movement_data) -> dict
    def analyze_fixations(eye_movement_data) -> dict
    def detect_reading_pattern(gaze_sequence) -> bool
    def calculate_cognitive_load(pupil_data) -> float
    def detect_drowsiness_from_eyes(eye_data) -> dict
    
    # Emotion analysis (CORE ENGAGEMENT)
    def analyze_emotion(emotion_data, facial_landmarks) -> dict
    def detect_primary_emotion(facial_features) -> str
    def calculate_emotion_intensity(facial_features) -> float
    def detect_drowsiness(facial_features, eye_data) -> dict
    def detect_confusion(facial_features, gaze_pattern) -> bool
    def detect_frustration(facial_features, behavior_history) -> bool
    def calculate_interest_level(emotion_history, gaze_data) -> float
    def detect_yawning(facial_landmarks) -> bool
    def calculate_fatigue_score(drowsiness_indicators) -> float
    
    # Head pose analysis
    def analyze_head_pose(pose_data) -> dict
    def detect_head_nodding(pose_history) -> bool
    
    # Audio analysis
    def analyze_audio(audio_data) -> dict
    
    # Distraction detection
    def detect_phone_usage(frame_data) -> dict
    def detect_multiple_faces(frame_data) -> dict
    def classify_activity(engagement_data) -> str
    def classify_distraction_type(engagement_data) -> str
    def detect_conversation(audio_data, face_data) -> bool
    
    # Alerts and reporting
    def detect_anomalies(student_id, class_id) -> List[dict]
    def generate_attention_alerts(class_id) -> List[dict]
    def generate_intervention_recommendations(student_id, engagement_history) -> List[str]
```

#### NotificationService

```python
class NotificationService:
    def create_notification(user_id, type, title, message, related_id, related_type) -> Notification
    def send_notification(notification_id) -> bool
    def mark_as_read(notification_id) -> Notification
    def get_user_notifications(user_id, unread_only=False) -> List[Notification]
    def send_bulk_notifications(user_ids, notification_data) -> List[Notification]
```

#### AnalyticsService

```python
class AnalyticsService:
    def get_teacher_dashboard(teacher_id) -> dict
    def get_student_dashboard(student_id) -> dict
    def get_management_dashboard() -> dict
    def get_department_analytics(department_id) -> dict
    def get_teacher_performance(teacher_id) -> dict
    def get_student_performance(student_id) -> dict
    def calculate_engagement_trends(entity_type, entity_id, days) -> List[dict]
```

## Data Models

### Attention Score Calculation Algorithm

The attention score is a weighted composite of multiple factors with distraction penalties:

```python
def calculate_attention_score(engagement_data):
    """
    CORE ALGORITHM: Calculate comprehensive attention score
    Focus on visual attention and emotional engagement as primary indicators
    """
    weights = {
        'visual_attention': 0.35,  # HIGHEST: Eye tracking, gaze, focus
        'emotional_engagement': 0.25,  # Emotion, drowsiness, interest
        'head_pose': 0.15,
        'distraction_detection': 0.15,  # Phone, talking, etc.
        'audio': 0.05,
        'interaction': 0.05
    }
    
    # Visual attention score (0-100) - CORE METRIC
    visual_attention_score = calculate_visual_attention_score(
        gaze_on_screen=engagement_data.gaze_on_screen,
        gaze_on_content=engagement_data.gaze_on_content_area,
        gaze_stability=engagement_data.gaze_stability,
        fixation_duration=engagement_data.fixation_duration,
        saccade_frequency=engagement_data.saccade_frequency,
        blink_rate=engagement_data.blink_rate,
        eye_openness_left=engagement_data.eye_openness_left,
        eye_openness_right=engagement_data.eye_openness_right,
        pupil_dilation_left=engagement_data.pupil_dilation_left,
        pupil_dilation_right=engagement_data.pupil_dilation_right,
        reading_pattern=engagement_data.reading_pattern_detected,
        cognitive_load=engagement_data.cognitive_load_indicator
    )
    
    # Head pose score (0-100)
    head_score = calculate_head_pose_score(
        pitch=engagement_data.head_pitch,
        yaw=engagement_data.head_yaw,
        roll=engagement_data.head_roll,
        distance=engagement_data.distance_cm
    )
    
    # Emotional engagement score (0-100) - CORE METRIC
    emotional_engagement_score = calculate_emotional_engagement_score(
        primary_emotion=engagement_data.primary_emotion,
        emotion_confidence=engagement_data.emotion_confidence,
        emotion_intensity=engagement_data.emotion_intensity,
        drowsiness_level=engagement_data.drowsiness_level,
        is_drowsy=engagement_data.is_drowsy,
        fatigue_score=engagement_data.fatigue_score,
        yawn_frequency=engagement_data.yawn_frequency,
        interest_level=engagement_data.interest_level,
        confusion_detected=engagement_data.confusion_detected,
        frustration_detected=engagement_data.frustration_detected,
        is_actively_engaged=engagement_data.is_actively_engaged
    )
    
    # Audio score (0-100)
    audio_score = calculate_audio_score(
        is_speaking=engagement_data.is_speaking,
        noise_level=engagement_data.ambient_noise_level
    )
    
    # Distraction detection score (0-100)
    # Lower score = more distracted
    distraction_score = calculate_distraction_score(
        is_using_phone=engagement_data.is_using_phone,
        phone_confidence=engagement_data.phone_detection_confidence,
        is_talking_to_others=engagement_data.is_talking_to_others,
        multiple_faces=engagement_data.multiple_faces_detected,
        face_count=engagement_data.face_count,
        looking_away_duration=engagement_data.looking_away_duration
    )
    
    # Interaction score (0-100) - based on recent activity
    interaction_score = calculate_interaction_score(student_id, class_id)
    
    # Weighted average with emphasis on visual and emotional metrics
    attention_score = (
        visual_attention_score * weights['visual_attention'] +
        emotional_engagement_score * weights['emotional_engagement'] +
        head_score * weights['head_pose'] +
        audio_score * weights['audio'] +
        distraction_score * weights['distraction_detection'] +
        interaction_score * weights['interaction']
    )
    
    # Apply critical penalties for severe issues
    if engagement_data.is_drowsy:
        attention_score *= 0.5  # 50% penalty for drowsiness
    
    if engagement_data.eye_closure_duration > 3:  # Eyes closed > 3 seconds
        attention_score *= 0.3  # 70% penalty
    
    return round(max(0, attention_score), 2)

def calculate_distraction_score(is_using_phone, phone_confidence, 
                                is_talking_to_others, multiple_faces, 
                                face_count, looking_away_duration):
    """
    Calculate distraction score where 100 = fully focused, 0 = completely distracted
    """
    score = 100.0
    
    # Phone usage penalty (severe)
    if is_using_phone:
        phone_penalty = 40 * phone_confidence  # Up to -40 points
        score -= phone_penalty
    
    # Talking to others penalty (moderate to severe)
    if is_talking_to_others:
        score -= 30
    
    # Multiple faces detected (indicates others in frame)
    if multiple_faces:
        # Penalty increases with more faces
        face_penalty = min(25, (face_count - 1) * 10)
        score -= face_penalty
    
    # Looking away duration penalty
    if looking_away_duration > 5:  # More than 5 seconds
        # Progressive penalty: 5s = -10, 10s = -20, 15s+ = -30
        away_penalty = min(30, (looking_away_duration - 5) * 2)
        score -= away_penalty
    
    return max(0, score)  # Ensure score doesn't go below 0

def classify_activity(engagement_data):
    """
    Classify student's current activity based on engagement data
    """
    # Priority order: most distracting first
    if engagement_data.is_using_phone:
        return 'using_phone'
    
    if engagement_data.is_talking_to_others or engagement_data.multiple_faces_detected:
        return 'talking'
    
    if engagement_data.looking_away_duration > 10:
        return 'looking_away'
    
    if not engagement_data.gaze_on_screen and engagement_data.head_pitch < -20:
        return 'reading'  # Looking down, possibly at notes
    
    if engagement_data.gaze_on_screen and engagement_data.attention_score > 70:
        return 'focused_on_screen'
    
    return 'distracted'

def classify_distraction_type(engagement_data):
    """
    Identify the primary type of distraction
    """
    if engagement_data.is_using_phone:
        return 'phone'
    
    if engagement_data.is_talking_to_others or engagement_data.multiple_faces_detected:
        return 'conversation'
    
    if engagement_data.looking_away_duration > 10:
        return 'looking_away'
    
    if engagement_data.face_count > 1:
        return 'multiple_people'
    
    return 'none'

def detect_phone_usage(frame_data):
    """
    Detect if student is using a phone using object detection
    Uses YOLO or similar model to detect phone in frame
    """
    # Pseudo-code for phone detection
    detected_objects = run_object_detection(frame_data)
    
    phone_detected = False
    confidence = 0.0
    
    for obj in detected_objects:
        if obj.class_name in ['cell phone', 'mobile phone', 'smartphone']:
            phone_detected = True
            confidence = max(confidence, obj.confidence)
            
            # Check if phone is near face (being used)
            if is_near_face(obj.bbox, face_bbox):
                confidence *= 1.2  # Increase confidence if near face
    
    return {
        'is_using_phone': phone_detected,
        'confidence': min(1.0, confidence)
    }

def detect_multiple_faces(frame_data):
    """
    Detect if multiple people are in the frame
    """
    faces = detect_faces(frame_data)
    
    return {
        'multiple_faces_detected': len(faces) > 1,
        'face_count': len(faces),
        'face_locations': [face.bbox for face in faces]
    }

def detect_conversation(audio_data, face_data):
    """
    Detect if student is having a conversation with someone
    Combines audio analysis (multiple voices) with visual (multiple faces)
    """
    # Audio analysis
    voice_count = count_distinct_voices(audio_data)
    is_speaking = detect_speech(audio_data)
    
    # Visual analysis
    face_count = len(face_data.get('faces', []))
    
    # Conversation likely if:
    # 1. Multiple voices detected, OR
    # 2. Student speaking + multiple faces present
    is_conversation = (
        voice_count > 1 or 
        (is_speaking and face_count > 1)
    )
    
    return is_conversation

def calculate_visual_attention_score(gaze_on_screen, gaze_on_content, gaze_stability,
                                    fixation_duration, saccade_frequency, blink_rate,
                                    eye_openness_left, eye_openness_right,
                                    pupil_dilation_left, pupil_dilation_right,
                                    reading_pattern, cognitive_load):
    """
    CORE FUNCTION: Calculate visual attention score based on comprehensive eye tracking
    This is the most important metric for determining if student is actually paying attention
    """
    score = 0.0
    
    # 1. Gaze direction (30 points max)
    if gaze_on_screen:
        score += 15
        if gaze_on_content:  # Looking at main content area, not edges
            score += 15
    
    # 2. Gaze stability (20 points max)
    # Stable gaze indicates focus, erratic gaze indicates distraction
    stability_score = gaze_stability * 20
    score += stability_score
    
    # 3. Fixation quality (15 points max)
    # Optimal fixation duration: 200-400ms
    # Too short = scanning/distracted, too long = zoning out
    if 200 <= fixation_duration <= 400:
        score += 15
    elif 150 <= fixation_duration < 200 or 400 < fixation_duration <= 500:
        score += 10
    elif 100 <= fixation_duration < 150 or 500 < fixation_duration <= 600:
        score += 5
    # else: 0 points (very poor fixation)
    
    # 4. Saccade frequency (10 points max)
    # Normal reading: 3-4 saccades per second
    # Too many = distracted, too few = not processing
    if 2.5 <= saccade_frequency <= 4.5:
        score += 10
    elif 2.0 <= saccade_frequency < 2.5 or 4.5 < saccade_frequency <= 5.5:
        score += 7
    elif 1.5 <= saccade_frequency < 2.0 or 5.5 < saccade_frequency <= 6.5:
        score += 4
    
    # 5. Blink rate (10 points max)
    # Normal: 15-20 blinks per minute
    # Too few = intense focus or screen strain
    # Too many = fatigue or distraction
    if 12 <= blink_rate <= 25:
        score += 10
    elif 8 <= blink_rate < 12 or 25 < blink_rate <= 30:
        score += 7
    elif 5 <= blink_rate < 8 or 30 < blink_rate <= 35:
        score += 4
    
    # 6. Eye openness (10 points max)
    avg_openness = (eye_openness_left + eye_openness_right) / 2
    if avg_openness >= 0.8:  # Wide open, alert
        score += 10
    elif avg_openness >= 0.6:  # Normal
        score += 7
    elif avg_openness >= 0.4:  # Partially closed, drowsy
        score += 3
    # else: Very low openness = likely drowsy or eyes closed
    
    # 7. Pupil dilation (cognitive load indicator) (5 points max)
    # Moderate dilation indicates active thinking
    avg_dilation = (pupil_dilation_left + pupil_dilation_right) / 2
    if 3.0 <= avg_dilation <= 5.0:  # Optimal range (mm)
        score += 5
    elif 2.5 <= avg_dilation < 3.0 or 5.0 < avg_dilation <= 6.0:
        score += 3
    
    # Bonus points
    if reading_pattern:  # Detected systematic left-right scanning
        score += 5
    
    if 0.4 <= cognitive_load <= 0.7:  # Optimal cognitive load
        score += 5
    
    return min(100, score)  # Cap at 100

def calculate_emotional_engagement_score(primary_emotion, emotion_confidence,
                                        emotion_intensity, drowsiness_level,
                                        is_drowsy, fatigue_score, yawn_frequency,
                                        interest_level, confusion_detected,
                                        frustration_detected, is_actively_engaged):
    """
    CORE FUNCTION: Calculate emotional engagement score
    Determines if student is emotionally present and engaged with learning
    """
    score = 0.0
    
    # 1. Primary emotion assessment (40 points max)
    emotion_scores = {
        'focused': 40,
        'happy': 35,
        'neutral': 30,
        'confused': 20,  # Not ideal but shows engagement
        'anxious': 15,
        'frustrated': 10,
        'bored': 5,
        'sad': 5,
        'drowsy': 0
    }
    
    base_emotion_score = emotion_scores.get(primary_emotion, 20)
    # Weight by confidence
    emotion_score = base_emotion_score * emotion_confidence
    score += emotion_score
    
    # 2. Drowsiness penalty (CRITICAL)
    if is_drowsy:
        score *= 0.3  # Severe penalty - student is falling asleep
    else:
        # Progressive penalty based on drowsiness level
        drowsiness_penalty = drowsiness_level * 0.3  # Up to 30% reduction
        score *= (1 - drowsiness_penalty / 100)
    
    # 3. Fatigue assessment (15 points max)
    fatigue_impact = (100 - fatigue_score) / 100 * 15
    score += fatigue_impact
    
    # 4. Yawning frequency penalty
    if yawn_frequency > 0:
        yawn_penalty = min(15, yawn_frequency * 5)  # -5 points per yawn, max -15
        score -= yawn_penalty
    
    # 5. Interest level (20 points max)
    score += (interest_level / 100) * 20
    
    # 6. Confusion/Frustration handling (10 points max)
    if confusion_detected:
        # Confusion shows engagement but needs help
        score += 5
    
    if frustration_detected:
        # Frustration shows effort but struggling
        score += 3
    
    # 7. Active engagement bonus (15 points max)
    if is_actively_engaged:
        score += 15
    
    return min(100, max(0, score))

def detect_drowsiness_from_eyes(eye_data):
    """
    Detect drowsiness using Eye Aspect Ratio (EAR) and other eye metrics
    This is CRITICAL for identifying students who are falling asleep
    """
    # Calculate Eye Aspect Ratio (EAR)
    # EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    # where p1-p6 are eye landmark points
    
    ear_left = calculate_ear(eye_data['left_eye_landmarks'])
    ear_right = calculate_ear(eye_data['right_eye_landmarks'])
    avg_ear = (ear_left + ear_right) / 2
    
    # EAR thresholds
    # Normal: > 0.25
    # Drowsy: 0.15 - 0.25
    # Eyes closed: < 0.15
    
    drowsiness_indicators = {
        'ear_score': avg_ear,
        'is_drowsy': avg_ear < 0.20,
        'eyes_closed': avg_ear < 0.15,
        'drowsiness_level': 0
    }
    
    # Calculate drowsiness level (0-100)
    if avg_ear >= 0.25:
        drowsiness_indicators['drowsiness_level'] = 0  # Alert
    elif avg_ear >= 0.20:
        drowsiness_indicators['drowsiness_level'] = 30  # Slightly drowsy
    elif avg_ear >= 0.15:
        drowsiness_indicators['drowsiness_level'] = 60  # Moderately drowsy
    else:
        drowsiness_indicators['drowsiness_level'] = 90  # Very drowsy/eyes closed
    
    # Additional indicators
    blink_duration = eye_data.get('blink_duration_avg', 0)
    if blink_duration > 500:  # Blinks longer than 500ms indicate drowsiness
        drowsiness_indicators['drowsiness_level'] = min(100, 
            drowsiness_indicators['drowsiness_level'] + 20)
    
    # Slow blink rate also indicates drowsiness
    blink_rate = eye_data.get('blink_rate', 15)
    if blink_rate < 10:
        drowsiness_indicators['drowsiness_level'] = min(100,
            drowsiness_indicators['drowsiness_level'] + 15)
    
    return drowsiness_indicators

def calculate_ear(eye_landmarks):
    """
    Calculate Eye Aspect Ratio from eye landmarks
    Used for drowsiness detection
    """
    # Vertical eye landmarks
    A = distance(eye_landmarks[1], eye_landmarks[5])
    B = distance(eye_landmarks[2], eye_landmarks[4])
    
    # Horizontal eye landmark
    C = distance(eye_landmarks[0], eye_landmarks[3])
    
    # EAR formula
    ear = (A + B) / (2.0 * C)
    return ear

def detect_confusion(facial_features, gaze_pattern):
    """
    Detect if student is confused
    Indicators: furrowed brow, erratic gaze, prolonged fixation on same area
    """
    confusion_score = 0
    
    # Facial indicators
    if facial_features.get('eyebrows_furrowed'):
        confusion_score += 30
    
    if facial_features.get('mouth_slightly_open'):
        confusion_score += 20
    
    # Gaze pattern indicators
    if gaze_pattern.get('fixation_duration') > 1000:  # Staring at same spot > 1s
        confusion_score += 25
    
    if gaze_pattern.get('gaze_stability') < 0.3:  # Very erratic gaze
        confusion_score += 25
    
    return confusion_score > 50

def detect_frustration(facial_features, behavior_history):
    """
    Detect if student is frustrated
    Indicators: tense facial muscles, rapid head movements, sighing
    """
    frustration_score = 0
    
    # Facial tension
    if facial_features.get('facial_tension') > 0.7:
        frustration_score += 30
    
    # Negative emotions
    if facial_features.get('emotion') in ['frustrated', 'angry', 'sad']:
        frustration_score += 40
    
    # Behavioral patterns
    recent_behaviors = behavior_history[-10:]  # Last 10 data points
    
    # Frequent head movements
    head_movement_count = sum(1 for b in recent_behaviors 
                             if abs(b.get('head_yaw', 0)) > 20)
    if head_movement_count > 5:
        frustration_score += 20
    
    # Looking away frequently
    looking_away_count = sum(1 for b in recent_behaviors 
                            if not b.get('gaze_on_screen', True))
    if looking_away_count > 6:
        frustration_score += 10
    
    return frustration_score > 50

def calculate_interest_level(emotion_history, gaze_data):
    """
    Calculate overall interest level based on sustained positive engagement
    """
    if not emotion_history:
        return 50  # Neutral default
    
    # Analyze recent emotion history (last 30 seconds)
    recent_emotions = emotion_history[-30:]
    
    positive_emotions = ['focused', 'happy', 'interested']
    negative_emotions = ['bored', 'drowsy', 'sad']
    
    positive_count = sum(1 for e in recent_emotions 
                        if e.get('primary_emotion') in positive_emotions)
    negative_count = sum(1 for e in recent_emotions 
                        if e.get('primary_emotion') in negative_emotions)
    
    # Base interest from emotions
    emotion_interest = (positive_count / len(recent_emotions)) * 100
    
    # Adjust based on gaze quality
    gaze_interest = 0
    if gaze_data.get('gaze_on_content'):
        gaze_interest += 30
    if gaze_data.get('gaze_stability', 0) > 0.7:
        gaze_interest += 20
    
    # Combined interest level
    interest_level = (emotion_interest * 0.7 + gaze_interest * 0.3)
    
    # Penalty for negative emotions
    if negative_count > len(recent_emotions) * 0.3:  # More than 30% negative
        interest_level *= 0.6
    
    return round(interest_level, 2)
```

### Quiz Scoring Logic

```python
def calculate_quiz_score(attempt):
    total_points = 0
    earned_points = 0
    
    for response in attempt.responses:
        question = Question.query.get(response.question_id)
        total_points += question.points
        
        if question.question_type == 'multiple_choice':
            if response.response == question.correct_answers[0]:
                earned_points += question.points
                response.is_correct = True
        
        elif question.question_type == 'true_false':
            if response.response == question.correct_answers[0]:
                earned_points += question.points
                response.is_correct = True
        
        elif question.question_type == 'short_answer':
            # Fuzzy matching or manual grading required
            response.is_correct = None  # Pending review
        
        elif question.question_type == 'essay':
            # Manual grading required
            response.is_correct = None  # Pending review
        
        response.points_earned = earned_points if response.is_correct else 0
    
    score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
    return score_percentage
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-10-29T10:30:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `QUIZ_ALREADY_STARTED` - Cannot modify quiz in progress
- `CLASS_FULL` - Maximum students reached
- `DEADLINE_PASSED` - Quiz deadline has passed
- `WEBSOCKET_ERROR` - WebSocket connection error

## Testing Strategy

### Unit Tests

- Test each service method independently
- Mock database calls
- Test attention score calculation algorithms
- Test quiz scoring logic
- Test notification creation and delivery

### Integration Tests

- Test API endpoints with database
- Test WebSocket event handling
- Test authentication and authorization
- Test quiz workflow (create -> take -> submit -> grade)
- Test live class workflow (create -> start -> monitor -> end)

### Performance Tests

- Load test WebSocket connections (100+ concurrent students)
- Test database query performance with large datasets
- Test real-time engagement data processing throughput
- Test quiz submission under load

### End-to-End Tests

- Complete student quiz-taking flow
- Complete teacher class monitoring flow
- Complete management analytics flow

## Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Role-based access control for all operations
3. **Input Validation**: Validate all user inputs to prevent injection attacks
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **WebSocket Security**: Authenticate WebSocket connections with JWT
6. **Data Privacy**: Encrypt sensitive data at rest and in transit
7. **CORS**: Configure CORS properly for frontend domains
8. **SQL Injection**: Use parameterized queries via SQLAlchemy
9. **XSS Prevention**: Sanitize user-generated content
10. **Session Management**: Implement secure session handling

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Caching**: Use Redis for session data and frequently accessed analytics
3. **Query Optimization**: Use eager loading for relationships
4. **WebSocket Optimization**: Batch engagement data updates
5. **Async Processing**: Use Celery for long-running tasks (AI generation, exports)
6. **Connection Pooling**: Configure database connection pooling
7. **Pagination**: Implement pagination for list endpoints
8. **Compression**: Enable gzip compression for API responses

## Deployment Considerations

1. **Environment Variables**: Use environment variables for configuration
2. **Database Migrations**: Use Flask-Migrate for schema changes
3. **Logging**: Implement comprehensive logging for debugging
4. **Monitoring**: Set up application monitoring (e.g., Sentry)
5. **Backup**: Implement automated database backups
6. **Scaling**: Design for horizontal scaling with load balancers
7. **CI/CD**: Set up automated testing and deployment pipeline
