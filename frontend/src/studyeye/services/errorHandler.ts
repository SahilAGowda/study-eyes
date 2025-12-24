/**
 * ErrorHandler Service
 * 
 * Centralized error handling with retry logic, fallback mechanisms,
 * and user-friendly error messages.
 * 
 * Requirements: 1.5, 1.6, 1.7, 1.8
 */

export enum ErrorType {
  CAMERA_ACCESS = 'CAMERA_ACCESS',
  MICROPHONE_ACCESS = 'MICROPHONE_ACCESS',
  MODEL_LOADING = 'MODEL_LOADING',
  PROCESSING = 'PROCESSING',
  BROWSER_COMPATIBILITY = 'BROWSER_COMPATIBILITY',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL', // System cannot function
  HIGH = 'HIGH', // Major feature unavailable
  MEDIUM = 'MEDIUM', // Minor feature unavailable
  LOW = 'LOW', // Degraded performance
}

export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  troubleshooting: string[];
  canRetry: boolean;
  fallbackAvailable: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
}

/**
 * ErrorHandler manages errors and provides recovery mechanisms
 */
class ErrorHandler {
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 50;

  /**
   * Handle an error and return error info
   */
  public handleError(error: Error | unknown, context?: string): ErrorInfo {
    const errorInfo = this.classifyError(error, context);
    this.logError(errorInfo);
    return errorInfo;
  }

  /**
   * Classify error and generate error info
   */
  private classifyError(error: Error | unknown, context?: string): ErrorInfo {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    // Camera access errors
    if (
      lowerMessage.includes('camera') ||
      lowerMessage.includes('video') ||
      lowerMessage.includes('notallowederror') ||
      lowerMessage.includes('permission denied')
    ) {
      return {
        type: ErrorType.CAMERA_ACCESS,
        severity: ErrorSeverity.CRITICAL,
        message: errorMessage,
        userMessage: 'Unable to access camera',
        troubleshooting: [
          'Check if camera is connected and working',
          'Grant camera permission in browser settings',
          'Close other applications using the camera',
          'Try refreshing the page',
          'Check if camera is blocked by browser or system settings',
        ],
        canRetry: true,
        fallbackAvailable: false,
      };
    }

    // Microphone access errors
    if (
      lowerMessage.includes('microphone') ||
      lowerMessage.includes('audio') ||
      lowerMessage.includes('getusermedia')
    ) {
      return {
        type: ErrorType.MICROPHONE_ACCESS,
        severity: ErrorSeverity.HIGH,
        message: errorMessage,
        userMessage: 'Unable to access microphone',
        troubleshooting: [
          'Check if microphone is connected and working',
          'Grant microphone permission in browser settings',
          'Close other applications using the microphone',
          'Try refreshing the page',
        ],
        canRetry: true,
        fallbackAvailable: true, // Can work without audio
      };
    }

    // Model loading errors
    if (
      lowerMessage.includes('model') ||
      lowerMessage.includes('load') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('network')
    ) {
      return {
        type: ErrorType.MODEL_LOADING,
        severity: ErrorSeverity.CRITICAL,
        message: errorMessage,
        userMessage: 'Failed to load AI models',
        troubleshooting: [
          'Check your internet connection',
          'Try refreshing the page',
          'Clear browser cache and reload',
          'Check if firewall is blocking model downloads',
        ],
        canRetry: true,
        fallbackAvailable: false,
      };
    }

    // Browser compatibility errors
    if (
      lowerMessage.includes('not supported') ||
      lowerMessage.includes('webgl') ||
      lowerMessage.includes('tensorflow')
    ) {
      return {
        type: ErrorType.BROWSER_COMPATIBILITY,
        severity: ErrorSeverity.CRITICAL,
        message: errorMessage,
        userMessage: 'Browser not compatible',
        troubleshooting: [
          'Use a modern browser (Chrome, Edge, Firefox)',
          'Update your browser to the latest version',
          'Enable WebGL in browser settings',
          'Check if hardware acceleration is enabled',
        ],
        canRetry: false,
        fallbackAvailable: false,
      };
    }

    // Processing errors
    if (context === 'processing') {
      return {
        type: ErrorType.PROCESSING,
        severity: ErrorSeverity.MEDIUM,
        message: errorMessage,
        userMessage: 'Processing error occurred',
        troubleshooting: [
          'Try restarting the session',
          'Check if system resources are available',
          'Close other browser tabs to free up memory',
        ],
        canRetry: true,
        fallbackAvailable: true,
      };
    }

    // Unknown error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: errorMessage,
      userMessage: 'An unexpected error occurred',
      troubleshooting: [
        'Try refreshing the page',
        'Check browser console for details',
        'Contact support if problem persists',
      ],
      canRetry: true,
      fallbackAvailable: false,
    };
  }

  /**
   * Retry an async operation with exponential backoff
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error | unknown;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(
          `${operationName} failed (attempt ${attempt + 1}/${
            this.retryConfig.maxRetries + 1
          }):`,
          error
        );

        if (attempt < this.retryConfig.maxRetries) {
          await this.sleep(delay);
          delay = Math.min(
            delay * this.retryConfig.backoffMultiplier,
            this.retryConfig.maxDelay
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Check browser compatibility
   */
  public checkBrowserCompatibility(): {
    compatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      issues.push('getUserMedia API not supported');
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      issues.push('WebGL not supported');
    }

    // Check if running in secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      issues.push('Secure context (HTTPS) required for camera/microphone access');
    }

    // Check Web Audio API
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      issues.push('Web Audio API not supported');
    }

    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * Get browser info
   */
  public getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';

    if (ua.includes('Chrome')) browserName = 'Chrome';
    else if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Safari')) browserName = 'Safari';
    else if (ua.includes('Edge')) browserName = 'Edge';
    else if (ua.includes('Opera')) browserName = 'Opera';

    return browserName;
  }

  /**
   * Log error to internal log
   */
  private logError(errorInfo: ErrorInfo): void {
    this.errorLog.push(errorInfo);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }

  /**
   * Get error log
   */
  public getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Update retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Get retry configuration
   */
  public getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export class for custom instances
export default ErrorHandler;
