/**
 * BehaviorClassifier Service
 * 
 * Combines multimodal inputs (video, audio, gaze, emotion, objects) to classify
 * student behavior into 6 distinct categories with temporal smoothing.
 * 
 * Behavior Classes:
 * 1. Focused on Screen - Both eyes detected + inside bounding box
 * 2. Looking Away / Distracted - One eye detected OR eyes outside box OR no eyes
 * 3. Speaking Detected - Audio activity detected
 * 4. Note-taking / writing motion - Head down + writing objects detected
 * 5. No Face Detected - No face in frame
 * 6. Phone / unauthorized object detected - Phone object detected
 */

import type { 
  FaceDetectionResult, 
  GazeData, 
  EmotionResult, 
  AudioData, 
  ObjectDetectionResult 
} from '../types';

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
  // Confidence thresholds
  minFaceConfidence: number;
  minSpeechConfidence: number;
  minObjectConfidence: number;
  
  // Head pose thresholds for note-taking
  noteTakingPitchThreshold: number; // degrees (negative = looking down)
  
  // Temporal smoothing
  smoothingWindowSize: number;
  updateInterval: number; // milliseconds (3-5 seconds)
}

const DEFAULT_CONFIG: BehaviorClassifierConfig = {
  minFaceConfidence: 0.7,  // Increased to 0.7 to ensure reliable face detection
  minSpeechConfidence: 0.6,
  minObjectConfidence: 0.5,
  noteTakingPitchThreshold: -15, // Looking down 15+ degrees
  smoothingWindowSize: 3,  // Reduced for faster reaction
  updateInterval: 1500, // 1.5 seconds delay before status change (FAST REACTION)
};

/**
 * BehaviorClassifier combines multimodal inputs to classify student behavior
 */
export class BehaviorClassifier {
  private config: BehaviorClassifierConfig;
  private behaviorHistory: BehaviorResult[] = [];
  private lastUpdateTime: number = 0;
  private lastBehaviorResult: BehaviorResult | null = null;
  
  // Temporal state tracking for 3-second delay
  private currentState: BehaviorClass = 'no_face_detected';
  private pendingState: BehaviorClass | null = null;
  private stateChangeStartTime: number = 0;
  private consecutiveStateCount: Map<BehaviorClass, number> = new Map();

  constructor(config?: Partial<BehaviorClassifierConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Classify behavior from combined multimodal inputs
   * Implements 1.5-second delay before state changes to avoid flicker
   * SUPPORTS MULTI-LABEL: Speaking can be detected simultaneously with other states
   * 
   * @param videoData - Face detection result
   * @param gazeData - Gaze estimation data
   * @param emotionData - Emotion classification result
   * @param audioData - Audio analysis data
   * @param objectData - Object detection results
   * @returns Behavior classification result with multi-label support
   */
  public classifyBehavior(
    videoData: FaceDetectionResult,
    gazeData: GazeData,
    emotionData: EmotionResult,
    audioData: AudioData,
    objectData: ObjectDetectionResult[]
  ): BehaviorResult {
    const currentTime = Date.now();

    // Get the immediate classification (what the system sees right now)
    const immediateResult = this.performClassification(
      videoData,
      gazeData,
      emotionData,
      audioData,
      objectData,
      currentTime
    );

    // Implement 1.5-second delay logic for primary behavior
    const finalBehavior = this.applyTemporalDelay(immediateResult, currentTime);

    // MULTI-LABEL: Speaking is detected independently and immediately (no delay)
    const isSpeaking = audioData.isSpeaking && audioData.speechConfidence >= this.config.minSpeechConfidence;
    
    // Combine primary behavior with speaking status
    const multiLabelResult: BehaviorResult = {
      ...finalBehavior,
      primaryBehavior: finalBehavior.behaviorClass === 'speaking' ? 'focused_on_screen' : finalBehavior.behaviorClass,
      isSpeaking,
      speakingConfidence: isSpeaking ? audioData.speechConfidence : undefined,
    };

    // Update history for smoothing
    this.updateBehaviorHistory(multiLabelResult);

    // Store and return result
    this.lastBehaviorResult = multiLabelResult;
    this.lastUpdateTime = currentTime;

    return multiLabelResult;
  }

  /**
   * Apply 1.5-second delay before changing state (FAST REACTION)
   * If user briefly looks away, don't immediately switch
   * EXCEPTION: Critical states (no_face_detected, phone_detected, looking_away) change faster
   */
  private applyTemporalDelay(
    immediateResult: BehaviorResult,
    currentTime: number
  ): BehaviorResult {
    const newState = immediateResult.behaviorClass;

    // CRITICAL STATES: Change immediately without delay
    const criticalStates: BehaviorClass[] = ['no_face_detected', 'phone_detected'];
    if (criticalStates.includes(newState)) {
      this.currentState = newState;
      this.pendingState = null;
      this.stateChangeStartTime = 0;
      return immediateResult;
    }

    // FAST REACTION for looking_away: Use shorter delay (1 second instead of 1.5)
    const fastReactionStates: BehaviorClass[] = ['looking_away'];
    const delayTime = fastReactionStates.includes(newState) ? 1000 : this.config.updateInterval;

    // If transitioning FROM a critical state TO a normal state, also change immediately
    if (criticalStates.includes(this.currentState)) {
      this.currentState = newState;
      this.pendingState = null;
      this.stateChangeStartTime = 0;
      return immediateResult;
    }

    // If this is the same as current state, reset any pending change
    if (newState === this.currentState) {
      this.pendingState = null;
      this.stateChangeStartTime = 0;
      return {
        ...immediateResult,
        behaviorClass: this.currentState,
        primaryBehavior: this.currentState === 'speaking' ? 'focused_on_screen' : this.currentState,
        isSpeaking: false,
      };
    }

    // If we have a pending state change
    if (this.pendingState === newState) {
      // Check if enough time has passed (1-1.5 seconds depending on state)
      const elapsedTime = currentTime - this.stateChangeStartTime;
      
      if (elapsedTime >= delayTime) {
        // Commit the state change
        this.currentState = newState;
        this.pendingState = null;
        this.stateChangeStartTime = 0;
        return immediateResult;
      } else {
        // Still waiting, return current state
        return {
          ...immediateResult,
          behaviorClass: this.currentState,
          primaryBehavior: this.currentState === 'speaking' ? 'focused_on_screen' : this.currentState,
          isSpeaking: false,
        };
      }
    } else {
      // New state detected, start the timer
      this.pendingState = newState;
      this.stateChangeStartTime = currentTime;
      
      // Return current state while we wait
      return {
        ...immediateResult,
        behaviorClass: this.currentState,
        primaryBehavior: this.currentState === 'speaking' ? 'focused_on_screen' : this.currentState,
        isSpeaking: false,
      };
    }
  }

  /**
   * Perform behavior classification based on multimodal inputs
   * Priority order: Phone > No Face > Speaking > Note-taking > Looking Away > Focused
   * 
   * NEW: Eye-based focus detection
   * - Both eyes detected AND inside box → Focused
   * - One eye detected OR outside box → Looking Away (Partially Distracted)
   * - No eyes detected → Looking Away (Distracted)
   * - No face detected → No Face Detected
   */
  private performClassification(
    videoData: FaceDetectionResult,
    gazeData: GazeData,
    emotionData: EmotionResult,
    audioData: AudioData,
    objectData: ObjectDetectionResult[],
    timestamp: number
  ): BehaviorResult {
    // Priority 1: Phone detected (highest priority - exam integrity)
    const phoneDetected = this.isPhoneDetected(objectData);
    if (phoneDetected.detected) {
      return {
        behaviorClass: 'phone_detected',
        confidence: phoneDetected.confidence,
        timestamp,
        primaryBehavior: 'phone_detected',
        isSpeaking: false,
      };
    }

    // Priority 2: No face detected
    // CRITICAL: Check if face is actually present in frame
    // If faceCount is 0, definitely no face
    if (videoData.faceCount === 0) {
      return {
        behaviorClass: 'no_face_detected',
        confidence: 1.0, // 100% confident there's no face
        timestamp,
        primaryBehavior: 'no_face_detected',
        isSpeaking: false,
      };
    }

    // If face count > 0 but confidence is below threshold, still proceed with classification
    // but use lower confidence scores for behaviors
    const hasGoodConfidence = videoData.confidence >= this.config.minFaceConfidence;

    // NOTE: Speaking is now handled separately as a multi-label (not primary behavior)
    // It will be detected independently and shown alongside the primary state

    // Priority 3: Note-taking / writing motion
    const noteTaking = this.isNoteTaking(gazeData, objectData);
    if (noteTaking.detected) {
      return {
        behaviorClass: 'note_taking',
        confidence: noteTaking.confidence,
        timestamp,
        primaryBehavior: 'note_taking',
        isSpeaking: false,
      };
    }

    // Priority 4: Looking away / distracted
    // ENHANCED EYE + GAZE DIRECTION LOGIC:
    // - No eyes detected → Looking Away (95% confidence)
    // - Gaze direction is NOT "center" → Looking Away (80% confidence)
    // - One eye detected OR outside box → Looking Away (70% confidence)
    // - Both eyes detected AND inside box AND gaze centered → Focused (proceed to focused state)
    
    // Check for no eyes detected first (highest priority for distraction)
    if (!gazeData.eyesDetected) {
      return {
        behaviorClass: 'looking_away',
        confidence: 0.95, // Very high confidence - no eyes visible
        timestamp,
        primaryBehavior: 'looking_away',
        isSpeaking: false,
      };
    }
    
    // Check gaze direction - if not looking at center, user is distracted
    if (gazeData.gazeDirection !== 'center') {
      return {
        behaviorClass: 'looking_away',
        confidence: 0.80, // High confidence - gaze direction indicates looking away
        timestamp,
        primaryBehavior: 'looking_away',
        isSpeaking: false,
      };
    }
    
    // Check if eyes are outside bounding box or only one eye detected
    if (!gazeData.eyesInsideBoundingBox) {
      return {
        behaviorClass: 'looking_away',
        confidence: 0.70, // Medium-high confidence - eyes outside box
        timestamp,
        primaryBehavior: 'looking_away',
        isSpeaking: false,
      };
    }
    
    // If we reach here: both eyes detected AND inside box AND gaze centered → Focused

    // Default: Focused on screen
    // Face detected + both eyes inside bounding box
    const focusConfidence = this.calculateFocusConfidence(
      videoData,
      gazeData,
      emotionData,
      hasGoodConfidence
    );

    return {
      behaviorClass: 'focused_on_screen',
      confidence: focusConfidence,
      timestamp,
      primaryBehavior: 'focused_on_screen',
      isSpeaking: false,
    };
  }

  /**
   * Check if phone is detected in object detections
   */
  private isPhoneDetected(objectData: ObjectDetectionResult[]): { 
    detected: boolean; 
    confidence: number 
  } {
    const phoneDetections = objectData.filter(
      obj => obj.objectType === 'cell phone' && 
             obj.confidence >= this.config.minObjectConfidence
    );

    if (phoneDetections.length > 0) {
      // Use highest confidence phone detection
      const maxConfidence = Math.max(...phoneDetections.map(d => d.confidence));
      return { detected: true, confidence: maxConfidence };
    }

    return { detected: false, confidence: 0 };
  }

  /**
   * Check if user is note-taking based on head pose and writing objects
   */
  private isNoteTaking(
    gazeData: GazeData,
    objectData: ObjectDetectionResult[]
  ): { detected: boolean; confidence: number } {
    // Check if head is tilted down (looking at desk/paper)
    const headDown = gazeData.headPose.pitch < this.config.noteTakingPitchThreshold;

    // Check if writing-related objects are detected
    const writingObjects = objectData.filter(
      obj => ['book', 'pen', 'pencil'].includes(obj.objectType) &&
             obj.confidence >= this.config.minObjectConfidence
    );

    const hasWritingObjects = writingObjects.length > 0;

    // Note-taking requires head down AND writing objects detected
    if (headDown && hasWritingObjects) {
      // Calculate confidence based on head pose angle and object confidence
      const headPoseConfidence = Math.min(
        Math.abs(gazeData.headPose.pitch / 45), // Normalize to 0-1
        1.0
      );
      const objectConfidence = Math.max(...writingObjects.map(o => o.confidence));
      const combinedConfidence = (headPoseConfidence * 0.4 + objectConfidence * 0.6);
      
      return { detected: true, confidence: combinedConfidence };
    }

    // Head down alone (without writing objects) suggests note-taking with lower confidence
    if (headDown) {
      const headPoseConfidence = Math.min(
        Math.abs(gazeData.headPose.pitch / 45),
        1.0
      );
      return { detected: true, confidence: headPoseConfidence * 0.6 };
    }

    return { detected: false, confidence: 0 };
  }

  /**
   * Calculate confidence for "focused on screen" behavior
   */
  private calculateFocusConfidence(
    videoData: FaceDetectionResult,
    gazeData: GazeData,
    emotionData: EmotionResult,
    hasGoodConfidence: boolean
  ): number {
    // Use gaze-based focus confidence as the primary indicator
    const focusConfidence = gazeData.focusConfidence;
    
    // Combine multiple factors for focus confidence
    const faceConfidence = hasGoodConfidence ? videoData.confidence : videoData.confidence * 0.8;
    const gazeStability = gazeData.gazeStability;
    
    // Emotion contributes to focus confidence
    let emotionFactor = 0.5; // Neutral default
    if (emotionData.primaryEmotion === 'focused') {
      emotionFactor = 0.9;
    } else if (emotionData.primaryEmotion === 'neutral') {
      emotionFactor = 0.7;
    } else if (emotionData.primaryEmotion === 'happy') {
      emotionFactor = 0.6;
    } else if (['confused', 'bored', 'frustrated', 'drowsy'].includes(emotionData.primaryEmotion)) {
      emotionFactor = 0.3;
    }

    // Weighted combination - both eyes detected is most important
    const confidence = (
      faceConfidence * 0.2 +        // Face detection quality
      focusConfidence * 0.4 +        // Eye detection (MOST IMPORTANT)
      gazeStability * 0.2 +          // Gaze stability over time
      emotionFactor * 0.2            // Emotional state
    );

    return Math.min(confidence, 1.0);
  }

  /**
   * Update behavior history for temporal smoothing
   */
  private updateBehaviorHistory(behavior: BehaviorResult): void {
    this.behaviorHistory.push(behavior);

    // Keep only recent history
    if (this.behaviorHistory.length > this.config.smoothingWindowSize) {
      this.behaviorHistory.shift();
    }
  }

  /**
   * Get smoothed behavior using majority voting from recent history
   */
  private getSmoothedBehavior(): BehaviorResult {
    if (this.behaviorHistory.length === 0) {
      return {
        behaviorClass: 'no_face_detected',
        confidence: 0,
        timestamp: Date.now(),
        primaryBehavior: 'no_face_detected',
        isSpeaking: false,
      };
    }

    // Count occurrences of each behavior class
    const behaviorCounts: Partial<Record<BehaviorClass, number>> = {};
    const behaviorConfidences: Partial<Record<BehaviorClass, number[]>> = {};

    for (const behavior of this.behaviorHistory) {
      const cls = behavior.behaviorClass;
      behaviorCounts[cls] = (behaviorCounts[cls] || 0) + 1;
      
      if (!behaviorConfidences[cls]) {
        behaviorConfidences[cls] = [];
      }
      behaviorConfidences[cls]!.push(behavior.confidence);
    }

    // Find most common behavior (majority voting)
    let maxCount = 0;
    let mostCommonBehavior: BehaviorClass = 'no_face_detected';
    
    for (const [behavior, count] of Object.entries(behaviorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonBehavior = behavior as BehaviorClass;
      }
    }

    // Calculate average confidence for the most common behavior
    const confidences = behaviorConfidences[mostCommonBehavior] || [0];
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // Use most recent timestamp
    const latestTimestamp = this.behaviorHistory[this.behaviorHistory.length - 1].timestamp;

    return {
      behaviorClass: mostCommonBehavior,
      confidence: avgConfidence,
      timestamp: latestTimestamp,
      primaryBehavior: mostCommonBehavior,
      isSpeaking: false,
    };
  }

  /**
   * Get the last behavior result without performing new classification
   */
  public getLastBehaviorResult(): BehaviorResult | null {
    return this.lastBehaviorResult;
  }

  /**
   * Get behavior history
   */
  public getBehaviorHistory(): BehaviorResult[] {
    return [...this.behaviorHistory];
  }

  /**
   * Force immediate classification update (bypass temporal smoothing)
   */
  public forceUpdate(): void {
    this.lastUpdateTime = 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<BehaviorClassifierConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset all state and history
   */
  public reset(): void {
    this.behaviorHistory = [];
    this.lastUpdateTime = 0;
    this.lastBehaviorResult = null;
    this.currentState = 'no_face_detected';
    this.pendingState = null;
    this.stateChangeStartTime = 0;
    this.consecutiveStateCount.clear();
  }

  /**
   * Get current state (for debugging)
   */
  public getCurrentState(): {
    currentState: BehaviorClass;
    pendingState: BehaviorClass | null;
    timeUntilChange: number;
  } {
    const timeUntilChange = this.pendingState 
      ? Math.max(0, this.config.updateInterval - (Date.now() - this.stateChangeStartTime))
      : 0;

    return {
      currentState: this.currentState,
      pendingState: this.pendingState,
      timeUntilChange,
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): BehaviorClassifierConfig {
    return { ...this.config };
  }

  /**
   * Get human-readable behavior label
   */
  public static getBehaviorLabel(behaviorClass: BehaviorClass): string {
    const labels: Record<BehaviorClass, string> = {
      focused_on_screen: 'Focused on Screen',
      looking_away: 'Looking Away / Distracted',
      speaking: 'Speaking Detected',
      note_taking: 'Note-taking / Writing',
      no_face_detected: 'No Face Detected',
      phone_detected: 'Phone / Unauthorized Object Detected',
    };

    return labels[behaviorClass];
  }
}

// Export singleton instance
export const behaviorClassifier = new BehaviorClassifier();