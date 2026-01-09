import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Initialize TensorFlow.js backend
let tfInitialized = false;
const initTensorFlow = async () => {
  if (!tfInitialized) {
    try {
      // Try to use WebGL backend first (fastest)
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow.js initialized with WebGL backend');
      tfInitialized = true;
    } catch (error) {
      console.warn('WebGL backend failed, trying CPU backend:', error);
      try {
        // Fallback to CPU backend
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('TensorFlow.js initialized with CPU backend');
        tfInitialized = true;
      } catch (cpuError) {
        console.error('Failed to initialize TensorFlow.js:', cpuError);
        throw new Error('Failed to initialize TensorFlow.js backend');
      }
    }
  }
};

export interface ModelLoadProgress {
  model: 'blazeface' | 'facemesh' | 'coco-ssd';
  progress: number;
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}

export interface LoadedModels {
  blazeFace: blazeface.BlazeFaceModel | null;
  faceMesh: faceLandmarksDetection.FaceLandmarksDetector | null;
  cocoSsd: cocoSsd.ObjectDetection | null;
}

class ModelLoader {
  private models: LoadedModels = {
    blazeFace: null,
    faceMesh: null,
    cocoSsd: null,
  };

  private loadingPromises: Map<string, Promise<any>> = new Map();
  private progressCallbacks: Set<(progress: ModelLoadProgress) => void> = new Set();
  private dbName = 'studyeye-models';
  private dbVersion = 1;

  constructor() {
    this.initIndexedDB();
    // Initialize TensorFlow.js when ModelLoader is created
    initTensorFlow().catch(console.error);
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'name' });
        }
      };
    });
  }

  public onProgress(callback: (progress: ModelLoadProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  private notifyProgress(progress: ModelLoadProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  private async getCachedModel(modelName: string): Promise<any> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['models'], 'readonly');
        const store = transaction.objectStore('models');
        const request = store.get(modelName);

        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB cache read failed:', error);
      return null;
    }
  }

  private async cacheModel(modelName: string, data: any): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['models'], 'readwrite');
        const store = transaction.objectStore('models');
        const request = store.put({ name: modelName, data, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB cache write failed:', error);
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async loadBlazeFace(): Promise<blazeface.BlazeFaceModel> {
    if (this.models.blazeFace) {
      return this.models.blazeFace;
    }

    if (this.loadingPromises.has('blazeface')) {
      return this.loadingPromises.get('blazeface')!;
    }

    const loadPromise = this.loadBlazeFaceInternal();
    this.loadingPromises.set('blazeface', loadPromise);

    try {
      const model = await loadPromise;
      this.models.blazeFace = model;
      return model;
    } finally {
      this.loadingPromises.delete('blazeface');
    }
  }

  private async loadBlazeFaceInternal(): Promise<blazeface.BlazeFaceModel> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure TensorFlow.js is initialized
        await initTensorFlow();
        
        this.notifyProgress({
          model: 'blazeface',
          progress: 0,
          status: 'loading',
        });

        console.log(`[ModelLoader] Loading BlazeFace model (attempt ${attempt}/${maxRetries})...`);
        
        const model = await blazeface.load();

        this.notifyProgress({
          model: 'blazeface',
          progress: 100,
          status: 'loaded',
        });

        console.log('[ModelLoader] BlazeFace model loaded successfully');
        return model;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`[ModelLoader] BlazeFace load attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    const errorMessage = lastError?.message || 'Unknown error';
    this.notifyProgress({
      model: 'blazeface',
      progress: 0,
      status: 'error',
      error: errorMessage,
    });
    throw new Error(`Failed to load BlazeFace model after ${maxRetries} attempts: ${errorMessage}`);
  }

  public async loadFaceMesh(): Promise<faceLandmarksDetection.FaceLandmarksDetector> {
    if (this.models.faceMesh) {
      return this.models.faceMesh;
    }

    if (this.loadingPromises.has('facemesh')) {
      return this.loadingPromises.get('facemesh')!;
    }

    const loadPromise = this.loadFaceMeshInternal();
    this.loadingPromises.set('facemesh', loadPromise);

    try {
      const model = await loadPromise;
      this.models.faceMesh = model;
      return model;
    } finally {
      this.loadingPromises.delete('facemesh');
    }
  }

  private async loadFaceMeshInternal(): Promise<faceLandmarksDetection.FaceLandmarksDetector> {
    try {
      // Ensure TensorFlow.js is initialized
      await initTensorFlow();
      
      this.notifyProgress({
        model: 'facemesh',
        progress: 0,
        status: 'loading',
      });

      console.log('[ModelLoader] Loading FaceMesh with refineLandmarks...');

      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'mediapipe',
          refineLandmarks: true,
          maxFaces: 1,
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        }
      );

      console.log('[ModelLoader] FaceMesh loaded successfully');

      this.notifyProgress({
        model: 'facemesh',
        progress: 100,
        status: 'loaded',
      });

      return model;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[ModelLoader] FaceMesh loading failed:', errorMessage);
      this.notifyProgress({
        model: 'facemesh',
        progress: 0,
        status: 'error',
        error: errorMessage,
      });
      throw new Error(`Failed to load FaceMesh model: ${errorMessage}`);
    }
  }

  public async loadCocoSsd(): Promise<cocoSsd.ObjectDetection> {
    if (this.models.cocoSsd) {
      return this.models.cocoSsd;
    }

    if (this.loadingPromises.has('coco-ssd')) {
      return this.loadingPromises.get('coco-ssd')!;
    }

    const loadPromise = this.loadCocoSsdInternal();
    this.loadingPromises.set('coco-ssd', loadPromise);

    try {
      const model = await loadPromise;
      this.models.cocoSsd = model;
      return model;
    } finally {
      this.loadingPromises.delete('coco-ssd');
    }
  }

  private async loadCocoSsdInternal(): Promise<cocoSsd.ObjectDetection> {
    try {
      // Ensure TensorFlow.js is initialized
      await initTensorFlow();
      
      this.notifyProgress({
        model: 'coco-ssd',
        progress: 0,
        status: 'loading',
      });

      const model = await cocoSsd.load();

      this.notifyProgress({
        model: 'coco-ssd',
        progress: 100,
        status: 'loaded',
      });

      return model;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.notifyProgress({
        model: 'coco-ssd',
        progress: 0,
        status: 'error',
        error: errorMessage,
      });
      throw new Error(`Failed to load COCO-SSD model: ${errorMessage}`);
    }
  }

  public async loadAllModels(): Promise<LoadedModels> {
    await Promise.all([
      this.loadBlazeFace(),
      this.loadFaceMesh(),
      this.loadCocoSsd(),
    ]);

    return this.models;
  }

  public getModels(): LoadedModels {
    return this.models;
  }

  public isAllModelsLoaded(): boolean {
    return !!(
      this.models.blazeFace &&
      this.models.faceMesh &&
      this.models.cocoSsd
    );
  }

  public async dispose(): Promise<void> {
    if (this.models.blazeFace) {
      // BlazeFace doesn't have a dispose method, but we can clear the reference
      this.models.blazeFace = null;
    }
    if (this.models.faceMesh) {
      this.models.faceMesh.dispose();
      this.models.faceMesh = null;
    }
    if (this.models.cocoSsd) {
      this.models.cocoSsd.dispose();
      this.models.cocoSsd = null;
    }
  }
}

export const modelLoader = new ModelLoader();
