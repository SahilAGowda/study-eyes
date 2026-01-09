/**
 * useSessionData Hook
 * 
 * Provides real-time session data from the SessionTracker service.
 * Can be used in Reports and other components to show actual engagement data.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSessionTracker } from '../services/sessionTracker';
import type { SessionMetrics, SessionReport } from '../services/sessionTracker';

interface UseSessionDataReturn {
  metrics: SessionMetrics | null;
  report: SessionReport | null;
  isSessionActive: boolean;
  sessionDuration: number;
  startSession: () => void;
  endSession: () => SessionReport | null;
  refreshMetrics: () => void;
}

export function useSessionData(): UseSessionDataReturn {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const sessionTracker = getSessionTracker();

  const refreshMetrics = useCallback(() => {
    if (sessionTracker.isSessionActive()) {
      setMetrics(sessionTracker.getMetrics());
      setSessionDuration(sessionTracker.getSessionDurationSeconds());
    }
  }, []);

  const startSession = useCallback(() => {
    sessionTracker.startSession();
    setIsSessionActive(true);
    setReport(null);
  }, []);

  const endSession = useCallback(() => {
    const sessionReport = sessionTracker.endSession();
    setReport(sessionReport);
    setIsSessionActive(false);
    return sessionReport;
  }, []);

  // Update metrics periodically when session is active
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      refreshMetrics();
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, refreshMetrics]);

  // Check initial state
  useEffect(() => {
    setIsSessionActive(sessionTracker.isSessionActive());
    if (sessionTracker.isSessionActive()) {
      refreshMetrics();
    }
  }, [refreshMetrics]);

  return {
    metrics,
    report,
    isSessionActive,
    sessionDuration,
    startSession,
    endSession,
    refreshMetrics,
  };
}

export default useSessionData;
