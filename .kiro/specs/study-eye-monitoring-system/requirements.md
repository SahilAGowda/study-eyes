# Requirements Document

## Introduction

The Study Eye system is an AI-powered student engagement monitoring platform that provides real-time multimodal behavior detection, continuous engagement scoring, and dual classroom/exam monitoring modes. The system operates entirely locally to ensure privacy compliance while delivering comprehensive behavioral analytics through video and audio processing.

## Glossary

- **Study Eye System**: The complete AI-powered student engagement monitoring application
- **Engagement Score**: A continuous numeric value (0-100) representing student attention and focus level
- **Behavior Classification**: Real-time categorization of student activities into predefined classes
- **Classroom Mode**: Monitoring mode focused on engagement tracking with visual feedback
- **Exam Mode**: Monitoring mode focused on integrity verification with event logging
- **Temporal Timeline**: Rolling 60-second visualization of engagement score history
- **Local Processing**: All AI inference performed on the client device without cloud transmission
- **Anonymization Toggle**: User-controlled feature to blur face or hide video feed
- **Multimodal Detection**: Combined analysis of video and audio inputs for behavior recognition

## Requirements

### Requirement 1: Local Multimodal Input Processing

**User Story:** As a student, I want the system to process my webcam and microphone inputs locally, so that my privacy is protected and no data is sent to external servers

#### Acceptance Criteria

1. WHEN the Study Eye System initializes, THE System SHALL capture video input from the user's webcam
2. WHEN the Study Eye System initializes, THE System SHALL capture audio input from the user's microphone
3. THE Study Eye System SHALL process all video frames locally on the client device
4. THE Study Eye System SHALL process all audio signals locally on the client device
5. THE Study Eye System SHALL NOT transmit raw video data to any external server
6. THE Study Eye System SHALL NOT transmit raw audio data to any external server
7. THE Study Eye System SHALL NOT store raw video data to persistent storage
8. THE Study Eye System SHALL NOT store raw audio data to persistent storage

### Requirement 2: Six-Class Behavior Recognition

**User Story:** As an educator, I want the system to recognize at least six distinct student behaviors, so that I can understand detailed engagement patterns beyond simple binary classification

#### Acceptance Criteria

1. THE Study Eye System SHALL detect and classify "Focused / Looking at screen" behavior
2. THE Study Eye System SHALL detect and classify "Looking Away / Distracted" behavior
3. THE Study Eye System SHALL detect and classify "Speaking Detected" behavior based on audio activity
4. THE Study Eye System SHALL detect and classify "Note-taking / writing motion" behavior
5. THE Study Eye System SHALL detect and classify "No Face Detected" behavior
6. THE Study Eye System SHALL detect and classify "Phone / unauthorized object detected" behavior in Exam Mode
7. WHEN behavior is detected, THE Study Eye System SHALL provide a confidence score between 0 and 1
8. THE Study Eye System SHALL update behavior classification every 3 to 5 seconds

### Requirement 3: Continuous Engagement Scoring

**User Story:** As a student, I want to see my engagement score update continuously based on my behavior trends, so that I can monitor and improve my focus in real-time

#### Acceptance Criteria

1. THE Study Eye System SHALL calculate an engagement score as a numeric value from 0 to 100
2. THE Study Eye System SHALL update the engagement score continuously based on temporal trend analysis
3. THE Study Eye System SHALL NOT use binary scoring for engagement calculation
4. WHEN multiple positive behaviors are detected over time, THE Study Eye System SHALL increase the engagement score
5. WHEN multiple negative behaviors are detected over time, THE Study Eye System SHALL decrease the engagement score
6. THE Study Eye System SHALL apply temporal smoothing to prevent erratic score fluctuations
7. THE Study Eye System SHALL weight recent behaviors more heavily than older behaviors in score calculation

### Requirement 4: Temporal Engagement Tracking

**User Story:** As a student, I want to see a rolling timeline of my engagement history for the last 60 seconds, so that I can understand my focus patterns over time

#### Acceptance Criteria

1. THE Study Eye System SHALL maintain a rolling timeline visualization showing engagement score history
2. THE Study Eye System SHALL display engagement history for the last 60 seconds
3. THE Study Eye System SHALL update the temporal timeline every 3 to 5 seconds
4. THE Study Eye System SHALL render the timeline as a continuous line graph or area chart
5. WHEN the timeline reaches 60 seconds of data, THE Study Eye System SHALL remove the oldest data point when adding new data

### Requirement 5: Real-Time Dashboard Display

**User Story:** As a student, I want to see my live video feed with detected behavior labels and engagement metrics, so that I have immediate feedback on my study session

#### Acceptance Criteria

1. THE Study Eye System SHALL display the live video feed from the webcam
2. THE Study Eye System SHALL overlay the current behavior classification text on the video feed
3. THE Study Eye System SHALL display the current engagement score numerically
4. THE Study Eye System SHALL display the engagement score as a progress bar or visual indicator
5. THE Study Eye System SHALL display a real-time audio activity indicator showing speech or silent state
6. THE Study Eye System SHALL update all dashboard elements in real-time with minimal latency (less than 500ms)
7. THE Study Eye System SHALL maintain a minimum frame rate of 10 FPS for video display

### Requirement 6: Privacy Controls and Compliance

**User Story:** As a student, I want privacy controls and clear compliance messaging, so that I feel safe using the monitoring system

#### Acceptance Criteria

1. THE Study Eye System SHALL provide an anonymization toggle control
2. WHEN the anonymization toggle is enabled, THE Study Eye System SHALL blur the user's face in the video feed
3. WHEN the anonymization toggle is enabled, THE Study Eye System SHALL continue behavior detection with reduced accuracy
4. THE Study Eye System SHALL display the text warning "Local processing — No recording — Privacy compliant" prominently on the dashboard
5. THE Study Eye System SHALL NOT record or store video frames to disk
6. THE Study Eye System SHALL NOT record or store audio samples to disk
7. THE Study Eye System SHALL process all data in volatile memory only

### Requirement 7: Dual Mode Operation - Classroom Mode

**User Story:** As a student in a classroom setting, I want engagement monitoring with visual feedback and alerts, so that I can maintain focus during learning sessions

#### Acceptance Criteria

1. THE Study Eye System SHALL provide a Classroom Mode operation setting
2. WHILE in Classroom Mode, THE Study Eye System SHALL display behavior labels on the video overlay
3. WHILE in Classroom Mode, THE Study Eye System SHALL display the engagement score numerically and graphically
4. WHILE in Classroom Mode, THE Study Eye System SHALL display the temporal engagement timeline
5. WHEN the engagement score drops by 30 percent or more within 10 seconds, THE Study Eye System SHALL generate an alert notification
6. WHILE in Classroom Mode, THE Study Eye System SHALL output data in the format: { behavior_label, engagement_score, timestamp, event_alert }
7. THE Study Eye System SHALL update Classroom Mode outputs every 3 to 5 seconds

### Requirement 8: Dual Mode Operation - Exam Mode

**User Story:** As an exam proctor, I want integrity monitoring with event logging for suspicious behaviors, so that I can ensure fair testing conditions

#### Acceptance Criteria

1. THE Study Eye System SHALL provide an Exam Mode operation setting
2. WHILE in Exam Mode, THE Study Eye System SHALL enable detection for looking away behavior
3. WHILE in Exam Mode, THE Study Eye System SHALL enable detection for speaking behavior
4. WHILE in Exam Mode, THE Study Eye System SHALL enable detection for phone usage behavior
5. WHILE in Exam Mode, THE Study Eye System SHALL log event counts instead of displaying visual overlays
6. WHILE in Exam Mode, THE Study Eye System SHALL output data in the format: { event_type, count, timestamp }
7. WHILE in Exam Mode, THE Study Eye System SHALL increment event counts when suspicious behaviors are detected
8. THE Study Eye System SHALL NOT display real-time visual feedback in Exam Mode to avoid distracting the test-taker

### Requirement 9: Real-Time Performance

**User Story:** As a user, I want the system to run smoothly in real-time, so that monitoring does not interfere with my study or exam experience

#### Acceptance Criteria

1. THE Study Eye System SHALL process video frames at a minimum rate of 10 frames per second
2. THE Study Eye System SHALL process video frames at a target rate of 15 frames per second
3. THE Study Eye System SHALL complete behavior classification within 200 milliseconds per frame
4. THE Study Eye System SHALL complete engagement score calculation within 100 milliseconds
5. THE Study Eye System SHALL use lightweight or compressed AI models to ensure real-time performance
6. WHERE hardware acceleration is available, THE Study Eye System SHALL utilize GPU processing for inference
7. THE Study Eye System SHALL maintain responsive UI interactions with less than 100 milliseconds input latency

### Requirement 10: MVP Deliverable Scope

**User Story:** As a stakeholder, I want a working MVP prototype that demonstrates all core capabilities, so that I can validate the research concept and system feasibility

#### Acceptance Criteria

1. THE Study Eye System SHALL demonstrate multimodal detection using both video and audio inputs
2. THE Study Eye System SHALL demonstrate classification of at least six distinct behavior types
3. THE Study Eye System SHALL demonstrate continuous engagement scoring with temporal analysis
4. THE Study Eye System SHALL demonstrate privacy compliance messaging and controls
5. THE Study Eye System SHALL demonstrate both Classroom Mode and Exam Mode logic
6. THE Study Eye System SHALL demonstrate a real-time UI dashboard with all required elements
7. THE Study Eye System SHALL run as a functional prototype on standard consumer hardware
8. THE Study Eye System SHALL serve as proof-of-concept for multimodal behavior recognition beyond binary classification
