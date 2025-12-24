# Requirements Document

## Introduction

This document outlines the requirements for fixing critical issues in the attention tracking system. The system currently has multiple failures in video processing, face detection visualization, attention scoring logic, emotion detection, phone usage detection, and UI presentation.

## Glossary

- **System**: The attention tracking system that monitors student engagement
- **Camera Feed**: The live video stream from the student's webcam
- **Face Detection**: The process of identifying and locating human faces in video frames
- **Facial Landmarks**: Key points on a face (eyes, nose, mouth, etc.) used for analysis
- **Focus Score**: A numerical value (0-100) representing student attention level
- **Head Pose**: The orientation of the head (pitch, yaw, roll angles)
- **Emotion Detection**: Classification of facial expressions into emotional states
- **Phone Detection**: Identification of mobile phone usage during study sessions
- **Bounding Box**: A rectangular outline drawn around detected faces
- **Attention Score**: Composite metric combining multiple factors to measure engagement

## Requirements

### Requirement 1: Video Display Quality

**User Story:** As a student, I want to see my camera feed in full color, so that I can verify the system is working correctly and see myself naturally.

#### Acceptance Criteria

1. WHEN the System displays the camera feed, THE System SHALL render the video in full color without grayscale conversion
2. THE System SHALL maintain the original color profile from the webcam
3. THE System SHALL apply mirror effect for natural selfie view
4. THE System SHALL display video at minimum 480x360 resolution

### Requirement 2: Face Detection Visualization

**User Story:** As a student, I want to see visual indicators showing that my face is detected, so that I know the tracking system is working.

#### Acceptance Criteria

1. WHEN the System detects a face, THE System SHALL draw a bounding box around the detected face
2. THE System SHALL display a label "Student 1" above the bounding box
3. WHEN multiple faces are detected, THE System SHALL label each face sequentially (Student 1, Student 2, etc.)
4. THE System SHALL use distinct colors for bounding boxes (green for primary student, yellow for additional faces)
5. THE System SHALL update bounding box position in real-time as the face moves

### Requirement 3: Facial Landmarks Visualization

**User Story:** As a student, I want to see facial landmark points on my face, so that I can understand what features the system is tracking.

#### Acceptance Criteria

1. WHEN the System detects facial landmarks, THE System SHALL draw lines connecting landmark points
2. THE System SHALL visualize eye regions with connected points
3. THE System SHALL visualize mouth region with connected points
4. THE System SHALL visualize face outline with connected points
5. THE System SHALL use semi-transparent lines that do not obscure the face
6. THE System SHALL update landmark visualization at minimum 5 frames per second

### Requirement 4: Accurate Focus Score Calculation

**User Story:** As a student, I want my focus score to accurately reflect my attention level, so that I receive meaningful feedback on my engagement.

#### Acceptance Criteria

1. WHEN no face is detected, THE System SHALL set focus score to 0
2. WHEN the student looks away from the screen, THE System SHALL decrease focus score below 50
3. WHEN the student tilts head beyond 30 degrees in any direction, THE System SHALL decrease focus score by minimum 20 points
4. WHEN the student maintains forward gaze and upright posture, THE System SHALL maintain focus score above 80
5. THE System SHALL calculate focus score based on gaze direction with 40 percent weight
6. THE System SHALL calculate focus score based on head pose with 30 percent weight
7. THE System SHALL calculate focus score based on eye openness with 20 percent weight
8. THE System SHALL calculate focus score based on facial presence with 10 percent weight

### Requirement 5: Head Pose Detection and Scoring

**User Story:** As a student, I want the system to detect when I tilt or turn my head, so that my attention score reflects my actual viewing angle.

#### Acceptance Criteria

1. THE System SHALL calculate head pitch angle (up/down tilt) with accuracy within 10 degrees
2. THE System SHALL calculate head yaw angle (left/right turn) with accuracy within 10 degrees
3. THE System SHALL calculate head roll angle (side tilt) with accuracy within 10 degrees
4. WHEN head pitch exceeds 20 degrees up or down, THE System SHALL apply 30 percent penalty to focus score
5. WHEN head yaw exceeds 30 degrees left or right, THE System SHALL apply 40 percent penalty to focus score
6. WHEN head roll exceeds 25 degrees, THE System SHALL apply 25 percent penalty to focus score
7. THE System SHALL consider head pose optimal when all angles are within 15 degrees of center

### Requirement 6: Emotion Detection Accuracy

**User Story:** As a student, I want the system to accurately detect my emotional state, so that it can identify when I'm confused or disengaged.

#### Acceptance Criteria

1. THE System SHALL classify emotions into categories: focused, confused, bored, frustrated, happy, neutral, drowsy
2. THE System SHALL achieve minimum 70 percent accuracy in emotion classification
3. WHEN the student shows drowsy expression for more than 3 seconds, THE System SHALL trigger drowsiness alert
4. WHEN the student shows confused expression for more than 10 seconds, THE System SHALL trigger confusion alert
5. THE System SHALL use facial action units for emotion classification
6. THE System SHALL consider eye aspect ratio for drowsiness detection
7. THE System SHALL consider mouth aspect ratio for yawning detection
8. THE System SHALL update emotion classification every 2 seconds

### Requirement 7: Phone Usage Detection Accuracy

**User Story:** As a teacher, I want to know when students are using their phones, so that I can identify distracted students.

#### Acceptance Criteria

1. WHEN a phone is visible in the frame for more than 2 seconds, THE System SHALL detect phone usage
2. THE System SHALL achieve minimum 80 percent accuracy in phone detection
3. THE System SHALL minimize false positives to less than 10 percent
4. WHEN the student holds an object near their face, THE System SHALL distinguish between phone and other objects
5. WHEN phone is detected, THE System SHALL reduce focus score by 50 points
6. THE System SHALL use object detection model trained on phone images
7. THE System SHALL detect phones in various orientations and lighting conditions
8. THE System SHALL trigger phone usage alert after 3 consecutive seconds of detection

### Requirement 8: Enhanced UI Design

**User Story:** As a student, I want an attractive and informative interface, so that I can easily monitor my study session metrics.

#### Acceptance Criteria

1. THE System SHALL display camera feed with modern rounded corners and shadow effects
2. THE System SHALL use color-coded indicators for different metric levels (green for good, yellow for medium, red for poor)
3. THE System SHALL display real-time metrics in clearly labeled cards
4. THE System SHALL use smooth animations for metric updates
5. THE System SHALL provide visual feedback for alerts with icons and colors
6. THE System SHALL maintain consistent spacing and alignment across all UI elements
7. THE System SHALL use readable fonts with appropriate sizes for all text
8. THE System SHALL display connection status with animated indicators

### Requirement 9: Backend Processing Accuracy

**User Story:** As a system administrator, I want the backend to process video frames accurately, so that all detection algorithms work correctly.

#### Acceptance Criteria

1. THE System SHALL process video frames without color conversion to grayscale
2. THE System SHALL extract facial landmarks with minimum 68 points per face
3. THE System SHALL calculate eye aspect ratio for each eye independently
4. THE System SHALL calculate mouth aspect ratio for yawn detection
5. THE System SHALL perform face detection on every frame
6. THE System SHALL send complete tracking data including landmarks to frontend
7. THE System SHALL include bounding box coordinates in tracking data
8. THE System SHALL process frames at minimum 10 frames per second

### Requirement 10: Real-time Data Transmission

**User Story:** As a student, I want to see my tracking data update in real-time, so that I can adjust my behavior immediately.

#### Acceptance Criteria

1. THE System SHALL transmit tracking data via WebSocket with maximum 200ms latency
2. THE System SHALL include face bounding box coordinates in transmitted data
3. THE System SHALL include facial landmark coordinates in transmitted data
4. THE System SHALL include head pose angles in transmitted data
5. THE System SHALL include emotion classification in transmitted data
6. THE System SHALL include phone detection status in transmitted data
7. THE System SHALL include calculated focus score in transmitted data
8. THE System SHALL transmit data at minimum 5 updates per second
