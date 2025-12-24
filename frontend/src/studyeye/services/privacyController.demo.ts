/**
 * PrivacyController Demo
 * 
 * Example usage of the PrivacyController service
 * This file demonstrates how to integrate privacy controls into the StudyEye system
 */

import { PrivacyController } from './privacyController';

/**
 * Example 1: Basic initialization and anonymization
 */
export function basicPrivacyExample() {
  // Create privacy controller
  const privacyController = new PrivacyController({
    anonymizationEnabled: false,
    blurIntensity: 50,
  });

  // Enable anonymization
  privacyController.setAnonymization(true);

  // Check if enabled
  console.log('Anonymization enabled:', privacyController.isAnonymizationEnabled());

  // Get compliance message
  console.log('Compliance:', privacyController.getComplianceMessage());

  return privacyController;
}

/**
 * Example 2: Apply face blur to video frame
 */
export function applyBlurExample(
  videoElement: HTMLVideoElement,
  faceRegions: Array<{ x: number; y: number; width: number; height: number }>
) {
  const privacyController = new PrivacyController({
    anonymizationEnabled: true,
    blurIntensity: 70,
  });

  // Create canvas from video
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  ctx.drawImage(videoElement, 0, 0);

  // Apply blur to detected faces
  const blurredCanvas = privacyController.applyFaceBlur(canvas, faceRegions);

  return blurredCanvas;
}

/**
 * Example 3: Verify privacy compliance
 */
export function verifyPrivacyExample() {
  const privacyController = new PrivacyController();

  // Verify compliance status
  const status = privacyController.verifyCompliance();

  console.log('Privacy Status:', {
    anonymizationEnabled: status.anonymizationEnabled,
    noDataStored: status.noDataStored,
    noNetworkRequests: status.noNetworkRequests,
    localProcessingOnly: status.localProcessingOnly,
    complianceVerified: status.complianceVerified,
  });

  // Static verification of storage
  const noStoredData = PrivacyController.verifyNoStoredData();
  console.log('No stored data:', noStoredData);

  return status;
}

/**
 * Example 4: Integration with video processing pipeline
 */
export class PrivacyAwareVideoProcessor {
  private privacyController: PrivacyController;
  private videoElement: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(videoElement: HTMLVideoElement) {
    this.privacyController = new PrivacyController({
      anonymizationEnabled: false,
      blurIntensity: 60,
    });

    this.videoElement = videoElement;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Process video frame with optional anonymization
   */
  processFrame(
    faceRegions: Array<{ x: number; y: number; width: number; height: number }>
  ): HTMLCanvasElement {
    // Set canvas size to match video
    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;

    // Draw video frame to canvas
    this.ctx.drawImage(this.videoElement, 0, 0);

    // Apply blur if anonymization is enabled
    if (this.privacyController.isAnonymizationEnabled()) {
      return this.privacyController.applyFaceBlur(this.canvas, faceRegions);
    }

    return this.canvas;
  }

  /**
   * Enable/disable anonymization
   */
  setAnonymization(enabled: boolean): void {
    this.privacyController.setAnonymization(enabled);
  }

  /**
   * Set blur intensity
   */
  setBlurIntensity(intensity: number): void {
    this.privacyController.setBlurIntensity(intensity);
  }

  /**
   * Get privacy status
   */
  getPrivacyStatus() {
    return this.privacyController.verifyCompliance();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.privacyController.dispose();
  }
}

/**
 * Example 5: React component integration pattern
 */
export const privacyControllerUsagePattern = `
import React, { useState } from 'react';
import { PrivacyController } from './services/privacyController';
import { PrivacyControls } from './components/PrivacyControls';

function StudyEyeDashboard() {
  const [privacyController] = useState(() => new PrivacyController());
  const [mode, setMode] = useState<'classroom' | 'exam'>('classroom');
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);

  const handleAnonymizationChange = (enabled: boolean) => {
    console.log('Anonymization changed:', enabled);
    // Update video processing pipeline
  };

  return (
    <div>
      <PrivacyControls
        privacyController={privacyController}
        currentMode={mode}
        onModeChange={setMode}
        cameraPermissionGranted={cameraGranted}
        microphonePermissionGranted={micGranted}
        onAnonymizationChange={handleAnonymizationChange}
      />
      
      {/* Other dashboard components */}
    </div>
  );
}
`;

/**
 * Example 6: Verify no data persistence
 */
export function verifyNoDataPersistence() {
  console.log('=== Privacy Verification ===');
  
  // Check localStorage
  console.log('Checking localStorage...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('video') || key.includes('audio') || key.includes('frame'))) {
      console.warn('⚠️ Found media data in localStorage:', key);
    }
  }
  
  // Check sessionStorage
  console.log('Checking sessionStorage...');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('video') || key.includes('audio') || key.includes('frame'))) {
      console.warn('⚠️ Found media data in sessionStorage:', key);
    }
  }
  
  // Static verification
  const verified = PrivacyController.verifyNoStoredData();
  console.log('✓ No stored data verified:', verified);
  
  console.log('=== Verification Complete ===');
}

export default {
  basicPrivacyExample,
  applyBlurExample,
  verifyPrivacyExample,
  PrivacyAwareVideoProcessor,
  privacyControllerUsagePattern,
  verifyNoDataPersistence,
};
