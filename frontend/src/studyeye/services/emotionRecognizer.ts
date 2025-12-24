/**
 * Emotion Recognition Service
 * 
 * Robust emotion recognition using facial geometry and action units.
 * Properly detects smiles, expressions, and maps them to engagement states.
 */

import type { Point } from '../types';
import type { StudentEmotion } from '../types/studentState';

export interface EmotionConfig {
  minConfidenceThreshold: number;
  neutralConfidenceThreshold: number;
  temporalWindowSize: number;
  smoothingAlpha: number;
  minLandmarksRequired: number;
  faceQualityThreshold: number;
}

/**
 * FaceMesh landmark indices for emotion recognition
 * Using correct MediaPipe FaceMesh indices
 */
const LANDMARKS = {
  // Mouth landmarks
  upperLipTop: 13,
  upperLipBottom: 14,
  lowerLipTop: 17,
  lowerLipBottom: 0,
  mouthLeft: 61,
  mouthRight: 291,
  mouthTop: 13,
  mouthBottom: 14,
  
  // More precise mouth corners
  leftMouthCorner: 61,
  rightMouthCorner: 291,
  
  // Upper/lower lip inner
  upperLipInner: 13,
  lowerLipInner: 14,
  
  // Eye landmarks
  leftEyeTop: 159,
  leftEyeBottom: 145,
  leftEyeInner: 133,
  leftEyeOuter: 33,
  
  rightEyeTop: 386,
  rightEyeBottom: 374,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  
  // Eyebrow landmarks
  leftEyebrowInner: 107,
  leftEyebrowOuter: 66,
  leftEyebrowTop: 105,
  
  rightEyebrowInner: 336,
  rightEyebrowOuter: 296,
  rightEyebrowTop: 334,
  
  // Face structure
  noseTip: 4,
  noseBottom: 2,
  chin: 152,
  foreheadCenter: 10,
  
  // Cheeks (for smile detection)
  leftCheekHigh: 50,
  rightCheekHigh: 280,
  leftCheekLow: 123,
  rightCheekLow: 352,
};

/**
 * Facial feature measurements for emotion detection
 */
interface FacialFeatures {
  // Smile indicators
  mouthWidth: number;           // Horizontal mouth stretch
  mouthHeight: number;          // Vertical mouth opening
  mouthAspectRatio: number;     // Width/Height ratio
  lipCornerRaise: number;       // How much corners are raised (smile)
  mouthOpenness: number;        // 0-1, how open the mouth is
  teethVisible: number;         // Estimated teeth visibility
  
  // Eye indicators
  leftEyeOpenness: number;      // 0-1
  rightEyeOpenness: number;     // 0-1
  eyeSquint: number;            // Duchenne smile indicator
  
  // Eyebrow indicators
  leftBrowRaise: number;        // 0-1
  rightBrowRaise: number;       // 0-1
  browFurrow: number;           // 0-1, brows pulled together
  
  // Cheek indicators
  cheekRaise: number;           // 0-1, raised cheeks (smile)
  
  // Face metrics for normalization
  faceWidth: number;
  faceHeight: number;
}

export class EmotionRecognizer {
  private config: Required<EmotionConfig>;
  private emotionHistory: StudentEmotion[] = [];
  private featureHistory: FacialFeatures[] = [];
  private baselineFeatures: FacialFeatures | null = null;
  private frameCount: number = 0;
  
  constructor(config: Partial<EmotionConfig> = {}) {
    this.config = {
      minConfidenceThreshold: 0.3,
      neutralConfidenceThreshold: 0.25,
      temporalWindowSize: 8,
      smoothingAlpha: 0.4,
      minLandmarksRequired: 100,
      faceQualityThreshold: 0.5,
      ...config,
    };
  }

  /**
   * Main emotion recognition entry point
   */
  public recognizeEmotion(
    landmarks: Point[],
    faceConfidence: number = 1.0
  ): StudentEmotion | null {
    
    if (!landmarks || landmarks.length < this.config.minLandmarksRequired) {
      return this.getDefaultEmotion();
    }
    
    if (faceConfidence < this.config.faceQualityThreshold) {
      return this.getDefaultEmotion();
    }
    
    try {
      // Extract facial features
      const features = this.extractFacialFeatures(landmarks);
      
      // Update baseline (first few frames establish neutral)
      this.updateBaseline(features);
      
      // Calculate emotion scores based on features
      const emotionScores = this.calculateEmotionScores(features);
      
      // Determine primary emotion
      const primaryEmotion = this.determinePrimaryEmotion(emotionScores);
      
      // Calculate VAD (Valence-Arousal-Dominance)
      const vad = this.calculateVAD(emotionScores, features);
      
      // Build emotion result
      const emotion: StudentEmotion = {
        valence: vad.valence,
        arousal: vad.arousal,
        dominance: vad.dominance,
        emotions: emotionScores,
        primaryEmotion,
        confidence: this.calculateConfidence(emotionScores, features, faceConfidence),
      };
      
      // Apply temporal smoothing
      const smoothedEmotion = this.applyTemporalSmoothing(emotion);
      
      // Update history
      this.updateHistory(smoothedEmotion, features);
      this.frameCount++;
      
      return smoothedEmotion;
      
    } catch (error) {
      console.error('Emotion recognition error:', error);
      return this.getDefaultEmotion();
    }
  }

  /**
   * Extract facial features from landmarks
   */
  private extractFacialFeatures(landmarks: Point[]): FacialFeatures {
    // Get key landmarks with safety checks
    const get = (idx: number): Point => landmarks[idx] || { x: 0, y: 0 };
    
    // Face dimensions for normalization
    const leftFace = get(234);  // Left face edge
    const rightFace = get(454); // Right face edge
    const forehead = get(10);   // Top of face
    const chin = get(LANDMARKS.chin);
    
    const faceWidth = Math.abs(rightFace.x - leftFace.x) || 100;
    const faceHeight = Math.abs(chin.y - forehead.y) || 150;
    
    // === MOUTH ANALYSIS ===
    const mouthLeft = get(LANDMARKS.leftMouthCorner);
    const mouthRight = get(LANDMARKS.rightMouthCorner);
    const mouthTop = get(LANDMARKS.upperLipTop);
    const mouthBottom = get(LANDMARKS.lowerLipInner);
    const upperLipBottom = get(LANDMARKS.upperLipBottom);
    const lowerLipTop = get(LANDMARKS.lowerLipTop);
    
    // Mouth dimensions
    const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
    const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
    const mouthAspectRatio = mouthHeight > 0 ? mouthWidth / mouthHeight : 0;
    
    // Lip corner raise (CRITICAL for smile detection)
    // When smiling, mouth corners move UP (lower y value) relative to mouth center
    const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
    const leftCornerRaise = mouthCenterY - mouthLeft.y;
    const rightCornerRaise = mouthCenterY - mouthRight.y;
    const lipCornerRaise = Math.max(0, (leftCornerRaise + rightCornerRaise) / 2) / faceHeight;
    
    // Mouth openness (gap between lips)
    const lipGap = Math.max(0, lowerLipTop.y - upperLipBottom.y);
    const mouthOpenness = Math.min(1, lipGap / (faceHeight * 0.15));
    
    // Teeth visibility estimate (large mouth opening + wide mouth = teeth showing)
    const teethVisible = Math.min(1, (mouthOpenness * 0.6 + (mouthWidth / faceWidth) * 0.4));
    
    // === EYE ANALYSIS ===
    const leftEyeTop = get(LANDMARKS.leftEyeTop);
    const leftEyeBottom = get(LANDMARKS.leftEyeBottom);
    const rightEyeTop = get(LANDMARKS.rightEyeTop);
    const rightEyeBottom = get(LANDMARKS.rightEyeBottom);
    
    const leftEyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
    const rightEyeHeight = Math.abs(rightEyeBottom.y - rightEyeTop.y);
    
    const leftEyeOpenness = Math.min(1, leftEyeHeight / (faceHeight * 0.08));
    const rightEyeOpenness = Math.min(1, rightEyeHeight / (faceHeight * 0.08));
    
    // Eye squint (Duchenne smile - eyes narrow when genuinely smiling)
    const avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;
    const eyeSquint = Math.max(0, 1 - avgEyeOpenness);
    
    // === EYEBROW ANALYSIS ===
    const leftBrowTop = get(LANDMARKS.leftEyebrowTop);
    const rightBrowTop = get(LANDMARKS.rightEyebrowTop);
    const leftBrowInner = get(LANDMARKS.leftEyebrowInner);
    const rightBrowInner = get(LANDMARKS.rightEyebrowInner);
    
    // Brow raise (distance from eye to brow)
    const leftBrowToEye = Math.abs(leftEyeTop.y - leftBrowTop.y);
    const rightBrowToEye = Math.abs(rightEyeTop.y - rightBrowTop.y);
    const leftBrowRaise = Math.min(1, leftBrowToEye / (faceHeight * 0.12));
    const rightBrowRaise = Math.min(1, rightBrowToEye / (faceHeight * 0.12));
    
    // Brow furrow (inner brows pulled together)
    const browInnerDistance = Math.abs(rightBrowInner.x - leftBrowInner.x);
    const browFurrow = Math.max(0, 1 - (browInnerDistance / (faceWidth * 0.25)));
    
    // === CHEEK ANALYSIS ===
    const leftCheekHigh = get(LANDMARKS.leftCheekHigh);
    const rightCheekHigh = get(LANDMARKS.rightCheekHigh);
    const leftCheekLow = get(LANDMARKS.leftCheekLow);
    const rightCheekLow = get(LANDMARKS.rightCheekLow);
    
    // Cheek raise (cheeks move up when smiling)
    const leftCheekRaise = Math.max(0, leftCheekLow.y - leftCheekHigh.y) / faceHeight;
    const rightCheekRaise = Math.max(0, rightCheekLow.y - rightCheekHigh.y) / faceHeight;
    const cheekRaise = (leftCheekRaise + rightCheekRaise) / 2;
    
    return {
      mouthWidth,
      mouthHeight,
      mouthAspectRatio,
      lipCornerRaise,
      mouthOpenness,
      teethVisible,
      leftEyeOpenness,
      rightEyeOpenness,
      eyeSquint,
      leftBrowRaise,
      rightBrowRaise,
      browFurrow,
      cheekRaise,
      faceWidth,
      faceHeight,
    };
  }

  /**
   * Update baseline features from first few frames
   */
  private updateBaseline(features: FacialFeatures): void {
    if (this.frameCount < 10) {
      if (!this.baselineFeatures) {
        this.baselineFeatures = { ...features };
      } else {
        // Running average for baseline
        const alpha = 0.3;
        Object.keys(this.baselineFeatures).forEach(key => {
          const k = key as keyof FacialFeatures;
          (this.baselineFeatures as any)[k] = 
            alpha * features[k] + (1 - alpha) * (this.baselineFeatures as any)[k];
        });
      }
    }
  }

  /**
   * Calculate emotion scores from facial features
   */
  private calculateEmotionScores(features: FacialFeatures): StudentEmotion['emotions'] {
    // Normalize features relative to baseline if available
    const baseline = this.baselineFeatures || features;
    
    // === ENGAGED/HAPPY Detection ===
    // Key indicators: lip corner raise, mouth width, cheek raise, eye squint
    const smileScore = this.calculateSmileScore(features, baseline);
    
    // === FOCUSED Detection ===
    // Key indicators: neutral mouth, slight brow furrow, steady gaze
    const focusedScore = this.calculateFocusedScore(features, baseline);
    
    // === CONFUSED Detection ===
    // Key indicators: asymmetric brow raise, slight frown, head tilt
    const confusedScore = this.calculateConfusedScore(features, baseline);
    
    // === BORED Detection ===
    // Key indicators: droopy eyes, slack mouth, low arousal
    const boredScore = this.calculateBoredScore(features, baseline);
    
    // === FRUSTRATED Detection ===
    // Key indicators: brow furrow, tight lips, tense face
    const frustratedScore = this.calculateFrustratedScore(features, baseline);
    
    // === DROWSY Detection ===
    // Key indicators: heavy eyelids, slack jaw, low energy
    const drowsyScore = this.calculateDrowsyScore(features, baseline);
    
    // === NEUTRAL Detection ===
    // Key indicators: minimal facial activity
    const neutralScore = this.calculateNeutralScore(features, baseline);
    
    // Raw scores
    const rawScores = {
      engaged: smileScore,      // Happy/smiling maps to engaged
      confused: confusedScore,
      bored: boredScore,
      frustrated: frustratedScore,
      focused: focusedScore,
      drowsy: drowsyScore,
      neutral: neutralScore,
    };
    
    // Normalize to sum to 1
    const total = Object.values(rawScores).reduce((sum, s) => sum + s, 0);
    const normalized: StudentEmotion['emotions'] = {} as StudentEmotion['emotions'];
    
    if (total > 0) {
      Object.keys(rawScores).forEach(key => {
        normalized[key as keyof StudentEmotion['emotions']] = 
          rawScores[key as keyof typeof rawScores] / total;
      });
    } else {
      // Default to neutral
      normalized.neutral = 1;
      normalized.engaged = 0;
      normalized.confused = 0;
      normalized.bored = 0;
      normalized.frustrated = 0;
      normalized.focused = 0;
      normalized.drowsy = 0;
    }
    
    return normalized;
  }

  /**
   * Calculate smile/happy/engaged score
   */
  private calculateSmileScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Lip corner raise is the PRIMARY smile indicator
    // Normalized lip corner raise > 0.02 indicates smile
    const cornerRaiseScore = Math.min(1, features.lipCornerRaise * 15);
    score += cornerRaiseScore * 0.35;
    
    // Wide mouth (stretched horizontally)
    const mouthWidthRatio = features.mouthWidth / features.faceWidth;
    const wideMouthScore = Math.min(1, Math.max(0, (mouthWidthRatio - 0.35) * 5));
    score += wideMouthScore * 0.25;
    
    // Mouth openness (laughing = open mouth)
    score += features.mouthOpenness * 0.15;
    
    // Cheek raise (Duchenne marker)
    score += Math.min(1, features.cheekRaise * 8) * 0.15;
    
    // Eye squint (genuine smile narrows eyes)
    if (features.lipCornerRaise > 0.01) {
      score += features.eyeSquint * 0.1;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate focused score
   */
  private calculateFocusedScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Neutral/closed mouth
    const mouthClosed = 1 - features.mouthOpenness;
    score += mouthClosed * 0.3;
    
    // Slight brow activity (concentration)
    const browActivity = (features.browFurrow + features.leftBrowRaise + features.rightBrowRaise) / 3;
    if (browActivity > 0.1 && browActivity < 0.5) {
      score += 0.3;
    }
    
    // Eyes open and alert
    const eyeOpenness = (features.leftEyeOpenness + features.rightEyeOpenness) / 2;
    if (eyeOpenness > 0.4 && eyeOpenness < 0.9) {
      score += 0.25;
    }
    
    // No smile (focused is not happy)
    const noSmile = 1 - Math.min(1, features.lipCornerRaise * 10);
    score += noSmile * 0.15;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate confused score
   */
  private calculateConfusedScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Asymmetric brow raise
    const browAsymmetry = Math.abs(features.leftBrowRaise - features.rightBrowRaise);
    score += Math.min(1, browAsymmetry * 3) * 0.35;
    
    // Brow furrow
    score += features.browFurrow * 0.25;
    
    // Slight mouth tension
    const mouthTension = 1 - features.mouthOpenness;
    if (mouthTension > 0.5 && features.lipCornerRaise < 0.02) {
      score += 0.2;
    }
    
    // Squinted eyes (trying to understand)
    score += features.eyeSquint * 0.2;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate bored score
   */
  private calculateBoredScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Droopy/half-closed eyes
    const avgEyeOpenness = (features.leftEyeOpenness + features.rightEyeOpenness) / 2;
    if (avgEyeOpenness < 0.5) {
      score += (0.5 - avgEyeOpenness) * 0.4;
    }
    
    // Slack/neutral mouth
    if (features.mouthOpenness < 0.2 && features.lipCornerRaise < 0.01) {
      score += 0.3;
    }
    
    // Low brow activity
    const lowBrowActivity = 1 - (features.browFurrow + features.leftBrowRaise + features.rightBrowRaise) / 3;
    score += lowBrowActivity * 0.2;
    
    // No smile
    const noSmile = 1 - Math.min(1, features.lipCornerRaise * 10);
    score += noSmile * 0.1;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate frustrated score
   */
  private calculateFrustratedScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Strong brow furrow
    score += features.browFurrow * 0.4;
    
    // Tight/pressed lips
    const tightLips = 1 - features.mouthOpenness;
    if (tightLips > 0.7 && features.lipCornerRaise < 0) {
      score += 0.3;
    }
    
    // Narrowed eyes (not from smiling)
    if (features.eyeSquint > 0.3 && features.lipCornerRaise < 0.01) {
      score += features.eyeSquint * 0.2;
    }
    
    // Lowered brows
    const lowBrows = 1 - (features.leftBrowRaise + features.rightBrowRaise) / 2;
    score += lowBrows * 0.1;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate drowsy score
   */
  private calculateDrowsyScore(features: FacialFeatures, baseline: FacialFeatures): number {
    let score = 0;
    
    // Heavy/closing eyelids
    const avgEyeOpenness = (features.leftEyeOpenness + features.rightEyeOpenness) / 2;
    if (avgEyeOpenness < 0.4) {
      score += (0.4 - avgEyeOpenness) * 0.5;
    }
    
    // Slack jaw/mouth slightly open
    if (features.mouthOpenness > 0.1 && features.mouthOpenness < 0.4) {
      score += 0.25;
    }
    
    // Low facial activity overall
    const lowActivity = 1 - (features.browFurrow + features.lipCornerRaise * 5 + features.cheekRaise * 3) / 3;
    score += Math.max(0, lowActivity) * 0.25;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate neutral score
   */
  private calculateNeutralScore(features: FacialFeatures, baseline: FacialFeatures): number {
    // Neutral = low activity across all features
    const smileActivity = features.lipCornerRaise * 10;
    const browActivity = features.browFurrow + Math.abs(features.leftBrowRaise - 0.5) + Math.abs(features.rightBrowRaise - 0.5);
    const mouthActivity = features.mouthOpenness;
    const eyeActivity = Math.abs((features.leftEyeOpenness + features.rightEyeOpenness) / 2 - 0.6);
    
    const totalActivity = (smileActivity + browActivity + mouthActivity + eyeActivity) / 4;
    
    return Math.max(0, 1 - totalActivity * 2);
  }

  /**
   * Determine primary emotion from scores
   */
  private determinePrimaryEmotion(scores: StudentEmotion['emotions']): keyof StudentEmotion['emotions'] {
    let maxScore = 0;
    let primaryEmotion: keyof StudentEmotion['emotions'] = 'neutral';
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as keyof StudentEmotion['emotions'];
      }
    });
    
    // Only return non-neutral if confidence is high enough
    if (primaryEmotion !== 'neutral' && maxScore < this.config.minConfidenceThreshold) {
      // Check if neutral is close
      if (scores.neutral > maxScore * 0.8) {
        return 'neutral';
      }
    }
    
    return primaryEmotion;
  }

  /**
   * Calculate VAD (Valence-Arousal-Dominance)
   */
  private calculateVAD(
    scores: StudentEmotion['emotions'],
    features: FacialFeatures
  ): { valence: number; arousal: number; dominance: number } {
    
    // Valence: positive (engaged/happy) vs negative (frustrated/bored)
    const valence = 
      scores.engaged * 0.9 +      // Happy/smiling is very positive
      scores.focused * 0.3 +
      scores.neutral * 0.0 +
      scores.confused * (-0.3) +
      scores.bored * (-0.5) +
      scores.frustrated * (-0.7) +
      scores.drowsy * (-0.3);
    
    // Arousal: high energy vs low energy
    const arousal = 
      scores.engaged * 0.8 +      // Smiling/laughing is high arousal
      scores.frustrated * 0.6 +
      scores.confused * 0.4 +
      scores.focused * 0.3 +
      scores.neutral * 0.0 +
      scores.bored * (-0.4) +
      scores.drowsy * (-0.7);
    
    // Dominance: confident vs submissive
    const dominance = 
      scores.engaged * 0.5 +
      scores.focused * 0.4 +
      scores.frustrated * 0.2 +
      scores.neutral * 0.0 +
      scores.confused * (-0.3) +
      scores.bored * (-0.2) +
      scores.drowsy * (-0.4);
    
    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, (arousal + 1) / 2)),
      dominance: Math.max(0, Math.min(1, (dominance + 1) / 2)),
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(
    scores: StudentEmotion['emotions'],
    features: FacialFeatures,
    faceConfidence: number
  ): number {
    // Max emotion score indicates how clear the expression is
    const maxScore = Math.max(...Object.values(scores));
    
    // Feature clarity (are features well-defined?)
    const featureClarity = Math.min(1, 
      (features.faceWidth / 100) * 0.3 +
      (features.faceHeight / 150) * 0.3 +
      0.4
    );
    
    // Combined confidence
    const confidence = maxScore * 0.5 + faceConfidence * 0.3 + featureClarity * 0.2;
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Apply temporal smoothing
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
      const k = key as keyof StudentEmotion['emotions'];
      smoothedScores[k] = alpha * emotion.emotions[k] + (1 - alpha) * previous.emotions[k];
    });
    
    // Re-determine primary emotion from smoothed scores
    const primaryEmotion = this.determinePrimaryEmotion(smoothedScores);
    
    return {
      valence: alpha * emotion.valence + (1 - alpha) * previous.valence,
      arousal: alpha * emotion.arousal + (1 - alpha) * previous.arousal,
      dominance: alpha * emotion.dominance + (1 - alpha) * previous.dominance,
      emotions: smoothedScores,
      primaryEmotion,
      confidence: Math.max(emotion.confidence, previous.confidence * 0.95),
    };
  }

  /**
   * Update history
   */
  private updateHistory(emotion: StudentEmotion, features: FacialFeatures): void {
    this.emotionHistory.push(emotion);
    this.featureHistory.push(features);
    
    while (this.emotionHistory.length > this.config.temporalWindowSize) {
      this.emotionHistory.shift();
      this.featureHistory.shift();
    }
  }

  /**
   * Get default emotion when detection fails
   */
  private getDefaultEmotion(): StudentEmotion {
    return {
      valence: 0,
      arousal: 0.5,
      dominance: 0.5,
      emotions: {
        engaged: 0,
        confused: 0,
        bored: 0,
        frustrated: 0,
        focused: 0,
        drowsy: 0,
        neutral: 1,
      },
      primaryEmotion: 'neutral',
      confidence: 0.3,
    };
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.emotionHistory = [];
    this.featureHistory = [];
    this.baselineFeatures = null;
    this.frameCount = 0;
  }

  /**
   * Get emotion history
   */
  public getEmotionHistory(): StudentEmotion[] {
    return [...this.emotionHistory];
  }
}

// Singleton instance
export const emotionRecognizer = new EmotionRecognizer();
