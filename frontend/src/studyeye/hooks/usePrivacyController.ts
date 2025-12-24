/**
 * usePrivacyController Hook
 * 
 * React hook for managing privacy controls and anonymization
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PrivacyController, PrivacyConfig, PrivacyStatus } from '../services/privacyController';

interface UsePrivacyControllerOptions {
  initialConfig?: Partial<PrivacyConfig>;
  autoVerify?: boolean;
  verifyInterval?: number; // milliseconds
}

interface UsePrivacyControllerReturn {
  privacyController: PrivacyController;
  anonymizationEnabled: boolean;
  privacyStatus: PrivacyStatus | null;
  complianceMessage: string;
  setAnonymization: (enabled: boolean) => void;
  setBlurIntensity: (intensity: number) => void;
  verifyCompliance: () => PrivacyStatus;
  applyFaceBlur: (
    sourceCanvas: HTMLCanvasElement,
    faceRegions: Array<{ x: number; y: number; width: number; height: number }>
  ) => HTMLCanvasElement;
  applyFullFrameBlur: (sourceCanvas: HTMLCanvasElement) => HTMLCanvasElement;
}

export const usePrivacyController = (
  options: UsePrivacyControllerOptions = {}
): UsePrivacyControllerReturn => {
  const {
    initialConfig,
    autoVerify = true,
    verifyInterval = 5000,
  } = options;

  // Create privacy controller instance (only once)
  const privacyControllerRef = useRef<PrivacyController | null>(null);
  
  if (!privacyControllerRef.current) {
    privacyControllerRef.current = new PrivacyController(initialConfig);
  }

  const privacyController = privacyControllerRef.current;

  // State
  const [anonymizationEnabled, setAnonymizationEnabledState] = useState(
    privacyController.isAnonymizationEnabled()
  );
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus | null>(null);
  const [complianceMessage] = useState(privacyController.getComplianceMessage());

  // Auto-verify compliance periodically
  useEffect(() => {
    if (!autoVerify) return;

    const verify = () => {
      const status = privacyController.verifyCompliance();
      setPrivacyStatus(status);
    };

    // Initial verification
    verify();

    // Periodic verification
    const interval = setInterval(verify, verifyInterval);

    return () => clearInterval(interval);
  }, [privacyController, autoVerify, verifyInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (privacyControllerRef.current) {
        privacyControllerRef.current.dispose();
      }
    };
  }, []);

  // Set anonymization
  const setAnonymization = useCallback((enabled: boolean) => {
    privacyController.setAnonymization(enabled);
    setAnonymizationEnabledState(enabled);
  }, [privacyController]);

  // Set blur intensity
  const setBlurIntensity = useCallback((intensity: number) => {
    privacyController.setBlurIntensity(intensity);
  }, [privacyController]);

  // Verify compliance
  const verifyCompliance = useCallback(() => {
    const status = privacyController.verifyCompliance();
    setPrivacyStatus(status);
    return status;
  }, [privacyController]);

  // Apply face blur
  const applyFaceBlur = useCallback((
    sourceCanvas: HTMLCanvasElement,
    faceRegions: Array<{ x: number; y: number; width: number; height: number }>
  ) => {
    return privacyController.applyFaceBlur(sourceCanvas, faceRegions);
  }, [privacyController]);

  // Apply full frame blur
  const applyFullFrameBlur = useCallback((sourceCanvas: HTMLCanvasElement) => {
    return privacyController.applyFullFrameBlur(sourceCanvas);
  }, [privacyController]);

  return {
    privacyController,
    anonymizationEnabled,
    privacyStatus,
    complianceMessage,
    setAnonymization,
    setBlurIntensity,
    verifyCompliance,
    applyFaceBlur,
    applyFullFrameBlur,
  };
};

export default usePrivacyController;
