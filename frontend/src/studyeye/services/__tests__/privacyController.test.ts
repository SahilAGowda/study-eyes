/**
 * PrivacyController Tests
 * 
 * Tests for privacy controls and compliance verification
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrivacyController } from '../privacyController';

describe('PrivacyController', () => {
  let privacyController: PrivacyController;

  beforeEach(() => {
    privacyController = new PrivacyController();
  });

  afterEach(() => {
    privacyController.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const config = privacyController.getConfig();
      expect(config.anonymizationEnabled).toBe(false);
      expect(config.blurIntensity).toBe(50);
      expect(config.complianceMessage).toContain('Local processing');
    });

    it('should initialize with custom config', () => {
      const customController = new PrivacyController({
        anonymizationEnabled: true,
        blurIntensity: 75,
      });
      
      const config = customController.getConfig();
      expect(config.anonymizationEnabled).toBe(true);
      expect(config.blurIntensity).toBe(75);
      
      customController.dispose();
    });
  });

  describe('Anonymization Control', () => {
    it('should enable anonymization', () => {
      privacyController.setAnonymization(true);
      expect(privacyController.isAnonymizationEnabled()).toBe(true);
    });

    it('should disable anonymization', () => {
      privacyController.setAnonymization(true);
      privacyController.setAnonymization(false);
      expect(privacyController.isAnonymizationEnabled()).toBe(false);
    });

    it('should set blur intensity', () => {
      privacyController.setBlurIntensity(80);
      const config = privacyController.getConfig();
      expect(config.blurIntensity).toBe(80);
    });

    it('should clamp blur intensity to valid range', () => {
      privacyController.setBlurIntensity(150);
      expect(privacyController.getConfig().blurIntensity).toBe(100);

      privacyController.setBlurIntensity(-10);
      expect(privacyController.getConfig().blurIntensity).toBe(0);
    });
  });

  describe('Compliance Message', () => {
    it('should return compliance message', () => {
      const message = privacyController.getComplianceMessage();
      expect(message).toBe('Local processing — No recording — Privacy compliant');
    });
  });

  describe('Compliance Verification', () => {
    it('should verify compliance status', () => {
      const status = privacyController.verifyCompliance();
      
      expect(status).toHaveProperty('anonymizationEnabled');
      expect(status).toHaveProperty('noDataStored');
      expect(status).toHaveProperty('noNetworkRequests');
      expect(status).toHaveProperty('localProcessingOnly');
      expect(status).toHaveProperty('complianceVerified');
      
      expect(status.localProcessingOnly).toBe(true);
    });

    it('should verify no stored data', () => {
      const verified = PrivacyController.verifyNoStoredData();
      expect(typeof verified).toBe('boolean');
    });
  });

  describe('Face Blur', () => {
    it('should return original canvas when anonymization disabled', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      const faceRegions = [{ x: 100, y: 100, width: 200, height: 200 }];
      
      privacyController.setAnonymization(false);
      const result = privacyController.applyFaceBlur(canvas, faceRegions);
      
      expect(result).toBe(canvas);
    });

    it('should return blurred canvas when anonymization enabled', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 640, 480);
      }
      
      const faceRegions = [{ x: 100, y: 100, width: 200, height: 200 }];
      
      privacyController.setAnonymization(true);
      const result = privacyController.applyFaceBlur(canvas, faceRegions);
      
      expect(result).not.toBe(canvas);
      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
    });

    it('should handle empty face regions', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      privacyController.setAnonymization(true);
      const result = privacyController.applyFaceBlur(canvas, []);
      
      expect(result).toBe(canvas);
    });

    it('should apply full frame blur', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      privacyController.setAnonymization(true);
      const result = privacyController.applyFullFrameBlur(canvas);
      
      expect(result).not.toBe(canvas);
      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
    });
  });

  describe('Monitoring', () => {
    it('should reset monitoring flags', () => {
      privacyController.resetMonitoring();
      const status = privacyController.verifyCompliance();
      
      expect(status.noDataStored).toBe(true);
      expect(status.noNetworkRequests).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources', () => {
      privacyController.dispose();
      // Should not throw error
      expect(true).toBe(true);
    });
  });
});
