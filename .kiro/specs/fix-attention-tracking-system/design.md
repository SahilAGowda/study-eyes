# Design Document

## Overview

This design document outlines the comprehensive solution to fix critical issues in the attention tracking system. The system currently has failures in video processing, face detection visualization, attention scoring logic, emotion detection, phone usage detection, and UI presentation. This design addresses all these issues systematically.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ StudySession │  │CameraOverlay │  │ WebSocket    │     │
│  │  Component   │──│  Component   │──│  Context     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │ WebSocket
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────┐
│         │                  │                  │             │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌─────▼──────┐     │
│  │   Camera    │    │   Video     │    │ WebSocket  │     │
│  │   Service   │    │  Processing │    │  Service   │     │
│  └─────────────┘    └─────────────┘    └────────────┘     │
│                            │                                │
│                     ┌──────▼──────┐                        │
│                     │  Attention  │                        │
│                     │  Detection  │                        │
│                     │   Service   │                        │
│                     └─────────────┘                        │
│                     Backend (Python/Flask)                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Video Processing Pipeline

#### 1.1 Camera Service (Frontend)
**File:** `frontend/src/services/cameraService.ts`

**Current Issue:** Video is being converted to grayscale somewhere in the pipeline

**Fix:**
- Remove any grayscale conversion filters
- Ensure video element maintains original color profile
- Verify CSS filters are not applied

**Interface:**
```typescript
interface CameraService {
  initializeCamera(videoElement: HTMLVideoElement): Promise<void>
  stopCamera(): void
  captureFrame(): ImageData | null
  getVideoStream(): MediaStream | null
}
```

**Implementation Changes:**
```typescript
// Remove any grayscale filters
videoElement.style.filter = 'none'
videoElement.style.webkitFilter = 'none'

// Ensure proper color space
const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user',
    // No color conversion
  }
}
```

#### 1.2 Frame Capture and Transmission
**Current Issue:** Frames may be converted to grayscale before sending to backend

**Fix:**
- Capture frames in RGB format
- Send frames as JPEG or PNG (not grayscale)
- Verify base64 encoding preserves color

**Implementation:**
```typescript
captureFrame(): string {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0)
  // Ensure color format (RGB/RGBA)
  return canvas.toDataURL('image/jpeg', 0.8) // JPEG preserves color
}
```

### 2. Backend Video Processing

#### 2.1 Frame Reception and Decoding
**File:** `backend/services/websocket_service.py`

**Current Issue:** Backend may be converting frames to grayscale for processing

**Fix:**
- Process frames in BGR/RGB format (OpenCV default)
- Only convert to grayscale for specific algorithms that require it
- Keep original color frame for visualization data

**Implementation:**
```python
def process_frame(self, frame_data: str):
    # Decode frame
    img_bytes = base64.b64decode(frame_data.split(',')[1])
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # Keep color
    
    # Process in color
    results = self.detect_face_and_landmarks(frame)
    
    # Only convert to grayscale for specific algorithms
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)  # For face detection only
    
    return results
```

#### 2.2 Face Detection with Visualization Data
**File:** `backend/services/attention_detection_service.py`

**Current Issue:** Face bounding boxes and landmarks are not being sent to frontend

**Fix:**
- Extract face bounding box coordinates
- Extract facial landmark coordinates (68 points)
- Include in WebSocket response

**Data Structure:**
```python
{
    'face_count': int,
    'faces': [
        {
            'bbox': {'x': int, 'y': int, 'width': int, 'height': int},
            'landmarks': [
                {'x': float, 'y': float},  # 68 points
                ...
            ],
            'confidence': float
        }
    ]
}
```

**Implementation:**
```python
import dlib
import cv2

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

def detect_face_and_landmarks(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    
    results = {
        'face_count': len(faces),
        'faces': []
    }
    
    for face in faces:
        # Bounding box
        bbox = {
            'x': face.left(),
            'y': face.top(),
            'width': face.width(),
            'height': face.height()
        }
        
        # Landmarks
        shape = predictor(gray, face)
        landmarks = [
            {'x': shape.part(i).x / frame.shape[1],  # Normalize
             'y': shape.part(i).y / frame.shape[0]}
            for i in range(68)
        ]
        
        results['faces'].append({
            'bbox': bbox,
            'landmarks': landmarks,
            'confidence': 1.0
        })
    
    return results
```

### 3. Focus Score Calculation Logic

#### 3.1 Current Issues
1. Focus score stays at 90+ even when no face detected
2. Head tilting doesn't affect score
3. Looking away doesn't reduce score

#### 3.2 Fixed Algorithm

**File:** `backend/services/attention_detection_service.py`

**New Logic:**
```python
def calculate_focus_score(self, tracking_data: Dict) -> float:
    """
    Calculate accurate focus score based on multiple factors
    Returns 0-100 score
    """
    # CRITICAL: No face = 0 score
    if tracking_data.get('face_count', 0) == 0:
        return 0.0
    
    score = 100.0
    
    # 1. Gaze Direction (40% weight)
    gaze_score = self._calculate_gaze_score(tracking_data)
    score = score * 0.6 + gaze_score * 0.4
    
    # 2. Head Pose (30% weight)
    head_pose_score = self._calculate_head_pose_score(tracking_data)
    score = score * 0.7 + head_pose_score * 0.3
    
    # 3. Eye Openness (20% weight)
    eye_score = self._calculate_eye_openness_score(tracking_data)
    score = score * 0.8 + eye_score * 0.2
    
    # 4. Face Presence (10% weight)
    face_score = 100.0 if tracking_data.get('face_count', 0) > 0 else 0.0
    score = score * 0.9 + face_score * 0.1
    
    return max(0, min(100, score))

def _calculate_gaze_score(self, data: Dict) -> float:
    """Calculate score based on gaze direction"""
    gaze_x = data.get('gaze_direction_x', 0)
    gaze_y = data.get('gaze_direction_y', 0)
    
    # Calculate angle from center
    angle = math.sqrt(gaze_x**2 + gaze_y**2)
    
    # Score decreases as gaze moves away from center
    if angle < 0.2:  # Looking at screen
        return 100.0
    elif angle < 0.4:  # Slightly off
        return 70.0
    elif angle < 0.6:  # Looking away
        return 40.0
    else:  # Not looking at screen
        return 10.0

def _calculate_head_pose_score(self, data: Dict) -> float:
    """Calculate score based on head orientation"""
    pitch = abs(data.get('head_pitch', 0))
    yaw = abs(data.get('head_yaw', 0))
    roll = abs(data.get('head_roll', 0))
    
    score = 100.0
    
    # Pitch penalty (up/down)
    if pitch > 30:
        score -= 40
    elif pitch > 20:
        score -= 25
    elif pitch > 15:
        score -= 10
    
    # Yaw penalty (left/right)
    if yaw > 40:
        score -= 50
    elif yaw > 30:
        score -= 35
    elif yaw > 20:
        score -= 15
    
    # Roll penalty (tilt)
    if roll > 25:
        score -= 30
    elif roll > 15:
        score -= 15
    
    return max(0, score)

def _calculate_eye_openness_score(self, data: Dict) -> float:
    """Calculate score based on eye openness"""
    left_eye = data.get('left_eye_ratio', 0.8)
    right_eye = data.get('right_eye_ratio', 0.8)
    avg_openness = (left_eye + right_eye) / 2
    
    if avg_openness > 0.7:  # Wide open
        return 100.0
    elif avg_openness > 0.5:  # Normal
        return 80.0
    elif avg_openness > 0.3:  # Partially closed
        return 50.0
    elif avg_openness > 0.2:  # Drowsy
        return 20.0
    else:  # Eyes closed
        return 0.0
```

### 4. Head Pose Detection

#### 4.1 Implementation
**File:** `backend/services/attention_detection_service.py`

**Method:** Use facial landmarks to estimate head pose

```python
import cv2
import numpy as np

def estimate_head_pose(self, landmarks, frame_shape):
    """
    Estimate head pose angles from facial landmarks
    Returns: (pitch, yaw, roll) in degrees
    """
    # 3D model points (generic face model)
    model_points = np.array([
        (0.0, 0.0, 0.0),             # Nose tip
        (0.0, -330.0, -65.0),        # Chin
        (-225.0, 170.0, -135.0),     # Left eye left corner
        (225.0, 170.0, -135.0),      # Right eye right corner
        (-150.0, -150.0, -125.0),    # Left mouth corner
        (150.0, -150.0, -125.0)      # Right mouth corner
    ])
    
    # 2D image points from landmarks
    image_points = np.array([
        landmarks[30],  # Nose tip
        landmarks[8],   # Chin
        landmarks[36],  # Left eye left corner
        landmarks[45],  # Right eye right corner
        landmarks[48],  # Left mouth corner
        landmarks[54]   # Right mouth corner
    ], dtype="double")
    
    # Camera internals
    focal_length = frame_shape[1]
    center = (frame_shape[1]/2, frame_shape[0]/2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype="double")
    
    dist_coeffs = np.zeros((4,1))
    
    # Solve PnP
    success, rotation_vector, translation_vector = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs,
        flags=cv2.SOLVEPNP_ITERATIVE
    )
    
    # Convert rotation vector to rotation matrix
    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    
    # Extract angles
    pitch = np.degrees(np.arctan2(rotation_matrix[2][1], rotation_matrix[2][2]))
    yaw = np.degrees(np.arctan2(-rotation_matrix[2][0], 
                     np.sqrt(rotation_matrix[2][1]**2 + rotation_matrix[2][2]**2)))
    roll = np.degrees(np.arctan2(rotation_matrix[1][0], rotation_matrix[0][0]))
    
    return pitch, yaw, roll
```

### 5. Emotion Detection

#### 5.1 Current Issues
- Emotion detection logic is inaccurate
- No proper model training
- False classifications

#### 5.2 Solution Options

**Option A: Use Pre-trained Model (Recommended for MVP)**
```python
from fer import FER
import cv2

emotion_detector = FER(mtcnn=True)

def detect_emotion(frame):
    """
    Detect emotion using FER library
    Returns: emotion classification and confidence
    """
    result = emotion_detector.detect_emotions(frame)
    
    if not result:
        return {'emotion': 'neutral', 'confidence': 0.0}
    
    emotions = result[0]['emotions']
    dominant_emotion = max(emotions, key=emotions.get)
    confidence = emotions[dominant_emotion]
    
    return {
        'emotion': dominant_emotion,
        'confidence': confidence,
        'all_emotions': emotions
    }
```

**Option B: Train Custom Model (Better Accuracy)**
```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten, Dropout

def create_emotion_model():
    """
    Create CNN model for emotion detection
    7 emotions: angry, disgust, fear, happy, sad, surprise, neutral
    """
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(48, 48, 1)),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(7, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Training script
def train_emotion_model(model, train_data, val_data, epochs=50):
    """
    Train emotion detection model on FER2013 dataset
    """
    history = model.fit(
        train_data,
        validation_data=val_data,
        epochs=epochs,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=5),
            tf.keras.callbacks.ModelCheckpoint('emotion_model.h5', save_best_only=True)
        ]
    )
    return history
```

**Emotion Mapping for Attention:**
```python
EMOTION_ATTENTION_MAP = {
    'focused': 1.0,      # Best
    'happy': 0.9,
    'neutral': 0.7,
    'surprise': 0.6,
    'confused': 0.5,     # Engaged but struggling
    'sad': 0.3,
    'angry': 0.2,
    'bored': 0.1,
    'drowsy': 0.0        # Worst
}
```

### 6. Phone Detection

#### 6.1 Current Issues
- High false positive rate
- Missing actual phone usage
- Poor detection logic

#### 6.2 Improved Implementation

**Use YOLO for Object Detection:**
```python
from ultralytics import YOLO
import cv2

class PhoneDetector:
    def __init__(self):
        # Load YOLOv8 model
        self.model = YOLO('yolov8n.pt')
        self.phone_classes = ['cell phone', 'mobile phone']
        self.detection_threshold = 0.6
        self.consecutive_frames_required = 3
        self.detection_history = []
    
    def detect_phone(self, frame):
        """
        Detect phone in frame with confidence scoring
        """
        results = self.model(frame, verbose=False)
        
        phone_detected = False
        max_confidence = 0.0
        phone_bbox = None
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                class_name = self.model.names[class_id]
                confidence = float(box.conf[0])
                
                if class_name in self.phone_classes and confidence > self.detection_threshold:
                    phone_detected = True
                    if confidence > max_confidence:
                        max_confidence = confidence
                        phone_bbox = box.xyxy[0].tolist()
        
        # Add to history
        self.detection_history.append(phone_detected)
        if len(self.detection_history) > 10:
            self.detection_history.pop(0)
        
        # Require consecutive detections to reduce false positives
        recent_detections = self.detection_history[-self.consecutive_frames_required:]
        is_using_phone = all(recent_detections) if len(recent_detections) == self.consecutive_frames_required else False
        
        return {
            'phone_detected': phone_detected,
            'is_using_phone': is_using_phone,
            'confidence': max_confidence,
            'bbox': phone_bbox
        }
```

**Alternative: Hand-to-Face Detection (Supplementary)**
```python
def detect_hand_near_face(self, hand_landmarks, face_bbox):
    """
    Detect if hand is near face (phone usage indicator)
    """
    if not hand_landmarks or not face_bbox:
        return False
    
    # Check if hand landmarks are within face region
    face_x, face_y, face_w, face_h = face_bbox
    
    for landmark in hand_landmarks:
        x, y = landmark['x'], landmark['y']
        if (face_x <= x <= face_x + face_w and 
            face_y <= y <= face_y + face_h):
            return True
    
    return False
```

### 7. Frontend Visualization

#### 7.1 CameraOverlay Component
**File:** `frontend/src/components/student/CameraOverlay.jsx`

**Enhancements:**

```jsx
const drawFaceBoundingBox = (ctx, face, index) => {
  const { bbox, landmarks } = face
  
  // Draw bounding box
  ctx.strokeStyle = index === 0 ? '#00ff00' : '#ffff00'
  ctx.lineWidth = 3
  ctx.shadowBlur = 10
  ctx.shadowColor = index === 0 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 255, 0, 0.5)'
  ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height)
  
  // Draw label
  ctx.fillStyle = index === 0 ? '#00ff00' : '#ffff00'
  ctx.font = 'bold 16px Arial'
  ctx.fillText(`Student ${index + 1}`, bbox.x, bbox.y - 10)
  
  // Draw facial landmarks
  if (landmarks && landmarks.length > 0) {
    drawFacialLandmarks(ctx, landmarks)
  }
}

const drawFacialLandmarks = (ctx, landmarks) => {
  ctx.strokeStyle = '#00ffff'
  ctx.fillStyle = '#00ffff'
  ctx.lineWidth = 2
  
  // Draw landmark points
  landmarks.forEach((point, i) => {
    const x = point.x * canvas.width
    const y = point.y * canvas.height
    
    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  // Draw connections for face outline
  drawLandmarkConnections(ctx, landmarks, FACE_OUTLINE_INDICES)
  drawLandmarkConnections(ctx, landmarks, LEFT_EYE_INDICES)
  drawLandmarkConnections(ctx, landmarks, RIGHT_EYE_INDICES)
  drawLandmarkConnections(ctx, landmarks, MOUTH_INDICES)
}

const drawLandmarkConnections = (ctx, landmarks, indices) => {
  ctx.beginPath()
  indices.forEach((idx, i) => {
    const point = landmarks[idx]
    const x = point.x * canvas.width
    const y = point.y * canvas.height
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
}

// Landmark indices for connections
const FACE_OUTLINE_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const LEFT_EYE_INDICES = [36, 37, 38, 39, 40, 41, 36]
const RIGHT_EYE_INDICES = [42, 43, 44, 45, 46, 47, 42]
const MOUTH_INDICES = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48]
```

#### 7.2 StudySession Component UI Improvements
**File:** `frontend/src/components/student/StudySession.jsx`

**Enhanced Metrics Display:**
```jsx
<Grid container spacing={3}>
  {/* Focus Score Card */}
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Focus Score"
      value={Math.round(attentionLevel)}
      icon={<VisibilityIcon />}
      color={getScoreColor(attentionLevel)}
      subtitle={getFocusLevel(attentionLevel)}
    />
  </Grid>
  
  {/* Head Pose Card */}
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Head Position"
      value={getHeadPoseStatus(eyeTrackingData)}
      icon={<PostureIcon />}
      color={getHeadPoseColor(eyeTrackingData)}
      subtitle={`Yaw: ${eyeTrackingData?.head_yaw?.toFixed(1)}°`}
    />
  </Grid>
  
  {/* Emotion Card */}
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Emotion"
      value={getEmotionEmoji(eyeTrackingData?.primary_emotion)}
      icon={<EmojiEmotionsIcon />}
      color={getEmotionColor(eyeTrackingData?.primary_emotion)}
      subtitle={eyeTrackingData?.primary_emotion || 'Detecting...'}
    />
  </Grid>
  
  {/* Distraction Card */}
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Distractions"
      value={getDistractionCount(eyeTrackingData)}
      icon={<AlertIcon />}
      color={getDistractionColor(eyeTrackingData)}
      subtitle={eyeTrackingData?.distraction_type || 'None'}
    />
  </Grid>
</Grid>
```

## Data Models

### WebSocket Message Format

```typescript
interface TrackingData {
  timestamp: string
  session_id: string
  
  // Face Detection
  face_count: number
  faces: Array<{
    bbox: {
      x: number
      y: number
      width: number
      height: number
    }
    landmarks: Array<{
      x: number  // Normalized 0-1
      y: number  // Normalized 0-1
    }>
    confidence: number
  }>
  
  // Eye Tracking
  left_eye_ratio: number
  right_eye_ratio: number
  eye_aspect_ratio: number
  blink_detected: boolean
  blink_rate: number
  
  // Gaze
  gaze_direction_x: number  // -1 to 1
  gaze_direction_y: number  // -1 to 1
  gaze_on_screen: boolean
  
  // Head Pose
  head_pitch: number  // degrees
  head_yaw: number    // degrees
  head_roll: number   // degrees
  
  // Emotion
  primary_emotion: string
  emotion_confidence: number
  all_emotions: Record<string, number>
  
  // Attention Scores
  attention_score: number  // 0-1
  focus_score: number      // 0-100
  focus_level: 'high' | 'medium' | 'low' | 'disengaged'
  
  // Distractions
  is_drowsy: boolean
  drowsiness_level: number
  is_using_phone: boolean
  phone_detection_confidence: number
  distraction_type: string | null
  
  // Activity
  activity_type: string
  engagement_level: string
}
```

## Error Handling

### Frontend Error Handling
```typescript
// Camera errors
try {
  await cameraService.initializeCamera(videoRef.current)
} catch (error) {
  if (error.name === 'NotAllowedError') {
    setCameraError('Camera permission denied')
  } else if (error.name === 'NotFoundError') {
    setCameraError('No camera found')
  } else if (error.name === 'NotReadableError') {
    setCameraError('Camera in use by another application')
  } else {
    setCameraError('Failed to initialize camera')
  }
}

// WebSocket errors
websocket.onerror = (error) => {
  console.error('WebSocket error:', error)
  setConnectionError('Connection lost. Retrying...')
  attemptReconnect()
}
```

### Backend Error Handling
```python
try:
    # Process frame
    results = process_tracking_data(frame)
except Exception as e:
    logger.error(f"Error processing frame: {e}")
    # Send error to client
    emit('tracking_error', {
        'error': 'Processing failed',
        'details': str(e)
    })
```

## Testing Strategy

### Unit Tests
1. Test focus score calculation with various inputs
2. Test head pose estimation accuracy
3. Test emotion detection with sample images
4. Test phone detection with positive/negative samples

### Integration Tests
1. Test end-to-end video pipeline
2. Test WebSocket communication
3. Test real-time data updates in UI

### Performance Tests
1. Measure frame processing latency
2. Test with multiple concurrent users
3. Monitor memory usage

## Deployment Considerations

### Dependencies
```
Backend:
- opencv-python>=4.8.0
- dlib>=19.24.0
- tensorflow>=2.13.0
- ultralytics>=8.0.0
- fer>=22.5.0

Frontend:
- No new dependencies required
```

### Model Files
- `shape_predictor_68_face_landmarks.dat` (99.7 MB)
- `yolov8n.pt` (6.2 MB)
- `emotion_model.h5` (custom trained, ~50 MB)

### Performance Optimization
- Use GPU acceleration for model inference
- Implement frame skipping (process every 2nd frame)
- Use model quantization for faster inference
- Implement caching for repeated calculations
