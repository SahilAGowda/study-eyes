import { saveSessionReport } from './sessionStorage';

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
  
  // Debug flag
  private debugMode: boolean = true;

  /**
   * Start tracking a new session
   */
  public startSession(): void {
    if (this.isTracking) {
      console.log('📊 [SessionTracker] Session already active, ending previous session first');
      this.endSession();
    }

    const now = Date.now();
    this.isTracking = true;
    this.sessionStartTime = now;
    this.lastUpdateTime = now;
    this.behaviorStartTime = now;
    
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
    // Start as NOT focused (no face detected initially)
    this.isFocused = false;
    this.isNoteTaking = false;

    this.addEvent({
      timestamp: now,
      type: 'session_start',
      details: 'Session started',
    });

    console.log(`📊 [SessionTracker] Session started at ${new Date(now).toLocaleTimeString()}, sessionStartTime=${now}`);
  }

  /**
   * End the current session
   */
  public endSession(): SessionReport | null {
    if (!this.isTracking) {
      console.log('📊 [SessionTracker] No active session to end');
      return null;
    }

    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    
    console.log(`📊 [SessionTracker] Ending session. Duration: ${sessionDuration}ms, startTime: ${this.sessionStartTime}, now: ${now}`);
    
    // Finalize current behavior time
    this.finalizeBehaviorTime();
    
    // Add final time delta since last update
    const finalTimeDelta = now - this.lastUpdateTime;
    if (finalTimeDelta > 0) {
      if (this.isFocused) {
        this.totalFocusedTime += finalTimeDelta;
      } else {
        this.totalDistractedTime += finalTimeDelta;
      }
      console.log(`📊 [SessionTracker] Final delta: ${finalTimeDelta}ms (focused: ${this.isFocused})`);
    }

    // Add session end event BEFORE setting isTracking to false
    this.addEvent({
      timestamp: now,
      type: 'session_end',
      details: 'Session ended',
    });
    
    console.log(`📊 [SessionTracker] Before report - totalFocusedTime: ${this.totalFocusedTime}ms, totalDistractedTime: ${this.totalDistractedTime}ms`);

    // Generate report BEFORE setting isTracking to false so getMetrics works correctly
    const report = this.generateReport();
    
    // Now set isTracking to false
    this.isTracking = false;
    
    console.log(`📊 [SessionTracker] Final metrics - Duration: ${report.metrics.sessionDuration}ms, Focus: ${report.metrics.focusPercentage}%, FocusTime: ${report.metrics.totalFocusedTime}ms, DistractedTime: ${report.metrics.totalDistractedTime}ms`);
    
    // Save report to localStorage for Reports page
    try {
      saveSessionReport(report);
      console.log('📊 [SessionTracker] Report saved to storage');
    } catch (error) {
      console.error('[SessionTracker] Failed to save session report:', error);
    }
    
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

    // Determine if this behavior counts as focused
    const focusedBehaviors = [
      'focused_on_screen', 
      'active_listening', 
      'passive_listening',
      'cognitive_load',
      'note_taking'
    ];
    const isBehaviorFocused = focusedBehaviors.includes(behavior) || isNoteTakingMode;

    // Accumulate time based on PREVIOUS state (before this update)
    if (this.isFocused) {
      this.totalFocusedTime += timeDelta;
    } else {
      this.totalDistractedTime += timeDelta;
    }

    // Debug logging
    if (this.debugMode && timeDelta > 0) {
      console.log(`[SessionTracker] behavior=${behavior}, focused=${isBehaviorFocused}, delta=${timeDelta}ms, totalFocus=${this.totalFocusedTime}ms, totalDistracted=${this.totalDistractedTime}ms`);
    }

    // Handle behavior change
    if (behavior !== this.currentBehavior) {
      this.finalizeBehaviorTime();
      
      this.addEvent({
        timestamp: now,
        type: 'behavior_change',
        behavior: behavior,
        details: `Changed from ${this.currentBehavior} to ${behavior}`,
      });

      // Track distraction transition
      const wasFocused = this.isFocused;

      if (wasFocused && !isBehaviorFocused) {
        this.distractionCount++;
        
        this.addEvent({
          timestamp: now,
          type: 'distraction',
          details: `Distraction: ${behavior}`,
          behavior: behavior,
        });
      } else if (!wasFocused && isBehaviorFocused) {
        this.addEvent({
          timestamp: now,
          type: 'focus_start',
          details: 'Focus regained',
        });
      }

      this.currentBehavior = behavior;
      this.behaviorStartTime = now;
    }

    // Update focused state for next iteration
    this.isFocused = isBehaviorFocused;

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
    
    // Calculate session duration
    let sessionDuration = 0;
    if (this.isTracking && this.sessionStartTime > 0) {
      // Session is active
      sessionDuration = now - this.sessionStartTime;
    } else if (this.sessionStartTime > 0) {
      // Session ended - calculate from events or accumulated time
      const sessionEndEvent = this.events.find(e => e.type === 'session_end');
      if (sessionEndEvent) {
        sessionDuration = sessionEndEvent.timestamp - this.sessionStartTime;
      } else {
        // Fallback to accumulated time
        sessionDuration = this.totalFocusedTime + this.totalDistractedTime;
      }
    }
    
    // Calculate current focus time (add time since last update if tracking)
    let currentFocusTime = this.totalFocusedTime;
    let currentDistractedTime = this.totalDistractedTime;
    
    if (this.isTracking && this.lastUpdateTime > 0) {
      const timeSinceLastUpdate = now - this.lastUpdateTime;
      if (this.isFocused) {
        currentFocusTime += timeSinceLastUpdate;
      } else {
        currentDistractedTime += timeSinceLastUpdate;
      }
    }

    // Calculate focus percentage based on actual tracked time
    const totalTrackedTime = currentFocusTime + currentDistractedTime;
    const focusPercentage = totalTrackedTime > 0 
      ? Math.round((currentFocusTime / totalTrackedTime) * 100) 
      : 0;

    // Calculate average engagement
    const engagementScore = this.engagementSamples.length > 0
      ? Math.round(this.engagementSamples.reduce((a, b) => a + b, 0) / this.engagementSamples.length)
      : 0;

    // Build behavior breakdown - include all behavior types
    const behaviorBreakdown = {
      focused_on_screen: (this.behaviorTimes.get('focused_on_screen') || 0) + 
                         (this.behaviorTimes.get('active_listening') || 0) +
                         (this.behaviorTimes.get('passive_listening') || 0) +
                         (this.behaviorTimes.get('cognitive_load') || 0),
      looking_away: (this.behaviorTimes.get('looking_away') || 0) +
                    (this.behaviorTimes.get('distracted') || 0) +
                    (this.behaviorTimes.get('off_task_talking') || 0),
      note_taking: this.behaviorTimes.get('note_taking') || 0,
      no_face_detected: this.behaviorTimes.get('no_face_detected') || 0,
      phone_detected: (this.behaviorTimes.get('phone_detected') || 0) +
                      (this.behaviorTimes.get('technology_use') || 0),
      speaking: (this.behaviorTimes.get('speaking') || 0) +
                (this.behaviorTimes.get('peer_discussion') || 0),
    };
    
    // Use the larger of sessionDuration or totalTrackedTime
    const finalDuration = Math.max(sessionDuration, totalTrackedTime);

    return {
      sessionStartTime: this.sessionStartTime,
      sessionDuration: finalDuration,
      totalFocusedTime: currentFocusTime,
      totalDistractedTime: currentDistractedTime,
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
    // Calculate duration from events if available
    const sessionEndEvent = this.events.find(e => e.type === 'session_end');
    const sessionStartEvent = this.events.find(e => e.type === 'session_start');
    
    let calculatedDuration = 0;
    if (sessionEndEvent && sessionStartEvent) {
      calculatedDuration = sessionEndEvent.timestamp - sessionStartEvent.timestamp;
    } else if (this.sessionStartTime > 0) {
      calculatedDuration = Date.now() - this.sessionStartTime;
    }
    
    console.log(`📊 [SessionTracker] generateReport - sessionStartTime: ${this.sessionStartTime}, calculatedDuration: ${calculatedDuration}ms`);
    console.log(`📊 [SessionTracker] generateReport - totalFocusedTime: ${this.totalFocusedTime}ms, totalDistractedTime: ${this.totalDistractedTime}ms`);
    
    const metrics = this.getMetrics();
    
    // Override duration if calculated is better
    if (calculatedDuration > 0 && metrics.sessionDuration === 0) {
      metrics.sessionDuration = calculatedDuration;
      // Recalculate focus percentage
      const totalTime = this.totalFocusedTime + this.totalDistractedTime;
      metrics.focusPercentage = totalTime > 0 
        ? Math.round((this.totalFocusedTime / totalTime) * 100)
        : 0;
    }
    
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
