/**
 * Backend Emotion Service
 * 
 * Calls the backend CNN-based emotion classifier API for accurate emotion recognition.
 * The backend uses a model trained on the FER2013 Kaggle dataset.
 */

export interface BackendEmotionResult {
  primary_emotion: string;
  confidence: number;
  emotion_scores: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  };
  engagement_state: string;
  valence: number;
  arousal: number;
  timestamp: string;
  face_id?: string;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BatchEmotionResult {
  success: boolean;
  results: BackendEmotionResult[];
  total_faces: number;
  successful: number;
}

class BackendEmotionService {
  private apiBaseUrl: string;
  private isAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 10000; // 10 seconds (reduced from 30)
  private requestQueue: Map<string, Promise<BackendEmotionResult | null>> = new Map();
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 100; // Minimum 100ms between requests
  private healthCheckPromise: Promise<boolean> | null = null;
  private initializationAttempts: number = 0;

  constructor() {
    // Use environment variable or default to localhost:5000
    // Note: The emotion API is at /api/emotion, so base URL should NOT include /api
    this.apiBaseUrl = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    console.log(`[BackendEmotion] Initialized with API URL: ${this.apiBaseUrl}`);
    // Start health check immediately
    this.checkHealth();
  }

  /**
   * Check if the backend emotion API is available
   */
  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // If we already have a pending health check, return that promise
    if (this.healthCheckPromise) {
      return this.healthCheckPromise;
    }
    
    // Skip if we checked recently and service is available
    if (now - this.lastHealthCheck < this.healthCheckInterval && this.lastHealthCheck > 0 && this.isAvailable) {
      return this.isAvailable;
    }

    this.healthCheckPromise = this.doHealthCheck();
    const result = await this.healthCheckPromise;
    this.healthCheckPromise = null;
    return result;
  }
  
  private async doHealthCheck(): Promise<boolean> {
    this.initializationAttempts++;
    const now = Date.now();
    
    try {
      console.log(`[BackendEmotion] Health check attempt #${this.initializationAttempts} at ${this.apiBaseUrl}/api/emotion/health`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.apiBaseUrl}/api/emotion/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.model_loaded === true;
        console.log(`[BackendEmotion] ✅ Health check SUCCESS: model_loaded=${data.model_loaded}, status=${data.status}`);
        if (this.isAvailable) {
          console.log(`[BackendEmotion] 🎯 Backend CNN emotion service is READY for use!`);
        }
      } else {
        this.isAvailable = false;
        console.warn(`[BackendEmotion] ❌ Health check failed with status: ${response.status}`);
      }
    } catch (error: any) {
      this.isAvailable = false;
      if (error.name === 'AbortError') {
        console.warn('[BackendEmotion] ❌ Health check timed out');
      } else {
        console.warn('[BackendEmotion] ❌ Backend not available:', error.message || error);
      }
    }

    this.lastHealthCheck = now;
    return this.isAvailable;
  }

  /**
   * Check if the service is available (synchronous check)
   */
  isServiceAvailable(): boolean {
    // If not available yet, trigger a health check in background
    if (!this.isAvailable && !this.healthCheckPromise) {
      this.checkHealth();
    }
    return this.isAvailable;
  }
  
  /**
   * Wait for service to be available (with timeout)
   */
  async waitForAvailability(timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkHealth()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return false;
  }

  /**
   * Convert canvas/video element region to base64 image
   */
  private async extractFaceImage(
    source: HTMLVideoElement | HTMLCanvasElement,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Get source dimensions
    const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

    // Add padding around face (10%)
    const padding = Math.max(boundingBox.width, boundingBox.height) * 0.1;
    const x = Math.max(0, boundingBox.x - padding);
    const y = Math.max(0, boundingBox.y - padding);
    const width = Math.min(sourceWidth, boundingBox.width + padding * 2);
    const height = Math.min(sourceHeight, boundingBox.height + padding * 2);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(source, x, y, width, height, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Classify emotion for a single face
   */
  async classifyEmotion(
    source: HTMLVideoElement | HTMLCanvasElement,
    boundingBox: { x: number; y: number; width: number; height: number },
    faceId?: string
  ): Promise<BackendEmotionResult | null> {
    if (!this.isAvailable) {
      await this.checkHealth();
      if (!this.isAvailable) return null;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      return null;
    }
    this.lastRequestTime = now;

    // Check if we already have a pending request for this face
    const requestKey = faceId || `${boundingBox.x}-${boundingBox.y}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)!;
    }

    const requestPromise = this.doClassifyEmotion(source, boundingBox, faceId);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async doClassifyEmotion(
    source: HTMLVideoElement | HTMLCanvasElement,
    boundingBox: { x: number; y: number; width: number; height: number },
    faceId?: string
  ): Promise<BackendEmotionResult | null> {
    try {
      console.log(`[BackendEmotion] 📤 Sending face to backend for classification (faceId: ${faceId || 'unknown'})`);
      const imageBase64 = await this.extractFaceImage(source, boundingBox);

      const response = await fetch(`${this.apiBaseUrl}/api/emotion/classify-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          face_id: faceId || 'unknown',
        }),
      });

      if (!response.ok) {
        console.warn('[BackendEmotion] Classification failed:', response.status);
        return null;
      }

      const data = await response.json();
      if (data.success && data.result) {
        const result = this.normalizeResult(data.result);
        console.log(`[BackendEmotion] 📥 Backend response: ${result.primary_emotion} (${(result.confidence * 100).toFixed(1)}%), engagement: ${result.engagement_state}`);
        return result;
      }

      return null;
    } catch (error) {
      console.warn('[BackendEmotion] Classification error:', error);
      return null;
    }
  }

  /**
   * Classify emotions for multiple faces in batch
   */
  async classifyBatch(
    source: HTMLVideoElement | HTMLCanvasElement,
    faces: Array<{
      id: string;
      boundingBox: { x: number; y: number; width: number; height: number };
    }>
  ): Promise<Map<string, BackendEmotionResult>> {
    const results = new Map<string, BackendEmotionResult>();

    if (!this.isAvailable || faces.length === 0) {
      return results;
    }

    try {
      // Prepare batch request
      const facesData = await Promise.all(
        faces.map(async (face) => ({
          face_id: face.id,
          image_base64: await this.extractFaceImage(source, face.boundingBox),
          bounding_box: face.boundingBox,
        }))
      );

      const response = await fetch(`${this.apiBaseUrl}/api/emotion/batch-classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faces: facesData }),
      });

      if (!response.ok) {
        console.warn('[BackendEmotion] Batch classification failed:', response.status);
        return results;
      }

      const data: BatchEmotionResult = await response.json();
      if (data.success && data.results) {
        for (const result of data.results) {
          if (result.face_id && !('error' in result)) {
            results.set(result.face_id, this.normalizeResult(result));
          }
        }
      }
    } catch (error) {
      console.warn('[BackendEmotion] Batch classification error:', error);
    }

    return results;
  }

  /**
   * Normalize backend result to consistent format
   */
  private normalizeResult(result: any): BackendEmotionResult {
    return {
      primary_emotion: result.primary_emotion || 'neutral',
      confidence: result.confidence || 0.5,
      emotion_scores: result.emotion_scores || {
        angry: 0, disgust: 0, fear: 0, happy: 0, sad: 0, surprise: 0, neutral: 1,
      },
      engagement_state: result.engagement_state || 'focused',
      valence: result.valence || 0,
      arousal: result.arousal || 0.3,
      timestamp: result.timestamp || new Date().toISOString(),
      face_id: result.face_id,
      bounding_box: result.bounding_box,
    };
  }

  /**
   * Map backend emotion to frontend StudentEmotion format
   */
  mapToStudentEmotion(result: BackendEmotionResult): {
    valence: number;
    arousal: number;
    dominance: number;
    emotions: {
      neutral: number;
      engaged: number;
      confused: number;
      bored: number;
      frustrated: number;
      focused: number;
      drowsy: number;
    };
    primaryEmotion: string;
    confidence: number;
  } {
    // Map FER2013 emotions to engagement-focused emotions
    const scores = result.emotion_scores;
    
    // Direct mapping from FER2013 to engagement emotions
    // happy/surprise -> engaged (smiling = engaged)
    // neutral -> focused (neutral face = focused on work)
    // sad -> bored/drowsy
    // angry/disgust -> frustrated
    // fear -> confused
    
    const engaged = Math.min(1, scores.happy * 1.5 + scores.surprise * 0.8); // Boost happy detection
    const focused = scores.neutral * 0.9;
    const confused = scores.fear * 0.8 + scores.surprise * 0.2;
    const bored = scores.sad * 0.6;
    const frustrated = (scores.angry + scores.disgust) * 0.9;
    const drowsy = scores.sad * 0.4 + Math.max(0, (0.3 - result.arousal)) * 0.5; // Low arousal = drowsy
    const neutral = scores.neutral * 0.1; // Keep neutral low to prefer other emotions

    // Normalize scores to sum to 1
    const total = engaged + focused + confused + bored + frustrated + drowsy + neutral;
    const normalize = (v: number) => total > 0 ? v / total : 0;

    const emotions = {
      neutral: normalize(neutral),
      engaged: normalize(engaged),
      confused: normalize(confused),
      bored: normalize(bored),
      frustrated: normalize(frustrated),
      focused: normalize(focused),
      drowsy: normalize(drowsy),
    };

    // Determine primary emotion from normalized scores
    let primaryEmotion = 'neutral';
    let maxScore = 0;
    for (const [emotion, score] of Object.entries(emotions)) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }

    // CRITICAL: Direct override based on backend primary emotion
    // If backend detects "happy" with good confidence, force "engaged"
    if (result.primary_emotion === 'happy' && result.confidence > 0.3) {
      primaryEmotion = 'engaged';
      console.log(`[EmotionMap] Happy detected (${(result.confidence * 100).toFixed(1)}%) -> engaged`);
    } else if (result.primary_emotion === 'surprise' && result.confidence > 0.4) {
      primaryEmotion = 'engaged';
    } else if (result.primary_emotion === 'sad' && result.confidence > 0.4) {
      primaryEmotion = result.arousal < 0.3 ? 'drowsy' : 'bored';
    } else if ((result.primary_emotion === 'angry' || result.primary_emotion === 'disgust') && result.confidence > 0.4) {
      primaryEmotion = 'frustrated';
    } else if (result.primary_emotion === 'fear' && result.confidence > 0.4) {
      primaryEmotion = 'confused';
    } else if (result.primary_emotion === 'neutral' && result.confidence > 0.5) {
      primaryEmotion = 'focused';
    }

    console.log(`[EmotionMap] Backend: ${result.primary_emotion} (${(result.confidence * 100).toFixed(1)}%) -> Frontend: ${primaryEmotion}`);

    return {
      valence: result.valence,
      arousal: result.arousal,
      dominance: 0.5,
      emotions,
      primaryEmotion,
      confidence: result.confidence,
    };
  }

  /**
   * Reset the service (clear caches, re-check health)
   */
  reset(): void {
    this.requestQueue.clear();
    this.lastHealthCheck = 0;
    this.isAvailable = false;
  }
}

// Export singleton instance
export const backendEmotionService = new BackendEmotionService();
export default BackendEmotionService;
