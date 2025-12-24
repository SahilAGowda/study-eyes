/**
 * Emotion Recognition Service
 * 
 * Robust emotion recognition with confidence scores, replacing heuristic-based approach.
 * Uses facial action units (AUs) and geometric features for reliable emotion classification.
 */

import type { Point } from '../types';
import type { StudentEmotion } from '../types/studentState';

export interface EmotionConfig {
  // Feature extraction parameters
  eyeAspectRatioThreshold: number;
  mouthAspectRatioThreshold: number;
  eyebrowMovementThreshold: number;
  cheekRaiseThreshold: number;
  
  // Confidence thresholds
  minConfidenceThreshold: number;
  neutralConfidenceThreshold: number;
  
  // Temporal smoothing
  temporalWindowSize: number;
  smoothingAlpha: number;
  
  // Validation parameters
  minLandmarksRequired: number;
  faceQualityThreshold: number;
}

/**
 * Facial Action Units (AUs) for emotion recognition
 * Based on Facial Action Coding System (FACS)
 */
interface FacialActionUnits {
  // Eye region
  AU1_innerBrowRaise: number;     // Inner brow raiser
  AU2_outerBrowRaise: number;     // Outer brow raiser
  AU4_browLower: number;          // Brow lowerer
  AU5_upperLidRaise: number;      // Upper lid raiser
  AU6_cheekRaise: number;         // Cheek raiser
  AU7_lidTighten: number;         // Lid tightener
  
  // Mouth region
  AU9_noseWrinkle: number;        // Nose wrinkler
  AU10_upperLipRaise: number;     // Upper lip raiser
  AU12_lipCornerPull: number;     // Lip corner puller (smile)
  AU15_lipCornerDepress: number;  // Lip corner depressor
  AU16_lowerLipDepress: number;   // Lower lip depressor
  AU17_chinRaise: number;         // Chin raiser
  AU20_lipStretch: number;        // Lip stretcher
  AU23_lipTighten: number;        // Lip tightener
  AU24_lipPress: number;          // Lip presser
  AU25_lipsPart: number;          // Lips part
  AU26_jawDrop: number;           // Jaw drop
  AU27_mouthStretch: number;      // Mouth stretch
  
  // Head movement
  AU51_headTurnLeft: number;      // Head turn left
  AU52_headTurnRight: number;     // Head turn right
  AU53_headUp: number;            // Head up
  AU54_headDown: number;          // Head down
  AU55_headTiltLeft: number;      // Head tilt left
  AU56_headTiltRight: number;     // Head tilt right
}

/**
 * Emotion classification rules based on Action Units
 */
const EMOTION_RULES: Record<keyof StudentEmotion['emotions'], (aus: FacialActionUnits) => number> = {
  engaged: (aus) => {
    // Engaged: Slight smile + raised eyebrows + forward head position
    return Math.min(1.0, 
      aus.AU12_lipCornerPull * 0.4 +
      aus.AU1_innerBrowRaise * 0.3 +
      aus.AU6_cheekRaise * 0.2 +
      (1 - aus.AU54_headDown) * 0.1
    );
  },
  
  confused: (aus) => {
    // Confused: Asymmetric eyebrow raise + slight frown + head tilt
    return Math.min(1.0,
      Math.abs(aus.AU1_innerBrowRaise - aus.AU2_outerBrowRaise) * 0.4 +
      aus.AU4_browLower * 0.3 +
      (aus.AU55_headTiltLeft + aus.AU56_headTiltRight) * 0.2 +
      aus.AU23_lipTighten * 0.1
    );
  },
  
  bored: (aus) => {
    // Bored: Droopy eyelids + mouth slightly open + head down
    return Math.min(1.0,
      (1 - aus.AU5_upperLidRaise) * 0.4 +
      aus.AU25_lipsPart * 0.2 +
      aus.AU54_headDown * 0.3 +
      (1 - aus.AU12_lipCornerPull) * 0.1
    );
  },
  
  frustrated: (aus) => {
    // Frustrated: Furrowed brow + tight lips + jaw clench
    return Math.min(1.0,
      aus.AU4_browLower * 0.4 +
      aus.AU23_lipTighten * 0.3 +
      aus.AU24_lipPress * 0.2 +
      aus.AU7_lidTighten * 0.1
    );
  },
  
  focused: (aus) => {
    // Focused: Slight brow furrow + neutral mouth + steady gaze
    return Math.min(1.0,
      aus.AU4_browLower * 0.2 +
      (1 - aus.AU25_lipsPart) * 0.3 +
      (1 - aus.AU12_lipCornerPull - aus.AU15_lipCornerDepress) * 0.3 +
      (1 - Math.abs(aus.AU51_headTurnLeft - aus.AU52_headTurnRight)) * 0.2
    );
  },
  
  drowsy: (aus) => {
    // Drowsy: Heavy eyelids + mouth slightly open + head dropping
    return Math.min(1.0,
      (1 - aus.AU5_upperLidRaise) * 0.5 +
      aus.AU25_lipsPart * 0.2 +
      aus.AU54_headDown * 0.2 +
      aus.AU26_jawDrop * 0.1
    );
  },
  
  neutral: (aus) => {
    // Neutral: Baseline state with minimal facial activity
    const totalActivity = Object.values(aus).reduce((sum, au) => sum + Math.abs(au), 0);
    return Math.max(0, 1 - (totalActivity / Object.keys(aus).length));
  },
};

/**
 * FaceMesh landmark indices for emotion recognition
 */
const EMOTION_LANDMARKS = {
  // Eye region landmarks
  leftEyeTop: 159,
  leftEyeBottom: 145,
  leftEyeLeft: 33,
  leftEyeRight: 133,
  leftEyebrowInner: 70,
  leftEyebrowOuter: 46,
  leftEyebrowTop: 107,
  
  rightEyeTop: 386,
  rightEyeBottom: 374,
  rightEyeLeft: 362,
  rightEyeRight: 263,
  rightEyebrowInner: 300,
  rightEyebrowOuter: 276,
  rightEyebrowTop: 336,
  
  // Mouth region landmarks
  mouthTop: 13,
  mouthBottom: 14,
  mouthLeft: 61,
  mouthRight: 291,
  upperLipTop: 12,
  upperLipBottom: 15,
  lowerLipTop: 16,
  lowerLipBottom: 17,
  lipCornerLeft: 61,
  lipCornerRight: 291,
  
  // Cheek landmarks
  leftCheek: 116,
  rightCheek: 345,
  
  // Nose landmarks
  noseTip: 1,
  noseLeft: 31,
  noseRight: 261,
  
  // Chin landmarks
  chin: 152,
  jawLeft: 172,
  jawRight: 397,
};

export class EmotionRecognizer {
  private config: Required<EmotionConfig>;
  private emotionHistory: StudentEmotion[] = [];
  private auHistory: FacialActionUnits[] = [];
  
  constructor(config: Partial<EmotionConfig> = {}) {
    this.config = {
      eyeAspectRatioThreshold: 0.25,
      mouthAspectRatioThreshold: 0.15,
      eyebrowMovementThreshold: 0.08,
      cheekRaiseThreshold: 0.03,
      minConfidenceThreshold: 0.6,
      neutralConfidenceThreshold: 0.4,
      temporalWindowSize: 5,
      smoothingAlpha: 0.3,
      minLandmarksRequired: 20,
      faceQualityThreshold: 0.7,
      ...config,
    };
  }
  
  /**
   * Recognize emotion from facial landmarks
   */
  public recognizeEmotion(
    landmarks: Point[],
    faceConfidence: number = 1.0
  ): StudentEmotion | null {
    
    if (landmarks.length < this.config.minLandmarksRequired) {
      console.warn('Insufficient landmarks for emotion recognition');
      return null;
    }
    
    if (faceConfidence < this.config.faceQualityThreshold) {
      console.warn('Face quality too low for reliable emotion recognition');
      return null;
    }
    
    try {
      // Extract facial action units
      const actionUnits = this.extractActionUnits(landmarks);
      
      // Calculate emotion scores
      const emotionScores = this.calculateEmotionScores(actionUnits);
      
      // Determine primary emotion
      const primaryEmotion = this.determinePrimaryEmotion(emotionScores);
      
      // Calculate valence, arousal, dominance
      const vad = this.calculateVAD(emotionScores, actionUnits);
      
      // Create emotion result
      const emotion: StudentEmotion = {
        valence: vad.valence,
        arousal: vad.arousal,
        dominance: vad.dominance,
        emotions: emotionScores,
        primaryEmotion,
        confidence: this.calculateOverallConfidence(emotionScores, faceConfidence),
      };
      
      // Apply temporal smoothing
      const smoothedEmotion = this.applyTemporalSmoothing(emotion);
      
      // Update history
      this.updateHistory(smoothedEmotion, actionUnits);
      
      return smoothedEmotion;
      
    } catch (error) {
      console.error('Emotion recognition failed:', error);
      return null;
    }
  }
  
  /**
   * Extract facial action units from landmarks
   */
  private extractActionUnits(landmarks: Point[]): FacialActionUnits {
    const aus: FacialActionUnits = {
      // Eye region AUs
      AU1_innerBrowRaise: this.calculateInnerBrowRaise(landmarks),
      AU2_outerBrowRaise: this.calculateOuterBrowRaise(landmarks),
      AU4_browLower: this.calculateBrowLower(landmarks),
      AU5_upperLidRaise: this.calculateUpperLidRaise(landmarks),
      AU6_cheekRaise: this.calculateCheekRaise(landmarks),
      AU7_lidTighten: this.calculateLidTighten(landmarks),
      
      // Mouth region AUs
      AU9_noseWrinkle: this.calculateNoseWrinkle(landmarks),
      AU10_upperLipRaise: this.calculateUpperLipRaise(landmarks),
      AU12_lipCornerPull: this.calculateLipCornerPull(landmarks),
      AU15_lipCornerDepress: this.calculateLipCornerDepress(landmarks),
      AU16_lowerLipDepress: this.calculateLowerLipDepress(landmarks),
      AU17_chinRaise: this.calculateChinRaise(landmarks),
      AU20_lipStretch: this.calculateLipStretch(landmarks),
      AU23_lipTighten: this.calculateLipTighten(landmarks),
      AU24_lipPress: this.calculateLipPress(landmarks),
      AU25_lipsPart: this.calculateLipsPart(landmarks),
      AU26_jawDrop: this.calculateJawDrop(landmarks),
      AU27_mouthStretch: this.calculateMouthStretch(landmarks),
      
      // Head movement AUs
      AU51_headTurnLeft: this.calculateHeadTurnLeft(landmarks),
      AU52_headTurnRight: this.calculateHeadTurnRight(landmarks),
      AU53_headUp: this.calculateHeadUp(landmarks),
      AU54_headDown: this.calculateHeadDown(landmarks),
      AU55_headTiltLeft: this.calculateHeadTiltLeft(landmarks),
      AU56_headTiltRight: this.calculateHeadTiltRight(landmarks),
    };
    
    return aus;
  }
  
  /**
   * Calculate emotion scores from action units
   */
  private calculateEmotionScores(aus: FacialActionUnits): StudentEmotion['emotions'] {
    const scores: StudentEmotion['emotions'] = {
      engaged: EMOTION_RULES.engaged(aus),
      confused: EMOTION_RULES.confused(aus),
      bored: EMOTION_RULES.bored(aus),
      frustrated: EMOTION_RULES.frustrated(aus),
      focused: EMOTION_RULES.focused(aus),
      drowsy: EMOTION_RULES.drowsy(aus),
      neutral: EMOTION_RULES.neutral(aus),
    };
    
    // Normalize scores to sum to 1
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] /= total;
      });
    }
    
    return scores;
  }
  
  /**
   * Determine primary emotion from scores
   */
  private determinePrimaryEmotion(
    scores: StudentEmotion['emotions']
  ): keyof StudentEmotion['emotions'] {
    
    let maxScore = 0;
    let primaryEmotion: keyof StudentEmotion['emotions'] = 'neutral';
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore && score > this.config.minConfidenceThreshold) {
        maxScore = score;
        primaryEmotion = emotion as keyof StudentEmotion['emotions'];
      }
    });
    
    // Default to neutral if no emotion meets confidence threshold
    if (maxScore < this.config.neutralConfidenceThreshold) {
      primaryEmotion = 'neutral';
    }
    
    return primaryEmotion;
  }
  
  /**
   * Calculate Valence-Arousal-Dominance (VAD) values
   */
  private calculateVAD(
    scores: StudentEmotion['emotions'],
    aus: FacialActionUnits
  ): { valence: number; arousal: number; dominance: number } {
    
    // Valence: positive (happy, engaged) vs negative (frustrated, bored)
    const valence = 
      scores.engaged * 0.8 +
      scores.focused * 0.6 +
      scores.neutral * 0.0 +
      scores.confused * (-0.2) +
      scores.bored * (-0.6) +
      scores.frustrated * (-0.8) +
      scores.drowsy * (-0.4);
    
    // Arousal: high energy (engaged, frustrated) vs low energy (bored, drowsy)
    const arousal = 
      scores.engaged * 0.8 +
      scores.frustrated * 0.7 +
      scores.confused * 0.5 +
      scores.focused * 0.4 +
      scores.neutral * 0.0 +
      scores.bored * (-0.5) +
      scores.drowsy * (-0.8);
    
    // Dominance: confident vs submissive
    const dominance = 
      scores.engaged * 0.6 +
      scores.focused * 0.4 +
      scores.frustrated * 0.3 +
      scores.neutral * 0.0 +
      scores.confused * (-0.4) +
      scores.bored * (-0.3) +
      scores.drowsy * (-0.6);
    
    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal + 1) / 2), // Normalize to 0-1
      dominance: Math.max(0, Math.min(1, dominance + 1) / 2), // Normalize to 0-1
    };
  }
  
  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    scores: StudentEmotion['emotions'],
    faceConfidence: number
  ): number {
    
    // Find the highest emotion score
    const maxScore = Math.max(...Object.values(scores));
    
    // Calculate confidence based on max score and face quality
    const emotionConfidence = maxScore;
    const overallConfidence = (emotionConfidence * 0.7 + faceConfidence * 0.3);
    
    return Math.max(0, Math.min(1, overallConfidence));
  }
  
  /**
   * Apply temporal smoothing to emotion
   */
  private applyTemporalSmoothing(emotion: StudentEmotion): StudentEmotion {
    if (this.emotionHistory.length === 0) {
      return emotion;
    }
    
    const alpha = this.config.smoothingAlpha;
    const previous = this.emotionHistory[this.emotionHistory.length - 1];
    
    // Smooth emotion scores
    const smoothedScores: StudentEmotion['emotions'] = {} as StudentEmotion['emotions'];
    Object.keys(emotion.emotions).forEach(key => {
      const emotionKey = key as keyof StudentEmotion['emotions'];
      smoothedScores[emotionKey] = 
        alpha * emotion.emotions[emotionKey] + 
        (1 - alpha) * previous.emotions[emotionKey];
    });
    
    // Smooth VAD values
    const smoothedEmotion: StudentEmotion = {
      valence: alpha * emotion.valence + (1 - alpha) * previous.valence,
      arousal: alpha * emotion.arousal + (1 - alpha) * previous.arousal,
      dominance: alpha * emotion.dominance + (1 - alpha) * previous.dominance,
      emotions: smoothedScores,
      primaryEmotion: this.determinePrimaryEmotion(smoothedScores),
      confidence: Math.max(emotion.confidence, previous.confidence * 0.9),
    };
    
    return smoothedEmotion;
  }
  
  /**
   * Update emotion and AU history
   */
  private updateHistory(emotion: StudentEmotion, aus: FacialActionUnits): void {
    this.emotionHistory.push(emotion);
    this.auHistory.push(aus);
    
    // Maintain window size
    if (this.emotionHistory.length > this.config.temporalWindowSize) {
      this.emotionHistory.shift();
      this.auHistory.shift();
    }
  }
  
  // Action Unit calculation methods (simplified implementations)
  // In production, these would use more sophisticated geometric analysis
  
  private calculateInnerBrowRaise(landmarks: Point[]): number {
    const leftInner = landmarks[EMOTION_LANDMARKS.leftEyebrowInner];
    const rightInner = landmarks[EMOTION_LANDMARKS.rightEyebrowInner];
    const leftTop = landmarks[EMOTION_LANDMARKS.leftEyeTop];
    const rightTop = landmarks[EMOTION_LANDMARKS.rightEyeTop];
    
    if (!leftInner || !rightInner || !leftTop || !rightTop) return 0;
    
    const leftRaise = (leftInner.y - leftTop.y) / 50; // Normalize
    const rightRaise = (rightInner.y - rightTop.y) / 50;
    
    return Math.max(0, Math.min(1, (leftRaise + rightRaise) / 2));
  }
  
  private calculateOuterBrowRaise(landmarks: Point[]): number {
    const leftOuter = landmarks[EMOTION_LANDMARKS.leftEyebrowOuter];
    const rightOuter = landmarks[EMOTION_LANDMARKS.rightEyebrowOuter];
    const leftTop = landmarks[EMOTION_LANDMARKS.leftEyeTop];
    const rightTop = landmarks[EMOTION_LANDMARKS.rightEyeTop];
    
    if (!leftOuter || !rightOuter || !leftTop || !rightTop) return 0;
    
    const leftRaise = (leftOuter.y - leftTop.y) / 50;
    const rightRaise = (rightOuter.y - rightTop.y) / 50;
    
    return Math.max(0, Math.min(1, (leftRaise + rightRaise) / 2));
  }
  
  private calculateBrowLower(landmarks: Point[]): number {
    const leftBrow = landmarks[EMOTION_LANDMARKS.leftEyebrowTop];
    const rightBrow = landmarks[EMOTION_LANDMARKS.rightEyebrowTop];
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeTop];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeTop];
    
    if (!leftBrow || !rightBrow || !leftEye || !rightEye) return 0;
    
    const leftDistance = Math.abs(leftBrow.y - leftEye.y);
    const rightDistance = Math.abs(rightBrow.y - rightEye.y);
    const avgDistance = (leftDistance + rightDistance) / 2;
    
    // Lower values indicate brow lowering
    return Math.max(0, Math.min(1, 1 - (avgDistance / 30)));
  }
  
  private calculateUpperLidRaise(landmarks: Point[]): number {
    const leftTop = landmarks[EMOTION_LANDMARKS.leftEyeTop];
    const leftBottom = landmarks[EMOTION_LANDMARKS.leftEyeBottom];
    const rightTop = landmarks[EMOTION_LANDMARKS.rightEyeTop];
    const rightBottom = landmarks[EMOTION_LANDMARKS.rightEyeBottom];
    
    if (!leftTop || !leftBottom || !rightTop || !rightBottom) return 0;
    
    const leftHeight = Math.abs(leftTop.y - leftBottom.y);
    const rightHeight = Math.abs(rightTop.y - rightBottom.y);
    const avgHeight = (leftHeight + rightHeight) / 2;
    
    // Normalize eye opening (higher values = more open)
    return Math.max(0, Math.min(1, avgHeight / 20));
  }
  
  private calculateCheekRaise(landmarks: Point[]): number {
    const leftCheek = landmarks[EMOTION_LANDMARKS.leftCheek];
    const rightCheek = landmarks[EMOTION_LANDMARKS.rightCheek];
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeBottom];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeBottom];
    
    if (!leftCheek || !rightCheek || !leftEye || !rightEye) return 0;
    
    const leftRaise = Math.max(0, leftEye.y - leftCheek.y);
    const rightRaise = Math.max(0, rightEye.y - rightCheek.y);
    
    return Math.max(0, Math.min(1, (leftRaise + rightRaise) / 40));
  }
  
  private calculateLidTighten(landmarks: Point[]): number {
    // Simplified: based on eye aspect ratio
    return 1 - this.calculateUpperLidRaise(landmarks);
  }
  
  private calculateNoseWrinkle(landmarks: Point[]): number {
    // Simplified: based on nose landmark positions
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    const noseLeft = landmarks[EMOTION_LANDMARKS.noseLeft];
    const noseRight = landmarks[EMOTION_LANDMARKS.noseRight];
    
    if (!noseTip || !noseLeft || !noseRight) return 0;
    
    const noseWidth = Math.abs(noseRight.x - noseLeft.x);
    return Math.max(0, Math.min(1, (noseWidth - 20) / 10)); // Normalize
  }
  
  private calculateUpperLipRaise(landmarks: Point[]): number {
    const upperLip = landmarks[EMOTION_LANDMARKS.upperLipTop];
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    
    if (!upperLip || !noseTip) return 0;
    
    const distance = Math.abs(upperLip.y - noseTip.y);
    return Math.max(0, Math.min(1, 1 - (distance / 30)));
  }
  
  private calculateLipCornerPull(landmarks: Point[]): number {
    const leftCorner = landmarks[EMOTION_LANDMARKS.lipCornerLeft];
    const rightCorner = landmarks[EMOTION_LANDMARKS.lipCornerRight];
    const mouthTop = landmarks[EMOTION_LANDMARKS.mouthTop];
    
    if (!leftCorner || !rightCorner || !mouthTop) return 0;
    
    // Calculate smile curvature
    const leftPull = Math.max(0, mouthTop.y - leftCorner.y);
    const rightPull = Math.max(0, mouthTop.y - rightCorner.y);
    
    return Math.max(0, Math.min(1, (leftPull + rightPull) / 20));
  }
  
  private calculateLipCornerDepress(landmarks: Point[]): number {
    const leftCorner = landmarks[EMOTION_LANDMARKS.lipCornerLeft];
    const rightCorner = landmarks[EMOTION_LANDMARKS.lipCornerRight];
    const mouthBottom = landmarks[EMOTION_LANDMARKS.mouthBottom];
    
    if (!leftCorner || !rightCorner || !mouthBottom) return 0;
    
    // Calculate frown curvature
    const leftDepress = Math.max(0, leftCorner.y - mouthBottom.y);
    const rightDepress = Math.max(0, rightCorner.y - mouthBottom.y);
    
    return Math.max(0, Math.min(1, (leftDepress + rightDepress) / 20));
  }
  
  private calculateLowerLipDepress(landmarks: Point[]): number {
    const lowerLip = landmarks[EMOTION_LANDMARKS.lowerLipBottom];
    const chin = landmarks[EMOTION_LANDMARKS.chin];
    
    if (!lowerLip || !chin) return 0;
    
    const distance = Math.abs(lowerLip.y - chin.y);
    return Math.max(0, Math.min(1, 1 - (distance / 40)));
  }
  
  private calculateChinRaise(landmarks: Point[]): number {
    const chin = landmarks[EMOTION_LANDMARKS.chin];
    const mouthBottom = landmarks[EMOTION_LANDMARKS.mouthBottom];
    
    if (!chin || !mouthBottom) return 0;
    
    const distance = Math.abs(chin.y - mouthBottom.y);
    return Math.max(0, Math.min(1, 1 - (distance / 30)));
  }
  
  private calculateLipStretch(landmarks: Point[]): number {
    const leftCorner = landmarks[EMOTION_LANDMARKS.lipCornerLeft];
    const rightCorner = landmarks[EMOTION_LANDMARKS.lipCornerRight];
    
    if (!leftCorner || !rightCorner) return 0;
    
    const width = Math.abs(rightCorner.x - leftCorner.x);
    return Math.max(0, Math.min(1, (width - 40) / 20)); // Normalize
  }
  
  private calculateLipTighten(landmarks: Point[]): number {
    const upperLip = landmarks[EMOTION_LANDMARKS.upperLipBottom];
    const lowerLip = landmarks[EMOTION_LANDMARKS.lowerLipTop];
    
    if (!upperLip || !lowerLip) return 0;
    
    const thickness = Math.abs(upperLip.y - lowerLip.y);
    return Math.max(0, Math.min(1, 1 - (thickness / 10)));
  }
  
  private calculateLipPress(landmarks: Point[]): number {
    // Similar to lip tighten but more extreme
    return this.calculateLipTighten(landmarks) * 1.2;
  }
  
  private calculateLipsPart(landmarks: Point[]): number {
    const upperLip = landmarks[EMOTION_LANDMARKS.upperLipBottom];
    const lowerLip = landmarks[EMOTION_LANDMARKS.lowerLipTop];
    
    if (!upperLip || !lowerLip) return 0;
    
    const opening = Math.abs(upperLip.y - lowerLip.y);
    return Math.max(0, Math.min(1, opening / 15));
  }
  
  private calculateJawDrop(landmarks: Point[]): number {
    const mouthBottom = landmarks[EMOTION_LANDMARKS.mouthBottom];
    const chin = landmarks[EMOTION_LANDMARKS.chin];
    
    if (!mouthBottom || !chin) return 0;
    
    const distance = Math.abs(mouthBottom.y - chin.y);
    return Math.max(0, Math.min(1, (distance - 20) / 30));
  }
  
  private calculateMouthStretch(landmarks: Point[]): number {
    // Combination of lip stretch and jaw drop
    return (this.calculateLipStretch(landmarks) + this.calculateJawDrop(landmarks)) / 2;
  }
  
  // Head movement calculations (simplified)
  private calculateHeadTurnLeft(landmarks: Point[]): number {
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeLeft];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeRight];
    
    if (!noseTip || !leftEye || !rightEye) return 0;
    
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const offset = noseTip.x - eyeCenter.x;
    
    return Math.max(0, Math.min(1, -offset / 20)); // Negative offset = left turn
  }
  
  private calculateHeadTurnRight(landmarks: Point[]): number {
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeLeft];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeRight];
    
    if (!noseTip || !leftEye || !rightEye) return 0;
    
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const offset = noseTip.x - eyeCenter.x;
    
    return Math.max(0, Math.min(1, offset / 20)); // Positive offset = right turn
  }
  
  private calculateHeadUp(landmarks: Point[]): number {
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    const chin = landmarks[EMOTION_LANDMARKS.chin];
    
    if (!noseTip || !chin) return 0;
    
    const faceHeight = Math.abs(noseTip.y - chin.y);
    return Math.max(0, Math.min(1, 1 - (faceHeight / 100))); // Shorter face = head up
  }
  
  private calculateHeadDown(landmarks: Point[]): number {
    const noseTip = landmarks[EMOTION_LANDMARKS.noseTip];
    const chin = landmarks[EMOTION_LANDMARKS.chin];
    
    if (!noseTip || !chin) return 0;
    
    const faceHeight = Math.abs(noseTip.y - chin.y);
    return Math.max(0, Math.min(1, (faceHeight - 80) / 40)); // Longer face = head down
  }
  
  private calculateHeadTiltLeft(landmarks: Point[]): number {
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeLeft];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeRight];
    
    if (!leftEye || !rightEye) return 0;
    
    const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    return Math.max(0, Math.min(1, -eyeAngle / (Math.PI / 4))); // Negative angle = left tilt
  }
  
  private calculateHeadTiltRight(landmarks: Point[]): number {
    const leftEye = landmarks[EMOTION_LANDMARKS.leftEyeLeft];
    const rightEye = landmarks[EMOTION_LANDMARKS.rightEyeRight];
    
    if (!leftEye || !rightEye) return 0;
    
    const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    return Math.max(0, Math.min(1, eyeAngle / (Math.PI / 4))); // Positive angle = right tilt
  }
  
  /**
   * Reset temporal state
   */
  public reset(): void {
    this.emotionHistory = [];
    this.auHistory = [];
  }
  
  /**
   * Get current emotion history for analysis
   */
  public getEmotionHistory(): StudentEmotion[] {
    return [...this.emotionHistory];
  }
  
  /**
   * Get current action unit history for analysis
   */
  public getActionUnitHistory(): FacialActionUnits[] {
    return [...this.auHistory];
  }
}

// Singleton instance
export const emotionRecognizer = new EmotionRecognizer();