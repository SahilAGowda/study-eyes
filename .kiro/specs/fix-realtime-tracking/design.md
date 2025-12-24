# Design Document: Fix Real-Time Eye Tracking Data Flow

## Overview

This design addresses the critical data flow issues in the real-time eye tracking system. The primary problem is a data contract mismatch where the backend emits tracking data in a nested structure while the frontend expects a flat structure, resulting in all values being undefined. Additionally, there's no throttling mechanism causing performance issues, and error handling is insufficient.

## Architecture

### Current (Broken) Flow
```
Backend WebSocket Service
  ↓ emits: { data: { attention_score: 0.8, ... }, session_id, timestamp }
Frontend WebSocketContext  
  ↓ expects: { attention_score: 0.8, ..., session_id, timestamp }
CameraOverlay
  ↓ receives: { attention_score: undefined, ... } ❌
```

### Fixed Flow
```
Backend WebSocket Service
  ↓ emits: { attention_score: 0.8, ..., session_id, timestamp }
Frontend WebSocketContext (with throttling)
  ↓ validates and throttles
CameraOverlay
  ↓ receives: { attention_score: 0.8, ... } ✅
```

## Components and Interfaces

### 1. Backend WebSocket Service (`backend/services/websocket_service.py`)

#### Changes Required

**Current emission format:**
```python
socketio.emit('tracking_data', {
    'user_id': user_id,
    'session_id': session_id,
    'data': eye_data,  # ❌ Nested structure
    'timestamp': datetime.utcnow().isoformat()
})
```

**Fixed emission format:**
```python
# Flatten the data structure
tracking_payload = {
    'session_id': session_id,
    'timestamp': datetime.utcnow().isoformat(),
    **eye_data  # Spread operator to flatten
}

# Ensure all required fields exist with defaults
tracking_payload = _ensure_complete_tracking_data(tracking_payload)

socketio.emit('tracking_data', tracking_payload)
```

#### New Helper Function: `_ensure_complete_tracking_data()`

```python
def _ensure_complete_tracking_data(data):
    """Ensure all required tracking fields exist with valid defaults"""
    defaults = {
        # Core metrics
        'attention_score': 0.5,
        'focus_level': 'medium',
        'confidence_score': 0.7,
        
        # Eye tracking
        'left_eye_ratio': 0.8,
        'right_eye_ratio': 0.8,
        'blink_detected': False,
        'blink_rate': 15.0,
        'pupil_dilation': 0.5,
        
        # Gaze
        'gaze_direction_x': 0.5,
        'gaze_direction_y': 0.5,
        'gaze_stability': 0.8,
        'fixation_duration': 2.0,
        
        # Head pose
        'head_pitch': 0.0,
        'head_yaw': 0.0,
        'head_roll': 0.0,
        
        # Distractions
        'distraction_type': None,
        'is_drowsy': False,
        'is_using_phone': False,
        'face_count': 1,
        
        # Additional metrics
        'posture_score': 0.8,
        'fatigue_level': 'none',
        'eye_strain_level': 'none',
        'movement_frequency': 10.0,
        'distance_from_screen': 65.0,
        
        # Face landmarks (for drawing boxes)
        'face_landmarks': None,
        'face_bbox': None  # {x, y, width, height}
    }
    
    # Merge with defaults, keeping existing values
    complete_data = {**defaults, **data}
    
    # Validate and sanitize values
    complete_data['attention_score'] = _clamp(complete_data['attention_score'], 0.0, 1.0)
    complete_data['posture_score'] = _clamp(complete_data['posture_score'], 0.0, 1.0)
    complete_data['face_count'] = max(0, int(complete_data['face_count']))
    
    return complete_data

def _clamp(value, min_val, max_val):
    """Clamp value between min and max"""
    try:
        return max(min_val, min(max_val, float(value)))
    except (TypeError, ValueError):
        return (min_val + max_val) / 2  # Return midpoint as fallback
```

### 2. Eye Tracker Service (`backend/services/eye_tracking.py`)

#### Changes Required

The eye tracker must return face bounding box coordinates for drawing detection boxes:

```python
def process_frame(self, frame):
    """Process frame and return complete tracking data"""
    # ... existing processing ...
    
    # Add face bounding box if face detected
    if faces_detected:
        # Get bounding box from face detection
        x, y, w, h = face_bbox
        eye_data['face_bbox'] = {
            'x': int(x),
            'y': int(y),
            'width': int(w),
            'height': int(h)
        }
        eye_data['face_count'] = len(faces_detected)
    else:
        eye_data['face_bbox'] = None
        eye_data['face_count'] = 0
    
    return eye_data
```

### 3. Frontend WebSocketContext (`frontend/src/contexts/WebSocketContext.tsx`)

#### Changes Required

**Add throttling mechanism:**

```typescript
import { useRef, useCallback } from 'react';

// Inside WebSocketContext component
const lastUpdateTime = useRef(0);
const THROTTLE_MS = 33; // ~30 FPS max

socket.on('tracking_data', (data) => {
  const now = Date.now();
  
  // Throttle updates to prevent excessive re-renders
  if (now - lastUpdateTime.current < THROTTLE_MS) {
    return;
  }
  
  lastUpdateTime.current = now;
  
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.warn('Invalid tracking data received:', data);
    return;
  }
  
  // Validate required fields
  const requiredFields = ['attention_score', 'focus_level', 'timestamp'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    console.warn('Missing required fields:', missingFields);
    // Use previous data or defaults
    return;
  }
  
  console.log('📊 Eye tracking data received:', {
    attention_score: data.attention_score,
    focus_level: data.focus_level,
    face_count: data.face_count,
    is_drowsy: data.is_drowsy
  });
  
  setTrackingData(data);
});
```

### 4. CameraOverlay Component (`frontend/src/components/student/CameraOverlay.jsx`)

#### Changes Required

**Safe data access with fallbacks:**

```javascript
const drawTrackingData = (ctx, data) => {
  // Safe access with fallbacks
  const attentionScore = data?.attention_score ?? 0.5;
  const focusLevel = data?.focus_level ?? 'medium';
  const faceCount = data?.face_count ?? 0;
  const isDrowsy = data?.is_drowsy ?? false;
  const isUsingPhone = data?.is_using_phone ?? false;
  const faceBbox = data?.face_bbox;
  
  // Draw face detection box if available
  if (faceBbox && faceCount > 0) {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      faceBbox.x,
      faceBbox.y,
      faceBbox.width,
      faceBbox.height
    );
    
    // Draw label
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Face Detected', faceBbox.x, faceBbox.y - 5);
  }
  
  // ... rest of drawing logic with safe access ...
};
```

**Ensure video displays in color:**

```javascript
// In StudySession component, ensure video element doesn't have grayscale filter
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'none' // Ensure no grayscale filter
  }}
/>
```

## Data Models

### Tracking Data Payload (Standardized)

```typescript
interface TrackingData {
  // Session info
  session_id: string;
  timestamp: string; // ISO 8601 format
  
  // Core metrics
  attention_score: number; // 0.0 to 1.0
  focus_level: 'high' | 'medium' | 'low' | 'disengaged';
  confidence_score: number; // 0.0 to 1.0
  
  // Eye tracking
  left_eye_ratio: number; // 0.0 to 1.0
  right_eye_ratio: number; // 0.0 to 1.0
  blink_detected: boolean;
  blink_rate: number; // blinks per minute
  pupil_dilation: number; // 0.0 to 1.0
  
  // Gaze
  gaze_direction_x: number; // 0.0 to 1.0 (screen coordinates)
  gaze_direction_y: number; // 0.0 to 1.0 (screen coordinates)
  gaze_stability: number; // 0.0 to 1.0
  fixation_duration: number; // seconds
  
  // Head pose
  head_pitch: number; // degrees
  head_yaw: number; // degrees
  head_roll: number; // degrees
  
  // Distractions
  distraction_type: string | null; // 'phone' | 'away' | 'fatigue' | null
  is_drowsy: boolean;
  is_using_phone: boolean;
  face_count: number;
  
  // Additional metrics
  posture_score: number; // 0.0 to 1.0
  fatigue_level: 'none' | 'low' | 'medium' | 'high';
  eye_strain_level: 'none' | 'low' | 'medium' | 'high';
  movement_frequency: number; // movements per minute
  distance_from_screen: number; // centimeters
  
  // Face detection
  face_bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  face_landmarks: any | null; // Optional detailed landmarks
}
```

## Error Handling

### Backend Error Handling

```python
def _tracking_loop(socketio, user_id, session_id):
    """Main tracking loop with comprehensive error handling"""
    try:
        while tracking_active:
            try:
                # Process frame
                eye_data = eye_tracker.process_frame(frame)
                
                if not eye_data:
                    # Use fallback data
                    eye_data = _generate_mock_eye_data(frame_count)
                
                # Ensure complete data
                tracking_payload = {
                    'session_id': session_id,
                    'timestamp': datetime.utcnow().isoformat(),
                    **eye_data
                }
                
                tracking_payload = _ensure_complete_tracking_data(tracking_payload)
                
                # Emit with error handling
                try:
                    socketio.emit('tracking_data', tracking_payload)
                except Exception as emit_error:
                    logger.error(f"Failed to emit tracking data: {emit_error}")
                    
            except Exception as frame_error:
                logger.error(f"Error processing frame: {frame_error}")
                # Continue loop with fallback data
                continue
                
    except Exception as loop_error:
        logger.error(f"Fatal error in tracking loop: {loop_error}")
        socketio.emit('error', {'message': 'Tracking stopped due to error'})
```

### Frontend Error Handling

```typescript
socket.on('tracking_data', (data) => {
  try {
    // Validate data
    if (!isValidTrackingData(data)) {
      console.warn('Invalid tracking data, using fallback');
      return;
    }
    
    // Throttle
    if (!shouldUpdate()) {
      return;
    }
    
    // Update state
    setTrackingData(data);
    
  } catch (error) {
    console.error('Error processing tracking data:', error);
    // Don't crash, just skip this update
  }
});

function isValidTrackingData(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.attention_score === 'number' &&
    typeof data.focus_level === 'string' &&
    typeof data.timestamp === 'string'
  );
}
```

## Testing Strategy

### Unit Tests

1. **Backend: `_ensure_complete_tracking_data()`**
   - Test with empty object → returns all defaults
   - Test with partial data → merges with defaults
   - Test with invalid values → sanitizes to valid ranges
   - Test with all valid data → preserves all values

2. **Backend: `_clamp()`**
   - Test with value in range → returns value
   - Test with value below min → returns min
   - Test with value above max → returns max
   - Test with invalid type → returns midpoint

3. **Frontend: `isValidTrackingData()`**
   - Test with valid data → returns true
   - Test with missing required fields → returns false
   - Test with wrong types → returns false
   - Test with null/undefined → returns false

### Integration Tests

1. **WebSocket Data Flow**
   - Start tracking session
   - Verify tracking_data events are emitted
   - Verify data structure is flat (not nested)
   - Verify all required fields are present
   - Verify values are within valid ranges

2. **Frontend Rendering**
   - Receive tracking data
   - Verify CameraOverlay renders without errors
   - Verify face detection box appears when face_count > 0
   - Verify attention score displays correctly
   - Verify alerts appear for drowsiness/phone usage

3. **Performance**
   - Send 100 tracking_data events rapidly
   - Verify frontend doesn't freeze
   - Verify throttling limits updates to ~30 FPS
   - Verify memory doesn't leak

### Manual Testing

1. **Visual Verification**
   - Start study session
   - Verify video displays in color (not grayscale)
   - Verify face detection box appears around face
   - Verify attention score updates dynamically
   - Verify alerts appear when simulated

2. **Error Scenarios**
   - Disconnect WebSocket → verify graceful handling
   - Send malformed data → verify no crash
   - Camera fails → verify fallback to mock data

## Performance Considerations

1. **Throttling**: Limit frontend updates to 30 FPS (33ms) to prevent excessive re-renders
2. **Data Validation**: Validate once in WebSocketContext, not in every component
3. **Canvas Rendering**: Use requestAnimationFrame for smooth overlay updates
4. **Memory Management**: Don't store history of tracking data in state, only latest value

## Migration Plan

1. **Phase 1**: Fix backend data structure (flatten emission)
2. **Phase 2**: Add data validation and defaults
3. **Phase 3**: Implement frontend throttling
4. **Phase 4**: Update CameraOverlay with safe access patterns
5. **Phase 5**: Add face bounding box rendering
6. **Phase 6**: Test and verify all features working

