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

import type { DetectedFace, Point, BoundingBox, ObjectDetectionResult } from '../types';
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
import { backendEmotionService } from './backendEmotionService';

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
  
  // Backend emotion service
  useBackendEmotion: boolean;
  backendEmotionInterval: number; // ms between backend calls (to avoid overloading)
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
  private currentObjectDetections: ObjectDetectionResult[] = []; // Store object detections for per-student processing
  private videoElement: HTMLVideoElement | null = null; // Reference to video for backend emotion
  private lastBackendEmotionTime: number = 0; // Rate limiting for backend calls

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
      signalSmoothingAlpha: config?.signalSmoothingAlpha ?? 0.4,  // Increased from 0.3 for faster response
      engagementSmoothingAlpha: config?.engagementSmoothingAlpha ?? 0.35,  // Increased from 0.2 for faster response to distraction
      useBackendEmotion: config?.useBackendEmotion ?? true, // Use backend CNN emotion by default
      backendEmotionInterval: config?.backendEmotionInterval ?? 500, // Call backend every 500ms
    };
    
    // Check backend emotion service availability
    if (this.config.useBackendEmotion) {
      backendEmotionService.checkHealth().then(available => {
        console.log(`[MultiStudentTracker] Backend emotion service: ${available ? 'available' : 'not available, using frontend fallback'}`);
      });
    }
  }

  /**
   * Set video element reference for backend emotion service
   */
  setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
  }

  /**
   * Main processing entry point - processes all detected faces
   * and maintains persistent student identities
   * @param faces - Detected faces from face detector
   * @param objectDetections - Object detections (phones, pens, etc.) for behavior analysis
   */
  async processFrame(
    faces: DetectedFace[],
    objectDetections: ObjectDetectionResult[] = []
  ): Promise<ClassroomState> {
    this.frameNumber++;
    const currentTime = Date.now();
    
    // Store object detections for per-student processing
    this.currentObjectDetections = objectDetections;    // Step 1: Prepare tracking candidates from detected faces
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
      // Try backend CNN emotion service first (more accurate), fallback to frontend landmarks
      let emotionResult: StudentEmotion | null = null;
      
      // Check if we should use backend - be more aggressive about trying
      const backendAvailable = backendEmotionService.isServiceAvailable();
      const timeSinceLastBackend = currentTime - this.lastBackendEmotionTime;
      const shouldUseBackend = this.config.useBackendEmotion && 
                               this.videoElement && 
                               (backendAvailable || timeSinceLastBackend > 5000) && // Retry every 5s if not available
                               timeSinceLastBackend >= this.config.backendEmotionInterval;
      
      // Log backend status periodically
      if (this.frameNumber % 100 === 0) {
        console.log(`[Emotion] Backend status: available=${backendAvailable}, useBackend=${this.config.useBackendEmotion}, hasVideo=${!!this.videoElement}, timeSince=${timeSinceLastBackend}ms`);
      }
      
      if (shouldUseBackend) {
        try {
          // If not available, try to check health again
          if (!backendAvailable) {
            console.log('[Emotion] Backend not available, checking health...');
            await backendEmotionService.checkHealth();
          }
          
          if (backendEmotionService.isServiceAvailable()) {
            const backendResult = await backendEmotionService.classifyEmotion(
              this.videoElement!,
              student.boundingBox,
              student.id.id
            );
            
            if (backendResult) {
              this.lastBackendEmotionTime = currentTime;
              const mappedEmotion = backendEmotionService.mapToStudentEmotion(backendResult);
              emotionResult = {
                valence: mappedEmotion.valence,
                arousal: mappedEmotion.arousal,
                dominance: mappedEmotion.dominance,
                emotions: mappedEmotion.emotions,
                primaryEmotion: mappedEmotion.primaryEmotion as keyof StudentEmotion['emotions'],
                confidence: mappedEmotion.confidence,
              };
              console.log(`[Emotion] ✅ Backend CNN: ${emotionResult.primaryEmotion} (${(emotionResult.confidence * 100).toFixed(1)}%)`);
            }
          }
        } catch (error) {
          console.warn('[Emotion] Backend service error, using frontend fallback:', error);
        }
      }
      
      // Fallback to frontend landmark-based emotion recognition
      if (!emotionResult) {
        if (this.frameNumber % 100 === 0) {
          console.log('[Emotion] Using frontend landmark-based recognition (fallback)');
        }
        emotionResult = emotionRecognizer.recognizeEmotion(face.landmarks, face.confidence);
      }
      
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

      // 5. Phone Detection (per-student) - CHECK BEFORE BEHAVIOR CLASSIFICATION
      const phoneDetection = this.checkPhoneForStudent(student);
      
      // 6. Behavior Classification (per-student, using temporal data)
      // If phone detected, override behavior to technology_use
      if (phoneDetection.detected) {
        student.behavior = {
          ...student.behavior,
          primaryBehavior: 'technology_use',
          visualConfidence: phoneDetection.confidence,
          overallConfidence: phoneDetection.confidence,
        };
      } else {
        student.behavior = this.classifyBehaviorWithTemporal(student, buffers, currentTime);
      }
      this.addToBuffer(buffers.behaviorHistory, {
        behavior: student.behavior.primaryBehavior,
        confidence: student.behavior.overallConfidence,
      }, currentTime);

      // 7. Engagement Calculation (per-student, using temporal data)
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
   * 
   * CRITICAL: Preserve primaryEmotion from backend CNN if confidence is high
   * The backend maps FER2013 emotions (happy, sad, etc.) to engagement emotions (engaged, bored, etc.)
   * We should NOT recalculate primaryEmotion from smoothed scores if backend provided a confident result
   */
  private smoothEmotion(current: StudentEmotion, newEmotion: StudentEmotion): StudentEmotion {
    const alpha = this.config.signalSmoothingAlpha;
    
    const smoothedEmotions: StudentEmotion['emotions'] = {} as StudentEmotion['emotions'];
    for (const key of Object.keys(newEmotion.emotions) as Array<keyof StudentEmotion['emotions']>) {
      smoothedEmotions[key] = alpha * newEmotion.emotions[key] + (1 - alpha) * (current.emotions[key] || 0);
    }

    // CRITICAL FIX: Preserve primaryEmotion from new emotion if confidence is good
    // This ensures backend CNN mapping (happy -> engaged) is not overwritten
    let primaryEmotion: keyof StudentEmotion['emotions'] = newEmotion.primaryEmotion;
    
    // Only recalculate from smoothed scores if new emotion has low confidence
    // This allows backend's direct mapping to take precedence
    if (newEmotion.confidence < 0.25) {
      let maxScore = 0;
      for (const [emotion, score] of Object.entries(smoothedEmotions)) {
        if (score > maxScore) {
          maxScore = score;
          primaryEmotion = emotion as keyof StudentEmotion['emotions'];
        }
      }
    }
    
    // Log emotion smoothing for debugging
    if (newEmotion.primaryEmotion !== current.primaryEmotion) {
      console.log(`[EmotionSmooth] ${current.primaryEmotion} -> ${newEmotion.primaryEmotion} (conf: ${(newEmotion.confidence * 100).toFixed(1)}%) -> final: ${primaryEmotion}`);
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
   * 
   * CRITICAL RULES:
   * - Looking down + sideways = OFF_TASK (likely phone)
   * - Looking far down (>30°) = OFF_TASK (likely phone in lap)
   * - Looking moderately down (15-30°) + centered = NOTES (legitimate note-taking)
   * - Looking up = BOARD
   * - Looking sideways = PEER
   */
  private classifyAttentionTarget(
    gazeResult: { isLookingAtScreen: boolean; gazeDirection: string },
    pose: Student3DPose
  ): StudentAttention['target'] {
    const { pitch, yaw } = pose;
    
    // Debug log for significant head movements
    if (Math.abs(pitch) > 12 || Math.abs(yaw) > 15) {
      console.log(`[Attention] Head pose: pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°`);
    }
    
    // RULE 1: Looking FAR down (>30°) = OFF_TASK (phone in lap)
    // This is too far down to be reading notes on a desk
    if (pitch > 30) {
      console.log(`[Attention] Far down gaze (${pitch.toFixed(1)}°) → off_task`);
      return 'off_task';
    }
    
    // RULE 2: Looking down + sideways = OFF_TASK (phone held to side)
    // Note-taking doesn't involve looking sideways
    if (pitch > 12 && Math.abs(yaw) > 18) {
      console.log(`[Attention] Down+sideways (pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°) → off_task`);
      return 'off_task';
    }
    
    // RULE 3: Looking significantly sideways = PEER
    if (Math.abs(yaw) > 30) {
      return 'peer';
    }

    // RULE 4: Looking up = BOARD
    if (pitch < -15) {
      return 'board';
    }
    
    // RULE 5: Moderate down (15-30°) + centered = NOTES (legitimate note-taking)
    // Only classify as notes if NOT looking sideways
    if (pitch > 15 && pitch <= 30 && Math.abs(yaw) < 18) {
      return 'notes';
    }
    
    // RULE 6: Check if looking at screen
    if (!gazeResult.isLookingAtScreen) {
      // Moderate head turn but not extreme -> could be looking at peer or off_task
      if (Math.abs(yaw) > 20) {
        return 'peer';
      }
      // Looking down but not at notes = off_task
      if (pitch > 12) {
        console.log(`[Attention] Down gaze not at screen (${pitch.toFixed(1)}°) → off_task`);
        return 'off_task';
      }
      return 'off_task';
    }

    // Center gaze with slight variations
    switch (gazeResult.gazeDirection) {
      case 'center':
        return 'teacher';
      case 'up':
        return 'board';
      case 'down':
        // Only notes if pitch is in valid range and centered
        return (pitch > 15 && Math.abs(yaw) < 18) ? 'notes' : 'screen';
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
   * 
   * CRITICAL: Distraction detection takes priority over note-taking
   * - Looking down + sideways = DISTRACTED (phone)
   * - Looking far down = DISTRACTED (phone in lap)
   * - off_task attention = DISTRACTED
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
    const attentionTarget = student.attention.target; // Store to avoid type narrowing issues
    const isLookingAtContent = ['teacher', 'board', 'screen', 'notes'].includes(attentionTarget);
    
    // Get head pose for distraction checks
    const { pitch, yaw } = student.pose;

    // ============================================
    // DISTRACTION RULES (CHECK FIRST - HIGHEST PRIORITY)
    // ============================================
    
    // RULE: Off-task attention = DISTRACTED
    if (attentionTarget === 'off_task') {
      primaryBehavior = 'distracted';
      visualConfidence = Math.max(0.7, student.attention.confidence);
      console.log(`[Behavior] Off-task attention → distracted`);
    }
    // RULE: Looking DOWN + SIDEWAYS = DISTRACTED (likely phone held to side)
    else if (pitch > 12 && Math.abs(yaw) > 15) {
      primaryBehavior = 'distracted';
      visualConfidence = Math.min(0.85, 0.6 + pitch / 50 + Math.abs(yaw) / 60);
      console.log(`[Behavior] Down+sideways (pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°) → distracted`);
    }
    // RULE: Looking FAR DOWN = DISTRACTED (phone in lap)
    else if (pitch > 28) {
      primaryBehavior = 'distracted';
      visualConfidence = Math.min(0.8, 0.5 + (pitch - 28) / 40);
      console.log(`[Behavior] Far down gaze (pitch=${pitch.toFixed(1)}°) → distracted`);
    }
    // RULE: Disengaged emotions
    else if (
      (student.emotion.primaryEmotion === 'bored' || student.emotion.primaryEmotion === 'drowsy') &&
      student.emotion.arousal < 0.3
    ) {
      primaryBehavior = 'disengaged';
      visualConfidence = student.emotion.confidence;
    }
    // ============================================
    // ENGAGEMENT RULES (CHECK AFTER DISTRACTION)
    // ============================================
    // RULE: Active Listening (PRIORITY for engaged/happy students)
    else if (isPositivelyEngaged && isLookingAtContent) {
      primaryBehavior = 'active_listening';
      visualConfidence = Math.max(student.emotion.confidence, 0.7);
    }
    // RULE: Active Listening (focused variant)
    else if (
      (attentionTarget === 'teacher' || attentionTarget === 'board') &&
      isFocused &&
      gazeStability > 0.5 &&
      headPoseStability > 0.4
    ) {
      primaryBehavior = 'active_listening';
      visualConfidence = Math.min(student.attention.confidence, student.emotion.confidence, gazeStability);
    }
    // RULE: Passive Listening
    else if (
      ['teacher', 'board', 'screen'].includes(attentionTarget) &&
      student.emotion.primaryEmotion === 'neutral' &&
      gazeStability > 0.3
    ) {
      primaryBehavior = 'passive_listening';
      visualConfidence = Math.min(student.attention.confidence, gazeStability);
    }
    // RULE: Cognitive Load
    else if (
      ['board', 'notes', 'screen'].includes(attentionTarget) &&
      student.emotion.primaryEmotion === 'confused' &&
      blinkRate > 0.3
    ) {
      primaryBehavior = 'cognitive_load';
      visualConfidence = student.emotion.confidence;
    }
    // RULE: Note Taking (STRICT CRITERIA)
    // Must be looking down (15-30°) AND centered (no sideways tilt)
    else if (
      attentionTarget === 'notes' &&
      pitch > 15 &&
      pitch < 30 &&
      Math.abs(yaw) < 15 &&  // Strict: no sideways tilt
      gazeStability > 0.4
    ) {
      primaryBehavior = 'note_taking';
      visualConfidence = student.attention.confidence;
    }
    // RULE: Peer Discussion
    else if (
      attentionTarget === 'peer' &&
      (student.emotion.primaryEmotion === 'engaged' || student.emotion.valence > 0.2) &&
      headPoseStability < 0.6
    ) {
      primaryBehavior = 'peer_discussion';
      visualConfidence = Math.min(student.attention.confidence, student.emotion.confidence);
    }
    // RULE: Off-Task Talking (peer direction with negative emotion)
    else if (
      attentionTarget === 'peer' &&
      headPoseStability < 0.4 &&
      student.emotion.valence < 0.3
    ) {
      primaryBehavior = 'off_task_talking';
      visualConfidence = Math.min(student.attention.confidence, 1 - headPoseStability);
    }
    // RULE: Moderate down gaze without note context = distracted
    else if (pitch > 18 && attentionTarget !== 'notes') {
      primaryBehavior = 'distracted';
      visualConfidence = 0.6;
      console.log(`[Behavior] Moderate down (pitch=${pitch.toFixed(1)}°) without notes → distracted`);
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
   * Check if a phone is detected near/overlapping with a student
   * Used for per-student phone detection in multi-student mode
   * 
   * APPROACH: Multi-signal phone use detection
   * 1. COCO-SSD object detection (if available)
   * 2. Gaze + Head Pose inference (looking down/away at hands)
   * 3. Behavioral pattern detection (sustained downward gaze)
   */
  private checkPhoneForStudent(student: StudentState): { detected: boolean; confidence: number } {
    // METHOD 1: COCO-SSD object detection (if available)
    const cocoDetection = this.checkPhoneViaCOCOSSD(student);
    if (cocoDetection.detected) {
      console.log(`[Phone Check] COCO-SSD detected phone for student ${student.id.id}`);
      return cocoDetection;
    }
    
    // METHOD 2: Gaze + Head Pose inference
    // When using a phone, users typically:
    // - Look DOWN (positive pitch) at their hands
    // - May look slightly to the side (yaw)
    // - Eyes may not be looking at screen
    // - Gaze direction is "down" or off-center
    const poseInference = this.inferPhoneUseFromPose(student);
    if (poseInference.detected) {
      console.log(`[Phone Check] Pose inference detected phone use for student ${student.id.id}: pitch=${student.pose.pitch.toFixed(1)}°, yaw=${student.pose.yaw.toFixed(1)}°`);
      return poseInference;
    }
    
    return { detected: false, confidence: 0 };
  }
  
  /**
   * Check for phone using COCO-SSD detections
   */
  private checkPhoneViaCOCOSSD(student: StudentState): { detected: boolean; confidence: number } {
    // Check for both "cell phone" and "remote" (COCO-SSD sometimes misclassifies)
    const phones = this.currentObjectDetections.filter(
      obj => (obj.objectType === 'cell phone' || obj.objectType === 'remote') && obj.confidence >= 0.15
    );
    
    if (phones.length === 0) {
      return { detected: false, confidence: 0 };
    }

    // Debug: Log phone detection attempt
    console.log(`[Phone Check] COCO-SSD found ${phones.length} phone/remote(s):`, 
      phones.map(p => `${p.objectType} (${(p.confidence * 100).toFixed(1)}%)`));
    
    // SINGLE STUDENT MODE: If only 1 student tracked, ANY phone = their phone
    const activeStudents = Array.from(this.students.values()).filter(s => s.isActive).length;
    
    if (activeStudents <= 1) {
      const bestPhone = phones.reduce((best, p) => p.confidence > best.confidence ? p : best, phones[0]);
      return { detected: true, confidence: bestPhone.confidence };
    }

    // MULTI-STUDENT MODE: Check proximity
    for (const phone of phones) {
      const overlap = this.calculateBoundingBoxOverlap(student.boundingBox, phone.boundingBox);
      if (overlap > 0.02) {
        return { detected: true, confidence: phone.confidence };
      }
      if (this.isPhoneNearStudent(student, phone)) {
        return { detected: true, confidence: phone.confidence * 0.9 };
      }
    }
    
    return { detected: false, confidence: 0 };
  }
  
  /**
   * Infer phone use from head pose and gaze patterns
   * 
   * Phone use indicators:
   * 1. Looking DOWN significantly (pitch > 20°) - looking at phone in hands
   * 2. Looking DOWN + to the SIDE (pitch > 15° AND |yaw| > 15°) - phone held to side
   * 3. Gaze NOT at screen + looking down
   * 4. Sustained pattern (not just a quick glance)
   */
  private inferPhoneUseFromPose(student: StudentState): { detected: boolean; confidence: number } {
    const { pitch, yaw } = student.pose;
    const attentionTarget = student.attention.target;
    const gazeStability = student.attention.gazeStability;
    
    // Get temporal buffers for this student to check sustained patterns
    const buffers = this.temporalBuffers.get(student.id.id);
    
    // PATTERN 1: Strong downward gaze (looking at phone in lap/hands)
    // Pitch > 25° is very significant head tilt down
    if (pitch > 25) {
      // Check if this is sustained (not just a quick glance)
      const isSustained = this.isDownwardGazeSustained(buffers, 3); // 3+ frames
      if (isSustained) {
        console.log(`[Phone Inference] Strong downward gaze detected: pitch=${pitch.toFixed(1)}°`);
        return { 
          detected: true, 
          confidence: Math.min(0.85, 0.6 + (pitch - 25) / 50) 
        };
      }
    }
    
    // PATTERN 2: Moderate downward + sideways gaze (phone held to side)
    // This catches the common pose of holding phone to the side of face
    if (pitch > 15 && Math.abs(yaw) > 20) {
      const isSustained = this.isDownwardGazeSustained(buffers, 2);
      if (isSustained) {
        console.log(`[Phone Inference] Down+side gaze detected: pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°`);
        return { 
          detected: true, 
          confidence: Math.min(0.75, 0.5 + (pitch - 15) / 40 + Math.abs(yaw) / 60) 
        };
      }
    }
    
    // PATTERN 3: Off-task attention + looking down
    // If attention is off_task AND head is tilted down, likely phone use
    if (attentionTarget === 'off_task' && pitch > 10) {
      const isSustained = this.isDownwardGazeSustained(buffers, 3);
      if (isSustained && gazeStability > 0.3) {
        console.log(`[Phone Inference] Off-task + downward gaze: pitch=${pitch.toFixed(1)}°, target=${attentionTarget}`);
        return { 
          detected: true, 
          confidence: Math.min(0.7, 0.4 + (pitch - 10) / 30) 
        };
      }
    }
    
    // PATTERN 4: Looking at "peer" position but with downward tilt
    // This catches phone use disguised as looking at neighbor
    if (attentionTarget === 'peer' && pitch > 12 && Math.abs(yaw) > 25) {
      const isSustained = this.isDownwardGazeSustained(buffers, 2);
      if (isSustained) {
        console.log(`[Phone Inference] Peer-direction + downward: pitch=${pitch.toFixed(1)}°, yaw=${yaw.toFixed(1)}°`);
        return { 
          detected: true, 
          confidence: 0.6 
        };
      }
    }
    
    return { detected: false, confidence: 0 };
  }
  
  /**
   * Check if downward gaze has been sustained for N frames
   */
  private isDownwardGazeSustained(
    buffers: StudentTemporalBuffers | undefined, 
    minFrames: number
  ): boolean {
    if (!buffers || buffers.headPoseHistory.data.length < minFrames) {
      // Not enough history, assume sustained if we're detecting it now
      return true;
    }
    
    const recentPoses = buffers.headPoseHistory.data.slice(-minFrames);
    const downwardCount = recentPoses.filter(pose => pose.pitch > 10).length;
    
    // At least 60% of recent frames should show downward gaze
    return downwardCount >= minFrames * 0.6;
  }

  /**
   * Calculate overlap ratio between two bounding boxes
   */
  private calculateBoundingBoxOverlap(
    box1: BoundingBox,
    box2: { x: number; y: number; width: number; height: number }
  ): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    
    // Return overlap as ratio of student face area
    return area1 > 0 ? intersection / area1 : 0;
  }

  /**
   * Check if phone is near student (within 3x face width - increased for better detection)
   */
  private isPhoneNearStudent(
    student: StudentState,
    phone: { boundingBox: { x: number; y: number; width: number; height: number } }
  ): boolean {
    const studentCenter = {
      x: student.boundingBox.x + student.boundingBox.width / 2,
      y: student.boundingBox.y + student.boundingBox.height / 2
    };
    const phoneCenter = {
      x: phone.boundingBox.x + phone.boundingBox.width / 2,
      y: phone.boundingBox.y + phone.boundingBox.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(studentCenter.x - phoneCenter.x, 2) +
      Math.pow(studentCenter.y - phoneCenter.y, 2)
    );
    
    // Phone within 3x face width is considered "near" (increased from 2x)
    const proximityThreshold = student.boundingBox.width * 3;
    const isNear = distance < proximityThreshold;
    
    if (isNear) {
      console.log(`[Phone Proximity] Distance: ${distance.toFixed(0)}px, Threshold: ${proximityThreshold.toFixed(0)}px - NEAR`);
    }
    
    return isNear;
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
   * 
   * CRITICAL: Phone detection (technology_use) applies a HARD PENALTY to engagement
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
    let rawScore = 
      attentionScore * weights.attention +
      emotionScore * weights.emotion +
      behaviorScore * weights.behavior +
      temporalScore * weights.temporal;

    // CRITICAL: Apply HARD PENALTY for phone/technology use
    // This ensures engagement drops significantly when phone is detected
    if (student.behavior.primaryBehavior === 'technology_use') {
      rawScore = Math.min(rawScore, 25); // Cap at 25 when using phone
      console.log(`[Engagement] Phone detected - applying hard penalty. Score capped at 25`);
    }
    
    // Also apply penalty for distracted/disengaged behaviors
    if (student.behavior.primaryBehavior === 'distracted') {
      rawScore = Math.min(rawScore, 35);
      console.log(`[Engagement] Distracted behavior - score capped at 35`);
    }
    if (student.behavior.primaryBehavior === 'disengaged') {
      rawScore = Math.min(rawScore, 30);
      console.log(`[Engagement] Disengaged behavior - score capped at 30`);
    }
    
    // CRITICAL: Apply HARD PENALTY for off_task attention
    // When student is clearly not looking at content, engagement should drop
    if (student.attention.target === 'off_task') {
      rawScore = Math.min(rawScore, 40); // Cap at 40 when off-task
      console.log(`[Engagement] Off-task attention - applying penalty. Score capped at 40`);
    }
    
    // CRITICAL: Apply HARD PENALTY for drowsy/bored emotions
    // Yawning, sleepiness, and boredom should significantly reduce engagement
    if (student.emotion.primaryEmotion === 'drowsy' && student.emotion.confidence > 0.3) {
      rawScore = Math.min(rawScore, 30); // Cap at 30 when drowsy
      console.log(`[Engagement] Drowsy emotion detected - score capped at 30`);
    }
    if (student.emotion.primaryEmotion === 'bored' && student.emotion.confidence > 0.3) {
      rawScore = Math.min(rawScore, 35); // Cap at 35 when bored
      console.log(`[Engagement] Bored emotion detected - score capped at 35`);
    }

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
    this.currentObjectDetections = [];
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
