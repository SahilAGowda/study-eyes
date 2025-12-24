/**
 * TemporalAnalyzer Service
 * 
 * Maintains rolling 60-second engagement history and detects rapid engagement drops
 * for Classroom Mode alerts. Provides timeline data for visualization components.
 */

import { BehaviorClass, EngagementDataPoint } from '../types';

export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType = 'engagement_drop' | 'suspicious_activity' | 'no_face_detected';

export interface AlertEvent {
  timestamp: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metadata: Record<string, any>;
}

export interface TimelineDataPoint {
  timestamp: number;
  score: number;
  behavior: BehaviorClass;
  level: string;
}

export interface TemporalAnalyzerConfig {
  rollingWindowSeconds?: number; // Duration of rolling window (default: 60)
  alertDropThreshold?: number; // Percentage drop to trigger alert (default: 30)
  alertTimeWindowSeconds?: number; // Time window for drop detection (default: 10)
  minDataPointsForAlert?: number; // Minimum data points needed to detect alerts (default: 3)
}

/**
 * TemporalAnalyzer maintains a rolling window of engagement data and detects
 * significant engagement drops for alerting purposes.
 */
export class TemporalAnalyzer {
  private config: Required<TemporalAnalyzerConfig>;
  private dataPoints: EngagementDataPoint[];
  private alerts: AlertEvent[];

  constructor(config: TemporalAnalyzerConfig = {}) {
    this.config = {
      rollingWindowSeconds: config.rollingWindowSeconds ?? 60,
      alertDropThreshold: config.alertDropThreshold ?? 30,
      alertTimeWindowSeconds: config.alertTimeWindowSeconds ?? 10,
      minDataPointsForAlert: config.minDataPointsForAlert ?? 3,
    };

    this.dataPoints = [];
    this.alerts = [];
  }

  /**
   * Add a new engagement data point to the timeline
   * Automatically removes data older than the rolling window
   * @param dataPoint - Engagement data point to add
   */
  public addDataPoint(dataPoint: EngagementDataPoint): void {
    const now = Date.now();
    
    // Add new data point
    this.dataPoints.push(dataPoint);

    // Remove data older than rolling window
    this.cleanupOldData(now);

    // Check for rapid engagement drops
    const alert = this.detectRapidEngagementDrop(now);
    if (alert) {
      this.alerts.push(alert);
    }
  }

  /**
   * Add engagement score and behavior data
   * Convenience method that creates a data point from individual values
   * @param score - Engagement score (0-100)
   * @param behavior - Behavior classification
   * @param level - Engagement level
   */
  public addScore(score: number, behavior: BehaviorClass, level: string): void {
    const dataPoint: EngagementDataPoint = {
      timestamp: Date.now(),
      score,
      level: level as any,
      contributingBehavior: behavior,
    };
    this.addDataPoint(dataPoint);
  }

  /**
   * Get the complete timeline data for visualization
   * @returns Array of timeline data points
   */
  public getTimeline(): TimelineDataPoint[] {
    return this.dataPoints.map(point => ({
      timestamp: point.timestamp,
      score: point.score,
      behavior: point.contributingBehavior,
      level: point.level,
    }));
  }

  /**
   * Get timeline data for a specific duration
   * @param durationSeconds - Duration in seconds
   * @returns Array of timeline data points within the duration
   */
  public getTimelineForDuration(durationSeconds: number): TimelineDataPoint[] {
    const now = Date.now();
    const cutoffTime = now - (durationSeconds * 1000);
    
    return this.dataPoints
      .filter(point => point.timestamp >= cutoffTime)
      .map(point => ({
        timestamp: point.timestamp,
        score: point.score,
        behavior: point.contributingBehavior,
        level: point.level,
      }));
  }

  /**
   * Get all engagement data points
   * @returns Array of engagement data points
   */
  public getDataPoints(): EngagementDataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * Get recent alerts
   * @param durationSeconds - Optional duration to filter alerts (default: all)
   * @returns Array of alert events
   */
  public getAlerts(durationSeconds?: number): AlertEvent[] {
    if (durationSeconds === undefined) {
      return [...this.alerts];
    }

    const now = Date.now();
    const cutoffTime = now - (durationSeconds * 1000);
    
    return this.alerts.filter(alert => alert.timestamp >= cutoffTime);
  }

  /**
   * Detect rapid engagement drops for Classroom Mode alerts
   * Checks if engagement has dropped by 30% or more in the last 10 seconds
   * @param currentTime - Current timestamp in milliseconds
   * @returns Alert event if drop detected, null otherwise
   */
  public detectAlert(): AlertEvent | null {
    return this.detectRapidEngagementDrop(Date.now());
  }

  /**
   * Clear all data and alerts
   */
  public reset(): void {
    this.dataPoints = [];
    this.alerts = [];
  }

  /**
   * Get statistics about the timeline
   * @returns Timeline statistics
   */
  public getStatistics(): {
    dataPointCount: number;
    timeSpanSeconds: number;
    averageScore: number;
    alertCount: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
  } {
    if (this.dataPoints.length === 0) {
      return {
        dataPointCount: 0,
        timeSpanSeconds: 0,
        averageScore: 0,
        alertCount: this.alerts.length,
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    }

    const scores = this.dataPoints.map(p => p.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const oldestTimestamp = this.dataPoints[0].timestamp;
    const newestTimestamp = this.dataPoints[this.dataPoints.length - 1].timestamp;
    const timeSpanSeconds = (newestTimestamp - oldestTimestamp) / 1000;

    return {
      dataPointCount: this.dataPoints.length,
      timeSpanSeconds: Math.round(timeSpanSeconds * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      alertCount: this.alerts.length,
      oldestTimestamp,
      newestTimestamp,
    };
  }

  /**
   * Remove data points older than the rolling window
   * @param currentTime - Current timestamp in milliseconds
   */
  private cleanupOldData(currentTime: number): void {
    const cutoffTime = currentTime - (this.config.rollingWindowSeconds * 1000);
    
    this.dataPoints = this.dataPoints.filter(
      point => point.timestamp >= cutoffTime
    );

    // Also cleanup old alerts (keep last 5 minutes)
    const alertCutoffTime = currentTime - (5 * 60 * 1000);
    this.alerts = this.alerts.filter(
      alert => alert.timestamp >= alertCutoffTime
    );
  }

  /**
   * Detect rapid engagement drops (30% decrease in 10 seconds)
   * @param currentTime - Current timestamp in milliseconds
   * @returns Alert event if drop detected, null otherwise
   */
  private detectRapidEngagementDrop(currentTime: number): AlertEvent | null {
    // Need minimum data points to detect a drop
    if (this.dataPoints.length < this.config.minDataPointsForAlert) {
      return null;
    }

    const alertWindowMs = this.config.alertTimeWindowSeconds * 1000;
    const windowStartTime = currentTime - alertWindowMs;

    // Get data points within the alert time window
    const recentPoints = this.dataPoints.filter(
      point => point.timestamp >= windowStartTime
    );

    if (recentPoints.length < 2) {
      return null;
    }

    // Get the earliest and latest scores in the window
    const earliestScore = recentPoints[0].score;
    const latestScore = recentPoints[recentPoints.length - 1].score;

    // Calculate percentage drop
    const scoreDrop = earliestScore - latestScore;
    const percentageDrop = (scoreDrop / earliestScore) * 100;

    // Check if drop exceeds threshold
    if (percentageDrop >= this.config.alertDropThreshold) {
      // Check if we already have a recent alert (avoid duplicate alerts)
      const recentAlerts = this.alerts.filter(
        alert => alert.timestamp >= currentTime - (15 * 1000) // Last 15 seconds
      );

      if (recentAlerts.length > 0) {
        return null; // Don't create duplicate alert
      }

      // Determine severity based on drop magnitude
      let severity: AlertSeverity;
      if (percentageDrop >= 50) {
        severity = 'high';
      } else if (percentageDrop >= 40) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      return {
        timestamp: currentTime,
        type: 'engagement_drop',
        severity,
        message: `Engagement dropped by ${Math.round(percentageDrop)}% in ${this.config.alertTimeWindowSeconds} seconds`,
        metadata: {
          percentageDrop: Math.round(percentageDrop * 10) / 10,
          scoreDrop: Math.round(scoreDrop * 10) / 10,
          previousScore: Math.round(earliestScore * 10) / 10,
          currentScore: Math.round(latestScore * 10) / 10,
          timeWindowSeconds: this.config.alertTimeWindowSeconds,
        },
      };
    }

    return null;
  }

  /**
   * Generate alert for suspicious activity
   * @param behavior - Behavior that triggered the alert
   * @param message - Alert message
   * @returns Alert event
   */
  public generateSuspiciousActivityAlert(
    behavior: BehaviorClass,
    message: string
  ): AlertEvent {
    const alert: AlertEvent = {
      timestamp: Date.now(),
      type: 'suspicious_activity',
      severity: 'medium',
      message,
      metadata: {
        behavior,
      },
    };

    this.alerts.push(alert);
    return alert;
  }

  /**
   * Generate alert for no face detected
   * @param durationSeconds - Duration of no face detection
   * @returns Alert event
   */
  public generateNoFaceAlert(durationSeconds: number): AlertEvent {
    const alert: AlertEvent = {
      timestamp: Date.now(),
      type: 'no_face_detected',
      severity: durationSeconds > 30 ? 'high' : 'medium',
      message: `No face detected for ${durationSeconds} seconds`,
      metadata: {
        durationSeconds,
      },
    };

    this.alerts.push(alert);
    return alert;
  }
}

/**
 * Create a singleton instance for global use
 */
let temporalAnalyzerInstance: TemporalAnalyzer | null = null;

export function getTemporalAnalyzer(config?: TemporalAnalyzerConfig): TemporalAnalyzer {
  if (!temporalAnalyzerInstance) {
    temporalAnalyzerInstance = new TemporalAnalyzer(config);
  }
  return temporalAnalyzerInstance;
}

export function resetTemporalAnalyzer(): void {
  if (temporalAnalyzerInstance) {
    temporalAnalyzerInstance.reset();
  }
}
