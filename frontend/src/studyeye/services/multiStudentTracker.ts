/**
 * Multi-Student Tracker Service
 * Implements persistent student tracking across frames
 */

import type { DetectedFace, Point } from '../types';
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
  maxAssociationDistance: number;
  faceDescriptorDimensions: number;
  similarityThreshold: number;
  maxFramesWithoutDetection: number;
  trackingConfidenceDecay: number;
  maxStudents: number;
  minTrackingFrames: number;
  historyDurationSeconds: number;
  historyUpdateInterval: number;
}

interface FaceDescriptor {
  embedding: number[];
  confidence: number;
  landmarks: Point[];
}

interface TrackingCandidate {
  face: DetectedFace;
  descriptor: FaceDescriptor;
  bestMatch?: { studentId: string; similarity: number };
}

export class MultiStudentTracker {
  private config: Required<TrackerConfig>;
  private students: Map<string, StudentState> = new Map();
  private frameNumber: number = 0;
  private lastUpdateTime: number = 0;
  private descriptorCache: Map<string, FaceDescriptor[]> = new Map();

  constructor(config?: Partial<TrackerConfig>) {
    this.config = {
      maxAssociationDistance: config?.maxAssociationDistance ?? 100,
      faceDescriptorDimensions: config?.faceDescriptorDimensions ?? 128,
      similarityThreshold: config?.similarityThreshold ?? 0.7,
      maxFramesWithoutDetection: config?.maxFramesWithoutDetection ?? 30,
      trackingConfidenceDecay: config?.trackingConfidenceDecay ?? 0.95,
      maxStudents: config?.maxStudents ?? 20,
      minTrackingFrames: config?.minTrackingFrames ?? 5,
      historyDurationSeconds: config?.historyDurationSeconds ?? 60,
      historyUpdateInterval: config?.historyUpdateInterval ?? 1000,
    };
  }

  async processFrame(faces: DetectedFace[]): Promise<ClassroomState> {
    this.frameNumber++;
    const currentTime = Date.now();

    // Extract face descriptors for all detected faces
    const candidates: TrackingCandidate[] = await this.extractFaceDescriptors(faces);

    // Associate faces with existing students
    const associations = this.associateFaces(candidates);

    // Update existing students
    await this.updateExistingStudents(associations.matched, currentTime);

    // Create new students for unmatched faces
    await this.createNewStudents(associations.unmatched, currentTime);

    // Update descriptor cache
    this.updateDescriptorCache(associations.matched);

    // Update student histories
    this.updateStudentHistories(currentTime);

    // Cleanup inactive students
    this.cleanupInactiveStudents();

    // Generate classroom state
    return this.generateClassroomState(currentTime);
  }

  private async extractFaceDescriptors(faces: DetectedFace[]): Promise<TrackingCandidate[]> {
    const candidates: TrackingCandidate[] = [];

    for (const face of faces) {
      const descriptor = this.computeFaceDescriptor(face);
      candidates.push({ face, descriptor });
    }

    return candidates;
  }

  private computeFaceDescriptor(face: DetectedFace): FaceDescriptor {
    // Compute a simple descriptor based on landmark positions
    const embedding: number[] = [];
    
    if (face.landmarks && face.landmarks.length > 0) {
      // Normalize landmarks relative to bounding box
      const { x, y, width, height } = face.boundingBox;
      
      for (const landmark of face.landmarks) {
        embedding.push((landmark.x - x) / width);
        embedding.push((landmark.y - y) / height);
      }
      
      // Pad to fixed dimensions
      while (embedding.length < this.config.faceDescriptorDimensions) {
        embedding.push(0);
      }
    } else {
      // No landmarks, use bounding box center
      for (let i = 0; i < this.config.faceDescriptorDimensions; i++) {
        embedding.push(0);
      }
    }

    return {
      embedding: embedding.slice(0, this.config.faceDescriptorDimensions),
      confidence: face.confidence,
      landmarks: face.landmarks || [],
    };
  }

  private associateFaces(candidates: TrackingCandidate[]): {
    matched: Map<string, TrackingCandidate>;
    unmatched: TrackingCandidate[];
  } {
    const matched = new Map<string, TrackingCandidate>();
    const unmatched: TrackingCandidate[] = [];
    const usedStudentIds = new Set<string>();

    // For each candidate, find the best matching student
    for (const candidate of candidates) {
      let bestMatch: { studentId: string; similarity: number } | undefined;

      for (const [studentId, student] of this.students) {
        if (usedStudentIds.has(studentId)) continue;

        const similarity = this.calculateFaceSimilarity(candidate, studentId);
        
        if (similarity > this.config.similarityThreshold) {
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { studentId, similarity };
          }
        }
      }

      if (bestMatch) {
        candidate.bestMatch = bestMatch;
        matched.set(bestMatch.studentId, candidate);
        usedStudentIds.add(bestMatch.studentId);
      } else {
        unmatched.push(candidate);
      }
    }

    return { matched, unmatched };
  }

  private calculateFaceSimilarity(candidate: TrackingCandidate, studentId: string): number {
    const cachedDescriptors = this.descriptorCache.get(studentId);
    if (!cachedDescriptors || cachedDescriptors.length === 0) {
      // Fall back to position-based similarity
      const student = this.students.get(studentId);
      if (!student) return 0;

      const distance = this.calculateDistance(
        { x: candidate.face.boundingBox.x, y: candidate.face.boundingBox.y },
        { x: student.boundingBox.x, y: student.boundingBox.y }
      );

      return Math.max(0, 1 - distance / this.config.maxAssociationDistance);
    }

    // Calculate average similarity with cached descriptors
    let totalSimilarity = 0;
    for (const cached of cachedDescriptors) {
      totalSimilarity += this.cosineSimilarity(candidate.descriptor.embedding, cached.embedding);
    }

    return totalSimilarity / cachedDescriptors.length;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async updateExistingStudents(
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

      // Analyze student state
      await this.analyzeStudent(student, candidate.face);
    }

    // Decay confidence for unmatched students
    for (const [studentId, student] of this.students) {
      if (!matched.has(studentId)) {
        student.framesSinceDetection++;
        student.trackingConfidence *= this.config.trackingConfidenceDecay;
        
        if (student.framesSinceDetection > this.config.maxFramesWithoutDetection) {
          student.isActive = false;
        }
      }
    }
  }

  private async createNewStudents(
    unmatched: TrackingCandidate[],
    currentTime: number
  ): Promise<void> {
    for (const candidate of unmatched) {
      if (this.students.size >= this.config.maxStudents) break;

      const studentId = this.generateStudentId();
      const student = this.createInitialStudentState(studentId, candidate.face, currentTime);
      
      this.students.set(studentId, student);
      this.descriptorCache.set(studentId, [candidate.descriptor]);

      // Analyze initial state
      await this.analyzeStudent(student, candidate.face);
    }
  }

  private generateStudentId(): string {
    return `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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
      pitch: 0,
      yaw: 0,
      roll: 0,
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      confidence: 0,
    };

    const emotion: StudentEmotion = {
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
      score: 50,
      level: 'medium',
      trend: 'stable',
      attentionScore: 50,
      emotionScore: 50,
      behaviorScore: 50,
      temporalScore: 50,
      engagementHistory: [],
      averageScore: 50,
      volatility: 0,
    };

    const history: StudentHistory = {
      poses: [],
      emotions: [],
      behaviors: [],
      engagements: [],
      timestamps: [],
    };

    return {
      id,
      boundingBox: {
        ...face.boundingBox,
        confidence: face.confidence,
      },
      pose,
      emotion,
      attention,
      behavior,
      engagement,
      history,
      lastUpdated: currentTime,
      framesSinceDetection: 0,
      isActive: true,
      trackingConfidence: face.confidence,
    };
  }

  private async analyzeStudent(student: StudentState, face: DetectedFace): Promise<void> {
    try {
      // Estimate head pose
      const poseResult = headPoseEstimator.estimatePose(face.landmarks);
      if (poseResult) {
        student.pose = {
          pitch: poseResult.pitch,
          yaw: poseResult.yaw,
          roll: poseResult.roll,
          translation: [0, 0, 0],
          rotation: [poseResult.pitch, poseResult.yaw, poseResult.roll],
          confidence: poseResult.confidence || 0.8,
        };
      }

      // Estimate gaze
      const gazeResult = gazeEstimator.estimateGaze(face.landmarks, face.boundingBox);
      if (gazeResult) {
        student.attention = {
          target: this.classifyAttentionTarget(gazeResult),
          confidence: gazeResult.focusConfidence || 0.5,
          gazeStability: gazeResult.gazeStability || 0,
          fixationDuration: student.attention.fixationDuration + 33, // ~30fps
          saccadeRate: 0,
          gazeVector: this.calculateGazeVector(student.pose),
          gazePoint: null,
        };
      }

      // Recognize emotion - pass landmarks and confidence
      const emotionResult = emotionRecognizer.recognizeEmotion(face.landmarks, face.confidence);
      if (emotionResult) {
        student.emotion = {
          valence: emotionResult.valence,
          arousal: emotionResult.arousal,
          dominance: emotionResult.dominance,
          emotions: {
            engaged: emotionResult.emotions.engaged || 0,
            confused: emotionResult.emotions.confused || 0,
            bored: emotionResult.emotions.bored || 0,
            frustrated: emotionResult.emotions.frustrated || 0,
            focused: emotionResult.emotions.focused || 0,
            drowsy: emotionResult.emotions.drowsy || 0,
            neutral: emotionResult.emotions.neutral || 1,
          },
          primaryEmotion: emotionResult.primaryEmotion,
          confidence: emotionResult.confidence,
        };
      }

      // Classify behavior
      student.behavior = this.classifyBehavior(student);

      // Calculate engagement
      student.engagement = this.calculateEngagement(student);

    } catch (error) {
      console.warn('Error analyzing student:', error);
    }
  }

  private classifyAttentionTarget(gazeResult: { 
    isLookingAtScreen: boolean; 
    gazeDirection: string;
  }): StudentAttention['target'] {
    if (!gazeResult.isLookingAtScreen) {
      return 'off_task';
    }

    switch (gazeResult.gazeDirection) {
      case 'center':
        return 'screen';
      case 'up':
        return 'board';
      case 'down':
        return 'notes';
      case 'left':
      case 'right':
        return 'peer';
      default:
        return 'unknown';
    }
  }

  private calculateGazeVector(pose: Student3DPose): [number, number, number] {
    const pitchRad = (pose.pitch * Math.PI) / 180;
    const yawRad = (pose.yaw * Math.PI) / 180;

    return [
      Math.sin(yawRad),
      -Math.sin(pitchRad),
      Math.cos(yawRad) * Math.cos(pitchRad),
    ];
  }

  private mapEmotionCategory(emotion: string): keyof StudentEmotion['emotions'] {
    const mapping: Record<string, keyof StudentEmotion['emotions']> = {
      focused: 'focused',
      confused: 'confused',
      bored: 'bored',
      frustrated: 'frustrated',
      happy: 'engaged',
      drowsy: 'drowsy',
      neutral: 'neutral',
    };
    return mapping[emotion] || 'neutral';
  }

  private classifyBehavior(student: StudentState): StudentBehavior {
    let primaryBehavior: PrimaryBehavior = 'passive_listening';
    let visualConfidence = 0.5;

    // Classify based on attention and emotion
    if (student.attention.target === 'off_task') {
      primaryBehavior = 'distracted';
      visualConfidence = student.attention.confidence;
    } else if (student.attention.target === 'notes') {
      primaryBehavior = 'note_taking';
      visualConfidence = student.attention.confidence;
    } else if (student.attention.target === 'peer') {
      primaryBehavior = student.emotion.primaryEmotion === 'engaged' 
        ? 'peer_discussion' 
        : 'off_task_talking';
      visualConfidence = Math.min(student.attention.confidence, student.emotion.confidence);
    } else if (student.emotion.primaryEmotion === 'focused' || student.emotion.primaryEmotion === 'engaged') {
      primaryBehavior = 'active_listening';
      visualConfidence = student.emotion.confidence;
    } else if (student.emotion.primaryEmotion === 'confused') {
      primaryBehavior = 'cognitive_load';
      visualConfidence = student.emotion.confidence;
    } else if (student.emotion.primaryEmotion === 'bored' || student.emotion.primaryEmotion === 'drowsy') {
      primaryBehavior = 'disengaged';
      visualConfidence = student.emotion.confidence;
    }

    const prevBehavior = student.behavior;
    const isSameBehavior = prevBehavior.primaryBehavior === primaryBehavior;

    return {
      primaryBehavior,
      visualConfidence,
      audioConfidence: 0,
      temporalConfidence: isSameBehavior ? Math.min(1, prevBehavior.temporalConfidence + 0.1) : 0.5,
      overallConfidence: visualConfidence,
      duration: isSameBehavior ? prevBehavior.duration + 33 : 0,
      stability: isSameBehavior ? Math.min(1, prevBehavior.stability + 0.05) : 0,
      transitionCount: isSameBehavior ? prevBehavior.transitionCount : prevBehavior.transitionCount + 1,
    };
  }

  private calculateEngagement(student: StudentState): StudentEngagement {
    // Calculate component scores
    const attentionScore = this.calculateAttentionScore(student);
    const emotionScore = this.calculateEmotionScore(student);
    const behaviorScore = this.calculateBehaviorScore(student);
    const temporalScore = student.engagement.temporalScore;

    // Weighted average
    const score = Math.round(
      attentionScore * 0.3 +
      emotionScore * 0.25 +
      behaviorScore * 0.3 +
      temporalScore * 0.15
    );

    // Determine level
    let level: StudentEngagement['level'];
    if (score >= 75) level = 'high';
    else if (score >= 50) level = 'medium';
    else if (score >= 25) level = 'low';
    else level = 'disengaged';

    // Calculate trend
    const history = [...student.engagement.engagementHistory, score].slice(-10);
    let trend: StudentEngagement['trend'] = 'stable';
    
    if (history.length >= 3) {
      const recent = history.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const older = history.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      
      if (recent - older > 5) trend = 'increasing';
      else if (older - recent > 5) trend = 'decreasing';
    }

    // Calculate volatility
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / history.length;
    const volatility = Math.min(1, Math.sqrt(variance) / 50);

    return {
      score,
      level,
      trend,
      attentionScore,
      emotionScore,
      behaviorScore,
      temporalScore: Math.round(temporalScore * 0.9 + score * 0.1),
      engagementHistory: history,
      averageScore: Math.round(avg),
      volatility,
    };
  }

  private calculateAttentionScore(student: StudentState): number {
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
    const stabilityBonus = student.attention.gazeStability * 10;
    
    return Math.min(100, Math.round(baseScore * student.attention.confidence + stabilityBonus));
  }

  private calculateEmotionScore(student: StudentState): number {
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
    return Math.round(baseScore * student.emotion.confidence);
  }

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
    const stabilityBonus = student.behavior.stability * 10;
    
    return Math.min(100, Math.round(baseScore * student.behavior.overallConfidence + stabilityBonus));
  }

  private updateDescriptorCache(matched: Map<string, TrackingCandidate>): void {
    for (const [studentId, candidate] of matched) {
      const cache = this.descriptorCache.get(studentId) || [];
      cache.push(candidate.descriptor);
      
      // Keep only recent descriptors
      if (cache.length > 10) {
        cache.shift();
      }
      
      this.descriptorCache.set(studentId, cache);
    }
  }

  private updateStudentHistories(currentTime: number): void {
    const historyInterval = this.config.historyUpdateInterval;
    
    if (currentTime - this.lastUpdateTime < historyInterval) {
      return;
    }
    
    this.lastUpdateTime = currentTime;
    const maxHistory = Math.floor((this.config.historyDurationSeconds * 1000) / historyInterval);

    for (const student of this.students.values()) {
      if (!student.isActive) continue;

      student.history.poses.push({ ...student.pose });
      student.history.emotions.push({ ...student.emotion });
      student.history.behaviors.push({ ...student.behavior });
      student.history.engagements.push({ ...student.engagement });
      student.history.timestamps.push(currentTime);

      // Trim history
      if (student.history.timestamps.length > maxHistory) {
        student.history.poses = student.history.poses.slice(-maxHistory);
        student.history.emotions = student.history.emotions.slice(-maxHistory);
        student.history.behaviors = student.history.behaviors.slice(-maxHistory);
        student.history.engagements = student.history.engagements.slice(-maxHistory);
        student.history.timestamps = student.history.timestamps.slice(-maxHistory);
      }
    }
  }

  private cleanupInactiveStudents(): void {
    const toRemove: string[] = [];

    for (const [studentId, student] of this.students) {
      if (student.framesSinceDetection > this.config.maxFramesWithoutDetection * 2) {
        toRemove.push(studentId);
      }
    }

    for (const studentId of toRemove) {
      this.students.delete(studentId);
      this.descriptorCache.delete(studentId);
    }
  }

  private generateClassroomState(currentTime: number): ClassroomState {
    const activeStudents = Array.from(this.students.values()).filter(s => s.isActive);
    
    // Calculate aggregate metrics
    const totalEngagement = activeStudents.reduce((sum, s) => sum + s.engagement.score, 0);
    const averageEngagement = activeStudents.length > 0 
      ? Math.round(totalEngagement / activeStudents.length) 
      : 0;

    // Calculate engagement distribution
    const distribution = { high: 0, medium: 0, low: 0, disengaged: 0 };
    for (const student of activeStudents) {
      distribution[student.engagement.level]++;
    }

    // Calculate behavior distribution
    const behaviorDistribution: Record<PrimaryBehavior, number> = {
      active_listening: 0,
      passive_listening: 0,
      cognitive_load: 0,
      peer_discussion: 0,
      off_task_talking: 0,
      note_taking: 0,
      distracted: 0,
      disengaged: 0,
      technology_use: 0,
    };
    
    for (const student of activeStudents) {
      behaviorDistribution[student.behavior.primaryBehavior]++;
    }

    // Generate alerts
    const alerts = this.generateAlerts(activeStudents, currentTime);

    return {
      students: this.students,
      timestamp: currentTime,
      frameNumber: this.frameNumber,
      totalStudents: this.students.size,
      activeStudents: activeStudents.length,
      averageEngagement,
      engagementDistribution: distribution,
      behaviorDistribution,
      alerts,
    };
  }

  private generateAlerts(students: StudentState[], currentTime: number): ClassroomAlert[] {
    const alerts: ClassroomAlert[] = [];

    // Check for low engagement
    const lowEngagementStudents = students.filter(s => s.engagement.level === 'low' || s.engagement.level === 'disengaged');
    if (lowEngagementStudents.length > 0) {
      alerts.push({
        type: 'low_engagement',
        studentIds: lowEngagementStudents.map(s => s.id.id),
        severity: lowEngagementStudents.length > 3 ? 'high' : 'medium',
        message: `${lowEngagementStudents.length} student(s) showing low engagement`,
        timestamp: currentTime,
      });
    }

    // Check for distraction
    const distractedStudents = students.filter(s => 
      s.behavior.primaryBehavior === 'distracted' || 
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

    // Check for confusion
    const confusedStudents = students.filter(s => 
      s.emotion.primaryEmotion === 'confused' && s.emotion.confidence > 0.6
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

    return alerts;
  }

  private calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  // Public API methods
  getClassroomState(): ClassroomState {
    return this.generateClassroomState(Date.now());
  }

  getStudentState(studentId: string): StudentState | undefined {
    return this.students.get(studentId);
  }

  reset(): void {
    this.students.clear();
    this.descriptorCache.clear();
    this.frameNumber = 0;
    this.lastUpdateTime = 0;
  }
}

// Export singleton instance
export const multiStudentTracker = new MultiStudentTracker();
