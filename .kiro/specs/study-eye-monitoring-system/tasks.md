# Implementation Plan

## Folder Structure

The StudyEye system follows this organization:

```
frontend/src/studyeye/
├── components/          # React UI components
│   ├── VideoFeedDisplay.tsx
│   ├── PrivacyControls.tsx
│   ├── EngagementScoreCard.tsx (to be created)
│   ├── TemporalTimeline.tsx (to be created)
│   ├── BehaviorIndicator.tsx (to be created)
│   ├── AudioActivityIndicator.tsx (to be created)
│   ├── StudyEyeDashboard.tsx (to be created)
│   └── index.ts
├── contexts/            # React Context for state management (to be created)
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
│   ├── processingOrchestrator.ts (to be created)
│   ├── __tests__/
│   └── index.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── PRIVACY_ARCHITECTURE.md
└── README.md (to be created)
```

## Tasks

- [x] 1. Set up StudyEye dependencies in existing project
  - Install TensorFlow.js and model packages in frontend: @tensorflow/tfjs, @tensorflow-models/blazeface, @tensorflow-models/facemesh, @tensorflow-models/coco-ssd
  - Install Recharts for timeline visualization (if not already present)
  - Create StudyEye folder structure within existing frontend: frontend/src/studyeye/{components, services, hooks, types, utils}
  - Verify TypeScript configuration supports TensorFlow.js types
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2_

- [x] 2. Implement camera and microphone access layer
  - Create CameraManager service at frontend/src/studyeye/services/cameraManager.ts
  - Implement frame capture functionality at configurable FPS (10-15 FPS target)
  - Create AudioAnalyzer service at frontend/src/studyeye/services/audioAnalyzer.ts
  - Implement permission request handling with user-friendly error messages
  - Add error handling for NotAllowedError, NotFoundError, NotReadableError
  - Create React hooks at frontend/src/studyeye/hooks/useCameraStream.ts and useAudioStream.ts
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Implement AI model loading and initialization






  - Create ModelLoader service at frontend/src/studyeye/services/modelLoader.ts
  - Load BlazeFace model for face detection
  - Load FaceMesh model for facial landmarks
  - Load COCO-SSD model for object detection
  - Implement model caching in browser IndexedDB for faster subsequent loads
  - Add loading progress indicators and error handling for model loading failures
  - Create useModelLoader hook for React components
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.5_

- [x] 4. Build face detection and landmark extraction





  - Create FaceDetector service at frontend/src/studyeye/services/faceDetector.ts
  - Implement face detection using BlazeFace model
  - Extract face bounding boxes and confidence scores
  - Implement facial landmark detection using FaceMesh (468 landmarks)
  - Detect multiple faces and return face count
  - Optimize face detection to run at 10-15 FPS with frame skipping if needed
  - _Requirements: 2.1, 2.5, 2.7, 2.8, 9.1, 9.2, 9.3_


- [x] 5. Implement gaze estimation and head pose calculation


  - Create GazeEstimator service at frontend/src/studyeye/services/gazeEstimator.ts
  - Implement gaze direction calculation from eye landmarks (using iris positions)
  - Implement head pose estimation (pitch, yaw, roll) using PnP algorithm with facial landmarks
  - Determine if user is looking at screen based on gaze direction thresholds
  - Calculate gaze stability metric (0-1 scale) using temporal smoothing
  - Classify gaze direction into categories: center, left, right, up, down
  - _Requirements: 2.1, 2.7, 2.8_




- [x] 6. Build emotion classification system


  - Create EmotionClassifier service at frontend/src/studyeye/services/emotionClassifier.ts
  - Implement simplified emotion classification into 7 categories: focused, confused, bored, frustrated, happy, drowsy, neutral
  - Use facial landmark patterns and eye aspect ratio for basic emotion inference (no heavy ML model needed for MVP)
  - Extract face region from frame for analysis
  - Return emotion confidence scores based on heuristics
  - Optimize for real-time performance (< 50ms per frame)
  - _Requirements: 2.1, 2.7, 2.8, 9.3_
-

- [x] 7. Implement object detection for phone and writing detection



  - Create ObjectDetector service at frontend/src/studyeye/services/objectDetector.ts
  - Implement phone detection using COCO-SSD model (detect "cell phone" class)
  - Implement writing detection by detecting "book", "pen", "pencil" classes
  - Filter detections by confidence threshold (>0.5)
  - Return object type, confidence, and bounding box
  - Optimize to run every 2-3 frames (not every frame) to save performance
  - _Requirements: 2.6, 2.7, 2.8_

- [x] 8. Build audio activity detection




  - Implement audio analysis using Web Audio API in frontend/src/studyeye/services/audioAnalyzer.ts
  - Create AudioAnalyzer to detect speech vs silence using FFT energy thresholds
  - Calculate audio level (0-100) from RMS amplitude
  - Calculate ambient noise level baseline
  - Implement speech confidence scoring based on frequency patterns (no speech-to-text)
  - Update audio activity indicator every 100ms
  - _Requirements: 2.3, 2.7, 2.8, 6.5, 6.6_





- [x] 9. Implement 6-class behavior classification engine
  - Create BehaviorClassifier service at frontend/src/studyeye/services/behaviorClassifier.ts
  - Implement classification logic for "Focused on Screen" (face detected + gaze center + no phone)
  - Implement classification logic for "Looking Away / Distracted" (face detected + gaze not center)
  - Implement classification logic for "Speaking Detected" (audio activity detected)
  - Implement classification logic for "Note-taking / writing motion" (head down + writing objects detected)
  - Implement classification logic for "No Face Detected" (no face in frame)
  - Implement classification logic for "Phone / unauthorized object detected" (phone object detected)
  - Return behavior class, confidence score, and timestamp
  - Update behavior classification every 3-5 seconds with temporal smoothing
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 10. Build continuous engagement scoring engine



  - Create EngagementScorer service at frontend/src/studyeye/services/engagementScorer.ts
  - Implement base score weights: focused(+10), looking_away(-5), speaking(+3), note_taking(+7), no_face(-15), phone(-20)
  - Implement temporal smoothing using exponential moving average (EMA with alpha=0.3)
  - Calculate engagement level: high (>=75), medium (50-74), low (25-49), disengaged (<25)
  - Detect engagement trend by comparing current score to 30-second moving average
  - Update engagement score every 3-5 seconds based on behavior history
  - Store score history in memory (last 60 seconds)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 11. Implement temporal tracking and timeline management





  - Create TemporalAnalyzer service at frontend/src/studyeye/services/temporalAnalyzer.ts
  - Maintain rolling 60-second engagement history in memory array
  - Store engagement score and behavior data points with timestamps
  - Implement rolling window logic to remove data older than 60 seconds
  - Detect rapid engagement drops (30% decrease in 10 seconds) for Classroom Mode alerts
  - Generate alert events when engagement drops significantly
  - Provide timeline data array for visualization component
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.5_

- [x] 12. Build mode controller for Classroom and Exam modes





  - Create ModeManager service at frontend/src/studyeye/services/modeManager.ts
  - Implement Classroom Mode output format: { behavior_label, engagement_score, timestamp, event_alert }
  - Implement Exam Mode output format: { event_type, count, timestamp }
  - Implement mode-specific behavior: visual overlays enabled in Classroom, disabled in Exam
  - Add mode switching functionality with state management
  - Implement event counting for Exam Mode (looking_away, speaking, phone_detected)
  - Store event log in memory for session duration
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 13. Implement privacy controls and anonymization
  - Create PrivacyController service at frontend/src/studyeye/services/privacyController.ts
  - Implement face blur functionality using Canvas API blur filter when anonymization is enabled
  - Add anonymization toggle control in StudyEye dashboard UI
  - Display privacy compliance message prominently: "Local processing — No recording — Privacy compliant"
  - Ensure no video/audio data is stored to localStorage, sessionStorage, or IndexedDB
  - Ensure all processing happens in volatile memory only (RAM)
  - Add verification that no network requests are made with raw video/audio data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_




- [x] 14. Build dashboard UI - Video feed display component
  - Create VideoFeedDisplay component at frontend/src/studyeye/components/VideoFeedDisplay.tsx
  - Render live webcam feed using HTML5 video element
  - Overlay behavior labels on video in Classroom Mode using Canvas
  - Display "LIVE" indicator badge when camera is active
  - Apply face blur overlay when anonymization is enabled
  - Ensure video display maintains aspect ratio and responsive sizing
  - Integrate with existing Material-UI theme
  - _Requirements: 5.1, 5.2, 5.7, 6.2_

- [x] 15. Build dashboard UI - Engagement score display component


  - Create EngagementScoreCard component at frontend/src/studyeye/components/EngagementScoreCard.tsx
  - Display score numerically with large, readable font (Material-UI Typography variant="h2")
  - Display score as Material-UI LinearProgress bar
  - Color-code score by level: green (high >=75), yellow (medium 50-74), red (low <50)
  - Show trend indicator using Material-UI icons (TrendingUp, TrendingFlat, TrendingDown)
  - Update in real-time with smooth transitions
  - _Requirements: 5.3, 5.4, 5.6_

- [x] 16. Build dashboard UI - Temporal timeline chart component


  - Create TemporalTimeline component at frontend/src/studyeye/components/TemporalTimeline.tsx
  - Use Recharts library for line chart visualization
  - Display line chart showing 60-second engagement history
  - X-axis: time (seconds ago), Y-axis: engagement score (0-100)
  - Update chart every 3-5 seconds with new data points
  - Highlight alert events on timeline with red markers/dots
  - Ensure smooth animations and responsive design with Material-UI Paper container
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 17. Build dashboard UI - Behavior and audio indicators


  - Create BehaviorIndicator component at frontend/src/studyeye/components/BehaviorIndicator.tsx
  - Display current behavior label text and confidence percentage
  - Add Material-UI icons for each of the 6 behavior types
  - Create AudioActivityIndicator component at frontend/src/studyeye/components/AudioActivityIndicator.tsx
  - Display "Speaking" / "Silent" label with animated level meter using Material-UI LinearProgress
  - Update indicators in real-time with minimal latency (<500ms)
  - Use Material-UI Chip components for clean, modern look
  - _Requirements: 5.2, 5.5, 5.6_

- [x] 18. Build dashboard UI - Privacy controls and mode selector
  - Create PrivacyControls component at frontend/src/studyeye/components/PrivacyControls.tsx
  - Add Material-UI Switch for anonymization toggle
  - Display privacy compliance message prominently in Material-UI Alert component
  - Add mode selector using Material-UI ToggleButtonGroup for Classroom vs Exam mode
  - Show camera and microphone permission status using Material-UI Chip with icons
  - Implement collapsible settings panel using Material-UI Accordion for additional configurations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 8.1_

- [x] 19. Implement main processing loop and orchestration


  - Create ProcessingOrchestrator service at frontend/src/studyeye/services/processingOrchestrator.ts
  - Implement main processing loop using requestAnimationFrame with FPS throttling (10-15 FPS)
  - Pipeline: Capture frame → detect face → extract landmarks → estimate gaze → classify emotion → detect objects
  - Run audio analysis in parallel using separate interval (every 100ms)
  - Classify behavior from combined multimodal inputs every 3-5 seconds
  - Calculate engagement score from behavior history
  - Update temporal timeline and detect alerts
  - Format output based on current mode (Classroom/Exam)
  - Ensure processing completes within performance budgets (<200ms per frame)
  - Add performance monitoring and automatic frame skipping if needed
  - _Requirements: 2.8, 3.7, 4.3, 5.6, 9.1, 9.2, 9.3, 9.4_



- [ ] 20. Implement performance monitoring and optimization
  - Add FPS counter to track actual frame processing rate
  - Implement automatic resolution downscaling if FPS drops below 10
  - Add frame skipping logic to maintain real-time performance under load
  - Implement memory monitoring and cleanup for old data
  - Use Web Workers for parallel processing where possible
  - Optimize model inference with quantization and caching


  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 21. Implement error handling and fallback mechanisms
  - Add comprehensive error handling for camera/microphone access failures
  - Implement retry logic with exponential backoff for model loading
  - Add fallback to degraded functionality (video-only or audio-only mode)
  - Display user-friendly error messages with troubleshooting steps


  - Implement browser compatibility detection and warnings
  - Add graceful degradation for unsupported features
  - _Requirements: 1.5, 1.6, 1.7, 1.8_

- [ ] 22. Create contexts folder and StudyEye Context for global state management
  - Create contexts directory at frontend/src/studyeye/contexts/
  - Create StudyEyeContext at frontend/src/studyeye/contexts/StudyEyeContext.tsx
  - Create index.ts at frontend/src/studyeye/contexts/index.ts for exports


  - Define context state interface with camera, audio, behavior, engagement, mode, and privacy settings
  - Implement context provider with state management hooks
  - Provide methods for updating state (setBehavior, setEngagement, setMode, etc.)
  - Export useStudyEyeContext hook for consuming components
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.6_

- [ ] 23. Integrate all components into main StudyEye dashboard
  - Create main StudyEyeDashboard component at frontend/src/studyeye/components/StudyEyeDashboard.tsx
  - Wrap dashboard with StudyEyeContext provider
  - Connect ProcessingOrchestrator to UI components via Context state updates
  - Implement session lifecycle management (start, pause, resume, stop)
  - Add session data persistence in memory only (no disk storage)
  - Wire up mode switching to update UI visibility and processing behavior
  - Integrate with existing Material-UI theme from frontend/src/App.jsx
  - Layout all UI components: VideoFeedDisplay, EngagementScoreCard, TemporalTimeline, BehaviorIndicator, AudioActivityIndicator, PrivacyControls
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.6_

- [ ] 24. Implement Classroom Mode specific features in dashboard
  - Enable visual overlays for behavior labels on video feed (already in VideoFeedDisplay)
  - Display engagement score and timeline prominently in dashboard layout
  - Implement alert notification system for engagement drops using Material-UI Snackbar
  - Show alert banner when engagement drops 30% in 10 seconds
  - Format output as: { behavior_label, engagement_score, timestamp, event_alert }
  - Update all displays every 3-5 seconds
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 25. Implement Exam Mode specific features in dashboard
  - Hide visual overlays to minimize distraction (conditional rendering in VideoFeedDisplay)
  - Implement event logging for suspicious behaviors in ProcessingOrchestrator
  - Count occurrences of: looking_away, speaking, phone_detected
  - Format output as: { event_type, count, timestamp }
  - Store event log in memory for session duration
  - Provide minimal UI feedback (only mode indicator and privacy message)
  - Display event counts in a minimal ExamModePanel component
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ]* 26. Write unit tests for core services
  - Write tests for BehaviorClassifier with mock multimodal inputs
  - Write tests for EngagementScorer with predefined behavior sequences
  - Write tests for TemporalAnalyzer with synthetic time-series data
  - Write tests for ModeManager output formatting
  - Write tests for PrivacyController anonymization logic (already has basic tests)
  - Use Jest and React Testing Library
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ]* 27. Write integration tests for processing pipeline
  - Test video processing pipeline end-to-end with sample video
  - Test audio processing pipeline with sample audio
  - Test behavior classification with combined video and audio inputs
  - Test engagement scoring with behavior history
  - Test mode switching between Classroom and Exam modes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ]* 28. Perform performance testing and optimization
  - Measure FPS under various hardware conditions (low-end, mid-range, high-end)
  - Measure inference latency for each AI model
  - Measure memory usage over extended sessions (30+ minutes)
  - Measure UI responsiveness under load
  - Profile with Chrome DevTools Performance Profiler
  - Optimize bottlenecks identified in profiling
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ]* 29. Conduct privacy compliance verification
  - Verify no network requests are made during runtime (except initial model load)
  - Verify no data is written to localStorage, sessionStorage, or IndexedDB
  - Verify no data is written to disk or persistent storage
  - Verify anonymization properly obscures facial features
  - Verify compliance message is always visible on dashboard
  - Use browser DevTools Network and Storage tabs for verification
  - _Requirements: 1.5, 1.6, 1.7, 1.8, 6.4, 6.5, 6.6, 6.7_

- [x] 30. Create MVP demonstration and documentation



  - Create README at frontend/src/studyeye/README.md with setup instructions and system requirements
  - Document browser compatibility and hardware requirements
  - Create user guide for Classroom Mode and Exam Mode
  - Document privacy features and compliance measures
  - Document API and component usage for developers
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 31. Integrate StudyEye dashboard into existing application routes


  - Add StudyEyeDashboard route to frontend/src/routes.jsx under student routes
  - Add "Study Session" menu item back to student sidebar with StudyEye icon
  - Update roleRoutes.student array to include study-session path
  - Update roleMenuItems.student array to include Study Session menu item
  - Ensure StudyEye dashboard is accessible at /student/study-session
  - Test navigation from student dashboard to StudyEye dashboard
  - Verify StudyEye dashboard integrates seamlessly with existing Material-UI theme
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ] 32. Final MVP integration and validation
  - Verify all 6 behavior classes are correctly detected and classified
  - Verify engagement score updates continuously with temporal analysis
  - Verify 60-second temporal timeline displays correctly
  - Verify Classroom Mode shows all visual feedback and alerts
  - Verify Exam Mode logs events without visual distractions
  - Verify privacy controls work correctly (anonymization, compliance message)
  - Verify system runs at minimum 10 FPS on target hardware
  - Verify system serves as proof-of-concept for multimodal behavior recognition
  - Test complete user flow: login → navigate to study session → start monitoring → view metrics
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
