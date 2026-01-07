/**
 * StudyEye Services Index
 * 
 * Central export point for all StudyEye services
 */

// Audio
export { AudioAnalyzer } from './audioAnalyzer';

// Model Loading
export { modelLoader } from './modelLoader';

// AI Services
export { faceDetector } from './faceDetector';
export { gazeEstimator } from './gazeEstimator';
export { emotionClassifier } from './emotionClassifier';
export { objectDetector } from './objectDetector';

// New comprehensive services
export { headPoseEstimator } from './headPoseEstimator';
export { emotionRecognizer } from './emotionRecognizer';
export { multiStudentTracker } from './multiStudentTracker';
export { temporalBehaviorEngine } from './temporalBehaviorEngine';
export { backendEmotionService } from './backendEmotionService';

// Behavior Classification
export { behaviorClassifier, BehaviorClassifier } from './behaviorClassifier';

// Engagement Scoring
export { EngagementScorer, getEngagementScorer, resetEngagementScorer } from './engagementScorer';

// Temporal Analysis
export { TemporalAnalyzer, getTemporalAnalyzer, resetTemporalAnalyzer } from './temporalAnalyzer';

// Mode Management
export { ModeManager, getModeManager, resetModeManager } from './modeManager';

// Privacy Controls
export { PrivacyController } from './privacyController';

// Processing Orchestration
export { processingOrchestrator } from './processingOrchestrator';
export type { ProcessingState, OrchestratorConfig } from './processingOrchestrator';

// Performance Monitoring
export { performanceMonitor } from './performanceMonitor';
export type { PerformanceMetrics, PerformanceConfig } from './performanceMonitor';

// Error Handling
export { errorHandler } from './errorHandler';
export type { ErrorInfo, ErrorType, ErrorSeverity, RetryConfig } from './errorHandler';

// Type exports
export type { 
  BehaviorClass, 
  BehaviorResult, 
  BehaviorClassifierConfig 
} from './behaviorClassifier';

export type { GazeData, GazeDirection, HeadPose } from './gazeEstimator';
export type { EmotionResult, EmotionCategory } from './emotionClassifier';
export type { 
  AudioData, 
  AudioAnalyzerConfig,
  VoiceProfile,
  VoiceEnrollmentProgress,
  AudioEventType
} from './audioAnalyzer';

export type { 
  EngagementScore, 
  EngagementLevel, 
  EngagementTrend,
  EngagementDataPoint,
  EngagementScorerConfig 
} from './engagementScorer';

export type { 
  AlertEvent, 
  AlertType, 
  AlertSeverity,
  TimelineDataPoint,
  TemporalAnalyzerConfig 
} from './temporalAnalyzer';

export type { 
  OperationMode,
  ClassroomOutput,
  ExamOutput,
  ExamEventType,
  ExamEventLog,
  ModeConfig 
} from './modeManager';

export type {
  PrivacyConfig,
  PrivacyStatus
} from './privacyController';

// New type exports
export type {
  StudentState,
  ClassroomState,
  Student3DPose,
  StudentEmotion,
  StudentAttention,
  StudentBehavior,
  StudentEngagement,
} from '../types/studentState';

export type {
  BehaviorAnalysis,
  BehaviorPattern,
  EngagementContext,
} from './temporalBehaviorEngine';

export type {
  CameraIntrinsics,
  HeadPoseConfig,
} from './headPoseEstimator';

export type {
  TrackerConfig,
} from './multiStudentTracker';

/**
 * Initialize all services including new multi-student tracking
 */
export async function initializeAllServices(
  videoElement: HTMLVideoElement,
  audioStream?: MediaStream
): Promise<void> {
  // Import dynamically to avoid circular dependency issues
  const { processingOrchestrator: orchestrator } = await import('./processingOrchestrator');
  
  try {
    await orchestrator.initialize(videoElement, audioStream || null);
    console.log('All StudyEye services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize StudyEye services:', error);
    throw error;
  }
}

/**
 * Reset all services to initial state
 */
export function resetAllServices(): void {
  // Import dynamically to avoid circular dependency issues
  import('./processingOrchestrator').then(({ processingOrchestrator: orchestrator }) => {
    orchestrator.reset();
    console.log('All StudyEye services reset');
  });
}
