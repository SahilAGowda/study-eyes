/**
 * ModeManager Service
 * 
 * Manages Classroom Mode vs Exam Mode behavior, including output formatting,
 * visual overlay control, and event logging for exam integrity monitoring.
 */

import { BehaviorClass, BehaviorResult, EngagementScore } from '../types';
import { AlertEvent } from './temporalAnalyzer';

export type OperationMode = 'classroom' | 'exam';

/**
 * Classroom Mode output format
 * Includes behavior label, engagement score, timestamp, and optional alert
 */
export interface ClassroomOutput {
  behavior_label: string;
  engagement_score: number;
  timestamp: number;
  event_alert?: string;
}

/**
 * Exam Mode output format
 * Includes event type, count, and timestamp for integrity monitoring
 */
export interface ExamOutput {
  event_type: string;
  count: number;
  timestamp: number;
}

/**
 * Exam event types that are tracked
 */
export type ExamEventType = 'looking_away' | 'speaking' | 'phone_detected';

/**
 * Event log entry for Exam Mode
 */
export interface ExamEventLog {
  eventType: ExamEventType;
  timestamp: number;
  confidence: number;
  metadata?: Record<string, any>;
}

/**
 * Mode-specific configuration
 */
export interface ModeConfig {
  visualOverlaysEnabled: boolean;
  eventLoggingEnabled: boolean;
  alertsEnabled: boolean;
}

/**
 * ModeManager handles the switching between Classroom and Exam modes,
 * formatting outputs appropriately, and managing event logs for exam integrity.
 */
export class ModeManager {
  private currentMode: OperationMode;
  private eventCounts: Map<ExamEventType, number>;
  private eventLog: ExamEventLog[];
  private sessionStartTime: number;

  constructor(initialMode: OperationMode = 'classroom') {
    this.currentMode = initialMode;
    this.eventCounts = new Map([
      ['looking_away', 0],
      ['speaking', 0],
      ['phone_detected', 0],
    ]);
    this.eventLog = [];
    this.sessionStartTime = Date.now();
  }

  /**
   * Set the current operation mode
   * @param mode - Operation mode to set
   */
  public setMode(mode: OperationMode): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Reset event counts when switching to Exam Mode
    if (mode === 'exam' && previousMode !== 'exam') {
      this.resetEventCounts();
    }

    console.log(`Mode switched from ${previousMode} to ${mode}`);
  }

  /**
   * Get the current operation mode
   * @returns Current operation mode
   */
  public getMode(): OperationMode {
    return this.currentMode;
  }

  /**
   * Check if currently in Classroom Mode
   * @returns True if in Classroom Mode
   */
  public isClassroomMode(): boolean {
    return this.currentMode === 'classroom';
  }

  /**
   * Check if currently in Exam Mode
   * @returns True if in Exam Mode
   */
  public isExamMode(): boolean {
    return this.currentMode === 'exam';
  }

  /**
   * Get mode-specific configuration
   * @returns Mode configuration object
   */
  public getModeConfig(): ModeConfig {
    if (this.currentMode === 'classroom') {
      return {
        visualOverlaysEnabled: true,
        eventLoggingEnabled: false,
        alertsEnabled: true,
      };
    } else {
      return {
        visualOverlaysEnabled: false,
        eventLoggingEnabled: true,
        alertsEnabled: false,
      };
    }
  }

  /**
   * Format output based on current mode
   * @param behaviorResult - Current behavior classification result
   * @param engagementScore - Current engagement score
   * @param alert - Optional alert event (for Classroom Mode)
   * @returns Formatted output for current mode
   */
  public formatOutput(
    behaviorResult: BehaviorResult,
    engagementScore: EngagementScore,
    alert?: AlertEvent | null
  ): ClassroomOutput | ExamOutput {
    if (this.currentMode === 'classroom') {
      return this.formatClassroomOutput(behaviorResult, engagementScore, alert);
    } else {
      return this.formatExamOutput(behaviorResult);
    }
  }

  /**
   * Format output for Classroom Mode
   * @param behaviorResult - Current behavior classification result
   * @param engagementScore - Current engagement score
   * @param alert - Optional alert event
   * @returns Classroom Mode output
   */
  private formatClassroomOutput(
    behaviorResult: BehaviorResult,
    engagementScore: EngagementScore,
    alert?: AlertEvent | null
  ): ClassroomOutput {
    const output: ClassroomOutput = {
      behavior_label: this.formatBehaviorLabel(behaviorResult.behaviorClass),
      engagement_score: Math.round(engagementScore.score * 10) / 10,
      timestamp: behaviorResult.timestamp,
    };

    // Add alert message if present
    if (alert) {
      output.event_alert = alert.message;
    }

    return output;
  }

  /**
   * Format output for Exam Mode
   * Returns the most recent event type and its count
   * @param behaviorResult - Current behavior classification result
   * @returns Exam Mode output
   */
  private formatExamOutput(behaviorResult: BehaviorResult): ExamOutput {
    // Log the event if it's a tracked exam event
    this.logExamEvent(behaviorResult);

    // Get the event type with the highest count
    let maxEventType: ExamEventType = 'looking_away';
    let maxCount = 0;

    this.eventCounts.forEach((count, eventType) => {
      if (count > maxCount) {
        maxCount = count;
        maxEventType = eventType;
      }
    });

    return {
      event_type: maxEventType,
      count: maxCount,
      timestamp: behaviorResult.timestamp,
    };
  }

  /**
   * Log an exam event if it's a tracked behavior
   * @param behaviorResult - Behavior classification result
   */
  private logExamEvent(behaviorResult: BehaviorResult): void {
    const eventType = this.mapBehaviorToExamEvent(behaviorResult.behaviorClass);
    
    if (eventType) {
      // Increment count
      const currentCount = this.eventCounts.get(eventType) || 0;
      this.eventCounts.set(eventType, currentCount + 1);

      // Add to event log
      const logEntry: ExamEventLog = {
        eventType,
        timestamp: behaviorResult.timestamp,
        confidence: behaviorResult.confidence,
      };

      this.eventLog.push(logEntry);

      console.log(`Exam event logged: ${eventType} (count: ${currentCount + 1})`);
    }
  }

  /**
   * Map behavior class to exam event type
   * @param behavior - Behavior classification
   * @returns Exam event type or null if not tracked
   */
  private mapBehaviorToExamEvent(behavior: BehaviorClass): ExamEventType | null {
    switch (behavior) {
      case 'looking_away':
        return 'looking_away';
      case 'speaking':
        return 'speaking';
      case 'phone_detected':
        return 'phone_detected';
      default:
        return null;
    }
  }

  /**
   * Format behavior class as human-readable label
   * @param behavior - Behavior classification
   * @returns Formatted label
   */
  private formatBehaviorLabel(behavior: BehaviorClass): string {
    switch (behavior) {
      case 'focused_on_screen':
        return 'Focused on Screen';
      case 'looking_away':
        return 'Looking Away / Distracted';
      case 'speaking':
        return 'Speaking Detected';
      case 'note_taking':
        return 'Note-taking / Writing';
      case 'no_face_detected':
        return 'No Face Detected';
      case 'phone_detected':
        return 'Phone / Unauthorized Object Detected';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get event counts for Exam Mode
   * @returns Map of event types to counts
   */
  public getEventCounts(): Map<ExamEventType, number> {
    return new Map(this.eventCounts);
  }

  /**
   * Get event count for a specific event type
   * @param eventType - Event type to query
   * @returns Count for the event type
   */
  public getEventCount(eventType: ExamEventType): number {
    return this.eventCounts.get(eventType) || 0;
  }

  /**
   * Get the complete event log for the session
   * @returns Array of exam event log entries
   */
  public getEventLog(): ExamEventLog[] {
    return [...this.eventLog];
  }

  /**
   * Get event log filtered by event type
   * @param eventType - Event type to filter by
   * @returns Filtered array of exam event log entries
   */
  public getEventLogByType(eventType: ExamEventType): ExamEventLog[] {
    return this.eventLog.filter(entry => entry.eventType === eventType);
  }

  /**
   * Get event log for a specific time range
   * @param startTime - Start timestamp in milliseconds
   * @param endTime - End timestamp in milliseconds (default: now)
   * @returns Filtered array of exam event log entries
   */
  public getEventLogByTimeRange(startTime: number, endTime: number = Date.now()): ExamEventLog[] {
    return this.eventLog.filter(
      entry => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Reset event counts and clear event log
   */
  public resetEventCounts(): void {
    this.eventCounts.set('looking_away', 0);
    this.eventCounts.set('speaking', 0);
    this.eventCounts.set('phone_detected', 0);
    this.eventLog = [];
    this.sessionStartTime = Date.now();
    console.log('Event counts and log reset');
  }

  /**
   * Get session statistics
   * @returns Session statistics object
   */
  public getSessionStatistics(): {
    mode: OperationMode;
    sessionDurationSeconds: number;
    totalEvents: number;
    eventCounts: Record<ExamEventType, number>;
    sessionStartTime: number;
  } {
    const now = Date.now();
    const durationSeconds = Math.round((now - this.sessionStartTime) / 1000);

    return {
      mode: this.currentMode,
      sessionDurationSeconds: durationSeconds,
      totalEvents: this.eventLog.length,
      eventCounts: {
        looking_away: this.eventCounts.get('looking_away') || 0,
        speaking: this.eventCounts.get('speaking') || 0,
        phone_detected: this.eventCounts.get('phone_detected') || 0,
      },
      sessionStartTime: this.sessionStartTime,
    };
  }

  /**
   * Export event log as JSON
   * @returns JSON string of event log
   */
  public exportEventLog(): string {
    const exportData = {
      mode: this.currentMode,
      sessionStartTime: this.sessionStartTime,
      sessionEndTime: Date.now(),
      eventCounts: Object.fromEntries(this.eventCounts),
      events: this.eventLog,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Reset the entire session
   * Clears all data and resets to initial state
   */
  public reset(): void {
    this.resetEventCounts();
    this.sessionStartTime = Date.now();
    console.log('ModeManager reset');
  }
}

/**
 * Create a singleton instance for global use
 */
let modeManagerInstance: ModeManager | null = null;

export function getModeManager(initialMode?: OperationMode): ModeManager {
  if (!modeManagerInstance) {
    modeManagerInstance = new ModeManager(initialMode);
  }
  return modeManagerInstance;
}

export function resetModeManager(): void {
  if (modeManagerInstance) {
    modeManagerInstance.reset();
  }
  modeManagerInstance = null;
}
