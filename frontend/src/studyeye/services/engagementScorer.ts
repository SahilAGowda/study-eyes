/**
 * EngagementScorer Service
 * 
 * Calculates continuous engagement scores based on temporal behavior patterns.
 * Uses exponential moving average for temporal smoothing and maintains a rolling
 * 60-second history of engagement data.
 */

import { BehaviorClass, BehaviorResult } from '../types';

export type EngagementLevel = 'high' | 'medium' | 'low' | 'disengaged';
export type EngagementTrend = 'increasing' | 'stable' | 'decreasing';

export interface EngagementScore {
  score: number; // 0-100
  level: EngagementLevel;
  trend: EngagementTrend;
}

export interface EngagementDataPoint {
  timestamp: number;
  score: number;
  level: EngagementLevel;
  contributingBehavior: BehaviorClass;
}

export interface EngagementScorerConfig {
  emaAlpha?: number; // Exponential moving average smoothing factor (default: 0.3)
  trendWindowSeconds?: number; // Window for trend detection (default: 30)
  historyDurationSeconds?: number; // Duration to keep history (default: 60)
  updateIntervalSeconds?: number; // How often to update score (default: 4)
}

/**
 * Base score weights for each behavior class
 * Applied per update interval (typically 3-5 seconds)
 */
const BEHAVIOR_WEIGHTS: Record<BehaviorClass, number> = {
  focused_on_screen: 10,
  looking_away: -5,
  speaking: 3,
  note_taking: 7,
  no_face_detected: -15,
  phone_detected: -20,
};

/**
 * Engagement level thresholds
 */
const ENGAGEMENT_THRESHOLDS = {
  high: 75,
  medium: 50,
  low: 25,
} as const;

/**
 * Trend detection threshold (±5 points from moving average)
 */
const TREND_THRESHOLD = 5;

export class EngagementScorer {
  private config: Required<EngagementScorerConfig>;
  private currentScore: number;
  private scoreHistory: EngagementDataPoint[];
  private lastUpdateTime: number;

  constructor(config: EngagementScorerConfig = {}) {
    this.config = {
      emaAlpha: config.emaAlpha ?? 0.3,
      trendWindowSeconds: config.trendWindowSeconds ?? 30,
      historyDurationSeconds: config.historyDurationSeconds ?? 60,
      updateIntervalSeconds: config.updateIntervalSeconds ?? 4,
    };

    // Initialize with neutral score
    this.currentScore = 50;
    this.scoreHistory = [];
    this.lastUpdateTime = Date.now();
  }

  /**
   * Update engagement score with new behavior data
   * @param newBehavior - The latest behavior classification result
   */
  public updateScore(newBehavior: BehaviorResult): void {
    const now = Date.now();
    
    // Calculate raw score change based on behavior weight
    const behaviorWeight = BEHAVIOR_WEIGHTS[newBehavior.behaviorClass];
    const rawScoreChange = behaviorWeight * newBehavior.confidence;

    // Apply exponential moving average for temporal smoothing
    // EMA formula: newScore = alpha * rawChange + (1 - alpha) * currentScore
    const targetScore = this.currentScore + rawScoreChange;
    this.currentScore = 
      this.config.emaAlpha * targetScore + 
      (1 - this.config.emaAlpha) * this.currentScore;

    // Clamp score to 0-100 range
    this.currentScore = Math.max(0, Math.min(100, this.currentScore));

    // Calculate engagement level
    const level = this.calculateEngagementLevel(this.currentScore);

    // Add to history
    const dataPoint: EngagementDataPoint = {
      timestamp: now,
      score: this.currentScore,
      level,
      contributingBehavior: newBehavior.behaviorClass,
    };
    this.scoreHistory.push(dataPoint);

    // Clean up old history (keep only last 60 seconds)
    this.cleanupHistory(now);

    this.lastUpdateTime = now;
  }

  /**
   * Calculate engagement score from behavior history
   * This is an alternative method that processes multiple behaviors at once
   * @param behaviorHistory - Array of recent behavior results
   * @returns Current engagement score with level and trend
   */
  public calculateScore(behaviorHistory: BehaviorResult[]): EngagementScore {
    if (behaviorHistory.length === 0) {
      return {
        score: this.currentScore,
        level: this.calculateEngagementLevel(this.currentScore),
        trend: 'stable',
      };
    }

    // Process each behavior in history
    behaviorHistory.forEach(behavior => {
      this.updateScore(behavior);
    });

    return this.getCurrentScore();
  }

  /**
   * Get current engagement score with level and trend
   * @returns Current engagement score data
   */
  public getCurrentScore(): EngagementScore {
    const level = this.calculateEngagementLevel(this.currentScore);
    const trend = this.detectTrend();

    return {
      score: Math.round(this.currentScore * 10) / 10, // Round to 1 decimal
      level,
      trend,
    };
  }

  /**
   * Get score history for visualization
   * @returns Array of engagement data points
   */
  public getScoreHistory(): EngagementDataPoint[] {
    return [...this.scoreHistory];
  }

  /**
   * Get score history for a specific time range
   * @param durationSeconds - Duration in seconds to retrieve
   * @returns Array of engagement data points within the time range
   */
  public getScoreHistoryForDuration(durationSeconds: number): EngagementDataPoint[] {
    const now = Date.now();
    const cutoffTime = now - (durationSeconds * 1000);
    
    return this.scoreHistory.filter(point => point.timestamp >= cutoffTime);
  }

  /**
   * Reset the scorer to initial state
   */
  public reset(): void {
    this.currentScore = 50;
    this.scoreHistory = [];
    this.lastUpdateTime = Date.now();
  }

  /**
   * Calculate engagement level based on score thresholds
   * @param score - Current engagement score (0-100)
   * @returns Engagement level category
   */
  private calculateEngagementLevel(score: number): EngagementLevel {
    if (score >= ENGAGEMENT_THRESHOLDS.high) {
      return 'high';
    } else if (score >= ENGAGEMENT_THRESHOLDS.medium) {
      return 'medium';
    } else if (score >= ENGAGEMENT_THRESHOLDS.low) {
      return 'low';
    } else {
      return 'disengaged';
    }
  }

  /**
   * Detect engagement trend by comparing current score to moving average
   * @returns Trend direction (increasing, stable, or decreasing)
   */
  private detectTrend(): EngagementTrend {
    const trendWindowMs = this.config.trendWindowSeconds * 1000;
    const now = Date.now();
    const cutoffTime = now - trendWindowMs;

    // Get data points within trend window
    const recentHistory = this.scoreHistory.filter(
      point => point.timestamp >= cutoffTime
    );

    if (recentHistory.length < 2) {
      return 'stable';
    }

    // Calculate moving average for trend window
    const movingAverage = recentHistory.reduce(
      (sum, point) => sum + point.score, 
      0
    ) / recentHistory.length;

    // Compare current score to moving average
    const difference = this.currentScore - movingAverage;

    if (difference > TREND_THRESHOLD) {
      return 'increasing';
    } else if (difference < -TREND_THRESHOLD) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Remove data points older than the configured history duration
   * @param currentTime - Current timestamp in milliseconds
   */
  private cleanupHistory(currentTime: number): void {
    const cutoffTime = currentTime - (this.config.historyDurationSeconds * 1000);
    
    this.scoreHistory = this.scoreHistory.filter(
      point => point.timestamp >= cutoffTime
    );
  }

  /**
   * Get statistics about the current session
   * @returns Session statistics
   */
  public getStatistics(): {
    averageScore: number;
    minScore: number;
    maxScore: number;
    timeInHighEngagement: number;
    timeInMediumEngagement: number;
    timeInLowEngagement: number;
    timeDisengaged: number;
  } {
    if (this.scoreHistory.length === 0) {
      return {
        averageScore: this.currentScore,
        minScore: this.currentScore,
        maxScore: this.currentScore,
        timeInHighEngagement: 0,
        timeInMediumEngagement: 0,
        timeInLowEngagement: 0,
        timeDisengaged: 0,
      };
    }

    const scores = this.scoreHistory.map(p => p.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Calculate time spent in each engagement level
    const levelCounts = this.scoreHistory.reduce(
      (counts, point) => {
        counts[point.level]++;
        return counts;
      },
      { high: 0, medium: 0, low: 0, disengaged: 0 }
    );

    const updateInterval = this.config.updateIntervalSeconds;

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      minScore: Math.round(minScore * 10) / 10,
      maxScore: Math.round(maxScore * 10) / 10,
      timeInHighEngagement: levelCounts.high * updateInterval,
      timeInMediumEngagement: levelCounts.medium * updateInterval,
      timeInLowEngagement: levelCounts.low * updateInterval,
      timeDisengaged: levelCounts.disengaged * updateInterval,
    };
  }
}

/**
 * Create a singleton instance for global use
 */
let engagementScorerInstance: EngagementScorer | null = null;

export function getEngagementScorer(config?: EngagementScorerConfig): EngagementScorer {
  if (!engagementScorerInstance) {
    engagementScorerInstance = new EngagementScorer(config);
  }
  return engagementScorerInstance;
}

export function resetEngagementScorer(): void {
  if (engagementScorerInstance) {
    engagementScorerInstance.reset();
  }
}
