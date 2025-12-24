/**
 * useAudioStream Hook
 * 
 * React hook for managing audio stream and analysis.
 * Provides easy integration with React components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioAnalyzer } from '../services/audioAnalyzer';
import type { AudioData, AudioAnalyzerConfig } from '../types';

export interface UseAudioStreamResult {
  audioData: AudioData | null;
  isInitialized: boolean;
  isCalibrating: boolean;
  error: string | null;
  initializeAudio: () => Promise<void>;
  stopAudio: () => void;
  recalibrate: () => void;
}

export function useAudioStream(config?: AudioAnalyzerConfig): UseAudioStreamResult {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  /**
   * Initialize audio analyzer
   */
  const initializeAudio = useCallback(async () => {
    try {
      setError(null);
      
      // Create analyzer if not exists
      if (!analyzerRef.current) {
        analyzerRef.current = new AudioAnalyzer(config);
      }

      // Initialize audio
      await analyzerRef.current.initializeAudio();
      setIsInitialized(true);
      setIsCalibrating(true);

      // Start polling for audio data updates
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = window.setInterval(() => {
        if (analyzerRef.current) {
          const data = analyzerRef.current.getAudioData();
          setAudioData(data);
          setIsCalibrating(analyzerRef.current.getIsCalibrating());
        }
      }, 100); // Poll every 100ms to match analyzer update interval

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize audio';
      setError(errorMessage);
      setIsInitialized(false);
      console.error('Audio initialization error:', err);
    }
  }, [config]);

  /**
   * Stop audio analyzer
   */
  const stopAudio = useCallback(() => {
    if (pollingIntervalRef.current !== null) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (analyzerRef.current) {
      analyzerRef.current.stopAudio();
      analyzerRef.current = null;
    }

    setIsInitialized(false);
    setIsCalibrating(false);
    setAudioData(null);
    setError(null);
  }, []);

  /**
   * Recalibrate ambient noise
   */
  const recalibrate = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.recalibrate();
      setIsCalibrating(true);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    audioData,
    isInitialized,
    isCalibrating,
    error,
    initializeAudio,
    stopAudio,
    recalibrate,
  };
}
