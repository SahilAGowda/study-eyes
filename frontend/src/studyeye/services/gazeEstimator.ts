import type { Point } from '../types';

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
  focusConfidence: number; // 0-1 scale, how confident we are they're focused
  eyesDetected: boolean; // Whether both eyes are detected
  eyesInsideBoundingBox: boolean; // Whether eyes are inside face bounding box
  leftEyePosition?: { x: number; y: number }; // Left eye center position
  rightEyePosition?: { x: number; y: number }; // Right eye center position
  leftEyeDetected: boolean; // Whether left eye is detected
  rightEyeDetected: boolean; // Whether right eye is detected
  bothEyesDetected: boolean; // Whether both eyes are detected
}

interface GazeEstimatorConfig {
  // Thresholds for determining if looking at screen
  maxYawForScreen: number;    // degrees
  maxPitchForScreen: number;  // degrees
  
  // Thresholds for gaze direction classification
  yawLeftThreshold: number;   // degrees
  yawRightThreshold: number;  // degrees
  pitchUpThreshold: number;   // degrees
  pitchDownThreshold: number; // degrees
  
  // Temporal smoothing parameters
  stabilityWindowSize: number; // number of frames to consider
  smoothingAlpha: number;      // EMA alpha for smoothing (0-1)
  
  // Eye detection parameters
  eyeDetectionConfidence: number; // Minimum confidence for eye detection
  blinkForgivenessWindow: number; // ms to forgive temporary eye loss (blinking)
}

/**
 * GazeEstimator service for estimating gaze direction and head pose
 * from facial landmarks detected by FaceMesh (468 landmarks)
 */
class GazeEstimator {
  private config: GazeEstimatorConfig = {
    maxYawForScreen: 25,     // 25 degrees left/right (tightened from 30)
    maxPitchForScreen: 20,   // 20 degrees up/down (tightened from 25)
    yawLeftThreshold: -18,   // Looking left threshold (tightened from -20)
    yawRightThreshold: 18,   // Looking right threshold (tightened from 20)
    pitchUpThreshold: -12,   // Looking up threshold (tightened from -15)
    pitchDownThreshold: 12,  // Looking down threshold (tightened from 15)
    stabilityWindowSize: 10,
    smoothingAlpha: 0.5,     // Increased to 0.5 for better smoothing
    eyeDetectionConfidence: 0.65, // Minimum confidence for eye detection
    blinkForgivenessWindow: 300, // 300ms grace period for blinking
  };

  // History for temporal smoothing
  private headPoseHistory: HeadPose[] = [];
  private gazeDirectionHistory: GazeDirection[] = [];

  // Smoothed values
  private smoothedHeadPose: HeadPose = { pitch: 0, yaw: 0, roll: 0 };
  
  // Eye detection state tracking
  private lastEyeDetectionTime: number = 0;
  private eyeDetectionHistory: boolean[] = [];
  private leftEyeHistory: Point[] = [];
  private rightEyeHistory: Point[] = [];

  // 3D model points for PnP algorithm (generic face model in mm)
  private readonly modelPoints: number[][] = [
    [0.0, 0.0, 0.0],          // Nose tip (landmark 1)
    [0.0, -330.0, -65.0],     // Chin (landmark 152)
    [-225.0, 170.0, -135.0],  // Left eye left corner (landmark 33)
    [225.0, 170.0, -135.0],   // Right eye right corner (landmark 263)
    [-150.0, -150.0, -125.0], // Left mouth corner (landmark 61)
    [150.0, -150.0, -125.0],  // Right mouth corner (landmark 291)
  ];

  // Corresponding FaceMesh landmark indices
  private readonly landmarkIndices = {
    noseTip: 1,
    chin: 152,
    leftEyeLeftCorner: 33,
    rightEyeRightCorner: 263,
    leftMouthCorner: 61,
    rightMouthCorner: 291,
    // Eye landmarks for gaze estimation
    leftEyeCenter: 468,  // Left iris center
    rightEyeCenter: 473, // Right iris center
    leftEyeTop: 159,
    leftEyeBottom: 145,
    leftEyeLeft: 33,
    leftEyeRight: 133,
    rightEyeTop: 386,
    rightEyeBottom: 374,
    rightEyeLeft: 362,
    rightEyeRight: 263,
  };

  constructor(config?: Partial<GazeEstimatorConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Estimate gaze direction and head pose from facial landmarks
   * @param landmarks - Array of 468 facial landmarks from FaceMesh
   * @param faceBoundingBox - Optional face bounding box for eye position validation
   * @returns GazeData containing gaze direction, head pose, and stability metrics
   */
  public estimateGaze(landmarks: Point[], faceBoundingBox?: { x: number; y: number; width: number; height: number }): GazeData {
    console.log('[GazeEstimator] estimateGaze called:', {
      landmarksCount: landmarks?.length,
      hasBoundingBox: !!faceBoundingBox,
      firstLandmark: landmarks?.[0],
      landmark33: landmarks?.[33],
      landmark468: landmarks?.[468],
    });

    // Validate landmarks
    if (!landmarks || landmarks.length < 33) {
      console.warn('[GazeEstimator] Insufficient landmarks:', landmarks?.length);
      return this.getDefaultGazeData();
    }

    // Calculate head pose using improved algorithm
    const headPose = this.calculateHeadPose(landmarks);

    // Apply temporal smoothing to head pose
    this.updateHeadPoseHistory(headPose);
    const smoothedPose = this.getSmoothedHeadPose();

    // Check eye detection and position
    const eyeData = this.detectEyePositions(landmarks, faceBoundingBox);

    // Estimate gaze direction from eye landmarks and head pose
    const gazeDirection = this.classifyGazeDirection(landmarks, smoothedPose);

    // Update gaze direction history
    this.updateGazeDirectionHistory(gazeDirection);

    // Determine if looking at screen using eye-based detection
    const { isLookingAtScreen, confidence } = this.isLookingAtScreenWithEyes(
      smoothedPose, 
      eyeData.eyesDetected, 
      eyeData.eyesInsideBoundingBox,
      eyeData.bothEyesDetected
    );

    // Calculate gaze stability metric
    const gazeStability = this.calculateGazeStability();

    return {
      isLookingAtScreen,
      gazeDirection,
      gazeStability,
      headPose: smoothedPose,
      focusConfidence: confidence,
      eyesDetected: eyeData.eyesDetected,
      eyesInsideBoundingBox: eyeData.eyesInsideBoundingBox,
      leftEyePosition: eyeData.leftEyePosition,
      rightEyePosition: eyeData.rightEyePosition,
      leftEyeDetected: eyeData.leftEyeDetected,
      rightEyeDetected: eyeData.rightEyeDetected,
      bothEyesDetected: eyeData.bothEyesDetected,
    };
  }

  /**
   * Calculate head pose (pitch, yaw, roll) using improved landmark-based algorithm
   * @param landmarks - Facial landmarks
   * @returns Head pose angles in degrees
   */
  public calculateHeadPose(landmarks: Point[]): HeadPose {
    try {
      // Extract key landmarks for pose estimation
      const noseTip = landmarks[this.landmarkIndices.noseTip];
      const chin = landmarks[this.landmarkIndices.chin];
      const leftEyeLeft = landmarks[this.landmarkIndices.leftEyeLeftCorner];
      const rightEyeRight = landmarks[this.landmarkIndices.rightEyeRightCorner];
      const leftMouthCorner = landmarks[this.landmarkIndices.leftMouthCorner];
      const rightMouthCorner = landmarks[this.landmarkIndices.rightMouthCorner];

      // Validate landmarks exist
      if (!noseTip || !chin || !leftEyeLeft || !rightEyeRight || !leftMouthCorner || !rightMouthCorner) {
        return { pitch: 0, yaw: 0, roll: 0 };
      }

      // Calculate face center (midpoint between eyes)
      const faceCenter = {
        x: (leftEyeLeft.x + rightEyeRight.x) / 2,
        y: (leftEyeLeft.y + rightEyeRight.y) / 2,
      };

      // Calculate eye distance (baseline for normalization)
      const eyeDistance = Math.sqrt(
        Math.pow(rightEyeRight.x - leftEyeLeft.x, 2) +
        Math.pow(rightEyeRight.y - leftEyeLeft.y, 2)
      );

      // YAW (left-right rotation)
      // When face turns left, nose moves left relative to face center
      // When face turns right, nose moves right relative to face center
      const noseToCenterX = noseTip.x - faceCenter.x;
      const normalizedYaw = noseToCenterX / eyeDistance;
      
      // Enhanced yaw calculation using mouth asymmetry
      const mouthCenter = {
        x: (leftMouthCorner.x + rightMouthCorner.x) / 2,
        y: (leftMouthCorner.y + rightMouthCorner.y) / 2,
      };
      const mouthToCenterX = mouthCenter.x - faceCenter.x;
      const mouthYawFactor = mouthToCenterX / eyeDistance;
      
      // Combine nose and mouth for more accurate yaw
      const combinedYaw = (normalizedYaw * 0.7 + mouthYawFactor * 0.3) * 70; // Scale to degrees
      const yaw = this.clampAngle(combinedYaw);

      // PITCH (up-down rotation)
      // When face looks up, nose moves up relative to face center
      // When face looks down, nose moves down and chin becomes more visible
      const faceHeight = Math.abs(chin.y - faceCenter.y);
      const noseToCenterY = noseTip.y - faceCenter.y;
      const normalizedPitch = noseToCenterY / faceHeight;
      
      // Enhanced pitch using chin-to-nose ratio
      const noseToEyeDistance = Math.abs(noseTip.y - faceCenter.y);
      const chinToEyeDistance = Math.abs(chin.y - faceCenter.y);
      const chinRatio = chinToEyeDistance / eyeDistance;
      
      // When looking down, chin becomes more prominent (ratio increases)
      // When looking up, chin becomes less visible (ratio decreases)
      const pitchFromChin = (chinRatio - 1.5) * 30; // Baseline ratio ~1.5
      
      // Combine both pitch indicators
      const combinedPitch = (normalizedPitch * 50 + pitchFromChin * 0.5);
      const pitch = this.clampAngle(combinedPitch);

      // ROLL (head tilt)
      // Calculate from eye alignment
      const eyeDeltaY = rightEyeRight.y - leftEyeLeft.y;
      const eyeDeltaX = rightEyeRight.x - leftEyeLeft.x;
      const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * (180 / Math.PI);

      return {
        pitch: this.clampAngle(pitch),
        yaw: this.clampAngle(yaw),
        roll: this.clampAngle(roll),
      };
    } catch (error) {
      console.error('Error calculating head pose:', error);
      return { pitch: 0, yaw: 0, roll: 0 };
    }
  }

  /**
   * Classify gaze direction into categories based on head pose and eye position
   * @param landmarks - Facial landmarks
   * @param headPose - Calculated head pose
   * @returns Gaze direction category
   */
  private classifyGazeDirection(landmarks: Point[], headPose: HeadPose): GazeDirection {
    const { yaw, pitch } = headPose;

    // Primary classification based on head pose
    // Check vertical direction first (up/down)
    if (pitch < this.config.pitchUpThreshold) {
      return 'up';
    }
    if (pitch > this.config.pitchDownThreshold) {
      return 'down';
    }

    // Check horizontal direction (left/right)
    if (yaw < this.config.yawLeftThreshold) {
      return 'left';
    }
    if (yaw > this.config.yawRightThreshold) {
      return 'right';
    }

    // Default to center if within thresholds
    return 'center';
  }

  /**
   * Detect eye positions and check if they're inside the face bounding box
   * @param landmarks - Facial landmarks
   * @param faceBoundingBox - Face bounding box
   * @returns Eye detection data with per-eye status
   */
  private detectEyePositions(
    landmarks: Point[], 
    faceBoundingBox?: { x: number; y: number; width: number; height: number }
  ): {
    eyesDetected: boolean;
    eyesInsideBoundingBox: boolean;
    leftEyePosition?: { x: number; y: number };
    rightEyePosition?: { x: number; y: number };
    leftEyeDetected: boolean;
    rightEyeDetected: boolean;
    bothEyesDetected: boolean;
  } {
    try {
      // DEBUG: Log landmarks info
      console.log('[GazeEstimator] Landmarks count:', landmarks?.length);
      
      // FaceMesh provides 468 landmarks, but iris landmarks (468-477) are from newer models
      // Use reliable eye corner landmarks as primary method
      const leftEyeLeftCorner = 33;   // Left eye left corner
      const leftEyeRightCorner = 133; // Left eye right corner
      const rightEyeLeftCorner = 362; // Right eye left corner
      const rightEyeRightCorner = 263; // Right eye right corner

      // DEBUG: Check if landmarks exist
      console.log('[GazeEstimator] Eye landmarks check:', {
        leftCorner: !!landmarks[leftEyeLeftCorner],
        leftRight: !!landmarks[leftEyeRightCorner],
        rightCorner: !!landmarks[rightEyeLeftCorner],
        rightRight: !!landmarks[rightEyeRightCorner],
        sample: landmarks[leftEyeLeftCorner],
      });

      let leftEye: Point | undefined;
      let rightEye: Point | undefined;

      // Calculate eye centers from corners (more reliable than iris detection)
      if (landmarks[leftEyeLeftCorner] && landmarks[leftEyeRightCorner]) {
        leftEye = {
          x: (landmarks[leftEyeLeftCorner].x + landmarks[leftEyeRightCorner].x) / 2,
          y: (landmarks[leftEyeLeftCorner].y + landmarks[leftEyeRightCorner].y) / 2,
        };
        console.log('[GazeEstimator] ✓ Left eye detected:', leftEye);
      } else {
        console.log('[GazeEstimator] ✗ Left eye NOT detected');
      }

      if (landmarks[rightEyeLeftCorner] && landmarks[rightEyeRightCorner]) {
        rightEye = {
          x: (landmarks[rightEyeLeftCorner].x + landmarks[rightEyeRightCorner].x) / 2,
          y: (landmarks[rightEyeLeftCorner].y + landmarks[rightEyeRightCorner].y) / 2,
        };
        console.log('[GazeEstimator] ✓ Right eye detected:', rightEye);
      } else {
        console.log('[GazeEstimator] ✗ Right eye NOT detected');
      }

      const currentTime = Date.now();
      const leftEyeDetected = !!leftEye;
      const rightEyeDetected = !!rightEye;
      const bothEyesDetected = leftEyeDetected && rightEyeDetected;
      const eyesDetected = bothEyesDetected;

      // Apply temporal smoothing to eye positions using EMA
      if (leftEye || rightEye) {
        this.lastEyeDetectionTime = currentTime;
        
        // Smooth eye positions
        if (leftEye) {
          this.leftEyeHistory.push(leftEye);
          if (this.leftEyeHistory.length > 5) this.leftEyeHistory.shift();
          
          // Calculate smoothed position
          if (this.leftEyeHistory.length > 1) {
            const alpha = this.config.smoothingAlpha;
            const prevEye = this.leftEyeHistory[this.leftEyeHistory.length - 2];
            leftEye = {
              x: alpha * leftEye.x + (1 - alpha) * prevEye.x,
              y: alpha * leftEye.y + (1 - alpha) * prevEye.y,
            };
          }
        }
        
        if (rightEye) {
          this.rightEyeHistory.push(rightEye);
          if (this.rightEyeHistory.length > 5) this.rightEyeHistory.shift();
          
          // Calculate smoothed position
          if (this.rightEyeHistory.length > 1) {
            const alpha = this.config.smoothingAlpha;
            const prevEye = this.rightEyeHistory[this.rightEyeHistory.length - 2];
            rightEye = {
              x: alpha * rightEye.x + (1 - alpha) * prevEye.x,
              y: alpha * rightEye.y + (1 - alpha) * prevEye.y,
            };
          }
        }
      }

      // Track eye detection history for stability
      this.eyeDetectionHistory.push(eyesDetected);
      if (this.eyeDetectionHistory.length > 10) {
        this.eyeDetectionHistory.shift();
      }

      // Apply blink forgiveness: if eyes were recently detected, forgive temporary loss
      const timeSinceLastDetection = currentTime - this.lastEyeDetectionTime;
      const isWithinBlinkWindow = timeSinceLastDetection < this.config.blinkForgivenessWindow;
      const stableEyesDetected = eyesDetected || (isWithinBlinkWindow && this.eyeDetectionHistory.some(d => d));

      // If no bounding box provided, assume eyes are inside if detected
      if (!faceBoundingBox) {
        return {
          eyesDetected: stableEyesDetected,
          eyesInsideBoundingBox: stableEyesDetected,
          leftEyePosition: leftEye,
          rightEyePosition: rightEye,
          leftEyeDetected,
          rightEyeDetected,
          bothEyesDetected,
        };
      }

      if (!stableEyesDetected) {
        return {
          eyesDetected: false,
          eyesInsideBoundingBox: false,
          leftEyePosition: leftEye,
          rightEyePosition: rightEye,
          leftEyeDetected,
          rightEyeDetected,
          bothEyesDetected: false,
        };
      }

      // Add generous padding to bounding box for lenient detection
      // Use 30% padding (15% on each side) to be more forgiving
      const paddedBox = {
        x: faceBoundingBox.x - faceBoundingBox.width * 0.15,
        y: faceBoundingBox.y - faceBoundingBox.height * 0.15,
        width: faceBoundingBox.width * 1.3,
        height: faceBoundingBox.height * 1.3,
      };

      // Check if both eyes are inside the padded bounding box
      const leftEyeInside = leftEye ? this.isPointInsideBox(leftEye, paddedBox) : false;
      const rightEyeInside = rightEye ? this.isPointInsideBox(rightEye, paddedBox) : false;
      const eyesInsideBoundingBox = leftEyeInside && rightEyeInside;

      return {
        eyesDetected: stableEyesDetected,
        eyesInsideBoundingBox,
        leftEyePosition: leftEye,
        rightEyePosition: rightEye,
        leftEyeDetected,
        rightEyeDetected,
        bothEyesDetected,
      };
    } catch (error) {
      console.error('Error detecting eye positions:', error);
      return {
        eyesDetected: false,
        eyesInsideBoundingBox: false,
        leftEyeDetected: false,
        rightEyeDetected: false,
        bothEyesDetected: false,
      };
    }
  }

  /**
   * Check if a point is inside a bounding box
   * @param point - Point to check
   * @param box - Bounding box
   * @returns True if point is inside box
   */
  private isPointInsideBox(
    point: { x: number; y: number }, 
    box: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  }

  /**
   * Determine if user is looking at screen using EYE-BASED detection + HEAD POSE
   * NEW RULES:
   * - Both eyes detected AND inside box AND head pose within thresholds → Focused (high confidence)
   * - Head pose outside thresholds (looking up/down/left/right) → Looking Away
   * - One eye detected OR outside box → Distracted (medium confidence)
   * - No eyes detected → Looking Away (high confidence)
   * @param headPose - Head pose angles (CRITICAL for determining looking direction)
   * @param eyesDetected - Whether both eyes are detected
   * @param eyesInsideBoundingBox - Whether eyes are inside face bounding box
   * @param bothEyesDetected - Whether both individual eyes are detected
   * @returns Object with boolean and confidence score
   */
  private isLookingAtScreenWithEyes(
    headPose: HeadPose,
    eyesDetected: boolean,
    eyesInsideBoundingBox: boolean,
    bothEyesDetected: boolean
  ): { isLookingAtScreen: boolean; confidence: number } {
    const { pitch, yaw } = headPose;
    
    // CRITICAL: Check head pose FIRST - if head is turned away, user is NOT looking at screen
    // regardless of eye detection
    const isHeadTurnedAway = 
      Math.abs(yaw) > this.config.maxYawForScreen ||  // Looking left/right
      Math.abs(pitch) > this.config.maxPitchForScreen; // Looking up/down
    
    // Debug log for head pose
    if (Math.abs(pitch) > 15 || Math.abs(yaw) > 15) {
      console.log(`[GazeEstimator] Head pose: pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°, turnedAway=${isHeadTurnedAway}`);
    }
    
    // RULE 0: Head turned significantly away = NOT looking at screen
    if (isHeadTurnedAway) {
      const confidence = Math.min(0.95, 0.7 + Math.abs(pitch) / 100 + Math.abs(yaw) / 100);
      console.log(`[GazeEstimator] HEAD TURNED AWAY - pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}° → NOT looking at screen`);
      return {
        isLookingAtScreen: false,
        confidence,
      };
    }

    // RULE 1: Both eyes detected AND inside box AND head facing forward = Focused
    if (bothEyesDetected && eyesInsideBoundingBox) {
      return {
        isLookingAtScreen: true,
        confidence: 0.95, // Very high confidence
      };
    }

    // RULE 2: One eye detected OR eyes outside box = Distracted
    if (eyesDetected && !eyesInsideBoundingBox) {
      return {
        isLookingAtScreen: false,
        confidence: 0.80, // Medium-high confidence
      };
    }

    // RULE 3: No eyes detected = Looking Away
    return {
      isLookingAtScreen: false,
      confidence: 0.85, // High confidence - clearly not looking
    };
  }

  /**
   * Calculate gaze stability metric using temporal smoothing
   * @returns Stability score from 0 (unstable) to 1 (stable)
   */
  private calculateGazeStability(): number {
    if (this.gazeDirectionHistory.length < 2) {
      return 0.5; // Default stability for insufficient data
    }

    // Count how many recent gaze directions match the most recent one
    const recentDirection = this.gazeDirectionHistory[this.gazeDirectionHistory.length - 1];
    const windowSize = Math.min(this.config.stabilityWindowSize, this.gazeDirectionHistory.length);
    const recentHistory = this.gazeDirectionHistory.slice(-windowSize);

    const matchCount = recentHistory.filter(dir => dir === recentDirection).length;
    const stability = matchCount / windowSize;

    return stability;
  }

  /**
   * Update head pose history for temporal smoothing
   * @param headPose - New head pose measurement
   */
  private updateHeadPoseHistory(headPose: HeadPose): void {
    this.headPoseHistory.push(headPose);

    // Keep only recent history
    if (this.headPoseHistory.length > this.config.stabilityWindowSize) {
      this.headPoseHistory.shift();
    }

    // Apply exponential moving average for smoothing
    if (this.headPoseHistory.length === 1) {
      this.smoothedHeadPose = { ...headPose };
    } else {
      const alpha = this.config.smoothingAlpha;
      this.smoothedHeadPose = {
        pitch: alpha * headPose.pitch + (1 - alpha) * this.smoothedHeadPose.pitch,
        yaw: alpha * headPose.yaw + (1 - alpha) * this.smoothedHeadPose.yaw,
        roll: alpha * headPose.roll + (1 - alpha) * this.smoothedHeadPose.roll,
      };
    }
  }

  /**
   * Update gaze direction history for stability calculation
   * @param direction - New gaze direction
   */
  private updateGazeDirectionHistory(direction: GazeDirection): void {
    this.gazeDirectionHistory.push(direction);

    // Keep only recent history
    if (this.gazeDirectionHistory.length > this.config.stabilityWindowSize) {
      this.gazeDirectionHistory.shift();
    }
  }

  /**
   * Get smoothed head pose using exponential moving average
   * @returns Smoothed head pose
   */
  private getSmoothedHeadPose(): HeadPose {
    return { ...this.smoothedHeadPose };
  }

  /**
   * Clamp angle to reasonable range
   * @param angle - Angle in degrees
   * @returns Clamped angle
   */
  private clampAngle(angle: number): number {
    return Math.max(-90, Math.min(90, angle));
  }

  /**
   * Get default gaze data when landmarks are invalid
   * @returns Default GazeData
   */
  private getDefaultGazeData(): GazeData {
    return {
      isLookingAtScreen: false,
      gazeDirection: 'center',
      gazeStability: 0,
      headPose: { pitch: 0, yaw: 0, roll: 0 },
      focusConfidence: 0,
      eyesDetected: false,
      eyesInsideBoundingBox: false,
      leftEyeDetected: false,
      rightEyeDetected: false,
      bothEyesDetected: false,
    };
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<GazeEstimatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  public getConfig(): GazeEstimatorConfig {
    return { ...this.config };
  }

  /**
   * Reset history and smoothed values
   */
  public reset(): void {
    this.headPoseHistory = [];
    this.gazeDirectionHistory = [];
    this.smoothedHeadPose = { pitch: 0, yaw: 0, roll: 0 };
    this.lastEyeDetectionTime = 0;
    this.eyeDetectionHistory = [];
    this.leftEyeHistory = [];
    this.rightEyeHistory = [];
  }
}

// Export singleton instance
export const gazeEstimator = new GazeEstimator();