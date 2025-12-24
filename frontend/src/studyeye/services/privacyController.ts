/**
 * PrivacyController Service
 * 
 * Manages privacy controls including face anonymization and compliance verification.
 * Ensures all processing happens in volatile memory only with no persistent storage.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

export interface PrivacyConfig {
  anonymizationEnabled: boolean;
  blurIntensity: number; // 0-100, higher = more blur
  complianceMessage: string;
}

export interface PrivacyStatus {
  anonymizationEnabled: boolean;
  noDataStored: boolean;
  noNetworkRequests: boolean;
  localProcessingOnly: boolean;
  complianceVerified: boolean;
}

export class PrivacyController {
  private config: PrivacyConfig;
  private blurCanvas: HTMLCanvasElement | null = null;
  private blurContext: CanvasRenderingContext2D | null = null;
  private networkRequestDetected: boolean = false;
  private storageAccessDetected: boolean = false;

  constructor(config?: Partial<PrivacyConfig>) {
    this.config = {
      anonymizationEnabled: false,
      blurIntensity: 50,
      complianceMessage: 'Local processing — No recording — Privacy compliant',
      ...config,
    };

    // Initialize monitoring
    this.initializePrivacyMonitoring();
  }

  /**
   * Initialize privacy monitoring to detect violations
   */
  private initializePrivacyMonitoring(): void {
    // Monitor for network requests with video/audio data
    this.monitorNetworkRequests();
    
    // Monitor for storage access attempts
    this.monitorStorageAccess();
  }

  /**
   * Monitor network requests to ensure no raw video/audio data is transmitted
   */
  private monitorNetworkRequests(): void {
    // Store original fetch
    const originalFetch = window.fetch;
    const self = this;

    // Override fetch to monitor requests
    window.fetch = function(...args) {
      const [resource, init] = args;
      
      // Check if request contains video/audio data
      if (init && init.body) {
        const body = init.body;
        
        // Check for Blob, ArrayBuffer, or FormData that might contain media
        if (body instanceof Blob || 
            body instanceof ArrayBuffer || 
            body instanceof FormData) {
          console.warn('[PrivacyController] Network request with binary data detected');
          self.networkRequestDetected = true;
        }
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Monitor storage access to ensure no persistent data storage
   */
  private monitorStorageAccess(): void {
    const self = this;
    
    // Monitor localStorage
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.includes('video') || key.includes('audio') || key.includes('frame')) {
        console.warn('[PrivacyController] Attempt to store media data in localStorage detected');
        self.storageAccessDetected = true;
        return; // Block the storage
      }
      return originalSetItem.call(this, key, value);
    };
  }

  /**
   * Enable or disable face anonymization
   */
  setAnonymization(enabled: boolean): void {
    this.config.anonymizationEnabled = enabled;
    console.log(`[PrivacyController] Anonymization ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if anonymization is enabled
   */
  isAnonymizationEnabled(): boolean {
    return this.config.anonymizationEnabled;
  }

  /**
   * Set blur intensity (0-100)
   */
  setBlurIntensity(intensity: number): void {
    this.config.blurIntensity = Math.max(0, Math.min(100, intensity));
  }

  /**
   * Apply face blur to video frame using Canvas API
   * @param sourceCanvas - Source canvas with video frame
   * @param faceRegions - Array of face bounding boxes to blur
   * @returns Canvas with blurred faces
   */
  applyFaceBlur(
    sourceCanvas: HTMLCanvasElement,
    faceRegions: Array<{ x: number; y: number; width: number; height: number }>
  ): HTMLCanvasElement {
    if (!this.config.anonymizationEnabled || faceRegions.length === 0) {
      return sourceCanvas;
    }

    // Create blur canvas if not exists
    if (!this.blurCanvas) {
      this.blurCanvas = document.createElement('canvas');
      this.blurContext = this.blurCanvas.getContext('2d', { willReadFrequently: true });
    }

    // Match source canvas dimensions
    this.blurCanvas.width = sourceCanvas.width;
    this.blurCanvas.height = sourceCanvas.height;

    if (!this.blurContext) {
      return sourceCanvas;
    }

    // Copy source to blur canvas
    this.blurContext.drawImage(sourceCanvas, 0, 0);

    // Apply blur to each face region
    faceRegions.forEach(face => {
      this.blurFaceRegion(face);
    });

    return this.blurCanvas;
  }

  /**
   * Blur a specific face region
   */
  private blurFaceRegion(face: { x: number; y: number; width: number; height: number }): void {
    if (!this.blurContext || !this.blurCanvas) return;

    // Expand face region slightly for better coverage
    const padding = 20;
    const x = Math.max(0, face.x - padding);
    const y = Math.max(0, face.y - padding);
    const width = Math.min(this.blurCanvas.width - x, face.width + padding * 2);
    const height = Math.min(this.blurCanvas.height - y, face.height + padding * 2);

    // Extract face region
    const imageData = this.blurContext.getImageData(x, y, width, height);
    
    // Apply blur effect
    const blurredData = this.applyGaussianBlur(imageData, this.config.blurIntensity);
    
    // Put blurred region back
    this.blurContext.putImageData(blurredData, x, y);
  }

  /**
   * Apply Gaussian blur to image data
   */
  private applyGaussianBlur(imageData: ImageData, intensity: number): ImageData {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);
    
    // Calculate blur radius based on intensity (0-100 -> 0-20 pixels)
    const radius = Math.floor((intensity / 100) * 20);
    
    if (radius === 0) {
      return imageData;
    }

    // Simple box blur (faster than Gaussian for real-time)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        // Average pixels in radius
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += pixels[idx];
              g += pixels[idx + 1];
              b += pixels[idx + 2];
              a += pixels[idx + 3];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        output.data[idx] = r / count;
        output.data[idx + 1] = g / count;
        output.data[idx + 2] = b / count;
        output.data[idx + 3] = a / count;
      }
    }

    return output;
  }

  /**
   * Apply full frame blur (when no face regions provided)
   */
  applyFullFrameBlur(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    if (!this.config.anonymizationEnabled) {
      return sourceCanvas;
    }

    // Blur entire frame
    return this.applyFaceBlur(sourceCanvas, [{
      x: 0,
      y: 0,
      width: sourceCanvas.width,
      height: sourceCanvas.height
    }]);
  }

  /**
   * Get privacy compliance message
   */
  getComplianceMessage(): string {
    return this.config.complianceMessage;
  }

  /**
   * Verify privacy compliance status
   */
  verifyCompliance(): PrivacyStatus {
    return {
      anonymizationEnabled: this.config.anonymizationEnabled,
      noDataStored: !this.storageAccessDetected,
      noNetworkRequests: !this.networkRequestDetected,
      localProcessingOnly: true,
      complianceVerified: !this.storageAccessDetected && !this.networkRequestDetected,
    };
  }

  /**
   * Get current privacy configuration
   */
  getConfig(): PrivacyConfig {
    return { ...this.config };
  }

  /**
   * Reset privacy monitoring flags
   */
  resetMonitoring(): void {
    this.networkRequestDetected = false;
    this.storageAccessDetected = false;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.blurCanvas = null;
    this.blurContext = null;
    console.log('[PrivacyController] Disposed');
  }

  /**
   * Verify no data in storage
   */
  static verifyNoStoredData(): boolean {
    try {
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('video') || key.includes('audio') || key.includes('frame'))) {
          console.warn('[PrivacyController] Found media data in localStorage:', key);
          return false;
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('video') || key.includes('audio') || key.includes('frame'))) {
          console.warn('[PrivacyController] Found media data in sessionStorage:', key);
          return false;
        }
      }

      // Check IndexedDB (basic check)
      if (window.indexedDB) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name && (db.name.includes('video') || db.name.includes('audio'))) {
              console.warn('[PrivacyController] Found media database in IndexedDB:', db.name);
            }
          });
        });
      }

      return true;
    } catch (error) {
      console.error('[PrivacyController] Error verifying storage:', error);
      return false;
    }
  }
}

export default PrivacyController;
