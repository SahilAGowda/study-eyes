/**
 * AudioAnalyzer Service
 * Handles microphone access and audio activity detection
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

export interface AudioData {
  isSpeaking: boolean;
  audioLevel: number; // 0-100
  speechConfidence: number; // 0-1
  ambientNoiseLevel: number; // 0-100
}

export interface AudioError {
  type: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'UnknownError';
  message: string;
  userMessage: string;
}

export class AudioAnalyzer {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array<ArrayBufferLike> | null = null;
  private ambientNoiseBaseline: number = 0;
  private isCalibrating: boolean = false;

  // Thresholds
  private readonly SPEECH_THRESHOLD = 30; // Energy threshold for speech detection
  private readonly SPEECH_FREQUENCY_MIN = 300; // Hz
  private readonly SPEECH_FREQUENCY_MAX = 3400; // Hz
  private readonly CALIBRATION_DURATION = 2000; // ms

  /**
   * Initialize microphone and audio analysis
   * @returns Promise<MediaStream>
   */
  async initializeAudio(): Promise<MediaStream> {
    try {
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser');
      }

      // Request microphone access
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // Create data array for frequency analysis
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Calibrate ambient noise baseline
      await this.calibrateAmbientNoise();

      console.log('✅ Microphone initialized successfully');
      return this.stream;

    } catch (error: any) {
      const audioError = this.handleAudioError(error);
      console.error('❌ Microphone initialization failed:', audioError);
      throw audioError;
    }
  }

  /**
   * Analyze current audio and detect speech activity
   * @returns AudioData
   */
  analyzeAudio(): AudioData {
    if (!this.analyser || !this.dataArray) {
      return {
        isSpeaking: false,
        audioLevel: 0,
        speechConfidence: 0,
        ambientNoiseLevel: this.ambientNoiseBaseline
      };
    }

    try {
      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate overall audio level (RMS)
      const audioLevel = this.calculateAudioLevel(this.dataArray);

      // Calculate speech confidence based on frequency patterns
      const speechConfidence = this.calculateSpeechConfidence(this.dataArray, audioLevel);

      // Determine if speaking
      const isSpeaking = speechConfidence > 0.6 && audioLevel > this.ambientNoiseBaseline + this.SPEECH_THRESHOLD;

      return {
        isSpeaking,
        audioLevel: Math.min(100, audioLevel),
        speechConfidence,
        ambientNoiseLevel: this.ambientNoiseBaseline
      };

    } catch (error) {
      console.error('❌ Audio analysis failed:', error);
      return {
        isSpeaking: false,
        audioLevel: 0,
        speechConfidence: 0,
        ambientNoiseLevel: this.ambientNoiseBaseline
      };
    }
  }

  /**
   * Stop audio analysis and release resources
   */
  stopAudio(): void {
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.dataArray = null;

    console.log('🛑 Microphone stopped');
  }

  /**
   * Check if audio is active
   * @returns boolean
   */
  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }

  /**
   * Calibrate ambient noise baseline
   * @private
   */
  private async calibrateAmbientNoise(): Promise<void> {
    if (!this.analyser || !this.dataArray) return;

    this.isCalibrating = true;
    const samples: number[] = [];
    const sampleCount = 20;
    const sampleInterval = this.CALIBRATION_DURATION / sampleCount;

    for (let i = 0; i < sampleCount; i++) {
      await new Promise(resolve => setTimeout(resolve, sampleInterval));
      
      this.analyser!.getByteFrequencyData(this.dataArray!);
      const level = this.calculateAudioLevel(this.dataArray!);
      samples.push(level);
    }

    // Calculate average as baseline
    this.ambientNoiseBaseline = samples.reduce((a, b) => a + b, 0) / samples.length;
    this.isCalibrating = false;

    console.log(`🎤 Ambient noise baseline calibrated: ${this.ambientNoiseBaseline.toFixed(2)}`);
  }

  /**
   * Calculate audio level from frequency data (RMS)
   * @private
   */
  private calculateAudioLevel(dataArray: Uint8Array<ArrayBufferLike>): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return rms;
  }

  /**
   * Calculate speech confidence based on frequency patterns
   * @private
   */
  private calculateSpeechConfidence(dataArray: Uint8Array<ArrayBufferLike>, audioLevel: number): number {
    if (!this.audioContext || audioLevel < this.SPEECH_THRESHOLD) {
      return 0;
    }

    // Calculate frequency bin range for speech
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / dataArray.length;
    const minBin = Math.floor(this.SPEECH_FREQUENCY_MIN / binWidth);
    const maxBin = Math.floor(this.SPEECH_FREQUENCY_MAX / binWidth);

    // Calculate energy in speech frequency range
    let speechEnergy = 0;
    let totalEnergy = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const energy = dataArray[i];
      totalEnergy += energy;

      if (i >= minBin && i <= maxBin) {
        speechEnergy += energy;
      }
    }

    // Calculate confidence as ratio of speech energy to total energy
    const confidence = totalEnergy > 0 ? speechEnergy / totalEnergy : 0;

    // Normalize to 0-1 range
    return Math.min(1, Math.max(0, confidence * 1.5));
  }

  /**
   * Handle audio errors with user-friendly messages
   * @param error - Error object
   * @returns AudioError
   * @private
   */
  private handleAudioError(error: any): AudioError {
    let audioError: AudioError;

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      audioError = {
        type: 'NotAllowedError',
        message: error.message,
        userMessage: 'Microphone access denied. Please allow microphone permissions in your browser settings and refresh the page.'
      };
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      audioError = {
        type: 'NotFoundError',
        message: error.message,
        userMessage: 'No microphone found. Please connect a microphone and try again.'
      };
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      audioError = {
        type: 'NotReadableError',
        message: error.message,
        userMessage: 'Microphone is already in use by another application. Please close other apps using the microphone and try again.'
      };
    } else {
      audioError = {
        type: 'UnknownError',
        message: error.message || 'Unknown audio error',
        userMessage: 'An unexpected error occurred while accessing the microphone. Please try again or use a different browser.'
      };
    }

    return audioError;
  }
}

export default AudioAnalyzer;
