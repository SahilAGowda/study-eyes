/**
 * useAudioStream Hook
 * React hook for managing audio stream and analysis
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioAnalyzer, AudioData, AudioError } from '../../services/audioAnalyzer';

interface UseAudioStreamReturn {
  audioData: AudioData;
  isActive: boolean;
  isLoading: boolean;
  error: AudioError | null;
  startAudio: () => Promise<void>;
  stopAudio: () => void;
}

export const useAudioStream = (): UseAudioStreamReturn => {
  const [audioData, setAudioData] = useState<AudioData>({
    isSpeaking: false,
    audioLevel: 0,
    speechConfidence: 0,
    ambientNoiseLevel: 0
  });
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AudioError | null>(null);
  
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  // Initialize audio analyzer
  useEffect(() => {
    audioAnalyzerRef.current = new AudioAnalyzer();

    return () => {
      // Cleanup on unmount
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stopAudio();
      }
    };
  }, []);

  const startAudio = useCallback(async () => {
    if (!audioAnalyzerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await audioAnalyzerRef.current.initializeAudio();
      setIsActive(true);

      // Start audio analysis loop (every 100ms)
      analysisIntervalRef.current = window.setInterval(() => {
        if (audioAnalyzerRef.current) {
          const data = audioAnalyzerRef.current.analyzeAudio();
          setAudioData(data);
        }
      }, 100);

    } catch (err: any) {
      setError(err as AudioError);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stopAudio();
    }

    setIsActive(false);
    setAudioData({
      isSpeaking: false,
      audioLevel: 0,
      speechConfidence: 0,
      ambientNoiseLevel: 0
    });
  }, []);

  return {
    audioData,
    isActive,
    isLoading,
    error,
    startAudio,
    stopAudio
  };
};

export default useAudioStream;
