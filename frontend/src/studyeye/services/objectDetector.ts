import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectDetectionResult, ObjectDetectorConfig } from '../types';
import { modelLoader } from './modelLoader';

/**
 * ObjectDetector service for detecting phones and writing-related objects
 * Optimized to run every 2-3 frames to save performance
 */
class ObjectDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private config: ObjectDetectorConfig & { phoneConfidenceThreshold: number } = {
    confidenceThreshold: 0.5,
    phoneConfidenceThreshold: 0.15, // Very low threshold for phones (webcam conditions are challenging)
    frameSkip: 2, // Process every 2-3 frames
  };
  private frameCounter: number = 0;
  private lastDetections: ObjectDetectionResult[] = [];
  private isProcessing: boolean = false;

  // Target object classes for detection
  // Note: COCO-SSD sometimes detects phones as "remote" or "cell phone"
  private readonly PHONE_CLASSES = ['cell phone', 'remote'];
  private readonly WRITING_CLASSES = ['book', 'pen', 'pencil'];
  private readonly TARGET_CLASSES = [...this.PHONE_CLASSES, ...this.WRITING_CLASSES];

  constructor(config?: Partial<ObjectDetectorConfig & { phoneConfidenceThreshold: number }>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Initialize the object detector by loading the COCO-SSD model
   */
  public async initialize(): Promise<void> {
    try {
      this.model = await modelLoader.loadCocoSsd();
      console.log('ObjectDetector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ObjectDetector:', error);
      throw error;
    }
  }

  /**
   * Detect objects in the provided image data
   * Uses frame skipping to optimize performance
   * @param imageData - Image data from video frame
   * @returns Array of detected objects with confidence > threshold
   */
  public async detectObjects(
    imageData: HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Promise<ObjectDetectionResult[]> {
    if (!this.model) {
      throw new Error('ObjectDetector not initialized. Call initialize() first.');
    }

    // Frame skipping optimization - only process every N frames
    this.frameCounter++;
    if (this.frameCounter % this.config.frameSkip !== 0) {
      // Return cached detections from previous frame
      return this.lastDetections;
    }

    // Prevent concurrent processing
    if (this.isProcessing) {
      return this.lastDetections;
    }

    this.isProcessing = true;

    try {
      // Convert ImageData to canvas if needed
      let inputElement: HTMLVideoElement | HTMLCanvasElement;
      
      if (imageData instanceof ImageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        ctx.putImageData(imageData, 0, 0);
        inputElement = canvas;
      } else {
        inputElement = imageData;
      }

      // Run object detection - get ALL predictions first for debugging
      const predictions = await this.model.detect(inputElement);
      
      // DEBUG: Log ALL raw predictions from COCO-SSD
      if (predictions.length > 0) {
        console.log('[ObjectDetector] RAW predictions:', predictions.map(p => 
          `${p.class} (${(p.score * 100).toFixed(1)}%)`
        ));
      }

      // Filter and format detections
      const detections: ObjectDetectionResult[] = predictions
        .filter(pred => {
          const objectClass = pred.class.toLowerCase();
          const isPhone = this.PHONE_CLASSES.includes(objectClass);
          // Use lower threshold for phones (harder to detect in webcam conditions)
          const threshold = isPhone 
            ? this.config.phoneConfidenceThreshold 
            : this.config.confidenceThreshold;
          return pred.score >= threshold && this.TARGET_CLASSES.includes(objectClass);
        })
        .map(pred => ({
          objectType: pred.class.toLowerCase(),
          confidence: pred.score,
          boundingBox: {
            x: pred.bbox[0],
            y: pred.bbox[1],
            width: pred.bbox[2],
            height: pred.bbox[3],
          },
        }));

      // Cache detections for frame skipping
      this.lastDetections = detections;

      return detections;
    } catch (error) {
      console.error('Object detection failed:', error);
      return this.lastDetections; // Return cached detections on error
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if a phone is detected in the current detections
   * @returns true if phone detected with confidence > threshold
   */
  public isPhoneDetected(): boolean {
    return this.lastDetections.some(detection =>
      this.PHONE_CLASSES.includes(detection.objectType)
    );
  }

  /**
   * Check if writing-related objects are detected
   * @returns true if book, pen, or pencil detected with confidence > threshold
   */
  public isWritingDetected(): boolean {
    return this.lastDetections.some(detection =>
      this.WRITING_CLASSES.includes(detection.objectType)
    );
  }

  /**
   * Get the most recent detections (useful when frame skipping)
   * @returns Array of last detected objects
   */
  public getLastDetections(): ObjectDetectionResult[] {
    return this.lastDetections;
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<ObjectDetectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   * @returns Current detector configuration
   */
  public getConfig(): ObjectDetectorConfig {
    return { ...this.config };
  }

  /**
   * Reset frame counter and cached detections
   */
  public reset(): void {
    this.frameCounter = 0;
    this.lastDetections = [];
    this.isProcessing = false;
  }

  /**
   * Dispose of the model and free resources
   */
  public dispose(): void {
    this.reset();
    // Model disposal is handled by modelLoader
    this.model = null;
  }
}

// Export singleton instance
export const objectDetector = new ObjectDetector();

// Export class for custom instances
export default ObjectDetector;
