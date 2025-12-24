import * as blazeface from '@tensorflow-models/blazeface';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { modelLoader } from './modelLoader';
import type { Point, BoundingBox, FaceDetectionResult, DetectedFace, FaceDetectorConfig } from '../types';

export type { Point, BoundingBox, FaceDetectionResult, DetectedFace, FaceDetectorConfig };

interface TrackedFace {
  face: DetectedFace;
  lastSeen: number;
  smoothedBox: BoundingBox;
}

class FaceDetector {
  private blazeFaceModel: blazeface.BlazeFaceModel | null = null;
  private faceMeshModel: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private frameCounter: number = 0;
  private lastDetectionResult: FaceDetectionResult | null = null;
  private trackedFaces: Map<number, TrackedFace> = new Map();
  private nextFaceId: number = 0;
  private config: FaceDetectorConfig = {
    maxFaces: 10, // Increased to support multiple people
    minConfidence: 0.5,
    skipFrames: 1, // Process every frame by default, can be increased for optimization
  };

  constructor(config?: Partial<FaceDetectorConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Initialize the face detector by loading required models
   */
  public async initialize(): Promise<void> {
    try {
      // Load both BlazeFace and FaceMesh models
      const [blazeFace, faceMesh] = await Promise.all([
        modelLoader.loadBlazeFace(),
        modelLoader.loadFaceMesh(),
      ]);

      this.blazeFaceModel = blazeFace;
      this.faceMeshModel = faceMesh;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize FaceDetector: ${errorMessage}`);
    }
  }

  /**
   * Detect faces in the provided image data
   * @param imageData - Image data from video frame or canvas
   * @returns Face detection result with bounding boxes, landmarks, and confidence
   */
  public async detectFaces(
    imageData: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageData
  ): Promise<FaceDetectionResult> {
    if (!this.blazeFaceModel || !this.faceMeshModel) {
      throw new Error('FaceDetector not initialized. Call initialize() first.');
    }

    // Frame skipping optimization - return cached result if skipping this frame
    this.frameCounter++;
    if (this.config.skipFrames > 1 && this.frameCounter % this.config.skipFrames !== 0) {
      if (this.lastDetectionResult) {
        return this.lastDetectionResult;
      }
    }

    try {
      // Convert ImageData to canvas if needed
      let inputElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
      
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

      // Step 1: Use BlazeFace for fast face detection
      const blazeFacePredictions = await this.blazeFaceModel.estimateFaces(
        inputElement,
        false // returnTensors = false for better performance
      );

      // If no faces detected, return empty result
      if (!blazeFacePredictions || blazeFacePredictions.length === 0) {
        const emptyResult: FaceDetectionResult = {
          faces: [],
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          landmarks: [],
          confidence: 0,
          faceCount: 0,
        };
        this.lastDetectionResult = emptyResult;
        this.trackedFaces.clear();
        return emptyResult;
      }

      const faceCount = blazeFacePredictions.length;
      const detectedFaces: DetectedFace[] = [];

      // Step 2: Use FaceMesh for detailed landmark detection (468 landmarks)
      const faceMeshPredictions = await this.faceMeshModel.estimateFaces(inputElement);

      console.log('[FaceDetector] FaceMesh predictions:', {
        count: faceMeshPredictions?.length,
        firstPrediction: faceMeshPredictions?.[0] ? {
          keypointsCount: faceMeshPredictions[0].keypoints?.length,
          box: faceMeshPredictions[0].box,
        } : null,
      });

      // Process each detected face
      for (let i = 0; i < Math.min(blazeFacePredictions.length, this.config.maxFaces); i++) {
        const blazeFace = blazeFacePredictions[i];
        
        // Extract bounding box from BlazeFace
        const topLeft = blazeFace.topLeft as [number, number];
        const bottomRight = blazeFace.bottomRight as [number, number];
        
        // Calculate raw dimensions
        let rawX = topLeft[0];
        let rawY = topLeft[1];
        let rawWidth = bottomRight[0] - topLeft[0];
        let rawHeight = bottomRight[1] - topLeft[1];
        
        // Make the box square by using the larger dimension
        const maxDimension = Math.max(rawWidth, rawHeight);
        
        // Center the square box on the face
        const centerX = rawX + rawWidth / 2;
        const centerY = rawY + rawHeight / 2;
        
        // Add 30% padding to include forehead and chin
        const paddedDimension = maxDimension * 1.3;
        
        // Calculate final square bounding box
        let boundingBox: BoundingBox = {
          x: centerX - paddedDimension / 2,
          y: centerY - paddedDimension / 2,
          width: paddedDimension,
          height: paddedDimension,
        };

        // Get confidence score (BlazeFace returns probability)
        const confidence = blazeFace.probability ? blazeFace.probability[0] : 0.5;

        // Skip faces below confidence threshold
        if (confidence < this.config.minConfidence) {
          continue;
        }

        // Track and smooth this face
        const faceId = this.assignFaceId(boundingBox);
        const trackedFace = this.trackedFaces.get(faceId);
        
        if (trackedFace) {
          // Apply smoothing to reduce jitter
          const smoothingFactor = 0.7; // Higher = smoother but slower response
          const lastBox = trackedFace.smoothedBox;
          
          boundingBox = {
            x: lastBox.x * smoothingFactor + boundingBox.x * (1 - smoothingFactor),
            y: lastBox.y * smoothingFactor + boundingBox.y * (1 - smoothingFactor),
            width: lastBox.width * smoothingFactor + boundingBox.width * (1 - smoothingFactor),
            height: lastBox.height * smoothingFactor + boundingBox.height * (1 - smoothingFactor),
          };
          
          trackedFace.smoothedBox = boundingBox;
          trackedFace.lastSeen = Date.now();
        }

        // Get landmarks for this face if available
        let landmarks: Point[] = [];
        if (faceMeshPredictions && faceMeshPredictions[i]) {
          const faceMeshResult = faceMeshPredictions[i];
          if (faceMeshResult.keypoints) {
            landmarks = faceMeshResult.keypoints.map((kp) => ({
              x: kp.x,
              y: kp.y,
            }));
            console.log('[FaceDetector] Extracted landmarks:', {
              count: landmarks.length,
              sample: landmarks[0],
              eyeLandmark33: landmarks[33],
              irisLandmark468: landmarks[468],
            });
          } else {
            console.warn('[FaceDetector] No keypoints in FaceMesh result');
          }
        } else {
          console.warn('[FaceDetector] No FaceMesh prediction for face', i);
        }

        const detectedFace: DetectedFace = {
          boundingBox,
          landmarks,
          confidence,
          id: faceId,
        };

        detectedFaces.push(detectedFace);
      }

      // Clean up old tracked faces (not seen for 2 seconds)
      const now = Date.now();
      for (const [id, tracked] of this.trackedFaces.entries()) {
        if (now - tracked.lastSeen > 2000) {
          this.trackedFaces.delete(id);
        }
      }

      // Create result with all faces
      const result: FaceDetectionResult = {
        faces: detectedFaces,
        faceCount: detectedFaces.length,
        // Legacy support - use first face as primary
        boundingBox: detectedFaces[0]?.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
        landmarks: detectedFaces[0]?.landmarks || [],
        confidence: detectedFaces[0]?.confidence || 0,
      };

      this.lastDetectionResult = result;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Face detection error:', errorMessage);
      
      // Return empty result on error
      const errorResult: FaceDetectionResult = {
        faces: [],
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        landmarks: [],
        confidence: 0,
        faceCount: 0,
      };
      this.lastDetectionResult = errorResult;
      return errorResult;
    }
  }

  /**
   * Assign a face ID based on proximity to previously tracked faces
   * @param boundingBox - Bounding box of the detected face
   * @returns Face ID for tracking
   */
  private assignFaceId(boundingBox: BoundingBox): number {
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    
    let closestId: number | null = null;
    let closestDistance = Infinity;
    const maxDistance = 100; // Maximum distance to consider same face

    // Find closest tracked face
    for (const [id, tracked] of this.trackedFaces.entries()) {
      const trackedCenterX = tracked.smoothedBox.x + tracked.smoothedBox.width / 2;
      const trackedCenterY = tracked.smoothedBox.y + tracked.smoothedBox.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(centerX - trackedCenterX, 2) + 
        Math.pow(centerY - trackedCenterY, 2)
      );

      if (distance < closestDistance && distance < maxDistance) {
        closestDistance = distance;
        closestId = id;
      }
    }

    // If close match found, use that ID
    if (closestId !== null) {
      return closestId;
    }

    // Otherwise, assign new ID
    const newId = this.nextFaceId++;
    this.trackedFaces.set(newId, {
      face: { boundingBox, landmarks: [], confidence: 0 },
      lastSeen: Date.now(),
      smoothedBox: boundingBox,
    });
    
    return newId;
  }

  /**
   * Check if multiple faces are detected in the frame
   * @returns True if more than one face is detected
   */
  public isMultipleFacesDetected(): boolean {
    return this.lastDetectionResult ? this.lastDetectionResult.faceCount > 1 : false;
  }

  /**
   * Get the last detection result without processing a new frame
   * @returns Last face detection result or null if no detection has been performed
   */
  public getLastDetectionResult(): FaceDetectionResult | null {
    return this.lastDetectionResult;
  }

  /**
   * Update detector configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<FaceDetectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   * @returns Current detector configuration
   */
  public getConfig(): FaceDetectorConfig {
    return { ...this.config };
  }

  /**
   * Reset frame counter and cached results
   */
  public reset(): void {
    this.frameCounter = 0;
    this.lastDetectionResult = null;
    this.trackedFaces.clear();
    this.nextFaceId = 0;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.blazeFaceModel = null;
    this.faceMeshModel = null;
    this.lastDetectionResult = null;
    this.frameCounter = 0;
    this.trackedFaces.clear();
    this.nextFaceId = 0;
  }
}

export const faceDetector = new FaceDetector();
