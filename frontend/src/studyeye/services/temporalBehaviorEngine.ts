/**
 * Temporal Behavior Inference Engine
 * 
 * Maps multimodal signals to high-level engagement states using temporal patterns,
 * behavior transitions, and contextual analysis aligned with engagement research.
 */

import type { StudentState, ClassroomState } from '../types/studentState';

export interface BehaviorPattern {
  name: string;
  description: string;
  indicators: {
    pose: { pitch?: [number, number]; yaw?: [number, number]; roll?: [number, number] };
    emotion: { primary?: string[]; valence?: [number, number]; arousal?: [number, number] };
    attention: { targets?: string[]; stability?: [number, number] };
    duration: [number, number]; // min/max duration in seconds
  };
  engagementImpact: number; // -1 to 1
  confidence: number;
}

export interface BehaviorTransition {
  from: string;
  to: string;
  probability: number;
  duration: number; // average duration in seconds
  triggers: string[];
}

export interface EngagementContext {
  classPhase: 'introduction' | 'instruction' | 'activity' | 'discussion' | 'assessment' | 'break';
  timeInPhase: number; // seconds
  teacherActivity: 'speaking' | 'writing' | 'demonstrating' | 'monitoring' | 'absent';
  classroomNoise: number; // 0-1
  averageEngagement: number; // 0-100
}

/**
 * Research-based behavior patterns for classroom engagement
 */
const BEHAVIOR_PATTERNS: BehaviorPattern[] = [
  {
    name: 'active_listening',
    description: 'Student actively engaged with teacher/content',
    indicators: {
      pose: { pitch: [-10, 10], yaw: [-20, 20] },
      emotion: { primary: ['engaged', 'focused'], valence: [0.2, 1.0] },
      attention: { targets: ['teacher', 'board'], stability: [0.7, 1.0] },
      duration: [30, 300]
    },
    engagementImpact: 0.9,
    confidence: 0.85
  },
  {
    name: 'passive_listening',
    description: 'Student attentive but not actively participating',
    indicators: {
      pose: { pitch: [-15, 15], yaw: [-30, 30] },
      emotion: { primary: ['neutral', 'focused'], valence: [-0.2, 0.5] },
      attention: { targets: ['teacher', 'board', 'screen'], stability: [0.5, 0.8] },
      duration: [60, 600]
    },
    engagementImpact: 0.6,
    confidence: 0.7
  },
  {
    name: 'cognitive_load',
    description: 'Student processing complex information, may appear confused',
    indicators: {
      pose: { pitch: [-5, 25], yaw: [-15, 15] },
      emotion: { primary: ['confused', 'focused'], valence: [-0.3, 0.3], arousal: [0.4, 0.8] },
      attention: { targets: ['teacher', 'board', 'notes'], stability: [0.3, 0.7] },
      duration: [15, 120]
    },
    engagementImpact: 0.4,
    confidence: 0.6
  },
  {
    name: 'note_taking',
    description: 'Student actively taking notes or writing',
    indicators: {
      pose: { pitch: [-45, -10], yaw: [-10, 10] },
      emotion: { primary: ['focused', 'neutral'], valence: [0.0, 0.6] },
      attention: { targets: ['notes'], stability: [0.8, 1.0] },
      duration: [30, 180]
    },
    engagementImpact: 0.8,
    confidence: 0.9
  },
  {
    name: 'peer_discussion',
    description: 'Student engaged in productive peer interaction',
    indicators: {
      pose: { yaw: [-60, 60] },
      emotion: { primary: ['engaged', 'happy'], valence: [0.3, 1.0] },
      attention: { targets: ['peer'], stability: [0.6, 1.0] },
      duration: [20, 300]
    },
    engagementImpact: 0.7,
    confidence: 0.75
  },
  {
    name: 'off_task_talking',
    description: 'Student engaged in non-academic social conversation',
    indicators: {
      pose: { yaw: [-90, 90] },
      emotion: { primary: ['happy', 'neutral'], valence: [0.2, 0.8] },
      attention: { targets: ['peer', 'off_task'], stability: [0.4, 0.8] },
      duration: [10, 120]
    },
    engagementImpact: -0.3,
    confidence: 0.65
  },
  {
    name: 'distracted',
    description: 'Student attention wandering, looking away from task',
    indicators: {
      pose: { yaw: [-90, 90] },
      emotion: { primary: ['bored', 'neutral'], valence: [-0.5, 0.2] },
      attention: { targets: ['off_task'], stability: [0.2, 0.6] },
      duration: [5, 60]
    },
    engagementImpact: -0.5,
    confidence: 0.7
  },
  {
    name: 'disengaged',
    description: 'Student completely disengaged from learning activity',
    indicators: {
      pose: { pitch: [-30, 30], yaw: [-90, 90] },
      emotion: { primary: ['bored', 'drowsy'], valence: [-0.8, 0.0], arousal: [0.0, 0.3] },
      attention: { targets: ['off_task', 'unknown'], stability: [0.0, 0.4] },
      duration: [30, 600]
    },
    engagementImpact: -0.8,
    confidence: 0.8
  },
  {
    name: 'technology_use',
    description: 'Student using phone or unauthorized technology',
    indicators: {
      pose: { pitch: [-20, 5], yaw: [-30, 30] },
      emotion: { primary: ['focused', 'happy'], valence: [0.0, 0.7] },
      attention: { targets: ['off_task'], stability: [0.7, 1.0] },
      duration: [10, 300]
    },
    engagementImpact: -0.9,
    confidence: 0.95
  }
];

/**
 * Behavior transition probabilities based on classroom research
 */
const BEHAVIOR_TRANSITIONS: BehaviorTransition[] = [
  { from: 'active_listening', to: 'passive_listening', probability: 0.3, duration: 45, triggers: ['fatigue', 'complexity'] },
  { from: 'active_listening', to: 'note_taking', probability: 0.2, duration: 30, triggers: ['instruction', 'important_info'] },
  { from: 'passive_listening', to: 'active_listening', probability: 0.25, duration: 60, triggers: ['teacher_question', 'engagement_cue'] },
  { from: 'passive_listening', to: 'cognitive_load', probability: 0.2, duration: 40, triggers: ['complex_content', 'confusion'] },
  { from: 'passive_listening', to: 'distracted', probability: 0.15, duration: 90, triggers: ['boredom', 'external_stimulus'] },
  { from: 'cognitive_load', to: 'active_listening', probability: 0.4, duration: 30, triggers: ['understanding', 'clarification'] },
  { from: 'cognitive_load', to: 'distracted', probability: 0.3, duration: 60, triggers: ['frustration', 'giving_up'] },
  { from: 'note_taking', to: 'active_listening', probability: 0.6, duration: 20, triggers: ['completion', 'teacher_speaking'] },
  { from: 'distracted', to: 'passive_listening', probability: 0.4, duration: 45, triggers: ['refocus', 'teacher_intervention'] },
  { from: 'distracted', to: 'disengaged', probability: 0.2, duration: 120, triggers: ['continued_disinterest', 'fatigue'] },
  { from: 'peer_discussion', to: 'active_listening', probability: 0.5, duration: 30, triggers: ['task_completion', 'teacher_redirect'] },
  { from: 'off_task_talking', to: 'distracted', probability: 0.4, duration: 60, triggers: ['social_continuation', 'avoidance'] },
  { from: 'disengaged', to: 'passive_listening', probability: 0.3, duration: 90, triggers: ['re_engagement', 'peer_influence'] },
  { from: 'technology_use', to: 'distracted', probability: 0.6, duration: 30, triggers: ['device_put_away', 'interruption'] }
];

export class TemporalBehaviorEngine {
  private behaviorHistory: Map<string, Array<{ behavior: string; timestamp: number; confidence: number }>> = new Map();
  private transitionHistory: Map<string, BehaviorTransition[]> = new Map();
  private contextHistory: EngagementContext[] = [];
  
  /**
   * Analyze student behavior patterns and infer high-level engagement states
   */
  public analyzeBehaviorPatterns(classroomState: ClassroomState): Map<string, BehaviorAnalysis> {
    const analyses = new Map<string, BehaviorAnalysis>();
    
    for (const [studentId, student] of classroomState.students) {
      if (!student.isActive) continue;
      
      const analysis = this.analyzeStudentBehavior(studentId, student, classroomState);
      analyses.set(studentId, analysis);
    }
    
    return analyses;
  }

  /**
   * Analyze individual student behavior with temporal context
   */
  private analyzeStudentBehavior(
    studentId: string, 
    student: StudentState, 
    classroomState: ClassroomState
  ): BehaviorAnalysis {
    // Get behavior history for temporal analysis
    const history = this.behaviorHistory.get(studentId) || [];
    
    // Match current state to behavior patterns
    const patternMatches = this.matchBehaviorPatterns(student);
    
    // Analyze temporal consistency
    const temporalConsistency = this.analyzeTemporalConsistency(studentId, patternMatches);
    
    // Predict behavior transitions
    const transitionPredictions = this.predictBehaviorTransitions(studentId, patternMatches);
    
    // Calculate contextual engagement
    const contextualEngagement = this.calculateContextualEngagement(
      student, 
      patternMatches, 
      classroomState
    );
    
    // Update behavior history
    this.updateBehaviorHistory(studentId, patternMatches);
    
    return {
      studentId,
      currentBehavior: patternMatches[0] || { pattern: BEHAVIOR_PATTERNS[1], confidence: 0.5 },
      alternativeBehaviors: patternMatches.slice(1, 3),
      temporalConsistency,
      transitionPredictions,
      contextualEngagement,
      recommendedInterventions: this.generateInterventions(patternMatches[0], student)
    };
  }

  /**
   * Match student state to behavior patterns
   */
  private matchBehaviorPatterns(student: StudentState): Array<{ pattern: BehaviorPattern; confidence: number }> {
    const matches: Array<{ pattern: BehaviorPattern; confidence: number }> = [];
    
    for (const pattern of BEHAVIOR_PATTERNS) {
      const confidence = this.calculatePatternMatch(student, pattern);
      if (confidence > 0.3) {
        matches.push({ pattern, confidence });
      }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  }

  /**
   * Calculate how well a student matches a behavior pattern
   */
  private calculatePatternMatch(student: StudentState, pattern: BehaviorPattern): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Pose matching
    if (pattern.indicators.pose) {
      const poseScore = this.matchPoseIndicators(student.pose, pattern.indicators.pose);
      totalScore += poseScore * 0.3;
      totalWeight += 0.3;
    }
    
    // Emotion matching
    if (pattern.indicators.emotion) {
      const emotionScore = this.matchEmotionIndicators(student.emotion, pattern.indicators.emotion);
      totalScore += emotionScore * 0.3;
      totalWeight += 0.3;
    }
    
    // Attention matching
    if (pattern.indicators.attention) {
      const attentionScore = this.matchAttentionIndicators(student.attention, pattern.indicators.attention);
      totalScore += attentionScore * 0.4;
      totalWeight += 0.4;
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Match pose indicators
   */
  private matchPoseIndicators(pose: any, indicators: any): number {
    let score = 0;
    let count = 0;
    
    if (indicators.pitch) {
      const [min, max] = indicators.pitch;
      score += pose.pitch >= min && pose.pitch <= max ? 1 : 0;
      count++;
    }
    
    if (indicators.yaw) {
      const [min, max] = indicators.yaw;
      score += pose.yaw >= min && pose.yaw <= max ? 1 : 0;
      count++;
    }
    
    if (indicators.roll) {
      const [min, max] = indicators.roll;
      score += pose.roll >= min && pose.roll <= max ? 1 : 0;
      count++;
    }
    
    return count > 0 ? score / count : 0;
  }

  /**
   * Match emotion indicators
   */
  private matchEmotionIndicators(emotion: any, indicators: any): number {
    let score = 0;
    let count = 0;
    
    if (indicators.primary) {
      score += indicators.primary.includes(emotion.primaryEmotion) ? 1 : 0;
      count++;
    }
    
    if (indicators.valence) {
      const [min, max] = indicators.valence;
      score += emotion.valence >= min && emotion.valence <= max ? 1 : 0;
      count++;
    }
    
    if (indicators.arousal) {
      const [min, max] = indicators.arousal;
      score += emotion.arousal >= min && emotion.arousal <= max ? 1 : 0;
      count++;
    }
    
    return count > 0 ? score / count : 0;
  }

  /**
   * Match attention indicators
   */
  private matchAttentionIndicators(attention: any, indicators: any): number {
    let score = 0;
    let count = 0;
    
    if (indicators.targets) {
      score += indicators.targets.includes(attention.target) ? 1 : 0;
      count++;
    }
    
    if (indicators.stability) {
      const [min, max] = indicators.stability;
      score += attention.gazeStability >= min && attention.gazeStability <= max ? 1 : 0;
      count++;
    }
    
    return count > 0 ? score / count : 0;
  }

  /**
   * Analyze temporal consistency of behavior
   */
  private analyzeTemporalConsistency(
    studentId: string, 
    currentMatches: Array<{ pattern: BehaviorPattern; confidence: number }>
  ): number {
    const history = this.behaviorHistory.get(studentId) || [];
    
    if (history.length < 3) {
      return 0.5; // Neutral consistency for new students
    }
    
    const recentHistory = history.slice(-5); // Last 5 behavior observations
    const currentBehavior = currentMatches[0]?.pattern.name;
    
    if (!currentBehavior) return 0;
    
    // Calculate consistency as percentage of recent history matching current behavior
    const consistentCount = recentHistory.filter(h => h.behavior === currentBehavior).length;
    return consistentCount / recentHistory.length;
  }

  /**
   * Predict likely behavior transitions
   */
  private predictBehaviorTransitions(
    studentId: string,
    currentMatches: Array<{ pattern: BehaviorPattern; confidence: number }>
  ): Array<{ behavior: string; probability: number; timeframe: number }> {
    const currentBehavior = currentMatches[0]?.pattern.name;
    if (!currentBehavior) return [];
    
    const possibleTransitions = BEHAVIOR_TRANSITIONS.filter(t => t.from === currentBehavior);
    
    return possibleTransitions
      .map(t => ({
        behavior: t.to,
        probability: t.probability,
        timeframe: t.duration
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }

  /**
   * Calculate contextual engagement considering classroom context
   */
  private calculateContextualEngagement(
    student: StudentState,
    patternMatches: Array<{ pattern: BehaviorPattern; confidence: number }>,
    classroomState: ClassroomState
  ): number {
    const baseEngagement = student.engagement.score;
    const primaryPattern = patternMatches[0];
    
    if (!primaryPattern) return baseEngagement;
    
    // Apply pattern-based adjustment
    const patternAdjustment = primaryPattern.pattern.engagementImpact * 20; // Scale to 0-100
    
    // Apply contextual adjustments
    let contextualAdjustment = 0;
    
    // Peer influence (if most students are engaged, boost individual scores)
    if (classroomState.averageEngagement > 70) {
      contextualAdjustment += 5;
    } else if (classroomState.averageEngagement < 40) {
      contextualAdjustment -= 5;
    }
    
    // Temporal consistency bonus
    const history = this.behaviorHistory.get(student.id.id) || [];
    if (history.length > 0) {
      const recentConsistency = this.analyzeTemporalConsistency(student.id.id, patternMatches);
      if (recentConsistency > 0.7 && primaryPattern.pattern.engagementImpact > 0) {
        contextualAdjustment += 10; // Bonus for consistent positive engagement
      }
    }
    
    const adjustedScore = Math.max(0, Math.min(100, 
      baseEngagement + patternAdjustment + contextualAdjustment
    ));
    
    return adjustedScore;
  }

  /**
   * Generate intervention recommendations
   */
  private generateInterventions(
    primaryMatch: { pattern: BehaviorPattern; confidence: number } | undefined,
    student: StudentState
  ): string[] {
    if (!primaryMatch) return [];
    
    const interventions: string[] = [];
    const pattern = primaryMatch.pattern;
    
    switch (pattern.name) {
      case 'disengaged':
        interventions.push('Direct teacher attention or question');
        interventions.push('Peer partner assignment');
        interventions.push('Movement or hands-on activity');
        break;
        
      case 'distracted':
        interventions.push('Gentle redirection');
        interventions.push('Check for understanding');
        interventions.push('Proximity intervention');
        break;
        
      case 'cognitive_load':
        interventions.push('Provide additional scaffolding');
        interventions.push('Break down complex concepts');
        interventions.push('Check for prerequisite knowledge');
        break;
        
      case 'technology_use':
        interventions.push('Device management protocol');
        interventions.push('Clear expectations reminder');
        interventions.push('Alternative engagement strategy');
        break;
        
      case 'off_task_talking':
        interventions.push('Redirect to academic discussion');
        interventions.push('Structured peer interaction');
        interventions.push('Individual check-in');
        break;
        
      default:
        if (pattern.engagementImpact > 0.5) {
          interventions.push('Maintain current engagement');
          interventions.push('Provide extension activities');
        }
    }
    
    return interventions;
  }

  /**
   * Update behavior history for temporal analysis
   */
  private updateBehaviorHistory(
    studentId: string,
    patternMatches: Array<{ pattern: BehaviorPattern; confidence: number }>
  ): void {
    if (!this.behaviorHistory.has(studentId)) {
      this.behaviorHistory.set(studentId, []);
    }
    
    const history = this.behaviorHistory.get(studentId)!;
    const primaryMatch = patternMatches[0];
    
    if (primaryMatch) {
      history.push({
        behavior: primaryMatch.pattern.name,
        timestamp: Date.now(),
        confidence: primaryMatch.confidence
      });
      
      // Keep only last 60 seconds of history (assuming 1 update per second)
      const maxHistorySize = 60;
      if (history.length > maxHistorySize) {
        history.splice(0, history.length - maxHistorySize);
      }
    }
  }

  /**
   * Reset engine state
   */
  public reset(): void {
    this.behaviorHistory.clear();
    this.transitionHistory.clear();
    this.contextHistory = [];
  }
}

export interface BehaviorAnalysis {
  studentId: string;
  currentBehavior: { pattern: BehaviorPattern; confidence: number };
  alternativeBehaviors: Array<{ pattern: BehaviorPattern; confidence: number }>;
  temporalConsistency: number;
  transitionPredictions: Array<{ behavior: string; probability: number; timeframe: number }>;
  contextualEngagement: number;
  recommendedInterventions: string[];
}

// Export singleton instance
export const temporalBehaviorEngine = new TemporalBehaviorEngine();