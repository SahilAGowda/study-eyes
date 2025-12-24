# Implementation Plan: Fix Real-Time Eye Tracking Data Flow

- [x] 1. Fix Backend WebSocket Data Structure


  - Modify `_tracking_loop()` in `backend/services/websocket_service.py` to emit flat data structure instead of nested
  - Change from `{'data': eye_data, 'session_id': ...}` to `{**eye_data, 'session_id': ...}`
  - Ensure timestamp is at root level
  - _Requirements: 1.1, 1.2_

- [x] 2. Add Data Validation and Defaults




  - [x] 2.1 Create `_ensure_complete_tracking_data()` helper function

    - Accept tracking data dictionary as input
    - Define defaults for all 25+ tracking fields
    - Merge incoming data with defaults
    - Validate and sanitize numeric ranges (attention_score 0-1, posture_score 0-1, etc.)
    - Return complete, validated tracking data
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 2.2 Create `_clamp()` utility function

    - Accept value, min, and max parameters
    - Return clamped value within range
    - Handle TypeError/ValueError with fallback to midpoint
    - _Requirements: 1.3, 5.1_
  
  - [x] 2.3 Integrate validation into tracking loop


    - Call `_ensure_complete_tracking_data()` before emitting

    - Apply to both real camera data and mock data paths
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 3. Add Face Bounding Box to Eye Tracker

  - [x] 3.1 Modify `process_frame()` in `backend/services/eye_tracking.py`


    - Extract face bounding box coordinates from face detection
    - Add `face_bbox` field with {x, y, width, height} structure
    - Add `face_count` field with number of detected faces
    - Set `face_bbox` to None when no face detected
    - _Requirements: 2.6, 4.1_
  
  - [x] 3.2 Update mock data generator


    - Add `face_bbox` field to `_generate_mock_eye_data()`
    - Generate realistic bounding box coordinates (e.g., centered, 200x250 pixels)
    - Set `face_count` to 1 for mock data
    - _Requirements: 2.6, 4.1_

- [x] 4. Implement Frontend Throttling


  - [x] 4.1 Add throttling mechanism to WebSocketContext


    - Create `lastUpdateTime` ref to track last update timestamp
    - Define `THROTTLE_MS` constant as 33ms (~30 FPS)
    - In `tracking_data` event handler, check time since last update
    - Skip update if less than THROTTLE_MS has elapsed
    - Update `lastUpdateTime` when processing update
    - _Requirements: 3.3, 3.5_
  
  - [x] 4.2 Add data validation in WebSocketContext

    - Check if data is object and not null
    - Validate required fields exist (attention_score, focus_level, timestamp)
    - Log warning for invalid data
    - Skip update if validation fails
    - _Requirements: 3.2, 5.2_




- [ ] 5. Update CameraOverlay with Safe Data Access
  - [ ] 5.1 Add safe data access patterns
    - Use optional chaining (`data?.field`) for all data access
    - Provide fallback values with nullish coalescing (`?? defaultValue`)
    - Define default values for all metrics at top of component

    - _Requirements: 3.4, 5.3_

  
  - [ ] 5.2 Implement face bounding box rendering
    - Check if `face_bbox` exists and `face_count > 0`
    - Draw green rectangle using `ctx.strokeRect()`

    - Set line width to 3px for visibility
    - Add "Face Detected" label above box
    - _Requirements: 4.1_
  
  - [ ] 5.3 Fix attention score display
    - Extract `attention_score` with fallback to 0.5

    - Convert to percentage (multiply by 100)
    - Apply color coding: green ≥70%, yellow 50-69%, red <50%
    - Display with large font and shadow for visibility
    - _Requirements: 4.2_
  
  - [x] 5.4 Add drowsiness alert overlay

    - Check `is_drowsy` boolean with fallback to false
    - When true, draw prominent red alert with "😴 DROWSY DETECTED!"
    - Use large font (20px) and red shadow effect
    - Position at top-left of video
    - _Requirements: 4.3_
  

  - [ ] 5.5 Add phone usage alert overlay
    - Check `is_using_phone` boolean with fallback to false
    - When true, draw prominent red alert with "📱 PHONE DETECTED!"
    - Use large font (20px) and red shadow effect
    - Position below drowsiness alert if both present


    - _Requirements: 4.4_
  
  - [x] 5.6 Add multiple faces warning





    - Check `face_count` with fallback to 0




    - When count > 1, draw orange warning with "⚠️ MULTIPLE PEOPLE"
    - Use medium font (16px) and orange shadow
    - Position below face detection status
    - _Requirements: 4.5_


- [ ] 6. Ensure Video Displays in Color
  - Verify video element in StudySession component has no grayscale filter
  - Set `filter: 'none'` in video style prop
  - Check that camera capture doesn't convert to grayscale
  - _Requirements: 4.6_


- [ ] 7. Add Comprehensive Error Handling
  - [ ] 7.1 Backend error handling
    - Wrap frame processing in try-catch
    - On error, use `_generate_mock_eye_data()` as fallback
    - Wrap socketio.emit in try-catch
    - Log all errors with context
    - _Requirements: 5.1, 5.4_
  
  - [ ] 7.2 Frontend error handling
    - Wrap tracking_data handler in try-catch
    - Log errors without crashing application
    - Display disconnected status when WebSocket fails
    - Stop rendering tracking data when connection lost
    - _Requirements: 5.2, 5.3, 5.5_

- [ ] 8. Add Unit Tests
  - [ ] 8.1 Test `_ensure_complete_tracking_data()`
    - Test with empty object returns all defaults
    - Test with partial data merges correctly
    - Test with invalid values sanitizes to valid ranges

    - Test with all valid data preserves values
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ] 8.2 Test `_clamp()` function
    - Test value in range returns value
    - Test value below min returns min
    - Test value above max returns max
    - Test invalid type returns midpoint
    - _Requirements: 1.3_
  
  - [ ] 8.3 Test frontend validation
    - Test `isValidTrackingData()` with valid data returns true
    - Test with missing fields returns false
    - Test with wrong types returns false
    - Test with null/undefined returns false
    - _Requirements: 3.2_

- [x] 9. Integration Testing

  - [ ] 9.1 Test WebSocket data flow
    - Start tracking session
    - Verify tracking_data events emitted
    - Verify flat data structure (not nested)
    - Verify all required fields present
    - Verify values in valid ranges
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 9.2 Test frontend rendering
    - Receive tracking data
    - Verify CameraOverlay renders without errors
    - Verify face box appears when face_count > 0
    - Verify attention score displays correctly
    - Verify alerts appear for drowsiness/phone
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 9.3 Test performance
    - Send 100 tracking_data events rapidly
    - Verify frontend doesn't freeze
    - Verify throttling limits to ~30 FPS
    - Verify no memory leaks
    - _Requirements: 3.3, 3.5_

