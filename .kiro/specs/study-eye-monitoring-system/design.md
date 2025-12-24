# Study Eye Monitoring System - Design Document

## Overview

The Study Eye system is a client-side AI-powered engagement monitoring platform that processes webcam and microphone inputs locally to provide real-time behavioral analysis. The system uses lightweight computer vision and audio processing models to classify student behaviors into six distinct categories, calculate continuous engagement scores, and provide temporal analytics through an intuitive dashboard interface.

The architecture prioritizes privacy-first design with local-only processing, real-time performance on consumer hardware, and dual-mode operation for classroom learning and exam proctoring scenarios.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Dashboard UI Components                    │ │
│  │  - Video Feed Display                                   │ │
│  │  - Behavior Label Overlay                               │ │
│  │  - Engagement Score Display                             │ │
│  │  - Temporal Timeline Chart                              │ │
│  │  - Audio Activity Indicator                             │ │
│  │  - Privacy Controls                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Client-Side Processing Engine                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Video      │  │    Audio     │  │  Engagement  │ │ │
│  │  │  Processing  │  │  Processing  │  │   Scoring    │ │ │
│  │  │   Module     │  │    Module    │  │    Engine    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              AI Model Layer (TensorFlow.js)             │ │
│  │  - Face Detection (BlazeFace)                           │ │
│  │  - Facial Landmarks (FaceMesh)                          │ │
│  │  - Emotion Recognition (MobileNet-based)                │ │
│  │  - Object Detection (MobileNet SSD)                     │ │
│  │  - Audio Activity Detection (Web Audio API)             │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Browser APIs                                │ │
│  │  - MediaDevices API (Webcam/Microphone)                 │ │
│  │  - Canvas API (Video Processing)                        │ │
│  │  - Web Audio API (Audio Analysis)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Framework:**
- React 18+ with TypeScript
- Vite for build tooling
- Material-UI (MUI) for UI components

**AI/ML Libraries:**
- TensorFlow.js for browser-based inference
- @tensorflow-models/blazeface for face detection
- @tensorflow-models/facemesh for facial landmarks
- @tensorflow-models/coco-ssd for object detection
- Custom MobileNetV2-based emotion classifier

**Media Processing:**
- Browser MediaDevices API for camera/microphone access
- Canvas API for video frame processing
- Web Audio API for audio analysis

**State Management:**
- React Context API for global state
- React Hooks for local component state

**Visualization:**
- Recharts or Chart.js for temporal timeline
- Custom Canvas overlays for video annotations

## Components and Interfaces

### 1. Video Processing Module

**Purpose:** Capture and process video frames from webcam to extract visual features

**Key Components:**

#### 1.1 CameraManager
```typescript
interface CameraManager {
  initializeCamera(): Promise<MediaStream>
  stopCamera(): void
  captureFrame(): ImageData
  getVideoElement(): HTMLVideoElement
  applyAnonymization(enabled: boolean): void
}
```

**Responsibilities:**
- Request camera permissions
- Initialize MediaStream
- Provide frame capture at target FPS
- Apply face blur when anonymization is enabled

#### 1.2 FaceDetector
```typescript
interface FaceDetectionResult {
  boundingBox: { x: number; y: number; width: number; height: number }
  landmarks: Array<{ x: number; y: number }>
  confidence: number
  faceCount: number
}

interface FaceDetector {
  detectFaces(imageData: ImageData): Promise<FaceDetectionResult>
  isMultipleFacesDetected(): boolean
}
```

**Responsibilities:**
- Detect face presence and location using BlazeFace
- Extract facial landmarks using FaceMesh
- Count number of faces in frame
- Return bounding boxes and confidence scores

#### 1.3 GazeEstimator
```typescript
interface GazeData {
  isLookingAtScreen: boolean
  gazeDirection: 'center' | 'left' | 'right' | 'up' | 'down'
  gazeStability: number // 0-1
  headPose: { pitch: number; yaw: number; roll: number }
}

interface GazeEstimator {
  estimateGaze(landmarks: Array<Point>): GazeData
  calculateHeadPose(landmarks: Array<Point>): HeadPose
}
```

**Responsibilities:**
- Estimate gaze direction from eye landmarks
- Calculate head pose angles (pitch, yaw, roll)
- Determine if user is looking at screen
- Calculate gaze stability metric

#### 1.4 EmotionClassifier
```typescript
interface EmotionResult {
  primaryEmotion: 'focused' | 'confused' | 'bored' | 'frustrated' | 'happy' | 'drowsy' | 'neutral'
  confidence: number
  emotionScores: Record<string, number>
}

interface EmotionClassifier {
  classifyEmotion(faceRegion: ImageData): Promise<EmotionResult>
  loadModel(): Promise<void>
}
```

**Responsibilities:**
- Load lightweight emotion recognition model
- Classify facial expressions into emotion categories
- Return confidence scores for each emotion
- Optimize for real-time performance

#### 1.5 ObjectDetector
```typescript
interface ObjectDetectionResult {
  objectType: string
  confidence: number
  boundingBox: BoundingBox
}

interface ObjectDetector {
  detectObjects(imageData: ImageData): Promise<ObjectDetectionResult[]>
  isPhoneDetected(): boolean
  isWritingDetected(): boolean
}
```

**Responsibilities:**
- Detect phones and unauthorized objects
- Detect writing/note-taking gestures
- Filter detections by confidence threshold
- Optimize for exam mode scenarios

### 2. Audio Processing Module

**Purpose:** Analyze microphone input to detect speech activity

**Key Components:**

#### 2.1 AudioAnalyzer
```typescript
interface AudioData {
  isSpeaking: boolean
  audioLevel: number // 0-100
  speechConfidence: number
  ambientNoiseLevel: number
}

interface AudioAnalyzer {
  initializeAudio(): Promise<MediaStream>
  analyzeAudio(): AudioData
  stopAudio(): void
}
```

**Responsibilities:**
- Initialize microphone access
- Analyze audio frequency spectrum using Web Audio API
- Detect speech vs silence using energy thresholds
- Calculate ambient noise levels
- No speech-to-text (privacy compliant)

### 3. Behavior Classification Engine

**Purpose:** Combine multimodal inputs to classify student behavior

**Key Components:**

#### 3.1 BehaviorClassifier
```typescript
type BehaviorClass = 
  | 'focused_on_screen'
  | 'looking_away'
  | 'speaking'
  | 'note_taking'
  | 'no_face_detected'
  | 'phone_detected'

interface BehaviorResult {
  behaviorClass: BehaviorClass
  confidence: number
  timestamp: number
}

interface BehaviorClassifier {
  classifyBehavior(
    videoData: FaceDetectionResult,
    gazeData: GazeData,
    emotionData: EmotionResult,
    audioData: AudioData,
    objectData: ObjectDetectionResult[]
  ): BehaviorResult
}
```

**Classification Logic:**

1. **Focused on Screen:**
   - Face detected with high confidence
   - Gaze direction = center
   - Emotion = focused/neutral/happy
   - No phone detected
   - Low audio activity

2. **Looking Away:**
   - Face detected but gaze direction != center
   - Head yaw > 30° or pitch > 25°
   - Duration > 3 seconds

3. **Speaking:**
   - Audio activity detected
   - Speech confidence > 0.6
   - Mouth movement detected (optional)

4. **Note Taking:**
   - Head pitch < -15° (looking down)
   - Writing motion detected (optional)
   - Gaze not on screen
   - Stable head position

5. **No Face Detected:**
   - Face detection confidence < 0.3
   - No face bounding box returned

6. **Phone Detected:**
   - Phone object detected with confidence > 0.5
   - Hand near face region
   - Gaze directed downward

### 4. Engagement Scoring Engine

**Purpose:** Calculate continuous engagement score based on temporal behavior patterns

**Key Components:**

#### 4.1 EngagementScorer
```typescript
interface EngagementScore {
  score: number // 0-100
  level: 'high' | 'medium' | 'low' | 'disengaged'
  trend: 'increasing' | 'stable' | 'decreasing'
}

interface EngagementScorer {
  calculateScore(behaviorHistory: BehaviorResult[]): EngagementScore
  updateScore(newBehavior: BehaviorResult): void
  getScoreHistory(): Array<{ timestamp: number; score: number }>
}
```

**Scoring Algorithm:**

```
Base Score Weights:
- focused_on_screen: +10 points per 5-second interval
- looking_away: -5 points per 5-second interval
- speaking: +3 points (participation)
- note_taking: +7 points (active learning)
- no_face_detected: -15 points (absent)
- phone_detected: -20 points (severe distraction)

Temporal Smoothing:
- Use exponential moving average (EMA) with alpha = 0.3
- Recent behaviors weighted more heavily
- Score updated every 3-5 seconds

Engagement Level Thresholds:
- High: score >= 75
- Medium: 50 <= score < 75
- Low: 25 <= score < 50
- Disengaged: score < 25

Trend Detection:
- Compare current score to 30-second moving average
- Increasing: current > avg + 5
- Decreasing: current < avg - 5
- Stable: within ±5 of average
```

#### 4.2 TemporalAnalyzer
```typescript
interface TemporalData {
  timeline: Array<{ timestamp: number; score: number; behavior: string }>
  rollingWindow: number // 60 seconds
}

interface TemporalAnalyzer {
  addDataPoint(score: number, behavior: string): void
  getTimeline(): TemporalData
  detectAlert(): AlertEvent | null
}
```

**Responsibilities:**
- Maintain rolling 60-second window of engagement data
- Detect rapid engagement drops (30% in 10 seconds)
- Generate alert events for Classroom Mode
- Provide data for timeline visualization

### 5. Mode Controller

**Purpose:** Manage Classroom Mode vs Exam Mode behavior

**Key Components:**

#### 5.1 ModeManager
```typescript
type OperationMode = 'classroom' | 'exam'

interface ClassroomOutput {
  behavior_label: string
  engagement_score: number
  timestamp: number
  event_alert?: string
}

interface ExamOutput {
  event_type: string
  count: number
  timestamp: number
}

interface ModeManager {
  setMode(mode: OperationMode): void
  getMode(): OperationMode
  formatOutput(data: BehaviorResult, score: EngagementScore): ClassroomOutput | ExamOutput
}
```

**Mode-Specific Behavior:**

**Classroom Mode:**
- Display all visual overlays
- Show engagement score and timeline
- Generate alerts for engagement drops
- Output format: { behavior_label, engagement_score, timestamp, event_alert }

**Exam Mode:**
- Hide visual overlays (minimal distraction)
- Log suspicious events only
- Count occurrences of: looking_away, speaking, phone_detected
- Output format: { event_type, count, timestamp }
- No real-time feedback to test-taker

### 6. Dashboard UI Components

**Purpose:** Provide real-time visual interface for monitoring

**Key Components:**

#### 6.1 VideoFeedDisplay
- Renders live webcam feed
- Overlays behavior labels in Classroom Mode
- Applies face blur when anonymization enabled
- Displays "LIVE" indicator

#### 6.2 EngagementScoreCard
- Shows current engagement score (0-100)
- Displays score as number and progress bar
- Color-coded by level (green/yellow/red)
- Shows trend indicator (↑↓→)

#### 6.3 TemporalTimeline
- Line chart showing 60-second engagement history
- X-axis: time (seconds ago)
- Y-axis: engagement score (0-100)
- Updates every 3-5 seconds
- Highlights alert events

#### 6.4 BehaviorIndicator
- Shows current behavior classification
- Displays confidence percentage
- Icon representation for each behavior type
- Updates in real-time

#### 6.5 AudioActivityIndicator
- Visual indicator for speech detection
- Waveform or level meter display
- "Speaking" / "Silent" label
- Color-coded by activity level

#### 6.6 PrivacyControls
- Anonymization toggle switch
- Privacy compliance message display
- Mode selector (Classroom/Exam)
- Camera/microphone permission status

## Data Models

### BehaviorDataPoint
```typescript
interface BehaviorDataPoint {
  timestamp: number
  behaviorClass: BehaviorClass
  confidence: number
  videoFeatures: {
    faceDetected: boolean
    gazeDirection: string
    headPose: { pitch: number; yaw: number; roll: number }
    emotion: string
    emotionConfidence: number
  }
  audioFeatures: {
    isSpeaking: boolean
    audioLevel: number
  }
  objectsDetected: string[]
}
```

### EngagementDataPoint
```typescript
interface EngagementDataPoint {
  timestamp: number
  score: number
  level: 'high' | 'medium' | 'low' | 'disengaged'
  trend: 'increasing' | 'stable' | 'decreasing'
  contributingBehaviors: BehaviorClass[]
}
```

### AlertEvent
```typescript
interface AlertEvent {
  timestamp: number
  type: 'engagement_drop' | 'suspicious_activity' | 'no_face_detected'
  severity: 'low' | 'medium' | 'high'
  message: string
  metadata: Record<string, any>
}
```

### SessionData
```typescript
interface SessionData {
  sessionId: string
  mode: OperationMode
  startTime: number
  endTime?: number
  behaviorHistory: BehaviorDataPoint[]
  engagementHistory: EngagementDataPoint[]
  alerts: AlertEvent[]
  statistics: {
    averageEngagement: number
    totalFocusTime: number
    totalDistractionTime: number
    behaviorCounts: Record<BehaviorClass, number>
  }
}
```

## Error Handling

### Camera/Microphone Access Errors
- **NotAllowedError:** Display permission request UI with instructions
- **NotFoundError:** Show error message indicating no camera/microphone found
- **NotReadableError:** Indicate hardware is in use by another application
- **Fallback:** Allow system to run with degraded functionality (video-only or audio-only)

### Model Loading Errors
- **NetworkError:** Retry model download with exponential backoff
- **ModelLoadError:** Display error message and prevent system start
- **Fallback:** Use simpler fallback models if available

### Performance Degradation
- **Low FPS Detection:** Automatically reduce processing resolution
- **High Latency:** Skip frames to maintain real-time performance
- **Memory Pressure:** Clear old data from temporal buffers

### Browser Compatibility
- **Unsupported Browser:** Display compatibility message with supported browser list
- **Missing APIs:** Gracefully disable features that require unavailable APIs
- **Fallback:** Provide basic functionality where possible

## Testing Strategy

### Unit Testing
- Test individual AI model outputs with known inputs
- Test scoring algorithm with predefined behavior sequences
- Test temporal analyzer with synthetic time-series data
- Test mode controller output formatting
- Framework: Jest + React Testing Library

### Integration Testing
- Test video processing pipeline end-to-end
- Test audio processing pipeline end-to-end
- Test behavior classification with combined inputs
- Test engagement scoring with behavior history
- Framework: Jest + Testing Library

### Performance Testing
- Measure FPS under various hardware conditions
- Measure inference latency for each AI model
- Measure memory usage over extended sessions
- Measure UI responsiveness under load
- Tools: Chrome DevTools Performance Profiler

### User Acceptance Testing
- Test camera initialization on different devices
- Test anonymization feature effectiveness
- Test mode switching behavior
- Test alert generation accuracy
- Test dashboard usability and clarity

### Privacy Compliance Testing
- Verify no data is transmitted to external servers
- Verify no data is written to persistent storage
- Verify anonymization properly obscures identity
- Verify compliance message is always visible
- Tools: Network monitoring, storage inspection

## Performance Optimization Strategies

### Model Optimization
- Use quantized TensorFlow.js models (8-bit or 16-bit)
- Use MobileNet architecture variants for efficiency
- Load models asynchronously to avoid blocking
- Cache models in browser storage for faster subsequent loads

### Frame Processing Optimization
- Process frames at 10-15 FPS instead of full 30 FPS
- Downscale video resolution for inference (e.g., 320x240)
- Use Web Workers for parallel processing where possible
- Skip frames during high CPU load

### Memory Management
- Limit behavior history to last 120 data points (10 minutes at 5s intervals)
- Limit engagement history to last 60 data points (5 minutes)
- Clear old canvas contexts and image data
- Use object pooling for frequently created objects

### UI Rendering Optimization
- Use React.memo for expensive components
- Debounce timeline chart updates
- Use CSS transforms for smooth animations
- Virtualize long lists if needed

## Deployment Considerations

### Browser Requirements
- Chrome 90+ (recommended)
- Firefox 88+
- Edge 90+
- Safari 14+ (limited support)

### Hardware Requirements
- Minimum: Dual-core CPU, 4GB RAM, integrated graphics
- Recommended: Quad-core CPU, 8GB RAM, dedicated GPU
- Webcam: 720p minimum, 1080p recommended
- Microphone: Any standard microphone

### Network Requirements
- Initial load: Download AI models (~10-20 MB total)
- Runtime: No network required (fully offline capable)

### Security Considerations
- Serve over HTTPS (required for camera/microphone access)
- Implement Content Security Policy (CSP)
- No external API calls during runtime
- No third-party analytics or tracking

## Future Enhancements (Out of MVP Scope)

- Adaptive micro-quiz trigger based on engagement drops
- Multi-student grid view for classroom monitoring
- Physiological estimation (rPPG for heart rate)
- Advanced pose estimation for posture analysis
- Integration with Learning Management Systems (LMS)
- Historical analytics and reporting dashboard
- Mobile device support (iOS/Android)
