# StudyEye Monitoring System

A privacy-first, real-time student engagement and behavior monitoring system using multimodal AI analysis.

## Overview

StudyEye is an intelligent monitoring system that tracks student engagement and behavior during study sessions using computer vision and audio analysis. The system operates entirely in the browser with local processing, ensuring complete privacy and GDPR compliance.

## Features

### Core Capabilities

- **Real-time Face Detection**: Detects faces and tracks presence using BlazeFace
- **Gaze Estimation**: Determines where the student is looking (center, left, right, up, down)
- **Emotion Classification**: Identifies emotional states (focused, confused, bored, frustrated, happy, drowsy, neutral)
- **Object Detection**: Detects phones and writing materials using COCO-SSD
- **Audio Activity Detection**: Monitors speaking activity using Web Audio API
- **Behavior Classification**: Classifies 6 behavior types:
  - Focused on Screen
  - Looking Away / Distracted
  - Speaking Detected
  - Note-taking / Writing
  - No Face Detected
  - Phone / Unauthorized Object Detected

### Engagement Tracking

- **Engagement Scoring**: Real-time engagement score (0-100) based on behavior patterns
- **Temporal Analysis**: 60-second rolling timeline of engagement history
- **Alert System**: Automatic alerts for significant engagement drops (30% in 10 seconds)
- **Trend Analysis**: Visual indicators for engagement trends (up, down, flat)

### Operating Modes

#### Classroom Mode
- Full visual feedback with behavior labels
- Engagement score and timeline display
- Real-time alerts for engagement drops
- Comprehensive metrics dashboard

#### Exam Mode
- Minimal visual distractions
- Event logging for suspicious behaviors
- Discrete monitoring without overlays
- Focus on integrity monitoring

### Privacy Features

- **Local Processing**: All AI processing happens in the browser
- **No Recording**: No video or audio data is stored
- **Face Anonymization**: Optional face blurring for privacy
- **GDPR Compliant**: No data leaves the device
- **Transparent**: Clear privacy indicators and controls

## System Requirements

### Browser Compatibility

- **Recommended**: Chrome 90+, Edge 90+
- **Supported**: Firefox 88+, Safari 14+
- **Required Features**:
  - WebGL 2.0
  - getUserMedia API
  - Web Audio API
  - Secure context (HTTPS or localhost)

### Hardware Requirements

- **Minimum**:
  - Webcam (720p)
  - Microphone (optional but recommended)
  - 4GB RAM
  - Dual-core CPU
  - GPU with WebGL support

- **Recommended**:
  - Webcam (1080p)
  - Microphone with noise cancellation
  - 8GB RAM
  - Quad-core CPU
  - Dedicated GPU

### Performance Targets

- **Frame Rate**: 10-15 FPS
- **Processing Latency**: <200ms per frame
- **Memory Usage**: <500MB
- **Model Loading**: <30 seconds (first time)

## Installation

The StudyEye system is integrated into the main application. No separate installation is required.

### Dependencies

All required dependencies are included in the main `package.json`:

```json
{
  "@tensorflow/tfjs": "^4.22.0",
  "@tensorflow-models/blazeface": "^0.1.0",
  "@tensorflow-models/face-landmarks-detection": "^1.0.6",
  "@tensorflow-models/coco-ssd": "^2.2.3",
  "recharts": "^3.3.0"
}
```

## Usage

### Starting a Study Session

1. Navigate to **Student Dashboard** → **Study Session**
2. Click **"Start Session"** button
3. Grant camera and microphone permissions when prompted
4. Wait for AI models to load (first time only)
5. Session begins automatically once initialized

### Using Privacy Controls

- **Mode Selection**: Toggle between Classroom and Exam modes
- **Anonymization**: Enable face blurring for privacy
- **Blur Intensity**: Adjust blur strength (0-100)
- **Privacy Message**: Always visible compliance indicator

### Monitoring Engagement

- **Engagement Score**: Large numerical display with color coding
  - Green (75-100): High engagement
  - Yellow (50-74): Medium engagement
  - Red (0-49): Low engagement
- **Timeline Chart**: 60-second history with alert markers
- **Behavior Indicator**: Current behavior with confidence level
- **Audio Activity**: Speaking detection with level meter

### Stopping a Session

1. Click **"Stop Session"** button
2. All processing stops immediately
3. Camera and microphone are released
4. Session data is cleared from memory

## Architecture

### Folder Structure

```
frontend/src/studyeye/
├── components/          # React UI components
│   ├── StudyEyeDashboard.tsx
│   ├── VideoFeedDisplay.tsx
│   ├── EngagementScoreCard.tsx
│   ├── TemporalTimeline.tsx
│   ├── BehaviorIndicator.tsx
│   ├── AudioActivityIndicator.tsx
│   ├── PrivacyControls.tsx
│   └── index.ts
├── contexts/            # React Context for state management
│   ├── StudyEyeContext.tsx
│   └── index.ts
├── hooks/               # Custom React hooks
│   ├── useAudioStream.ts
│   ├── useFaceDetector.ts
│   ├── useModelLoader.ts
│   ├── usePrivacyController.ts
│   └── index.ts
├── services/            # Core processing services
│   ├── audioAnalyzer.ts
│   ├── behaviorClassifier.ts
│   ├── emotionClassifier.ts
│   ├── engagementScorer.ts
│   ├── faceDetector.ts
│   ├── gazeEstimator.ts
│   ├── modelLoader.ts
│   ├── modeManager.ts
│   ├── objectDetector.ts
│   ├── privacyController.ts
│   ├── temporalAnalyzer.ts
│   ├── processingOrchestrator.ts
│   ├── performanceMonitor.ts
│   ├── errorHandler.ts
│   └── index.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── PRIVACY_ARCHITECTURE.md
└── README.md
```

### Processing Pipeline

1. **Frame Capture**: Video frames captured at 10-15 FPS
2. **Face Detection**: BlazeFace detects faces and landmarks
3. **Gaze Estimation**: Calculate gaze direction from eye landmarks
4. **Emotion Classification**: Analyze facial expressions
5. **Object Detection**: Detect phones and writing materials
6. **Audio Analysis**: Monitor speaking activity (parallel)
7. **Behavior Classification**: Combine multimodal inputs (every 3-5s)
8. **Engagement Scoring**: Calculate engagement from behavior history
9. **Temporal Analysis**: Update timeline and detect alerts
10. **UI Update**: Render results to dashboard

### State Management

- **StudyEyeContext**: Global state using React Context
- **ProcessingOrchestrator**: Coordinates all AI services
- **Real-time Updates**: State updates propagate to UI components
- **Memory Management**: Old data automatically cleared

## API Reference

### Components

#### StudyEyeDashboard
Main dashboard component integrating all features.

```tsx
import { StudyEyeDashboard } from './studyeye/components';

<StudyEyeDashboard />
```

#### VideoFeedDisplay
Displays live video feed with overlays.

```tsx
<VideoFeedDisplay
  videoElement={videoElement}
  behaviorResult={behaviorResult}
  faceDetection={faceDetection}
  mode="classroom"
  anonymizationEnabled={false}
  blurIntensity={50}
  isLive={true}
/>
```

#### EngagementScoreCard
Shows engagement score with visual indicators.

```tsx
<EngagementScoreCard
  score={85}
  trend="up"
  lastUpdated={new Date()}
/>
```

### Services

#### processingOrchestrator
Coordinates all AI processing.

```typescript
import { processingOrchestrator } from './studyeye/services';

// Initialize
await processingOrchestrator.initialize(videoElement, audioStream);

// Start processing
processingOrchestrator.start();

// Get state
const state = processingOrchestrator.getState();

// Stop processing
processingOrchestrator.stop();
```

#### behaviorClassifier
Classifies student behavior from multimodal inputs.

```typescript
import { behaviorClassifier } from './studyeye/services';

const behavior = await behaviorClassifier.classifyBehavior(
  faceDetection,
  gazeResult,
  emotionResult,
  objectDetections,
  audioActivity
);
```

### Context

#### useStudyEyeContext
Access global StudyEye state.

```typescript
import { useStudyEyeContext } from './studyeye/contexts';

const {
  state,
  startSession,
  stopSession,
  setMode,
  setAnonymization
} = useStudyEyeContext();
```

## Troubleshooting

### Camera Access Issues

**Problem**: Camera permission denied
**Solution**:
1. Check browser permissions settings
2. Ensure HTTPS or localhost
3. Close other apps using camera
4. Try different browser

### Model Loading Failures

**Problem**: AI models fail to load
**Solution**:
1. Check internet connection
2. Clear browser cache
3. Disable ad blockers
4. Check firewall settings

### Low Performance

**Problem**: FPS below 10
**Solution**:
1. Close other browser tabs
2. Reduce video resolution
3. Disable other applications
4. Check GPU acceleration enabled

### Browser Compatibility

**Problem**: Features not working
**Solution**:
1. Update browser to latest version
2. Enable WebGL in settings
3. Use recommended browser (Chrome/Edge)
4. Check hardware acceleration

## Privacy & Compliance

### Data Processing

- **Location**: 100% local browser processing
- **Storage**: No persistent storage (RAM only)
- **Network**: No video/audio data transmitted
- **Recording**: No recording capabilities

### GDPR Compliance

- **Data Minimization**: Only necessary data processed
- **Purpose Limitation**: Data used only for engagement tracking
- **Storage Limitation**: Data cleared when session ends
- **Transparency**: Clear privacy indicators
- **User Control**: Full control over privacy settings

### Security

- **Secure Context**: Requires HTTPS
- **No Backend**: No server-side processing
- **No Cookies**: No tracking cookies
- **No Analytics**: No usage tracking

## Performance Optimization

### Automatic Optimizations

- **Frame Skipping**: Maintains target FPS under load
- **Model Caching**: Models loaded once per session
- **Memory Management**: Automatic cleanup of old data
- **Adaptive Quality**: Resolution adjustment if needed

### Manual Optimizations

- **Reduce Resolution**: Lower camera resolution
- **Disable Audio**: Run video-only mode
- **Close Tabs**: Free up system resources
- **Update Drivers**: Ensure GPU drivers current

## Known Limitations

- **Single Face**: Optimized for single student
- **Lighting**: Requires adequate lighting
- **Angle**: Works best with frontal face view
- **Background**: Complex backgrounds may affect detection
- **Browser**: Best performance in Chrome/Edge

## Future Enhancements

- Multi-student support
- Advanced emotion recognition
- Posture analysis
- Attention heatmaps
- Session analytics export
- Mobile device support

## Support

For issues or questions:
1. Check browser console for errors
2. Review troubleshooting section
3. Verify system requirements
4. Contact system administrator

## License

Part of the main application. See main LICENSE file.

## Credits

Built with:
- TensorFlow.js
- BlazeFace (Google)
- FaceMesh (Google)
- COCO-SSD (Google)
- Material-UI
- Recharts
