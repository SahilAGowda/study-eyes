/**
 * AudioAnalyzer Service
 * 
 * Analyzes microphone input to detect speech activity using Web Audio API.
 * Implements FFT-based energy analysis and frequency pattern detection.
 * Includes teacher voice enrollment and speaker verification.
 * Privacy-compliant: No speech-to-text, no recording, no persistent storage.
 */

import type { AudioData, AudioAnalyzerConfig, VoiceProfile, VoiceEnrollmentProgress, AudioEventType } from '../types';

export type { AudioData, AudioAnalyzerConfig, VoiceProfile, VoiceEnrollmentProgress, AudioEventType };

const DEFAULT_CONFIG: Required<AudioAnalyzerConfig> = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  speechEnergyThreshold: 0.02, // Slightly higher threshold for better accuracy
  speechFrequencyRange: { min: 300, max: 3400 }, // Human speech frequency range (Hz)
  updateInterval: 100, // Update every 100ms
  voiceVerificationEnabled: false,
  voiceSimilarityThreshold: 0.55, // Balanced threshold for matching
};

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private floatTimeDomainData: Float32Array | null = null;
  
  private config: Required<AudioAnalyzerConfig>;
  private ambientNoiseBaseline: number = 0;
  private ambientNoiseSamples: number[] = [];
  private calibrating: boolean = true;
  private calibrationSamples: number = 0;
  private readonly CALIBRATION_DURATION = 20; // 20 samples (~2 seconds at 100ms intervals) - faster calibration
  
  // Voice verification properties
  private teacherVoiceProfile: VoiceProfile | null = null;
  private enrollmentInProgress: boolean = false;
  private enrollmentSamples: Float32Array[] = [];
  private enrollmentStartTime: number = 0;
  private enrollmentDuration: number = 0;
  private readonly ENROLLMENT_DURATION_MS = 12000; // 12 seconds
  private readonly MIN_ENROLLMENT_SAMPLES = 30; // Require more samples for better profile
  private speakerSimilarityHistory: number[] = []; // For temporal smoothing
  private readonly SIMILARITY_HISTORY_SIZE = 15; // 1.5 seconds at 100ms intervals
  
  private updateIntervalId: number | null = null;
  private currentAudioData: AudioData = {
    isSpeaking: false,
    audioLevel: 0,
    speechConfidence: 0,
    ambientNoiseLevel: 0,
  };
  
  private eventCallbacks: Map<AudioEventType, ((data: any) => void)[]> = new Map();

  constructor(config: AudioAnalyzerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize audio context and microphone access
   */
  async initializeAudio(existingStream?: MediaStream): Promise<MediaStream> {
    try {
      // Use existing stream or request microphone access
      if (existingStream) {
        this.mediaStream = existingStream;
        console.log('Using existing audio stream');
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false, // We want raw audio levels
          },
        });
        console.log('Requested new audio stream');
      }

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      // Initialize data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);
      this.floatTimeDomainData = new Float32Array(this.analyser.fftSize);

      // Start ambient noise calibration
      this.startCalibration();

      // Start periodic analysis
      this.startAnalysis();

      return this.mediaStream;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  /**
   * Start ambient noise calibration
   */
  private startCalibration(): void {
    this.calibrating = true;
    this.calibrationSamples = 0;
    this.ambientNoiseSamples = [];
  }

  /**
   * Start periodic audio analysis
   */
  private startAnalysis(): void {
    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId);
    }

    this.updateIntervalId = window.setInterval(() => {
      this.analyzeAudio();
    }, this.config.updateInterval);
  }

  /**
   * Start teacher voice enrollment
   * Records teacher's voice for the specified duration and creates a voice profile
   */
  public async enrollTeacherVoice(durationSeconds: number = 12): Promise<VoiceProfile> {
    if (!this.isInitialized()) {
      throw new Error('Audio analyzer not initialized');
    }

    if (this.enrollmentInProgress) {
      throw new Error('Enrollment already in progress');
    }

    this.enrollmentInProgress = true;
    this.enrollmentSamples = [];
    this.enrollmentStartTime = Date.now();
    this.enrollmentDuration = durationSeconds * 1000;

    console.log(`Starting teacher voice enrollment for ${durationSeconds} seconds...`);

    return new Promise((resolve, reject) => {
      const checkEnrollment = setInterval(() => {
        const elapsed = Date.now() - this.enrollmentStartTime;
        
        if (elapsed >= this.enrollmentDuration) {
          clearInterval(checkEnrollment);
          
          if (this.enrollmentSamples.length < this.MIN_ENROLLMENT_SAMPLES) {
            this.enrollmentInProgress = false;
            reject(new Error(`Insufficient speech samples. Please speak continuously during enrollment. Got ${this.enrollmentSamples.length}, need ${this.MIN_ENROLLMENT_SAMPLES}`));
            return;
          }

          try {
            this.teacherVoiceProfile = this.createVoiceProfile(this.enrollmentSamples, durationSeconds);
            this.enrollmentInProgress = false;
            this.enrollmentSamples = [];
            console.log('Teacher voice enrollment complete:', this.teacherVoiceProfile);
            resolve(this.teacherVoiceProfile);
          } catch (error) {
            this.enrollmentInProgress = false;
            reject(error);
          }
        }
      }, 100);
    });
  }

  /**
   * Get enrollment progress
   */
  public getEnrollmentProgress(): VoiceEnrollmentProgress {
    if (!this.enrollmentInProgress) {
      return {
        isEnrolling: false,
        progress: 0,
        remainingSeconds: 0,
        samplesCollected: 0,
        requiredSamples: this.MIN_ENROLLMENT_SAMPLES,
      };
    }

    const elapsed = Date.now() - this.enrollmentStartTime;
    const progress = Math.min(elapsed / this.enrollmentDuration, 1);
    const remainingSeconds = Math.max(0, (this.enrollmentDuration - elapsed) / 1000);

    return {
      isEnrolling: true,
      progress,
      remainingSeconds,
      samplesCollected: this.enrollmentSamples.length,
      requiredSamples: this.MIN_ENROLLMENT_SAMPLES,
    };
  }

  /**
   * Create voice profile from collected audio samples
   */
  private createVoiceProfile(samples: Float32Array[], durationSeconds: number): VoiceProfile {
    // Extract features from all samples
    const pitchValues: number[] = [];
    const mfccValues: number[][] = [];
    const spectralCentroids: number[] = [];
    const zcrValues: number[] = [];

    for (const sample of samples) {
      const pitch = this.extractPitch(sample);
      if (pitch > 0) {
        pitchValues.push(pitch);
      }

      const mfcc = this.extractMFCC(sample);
      mfccValues.push(mfcc);

      const centroid = this.calculateSpectralCentroid(sample);
      spectralCentroids.push(centroid);

      const zcr = this.calculateZeroCrossingRate(sample);
      zcrValues.push(zcr);
    }

    // Calculate statistics
    const pitchMean = this.calculateMean(pitchValues);
    const pitchStd = this.calculateStdDev(pitchValues, pitchMean);
    const mfcc = this.averageMFCC(mfccValues);
    const spectralCentroid = this.calculateMean(spectralCentroids);
    const zeroCrossingRate = this.calculateMean(zcrValues);
    const formants = this.extractFormants(samples);

    return {
      pitchMean,
      pitchStd,
      mfcc,
      spectralCentroid,
      zeroCrossingRate,
      formants,
      enrollmentDuration: durationSeconds,
      timestamp: Date.now(),
    };
  }

  /**
   * Compare current audio against teacher voice profile
   * Returns similarity score (0-1)
   */
  private compareVoiceProfile(audioSample: Float32Array): number {
    if (!this.teacherVoiceProfile) {
      return 0;
    }

    // Extract features from current sample
    const currentPitch = this.extractPitch(audioSample);
    const currentMFCC = this.extractMFCC(audioSample);
    const currentCentroid = this.calculateSpectralCentroid(audioSample);
    const currentZCR = this.calculateZeroCrossingRate(audioSample);

    // Calculate similarity for each feature
    const pitchSimilarity = this.calculatePitchSimilarity(
      currentPitch,
      this.teacherVoiceProfile.pitchMean,
      this.teacherVoiceProfile.pitchStd
    );

    const mfccSimilarity = this.calculateMFCCSimilarity(
      currentMFCC,
      this.teacherVoiceProfile.mfcc
    );

    const centroidSimilarity = this.calculateFeatureSimilarity(
      currentCentroid,
      this.teacherVoiceProfile.spectralCentroid,
      1000 // tolerance in Hz
    );

    const zcrSimilarity = this.calculateFeatureSimilarity(
      currentZCR,
      this.teacherVoiceProfile.zeroCrossingRate,
      0.1 // tolerance
    );

    // Weighted combination of similarities
    const similarity = (
      pitchSimilarity * 0.35 +
      mfccSimilarity * 0.40 +
      centroidSimilarity * 0.15 +
      zcrSimilarity * 0.10
    );

    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Check if current speaker is the enrolled teacher
   */
  public isTeacherSpeaking(): boolean {
    if (!this.config.voiceVerificationEnabled || !this.teacherVoiceProfile) {
      return false;
    }

    if (!this.currentAudioData.isSpeaking) {
      return false;
    }

    const similarity = this.currentAudioData.speakerSimilarity || 0;
    return similarity >= this.config.voiceSimilarityThreshold;
  }

  /**
   * Extract pitch (fundamental frequency) using autocorrelation
   */
  private extractPitch(audioData: Float32Array): number {
    const sampleRate = this.audioContext?.sampleRate || 48000;
    const minFreq = 85; // Minimum human voice frequency
    const maxFreq = 255; // Maximum fundamental frequency for voice
    
    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.ceil(sampleRate / minFreq);

    let bestCorrelation = 0;
    let bestPeriod = 0;

    // Autocorrelation
    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod === 0) {
      return 0;
    }

    return sampleRate / bestPeriod;
  }

  /**
   * Extract MFCC (Mel-Frequency Cepstral Coefficients)
   * Simplified implementation - returns 13 coefficients
   */
  private extractMFCC(audioData: Float32Array): number[] {
    if (!this.frequencyData) {
      return new Array(13).fill(0);
    }

    // Convert frequency data to mel scale
    const melBands = 26;
    const melSpectrum = this.frequencyToMelScale(this.frequencyData, melBands);
    
    // Apply DCT (Discrete Cosine Transform) to get cepstral coefficients
    const mfcc: number[] = [];
    for (let i = 0; i < 13; i++) {
      let sum = 0;
      for (let j = 0; j < melBands; j++) {
        sum += melSpectrum[j] * Math.cos((Math.PI * i * (j + 0.5)) / melBands);
      }
      mfcc.push(sum);
    }

    return mfcc;
  }

  /**
   * Convert frequency spectrum to mel scale
   */
  private frequencyToMelScale(frequencyData: Uint8Array, numBands: number): number[] {
    const melBands = new Array(numBands).fill(0);
    const bandSize = Math.floor(frequencyData.length / numBands);

    for (let i = 0; i < numBands; i++) {
      let sum = 0;
      const start = i * bandSize;
      const end = Math.min(start + bandSize, frequencyData.length);
      
      for (let j = start; j < end; j++) {
        // Convert to mel scale: mel = 2595 * log10(1 + f/700)
        const frequency = (j / frequencyData.length) * (this.audioContext?.sampleRate || 48000) / 2;
        const mel = 2595 * Math.log10(1 + frequency / 700);
        sum += frequencyData[j] * mel;
      }
      
      melBands[i] = sum / bandSize;
    }

    return melBands;
  }

  /**
   * Calculate spectral centroid (brightness of sound)
   */
  private calculateSpectralCentroid(audioData: Float32Array): number {
    if (!this.frequencyData || !this.audioContext) {
      return 0;
    }

    let weightedSum = 0;
    let sum = 0;
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.frequencyData.length;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const frequency = i * binWidth;
      const magnitude = this.frequencyData[i];
      weightedSum += frequency * magnitude;
      sum += magnitude;
    }

    return sum > 0 ? weightedSum / sum : 0;
  }

  /**
   * Calculate zero-crossing rate (rate at which signal changes sign)
   */
  private calculateZeroCrossingRate(audioData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0 && audioData[i - 1] < 0) || 
          (audioData[i] < 0 && audioData[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / audioData.length;
  }

  /**
   * Extract formant frequencies (resonant frequencies of vocal tract)
   */
  private extractFormants(samples: Float32Array[]): number[] {
    // Simplified formant extraction - returns typical ranges for first 3 formants
    // In production, would use LPC (Linear Predictive Coding) analysis
    if (!this.frequencyData || !this.audioContext) {
      return [700, 1220, 2600]; // Typical neutral vowel formants
    }

    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.frequencyData.length;
    
    // Find peaks in frequency spectrum for formants
    const formants: number[] = [];
    const formantRanges = [
      { min: 200, max: 1000 },   // F1
      { min: 800, max: 2500 },   // F2
      { min: 1500, max: 4000 },  // F3
    ];

    for (const range of formantRanges) {
      const minBin = Math.floor(range.min / binWidth);
      const maxBin = Math.ceil(range.max / binWidth);
      
      let maxMagnitude = 0;
      let peakBin = minBin;
      
      for (let i = minBin; i < maxBin && i < this.frequencyData.length; i++) {
        if (this.frequencyData[i] > maxMagnitude) {
          maxMagnitude = this.frequencyData[i];
          peakBin = i;
        }
      }
      
      formants.push(peakBin * binWidth);
    }

    return formants;
  }

  /**
   * Calculate pitch similarity
   */
  private calculatePitchSimilarity(currentPitch: number, meanPitch: number, stdPitch: number): number {
    if (currentPitch === 0 || meanPitch === 0) {
      return 0;
    }

    // Calculate how many standard deviations away from mean
    const zScore = Math.abs(currentPitch - meanPitch) / (stdPitch + 1);
    
    // Convert to similarity score (closer = higher similarity)
    return Math.exp(-zScore * zScore / 2);
  }

  /**
   * Calculate MFCC similarity using cosine similarity
   */
  private calculateMFCCSimilarity(mfcc1: number[], mfcc2: number[]): number {
    if (mfcc1.length !== mfcc2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < mfcc1.length; i++) {
      dotProduct += mfcc1[i] * mfcc2[i];
      norm1 += mfcc1[i] * mfcc1[i];
      norm2 += mfcc2[i] * mfcc2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) {
      return 0;
    }

    // Convert cosine similarity (-1 to 1) to 0-1 range
    const cosineSimilarity = dotProduct / denominator;
    return (cosineSimilarity + 1) / 2;
  }

  /**
   * Calculate feature similarity with tolerance
   */
  private calculateFeatureSimilarity(value1: number, value2: number, tolerance: number): number {
    const difference = Math.abs(value1 - value2);
    return Math.max(0, 1 - difference / tolerance);
  }

  /**
   * Average MFCC coefficients across multiple samples
   */
  private averageMFCC(mfccSamples: number[][]): number[] {
    if (mfccSamples.length === 0) {
      return new Array(13).fill(0);
    }

    const numCoeffs = mfccSamples[0].length;
    const averaged = new Array(numCoeffs).fill(0);

    for (const mfcc of mfccSamples) {
      for (let i = 0; i < numCoeffs; i++) {
        averaged[i] += mfcc[i];
      }
    }

    return averaged.map(val => val / mfccSamples.length);
  }

  /**
   * Calculate mean of array
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Distinguish between speech and noise
   */
  private isSpeechNotNoise(audioData: Float32Array): boolean {
    if (!this.frequencyData || !this.audioContext) {
      return true; // Default to true if we can't analyze
    }

    // Check for voice harmonics in fundamental frequency range (85-255 Hz)
    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / this.frequencyData.length;
    
    const f0MinBin = Math.floor(85 / binWidth);
    const f0MaxBin = Math.ceil(255 / binWidth);
    
    let harmonicEnergy = 0;
    for (let i = f0MinBin; i < f0MaxBin && i < this.frequencyData.length; i++) {
      harmonicEnergy += this.frequencyData[i];
    }
    harmonicEnergy /= (f0MaxBin - f0MinBin);

    // Calculate zero-crossing rate
    const zcr = this.calculateZeroCrossingRate(audioData);
    
    // Stricter thresholds for proper speech detection
    const hasLowZCR = zcr < 0.25; // Stricter - speech has lower ZCR than noise
    const hasHarmonics = harmonicEnergy > 35; // Higher threshold - real speech has stronger harmonics

    // BOTH conditions must be met for proper speech detection (AND logic)
    return hasLowZCR && hasHarmonics;
  }

  /**
   * Register event callback
   */
  public on(eventType: AudioEventType, callback: (data: any) => void): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  /**
   * Emit event to registered callbacks
   */
  private emit(eventType: AudioEventType, data: any): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Clear teacher voice profile
   */
  public clearTeacherVoiceProfile(): void {
    this.teacherVoiceProfile = null;
    this.speakerSimilarityHistory = [];
    console.log('Teacher voice profile cleared');
  }

  /**
   * Get teacher voice profile
   */
  public getTeacherVoiceProfile(): VoiceProfile | null {
    return this.teacherVoiceProfile;
  }

  /**
   * Check if teacher voice is enrolled
   */
  public hasTeacherVoiceProfile(): boolean {
    return this.teacherVoiceProfile !== null;
  }

  /**
   * Analyze current audio input
   */
  private analyzeAudio(): void {
    if (!this.analyser || !this.dataArray || !this.frequencyData || !this.floatTimeDomainData) {
      return;
    }

    // Get time domain data (waveform)
    this.analyser.getByteTimeDomainData(this.dataArray as any);
    this.analyser.getFloatTimeDomainData(this.floatTimeDomainData as any);
    
    // Get frequency domain data (spectrum)
    this.analyser.getByteFrequencyData(this.frequencyData as any);

    // Calculate RMS amplitude for audio level
    const audioLevel = this.calculateRMSLevel(this.dataArray);
    
    // Calculate energy in speech frequency range
    const speechEnergy = this.calculateSpeechEnergy(this.frequencyData);

    // Update ambient noise baseline during calibration
    if (this.calibrating) {
      this.ambientNoiseSamples.push(audioLevel);
      this.calibrationSamples++;

      if (this.calibrationSamples >= this.CALIBRATION_DURATION) {
        this.ambientNoiseBaseline = this.calculateMedian(this.ambientNoiseSamples);
        this.calibrating = false;
        console.log('Audio calibration complete. Ambient noise level:', this.ambientNoiseBaseline);
      }
    }

    // Detect speech activity
    const isSpeaking = this.detectSpeech(audioLevel, speechEnergy);
    
    // Calculate speech confidence
    const speechConfidence = this.calculateSpeechConfidence(audioLevel, speechEnergy);

    // Distinguish speech from noise
    const isSpeechNotNoise = isSpeaking && this.isSpeechNotNoise(this.floatTimeDomainData);

    // Voice verification (if enabled and teacher profile exists)
    let isTeacherSpeaking = false;
    let speakerSimilarity = 0;
    let unauthorizedSpeakerDetected = false;

    // Collect samples during enrollment (regardless of voice verification settings)
    if (this.enrollmentInProgress) {
      if (isSpeaking) {
        const sample = new Float32Array(this.floatTimeDomainData.length);
        sample.set(this.floatTimeDomainData);
        this.enrollmentSamples.push(sample);
        if (this.enrollmentSamples.length % 10 === 0) {
          console.log(`Enrollment progress: ${this.enrollmentSamples.length} samples collected`);
        }
      } else {
        // Log why speech isn't detected
        if (this.enrollmentSamples.length === 0 && Math.random() < 0.1) {
          console.log(`Waiting for speech... audioLevel: ${audioLevel.toFixed(4)}, speechEnergy: ${speechEnergy.toFixed(4)}, baseline: ${this.ambientNoiseBaseline.toFixed(4)}`);
        }
      }
    }

    if (this.config.voiceVerificationEnabled && this.teacherVoiceProfile && isSpeechNotNoise) {
      // Compare against teacher profile (not during enrollment)
      if (!this.enrollmentInProgress) {
        // Compare against teacher profile
        speakerSimilarity = this.compareVoiceProfile(this.floatTimeDomainData);
        
        // Add to history for temporal smoothing
        this.speakerSimilarityHistory.push(speakerSimilarity);
        if (this.speakerSimilarityHistory.length > this.SIMILARITY_HISTORY_SIZE) {
          this.speakerSimilarityHistory.shift();
        }

        // Calculate smoothed similarity (average over last 2-3 seconds)
        const smoothedSimilarity = this.calculateMean(this.speakerSimilarityHistory);
        speakerSimilarity = smoothedSimilarity;

        // Determine if teacher is speaking
        isTeacherSpeaking = smoothedSimilarity >= this.config.voiceSimilarityThreshold;
        
        // Detect unauthorized speaker
        unauthorizedSpeakerDetected = !isTeacherSpeaking && smoothedSimilarity < this.config.voiceSimilarityThreshold;

        // Emit events
        if (isTeacherSpeaking && !this.currentAudioData.isTeacherSpeaking) {
          this.emit('teacher_voice_detected', { similarity: smoothedSimilarity });
        } else if (unauthorizedSpeakerDetected && this.currentAudioData.isTeacherSpeaking !== false) {
          this.emit('unauthorized_speaker_detected', { 
            similarity: smoothedSimilarity,
            threshold: this.config.voiceSimilarityThreshold 
          });
        }
      }
    }

    // Emit speech events
    if (isSpeaking && !this.currentAudioData.isSpeaking) {
      this.emit('speech_detected', { audioLevel, speechConfidence });
    } else if (!isSpeaking && this.currentAudioData.isSpeaking) {
      this.emit('speech_ended', { audioLevel });
    }

    // Detect noise
    if (isSpeaking && !isSpeechNotNoise) {
      this.emit('noise_detected', { audioLevel });
    }

    // Update current audio data
    this.currentAudioData = {
      isSpeaking: isSpeechNotNoise,
      audioLevel: Math.round(audioLevel * 100),
      speechConfidence,
      ambientNoiseLevel: Math.round(this.ambientNoiseBaseline * 100),
      ...(this.config.voiceVerificationEnabled && this.teacherVoiceProfile && {
        isTeacherSpeaking,
        speakerSimilarity,
        unauthorizedSpeakerDetected,
      }),
    };
  }

  /**
   * Calculate RMS (Root Mean Square) amplitude from time domain data
   */
  private calculateRMSLevel(dataArray: any): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return rms;
  }

  /**
   * Calculate energy in speech frequency range (300-3400 Hz)
   */
  private calculateSpeechEnergy(frequencyData: any): number {
    if (!this.audioContext) return 0;

    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / frequencyData.length;

    // Find bin indices for speech frequency range
    const minBin = Math.floor(this.config.speechFrequencyRange.min / binWidth);
    const maxBin = Math.ceil(this.config.speechFrequencyRange.max / binWidth);

    let sum = 0;
    let count = 0;
    for (let i = minBin; i < maxBin && i < frequencyData.length; i++) {
      sum += frequencyData[i];
      count++;
    }

    // Normalize to 0-1 range
    const averageEnergy = count > 0 ? sum / count / 255 : 0;
    return averageEnergy;
  }

  /**
   * Detect speech based on audio level and speech energy
   */
  private detectSpeech(audioLevel: number, speechEnergy: number): boolean {
    // During calibration, don't detect speech
    if (this.calibrating) {
      return false;
    }

    // During enrollment, use stricter thresholds to avoid collecting noise
    if (this.enrollmentInProgress) {
      // Require BOTH conditions for enrollment - ensures we only collect real speech
      const isAboveNoise = audioLevel > Math.max(this.ambientNoiseBaseline * 2.0, 0.02);
      const hasSpeechEnergy = speechEnergy > this.config.speechEnergyThreshold * 0.8;
      const result = isAboveNoise && hasSpeechEnergy; // AND logic for enrollment
      
      // Debug logging during enrollment
      if (this.enrollmentSamples.length % 20 === 0) {
        console.log(`[Enrollment] audioLevel: ${audioLevel.toFixed(4)}, baseline: ${this.ambientNoiseBaseline.toFixed(4)}, speechEnergy: ${speechEnergy.toFixed(4)}, detected: ${result}`);
      }
      return result;
    }

    // Normal detection - require BOTH conditions for accurate speech detection
    const isAboveNoise = audioLevel > Math.max(this.ambientNoiseBaseline * 1.8, 0.015);
    const hasSpeechEnergy = speechEnergy > this.config.speechEnergyThreshold;

    return isAboveNoise && hasSpeechEnergy; // AND logic for proper speech detection
  }

  /**
   * Calculate speech confidence score (0-1)
   */
  private calculateSpeechConfidence(audioLevel: number, speechEnergy: number): number {
    if (this.calibrating) {
      return 0;
    }

    // Calculate confidence based on multiple factors
    const levelFactor = Math.min(audioLevel / (this.ambientNoiseBaseline * 3), 1);
    const energyFactor = Math.min(speechEnergy / (this.config.speechEnergyThreshold * 2), 1);
    
    // Combine factors with weights
    const confidence = (levelFactor * 0.4 + energyFactor * 0.6);
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate median of an array
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * Get current audio data
   */
  public getAudioData(): AudioData {
    return { ...this.currentAudioData };
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.currentAudioData.isSpeaking;
  }

  /**
   * Get current audio level (0-100)
   */
  public getAudioLevel(): number {
    return this.currentAudioData.audioLevel;
  }

  /**
   * Get speech confidence (0-1)
   */
  public getSpeechConfidence(): number {
    return this.currentAudioData.speechConfidence;
  }

  /**
   * Get ambient noise level (0-100)
   */
  public getAmbientNoiseLevel(): number {
    return this.currentAudioData.ambientNoiseLevel;
  }

  /**
   * Check if calibration is in progress
   */
  public getIsCalibrating(): boolean {
    return this.calibrating;
  }

  /**
   * Recalibrate ambient noise baseline
   */
  public recalibrate(): void {
    this.startCalibration();
  }

  /**
   * Stop audio analysis and release resources
   */
  public stopAudio(): void {
    // Stop analysis interval
    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }

    // Disconnect audio nodes
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clear references
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.floatTimeDomainData = null;

    // Clear voice verification data (privacy: no persistent storage)
    this.teacherVoiceProfile = null;
    this.enrollmentSamples = [];
    this.enrollmentInProgress = false;
    this.speakerSimilarityHistory = [];

    // Reset state
    this.currentAudioData = {
      isSpeaking: false,
      audioLevel: 0,
      speechConfidence: 0,
      ambientNoiseLevel: 0,
    };
  }

  /**
   * Check if audio is initialized
   */
  public isInitialized(): boolean {
    return this.audioContext !== null && this.analyser !== null;
  }
}
