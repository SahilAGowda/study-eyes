# Implementation Plan

- [ ] 1. Fix Video Grayscale Issue
  - Remove all grayscale conversions from video pipeline
  - Ensure camera feed displays in full color
  - Verify CSS filters are not applied
  - Test video display in browser
  - _Requirements: 1_

- [ ] 1.1 Fix Frontend Camera Service
  - Remove grayscale filters from video element styling
  - Ensure proper color space in camera constraints
  - Verify frame capture preserves color (JPEG format)
  - Test camera initialization with color verification
  - _Requirements: 1_

- [ ] 1.2 Fix Backend Frame Processing
  - Ensure frames are decoded in BGR/RGB format (not grayscale)
  - Only convert to grayscale for specific algorithms that require it
  - Keep original color frame for all processing
  - Verify frame reception maintains color data
  - _Requirements: 1, 9_

- [ ] 2. Implement Face Detection Visualization
  - Add face bounding box drawing on frontend overlay
  - Add "Student 1", "Student 2" labels for detected faces
  - Use green color for primary student, yellow for additional faces
  - Update bounding box position in real-time
  - _Requirements: 2_

- [ ] 2.1 Extract Face Bounding Box Data in Backend
  - Use dlib face detector to get face rectangles
  - Extract bounding box coordinates (x, y, width, height)
  - Include face count in tracking data
  - Add confidence score for each detected face
  - Send face data via WebSocket to frontend
  - _Requirements: 2, 9, 10_

- [ ] 2.2 Draw Face Bounding Boxes in CameraOverlay
  - Receive face bounding box data from WebSocket
  - Draw rectangles around detected faces on canvas overlay
  - Add labels "Student 1", "Student 2" above each box
  - Use color coding (green for primary, yellow for others)
  - Update visualization at 5+ FPS
  - _Requirements: 2, 10_

- [ ] 3. Implement Facial Landmarks Visualization
  - Extract 68-point facial landmarks using dlib
  - Send landmark coordinates to frontend
  - Draw landmark points and connections on overlay
  - Visualize eyes, mouth, and face outline
  - _Requirements: 3_

- [ ] 3.1 Extract Facial Landmarks in Backend
  - Load dlib shape predictor model (68 landmarks)
  - Extract landmark coordinates for each detected face
  - Normalize coordinates to 0-1 range
  - Include landmarks in WebSocket tracking data
  - _Requirements: 3, 9, 10_

- [ ] 3.2 Draw Facial Landmarks in CameraOverlay
  - Receive landmark data from WebSocket
  - Draw landmark points as small circles
  - Draw connections for eyes (left and right)
  - Draw connections for mouth outline
  - Draw connections for face outline
  - Use semi-transparent cyan color for landmarks
  - _Requirements: 3, 10_

- [ ] 4. Fix Focus Score Calculation Logic
  - Implement accurate focus score algorithm
  - Return 0 when no face detected
  - Decrease score when looking away
  - Decrease score when head is tilted
  - Use weighted scoring (gaze 40%, head pose 30%, eyes 20%, presence 10%)
  - _Requirements: 4_

- [ ] 4.1 Implement Gaze-Based Scoring
  - Calculate gaze direction from eye landmarks
  - Compute angle from screen center
  - Score: 100 for center, decreasing with angle
  - Looking away (angle > 0.6) should give score < 20
  - _Requirements: 4_

- [ ] 4.2 Implement Head Pose Scoring
  - Use existing head pose angles (pitch, yaw, roll)
  - Apply penalties: pitch >20° (-25pts), yaw >30° (-35pts), roll >15° (-15pts)
  - Tilting head should visibly reduce focus score
  - Return score 0-100 based on head orientation
  - _Requirements: 4, 5_

- [ ] 4.3 Implement Eye Openness Scoring
  - Calculate eye aspect ratio (EAR) for both eyes
  - Score based on average openness
  - Wide open (>0.7) = 100, Normal (>0.5) = 80, Drowsy (<0.3) = 20
  - Eyes closed should give score near 0
  - _Requirements: 4_

- [ ] 4.4 Integrate All Scoring Components
  - Combine gaze, head pose, eye openness, and face presence scores
  - Apply weighted formula: gaze*0.4 + head*0.3 + eyes*0.2 + face*0.1
  - Ensure no face detected returns 0
  - Clamp final score to 0-100 range
  - Test with various scenarios (looking away, tilting, eyes closed)
  - _Requirements: 4_

- [ ] 5. Implement Head Pose Detection
  - Calculate pitch, yaw, and roll angles from facial landmarks
  - Use solvePnP algorithm with 3D face model
  - Achieve accuracy within 10 degrees
  - Display angles in UI overlay
  - _Requirements: 5_

- [ ] 5.1 Implement Head Pose Estimation Algorithm
  - Define 3D face model points (nose, chin, eyes, mouth corners)
  - Extract corresponding 2D points from facial landmarks
  - Use cv2.solvePnP to estimate rotation vector
  - Convert rotation vector to Euler angles (pitch, yaw, roll)
  - Return angles in degrees
  - _Requirements: 5, 9_

- [ ] 5.2 Apply Head Pose Penalties to Focus Score
  - Check if pitch exceeds thresholds (20°, 30°)
  - Check if yaw exceeds thresholds (30°, 40°)
  - Check if roll exceeds thresholds (15°, 25°)
  - Apply corresponding penalties to focus score
  - Test that tilting head reduces score appropriately
  - _Requirements: 5, 4_

- [ ] 5.3 Display Head Pose in UI
  - Show pitch, yaw, roll angles in overlay
  - Add visual indicator for head position status
  - Use color coding (green=good, yellow=acceptable, red=poor)
  - Update display in real-time
  - _Requirements: 5, 8_

- [ ] 6. Fix Emotion Detection
  - Implement accurate emotion classification
  - Use pre-trained FER model or train custom model
  - Achieve minimum 70% accuracy
  - Classify into: focused, confused, bored, frustrated, happy, neutral, drowsy
  - _Requirements: 6_

- [ ] 6.1 Integrate FER Library for Emotion Detection
  - Install and configure FER (Facial Emotion Recognition) library
  - Extract face region from frame
  - Run emotion detection on face
  - Get emotion classification and confidence scores
  - Map emotions to attention-relevant categories
  - _Requirements: 6, 9_

- [ ] 6.2 Implement Drowsiness Detection
  - Calculate Eye Aspect Ratio (EAR) for drowsiness
  - Set thresholds: Alert (>0.25), Drowsy (0.15-0.25), Closed (<0.15)
  - Detect prolonged eye closure (>3 seconds)
  - Trigger drowsiness alert when detected
  - Apply 50% penalty to focus score when drowsy
  - _Requirements: 6, 4_

- [ ] 6.3 Implement Confusion Detection
  - Detect furrowed eyebrows from facial action units
  - Detect erratic gaze patterns
  - Detect prolonged fixation on same area (>1 second)
  - Trigger confusion alert when detected
  - _Requirements: 6_

- [ ] 6.4 Display Emotion in UI
  - Show current emotion with emoji representation
  - Display emotion confidence percentage
  - Add emotion history graph (optional)
  - Use color coding for emotion states
  - _Requirements: 6, 8_

- [ ] 7. Fix Phone Detection Logic
  - Implement accurate phone detection using YOLO
  - Reduce false positives to <10%
  - Detect phones in various orientations
  - Require 3 consecutive frames for confirmation
  - _Requirements: 7_

- [ ] 7.1 Integrate YOLOv8 for Object Detection
  - Install ultralytics library
  - Load YOLOv8 nano model (yolov8n.pt)
  - Configure to detect 'cell phone' and 'mobile phone' classes
  - Set confidence threshold to 0.6
  - Run detection on each frame
  - _Requirements: 7, 9_

- [ ] 7.2 Implement Consecutive Frame Validation
  - Maintain detection history buffer (last 10 frames)
  - Require 3 consecutive positive detections
  - Only set is_using_phone=true after consecutive confirmations
  - Reset on negative detection
  - This reduces false positives significantly
  - _Requirements: 7_

- [ ] 7.3 Apply Phone Usage Penalty
  - When phone detected, reduce focus score by 50 points
  - Trigger phone usage alert
  - Display phone detection indicator in UI
  - Track phone usage duration
  - _Requirements: 7, 4_

- [ ] 7.4 Display Phone Detection in UI
  - Show "📱 PHONE DETECTED" alert when phone is detected
  - Display phone detection confidence
  - Add to distraction metrics card
  - Use red color for high severity
  - _Requirements: 7, 8_

- [ ] 8. Enhance UI Design
  - Redesign camera preview section with modern styling
  - Improve metric cards with better visuals
  - Add smooth animations for metric updates
  - Use color-coded indicators throughout
  - _Requirements: 8_

- [ ] 8.1 Redesign Camera Preview Section
  - Add modern rounded corners and shadows to video container
  - Improve LIVE indicator with pulsing animation
  - Enhance focus score display with gradient background
  - Add connection status indicator with animated dot
  - Improve camera offline overlay design
  - _Requirements: 8_

- [ ] 8.2 Create Enhanced Metric Cards
  - Design MetricCard component with icon, value, and subtitle
  - Add gradient backgrounds based on metric values
  - Implement smooth transitions for value changes
  - Use color coding: green (good), yellow (medium), red (poor)
  - Add hover effects and shadows
  - _Requirements: 8_

- [ ] 8.3 Improve Alerts Display
  - Redesign alert cards with better styling
  - Add alert icons based on severity
  - Implement fade-in animations for new alerts
  - Group alerts by type
  - Add timestamp to each alert
  - _Requirements: 8_

- [ ] 8.4 Add Real-time Metric Animations
  - Implement smooth number transitions for scores
  - Add progress bar animations
  - Use CSS transitions for color changes
  - Add subtle pulse effects for critical alerts
  - _Requirements: 8_

- [ ] 9. Update WebSocket Data Structure
  - Modify tracking data to include all new fields
  - Add face bounding boxes and landmarks
  - Add head pose angles
  - Add emotion data
  - Add phone detection data
  - _Requirements: 10_

- [ ] 9.1 Update Backend WebSocket Emission
  - Modify websocket_service.py to include new data fields
  - Add face_count, faces array with bbox and landmarks
  - Add head_pitch, head_yaw, head_roll
  - Add primary_emotion, emotion_confidence, all_emotions
  - Add is_using_phone, phone_detection_confidence
  - Ensure all data is properly serialized
  - _Requirements: 10, 9_

- [ ] 9.2 Update Frontend WebSocket Reception
  - Update WebSocketContext to handle new data fields
  - Add type definitions for new fields
  - Validate incoming data structure
  - Handle missing or null fields gracefully
  - _Requirements: 10_

- [ ] 10. Integration and Testing
  - Test complete pipeline end-to-end
  - Verify all visualizations work correctly
  - Test focus score accuracy with various scenarios
  - Verify phone detection accuracy
  - Test emotion detection accuracy
  - _Requirements: All_

- [ ] 10.1 Test Video Color Display
  - Verify camera feed shows in full color (not grayscale)
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Verify color preservation through entire pipeline
  - _Requirements: 1_

- [ ] 10.2 Test Face Detection and Visualization
  - Verify bounding boxes appear around faces
  - Verify "Student 1" labels appear
  - Test with multiple faces in frame
  - Verify facial landmarks are drawn correctly
  - _Requirements: 2, 3_

- [ ] 10.3 Test Focus Score Accuracy
  - Test with no face: should return 0
  - Test looking away: should drop below 50
  - Test tilting head left/right: should decrease by 20+ points
  - Test tilting head up/down: should decrease by 20+ points
  - Test normal position: should be 80+
  - _Requirements: 4, 5_

- [ ] 10.4 Test Emotion Detection
  - Test with neutral expression
  - Test with drowsy expression (eyes partially closed)
  - Test with confused expression (furrowed brow)
  - Verify emotion labels update correctly
  - _Requirements: 6_

- [ ] 10.5 Test Phone Detection
  - Test with phone in hand near face: should detect
  - Test with phone away from face: should not detect
  - Test with no phone: should not detect (no false positives)
  - Test with other objects: should not falsely detect as phone
  - Verify 3-frame consecutive requirement works
  - _Requirements: 7_

- [ ] 10.6 Test UI Responsiveness
  - Verify all metrics update in real-time
  - Test animations and transitions
  - Verify color coding works correctly
  - Test on different screen sizes
  - _Requirements: 8_

- [ ] 11. Performance Optimization
  - Optimize frame processing speed
  - Reduce WebSocket message size
  - Implement frame skipping if needed
  - Monitor CPU and memory usage
  - _Requirements: 9_

- [ ] 11.1 Optimize Backend Processing
  - Profile frame processing time
  - Implement frame skipping (process every 2nd frame if needed)
  - Use GPU acceleration for model inference if available
  - Cache repeated calculations
  - _Requirements: 9_

- [ ] 11.2 Optimize Frontend Rendering
  - Use requestAnimationFrame for canvas updates
  - Throttle WebSocket data processing
  - Minimize re-renders with React.memo
  - Optimize canvas drawing operations
  - _Requirements: 8, 10_

- [ ] 12. Documentation and Deployment
  - Document all changes made
  - Update API documentation
  - Create deployment guide
  - Document model file requirements
  - _Requirements: All_

- [ ] 12.1 Create Technical Documentation
  - Document new focus score algorithm
  - Document head pose estimation method
  - Document emotion detection approach
  - Document phone detection logic
  - Include accuracy metrics and thresholds
  - _Requirements: All_

- [ ] 12.2 Create Deployment Guide
  - List all required model files and download links
  - Document installation steps for new dependencies
  - Provide configuration instructions
  - Include troubleshooting section
  - _Requirements: All_
