/**
 * Student State Model Types
 * 
 * Unified per-student state model with persistent IDs for multi-student tracking.
 * Supports temporal consistency and comprehensive engagement analysis.
 */

export interface StudentID {
  id: string;
  confidence: number;
  firstSeen: number;
  lastSeen: number;
}

export interface Student3DPose {
  // 3D head pose from solvePnP
  pitch: number;    // X-axis rotation (nodding)
  yaw: number;      // Y-axis rotation (turning)
  roll: number;     // Z-axis rotation (tilting)
  translation: [number, number, number]; // 3D position
  rotation: [number, number, number];    // Rodrigues rotation vector
  confidence: number;
}

export interface StudentEmotion {
  // Research-based emotion categories for engagement
  valence: number;        // -1 (negative) to +1 (positive)
  arousal: number;        // 0 (calm) to 1 (excited)
  dominance: number;      // 0 (submissive) to 1 (dominant)
  
  // Discrete emotions with confidence
  emotions: {
    engaged: number;      // Active learning state
    confused: number;     // Cognitive difficulty
    bored: number;        // Disengagement
    frustrated: number;   // Negative engagement
    focused: number;      // Deep concentration
    drowsy: number;       // Fatigue
    neutral: number;      // Baseline state
  };
  
  primaryEmotion: keyof StudentEmotion['emotions'];
  confidence: number;
}

export interface StudentAttention {
  // Attention target classification
  target: 'teacher' | 'board' | 'screen' | 'notes' | 'peer' | 'off_task' | 'unknown';
  confidence: number;
  
  // Gaze metrics
  gazeStability: number;     // 0-1, temporal consistency
  fixationDuration: number;  // ms, current fixation length
  saccadeRate: number;       // saccades per second
  
  // 3D gaze vector (from head pose + eye position)
  gazeVector: [number, number, number];
  gazePoint: { x: number; y: number } | null; // Screen coordinates
}

export type PrimaryBehavior = 
  | 'active_listening'      // Engaged, looking at teacher/board, responsive
  | 'passive_listening'     // Attentive but not actively participating
  | 'cognitive_load'        // Processing information, may look confused
  | 'peer_discussion'       // Interacting with classmates (positive)
  | 'off_task_talking'      // Social conversation (negative)
  | 'note_taking'           // Writing, looking down at materials
  | 'distracted'            // Looking away, fidgeting
  | 'disengaged'            // No face detected or clearly not participating
  | 'technology_use';       // Phone/device usage

export interface StudentBehavior {
  // Research-aligned behavior classes
  primaryBehavior: PrimaryBehavior;
  
  // Multimodal confidence scores
  visualConfidence: number;   // Face/gaze-based confidence
  audioConfidence: number;    // Speech-based confidence
  temporalConfidence: number; // Consistency over time
  overallConfidence: number;  // Combined confidence
  
  // Behavior duration and stability
  duration: number;           // ms, how long in current behavior
  stability: number;          // 0-1, consistency over time
  transitionCount: number;    // Number of behavior changes
  
  // Optional temporal fields
  behaviorStartTime?: number;
  behaviorDuration?: number;
  transitionProbability?: number; // Likelihood of behavior change
}

export interface StudentEngagement {
  // Engagement score (0-100)
  score: number;
  level: 'high' | 'medium' | 'low' | 'disengaged';
  trend: 'increasing' | 'stable' | 'decreasing';
  
  // Contributing factors
  attentionScore: number;     // 0-100, attention-based component
  emotionScore: number;       // 0-100, emotion-based component
  behaviorScore: number;      // 0-100, behavior-based component
  temporalScore: number;      // 0-100, temporal consistency component
  
  // Temporal metrics
  engagementHistory: number[]; // Last 60 seconds of scores
  averageScore: number;        // 60-second average
  volatility: number;          // Score variance (0-1)
  
  // Extended engagement components (research-based)
  cognitive?: number;          // Mental effort and processing
  emotional?: number;          // Positive affect and interest
  behavioral?: number;         // Active participation and attention
  
  // Extended temporal metrics
  sustainedAttention?: number; // Minutes of continuous engagement
  engagementVariability?: number; // Consistency over session
  peakEngagement?: number;     // Highest engagement in session
  
  // Predictive metrics
  riskOfDisengagement?: number; // 0-1 probability of becoming disengaged
  interventionRecommended?: boolean;
}

export interface StudentHistory {
  poses: Student3DPose[];
  emotions: StudentEmotion[];
  behaviors: StudentBehavior[];
  engagements: StudentEngagement[];
  timestamps: number[];
  maxHistoryLength?: number;
}

export interface StudentState {
  // Identity and tracking
  id: StudentID;
  
  // Spatial information
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence?: number;
  };
  
  // Multimodal analysis
  pose: Student3DPose;
  emotion: StudentEmotion;
  attention: StudentAttention;
  behavior: StudentBehavior;
  engagement: StudentEngagement;
  
  // Temporal history (last 60 seconds)
  history: StudentHistory;
  
  // Tracking metadata
  lastUpdated: number;
  framesSinceDetection: number;
  isActive: boolean; // Currently visible and being tracked
  trackingConfidence: number;
}

export type AlertType = 'low_engagement' | 'distraction' | 'technology_use' | 'no_face' | 'disengagement' | 'confusion' | 'technology_misuse' | 'peer_disruption';

export interface ClassroomAlert {
  type: AlertType;
  studentId?: string;
  studentIds?: string[];
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  acknowledged?: boolean;
}

export interface ClassroomState {
  students: Map<string, StudentState>;
  timestamp: number;
  frameNumber?: number;
  
  // Aggregate metrics
  totalStudents?: number;
  activeStudents: number;
  averageEngagement: number;
  engagementDistribution: {
    high: number;
    medium: number;
    low: number;
    disengaged: number;
  };
  
  // Behavior distribution
  behaviorDistribution?: Record<PrimaryBehavior, number>;
  
  // Classroom-level insights
  overallAttentionTarget?: StudentAttention['target'];
  classroomEnergy?: number; // 0-1, based on movement and engagement
  teacherPresence?: boolean; // Is teacher detected in frame
  
  // Alerts and recommendations
  alerts: ClassroomAlert[];
  recommendations?: string[];
}

// Output format matching reference image requirements
export interface StudentOutput {
  studentId: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Main display metrics (as shown in reference image)
  state: StudentBehavior['primaryBehavior'];
  engagementScore: number; // 0-100
  attentionTarget: StudentAttention['target'];
  confidence: number; // Overall confidence 0-100
  
  // Additional metadata
  emotion: StudentEmotion['primaryEmotion'];
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  
  // Temporal context
  behaviorDuration: number; // seconds in current behavior
  engagementTrend: StudentEngagement['trend'];
}

export interface ClassroomOutput {
  timestamp: number;
  students: StudentOutput[];
  
  // Classroom summary
  totalStudents: number;
  averageEngagement: number;
  alerts: ClassroomAlert[];
  
  // Performance metrics
  processingFPS: number;
  latency: number; // ms from frame to output
}
