/**
 * PerformanceMonitor Service
 * 
 * Monitors system performance and provides automatic optimization.
 * Tracks FPS, memory usage, and processing times.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

export interface PerformanceMetrics {
  fps: number;
  avgFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  droppedFrames: number;
  memoryUsage?: number; // MB
  cpuUsage?: number; // Percentage (if available)
}

export interface PerformanceConfig {
  targetFPS: number;
  minFPS: number;
  maxFrameTime: number; // ms
  enableAutoOptimization: boolean;
  enableMemoryMonitoring: boolean;
}

/**
 * PerformanceMonitor tracks and optimizes system performance
 */
class PerformanceMonitor {
  private config: PerformanceConfig = {
    targetFPS: 15,
    minFPS: 10,
    maxFrameTime: 200,
    enableAutoOptimization: true,
    enableMemoryMonitoring: true,
  };

  private metrics: PerformanceMetrics = {
    fps: 0,
    avgFrameTime: 0,
    maxFrameTime: 0,
    minFrameTime: Infinity,
    droppedFrames: 0,
  };

  private frameTimes: number[] = [];
  private frameTimesWindow = 60; // Track last 60 frames
  private lastFrameTimestamp = 0;
  private frameCount = 0;
  private isMonitoring = false;

  private optimizationCallback: ((shouldOptimize: boolean) => void) | null = null;

  /**
   * Start performance monitoring
   */
  public start(): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.reset();
    this.lastFrameTimestamp = performance.now();

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public stop(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * Record a frame processing time
   */
  public recordFrame(frameTime: number): void {
    if (!this.isMonitoring) return;

    this.frameCount++;
    this.frameTimes.push(frameTime);

    // Keep only recent frames
    if (this.frameTimes.length > this.frameTimesWindow) {
      this.frameTimes.shift();
    }

    // Update metrics
    this.updateMetrics();

    // Check if optimization needed
    if (this.config.enableAutoOptimization) {
      this.checkOptimization();
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    if (this.frameTimes.length === 0) return;

    // Calculate average frame time
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgFrameTime = sum / this.frameTimes.length;

    // Calculate max and min
    this.metrics.maxFrameTime = Math.max(...this.frameTimes);
    this.metrics.minFrameTime = Math.min(...this.frameTimes);

    // Calculate FPS
    this.metrics.fps = this.metrics.avgFrameTime > 0
      ? Math.round(1000 / this.metrics.avgFrameTime)
      : 0;

    // Count dropped frames (frames that took longer than target)
    const targetFrameTime = 1000 / this.config.targetFPS;
    this.metrics.droppedFrames = this.frameTimes.filter(
      (t) => t > targetFrameTime
    ).length;

    // Memory monitoring (if available)
    if (this.config.enableMemoryMonitoring && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(
        memory.usedJSHeapSize / 1024 / 1024
      );
    }
  }

  /**
   * Check if optimization is needed
   */
  private checkOptimization(): void {
    const needsOptimization =
      this.metrics.fps < this.config.minFPS ||
      this.metrics.avgFrameTime > this.config.maxFrameTime;

    if (needsOptimization && this.optimizationCallback) {
      this.optimizationCallback(true);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary as string
   */
  public getSummary(): string {
    return `FPS: ${this.metrics.fps} | Avg: ${this.metrics.avgFrameTime.toFixed(
      1
    )}ms | Max: ${this.metrics.maxFrameTime.toFixed(1)}ms | Dropped: ${
      this.metrics.droppedFrames
    }`;
  }

  /**
   * Check if performance is acceptable
   */
  public isPerformanceAcceptable(): boolean {
    return (
      this.metrics.fps >= this.config.minFPS &&
      this.metrics.avgFrameTime <= this.config.maxFrameTime
    );
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < this.config.minFPS) {
      recommendations.push(
        `FPS is below target (${this.metrics.fps} < ${this.config.minFPS}). Consider reducing resolution or frame rate.`
      );
    }

    if (this.metrics.avgFrameTime > this.config.maxFrameTime) {
      recommendations.push(
        `Average frame time is too high (${this.metrics.avgFrameTime.toFixed(
          1
        )}ms > ${this.config.maxFrameTime}ms). Consider frame skipping.`
      );
    }

    if (this.metrics.droppedFrames > this.frameTimesWindow * 0.3) {
      recommendations.push(
        `High number of dropped frames (${this.metrics.droppedFrames}/${this.frameTimesWindow}). System may be overloaded.`
      );
    }

    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 500) {
      recommendations.push(
        `High memory usage (${this.metrics.memoryUsage}MB). Consider memory cleanup.`
      );
    }

    return recommendations;
  }

  /**
   * Register callback for optimization events
   */
  public onOptimizationNeeded(
    callback: (shouldOptimize: boolean) => void
  ): () => void {
    this.optimizationCallback = callback;
    return () => {
      this.optimizationCallback = null;
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity,
      droppedFrames: 0,
    };
    this.frameTimes = [];
    this.frameCount = 0;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for custom instances
export default PerformanceMonitor;
