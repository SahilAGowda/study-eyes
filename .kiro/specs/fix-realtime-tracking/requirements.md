# Requirements Document: Fix Real-Time Eye Tracking Data Flow

## Introduction

The real-time eye tracking system is currently sending data but with incorrect structure and missing values, causing the frontend to receive `undefined` for all tracking metrics. This leads to performance issues (frontend hanging) and non-functional visual overlays (no face detection box, grayscale video, static numbers). This spec addresses the data contract mismatch between backend WebSocket emissions and frontend expectations.

## Glossary

- **WebSocket Service**: Backend service that emits real-time eye tracking data via Socket.IO
- **Tracking Data**: Real-time metrics including attention score, eye ratios, gaze direction, head pose, etc.
- **CameraOverlay**: Frontend React component that visualizes tracking data on video feed
- **Data Contract**: The agreed-upon structure and field names for tracking data between backend and frontend
- **Eye Tracker**: Backend service that processes video frames and extracts eye tracking metrics

## Requirements

### Requirement 1: WebSocket Data Structure Standardization

**User Story:** As a frontend developer, I want to receive tracking data in a consistent, flat structure so that I can easily access all metrics without nested navigation.

#### Acceptance Criteria

1. WHEN THE WebSocket Service emits tracking_data event, THE System SHALL send data with all tracking fields at the root level (not nested under a 'data' property)
2. WHEN THE WebSocket Service emits tracking_data event, THE System SHALL include session_id and timestamp at the root level alongside tracking metrics
3. WHEN THE WebSocket Service formats tracking data, THE System SHALL ensure all numeric values are valid numbers (not undefined, null, or NaN)
4. WHEN THE WebSocket Service formats tracking data, THE System SHALL ensure all boolean values are valid booleans (not undefined or null)
5. WHEN THE WebSocket Service formats tracking data, THE System SHALL ensure all string values are valid strings (not undefined or null)

### Requirement 2: Complete Tracking Data Fields

**User Story:** As a student using the eye tracking feature, I want all tracking metrics to be calculated and sent so that I can see accurate real-time feedback on my focus and attention.

#### Acceptance Criteria

1. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include attention_score as a number between 0 and 1
2. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include focus_level as a string ('high', 'medium', 'low', or 'disengaged')
3. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include eye tracking metrics (left_eye_ratio, right_eye_ratio, blink_detected)
4. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include gaze metrics (gaze_direction_x, gaze_direction_y, gaze_stability)
5. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include head pose metrics (head_pitch, head_yaw, head_roll)
6. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include distraction indicators (distraction_type, is_drowsy, is_using_phone, face_count)
7. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include posture_score as a number between 0 and 1
8. WHEN THE WebSocket Service emits tracking_data, THE System SHALL include fatigue_level and eye_strain_level as strings

### Requirement 3: Frontend Data Reception

**User Story:** As a student, I want the camera overlay to display real-time tracking information without causing the application to freeze or crash.

#### Acceptance Criteria

1. WHEN THE WebSocketContext receives tracking_data event, THE System SHALL extract tracking fields from the correct location in the payload
2. WHEN THE WebSocketContext receives tracking_data event, THE System SHALL validate that required fields exist before updating state
3. WHEN THE WebSocketContext updates tracking data state, THE System SHALL throttle updates to prevent excessive re-renders (maximum 30 updates per second)
4. WHEN THE CameraOverlay receives tracking data, THE System SHALL safely access all fields with fallback values to prevent undefined errors
5. WHEN THE CameraOverlay renders, THE System SHALL not cause performance degradation or application freezing

### Requirement 4: Visual Feedback Accuracy

**User Story:** As a student, I want to see accurate visual indicators including face detection boxes, attention scores, and alert overlays so that I understand my current engagement level.

#### Acceptance Criteria

1. WHEN THE CameraOverlay receives valid tracking data with face_count > 0, THE System SHALL draw a face detection bounding box on the video feed
2. WHEN THE CameraOverlay receives attention_score, THE System SHALL display the score as a percentage with color coding (green ≥70%, yellow 50-69%, red <50%)
3. WHEN THE CameraOverlay receives is_drowsy as true, THE System SHALL display a prominent drowsiness alert overlay
4. WHEN THE CameraOverlay receives is_using_phone as true, THE System SHALL display a prominent phone usage alert overlay
5. WHEN THE CameraOverlay receives face_count > 1, THE System SHALL display a multiple people warning overlay
6. WHEN THE CameraOverlay renders the video feed, THE System SHALL display it in color (not grayscale)

### Requirement 5: Error Handling and Fallbacks

**User Story:** As a developer, I want the system to gracefully handle missing or invalid data so that the application remains stable even when tracking data is incomplete.

#### Acceptance Criteria

1. WHEN THE WebSocket Service encounters an error processing tracking data, THE System SHALL emit a valid tracking_data event with fallback values rather than omitting the event
2. WHEN THE WebSocketContext receives malformed tracking data, THE System SHALL log a warning and use previous valid data or default values
3. WHEN THE CameraOverlay receives tracking data with missing fields, THE System SHALL use sensible default values for rendering
4. WHEN THE Eye Tracker fails to process a frame, THE System SHALL return mock data with all required fields populated
5. WHEN THE WebSocket connection is lost, THE System SHALL display a clear disconnected status and stop attempting to render tracking data

