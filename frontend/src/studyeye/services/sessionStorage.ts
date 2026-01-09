/**
 * SessionStorage Service
 * 
 * Persists session reports to localStorage so they can be displayed
 * in the Reports page after sessions end.
 */

import type { SessionReport, SessionMetrics } from './sessionTracker';

export interface StoredSession {
  id: string;
  date: string;
  time: string;
  duration: string;
  durationMs: number;
  focusPercentage: number;
  engagementScore: number;
  distractionCount: number;
  noteTakingCount: number;
  behaviorBreakdown: {
    focused_on_screen: number;
    looking_away: number;
    note_taking: number;
    no_face_detected: number;
    phone_detected: number;
    speaking: number;
  };
  overallRating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  focusScore: number;
  recommendations: string[];
  timestamp: number;
}

const STORAGE_KEY = 'studyeye_session_reports';
const MAX_STORED_SESSIONS = 50;

/**
 * Format duration from milliseconds to readable string
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Save a session report to localStorage
 */
export function saveSessionReport(report: SessionReport): StoredSession {
  const sessions = getStoredSessions();
  const now = new Date(report.metrics.sessionStartTime);
  
  const storedSession: StoredSession = {
    id: `session_${report.metrics.sessionStartTime}`,
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: formatDuration(report.metrics.sessionDuration),
    durationMs: report.metrics.sessionDuration,
    focusPercentage: report.metrics.focusPercentage,
    engagementScore: report.metrics.engagementScore,
    distractionCount: report.metrics.distractionCount,
    noteTakingCount: report.metrics.noteTakingCount,
    behaviorBreakdown: report.metrics.behaviorBreakdown,
    overallRating: report.summary.overallRating,
    focusScore: report.summary.focusScore,
    recommendations: report.summary.recommendations,
    timestamp: report.metrics.sessionStartTime,
  };
  
  // Add to beginning of array (most recent first)
  sessions.unshift(storedSession);
  
  // Keep only the most recent sessions
  const trimmedSessions = sessions.slice(0, MAX_STORED_SESSIONS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSessions));
  
  return storedSession;
}

/**
 * Get all stored sessions
 */
export function getStoredSessions(): StoredSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Get sessions for a specific time period
 */
export function getSessionsByPeriod(period: 'today' | 'week' | 'month' | 'all'): StoredSession[] {
  const sessions = getStoredSessions();
  const now = Date.now();
  
  switch (period) {
    case 'today': {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return sessions.filter(s => s.timestamp >= startOfDay.getTime());
    }
    case 'week': {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return sessions.filter(s => s.timestamp >= weekAgo);
    }
    case 'month': {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      return sessions.filter(s => s.timestamp >= monthAgo);
    }
    default:
      return sessions;
  }
}

/**
 * Calculate aggregate statistics from sessions
 */
export function calculateAggregateStats(sessions: StoredSession[]) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalStudyTime: 0,
      totalStudyTimeFormatted: '0m',
      averageFocusPercentage: 0,
      averageEngagementScore: 0,
      totalDistractions: 0,
      totalNoteTaking: 0,
      averageSessionDuration: 0,
      averageSessionDurationFormatted: '0m',
      behaviorTotals: {
        focused_on_screen: 0,
        looking_away: 0,
        note_taking: 0,
        no_face_detected: 0,
        phone_detected: 0,
        speaking: 0,
      },
      ratingBreakdown: {
        excellent: 0,
        good: 0,
        fair: 0,
        needs_improvement: 0,
      },
    };
  }
  
  const totalStudyTime = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractionCount, 0);
  const totalNoteTaking = sessions.reduce((sum, s) => sum + s.noteTakingCount, 0);
  
  const behaviorTotals = {
    focused_on_screen: 0,
    looking_away: 0,
    note_taking: 0,
    no_face_detected: 0,
    phone_detected: 0,
    speaking: 0,
  };
  
  const ratingBreakdown = {
    excellent: 0,
    good: 0,
    fair: 0,
    needs_improvement: 0,
  };
  
  sessions.forEach(s => {
    Object.keys(behaviorTotals).forEach(key => {
      behaviorTotals[key as keyof typeof behaviorTotals] += s.behaviorBreakdown[key as keyof typeof behaviorTotals] || 0;
    });
    ratingBreakdown[s.overallRating]++;
  });
  
  return {
    totalSessions: sessions.length,
    totalStudyTime,
    totalStudyTimeFormatted: formatDuration(totalStudyTime),
    averageFocusPercentage: Math.round(sessions.reduce((sum, s) => sum + s.focusPercentage, 0) / sessions.length),
    averageEngagementScore: Math.round(sessions.reduce((sum, s) => sum + s.engagementScore, 0) / sessions.length),
    totalDistractions,
    totalNoteTaking,
    averageSessionDuration: Math.round(totalStudyTime / sessions.length),
    averageSessionDurationFormatted: formatDuration(Math.round(totalStudyTime / sessions.length)),
    behaviorTotals,
    ratingBreakdown,
  };
}

/**
 * Clear all stored sessions
 */
export function clearStoredSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Delete a specific session
 */
export function deleteSession(sessionId: string): void {
  const sessions = getStoredSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export default {
  saveSessionReport,
  getStoredSessions,
  getSessionsByPeriod,
  calculateAggregateStats,
  clearStoredSessions,
  deleteSession,
};
