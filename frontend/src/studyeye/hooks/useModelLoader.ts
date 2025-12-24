import { useState, useEffect, useCallback } from 'react';
import { modelLoader, ModelLoadProgress, LoadedModels } from '../services/modelLoader';

export interface UseModelLoaderResult {
  models: LoadedModels;
  isLoading: boolean;
  isLoaded: boolean;
  progress: ModelLoadProgress[];
  error: string | null;
  loadModels: () => Promise<void>;
  dispose: () => Promise<void>;
}

export function useModelLoader(autoLoad: boolean = false): UseModelLoaderResult {
  const [models, setModels] = useState<LoadedModels>({
    blazeFace: null,
    faceMesh: null,
    cocoSsd: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<ModelLoadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((progressUpdate: ModelLoadProgress) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.model === progressUpdate.model);
      if (existing) {
        return prev.map((p) =>
          p.model === progressUpdate.model ? progressUpdate : p
        );
      }
      return [...prev, progressUpdate];
    });

    if (progressUpdate.status === 'error') {
      setError(progressUpdate.error || 'Unknown error occurred');
    }
  }, []);

  const loadModels = useCallback(async () => {
    if (isLoading || isLoaded) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress([]);

    try {
      const loadedModels = await modelLoader.loadAllModels();
      setModels(loadedModels);
      setIsLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      setError(errorMessage);
      console.error('Model loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isLoaded]);

  const dispose = useCallback(async () => {
    await modelLoader.dispose();
    setModels({
      blazeFace: null,
      faceMesh: null,
      cocoSsd: null,
    });
    setIsLoaded(false);
    setProgress([]);
  }, []);

  useEffect(() => {
    const unsubscribe = modelLoader.onProgress(handleProgress);
    return unsubscribe;
  }, [handleProgress]);

  useEffect(() => {
    if (autoLoad && !isLoading && !isLoaded) {
      loadModels();
    }
  }, [autoLoad, isLoading, isLoaded, loadModels]);

  return {
    models,
    isLoading,
    isLoaded,
    progress,
    error,
    loadModels,
    dispose,
  };
}
