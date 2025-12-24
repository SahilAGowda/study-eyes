/**
 * ProcessingOrchestrator Service
 * 
 * Coordinates all AI services in a unified processing pipeline.
 * Manages frame processing, audio analysis, and multimodal behavior classification.
 */

import { faceDetector } from './faceDetector';
import { gazeEstimator } from './gazeEstimator';
import { emotionClassifier } from './emotionClassifier';
import { objectDetector } from './objectDetector';
import { AudioAnalyzer } from './audioAnalyzer';
import { behaviorClassifier } from './behaviorClassifier';
import { getEngagementScorer } from './engagementScorer';
import { getTemporalAnalyzer } from './temporalAnalyzer';
import { getModeManager } from './modeManager';
import { multiStudentTracker } from './multiStudentTracker';
import { headPoseEstimator } from './headPoseEstimator';
import { temporalBehaviorEngine } from './temporalBehaviorEngine';
import type {
  FaceDetectionResult,
  GazeData,
  EmotionResult,
  ObjectDetectionResult,
  AudioData,
  BehaviorResult,
  EngagementScore,
  OperationMode,
  ClassroomOutput,
  ExamOutput,
  VoiceProfile,
  VoiceEnrollmentProgress,
} from '../types';
import type { ClassroomState } from '../types/studentState';
import type { BehaviorAnalysis } from './temporalBehaviorEngine';

export interface ProcessingState {
  isProcessing: boolean;
  fps: number;
  lastFrameTime: number;
  frameCount: number;
  faceDetection: FaceDetectionResult | null;
  gazeResult: GazeData | null;
  emotionResult: EmotionResult | null;
  objectDetections: ObjectDetectionResult[];
  audioActivity: AudioData | null;
  behaviorResult: BehaviorResult | null;
  engagementScore: EngagementScore | null;
  
  // Multi-student state
  classroomState: ClassroomState | null;
  behaviorAnalyses: Map<string, BehaviorAnalysis> | null;
}

export interface OrchestratorConfig {
  targetFPS: number;
  behaviorUpdateInterval: number; // ms
  audioUpdateInterval: number; // ms
  performanceMonitoring: boolean;
  voiceVerificationEnabled: boolean;
  voiceSimilarityThreshold: number;
  
  // Multi-student tracking config
  enableMultiStudentTracking: boolean;
  maxStudents: number;
  temporalAnalysisEnabled: boolean;
}

/**
 * ProcessingOrchestrator coordinates all AI services
 */
class ProcessingOrchestrator {
  private config: OrchestratorConfig = {
    targetFPS: 15,
    behaviorUpdateInterval: 3000,
    audioUpdateInterval: 100,
    performanceMonitoring: true,
    voiceVerificationEnabled: false,
    voiceSimilarityThreshold: 0.7,
    enableMultiStudentTracking: true,
    maxStudents: 20,
    temporalAnalysisEnabled: true,
  };

  private state: ProcessingState = {
    isProcessing: false,
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    faceDetection: null,
    gazeResult: null,
    emotionResult: null,
    objectDetections: [],
    audioActivity: null,
    behaviorResult: null,
    engagementScore: null,
    classroomState: null,
    behaviorAnalyses: null,
  };

  private videoElement: HTMLVideoElement | null = null;
  private audioStream: MediaStream | null = null;
  private audioAnalyzer: AudioAnalyzer | null = null;
  private animationFrameId: number | null = null;
  private audioIntervalId: number | null = null;
  private behaviorIntervalId: number | null = null;
  private fpsIntervalId: number | null = null;

  private stateUpdateCallback: ((state: ProcessingState) => void) | null = null;

  /**
   * Initialize the orchestrator with video and audio streams
   */
  public async initialize(
    videoElement: HTMLVideoElement,
    audioStream: MediaStream | null = null
  ): Promise<void> {
    this.videoElement = videoElement;
    this.audioStream = audioStream;

    try {
      // Initialize all AI services
      await Promise.all([
        faceDetector.initialize(),
        objectDetector.initialize?.() || Promise.resolve(),
      ]);

      // Initialize head pose estimator with video dimensions
      headPoseEstimator.initialize(videoElement.videoWidth, videoElement.videoHeight);

      // Initialize audio analyzer if stream is available
      if (audioStream) {
        this.audioAnalyzer = new AudioAnalyzer({
          voiceVerificationEnabled: this.config.voiceVerificationEnabled,
          voiceSimilarityThreshold: this.config.voiceSimilarityThreshold,
        });
        await this.audioAnalyzer.initializeAudio(audioStream);
        
        if (this.config.voiceVerificationEnabled) {
          this.setupVoiceVerificationEvents();
        }
      }

      console.log('ProcessingOrchestrator initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize ProcessingOrchestrator: ${errorMessage}`);
    }
  }

  /**
   * Start processing pipeline (alias for startProcessing)
   */
  public start(): void {
    this.startProcessing();
  }

  /**
   * Stop processing pipeline (alias for stopProcessing)
   */
  public stop(): void {
    this.stopProcessing();
  }

  /**
   * Start processing pipeline
   */
  public startProcessing(): void {
    if (this.state.isProcessing || !this.videoElement) {
      return;
    }

    this.state.isProcessing = true;
    this.state.lastFrameTime = performance.now();
    this.state.frameCount = 0;

    // Start video processing loop
    this.processVideoFrame();

    // Start audio processing if available
    if (this.audioAnalyzer) {
      this.startAudioProcessing();
    }

    // Start behavior classification updates
    this.startBehaviorUpdates();

    // Start FPS monitoring
    if (this.config.performanceMonitoring) {
      this.startFPSMonitoring();
    }

    console.log('Processing started');
  }

  /**
   * Stop processing pipeline
   */
  public stopProcessing(): void {
    this.state.isProcessing = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioIntervalId) {
      clearInterval(this.audioIntervalId);
      this.audioIntervalId = null;
    }

    if (this.behaviorIntervalId) {
      clearInterval(this.behaviorIntervalId);
      this.behaviorIntervalId = null;
    }

    if (this.fpsIntervalId) {
      clearInterval(this.fpsIntervalId);
      this.fpsIntervalId = null;
    }

    console.log('Processing stopped');
  }

  /**
   * Main video processing loop
   */
  private async processVideoFrame(): Promise<void> {
    if (!this.state.isProcessing || !this.videoElement) {
      return;
    }

    try {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.state.lastFrameTime;

      // Throttle to target FPS
      const targetFrameTime = 1000 / this.config.targetFPS;
      if (deltaTime < targetFrameTime) {
        this.animationFrameId = requestAnimationFrame(() => this.processVideoFrame());
        return;
      }

      this.state.lastFrameTime = currentTime;
      this.state.frameCount++;

      // Check if video is ready
      if (this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
        this.animationFrameId = requestAnimationFrame(() => this.processVideoFrame());
        return;
      }

      // Face detection (primary input)
      const faceDetection = await faceDetector.detectFaces(this.videoElement);
      this.state.faceDetection = faceDetection;

      if (this.config.enableMultiStudentTracking) {
        // Multi-student processing pipeline
        await this.processMultiStudentFrame(faceDetection);
      } else {
        // Legacy single-student processing
        await this.processSingleStudentFrame(faceDetection);
      }

      // Object detection (less frequent)
      if (this.state.frameCount % 5 === 0) {
        try {
          this.state.objectDetections = await objectDetector.detectObjects(this.videoElement);
        } catch (error) {
          console.warn('Object detection failed:', error);
          this.state.objectDetections = [];
        }
      }

      // Notify state update
      this.notifyStateUpdate();

    } catch (error) {
      console.error('Error in video processing:', error);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.processVideoFrame());
  }

  /**
   * Process frame with multi-student tracking
   */
  private async processMultiStudentFrame(faceDetection: FaceDetectionResult): Promise<void> {
    try {
      // Update multi-student tracker
      const classroomState = await multiStudentTracker.processFrame(faceDetection.faces);
      this.state.classroomState = classroomState;

      // Perform temporal behavior analysis
      if (this.config.temporalAnalysisEnabled) {
        const behaviorAnalyses = temporalBehaviorEngine.analyzeBehaviorPatterns(classroomState);
        this.state.behaviorAnalyses = behaviorAnalyses;
      }

      // Update legacy state for backward compatibility (use first active student)
      const firstActiveStudent = Array.from(classroomState.students.values()).find(s => s.isActive);
      if (firstActiveStudent) {
        this.updateLegacyStateFromStudent(firstActiveStudent);
      } else {
        this.clearLegacyState();
      }

    } catch (error) {
      console.error('Multi-student processing error:', error);
      this.state.classroomState = null;
      this.state.behaviorAnalyses = null;
    }
  }

  /**
   * Process frame with single-student tracking (legacy)
   */
  private async processSingleStudentFrame(faceDetection: FaceDetectionResult): Promise<void> {
    if (faceDetection.faces.length === 0) {
      this.clearLegacyState();
      return;
    }

    const primaryFace = faceDetection.faces[0];

    try {
      // Gaze estimation
      this.state.gazeResult = gazeEstimator.estimateGaze(primaryFace.landmarks);

      // Emotion recognition
      this.state.emotionResult = emotionClassifier.classifyEmotion(primaryFace.landmarks);

    } catch (error) {
      console.error('Single-student processing error:', error);
    }
  }

  /**
   * Update legacy state from student data for backward compatibility
   */
  private updateLegacyStateFromStudent(student: any): void {
    this.state.gazeResult = {
      isLookingAtScreen: student.attention.target !== 'off_task',
      gazeDirection: 'center',
      gazeStability: student.attention.gazeStability,
      headPose: {
        pitch: student.pose.pitch,
        yaw: student.pose.yaw,
        roll: student.pose.roll
      },
      focusConfidence: student.attention.confidence,
      eyesDetected: true,
      eyesInsideBoundingBox: true,
      leftEyePosition: student.attention.gazePoint,
      rightEyePosition: student.attention.gazePoint
    };

    this.state.emotionResult = {
      primaryEmotion: student.emotion.primaryEmotion as any,
      confidence: student.emotion.confidence,
      emotionScores: student.emotion.emotions as any
    };

    this.state.engagementScore = {
      score: student.engagement.score,
      level: student.engagement.level,
      trend: student.engagement.trend
    };
  }

  /**
   * Clear legacy state when no students detected
   */
  private clearLegacyState(): void {
    this.state.gazeResult = null;
    this.state.emotionResult = null;
    this.state.behaviorResult = null;
    this.state.engagementScore = null;
  }

  /**
   * Start audio processing loop
   */
  private startAudioProcessing(): void {
    if (!this.audioAnalyzer) return;

    this.audioIntervalId = window.setInterval(() => {
      try {
        if (this.audioAnalyzer) {
          this.state.audioActivity = this.audioAnalyzer.getAudioData();
        }
      } catch (error) {
        console.error('Audio processing error:', error);
        this.state.audioActivity = null;
      }
    }, this.config.audioUpdateInterval);
  }

  /**
   * Start behavior classification updates
   */
  private startBehaviorUpdates(): void {
    this.behaviorIntervalId = window.setInterval(async () => {
      try {
        if (!this.config.enableMultiStudentTracking) {
          // Legacy behavior classification
          if (
            this.state.faceDetection &&
            this.state.gazeResult &&
            this.state.emotionResult &&
            this.state.audioActivity
          ) {
            this.state.behaviorResult = behaviorClassifier.classifyBehavior(
              this.state.faceDetection,
              this.state.gazeResult,
              this.state.emotionResult,
              this.state.audioActivity,
              this.state.objectDetections
            );

            if (this.state.behaviorResult) {
              const engagementScorer = getEngagementScorer();
              engagementScorer.updateScore(this.state.behaviorResult);
              this.state.engagementScore = engagementScorer.getCurrentScore();

              if (this.state.engagementScore) {
                const temporalAnalyzer = getTemporalAnalyzer();
                const dataPoint = {
                  timestamp: Date.now(),
                  score: this.state.engagementScore.score,
                  level: this.state.engagementScore.level,
                  contributingBehavior: this.state.behaviorResult.behaviorClass,
                };
                temporalAnalyzer.addDataPoint(dataPoint);
              }
            }
          }
        }
      } catch (error) {
        console.error('Behavior classification error:', error);
      }
    }, this.config.behaviorUpdateInterval);
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    let lastFrameCount = 0;

    this.fpsIntervalId = window.setInterval(() => {
      const framesDelta = this.state.frameCount - lastFrameCount;
      this.state.fps = framesDelta;
      lastFrameCount = this.state.frameCount;
    }, 1000);
  }

  /**
   * Set state update callback
   */
  public onStateUpdate(callback: (state: ProcessingState) => void): () => void {
    this.stateUpdateCallback = callback;
    return () => {
      this.stateUpdateCallback = null;
    };
  }

  /**
   * Notify state update
   */
  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }

  /**
   * Get current processing state
   */
  public getState(): ProcessingState {
    return { ...this.state };
  }

  /**
   * Get formatted output based on current mode
   */
  public getOutput(mode: OperationMode): ClassroomOutput | ExamOutput {
    const temporalAnalyzer = getTemporalAnalyzer();
    const alerts = temporalAnalyzer.getAlerts();
    const latestAlert = alerts.length > 0 ? alerts[alerts.length - 1] : null;
    
    if (!this.state.behaviorResult || !this.state.engagementScore) {
      if (mode === 'classroom') {
        return {
          mode: 'classroom',
          students: [],
          timestamp: Date.now(),
          averageEngagement: 0,
          alerts: [],
          behavior_label: 'Initializing...',
          engagement_score: 0,
        };
      } else {
        return {
          mode: 'exam',
          students: [],
          timestamp: Date.now(),
          overallSuspicionLevel: 0,
          violations: [],
          event_type: 'none',
          count: 0,
        };
      }
    }
    
    const modeManager = getModeManager(mode);
    const modeOutput = modeManager.formatOutput(
      this.state.behaviorResult,
      this.state.engagementScore,
      latestAlert
    );
    
    // Convert modeManager output to our types
    if (mode === 'classroom') {
      return {
        mode: 'classroom',
        students: [],
        timestamp: modeOutput.timestamp,
        averageEngagement: this.state.engagementScore.score,
        alerts: [],
        behavior_label: (modeOutput as any).behavior_label,
        engagement_score: (modeOutput as any).engagement_score,
      };
    } else {
      return {
        mode: 'exam',
        students: [],
        timestamp: modeOutput.timestamp,
        overallSuspicionLevel: 0,
        violations: [],
        event_type: (modeOutput as any).event_type,
        count: (modeOutput as any).count,
      };
    }
  }

  /**
   * Get classroom output for API
   */
  public getClassroomOutput(): ClassroomOutput | null {
    if (!this.state.classroomState) return null;

    const students = Array.from(this.state.classroomState.students.values())
      .filter(s => s.isActive)
      .map(student => ({
        id: student.id.id,
        boundingBox: student.boundingBox,
        state: student.behavior.primaryBehavior,
        engagement: student.engagement.score,
        attentionTarget: student.attention.target,
        confidence: student.trackingConfidence
      }));

    return {
      mode: 'classroom',
      students,
      timestamp: this.state.classroomState.timestamp,
      averageEngagement: this.state.classroomState.averageEngagement,
      alerts: this.state.classroomState.alerts.map(alert => ({
        type: alert.type,
        studentId: alert.studentId || '',
        message: alert.message,
        severity: alert.severity
      }))
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Reset all processing state
   */
  public reset(): void {
    this.stopProcessing();
    
    // Reset all services
    multiStudentTracker.reset();
    temporalBehaviorEngine.reset();
    headPoseEstimator.reset();
    
    const temporalAnalyzer = getTemporalAnalyzer();
    const engagementScorer = getEngagementScorer();
    temporalAnalyzer.reset();
    engagementScorer.reset();
    
    // Reset state
    this.state = {
      isProcessing: false,
      fps: 0,
      lastFrameTime: 0,
      frameCount: 0,
      faceDetection: null,
      gazeResult: null,
      emotionResult: null,
      objectDetections: [],
      audioActivity: null,
      behaviorResult: null,
      engagementScore: null,
      classroomState: null,
      behaviorAnalyses: null,
    };
  }

  /**
   * Dispose and cleanup
   */
  public dispose(): void {
    this.reset();
    if (this.audioAnalyzer) {
      this.audioAnalyzer.stopAudio();
      this.audioAnalyzer = null;
    }
    this.videoElement = null;
    this.audioStream = null;
  }

  // Voice Verification Methods

  /**
   * Enable voice verification
   */
  public enableVoiceVerification(threshold: number = 0.7): void {
    this.config.voiceVerificationEnabled = true;
    this.config.voiceSimilarityThreshold = threshold;
    
    if (this.audioAnalyzer) {
      this.setupVoiceVerificationEvents();
    }
  }

  /**
   * Disable voice verification
   */
  public disableVoiceVerification(): void {
    this.config.voiceVerificationEnabled = false;
    if (this.audioAnalyzer) {
      this.audioAnalyzer.clearTeacherVoiceProfile();
    }
  }

  /**
   * Enroll teacher voice
   */
  public async enrollTeacherVoice(duration: number = 12): Promise<VoiceProfile> {
    if (!this.audioAnalyzer) {
      throw new Error('Audio analyzer not initialized');
    }
    
    const profile = await this.audioAnalyzer.enrollTeacherVoice(duration);
    this.config.voiceVerificationEnabled = true;
    return profile;
  }

  /**
   * Get enrollment progress
   */
  public getEnrollmentProgress(): VoiceEnrollmentProgress {
    if (!this.audioAnalyzer) {
      return {
        isEnrolling: false,
        progress: 0,
        remainingSeconds: 0,
        samplesCollected: 0,
        requiredSamples: 0,
      };
    }
    return this.audioAnalyzer.getEnrollmentProgress();
  }

  /**
   * Check if teacher voice is enrolled
   */
  public hasTeacherVoiceProfile(): boolean {
    return this.audioAnalyzer?.hasTeacherVoiceProfile() ?? false;
  }

  /**
   * Clear teacher voice profile
   */
  public clearTeacherVoiceProfile(): void {
    this.audioAnalyzer?.clearTeacherVoiceProfile();
  }

  /**
   * Check if teacher is currently speaking
   */
  public isTeacherSpeaking(): boolean {
    return this.audioAnalyzer?.isTeacherSpeaking() ?? false;
  }

  /**
   * Set up voice verification event listeners
   */
  private setupVoiceVerificationEvents(): void {
    if (!this.audioAnalyzer) return;

    this.audioAnalyzer.on('unauthorized_speaker_detected', (data: any) => {
      console.warn('⚠️ Unauthorized speaker detected:', data);
    });

    this.audioAnalyzer.on('teacher_voice_detected', (data: any) => {
      console.log('✅ Teacher voice detected:', data);
    });
  }
}

// Export singleton instance
export const processingOrchestrator = new ProcessingOrchestrator();

// Export class for custom instances
export default ProcessingOrchestrator;
