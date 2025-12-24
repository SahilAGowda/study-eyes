/**
 * useCameraStream Hook
 * React hook for managing camera stream
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraManager, CameraConfig, CameraError } from '../../services/cameraManager';

interface UseCameraStreamReturn {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  isLoading: boolean;
  error: CameraError | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => ImageData | null;
  applyAnonymization: (enabled: boolean) => void;
}

export const useCameraStream = (config?: CameraConfig): UseCameraStreamReturn => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  
  const cameraManagerRef = useRef<CameraManager | null>(null);

  // Initialize camera manager
  useEffect(() => {
    cameraManagerRef.current = new CameraManager(config);

    return () => {
      // Cleanup on unmount
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopCamera();
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (!cameraManagerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await cameraManagerRef.current.initializeCamera();
      const video = cameraManagerRef.current.getVideoElement();
      setVideoElement(video);
      setIsActive(true);
    } catch (err: any) {
      setError(err as CameraError);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (!cameraManagerRef.current) return;

    cameraManagerRef.current.stopCamera();
    setVideoElement(null);
    setIsActive(false);
  }, []);

  const captureFrame = useCallback((): ImageData | null => {
    if (!cameraManagerRef.current) return null;
    return cameraManagerRef.current.captureFrame();
  }, []);

  const applyAnonymization = useCallback((enabled: boolean) => {
    if (!cameraManagerRef.current) return;
    cameraManagerRef.current.applyAnonymization(enabled);
  }, []);

  return {
    videoElement,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    applyAnonymization
  };
};

export default useCameraStream;
