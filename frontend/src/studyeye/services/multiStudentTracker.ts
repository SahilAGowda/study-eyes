/**
 * Multi-Student Tracker Service
 * 
 * Implements persistent student tracking across frames with:
 * - IoU-based bounding box matching for identity persistence
 * - Centroid distance tracking as fallback
 * - Per-student temporal buffers for signal history
 * - Multimodal signal computation per student
 * 
 * CRITICAL: No global state shortcuts - all signals computed per-student
 */

import type { DetectedFace, Point, BoundingBox } from '../types';
import type { 
  StudentState, 
  ClassroomState, 
  StudentID,
  Student3DPose,
  StudentEmotion,
  StudentAttention,
  StudentBehavior,
  StudentEngagement,
  StudentHistory,
  ClassroomAlert,
  PrimaryBehavior
} from '../types/studentState';
import { headPoseEstimator } from './headPoseEstimator';
import { emotionRecognizer } from './emotionRecognizer';
import { gazeEstimator } from './gazeEstimator';

export interface TrackerConfig {
  // Association thresholds
  iouThreshold: number;
  maxCentroidDistance: number;
  descriptorSimilarityThreshold: number;
  
  // Tracking parameters
  maxFramesWithoutDetection: number;
  trackingConfidenceDecay: number;
  maxStudents: number;
  minTrackingFrames: number;
  
  // Temporal buffer configuration
  historyDurationSeconds: number;
  historyUpdateIntervalMs: number;
  temporalWindowSize: number;
  
  // Signal smoothing
  signalSmoothingAlpha: number;
  engagementSmoothingAlpha: number;
}

interface TemporalBuffer<T> {
  data: T[];
  timestamps: number[];
  maxSize: number;
}

interface TrackingCandidate {
  face: DetectedFace;
  centroid: Point;
  area: number;
}

interface AssociationResult {
  matched: Map<string, TrackingCandidate>;
  unmatched: TrackingCandidate[];
  lost: string[];
}

/**
 * Per-student temporal signal buffers for temporal reasoning
 */
interface StudentTemporalBuffers {
  gazeHistory: TemporalBuffer<{ direction: string; stability: number; isLooking: boolean }>;
  emotionHistory: TemporalBuffer<{ primary: string; valence: number; arousal: number; confidence: number }>;
  headPoseHistory: TemporalBuffer<{ pitch: number; yaw: number; roll: number }>;
  attentionHistory: TemporalBuffer<{ target: string; confidence: number }>;
  behaviorHistory: TemporalBuffer<{ behavior: PrimaryBehavior; confidence: number }>;
  engagementHistory: TemporalBuffer<number>;
  blinkHistory: TemporalBuffer<{ isBlinking: boolean; timestamp: number }>;
}

export class MultiStudentTracker {
  private config: Required<TrackerConfig>;
  private students: Map<string, StudentState> = new Map();
  private temporalBuffers: Map<string, StudentTemporalBuffers> = new Map();
  private frameNumber: number = 0;
  private lastHistoryUpdateTime: number = 0;
  private nextStudentId: number = 1;

  constructor(config?: Partial<TrackerConfig>) {
    this.config = {
      iouThreshold: config?.iouThreshold ?? 0.3,
      maxCentroidDistance: config?.maxCentroidDistance ?? 100,
      descriptorSimilarityThreshold: config?.descriptorSimilarityThreshold ?? 0.7,
      maxFramesWithoutDetection: config?.maxFramesWithoutDetection ?? 30,
      trackingConfidenceDecay: config?.trackingConfidenceDecay ?? 0.95,
      maxStudents: config?.maxStudents ?? 20,
      minTrackingFrames: config?.minTrackingFrames ?? 5,
      historyDurationSeconds: config?.historyDurationSeconds ?? 60,
      historyUpdateIntervalMs: config?.historyUpdateIntervalMs ?? 100,
      temporalWindowSize: config?.temporalWindowSize ?? 30,
      signalSmoothingAlpha: config?.signalSmoothingAlpha ?? 0.3,
      engagementSmoothingAlpha: config?.engagementSmoothingAlpha ?? 0.2,
    };
  }

  /**
   * Main processing entry point - processes all detected faces
   * and maintains persistent student identities
   */
  async processFrame(faces: DetectedFace[]): Promise<ClassroomState> {
    this.frameNumber++;
    const currentTime = Date.now();

    // Step 1: Prepare tracking candidates from detected faces
    const candidates = this.prepareCandidates(faces);

    // Step 2: Associate faces with existing students using IoU + centroid
    const associations = this.associateFacesToStudents(candidates);

    // Step 3: Update matched students with new detections
    await this.updateMatchedStudents(associations.matched, currentTime);

    // Step 4: Handle lost students (decay confidence, mark inactive)
    this.handleLostStudents(associations.lost, currentTime);

    // Step 5: Create new students for unmatched faces
    await this.createNewStudents(associations.unmatched, currentTime);

    // Step 6: Update temporal buffers for all active students
    this.updateTemporalBuffers(currentTime);

    // Step 7: Cleanup stale students
    this.cleanupStaleStudents();

    // Step 8: Generate classroom state
    return this.generateClassroomState(currentTime);
  }

  /**
   * Prepare tracking candidates from detected faces
   */
  private prepareCandidates(faces: DetectedFace[]): TrackingCandidate[] {
    return faces.map(face => ({
      face,
      centroid: this.calculateCentroid(face.boundingBox),
      area: face.boundingBox.width * face.boundingBox.height,
    }));
  }

  /**
   * Calculate centroid of a bounding box
   */
  private calculateCentroid(box: BoundingBox): Point {
    return {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
  }

  /**
   * Associate detected faces with existing students using IoU + centroid distance
   * This is CRITICAL for identity persistence across frames
   */
  private associateFacesToStudents(candidates: TrackingCandidate[]): AssociationResult {
    const matched = new Map<string, TrackingCandidate>();
    const unmatched: TrackingCandidate[] = [];
    const usedStudentIds = new Set<string>();
    const usedCandidateIndices = new Set<number>();

    // Build cost matrix for Hungarian-style matching
    const activeStudents = Array.from(this.students.entries())
      .filter(([_, s]) => s.isActive || s.framesSinceDetection < this.config.maxFramesWithoutDetection);

    // First pass: IoU-based matching (highest priority)
    for (let i = 0; i < candidates.length; i++) {
      if (usedCandidateIndices.has(i)) continue;
      
      const candidate = candidates[i];
      let bestMatch: { studentId: string; score: number } | null = null;

      for (const [studentId, student] of activeStudents) {
        if (usedStudentIds.has(studentId)) continue;

        const iou = this.calculateIoU(candidate.face.boundingBox, student.boundingBox);
        
        if (iou > this.config.iouThreshold && (!bestMatch || iou > bestMatch.score)) {
          bestMatch = { studentId, score: iou };
        }
      }

      if (bestMatch) {
        matched.set(bestMatch.studentId, candidate);
        usedStudentIds.add(bestMatch.studentId);
        usedCandidateIndices.add(i);
      }
    }

    // Second pass: Centroid distance matching for remaining candidates
    for (let i = 0; i < candidates.length; i++) {
      if (usedCandidateIndices.has(i)) continue;
      
      const candidate = candidates[i];
      let bestMatch: { studentId: string; distance: number } | null = null;

      for (const [studentId, student] of activeStudents) {
        if (usedStudentIds.has(studentId)) continue;

        const studentCentroid = this.calculateCentroid(student.boundingBox);
        const distance = this.calculateDistance(candidate.centroid, studentCentroid);
        
        if (distance < this.config.maxCentroidDistance && (!bestMatch || distance < bestMatch.distance)) {
          bestMatch = { studentId, distance };
        }
      }

      if (bestMatch) {
        matched.set(bestMatch.studentId, candidate);
        usedStudentIds.add(bestMatch.studentId);
        usedCandidateIndices.add(i);
      } else {
        unmatched.push(candidate);
      }
    }

    // Identify lost students (not matched to any candidate)
    const lost = activeStudents
      .filter(([studentId]) => !usedStudentIds.has(studentId))
      .map(([studentId]) => studentId);

    return { matched, unmatched, lost };
  }

  /**
   * Calculate Intersection over Union (IoU) for bounding boxes
   */
  private calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   * Update matched students with new detection data
   * CRITICAL: All signals computed PER-STUDENT, not globally
   */
  private async updateMatchedStudents(
    matched: Map<string, TrackingCandidate>,
    currentTime: number
  ): Promise<void> {
    for (const [studentId, candidate] of matched) {
      const student = this.students.get(studentId);
      if (!student) continue;

      // Update bounding box
      student.boundingBox = {
        ...candidate.face.boundingBox,
        confidence: candidate.face.confidence,
      };

      // Update tracking metadata
      student.id.lastSeen = currentTime;
      student.id.confidence = Math.min(1, student.id.confidence + 0.1);
      student.lastUpdated = currentTime;
      student.framesSinceDetection = 0;
      student.isActive = true;
      student.trackingConfidence = Math.min(1, student.trackingConfidence + 0.05);

      // CRITICAL: Compute all signals PER-STUDENT
      await this.computeStudentSignals(student, candidate.face, currentTime);
    }
  }

  /**
   * Compute all multimodal signals for a specific student
   * This is the core per-student signal computation
   */
  private async computeStudentSignals(
    student: StudentState,
    face: DetectedFace,
    currentTime: number
  ): Promise<void> {
    const buffers = this.getOrCreateTemporalBuffers(student.id.id);

    try {
      // 1. Head Pose Estimation (per-student)
      const poseResult = headPoseEstimator.estimatePose(face.landmarks);
      if (poseResult) {
        const smoothedPose = this.smoothPose(student.pose, poseResult);
        student.pose = {
          pitch: smoothedPose.pitch,
          yaw: smoothedPose.yaw,
          roll: smoothedPose.roll,
          translation: [0, 0, 0],
          rotation: [smoothedPose.pitch, smoothedPose.yaw, smoothedPose.roll].map(v => v * Math.PI / 180) as [number, number, number],
          confidence: poseResult.confidence || 0.8,
        };
        
        // Add to temporal buffer
        this.addToBuffer(buffers.headPoseHistory, {
          pitch: student.pose.pitch,
          yaw: student.pose.yaw,
          roll: student.pose.roll,
        }, currentTime);
      }

      // 2. Gaze Estimation (per-student)
      const gazeResult = gazeEstimator.estimateGaze(face.landmarks, face.boundingBox);
      if (gazeResult) {
        const attentionTarget = this.classifyAttentionTarget(gazeResult, student.pose);
        const smoothedStability = this.smoothValue(
          student.attention.gazeStability,
          gazeResult.gazeStability,
          this.config.signalSmoothingAlpha
        );

        student.attention = {
          target: attentionTarget,
          confidence: gazeResult.focusConfidence || 0.5,
          gazeStability: smoothedStability,
          fixationDuration: gazeResult.isLookingAtScreen 
            ? student.attention.fixationDuration + 33 
            : 0,
          saccadeRate: this.calculateSaccadeRate(buffers.gazeHistory),
          gazeVector: this.calculateGazeVector(student.pose),
          gazePoint: null,
        };

        // Add to temporal buffers
        this.addToBuffer(buffers.gazeHistory, {
          direction: gazeResult.gazeDirection,
          stability: gazeResult.gazeStability,
          isLooking: gazeResult.isLookingAtScreen,
        }, currentTime);

        this.addToBuffer(buffers.attentionHistory, {
          target: attentionTarget,
          confidence: student.attention.confidence,
        }, currentTime);
      }

      // 3. Emotion Recognition (per-student)
      const emotionResult = emotionRecognizer.recognizeEmotion(face.landmarks, face.confidence);
      if (emotionResult) {
        student.emotion = this.smoothEmotion(student.emotion, emotionResult);
        
        this.addToBuffer(buffers.emotionHistory, {
          primary: emotionResult.primaryEmotion,
          valence: emotionResult.valence,
          arousal: emotionResult.arousal,
          confidence: emotionResult.confidence,
        }, currentTime);
      }

      // 4. Blink Detection (per-student)
      const blinkState = this.detectBlink(face.landmarks, buffers);
      this.addToBuffer(buffers.blinkHistory, blinkState, currentTime);

      // 5. Behavior Classification (per-student, using temporal data)
      student.behavior = this.classifyBehaviorWithTemporal(student, buffers, currentTime);
      this.addToBuffer(buffers.behaviorHistory, {
        behavior: student.behavior.primaryBehavior,
        confidence: student.behavior.overallConfidence,
      }, currentTime);

      // 6. Engagement Calculation (per-student, using temporal data)
      student.engagement = this.calculateEngagementWithTemporal(student, buffers, currentTime);
      this.addToBuffer(buffers.engagementHistory, student.engagement.score, currentTime);

    } catch (error) {
      console.warn(`Error computing signals for student ${student.id.id}:`, error);
    }
  }

  /**
   * Get or create temporal buffers for a student
   */
  private getOrCreateTemporalBuffers(studentId: string): StudentTemporalBuffers {
    if (!this.temporalBuffers.has(studentId)) {
      const maxSize = this.config.temporalWindowSize;
      this.temporalBuffers.set(studentId, {
        gazeHistory: { data: [], timestamps: [], maxSize },
        emotionHistory: { data: [], timestamps: [], maxSize },
        headPoseHistory: { data: [], timestamps: [], maxSize },
        attentionHistory: { data: [], timestamps: [], maxSize },
        behaviorHistory: { data: [], timestamps: [], maxSize },
        engagementHistory: { data: [], timestamps: [], maxSize },
        blinkHistory: { data: [], timestamps: [], maxSize },
      });
    }
    return this.temporalBuffers.get(studentId)!;
  }

  /**
   * Add data to a temporal buffer with timestamp
   */
  private addToBuffer<T>(buffer: TemporalBuffer<T>, data: T, timestamp: number): void {
    buffer.data.push(data);
    buffer.timestamps.push(timestamp);
    
    while (buffer.data.length > buffer.maxSize) {
      buffer.data.shift();
      buffer.timestamps.shift();
    }
  }

  /**
   * Smooth pose values using exponential moving average
   */
  private smoothPose(current: Student3DPose, newPose: { pitch: number; yaw: number; roll: number; confidence?: number }): { pitch: number; yaw: number; roll: number } {
    const alpha = this.config.signalSmoothingAlpha;
    return {
      pitch: alpha * newPose.pitch + (1 - alpha) * current.pitch,
      yaw: alpha * newPose.yaw + (1 - alpha) * current.yaw,
      roll: alpha * newPose.roll + (1 - alpha) * current.roll,
    };
  }

  /**
   * Smooth a single numeric value
   */
  private smoothValue(current: number, newValue: number, alpha: number): number {
    return alpha * newValue + (1 - alpha) * current;
  }

  /**
   * Smooth emotion values
   */
  private smoothEmotion(current: StudentEmotion, newEmotion: StudentEmotion): StudentEmotion {
    const alpha = this.config.signalSmoothingAlpha;
    
    const smoothedEmotions: StudentEmotion['emotions'] = {} as StudentEmotion['emotions'];
    for (const key of Object.keys(newEmotion.emotions) as Array<keyof StudentEmotion['emotions']>) {
      smoothedEmotions[key] = alpha * newEmotion.emotions[key] + (1 - alpha) * (current.emotions[key] || 0);
    }

    // Determine primary emotion from smoothed values
    let maxScore = 0;
    let primaryEmotion: keyof StudentEmotion['emotions'] = 'neutral';
    for (const [emotion, score] of Object.entries(smoothedEmotions)) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as keyof StudentEmotion['emotions'];
      }
    }

    return {
      valence: alpha * newEmotion.valence + (1 - alpha) * current.valence,
      arousal: alpha * newEmotion.arousal + (1 - alpha) * current.arousal,
      dominance: alpha * newEmotion.dominance + (1 - alpha) * current.dominance,
      emotions: smoothedEmotions,
      primaryEmotion,
      confidence: Math.max(newEmotion.confidence, current.confidence * 0.9),
    };
  }

  /**
   * Classify attention target based on gaze and head pose
   */
  private classifyAttentionTarget(
    gazeResult: { isLookingAtScreen: boolean; gazeDirection: string },
    pose: Student3DPose
  ): StudentAttention['target'] {
    if (!gazeResult.isLookingAtScreen) {
      return 'off_task';
    }

    // Use head pose to refine attention target
    const { pitch, yaw } = pose;

    // Looking down significantly -> notes
    if (pitch > 20) {
      return 'notes';
    }

    // Looking up -> board
    if (pitch < -15) {
      return 'board';
    }

    // Looking significantly left or right -> peer
    if (Math.abs(yaw) > 30) {
      return 'peer';
    }

    // Center gaze with slight variations
    switch (gazeResult.gazeDirection) {
      case 'center':
        return 'teacher';
      case 'up':
        return 'board';
      case 'down':
        return 'notes';
      case 'left':
      case 'right':
        return Math.abs(yaw) > 20 ? 'peer' : 'screen';
      default:
        return 'screen';
    }
  }

  /**
   * Calculate gaze vector from head pose
   */
  private calculateGazeVector(pose: Student3DPose): [number, number, number] {
    const pitchRad = (pose.pitch * Math.PI) / 180;
    const yawRad = (pose.yaw * Math.PI) / 180;

    return [
      Math.sin(yawRad),
      -Math.sin(pitchRad),
      Math.cos(yawRad) * Math.cos(pitchRad),
    ];
  }

  /**
   * Calculate saccade rate from gaze history
   */
  private calculateSaccadeRate(gazeHistory: TemporalBuffer<{ direction: string; stability: number; isLooking: boolean }>): number {
    if (gazeHistory.data.length < 2) return 0;

    let saccadeCount = 0;
    for (let i = 1; i < gazeHistory.data.length; i++) {
      if (gazeHistory.data[i].direction !== gazeHistory.data[i - 1].direction) {
        saccadeCount++;
      }
    }

    const timeSpan = (gazeHistory.timestamps[gazeHistory.timestamps.length - 1] - gazeHistory.timestamps[0]) / 1000;
    return timeSpan > 0 ? saccadeCount / timeSpan : 0;
  }

  /**
   * Detect blink state from eye landmarks
   */
  private detectBlink(landmarks: Point[], buffers: StudentTemporalBuffers): { isBlinking: boolean; timestamp: number } {
    // Simple blink detection based on eye aspect ratio
    // This is a placeholder - real implementation would use eye landmarks
    const recentBlinks = buffers.blinkHistory.data.slice(-5);
    const blinkRate = recentBlinks.filter(b => b.isBlinking).length / Math.max(1, recentBlinks.length);
    
    return {
      isBlinking: blinkRate > 0.3,
      timestamp: Date.now(),
    };
  }

  /**
   * Classify behavior using temporal data - MULTIMODAL + TEMPORAL INFERENCE
   * This implements the explicit Behavior Inference Layer
   */
  private classifyBehaviorWithTemporal(
    student: StudentState,
    buffers: StudentTemporalBuffers,
    currentTime: number
  ): StudentBehavior {
    const prevBehavior = student.behavior;
    
    // Analyze temporal patterns
    const gazeStability = this.analyzeGazeStability(buffers.gazeHistory);
    const emotionPersistence = this.analyzeEmotionPersistence(buffers.emotionHistory);
    const headPoseStability = this.analyzeHeadPoseStability(buffers.headPoseHistory);
    const blinkRate = this.calculateBlinkRate(buffers.blinkHistory);

    // Multimodal behavior inference rules
    let primaryBehavior: PrimaryBehavior = 'passive_listening';
    let visualConfidence = 0.5;

    // Check if student is showing positive engagement (smiling/happy)
    const isPositivelyEngaged = student.emotion.primaryEmotion === 'engaged' && 
                                 student.emotion.confidence > 0.3;
    const isFocused = student.emotion.primaryEmotion === 'focused';
    const isLookingAtContent = ['teacher', 'board', 'screen', 'notes'].includes(student.attention.target);

    // RULE: Active Listening (PRIORITY for engaged/happy students)
    // Engaged emotion (smiling) + looking at content = active listening
    if (isPositivelyEngaged && isLookingAtContent) {
      primaryBehavior = 'active_listening';
      visualConfidence = Math.max(student.emotion.confidence, 0.7);
    }
    // RULE: Active Listening (focused variant)
    // gaze → teacher/board, emotion → focused, stable head pose
    else if (
      (student.attention.target === 'teacher' || student.attention.target === 'board') &&
      isFocused &&
      gazeStability > 0.5 &&
      headPoseStability > 0.4
    ) {
      primaryBehavior = 'active_listening';
      visualConfidence = Math.min(student.attention.confidence, student.emotion.confidence, gazeStability);
    }
    // RULE: Passive Listening
    // gaze → teacher/board/screen, emotion → neutral, stable
    else if (
      ['teacher', 'board', 'screen'].includes(student.attention.target) &&
      student.emotion.primaryEmotion === 'neutral' &&
      gazeStability > 0.3
    ) {
      primaryBehavior = 'passive_listening';
      visualConfidence = Math.min(student.attention.confidence, gazeStability);
    }
    // RULE: Cognitive Load
    // gaze → board/notes, emotion → confused, increased blink rate
    else if (
      ['board', 'notes', 'screen'].includes(student.attention.target) &&
      student.emotion.primaryEmotion === 'confused' &&
      blinkRate > 0.3
    ) {
      primaryBehavior = 'cognitive_load';
      visualConfidence = student.emotion.confidence;
    }
    // RULE: Note Taking
    // gaze → notes (looking down), stable attention
    else if (
      student.attention.target === 'notes' &&
      student.pose.pitch > 15 &&
      gazeStability > 0.5
    ) {
      primaryBehavior = 'note_taking';
      visualConfidence = student.attention.confidence;
    }
    // RULE: Peer Discussion
    // gaze → peer, alternating head pose, positive emotion
    else if (
      student.attention.target === 'peer' &&
      (student.emotion.primaryEmotion === 'engaged' || student.emotion.valence > 0.2) &&
      headPoseStability < 0.6
    ) {
      primaryBehavior = 'peer_discussion';
      visualConfidence = Math.min(student.attention.confidence, student.emotion.confidence);
    }
    // RULE: Off-Task Talking
    // gaze → peer/off_task, frequent head turns, neutral/negative emotion
    else if (
      (student.attention.target === 'peer' || student.attention.target === 'off_task') &&
      headPoseStability < 0.4 &&
      student.emotion.valence < 0.3
    ) {
      primaryBehavior = 'off_task_talking';
      visualConfidence = Math.min(student.attention.confidence, 1 - headPoseStability);
    }
    // RULE: Distracted
    // gaze → off_task, low stability
    else if (
      student.attention.target === 'off_task' &&
      gazeStability < 0.4
    ) {
      primaryBehavior = 'distracted';
      visualConfidence = student.attention.confidence;
    }
    // RULE: Disengaged
    // emotion → bored/drowsy, low arousal
    else if (
      (student.emotion.primaryEmotion === 'bored' || student.emotion.primaryEmotion === 'drowsy') &&
      student.emotion.arousal < 0.3
    ) {
      primaryBehavior = 'disengaged';
      visualConfidence = student.emotion.confidence;
    }

    // Calculate temporal confidence based on behavior persistence
    const isSameBehavior = prevBehavior.primaryBehavior === primaryBehavior;
    const temporalConfidence = isSameBehavior 
      ? Math.min(1, prevBehavior.temporalConfidence + 0.1)
      : 0.5;

    const duration = isSameBehavior ? prevBehavior.duration + 33 : 0;
    const stability = isSameBehavior ? Math.min(1, prevBehavior.stability + 0.05) : 0;

    return {
      primaryBehavior,
      visualConfidence,
      audioConfidence: 0, // Would be populated from audio analysis
      temporalConfidence,
      overallConfidence: (visualConfidence * 0.6 + temporalConfidence * 0.4),
      duration,
      stability,
      transitionCount: isSameBehavior ? prevBehavior.transitionCount : prevBehavior.transitionCount + 1,
      behaviorStartTime: isSameBehavior ? prevBehavior.behaviorStartTime : currentTime,
      behaviorDuration: duration,
      transitionProbability: 1 - stability,
    };
  }

  /**
   * Analyze gaze stability from temporal buffer
   */
  private analyzeGazeStability(buffer: TemporalBuffer<{ direction: string; stability: number; isLooking: boolean }>): number {
    if (buffer.data.length < 3) return 0.5;

    const recentData = buffer.data.slice(-10);
    const avgStability = recentData.reduce((sum, d) => sum + d.stability, 0) / recentData.length;
    
    // Check direction consistency
    const directions = recentData.map(d => d.direction);
    const modeDirection = this.getMode(directions);
    const directionConsistency = directions.filter(d => d === modeDirection).length / directions.length;

    return (avgStability + directionConsistency) / 2;
  }

  /**
   * Analyze emotion persistence from temporal buffer
   */
  private analyzeEmotionPersistence(buffer: TemporalBuffer<{ primary: string; valence: number; arousal: number; confidence: number }>): number {
    if (buffer.data.length < 3) return 0.5;

    const recentData = buffer.data.slice(-10);
    const emotions = recentData.map(d => d.primary);
    const modeEmotion = this.getMode(emotions);
    
    return emotions.filter(e => e === modeEmotion).length / emotions.length;
  }

  /**
   * Analyze head pose stability from temporal buffer
   */
  private analyzeHeadPoseStability(buffer: TemporalBuffer<{ pitch: number; yaw: number; roll: number }>): number {
    if (buffer.data.length < 3) return 0.5;

    const recentData = buffer.data.slice(-10);
    
    // Calculate variance in each axis
    const pitchValues = recentData.map(d => d.pitch);
    const yawValues = recentData.map(d => d.yaw);
    
    const pitchVariance = this.calculateVariance(pitchValues);
    const yawVariance = this.calculateVariance(yawValues);
    
    // Lower variance = higher stability
    const maxVariance = 400; // 20 degrees squared
    const stability = 1 - Math.min(1, (pitchVariance + yawVariance) / (2 * maxVariance));
    
    return stability;
  }

  /**
   * Calculate blink rate from temporal buffer
   */
  private calculateBlinkRate(buffer: TemporalBuffer<{ isBlinking: boolean; timestamp: number }>): number {
    if (buffer.data.length < 5) return 0.15; // Normal blink rate

    const recentData = buffer.data.slice(-15);
    const blinkCount = recentData.filter(d => d.isBlinking).length;
    
    return blinkCount / recentData.length;
  }

  /**
   * Get mode (most frequent value) from array
   */
  private getMode<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    let maxCount = 0;
    let mode = arr[0];

    for (const item of arr) {
      const count = (counts.get(item) || 0) + 1;
      counts.set(item, count);
      if (count > maxCount) {
        maxCount = count;
        mode = item;
      }
    }

    return mode;
  }

  /**
   * Calculate variance of numeric array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Calculate engagement score using temporal data
   * Engagement = weighted combination of attention, emotion, behavior, temporal consistency
   */
  private calculateEngagementWithTemporal(
    student: StudentState,
    buffers: StudentTemporalBuffers,
    currentTime: number
  ): StudentEngagement {
    // Component scores
    const attentionScore = this.calculateAttentionScore(student, buffers);
    const emotionScore = this.calculateEmotionScore(student, buffers);
    const behaviorScore = this.calculateBehaviorScore(student);
    const temporalScore = this.calculateTemporalConsistencyScore(buffers);

    // Weighted combination
    const weights = { attention: 0.30, emotion: 0.25, behavior: 0.30, temporal: 0.15 };
    const rawScore = 
      attentionScore * weights.attention +
      emotionScore * weights.emotion +
      behaviorScore * weights.behavior +
      temporalScore * weights.temporal;

    // Apply temporal smoothing to engagement score
    const prevScore = student.engagement.score;
    const smoothedScore = Math.round(
      this.config.engagementSmoothingAlpha * rawScore +
      (1 - this.config.engagementSmoothingAlpha) * prevScore
    );

    // Determine level
    let level: StudentEngagement['level'];
    if (smoothedScore >= 75) level = 'high';
    else if (smoothedScore >= 50) level = 'medium';
    else if (smoothedScore >= 25) level = 'low';
    else level = 'disengaged';

    // Calculate trend from engagement history
    const trend = this.calculateEngagementTrend(buffers.engagementHistory, smoothedScore);

    // Calculate volatility
    const recentScores = [...buffers.engagementHistory.data.slice(-10), smoothedScore];
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, val) => sum + Math.pow(val - avgScore, 2), 0) / recentScores.length;
    const volatility = Math.min(1, Math.sqrt(variance) / 50);

    // Calculate confidence based on signal quality
    const confidenceLevel = this.calculateConfidenceLevel(student, buffers);

    return {
      score: smoothedScore,
      level,
      trend,
      attentionScore: Math.round(attentionScore),
      emotionScore: Math.round(emotionScore),
      behaviorScore: Math.round(behaviorScore),
      temporalScore: Math.round(temporalScore),
      engagementHistory: recentScores,
      averageScore: Math.round(avgScore),
      volatility,
      cognitive: emotionScore * 0.8 + behaviorScore * 0.2,
      emotional: emotionScore,
      behavioral: behaviorScore,
      sustainedAttention: student.attention.fixationDuration / 1000 / 60,
      engagementVariability: volatility,
      peakEngagement: Math.max(...recentScores, smoothedScore),
      riskOfDisengagement: this.calculateDisengagementRisk(student, buffers),
      interventionRecommended: smoothedScore < 40 || volatility > 0.5,
    };
  }

  /**
   * Calculate attention-based engagement score
   */
  private calculateAttentionScore(student: StudentState, buffers: StudentTemporalBuffers): number {
    const targetScores: Record<StudentAttention['target'], number> = {
      teacher: 100,
      board: 95,
      screen: 90,
      notes: 80,
      peer: 50,
      off_task: 20,
      unknown: 40,
    };

    const baseScore = targetScores[student.attention.target] || 40;
    const stabilityBonus = student.attention.gazeStability * 15;
    const consistencyBonus = this.analyzeGazeStability(buffers.gazeHistory) * 10;
    
    return Math.min(100, baseScore * student.attention.confidence + stabilityBonus + consistencyBonus);
  }

  /**
   * Calculate emotion-based engagement score
   */
  private calculateEmotionScore(student: StudentState, buffers: StudentTemporalBuffers): number {
    const emotionScores: Record<keyof StudentEmotion['emotions'], number> = {
      engaged: 100,
      focused: 95,
      neutral: 60,
      confused: 40,
      bored: 25,
      frustrated: 30,
      drowsy: 20,
    };

    const baseScore = emotionScores[student.emotion.primaryEmotion] || 50;
    const valenceBonus = (student.emotion.valence + 1) * 10; // -1 to 1 -> 0 to 20
    const persistenceBonus = this.analyzeEmotionPersistence(buffers.emotionHistory) * 10;
    
    return Math.min(100, baseScore * student.emotion.confidence + valenceBonus + persistenceBonus);
  }

  /**
   * Calculate behavior-based engagement score
   */
  private calculateBehaviorScore(student: StudentState): number {
    const behaviorScores: Record<PrimaryBehavior, number> = {
      active_listening: 100,
      passive_listening: 75,
      note_taking: 85,
      peer_discussion: 70,
      cognitive_load: 60,
      off_task_talking: 30,
      distracted: 25,
      disengaged: 15,
      technology_use: 20,
    };

    const baseScore = behaviorScores[student.behavior.primaryBehavior] || 50;
    const stabilityBonus = student.behavior.stability * 15;
    const durationBonus = Math.min(10, student.behavior.duration / 10000); // Bonus for sustained behavior
    
    return Math.min(100, baseScore * student.behavior.overallConfidence + stabilityBonus + durationBonus);
  }

  /**
   * Calculate temporal consistency score
   */
  private calculateTemporalConsistencyScore(buffers: StudentTemporalBuffers): number {
    const gazeConsistency = this.analyzeGazeStability(buffers.gazeHistory);
    const emotionConsistency = this.analyzeEmotionPersistence(buffers.emotionHistory);
    const poseConsistency = this.analyzeHeadPoseStability(buffers.headPoseHistory);
    
    return ((gazeConsistency + emotionConsistency + poseConsistency) / 3) * 100;
  }

  /**
   * Calculate engagement trend from history
   */
  private calculateEngagementTrend(
    history: TemporalBuffer<number>,
    currentScore: number
  ): StudentEngagement['trend'] {
    if (history.data.length < 5) return 'stable';

    const recentScores = [...history.data.slice(-5), currentScore];
    const firstHalf = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = recentScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    const diff = secondHalf - firstHalf;
    
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate confidence level based on signal quality
   */
  private calculateConfidenceLevel(
    student: StudentState,
    buffers: StudentTemporalBuffers
  ): 'low' | 'medium' | 'high' {
    const trackingConf = student.trackingConfidence;
    const attentionConf = student.attention.confidence;
    const emotionConf = student.emotion.confidence;
    const behaviorConf = student.behavior.overallConfidence;
    
    const avgConfidence = (trackingConf + attentionConf + emotionConf + behaviorConf) / 4;
    
    // Also consider data availability
    const dataAvailability = Math.min(1, buffers.gazeHistory.data.length / 10);
    const overallConfidence = avgConfidence * 0.7 + dataAvailability * 0.3;
    
    if (overallConfidence >= 0.7) return 'high';
    if (overallConfidence >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate risk of disengagement
   */
  private calculateDisengagementRisk(
    student: StudentState,
    buffers: StudentTemporalBuffers
  ): number {
    let risk = 0;

    // Low engagement score increases risk
    if (student.engagement.score < 50) risk += 0.3;
    if (student.engagement.score < 30) risk += 0.2;

    // Decreasing trend increases risk
    if (student.engagement.trend === 'decreasing') risk += 0.2;

    // Negative emotions increase risk
    if (['bored', 'drowsy', 'frustrated'].includes(student.emotion.primaryEmotion)) {
      risk += 0.2;
    }

    // Off-task attention increases risk
    if (student.attention.target === 'off_task') risk += 0.2;

    // High volatility increases risk
    if (student.engagement.volatility && student.engagement.volatility > 0.4) {
      risk += 0.1;
    }

    return Math.min(1, risk);
  }

  /**
   * Handle lost students (not detected in current frame)
   */
  private handleLostStudents(lostIds: string[], currentTime: number): void {
    for (const studentId of lostIds) {
      const student = this.students.get(studentId);
      if (!student) continue;

      student.framesSinceDetection++;
      student.trackingConfidence *= this.config.trackingConfidenceDecay;
      
      if (student.framesSinceDetection > this.config.maxFramesWithoutDetection) {
        student.isActive = false;
      }
    }
  }

  /**
   * Create new students for unmatched faces
   */
  private async createNewStudents(
    unmatched: TrackingCandidate[],
    currentTime: number
  ): Promise<void> {
    for (const candidate of unmatched) {
      if (this.students.size >= this.config.maxStudents) break;

      const studentId = this.generateStudentId();
      const student = this.createInitialStudentState(studentId, candidate.face, currentTime);
      
      this.students.set(studentId, student);
      
      // Initialize temporal buffers
      this.getOrCreateTemporalBuffers(studentId);

      // Compute initial signals
      await this.computeStudentSignals(student, candidate.face, currentTime);
    }
  }

  /**
   * Generate unique student ID
   */
  private generateStudentId(): string {
    return `student_${this.nextStudentId++}_${Date.now().toString(36)}`;
  }

  /**
   * Create initial student state
   */
  private createInitialStudentState(
    studentId: string,
    face: DetectedFace,
    currentTime: number
  ): StudentState {
    const id: StudentID = {
      id: studentId,
      confidence: face.confidence,
      firstSeen: currentTime,
      lastSeen: currentTime,
    };

    const pose: Student3DPose = {
      pitch: 0, yaw: 0, roll: 0,
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      confidence: 0,
    };

    const emotion: StudentEmotion = {
      valence: 0, arousal: 0.5, dominance: 0.5,
      emotions: {
        engaged: 0, confused: 0, bored: 0,
        frustrated: 0, focused: 0, drowsy: 0, neutral: 1,
      },
      primaryEmotion: 'neutral',
      confidence: 0,
    };

    const attention: StudentAttention = {
      target: 'unknown',
      confidence: 0,
      gazeStability: 0,
      fixationDuration: 0,
      saccadeRate: 0,
      gazeVector: [0, 0, 1],
      gazePoint: null,
    };

    const behavior: StudentBehavior = {
      primaryBehavior: 'passive_listening',
      visualConfidence: 0,
      audioConfidence: 0,
      temporalConfidence: 0,
      overallConfidence: 0,
      duration: 0,
      stability: 0,
      transitionCount: 0,
    };

    const engagement: StudentEngagement = {
      score: 50, level: 'medium', trend: 'stable',
      attentionScore: 50, emotionScore: 50,
      behaviorScore: 50, temporalScore: 50,
      engagementHistory: [], averageScore: 50, volatility: 0,
    };

    const history: StudentHistory = {
      poses: [], emotions: [], behaviors: [],
      engagements: [], timestamps: [],
    };

    return {
      id,
      boundingBox: { ...face.boundingBox, confidence: face.confidence },
      pose, emotion, attention, behavior, engagement, history,
      lastUpdated: currentTime,
      framesSinceDetection: 0,
      isActive: true,
      trackingConfidence: face.confidence,
    };
  }

  /**
   * Update temporal buffers and student history
   */
  private updateTemporalBuffers(currentTime: number): void {
    // Only update history at configured interval
    if (currentTime - this.lastHistoryUpdateTime < this.config.historyUpdateIntervalMs) {
      return;
    }
    
    this.lastHistoryUpdateTime = currentTime;
    const maxHistory = Math.floor(
      (this.config.historyDurationSeconds * 1000) / this.config.historyUpdateIntervalMs
    );

    for (const [studentId, student] of this.students) {
      if (!student.isActive) continue;

      // Update student history (for longer-term analysis)
      student.history.poses.push({ ...student.pose });
      student.history.emotions.push({ ...student.emotion });
      student.history.behaviors.push({ ...student.behavior });
      student.history.engagements.push({ ...student.engagement });
      student.history.timestamps.push(currentTime);

      // Trim history to max size
      if (student.history.timestamps.length > maxHistory) {
        student.history.poses = student.history.poses.slice(-maxHistory);
        student.history.emotions = student.history.emotions.slice(-maxHistory);
        student.history.behaviors = student.history.behaviors.slice(-maxHistory);
        student.history.engagements = student.history.engagements.slice(-maxHistory);
        student.history.timestamps = student.history.timestamps.slice(-maxHistory);
      }
    }
  }

  /**
   * Cleanup stale students
   */
  private cleanupStaleStudents(): void {
    const toRemove: string[] = [];

    for (const [studentId, student] of this.students) {
      if (student.framesSinceDetection > this.config.maxFramesWithoutDetection * 2) {
        toRemove.push(studentId);
      }
    }

    for (const studentId of toRemove) {
      this.students.delete(studentId);
      this.temporalBuffers.delete(studentId);
    }
  }

  /**
   * Generate classroom state from all students
   */
  private generateClassroomState(currentTime: number): ClassroomState {
    const activeStudents = Array.from(this.students.values()).filter(s => s.isActive);
    
    // Calculate aggregate metrics
    const totalEngagement = activeStudents.reduce((sum, s) => sum + s.engagement.score, 0);
    const averageEngagement = activeStudents.length > 0 
      ? Math.round(totalEngagement / activeStudents.length) 
      : 0;

    // Engagement distribution
    const distribution = { high: 0, medium: 0, low: 0, disengaged: 0 };
    for (const student of activeStudents) {
      distribution[student.engagement.level]++;
    }

    // Behavior distribution
    const behaviorDistribution: Record<PrimaryBehavior, number> = {
      active_listening: 0, passive_listening: 0, cognitive_load: 0,
      peer_discussion: 0, off_task_talking: 0, note_taking: 0,
      distracted: 0, disengaged: 0, technology_use: 0,
    };
    for (const student of activeStudents) {
      behaviorDistribution[student.behavior.primaryBehavior]++;
    }

    // Generate alerts
    const alerts = this.generateAlerts(activeStudents, currentTime);

    // Determine overall attention target
    const attentionCounts = new Map<string, number>();
    for (const student of activeStudents) {
      const count = attentionCounts.get(student.attention.target) || 0;
      attentionCounts.set(student.attention.target, count + 1);
    }
    let overallAttentionTarget: StudentAttention['target'] = 'unknown';
    let maxCount = 0;
    for (const [target, count] of attentionCounts) {
      if (count > maxCount) {
        maxCount = count;
        overallAttentionTarget = target as StudentAttention['target'];
      }
    }

    return {
      students: this.students,
      timestamp: currentTime,
      frameNumber: this.frameNumber,
      totalStudents: this.students.size,
      activeStudents: activeStudents.length,
      averageEngagement,
      engagementDistribution: distribution,
      behaviorDistribution,
      overallAttentionTarget,
      classroomEnergy: this.calculateClassroomEnergy(activeStudents),
      alerts,
    };
  }

  /**
   * Calculate classroom energy level
   */
  private calculateClassroomEnergy(students: StudentState[]): number {
    if (students.length === 0) return 0;

    const avgArousal = students.reduce((sum, s) => sum + s.emotion.arousal, 0) / students.length;
    const avgEngagement = students.reduce((sum, s) => sum + s.engagement.score, 0) / students.length / 100;
    
    return (avgArousal + avgEngagement) / 2;
  }

  /**
   * Generate classroom alerts based on student states
   */
  private generateAlerts(students: StudentState[], currentTime: number): ClassroomAlert[] {
    const alerts: ClassroomAlert[] = [];

    // Low engagement alert
    const lowEngagementStudents = students.filter(
      s => s.engagement.level === 'low' || s.engagement.level === 'disengaged'
    );
    if (lowEngagementStudents.length > 0) {
      const severity = lowEngagementStudents.length > 3 ? 'high' : 
                       lowEngagementStudents.length > 1 ? 'medium' : 'low';
      alerts.push({
        type: 'low_engagement',
        studentIds: lowEngagementStudents.map(s => s.id.id),
        severity,
        message: `${lowEngagementStudents.length} student(s) showing low engagement`,
        timestamp: currentTime,
      });
    }

    // Distraction alert
    const distractedStudents = students.filter(
      s => s.behavior.primaryBehavior === 'distracted' || 
           s.behavior.primaryBehavior === 'off_task_talking'
    );
    if (distractedStudents.length > 0) {
      alerts.push({
        type: 'distraction',
        studentIds: distractedStudents.map(s => s.id.id),
        severity: distractedStudents.length > 2 ? 'high' : 'low',
        message: `${distractedStudents.length} student(s) appear distracted`,
        timestamp: currentTime,
      });
    }

    // Confusion alert (multiple students confused)
    const confusedStudents = students.filter(
      s => s.emotion.primaryEmotion === 'confused' && s.emotion.confidence > 0.6
    );
    if (confusedStudents.length >= 3) {
      alerts.push({
        type: 'confusion',
        studentIds: confusedStudents.map(s => s.id.id),
        severity: 'medium',
        message: `Multiple students appear confused - consider reviewing the material`,
        timestamp: currentTime,
      });
    }

    // Technology misuse alert
    const techMisuseStudents = students.filter(
      s => s.behavior.primaryBehavior === 'technology_use'
    );
    if (techMisuseStudents.length > 0) {
      alerts.push({
        type: 'technology_misuse',
        studentIds: techMisuseStudents.map(s => s.id.id),
        severity: 'medium',
        message: `${techMisuseStudents.length} student(s) using unauthorized technology`,
        timestamp: currentTime,
      });
    }

    // Disengagement risk alert
    const atRiskStudents = students.filter(
      s => s.engagement.riskOfDisengagement && s.engagement.riskOfDisengagement > 0.6
    );
    if (atRiskStudents.length > 0) {
      alerts.push({
        type: 'disengagement',
        studentIds: atRiskStudents.map(s => s.id.id),
        severity: 'medium',
        message: `${atRiskStudents.length} student(s) at risk of disengagement`,
        timestamp: currentTime,
      });
    }

    return alerts;
  }

  // Public API methods

  /**
   * Get current classroom state
   */
  getClassroomState(): ClassroomState {
    return this.generateClassroomState(Date.now());
  }

  /**
   * Get specific student state
   */
  getStudentState(studentId: string): StudentState | undefined {
    return this.students.get(studentId);
  }

  /**
   * Get all active students
   */
  getActiveStudents(): StudentState[] {
    return Array.from(this.students.values()).filter(s => s.isActive);
  }

  /**
   * Get temporal buffers for a student
   */
  getStudentTemporalBuffers(studentId: string): StudentTemporalBuffers | undefined {
    return this.temporalBuffers.get(studentId);
  }

  /**
   * Reset tracker state
   */
  reset(): void {
    this.students.clear();
    this.temporalBuffers.clear();
    this.frameNumber = 0;
    this.lastHistoryUpdateTime = 0;
    this.nextStudentId = 1;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const multiStudentTracker = new MultiStudentTracker();
