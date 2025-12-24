/**
 * CameraManager Service
 * Handles webcam access, frame capture, and video stream management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

export interface CameraConfig {
  width?: number;
  height?: number;
  fps?: number;
  facingMode?: 'user' | 'environment';
}

export interface CameraError {
  type: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'UnknownError';
  message: string;
  userMessage: string;
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: CameraConfig;
  private isAnonymized: boolean = false;

  constructor(config: CameraConfig = {}) {
    this.config = {
      width: config.width || 640,
      height: config.height || 480,
      fps: config.fps || 15,
      facingMode: config.facingMode || 'user'
    };
  }

  /**
   * Initialize camera and request permissions
   * @returns Promise<MediaStream>
   */
  async initializeCamera(): Promise<MediaStream> {
    try {
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser');
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
          frameRate: { ideal: this.config.fps },
          facingMode: this.config.facingMode
        },
        audio: false // Camera manager only handles video
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create video element if not exists
      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
      }

      // Attach stream to video element
      this.videoElement.srcObject = this.stream;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (this.videoElement) {
          this.videoElement.onloadedmetadata = () => {
            this.videoElement!.play();
            resolve();
          };
        }
      });

      // Create canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width!;
      this.canvas.height = this.config.height!;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      console.log('✅ Camera initialized successfully');
      return this.stream;

    } catch (error: any) {
      const cameraError = this.handleCameraError(error);
      console.error('❌ Camera initialization failed:', cameraError);
      throw cameraError;
    }
  }

  /**
   * Stop camera and release resources
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.canvas = null;
    this.ctx = null;

    console.log('🛑 Camera stopped');
  }

  /**
   * Capture current frame from video stream
   * @returns ImageData
   */
  captureFrame(): ImageData | null {
    if (!this.videoElement || !this.canvas || !this.ctx) {
      console.warn('⚠️ Camera not initialized');
      return null;
    }

    try {
      // Draw current video frame to canvas
      this.ctx.drawImage(
        this.videoElement,
        0, 0,
        this.canvas.width,
        this.canvas.height
      );

      // Apply anonymization if enabled
      if (this.isAnonymized) {
        this.ctx.filter = 'blur(20px)';
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.filter = 'none';
      }

      // Get image data
      const imageData = this.ctx.getImageData(
        0, 0,
        this.canvas.width,
        this.canvas.height
      );

      return imageData;

    } catch (error) {
      console.error('❌ Frame capture failed:', error);
      return null;
    }
  }

  /**
   * Get video element for display
   * @returns HTMLVideoElement
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * Apply or remove anonymization (face blur)
   * @param enabled - Enable/disable anonymization
   */
  applyAnonymization(enabled: boolean): void {
    this.isAnonymized = enabled;
    console.log(`🔒 Anonymization ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if camera is active
   * @returns boolean
   */
  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }

  /**
   * Get camera capabilities
   * @returns MediaTrackCapabilities | null
   */
  getCapabilities(): MediaTrackCapabilities | null {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return null;

    return videoTrack.getCapabilities();
  }

  /**
   * Handle camera errors with user-friendly messages
   * @param error - Error object
   * @returns CameraError
   */
  private handleCameraError(error: any): CameraError {
    let cameraError: CameraError;

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      cameraError = {
        type: 'NotAllowedError',
        message: error.message,
        userMessage: 'Camera access denied. Please allow camera permissions in your browser settings and refresh the page.'
      };
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      cameraError = {
        type: 'NotFoundError',
        message: error.message,
        userMessage: 'No camera found. Please connect a webcam and try again.'
      };
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      cameraError = {
        type: 'NotReadableError',
        message: error.message,
        userMessage: 'Camera is already in use by another application. Please close other apps using the camera and try again.'
      };
    } else {
      cameraError = {
        type: 'UnknownError',
        message: error.message || 'Unknown camera error',
        userMessage: 'An unexpected error occurred while accessing the camera. Please try again or use a different browser.'
      };
    }

    return cameraError;
  }
}

export default CameraManager;
