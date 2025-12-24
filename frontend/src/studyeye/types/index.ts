// Common types for StudyEye system

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  boundingBox: BoundingBox;
  landmarks: Point[];
  confidence: number;
  id?: number; // Optional ID for tracking
}

export interface FaceDetectionResult {
  faces: DetectedFace[];
  faceCount: number;
  // Legacy support - primary face (first detected)
  boundingBox: BoundingBox;
  landmarks: Point[];
  confidence: number;
}

export interface FaceDetectorConfig {
  maxFaces: number;
  minConfidence: number;
  skipFrames: number;
}

// Gaze estimation types
export interface HeadPose {
  pitch: number; // Rotation around X-axis (nodding up/down)
  yaw: number;   // Rotation around Y-axis (turning left/right)
  roll: number;  // Rotation around Z-axis (tilting head)
}

export type GazeDirection = 'center' | 'left' | 'right' | 'up' | 'down';

export interface GazeData {
  isLookingAtScreen: boolean;
  gazeDirection: GazeDirection;
  gazeStability: number; // 0-1 scale
  headPose: HeadPose;
  focusConfidence: number; // 0-1 scale, confidence in focus detection
  eyesDetected: boolean; // Whether both eyes are detected
  eyesInsideBoundingBox: boolean; // Whether both eyes are inside face bounding box
  leftEyePosition?: { x: number; y: number }; // Left eye center position
  rightEyePosition?: { x: number; y: number }; // Right eye center position
  leftEyeDetected?: boolean; // Whether left eye is detected
  rightEyeDetected?: boolean; // Whether right eye is detected
}

// Emotion classification types
export type EmotionCategory = 
  | 'focused' 
  | 'confused' 
  | 'bored' 
  | 'frustrated' 
  | 'happy' 
  | 'drowsy' 
  | 'neutral';

export interface EmotionResult {
  primaryEmotion: EmotionCategory;
  confidence: number;
  emotionScores: Record<EmotionCategory, number>;
}

// Object detection types
export type DetectedObjectType = 'cell phone' | 'book' | 'pen' | 'pencil' | 'other';

export interface ObjectDetectionResult {
  objectType: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface ObjectDetectorConfig {
  confidenceThreshold: number;
  frameSkip: number; // Process every N frames
}

// Audio analysis types
export interface AudioData {
  isSpeaking: boolean;
  audioLevel: number; // 0-100
  speechConfidence: number; // 0-1
  ambientNoiseLevel: number;
  isTeacherSpeaking?: boolean; // Only available when voice verification is enabled
  speakerSimilarity?: number; // 0-1, similarity to enrolled teacher voice
  unauthorizedSpeakerDetected?: boolean;
}

export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  speechEnergyThreshold?: number;
  speechFrequencyRange?: { min: number; max: number };
  updateInterval?: number; // milliseconds
  voiceVerificationEnabled?: boolean; // Enable teacher voice verification
  voiceSimilarityThreshold?: number; // Threshold for teacher voice match (0-1)
}

// Voice verification types
export interface VoiceProfile {
  id?: string;
  name?: string;
  embedding?: number[];
  pitchMean: number;
  pitchStd: number;
  mfcc: number[]; // Mel-frequency cepstral coefficients
  spectralCentroid: number;
  zeroCrossingRate: number;
  formants: number[]; // First 3 formant frequencies
  enrollmentDuration: number; // Duration of enrollment in seconds
  timestamp: number; // When profile was created
  confidence?: number;
  createdAt?: number;
}

export interface VoiceEnrollmentProgress {
  isEnrolling: boolean;
  progress: number; // 0-1 or 0-100
  remainingSeconds?: number;
  samplesCollected: number;
  samplesRequired?: number;
  requiredSamples?: number;
  currentPhase?: 'recording' | 'processing' | 'complete' | 'error';
  message?: string;
}

export type AudioEventType = 
  | 'speech_detected'
  | 'speech_ended'
  | 'unauthorized_speaker_detected'
  | 'teacher_voice_detected'
  | 'noise_detected';

// Behavior classification types
export type BehaviorClass = 
  | 'focused_on_screen'
  | 'looking_away'
  | 'speaking'
  | 'note_taking'
  | 'no_face_detected'
  | 'phone_detected';

export interface BehaviorResult {
  behaviorClass: BehaviorClass;
  confidence: number;
  timestamp: number;
  // Multi-label support
  primaryBehavior: BehaviorClass; // Main engagement state (focused/looking_away/no_face/phone)
  isSpeaking: boolean; // Whether speaking is detected (can be simultaneous)
  speakingConfidence?: number; // Confidence for speaking detection
}

export interface BehaviorClassifierConfig {
  minFaceConfidence: number;
  minSpeechConfidence: number;
  minObjectConfidence: number;
  noteTakingPitchThreshold: number;
  smoothingWindowSize: number;
  updateInterval: number;
}

// Engagement scoring types
export type EngagementLevel = 'high' | 'medium' | 'low' | 'disengaged';
export type EngagementTrend = 'increasing' | 'stable' | 'decreasing';

export interface EngagementScore {
  score: number; // 0-100
  level: EngagementLevel;
  trend: EngagementTrend;
}

export interface EngagementDataPoint {
  timestamp: number;
  score: number;
  level: EngagementLevel;
  contributingBehavior: BehaviorClass;
}

export interface EngagementScorerConfig {
  emaAlpha?: number;
  trendWindowSeconds?: number;
  historyDurationSeconds?: number;
  updateIntervalSeconds?: number;
}

// Privacy control types
export interface PrivacyConfig {
  anonymizationEnabled: boolean;
  blurIntensity: number;
  complianceMessage: string;
}

export interface PrivacyStatus {
  anonymizationEnabled: boolean;
  noDataStored: boolean;
  noNetworkRequests: boolean;
  localProcessingOnly: boolean;
  complianceVerified: boolean;
}

// Mode management types
export type OperationMode = 'classroom' | 'exam';

// Timeline data for visualization
export interface TimelineDataPoint {
  timestamp: number;
  engagement: number;
  behavior: string;
  confidence: number;
  isAlert?: boolean;
  score?: number;
  engagementScore?: number;
}

// Output types for different modes
export interface ClassroomOutput {
  mode: 'classroom';
  students: Array<{
    id: string;
    boundingBox: BoundingBox;
    state: string; // Behavior state
    engagement: number; // 0-100
    attentionTarget: string;
    confidence: number;
  }>;
  timestamp: number;
  averageEngagement: number;
  alerts: Array<{
    type: string;
    studentId: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  // Legacy fields for backward compatibility
  behavior_label?: string;
  engagement_score?: number;
  event_alert?: string;
}

export interface ExamOutput {
  mode: 'exam';
  students: Array<{
    id: string;
    boundingBox: BoundingBox;
    suspiciousActivity: string | null;
    confidenceLevel: number;
    gazePattern: string;
  }>;
  timestamp: number;
  overallSuspicionLevel: number;
  violations: Array<{
    type: string;
    studentId: string;
    description: string;
    timestamp: number;
  }>;
  // Legacy fields for backward compatibility
  event_type?: string;
  count?: number;
}
