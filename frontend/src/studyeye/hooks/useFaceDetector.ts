import { useState, useEffect, useCallback, useRef } from 'react';
import { faceDetector } from '../services/faceDetector';
import type { FaceDetectionResult, FaceDetectorConfig } from '../types';

export interface UseFaceDetectorOptions {
  config?: Partial<FaceDetectorConfig>;
  autoInitialize?: boolean;
}

export interface UseFaceDetectorReturn {
  isInitialized: boolean;
  isDetecting: boolean;
  lastResult: FaceDetectionResult | null;
  error: string | null;
  initialize: () => Promise<void>;
  detectFaces: (
    imageData: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageData
  ) => Promise<FaceDetectionResult>;
  reset: () => void;
  updateConfig: (config: Partial<FaceDetectorConfig>) => void;
}

export function useFaceDetector(options?: UseFaceDetectorOptions): UseFaceDetectorReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  const initialize = useCallback(async () => {
    if (isInitialized || initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    setError(null);

    try {
      // Apply custom config if provided
      if (options?.config) {
        faceDetector.updateConfig(options.config);
      }

      await faceDetector.initialize();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face detector';
      setError(errorMessage);
      console.error('Face detector initialization error:', err);
    } finally {
      initializingRef.current = false;
    }
  }, [isInitialized, options?.config]);

  const detectFaces = useCallback(
    async (
      imageData: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageData
    ): Promise<FaceDetectionResult> => {
      if (!isInitialized) {
        throw new Error('Face detector not initialized');
      }

      setIsDetecting(true);
      setError(null);

      try {
        const result = await faceDetector.detectFaces(imageData);
        setLastResult(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Face detection failed';
        setError(errorMessage);
        console.error('Face detection error:', err);
        throw err;
      } finally {
        setIsDetecting(false);
      }
    },
    [isInitialized]
  );

  const reset = useCallback(() => {
    faceDetector.reset();
    setLastResult(null);
    setError(null);
  }, []);

  const updateConfig = useCallback((config: Partial<FaceDetectorConfig>) => {
    faceDetector.updateConfig(config);
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (options?.autoInitialize && !isInitialized && !initializingRef.current) {
      initialize();
    }
  }, [options?.autoInitialize, isInitialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: We don't dispose the singleton faceDetector here
      // as it might be used by other components
    };
  }, []);

  return {
    isInitialized,
    isDetecting,
    lastResult,
    error,
    initialize,
    detectFaces,
    reset,
    updateConfig,
  };
}
