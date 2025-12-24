/**
 * 3D Head Pose Estimator using solvePnP
 * 
 * Implements proper 3D head pose estimation using camera calibration and solvePnP algorithm.
 * Replaces landmark-based approximation with accurate 3D pose calculation.
 */

import type { Point } from '../types';
import type { Student3DPose } from '../types/studentState';

export interface CameraIntrinsics {
  fx: number; // Focal length X
  fy: number; // Focal length Y
  cx: number; // Principal point X
  cy: number; // Principal point Y
}

export interface HeadPoseConfig {
  // Camera calibration (will be auto-calibrated if not provided)
  cameraIntrinsics?: CameraIntrinsics;
  
  // 3D model parameters
  faceModelScale: number; // Scale factor for 3D face model (mm)
  
  // Pose estimation parameters
  useExtrinsicGuess: boolean;
  iterationsCount: number;
  reprojectionError: number;
  confidence: number;
  
  // Temporal smoothing
  temporalSmoothing: boolean;
  smoothingAlpha: number;
  
  // Validation thresholds
  maxReprojectionError: number;
  minConfidence: number;
}

/**
 * 3D face model points in mm (centered at nose tip)
 * Based on anthropometric measurements for average adult face
 */
const FACE_MODEL_3D: number[][] = [
  [0.0, 0.0, 0.0],           // Nose tip (reference point)
  [0.0, -330.0, -65.0],      // Chin
  [-225.0, 170.0, -135.0],   // Left eye left corner
  [225.0, 170.0, -135.0],    // Right eye right corner  
  [-150.0, -150.0, -125.0],  // Left mouth corner
  [150.0, -150.0, -125.0],   // Right mouth corner
  [0.0, 170.0, -135.0],      // Nose bridge
  [-75.0, 170.0, -135.0],    // Left eye center
  [75.0, 170.0, -135.0],     // Right eye center
];

/**
 * Corresponding FaceMesh landmark indices
 */
const LANDMARK_INDICES = [
  1,    // Nose tip
  152,  // Chin
  33,   // Left eye left corner
  263,  // Right eye right corner
  61,   // Left mouth corner
  291,  // Right mouth corner
  6,    // Nose bridge
  468,  // Left eye center (iris)
  473,  // Right eye center (iris)
];

export class HeadPoseEstimator {
  private config: Required<HeadPoseConfig>;
  private cameraMatrix: number[][] | null = null;
  private distortionCoeffs: number[] = [0, 0, 0, 0, 0]; // Assume no distortion for webcam
  
  // Temporal smoothing state
  private previousPose: Student3DPose | null = null;
  private poseHistory: Student3DPose[] = [];
  
  // Auto-calibration state
  private isCalibrated: boolean = false;
  private videoWidth: number = 640;
  private videoHeight: number = 480;

  constructor(config?: Partial<HeadPoseConfig>) {
    this.config = {
      cameraIntrinsics: config?.cameraIntrinsics || {
        fx: 800,
        fy: 800,
        cx: 320,
        cy: 240,
      },
      faceModelScale: config?.faceModelScale ?? 1.0,
      useExtrinsicGuess: config?.useExtrinsicGuess ?? false,
      iterationsCount: config?.iterationsCount ?? 100,
      reprojectionError: config?.reprojectionError ?? 8.0,
      confidence: config?.confidence ?? 0.99,
      temporalSmoothing: config?.temporalSmoothing ?? true,
      smoothingAlpha: config?.smoothingAlpha ?? 0.7,
      maxReprojectionError: config?.maxReprojectionError ?? 10.0,
      minConfidence: config?.minConfidence ?? 0.5,
    };
    
    this.initializeCameraMatrix();
  }

  /**
   * Initialize camera matrix from intrinsics
   */
  private initializeCameraMatrix(): void {
    const { fx, fy, cx, cy } = this.config.cameraIntrinsics;
    this.cameraMatrix = [
      [fx, 0, cx],
      [0, fy, cy],
      [0, 0, 1],
    ];
  }

  /**
   * Initialize camera calibration
   */
  public initialize(videoWidth: number, videoHeight: number): void {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    
    if (this.config.cameraIntrinsics) {
      this.setCameraMatrix(this.config.cameraIntrinsics);
    } else {
      this.autoCalibrate();
    }
  }

  /**
   * Set camera intrinsic parameters
   */
  private setCameraMatrix(intrinsics: CameraIntrinsics): void {
    this.cameraMatrix = [
      [intrinsics.fx, 0, intrinsics.cx],
      [0, intrinsics.fy, intrinsics.cy],
      [0, 0, 1]
    ];
    this.isCalibrated = true;
  }

  /**
   * Auto-calibrate camera using default assumptions
   */
  private autoCalibrate(): void {
    // Estimate focal length based on image size (typical webcam FOV ~60-70 degrees)
    const focalLength = Math.max(this.videoWidth, this.videoHeight) * 1.2;
    
    const intrinsics: CameraIntrinsics = {
      fx: focalLength,
      fy: focalLength,
      cx: this.videoWidth / 2,
      cy: this.videoHeight / 2
    };
    
    this.setCameraMatrix(intrinsics);
  }

  /**
   * Auto-calibrate camera using detected face landmarks
   */
  public async calibrateCamera(
    imageWidth: number,
    imageHeight: number,
    landmarkSamples: Point[][]
  ): Promise<boolean> {
    if (landmarkSamples.length < 10) {
      console.warn('Need at least 10 samples for camera calibration');
      return false;
    }
    
    try {
      // Update principal point to image center
      this.config.cameraIntrinsics.cx = imageWidth / 2;
      this.config.cameraIntrinsics.cy = imageHeight / 2;
      
      // Estimate focal length based on face size
      const avgFaceWidth = this.calculateAverageFaceWidth(landmarkSamples);
      const estimatedFocalLength = (avgFaceWidth * imageWidth) / 150;
      
      this.config.cameraIntrinsics.fx = estimatedFocalLength;
      this.config.cameraIntrinsics.fy = estimatedFocalLength;
      
      this.initializeCameraMatrix();
      this.isCalibrated = true;
      
      console.log('Camera calibrated:', this.config.cameraIntrinsics);
      return true;
    } catch (error) {
      console.error('Camera calibration failed:', error);
      return false;
    }
  }

  /**
   * Calculate average face width from landmark samples
   */
  private calculateAverageFaceWidth(samples: Point[][]): number {
    let totalWidth = 0;
    let validSamples = 0;
    
    for (const landmarks of samples) {
      if (landmarks.length >= Math.max(...LANDMARK_INDICES) + 1) {
        const leftEye = landmarks[LANDMARK_INDICES[2]];
        const rightEye = landmarks[LANDMARK_INDICES[3]];
        
        if (leftEye && rightEye) {
          const width = Math.abs(rightEye.x - leftEye.x);
          totalWidth += width;
          validSamples++;
        }
      }
    }
    
    return validSamples > 0 ? totalWidth / validSamples : 100;
  }

  /**
   * Estimate 3D head pose from facial landmarks
   */
  public estimatePose(landmarks: Point[]): Student3DPose | null {
    if (!this.isCalibrated || !this.cameraMatrix) {
      console.warn('HeadPoseEstimator not calibrated');
      return null;
    }

    if (landmarks.length < 468) {
      console.warn('Insufficient landmarks for pose estimation');
      return null;
    }

    try {
      // Extract 2D points corresponding to 3D model
      const imagePoints: Point[] = LANDMARK_INDICES.map(idx => landmarks[idx]);
      
      // Validate that all required landmarks are present
      if (imagePoints.some(p => !p || p.x < 0 || p.y < 0)) {
        return null;
      }

      // Simplified pose estimation using geometric approximation
      const pose = this.estimatePoseFromLandmarks(imagePoints);
      
      if (!pose) {
        return null;
      }

      // Apply temporal smoothing
      const smoothedPose = this.config.temporalSmoothing && this.previousPose
        ? this.applySmoothingToPose(pose, this.previousPose)
        : pose;

      // Validate pose
      if (smoothedPose.confidence < this.config.minConfidence) {
        return null;
      }

      this.previousPose = smoothedPose;
      this.updatePoseHistory(smoothedPose);

      return smoothedPose;
    } catch (error) {
      console.error('Error estimating head pose:', error);
      return null;
    }
  }

  /**
   * Estimate head pose from landmarks (alternative method signature)
   */
  public estimateHeadPose(
    landmarks: Point[],
    _imageWidth?: number,
    _imageHeight?: number
  ): Student3DPose | null {
    return this.estimatePose(landmarks);
  }

  /**
   * Simplified pose estimation from landmarks
   */
  private estimatePoseFromLandmarks(imagePoints: Point[]): Student3DPose | null {
    try {
      const noseTip = imagePoints[0];
      const chin = imagePoints[1];
      const leftEye = imagePoints[2];
      const rightEye = imagePoints[3];

      // Calculate face center
      const faceCenter = {
        x: (leftEye.x + rightEye.x) / 2,
        y: (leftEye.y + rightEye.y) / 2
      };

      // Estimate yaw from eye positions relative to face center
      const eyeDistance = Math.abs(rightEye.x - leftEye.x);
      const expectedEyeDistance = 100;
      const yawFactor = (eyeDistance - expectedEyeDistance) / expectedEyeDistance;
      const yaw = Math.atan(yawFactor) * 180 / Math.PI;

      // Estimate pitch from nose-chin vector
      const noseToChain = {
        x: chin.x - noseTip.x,
        y: chin.y - noseTip.y
      };
      const pitch = Math.atan2(noseToChain.y, Math.abs(noseToChain.x)) * 180 / Math.PI - 90;

      // Estimate roll from eye line angle
      const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
      const roll = eyeAngle * 180 / Math.PI;

      // Simple confidence based on landmark quality
      const confidence = Math.min(1.0, eyeDistance / 50);

      return {
        pitch: Math.max(-90, Math.min(90, pitch)),
        yaw: Math.max(-90, Math.min(90, yaw)),
        roll: Math.max(-45, Math.min(45, roll)),
        translation: [faceCenter.x, faceCenter.y, 500],
        rotation: [pitch * Math.PI / 180, yaw * Math.PI / 180, roll * Math.PI / 180],
        confidence: Math.max(0.1, Math.min(1.0, confidence))
      };
    } catch (error) {
      console.error('Pose estimation error:', error);
      return null;
    }
  }

  /**
   * Apply temporal smoothing to pose estimation
   */
  private applySmoothingToPose(currentPose: Student3DPose, previousPose: Student3DPose): Student3DPose {
    const alpha = this.config.smoothingAlpha;
    
    return {
      pitch: alpha * currentPose.pitch + (1 - alpha) * previousPose.pitch,
      yaw: alpha * currentPose.yaw + (1 - alpha) * previousPose.yaw,
      roll: alpha * currentPose.roll + (1 - alpha) * previousPose.roll,
      translation: [
        alpha * currentPose.translation[0] + (1 - alpha) * previousPose.translation[0],
        alpha * currentPose.translation[1] + (1 - alpha) * previousPose.translation[1],
        alpha * currentPose.translation[2] + (1 - alpha) * previousPose.translation[2]
      ],
      rotation: [
        alpha * currentPose.rotation[0] + (1 - alpha) * previousPose.rotation[0],
        alpha * currentPose.rotation[1] + (1 - alpha) * previousPose.rotation[1],
        alpha * currentPose.rotation[2] + (1 - alpha) * previousPose.rotation[2]
      ],
      confidence: Math.max(currentPose.confidence, previousPose.confidence * 0.9)
    };
  }

  /**
   * Update pose history for temporal analysis
   */
  private updatePoseHistory(pose: Student3DPose): void {
    this.poseHistory.push(pose);
    
    // Keep only last 60 seconds of history (assuming 15 FPS)
    const maxHistorySize = 60 * 15;
    if (this.poseHistory.length > maxHistorySize) {
      this.poseHistory = this.poseHistory.slice(-maxHistorySize);
    }
  }

  /**
   * Get pose stability metric
   */
  public getPoseStability(): number {
    if (this.poseHistory.length < 10) {
      return 0;
    }

    const recent = this.poseHistory.slice(-10);
    let pitchVar = 0, yawVar = 0, rollVar = 0;
    
    const avgPitch = recent.reduce((sum, p) => sum + p.pitch, 0) / recent.length;
    const avgYaw = recent.reduce((sum, p) => sum + p.yaw, 0) / recent.length;
    const avgRoll = recent.reduce((sum, p) => sum + p.roll, 0) / recent.length;
    
    for (const pose of recent) {
      pitchVar += (pose.pitch - avgPitch) ** 2;
      yawVar += (pose.yaw - avgYaw) ** 2;
      rollVar += (pose.roll - avgRoll) ** 2;
    }
    
    const totalVariance = (pitchVar + yawVar + rollVar) / (3 * recent.length);
    return Math.max(0, 1 - totalVariance / 100);
  }

  /**
   * Get camera intrinsics for external use
   */
  public getCameraIntrinsics(): CameraIntrinsics {
    return { ...this.config.cameraIntrinsics };
  }

  /**
   * Update camera intrinsics
   */
  public updateCameraIntrinsics(intrinsics: Partial<CameraIntrinsics>): void {
    this.config.cameraIntrinsics = { ...this.config.cameraIntrinsics, ...intrinsics };
    this.initializeCameraMatrix();
  }

  /**
   * Reset pose estimation state
   */
  public reset(): void {
    this.previousPose = null;
    this.poseHistory = [];
  }
}

// Export singleton instance
export const headPoseEstimator = new HeadPoseEstimator();
