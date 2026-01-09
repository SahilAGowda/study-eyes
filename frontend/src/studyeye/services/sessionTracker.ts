/**
 * SessionTracker Service
 * 
 * Tracks real session analytics including focus time, distractions,
 * note-taking moments, and generates session reports.
 */

export interface SessionMetrics {
  // Time metrics
  sessionStartTime: number;
  sessionDuration: number; // ms
  totalFocusedTime: number; // ms
  totalDistractedTime: number; // ms
  totalNoteTakingTime: number; // ms
  
  // Counts
  distractionCount: number;
  noteTakingCount: number;
  keywordsDetectedCount: number;
  unauthorizedSpeakerCount: number;
  
  // Percentages
  focusPercentage: number;
  engagementScore: number;
  
  // Behavior breakdown
  behaviorBreakdown: {
    focused_on_screen: number;
    looking_away: number;
    note_taking: number;
    no_face_detected: number;
    phone_detected: number;
    speaking: number;
  };
  
  // Timeline events
  events: SessionEvent[];
}

export interface SessionEvent {
  timestamp: number;
  type: 'focus_start' | 'focus_end' | 'distraction' | 'note_taking_start' | 'note_taking_end' | 
        'keyword_detected' | 'unauthorized_speaker' | 'session_start' | 'session_end' |
        'behavior_change' | 'engagement_drop';
  details?: string;
  behavior?: string;
  duration?: number;
}

export interface SessionReport {
  metrics: SessionMetrics;
  summary: {
    overallRating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    focusScore: number;
    recommendations: string[];
  };
  timeline: SessionEvent[];
}

export class SessionTracker {
  private isTracking: boolean = false;
  private sessionStartTime: number = 0;
  private lastUpdateTime: number = 0;
  
  // Current state
  private currentBehavior: string = 'no_face_detected';
  private isFocused: boolean = false;
  private isNoteTaking: boolean = false;
  private focusStartTime: number = 0;
  
  // Accumulated metrics
  private totalFocusedTime: number = 0;
  private totalDistractedTime: number = 0;
  private totalNoteTakingTime: number = 0;
  private distractionCount: number = 0;
  private noteTakingCount: number = 0;
  private keywordsDetectedCount: number = 0;
  private unauthorizedSpeakerCount: number = 0;
  
  // Behavior time tracking
  private behaviorTimes: Map<string, number> = new Map();
  private behaviorStartTime: number = 0;
  
  // Events timeline
  private events: SessionEvent[] = [];
  
  // Engagement tracking
  private engagementSamples: number[] = [];
  private readonly MAX_ENGAGEMENT_SAMPLES = 1000;

  /**
   * Start tracking a new session
   */
  public startSession(): void {
    if (this.isTracking) {
      this.endSession();
    }

    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = this.sessionStartTime;
    this.behaviorStartTime = this.sessionStartTime;
    
    // Reset all metrics
    this.totalFocusedTime = 0;
    this.totalDistractedTime = 0;
    this.totalNoteTakingTime = 0;
    this.distractionCount = 0;
    this.noteTakingCount = 0;
    this.keywordsDetectedCount = 0;
    this.unauthorizedSpeakerCount = 0;
    this.behaviorTimes.clear();
    this.events = [];
    this.engagementSamples = [];
    this.currentBehavior = 'no_face_detected';
    this.isFocused = false;
    this.isNoteTaking = false;

    this.addEvent({
      timestamp: this.sessionStartTime,
      type: 'session_start',
      details: 'Session started',
    });

    console.log('📊 Session tracking started');
  }

  /**
   * End the current session
   */
  public endSession(): SessionReport | null {
    if (!this.isTracking) return null;

    // Finalize current behavior time
    this.finalizeBehaviorTime();
    
    // Finalize focus time if currently focused
    if (this.isFocused) {
      this.totalFocusedTime += Date.now() - this.focusStartTime;
    }

    this.addEvent({
      timestamp: Date.now(),
      type: 'session_end',
      details: 'Session ended',
    });

    this.isTracking = false;
    
    const report = this.generateReport();
    console.log('📊 Session tracking ended', report.summary);
    
    return report;
  }

  /**
   * Update with current behavior state
   */
  public updateBehavior(behavior: string, isNoteTakingMode: boolean = false): void {
    if (!this.isTracking) return;

    const now = Date.now();
    const timeDelta = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // Handle behavior change
    if (behavior !== this.currentBehavior) {
      this.finalizeBehaviorTime();
      
      this.addEvent({
        timestamp: now,
        type: 'behavior_change',
        behavior: behavior,
        details: `Changed from ${this.currentBehavior} to ${behavior}`,
      });

      // Track distraction
      const wasFocused = this.isFocused;
      this.isFocused = behavior === 'focused_on_screen' || 
                       (isNoteTakingMode && behavior === 'note_taking');

      if (wasFocused && !this.isFocused && !isNoteTakingMode) {
        this.distractionCount++;
        this.totalFocusedTime += now - this.focusStartTime;
        
        this.addEvent({
          timestamp: now,
          type: 'distraction',
          details: `Distraction: ${behavior}`,
          behavior: behavior,
        });
      } else if (!wasFocused && this.isFocused) {
        this.focusStartTime = now;
        
        this.addEvent({
          timestamp: now,
          type: 'focus_start',
          details: 'Focus regained',
        });
      }

      this.currentBehavior = behavior;
      this.behaviorStartTime = now;
    }

    // Handle note-taking mode
    if (isNoteTakingMode && !this.isNoteTaking) {
      this.isNoteTaking = true;
      this.noteTakingCount++;
      
      this.addEvent({
        timestamp: now,
        type: 'note_taking_start',
        details: 'Note-taking mode activated',
      });
    } else if (!isNoteTakingMode && this.isNoteTaking) {
      this.isNoteTaking = false;
      
      this.addEvent({
        timestamp: now,
        type: 'note_taking_end',
        details: 'Note-taking mode ended',
      });
    }

    // Track note-taking time
    if (isNoteTakingMode) {
      this.totalNoteTakingTime += timeDelta;
    }

    // Track distracted time
    if (!this.isFocused && !isNoteTakingMode) {
      this.totalDistractedTime += timeDelta;
    }
  }

  /**
   * Record engagement score sample
   */
  public recordEngagement(score: number): void {
    if (!this.isTracking) return;

    this.engagementSamples.push(score);
    
    // Keep only recent samples
    if (this.engagementSamples.length > this.MAX_ENGAGEMENT_SAMPLES) {
      this.engagementSamples.shift();
    }

    // Detect engagement drops
    if (this.engagementSamples.length >= 10) {
      const recentAvg = this.engagementSamples.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const previousAvg = this.engagementSamples.slice(-20, -10).reduce((a, b) => a + b, 0) / 
                          Math.min(10, this.engagementSamples.length - 10);
      
      if (previousAvg - recentAvg > 20) {
        this.addEvent({
          timestamp: Date.now(),
          type: 'engagement_drop',
          details: `Engagement dropped from ${previousAvg.toFixed(0)}% to ${recentAvg.toFixed(0)}%`,
        });
      }
    }
  }

  /**
   * Record keyword detection
   */
  public recordKeywordDetected(keyword: string): void {
    if (!this.isTracking) return;

    this.keywordsDetectedCount++;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'keyword_detected',
      details: `Keyword detected: "${keyword}"`,
    });
  }

  /**
   * Record unauthorized speaker
   */
  public recordUnauthorizedSpeaker(): void {
    if (!this.isTracking) return;

    this.unauthorizedSpeakerCount++;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'unauthorized_speaker',
      details: 'Unauthorized speaker detected',
    });
  }

  /**
   * Finalize time for current behavior
   */
  private finalizeBehaviorTime(): void {
    const now = Date.now();
    const duration = now - this.behaviorStartTime;
    
    const currentTime = this.behaviorTimes.get(this.currentBehavior) || 0;
    this.behaviorTimes.set(this.currentBehavior, currentTime + duration);
  }

  /**
   * Add event to timeline
   */
  private addEvent(event: SessionEvent): void {
    this.events.push(event);
  }

  /**
   * Get current session metrics
   */
  public getMetrics(): SessionMetrics {
    const now = Date.now();
    const sessionDuration = this.isTracking ? now - this.sessionStartTime : 0;
    
    // Calculate current focus time
    let currentFocusTime = this.totalFocusedTime;
    if (this.isFocused && this.isTracking) {
      currentFocusTime += now - this.focusStartTime;
    }

    // Calculate focus percentage
    const focusPercentage = sessionDuration > 0 
      ? Math.round((currentFocusTime / sessionDuration) * 100) 
      : 0;

    // Calculate average engagement
    const engagementScore = this.engagementSamples.length > 0
      ? Math.round(this.engagementSamples.reduce((a, b) => a + b, 0) / this.engagementSamples.length)
      : 0;

    // Build behavior breakdown
    const behaviorBreakdown = {
      focused_on_screen: this.behaviorTimes.get('focused_on_screen') || 0,
      looking_away: this.behaviorTimes.get('looking_away') || 0,
      note_taking: this.behaviorTimes.get('note_taking') || 0,
      no_face_detected: this.behaviorTimes.get('no_face_detected') || 0,
      phone_detected: this.behaviorTimes.get('phone_detected') || 0,
      speaking: this.behaviorTimes.get('speaking') || 0,
    };

    return {
      sessionStartTime: this.sessionStartTime,
      sessionDuration,
      totalFocusedTime: currentFocusTime,
      totalDistractedTime: this.totalDistractedTime,
      totalNoteTakingTime: this.totalNoteTakingTime,
      distractionCount: this.distractionCount,
      noteTakingCount: this.noteTakingCount,
      keywordsDetectedCount: this.keywordsDetectedCount,
      unauthorizedSpeakerCount: this.unauthorizedSpeakerCount,
      focusPercentage,
      engagementScore,
      behaviorBreakdown,
      events: [...this.events],
    };
  }

  /**
   * Generate session report
   */
  public generateReport(): SessionReport {
    const metrics = this.getMetrics();
    
    // Calculate focus score (weighted)
    const focusScore = Math.round(
      metrics.focusPercentage * 0.6 +
      metrics.engagementScore * 0.3 +
      Math.max(0, 100 - metrics.distractionCount * 5) * 0.1
    );

    // Determine overall rating
    let overallRating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    if (focusScore >= 85) {
      overallRating = 'excellent';
    } else if (focusScore >= 70) {
      overallRating = 'good';
    } else if (focusScore >= 50) {
      overallRating = 'fair';
    } else {
      overallRating = 'needs_improvement';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (metrics.focusPercentage < 70) {
      recommendations.push('Try to minimize distractions and stay focused on the screen');
    }
    if (metrics.distractionCount > 10) {
      recommendations.push('You had many distractions. Consider finding a quieter study environment');
    }
    if (metrics.unauthorizedSpeakerCount > 3) {
      recommendations.push('There was background noise/talking. Try to study in a quieter space');
    }
    if (metrics.noteTakingCount === 0 && metrics.keywordsDetectedCount > 0) {
      recommendations.push('Important points were mentioned but no note-taking was detected');
    }
    if (focusScore >= 85) {
      recommendations.push('Great job! Keep up the excellent focus');
    }

    return {
      metrics,
      summary: {
        overallRating,
        focusScore,
        recommendations,
      },
      timeline: metrics.events,
    };
  }

  /**
   * Check if currently tracking
   */
  public isSessionActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get session duration in seconds
   */
  public getSessionDurationSeconds(): number {
    if (!this.isTracking) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Reset tracker
   */
  public reset(): void {
    this.isTracking = false;
    this.sessionStartTime = 0;
    this.lastUpdateTime = 0;
    this.currentBehavior = 'no_face_detected';
    this.isFocused = false;
    this.isNoteTaking = false;
    this.focusStartTime = 0;
    this.totalFocusedTime = 0;
    this.totalDistractedTime = 0;
    this.totalNoteTakingTime = 0;
    this.distractionCount = 0;
    this.noteTakingCount = 0;
    this.keywordsDetectedCount = 0;
    this.unauthorizedSpeakerCount = 0;
    this.behaviorTimes.clear();
    this.events = [];
    this.engagementSamples = [];
  }
}

// Singleton instance
let sessionTrackerInstance: SessionTracker | null = null;

export function getSessionTracker(): SessionTracker {
  if (!sessionTrackerInstance) {
    sessionTrackerInstance = new SessionTracker();
  }
  return sessionTrackerInstance;
}

export default SessionTracker;
