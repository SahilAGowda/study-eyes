import type { Point, BoundingBox } from '../types';

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

interface EmotionClassifierConfig {
  // Eye aspect ratio thresholds
  earDrowsyThreshold: number;
  earBlinkThreshold: number;
  slowBlinkDuration: number; // seconds
  
  // Mouth aspect ratio thresholds
  marHappyThreshold: number;
  marBoredThreshold: number;
  marYawnThreshold: number;
  yawnDuration: number; // seconds
  
  // Eyebrow position thresholds
  eyebrowRaisedThreshold: number;
  eyebrowFrownedThreshold: number;
  eyebrowAsymmetryThreshold: number;
  
  // Cheek and smile detection
  cheekRaiseThreshold: number;
  mouthCurvatureThreshold: number;
  
  // Temporal smoothing
  smoothingWindowSize: number;
  smoothingAlpha: number;
  
  // Debug mode
  debugMode: boolean;
}

/**
 * EmotionClassifier service for simplified emotion classification
 * Uses facial landmark patterns and heuristics for real-time performance
 * No heavy ML model required - optimized for < 50ms per frame
 */
class EmotionClassifier {
  private config: EmotionClassifierConfig = {
    // Optimized thresholds for better emotion detection - ULTRA SENSITIVE
    earDrowsyThreshold: 0.20, // Drowsy detection
    earBlinkThreshold: 0.15,
    slowBlinkDuration: 0.5,
    marHappyThreshold: 0.12, // REDUCED from 0.15 for better smile detection
    marBoredThreshold: 0.15,
    marYawnThreshold: 0.45, // More sensitive for yawns (was 0.5)
    yawnDuration: 1.5, // Faster yawn detection (was 2.0)
    eyebrowRaisedThreshold: 0.10, // INCREASED from 0.08 to reduce false confused detection
    eyebrowFrownedThreshold: -0.06, // More sensitive for frustration (was -0.08)
    eyebrowAsymmetryThreshold: 0.05, // INCREASED from 0.04 to reduce false confused detection
    cheekRaiseThreshold: 0.02, // REDUCED from 0.04 for better smile detection
    mouthCurvatureThreshold: 0.010, // REDUCED from 0.015 for ULTRA sensitive smile detection
    smoothingWindowSize: 3, // REDUCED from 6 for faster response
    smoothingAlpha: 0.45, // REDUCED from 0.65 for less weight on history
    debugMode: true, // ENABLED by default for debugging
  };

  // History for temporal smoothing
  private emotionHistory: EmotionCategory[] = [];
  private earHistory: number[] = [];
  private marHistory: number[] = [];
  private emotionScoresHistory: Record<EmotionCategory, number>[] = [];
  private lastBlinkTime: number = 0;
  private lastYawnStartTime: number = 0;
  private yawnInProgress: boolean = false;

  // FaceMesh landmark indices for emotion detection
  private readonly landmarkIndices = {
    // Left eye landmarks
    leftEyeTop: 159,
    leftEyeBottom: 145,
    leftEyeLeft: 33,
    leftEyeRight: 133,
    
    // Right eye landmarks
    rightEyeTop: 386,
    rightEyeBottom: 374,
    rightEyeLeft: 362,
    rightEyeRight: 263,
    
    // Mouth landmarks
    mouthTop: 13,
    mouthBottom: 14,
    mouthLeft: 61,
    mouthRight: 291,
    upperLipTop: 0,
    lowerLipBottom: 17,
    mouthLeftCorner: 61,
    mouthRightCorner: 291,
    
    // Cheek landmarks
    leftCheek: 205,
    rightCheek: 425,
    
    // Eyebrow landmarks
    leftEyebrowInner: 70,
    leftEyebrowOuter: 46,
    leftEyebrowCenter: 105,
    rightEyebrowInner: 300,
    rightEyebrowOuter: 276,
    rightEyebrowCenter: 334,
    
    // Face reference points
    noseTip: 1,
    foreheadCenter: 10,
  };

  constructor(config?: Partial<EmotionClassifierConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Classify emotion from facial landmarks
   * @param landmarks - Array of 468 facial landmarks from FaceMesh
   * @param boundingBox - Face bounding box (optional, for face region extraction)
   * @returns Emotion classification result with confidence scores
   */
  public classifyEmotion(
    landmarks: Point[],
    boundingBox?: BoundingBox
  ): EmotionResult {
    const startTime = performance.now();

    // Validate landmarks
    if (!landmarks || landmarks.length < 468) {
      return this.getDefaultEmotionResult();
    }

    try {
      // Calculate facial features
      const leftEAR = this.calculateEyeAspectRatio(landmarks, 'left');
      const rightEAR = this.calculateEyeAspectRatio(landmarks, 'right');
      const avgEAR = (leftEAR + rightEAR) / 2;

      const mar = this.calculateMouthAspectRatio(landmarks);
      const eyebrowPosition = this.calculateEyebrowPosition(landmarks);
      const mouthCurvature = this.calculateMouthCurvature(landmarks);
      
      // New enhanced features
      const cheekRaise = this.calculateCheekRaise(landmarks);
      const asymmetry = this.detectAsymmetry(landmarks);
      const mouthWidthHeightRatio = this.calculateMouthWidthHeightRatio(landmarks);
      const jawDrop = this.calculateJawDrop(landmarks);
      const isRapidMouthMovement = this.detectRapidMouthMovement();
      const isYawning = this.detectYawn(mar);
      const isSlowBlink = this.detectSlowBlink(avgEAR);

      // Update histories for temporal analysis
      this.updateEARHistory(avgEAR);
      this.updateMARHistory(mar);

      // Debug logging - EVERY FRAME when debug mode is on
      if (this.config.debugMode) {
        console.log('🎭 Emotion Features:', {
          EAR: avgEAR.toFixed(3),
          MAR: mar.toFixed(3),
          eyebrowPos: eyebrowPosition.toFixed(3),
          mouthCurve: mouthCurvature.toFixed(3),
          cheekRaise: cheekRaise.toFixed(3),
          asymmetry: asymmetry.toFixed(3),
          jawDrop: jawDrop.toFixed(3),
          rapidMouth: isRapidMouthMovement,
          yawning: isYawning,
          slowBlink: isSlowBlink,
        });
        console.log('🎯 Smile Detection:', {
          mouthCurveThreshold: this.config.mouthCurvatureThreshold,
          mouthCurveValue: mouthCurvature.toFixed(3),
          mouthCurvePass: mouthCurvature > this.config.mouthCurvatureThreshold * 0.5,
          marThreshold: 0.12,
          marValue: mar.toFixed(3),
          marPass: mar > 0.12,
          cheekRaiseThreshold: 0.02,
          cheekRaiseValue: cheekRaise.toFixed(3),
          cheekRaisePass: cheekRaise > 0.02,
        });
      }

      // Calculate emotion scores based on heuristics
      const emotionScores = this.calculateEmotionScores({
        avgEAR,
        mar,
        eyebrowPosition,
        mouthCurvature,
        cheekRaise,
        asymmetry,
        mouthWidthHeightRatio,
        jawDrop,
        isRapidMouthMovement,
        isYawning,
        isSlowBlink,
      });

      // Determine primary emotion
      const primaryEmotion = this.getPrimaryEmotion(emotionScores);
      const confidence = emotionScores[primaryEmotion];

      // Apply temporal smoothing
      this.updateEmotionHistory(primaryEmotion);
      const smoothedEmotion = this.getSmoothedEmotion();

      const result: EmotionResult = {
        primaryEmotion: smoothedEmotion,
        confidence,
        emotionScores,
      };

      // Performance check
      const elapsedTime = performance.now() - startTime;
      if (elapsedTime > 50) {
        console.warn(`EmotionClassifier took ${elapsedTime.toFixed(2)}ms (target: <50ms)`);
      }

      return result;
    } catch (error) {
      console.error('Error classifying emotion:', error);
      return this.getDefaultEmotionResult();
    }
  }

  /**
   * Calculate Eye Aspect Ratio (EAR) for drowsiness detection
   * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
   * @param landmarks - Facial landmarks
   * @param eye - Which eye to calculate ('left' or 'right')
   * @returns Eye aspect ratio (0-1, lower = more closed)
   */
  private calculateEyeAspectRatio(landmarks: Point[], eye: 'left' | 'right'): number {
    try {
      let top, bottom, left, right;

      if (eye === 'left') {
        top = landmarks[this.landmarkIndices.leftEyeTop];
        bottom = landmarks[this.landmarkIndices.leftEyeBottom];
        left = landmarks[this.landmarkIndices.leftEyeLeft];
        right = landmarks[this.landmarkIndices.leftEyeRight];
      } else {
        top = landmarks[this.landmarkIndices.rightEyeTop];
        bottom = landmarks[this.landmarkIndices.rightEyeBottom];
        left = landmarks[this.landmarkIndices.rightEyeLeft];
        right = landmarks[this.landmarkIndices.rightEyeRight];
      }

      if (!top || !bottom || !left || !right) {
        return 0.25; // Default value
      }

      // Calculate vertical distance
      const verticalDist = this.euclideanDistance(top, bottom);

      // Calculate horizontal distance
      const horizontalDist = this.euclideanDistance(left, right);

      // EAR formula (simplified)
      const ear = verticalDist / (horizontalDist + 0.001); // Add small value to avoid division by zero

      return ear;
    } catch (error) {
      return 0.25; // Default value on error
    }
  }

  /**
   * Calculate Mouth Aspect Ratio (MAR) for smile/yawn detection
   * @param landmarks - Facial landmarks
   * @returns Mouth aspect ratio (higher = more open)
   */
  private calculateMouthAspectRatio(landmarks: Point[]): number {
    try {
      const mouthTop = landmarks[this.landmarkIndices.mouthTop];
      const mouthBottom = landmarks[this.landmarkIndices.mouthBottom];
      const mouthLeft = landmarks[this.landmarkIndices.mouthLeft];
      const mouthRight = landmarks[this.landmarkIndices.mouthRight];

      if (!mouthTop || !mouthBottom || !mouthLeft || !mouthRight) {
        return 0.2; // Default value
      }

      // Calculate vertical distance (mouth opening)
      const verticalDist = this.euclideanDistance(mouthTop, mouthBottom);

      // Calculate horizontal distance (mouth width)
      const horizontalDist = this.euclideanDistance(mouthLeft, mouthRight);

      // MAR formula
      const mar = verticalDist / (horizontalDist + 0.001);

      return mar;
    } catch (error) {
      return 0.2; // Default value on error
    }
  }

  /**
   * Calculate eyebrow position relative to eyes (for confusion/frustration detection)
   * @param landmarks - Facial landmarks
   * @returns Eyebrow position metric (positive = raised, negative = furrowed)
   */
  private calculateEyebrowPosition(landmarks: Point[]): number {
    try {
      const leftEyebrow = landmarks[this.landmarkIndices.leftEyebrowCenter];
      const rightEyebrow = landmarks[this.landmarkIndices.rightEyebrowCenter];
      const leftEyeTop = landmarks[this.landmarkIndices.leftEyeTop];
      const rightEyeTop = landmarks[this.landmarkIndices.rightEyeTop];
      const noseTip = landmarks[this.landmarkIndices.noseTip];

      if (!leftEyebrow || !rightEyebrow || !leftEyeTop || !rightEyeTop || !noseTip) {
        return 0; // Neutral position
      }

      // Calculate average eyebrow height
      const avgEyebrowY = (leftEyebrow.y + rightEyebrow.y) / 2;
      const avgEyeTopY = (leftEyeTop.y + rightEyeTop.y) / 2;

      // Calculate face height for normalization
      const faceHeight = Math.abs(noseTip.y - avgEyeTopY);

      // Normalized eyebrow position (negative = raised, positive = lowered in screen coordinates)
      const eyebrowPosition = (avgEyebrowY - avgEyeTopY) / (faceHeight + 0.001);

      // Invert so positive = raised
      return -eyebrowPosition;
    } catch (error) {
      return 0; // Neutral position on error
    }
  }

  /**
   * Calculate mouth curvature (smile vs frown)
   * @param landmarks - Facial landmarks
   * @returns Mouth curvature metric (positive = smile, negative = frown)
   */
  private calculateMouthCurvature(landmarks: Point[]): number {
    try {
      const mouthLeft = landmarks[this.landmarkIndices.mouthLeft];
      const mouthRight = landmarks[this.landmarkIndices.mouthRight];
      const mouthTop = landmarks[this.landmarkIndices.mouthTop];

      if (!mouthLeft || !mouthRight || !mouthTop) {
        return 0; // Neutral
      }

      // Calculate mouth center
      const mouthCenterY = (mouthLeft.y + mouthRight.y) / 2;

      // Compare mouth corners to center
      // If corners are higher than center, it's a smile
      const curvature = mouthCenterY - mouthTop.y;

      // Normalize by mouth width
      const mouthWidth = this.euclideanDistance(mouthLeft, mouthRight);
      const normalizedCurvature = curvature / (mouthWidth + 0.001);

      return normalizedCurvature;
    } catch (error) {
      return 0; // Neutral on error
    }
  }

  /**
   * Calculate cheek raise metric (for genuine smile detection)
   * Measures distance between lower eyelid and cheekbone
   * @param landmarks - Facial landmarks
   * @returns Cheek raise metric (higher = more raised)
   */
  private calculateCheekRaise(landmarks: Point[]): number {
    try {
      const leftEyeBottom = landmarks[this.landmarkIndices.leftEyeBottom];
      const rightEyeBottom = landmarks[this.landmarkIndices.rightEyeBottom];
      const leftCheek = landmarks[this.landmarkIndices.leftCheek];
      const rightCheek = landmarks[this.landmarkIndices.rightCheek];
      const mouthLeft = landmarks[this.landmarkIndices.mouthLeft];
      const mouthRight = landmarks[this.landmarkIndices.mouthRight];

      if (!leftEyeBottom || !rightEyeBottom || !leftCheek || !rightCheek || !mouthLeft || !mouthRight) {
        return 0;
      }

      // Calculate distance between eye bottom and mouth (cheek region)
      const leftCheekDist = this.euclideanDistance(leftEyeBottom, mouthLeft);
      const rightCheekDist = this.euclideanDistance(rightEyeBottom, mouthRight);
      
      // Calculate face height for normalization
      const faceHeight = Math.abs(leftEyeBottom.y - mouthLeft.y) + Math.abs(rightEyeBottom.y - mouthRight.y);
      
      // Normalized cheek raise (lower distance = more raised cheeks)
      const avgCheekDist = (leftCheekDist + rightCheekDist) / 2;
      const normalizedCheekRaise = 1 - (avgCheekDist / (faceHeight + 0.001));

      return Math.max(0, normalizedCheekRaise);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Detect rapid mouth movement (laughing oscillation)
   * @returns True if rapid mouth movement detected
   */
  private detectRapidMouthMovement(): boolean {
    if (this.marHistory.length < 5) {
      return false;
    }

    // Check for oscillation in MAR values (laughing pattern)
    const recentMAR = this.marHistory.slice(-5);
    let changes = 0;
    let inRange = 0;

    for (let i = 1; i < recentMAR.length; i++) {
      const diff = Math.abs(recentMAR[i] - recentMAR[i - 1]);
      if (diff > 0.05) {
        changes++;
      }
      // Check if MAR is in laughing range (0.2-0.4)
      if (recentMAR[i] > 0.2 && recentMAR[i] < 0.4) {
        inRange++;
      }
    }

    // Rapid movement = multiple changes + values in laughing range
    return changes >= 3 && inRange >= 3;
  }

  /**
   * Detect asymmetry in facial features (confusion indicator)
   * @param landmarks - Facial landmarks
   * @returns Asymmetry score (higher = more asymmetric)
   */
  private detectAsymmetry(landmarks: Point[]): number {
    try {
      const leftEyebrow = landmarks[this.landmarkIndices.leftEyebrowCenter];
      const rightEyebrow = landmarks[this.landmarkIndices.rightEyebrowCenter];
      const leftEyeTop = landmarks[this.landmarkIndices.leftEyeTop];
      const rightEyeTop = landmarks[this.landmarkIndices.rightEyeTop];

      if (!leftEyebrow || !rightEyebrow || !leftEyeTop || !rightEyeTop) {
        return 0;
      }

      // Calculate eyebrow height difference
      const leftEyebrowHeight = leftEyeTop.y - leftEyebrow.y;
      const rightEyebrowHeight = rightEyeTop.y - rightEyebrow.y;
      
      const asymmetry = Math.abs(leftEyebrowHeight - rightEyebrowHeight);
      
      // Normalize by average eyebrow height
      const avgHeight = (Math.abs(leftEyebrowHeight) + Math.abs(rightEyebrowHeight)) / 2;
      const normalizedAsymmetry = asymmetry / (avgHeight + 0.001);

      return normalizedAsymmetry;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Detect yawn (sustained high MAR)
   * @param mar - Current mouth aspect ratio
   * @returns True if yawn detected
   */
  private detectYawn(mar: number): boolean {
    const currentTime = Date.now() / 1000; // Convert to seconds

    // Check if MAR is above yawn threshold
    if (mar > this.config.marYawnThreshold) {
      if (!this.yawnInProgress) {
        // Start of potential yawn
        this.yawnInProgress = true;
        this.lastYawnStartTime = currentTime;
      } else {
        // Check if yawn has been sustained long enough
        const yawnDuration = currentTime - this.lastYawnStartTime;
        if (yawnDuration >= this.config.yawnDuration) {
          return true;
        }
      }
    } else {
      // Reset yawn detection
      this.yawnInProgress = false;
    }

    return false;
  }

  /**
   * Detect slow blink (drowsiness indicator)
   * @param ear - Current eye aspect ratio
   * @returns True if slow blink detected
   */
  private detectSlowBlink(ear: number): boolean {
    const currentTime = Date.now() / 1000;

    if (ear < this.config.earBlinkThreshold) {
      if (this.lastBlinkTime === 0) {
        this.lastBlinkTime = currentTime;
      } else {
        const blinkDuration = currentTime - this.lastBlinkTime;
        if (blinkDuration >= this.config.slowBlinkDuration) {
          return true;
        }
      }
    } else {
      this.lastBlinkTime = 0;
    }

    return false;
  }

  /**
   * Calculate mouth width to height ratio
   * @param landmarks - Facial landmarks
   * @returns Mouth width/height ratio
   */
  private calculateMouthWidthHeightRatio(landmarks: Point[]): number {
    try {
      const mouthTop = landmarks[this.landmarkIndices.mouthTop];
      const mouthBottom = landmarks[this.landmarkIndices.mouthBottom];
      const mouthLeft = landmarks[this.landmarkIndices.mouthLeft];
      const mouthRight = landmarks[this.landmarkIndices.mouthRight];

      if (!mouthTop || !mouthBottom || !mouthLeft || !mouthRight) {
        return 1.0;
      }

      const width = this.euclideanDistance(mouthLeft, mouthRight);
      const height = this.euclideanDistance(mouthTop, mouthBottom);

      return width / (height + 0.001);
    } catch (error) {
      return 1.0;
    }
  }

  /**
   * Detect emotion transition (sudden change indicates genuine emotion)
   * @returns Transition confidence boost (0-0.3)
   */
  private detectEmotionTransition(): number {
    if (this.emotionHistory.length < 3) {
      return 0;
    }

    const recent = this.emotionHistory.slice(-3);
    
    // Check if emotion changed in last 2 frames
    if (recent[0] !== recent[2] && recent[1] === recent[2]) {
      // Sudden change detected (Neutral → Happy in 2 frames)
      return 0.2; // Boost confidence by 20%
    }

    return 0;
  }

  /**
   * Calculate jaw drop measurement
   * @param landmarks - Facial landmarks
   * @returns Jaw drop metric (higher = more dropped)
   */
  private calculateJawDrop(landmarks: Point[]): number {
    try {
      const mouthBottom = landmarks[this.landmarkIndices.lowerLipBottom];
      const noseTip = landmarks[this.landmarkIndices.noseTip];

      if (!mouthBottom || !noseTip) {
        return 0;
      }

      // Calculate distance from nose to chin
      const jawDrop = this.euclideanDistance(noseTip, mouthBottom);
      
      return jawDrop;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update MAR history for temporal analysis
   * @param mar - Current mouth aspect ratio
   */
  private updateMARHistory(mar: number): void {
    this.marHistory.push(mar);

    if (this.marHistory.length > this.config.smoothingWindowSize) {
      this.marHistory.shift();
    }
  }

  /**
   * Calculate emotion scores based on facial features using enhanced heuristics
   * @param features - Extracted facial features
   * @returns Emotion scores for all categories
   */
  private calculateEmotionScores(features: {
    avgEAR: number;
    mar: number;
    eyebrowPosition: number;
    mouthCurvature: number;
    cheekRaise: number;
    asymmetry: number;
    mouthWidthHeightRatio: number;
    jawDrop: number;
    isRapidMouthMovement: boolean;
    isYawning: boolean;
    isSlowBlink: boolean;
  }): Record<EmotionCategory, number> {
    const { 
      avgEAR, 
      mar, 
      eyebrowPosition, 
      mouthCurvature, 
      cheekRaise,
      asymmetry,
      mouthWidthHeightRatio,
      jawDrop,
      isRapidMouthMovement,
      isYawning,
      isSlowBlink,
    } = features;

    const scores: Record<EmotionCategory, number> = {
      focused: 0,
      confused: 0,
      bored: 0,
      frustrated: 0,
      happy: 0,
      drowsy: 0,
      neutral: 0,
    };

    // Get temporal context
    const avgRecentEAR = this.getAverageRecentEAR();
    const transitionBoost = this.detectEmotionTransition();

    // DROWSY: Low EAR sustained over time + slow blinks
    if (avgRecentEAR < this.config.earDrowsyThreshold || isSlowBlink) {
      let drowsyScore = 0.75 + (this.config.earDrowsyThreshold - avgRecentEAR) * 2.5; // Higher base + more sensitive
      if (isSlowBlink) {
        drowsyScore += 0.25; // Stronger boost for slow blink
      }
      scores.drowsy = Math.min(drowsyScore, 1.0);
    }

    // HAPPY/LAUGHING: Enhanced smile detection - PRIORITIZED and STRONGER
    let hasSmileFeatures = false;
    
    // Option 1: Good mouth curvature (primary indicator) - VERY SENSITIVE
    if (mouthCurvature > this.config.mouthCurvatureThreshold * 0.5) {
      const smileScore = (mouthCurvature / 0.08) * 0.5; // Normalize
      scores.happy = Math.min(0.70 + smileScore * 0.30, 1.0); // INCREASED base from 0.60
      hasSmileFeatures = true;
    }
    
    // Option 2: High MAR (open mouth smile) - VERY SENSITIVE
    if (mar > 0.12) {
      const marSmileScore = (mar / 0.30) * 0.6;
      scores.happy = Math.max(scores.happy, Math.min(0.65 + marSmileScore * 0.35, 1.0));
      hasSmileFeatures = true;
    }
    
    // Option 3: Cheek raise (genuine smile indicator)
    if (cheekRaise > 0.02) {
      const cheekSmileScore = (cheekRaise / 0.12) * 0.5;
      scores.happy = Math.max(scores.happy, Math.min(0.65 + cheekSmileScore * 0.35, 1.0));
      hasSmileFeatures = true;
    }
    
    // Genuine smile bonus: multiple features present
    if (mouthCurvature > this.config.mouthCurvatureThreshold * 0.5 && mar > 0.12) {
      scores.happy = Math.min(scores.happy + 0.20, 1.0); // STRONG bonus
      hasSmileFeatures = true;
    }

    // LAUGHING: Rapid mouth movement (oscillation)
    if (isRapidMouthMovement && mar > 0.18) {
      scores.happy = Math.max(scores.happy, 0.88); // High confidence for laughing
      hasSmileFeatures = true;
    }

    // CONFUSED: Raised eyebrows + asymmetry + slightly open mouth
    // BUT NOT if there are clear smile features (prevents false positives)
    if (eyebrowPosition > this.config.eyebrowRaisedThreshold || asymmetry > this.config.eyebrowAsymmetryThreshold) {
      let confusedScore = 0.55; // REDUCED base score (was 0.65)
      
      if (eyebrowPosition > this.config.eyebrowRaisedThreshold) {
        confusedScore += eyebrowPosition * 2.5; // More sensitive
      }
      
      if (asymmetry > this.config.eyebrowAsymmetryThreshold) {
        confusedScore += asymmetry * 4; // Asymmetry is strong indicator
      }
      
      if (mar > 0.18 && mar < 0.35) {
        confusedScore += 0.15; // Slight mouth opening
      }
      
      // CRITICAL: Suppress confused if smile features are present
      if (hasSmileFeatures) {
        confusedScore *= 0.3; // Reduce confused score by 70% when smiling
      }
      
      scores.confused = Math.min(confusedScore, 1.0);
    }

    // FRUSTRATED: Furrowed eyebrows + lip tension (tight mouth)
    if (eyebrowPosition < this.config.eyebrowFrownedThreshold) {
      let frustratedScore = 0.60 + Math.abs(eyebrowPosition) * 2.5; // Higher base + more sensitive
      
      // Lip tension: high width-to-height ratio (corners pulled tight)
      if (mouthWidthHeightRatio > 4.5 && mar < 0.2) {
        frustratedScore += 0.25; // Stronger indicator
      }
      
      scores.frustrated = Math.min(frustratedScore, 1.0);
    }

    // BORED: Low MAR + neutral eyebrows + droopy eyes + yawning
    if (mar < this.config.marBoredThreshold && avgEAR < 0.25 && Math.abs(eyebrowPosition) < 0.1) {
      let boredScore = 0.65; // Higher base score
      
      // Head tilt forward would be detected by gaze estimator (not here)
      // But we can use jaw drop as proxy
      if (jawDrop > 0.3) {
        boredScore += 0.15;
      }
      
      scores.bored = Math.min(boredScore, 1.0);
    }

    // YAWNING: Sustained high MAR (indicates boredom/drowsiness)
    if (isYawning) {
      scores.bored = Math.max(scores.bored, 0.80); // Higher confidence
      scores.drowsy = Math.max(scores.drowsy, 0.70); // Higher confidence
    }

    // FOCUSED: Normal EAR + neutral expression + stable features
    if (avgEAR > 0.22 && avgEAR < 0.30 && Math.abs(eyebrowPosition) < 0.1 && mar < 0.25) {
      // Check for stability (no rapid changes)
      const isStable = !isRapidMouthMovement && !isYawning;
      if (isStable) {
        scores.focused = 0.7;
      }
    }

    // NEUTRAL: Default when no strong emotion detected
    scores.neutral = 0.5;

    // Apply temporal smoothing with exponential weighting
    if (this.emotionScoresHistory.length > 0) {
      const prevScores = this.emotionScoresHistory[this.emotionScoresHistory.length - 1];
      for (const emotion in scores) {
        const emotionKey = emotion as EmotionCategory;
        // Exponential moving average: weight recent frames more
        scores[emotionKey] = 
          this.config.smoothingAlpha * scores[emotionKey] + 
          (1 - this.config.smoothingAlpha) * prevScores[emotionKey];
      }
    }

    // Store scores history
    this.emotionScoresHistory.push({ ...scores });
    if (this.emotionScoresHistory.length > this.config.smoothingWindowSize) {
      this.emotionScoresHistory.shift();
    }

    // Normalize scores to ensure they sum to reasonable values
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      for (const emotion in scores) {
        scores[emotion as EmotionCategory] = Math.min(scores[emotion as EmotionCategory], 1.0);
      }
    }

    // Debug logging - EVERY FRAME when debug mode is on
    if (this.config.debugMode) {
      console.log('🎭 Emotion Scores:', {
        happy: scores.happy.toFixed(2),
        confused: scores.confused.toFixed(2),
        frustrated: scores.frustrated.toFixed(2),
        bored: scores.bored.toFixed(2),
        drowsy: scores.drowsy.toFixed(2),
        focused: scores.focused.toFixed(2),
        neutral: scores.neutral.toFixed(2),
      });
    }

    return scores;
  }

  /**
   * Get primary emotion from scores
   * @param scores - Emotion scores
   * @returns Primary emotion category
   */
  private getPrimaryEmotion(scores: Record<EmotionCategory, number>): EmotionCategory {
    let maxScore = 0;
    let primaryEmotion: EmotionCategory = 'neutral';

    // ULTRA LOW threshold for detecting emotions (from 0.60 to 0.45)
    const EMOTION_THRESHOLD = 0.45;

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as EmotionCategory;
      }
    }

    // Only return emotion if it exceeds threshold, otherwise neutral
    if (maxScore < EMOTION_THRESHOLD && primaryEmotion !== 'neutral') {
      if (this.config.debugMode) {
        console.log(`⚠️ Emotion ${primaryEmotion} below threshold: ${maxScore.toFixed(2)} < ${EMOTION_THRESHOLD}`);
      }
      return 'neutral';
    }

    if (this.config.debugMode) {
      console.log(`✅ Primary Emotion: ${primaryEmotion} (${maxScore.toFixed(2)})`);
    }

    return primaryEmotion;
  }

  /**
   * Update EAR history for temporal analysis
   * @param ear - Current eye aspect ratio
   */
  private updateEARHistory(ear: number): void {
    this.earHistory.push(ear);

    if (this.earHistory.length > this.config.smoothingWindowSize) {
      this.earHistory.shift();
    }
  }

  /**
   * Get average EAR from recent history
   * @returns Average EAR
   */
  private getAverageRecentEAR(): number {
    if (this.earHistory.length === 0) {
      return 0.25; // Default value
    }

    const sum = this.earHistory.reduce((acc, val) => acc + val, 0);
    return sum / this.earHistory.length;
  }

  /**
   * Update emotion history for temporal smoothing
   * @param emotion - Current emotion
   */
  private updateEmotionHistory(emotion: EmotionCategory): void {
    this.emotionHistory.push(emotion);

    if (this.emotionHistory.length > this.config.smoothingWindowSize) {
      this.emotionHistory.shift();
    }
  }

  /**
   * Get smoothed emotion using weighted majority voting
   * Recent frames have more weight for faster response
   * REDUCED smoothing - only use last 2 frames for faster response
   * @returns Most common recent emotion
   */
  private getSmoothedEmotion(): EmotionCategory {
    if (this.emotionHistory.length === 0) {
      return 'neutral';
    }

    // Use only last 2 frames for FASTER response (was full window)
    const recentFrames = this.emotionHistory.slice(-2);
    
    // Use weighted voting - recent frames have more weight
    const emotionCounts: Partial<Record<EmotionCategory, number>> = {};
    const historyLength = recentFrames.length;
    
    for (let i = 0; i < historyLength; i++) {
      const emotion = recentFrames[i];
      // Weight increases linearly: older frames = 1x, newest frame = 3x (more aggressive)
      const weight = 1 + (i / historyLength) * 2;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + weight;
    }

    // Find emotion with highest weighted count
    let maxCount = 0;
    let mostCommonEmotion: EmotionCategory = 'neutral';
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonEmotion = emotion as EmotionCategory;
      }
    }

    return mostCommonEmotion;
  }

  /**
   * Calculate Euclidean distance between two points
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Distance
   */
  private euclideanDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get default emotion result when landmarks are invalid
   * @returns Default EmotionResult
   */
  private getDefaultEmotionResult(): EmotionResult {
    return {
      primaryEmotion: 'neutral',
      confidence: 0.5,
      emotionScores: {
        focused: 0,
        confused: 0,
        bored: 0,
        frustrated: 0,
        happy: 0,
        drowsy: 0,
        neutral: 0.5,
      },
    };
  }

  /**
   * Extract face region from frame (for future use with ML models)
   * @param imageData - Full frame image data
   * @param boundingBox - Face bounding box
   * @returns Cropped face region
   */
  public extractFaceRegion(
    imageData: ImageData,
    boundingBox: BoundingBox
  ): ImageData | null {
    try {
      // Create canvas for extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }

      // Set canvas size to bounding box size
      canvas.width = boundingBox.width;
      canvas.height = boundingBox.height;

      // Create temporary canvas with full image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        return null;
      }

      tempCtx.putImageData(imageData, 0, 0);

      // Draw cropped region
      ctx.drawImage(
        tempCanvas,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
        0,
        0,
        boundingBox.width,
        boundingBox.height
      );

      // Get cropped image data
      return ctx.getImageData(0, 0, boundingBox.width, boundingBox.height);
    } catch (error) {
      console.error('Error extracting face region:', error);
      return null;
    }
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<EmotionClassifierConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  public getConfig(): EmotionClassifierConfig {
    return { ...this.config };
  }

  /**
   * Reset history and state
   */
  public reset(): void {
    this.emotionHistory = [];
    this.earHistory = [];
    this.marHistory = [];
    this.emotionScoresHistory = [];
    this.lastBlinkTime = 0;
    this.lastYawnStartTime = 0;
    this.yawnInProgress = false;
  }

  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug logging
   */
  public setDebugMode(enabled: boolean): void {
    this.config.debugMode = enabled;
    if (enabled) {
      console.log('Emotion Classifier Debug Mode: ENABLED');
      console.log('Current thresholds:', {
        earDrowsy: this.config.earDrowsyThreshold,
        marHappy: this.config.marHappyThreshold,
        eyebrowRaised: this.config.eyebrowRaisedThreshold,
        eyebrowFrowned: this.config.eyebrowFrownedThreshold,
        cheekRaise: this.config.cheekRaiseThreshold,
        mouthCurvature: this.config.mouthCurvatureThreshold,
      });
    } else {
      console.log('Emotion Classifier Debug Mode: DISABLED');
    }
  }

  /**
   * Get current feature values (for calibration/debugging)
   * @param landmarks - Facial landmarks
   * @returns Current feature values
   */
  public getFeatureValues(landmarks: Point[]): Record<string, number> {
    const leftEAR = this.calculateEyeAspectRatio(landmarks, 'left');
    const rightEAR = this.calculateEyeAspectRatio(landmarks, 'right');
    const avgEAR = (leftEAR + rightEAR) / 2;
    const mar = this.calculateMouthAspectRatio(landmarks);
    const eyebrowPosition = this.calculateEyebrowPosition(landmarks);
    const mouthCurvature = this.calculateMouthCurvature(landmarks);
    const cheekRaise = this.calculateCheekRaise(landmarks);
    const asymmetry = this.detectAsymmetry(landmarks);
    const jawDrop = this.calculateJawDrop(landmarks);

    return {
      EAR: avgEAR,
      MAR: mar,
      eyebrowPosition,
      mouthCurvature,
      cheekRaise,
      asymmetry,
      jawDrop,
    };
  }

  /**
   * Log current features for calibration
   * Call this method to see real-time feature values and compare with thresholds
   * @param landmarks - Facial landmarks
   */
  public logCurrentFeatures(landmarks: Point[]): void {
    const features = this.getFeatureValues(landmarks);
    console.log('=== EMOTION CALIBRATION ===');
    console.log('Try different expressions and note these values:');
    console.log(features);
    console.log('Current thresholds:', {
      marHappy: this.config.marHappyThreshold,
      mouthCurve: this.config.mouthCurvatureThreshold,
      cheekRaise: this.config.cheekRaiseThreshold,
      eyebrowRaised: this.config.eyebrowRaisedThreshold,
    });
  }
}

// Export singleton instance
export const emotionClassifier = new EmotionClassifier();
