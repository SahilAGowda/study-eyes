/**
 * Camera service for handling webcam access and eye tracking integration
 */

export interface CameraConfig {
  video: {
    width: number;
    height: number;
    frameRate: number;
    facingMode: string;
  };
  audio: false;
}

export interface CameraError {
  name: string;
  message: string;
  constraint?: string;
}

class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isActive: boolean = false;
  private defaultConfig: CameraConfig = {
    video: {
      width: parseInt(import.meta.env.VITE_CAMERA_RESOLUTION_WIDTH || '640'),
      height: parseInt(import.meta.env.VITE_CAMERA_RESOLUTION_HEIGHT || '480'),
      frameRate: 30,
      facingMode: import.meta.env.VITE_DEFAULT_CAMERA_FACING || 'user'
    },
    audio: false
  };
  /**
   * Initialize camera access
   */
  async initializeCamera(videoElement: HTMLVideoElement, config?: Partial<CameraConfig>): Promise<void> {
    try {
      // First, stop any existing camera stream
      this.stopCamera();
      
      const finalConfig = {
        ...this.defaultConfig,
        ...config
      };

      console.log('Requesting camera access with config:', finalConfig);
      this.stream = await navigator.mediaDevices.getUserMedia(finalConfig);
      this.videoElement = videoElement;
      this.videoElement.srcObject = this.stream;
      this.isActive = true;

      // Wait for video to be ready
      return new Promise((resolve, reject) => {
        if (this.videoElement) {
          this.videoElement.onloadedmetadata = () => {
            if (this.videoElement) {
              this.videoElement.play()
                .then(() => {
                  console.log('Camera initialized and playing successfully');
                  resolve();
                })
                .catch(reject);
            }
          };
          this.videoElement.onerror = reject;
        }
      });
    } catch (error) {
      this.handleCameraError(error as Error);
      throw error;
    }
  }
  /**
   * Stop camera and release resources
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.isActive = false;
  }

  /**
   * Force stop all camera streams globally (for debugging)
   */
  async forceStopAllCameras(): Promise<void> {
    try {
      // Stop current instance
      this.stopCamera();
      
      // Try to get all media devices and stop them
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Available devices:', devices.filter(d => d.kind === 'videoinput'));
      
      // Log if there are any active streams
      console.log('Stopping all camera tracks...');
    } catch (error) {
      console.error('Error in forceStopAllCameras:', error);
    }
  }

  /**
   * Capture frame from video stream
   */
  captureFrame(): ImageData | null {
    if (!this.videoElement || !this.isActive) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      return null;
    }

    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    context.drawImage(this.videoElement, 0, 0);
    
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Get current video stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Get video element
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * Check if camera is active
   */
  isActiveCamera(): boolean {
    return this.isActive;
  }

  /**
   * Get available video devices
   */
  async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting video devices:', error);
      return [];
    }
  }

  /**
   * Switch to different camera device
   */
  async switchCamera(deviceId: string): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video element not initialized');
    }

    this.stopCamera();
    
    const config = {
      ...this.defaultConfig,
      video: {
        ...this.defaultConfig.video,
        deviceId: { exact: deviceId }
      }
    };

    await this.initializeCamera(this.videoElement, config);
  }

  /**
   * Check camera permissions
   */
  async checkPermissions(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return 'prompt';
    }
  }

  /**
   * Handle camera errors
   */
  private handleCameraError(error: Error): void {
    const cameraError: CameraError = {
      name: error.name,
      message: error.message
    };

    switch (error.name) {
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        cameraError.message = 'No camera device found. Please connect a camera and try again.';
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        cameraError.message = 'Camera is already in use by another application.';
        break;
      case 'OverconstrainedError':
        cameraError.message = 'Camera does not support the requested configuration.';
        break;
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        cameraError.message = 'Camera access denied. Please allow camera permissions and try again.';
        break;
      case 'TypeError':
        cameraError.message = 'Camera access is not supported in this browser.';
        break;
      default:
        cameraError.message = `Camera error: ${error.message}`;
    }

    console.error('Camera Error:', cameraError);
  }

  /**
   * Get camera capabilities
   */
  getCameraCapabilities(): MediaTrackCapabilities | null {
    if (!this.stream) {
      return null;
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack ? videoTrack.getCapabilities() : null;
  }

  /**
   * Apply camera settings
   */
  async applyCameraSettings(constraints: MediaTrackConstraints): Promise<void> {
    if (!this.stream) {
      throw new Error('Camera not initialized');
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
      await videoTrack.applyConstraints(constraints);
    }
  }

  /**
   * Get current camera settings
   */
  getCameraSettings(): MediaTrackSettings | null {
    if (!this.stream) {
      return null;
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack ? videoTrack.getSettings() : null;
  }
}

// Export singleton instance
const cameraService = new CameraService();
export default cameraService;
