/**
 * KeywordDetector Service
 * 
 * Uses Web Speech API to detect important keywords from teacher's speech.
 * When keywords are detected, triggers note-taking mode which pauses focus detection.
 */

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type KeywordEventType = 
  | 'keyword_detected'
  | 'note_taking_started'
  | 'note_taking_ended'
  | 'speech_recognized'
  | 'error';

export interface KeywordDetectorConfig {
  keywords: string[];
  noteTakingDurationMs: number; // How long to pause focus detection
  language: string;
  continuous: boolean;
}

export interface KeywordEvent {
  type: KeywordEventType;
  keyword?: string;
  transcript?: string;
  timestamp: number;
  remainingSeconds?: number;
}

const DEFAULT_CONFIG: KeywordDetectorConfig = {
  keywords: [
    'important',
    'write this down',
    'note this',
    'remember this',
    'take note',
    'this is key',
    'pay attention',
    'exam question',
    'test question',
    'highlight this',
    'underline this',
    'circle this',
    'mark this',
    'crucial',
    'essential',
    'critical point',
  ],
  noteTakingDurationMs: 45000, // 45 seconds grace period
  language: 'en-US',
  continuous: true,
};

export class KeywordDetector {
  private config: KeywordDetectorConfig;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private isNoteTakingMode: boolean = false;
  private noteTakingEndTime: number = 0;
  private noteTakingTimer: number | null = null;
  private eventCallbacks: Map<KeywordEventType, ((event: KeywordEvent) => void)[]> = new Map();
  
  // Statistics
  private keywordsDetectedCount: number = 0;
  private totalNoteTakingTimeMs: number = 0;
  private lastNoteTakingStart: number = 0;

  constructor(config: Partial<KeywordDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if Web Speech API is supported
   */
  public static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Initialize speech recognition
   */
  public initialize(): boolean {
    if (!KeywordDetector.isSupported()) {
      console.warn('Web Speech API not supported in this browser');
      return false;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition not available');
      return false;
    }
    
    this.recognition = new SpeechRecognitionClass();
    
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language;
      this.recognition.maxAlternatives = 1;
    }

    this.setupEventHandlers();
    
    console.log('KeywordDetector initialized with keywords:', this.config.keywords);
    return true;
  }

  /**
   * Set up speech recognition event handlers
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      
      // Emit speech recognized event
      this.emit('speech_recognized', {
        type: 'speech_recognized',
        transcript,
        timestamp: Date.now(),
      });

      // Check for keywords
      if (lastResult.isFinal) {
        this.checkForKeywords(transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.emit('error', {
        type: 'error',
        transcript: event.error,
        timestamp: Date.now(),
      });

      // Restart on recoverable errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        this.restartRecognition();
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        this.restartRecognition();
      }
    };
  }

  /**
   * Check transcript for keywords
   */
  private checkForKeywords(transcript: string): void {
    const normalizedTranscript = transcript.toLowerCase();
    
    for (const keyword of this.config.keywords) {
      if (normalizedTranscript.includes(keyword.toLowerCase())) {
        console.log(`🎯 Keyword detected: "${keyword}" in "${transcript}"`);
        
        this.keywordsDetectedCount++;
        
        this.emit('keyword_detected', {
          type: 'keyword_detected',
          keyword,
          transcript,
          timestamp: Date.now(),
        });

        // Start note-taking mode
        this.startNoteTakingMode(keyword);
        break; // Only trigger once per transcript
      }
    }
  }

  /**
   * Start note-taking mode (pauses focus detection)
   */
  private startNoteTakingMode(keyword: string): void {
    const now = Date.now();
    
    // If already in note-taking mode, extend the timer
    if (this.isNoteTakingMode) {
      this.noteTakingEndTime = now + this.config.noteTakingDurationMs;
      console.log(`📝 Note-taking mode extended for ${this.config.noteTakingDurationMs / 1000}s`);
    } else {
      this.isNoteTakingMode = true;
      this.noteTakingEndTime = now + this.config.noteTakingDurationMs;
      this.lastNoteTakingStart = now;
      
      this.emit('note_taking_started', {
        type: 'note_taking_started',
        keyword,
        timestamp: now,
        remainingSeconds: this.config.noteTakingDurationMs / 1000,
      });
      
      console.log(`📝 Note-taking mode started for ${this.config.noteTakingDurationMs / 1000}s`);
    }

    // Clear existing timer
    if (this.noteTakingTimer) {
      clearTimeout(this.noteTakingTimer);
    }

    // Set timer to end note-taking mode
    this.noteTakingTimer = window.setTimeout(() => {
      this.endNoteTakingMode();
    }, this.config.noteTakingDurationMs);
  }

  /**
   * End note-taking mode
   */
  private endNoteTakingMode(): void {
    if (!this.isNoteTakingMode) return;

    const duration = Date.now() - this.lastNoteTakingStart;
    this.totalNoteTakingTimeMs += duration;
    
    this.isNoteTakingMode = false;
    this.noteTakingEndTime = 0;
    
    if (this.noteTakingTimer) {
      clearTimeout(this.noteTakingTimer);
      this.noteTakingTimer = null;
    }

    this.emit('note_taking_ended', {
      type: 'note_taking_ended',
      timestamp: Date.now(),
    });
    
    console.log('📝 Note-taking mode ended');
  }

  /**
   * Restart speech recognition
   */
  private restartRecognition(): void {
    if (!this.recognition || !this.isListening) return;

    setTimeout(() => {
      try {
        this.recognition?.start();
      } catch (error) {
        // Already started, ignore
      }
    }, 100);
  }

  /**
   * Start listening for keywords
   */
  public startListening(): boolean {
    if (!this.recognition) {
      console.error('KeywordDetector not initialized');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 Keyword detection started');
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening for keywords
   */
  public stopListening(): void {
    if (!this.recognition) return;

    this.isListening = false;
    
    try {
      this.recognition.stop();
    } catch (error) {
      // Ignore errors when stopping
    }

    // End note-taking mode if active
    if (this.isNoteTakingMode) {
      this.endNoteTakingMode();
    }

    console.log('🎤 Keyword detection stopped');
  }

  /**
   * Check if currently in note-taking mode
   */
  public isInNoteTakingMode(): boolean {
    return this.isNoteTakingMode;
  }

  /**
   * Get remaining note-taking time in seconds
   */
  public getNoteTakingRemainingSeconds(): number {
    if (!this.isNoteTakingMode) return 0;
    return Math.max(0, (this.noteTakingEndTime - Date.now()) / 1000);
  }

  /**
   * Manually trigger note-taking mode (for testing or manual override)
   */
  public triggerNoteTakingMode(durationMs?: number): void {
    const originalDuration = this.config.noteTakingDurationMs;
    if (durationMs) {
      this.config.noteTakingDurationMs = durationMs;
    }
    this.startNoteTakingMode('manual_trigger');
    this.config.noteTakingDurationMs = originalDuration;
  }

  /**
   * Add custom keywords
   */
  public addKeywords(keywords: string[]): void {
    this.config.keywords = [...new Set([...this.config.keywords, ...keywords])];
    console.log('Keywords updated:', this.config.keywords);
  }

  /**
   * Remove keywords
   */
  public removeKeywords(keywords: string[]): void {
    this.config.keywords = this.config.keywords.filter(k => !keywords.includes(k));
  }

  /**
   * Set keywords (replace all)
   */
  public setKeywords(keywords: string[]): void {
    this.config.keywords = keywords;
  }

  /**
   * Get current keywords
   */
  public getKeywords(): string[] {
    return [...this.config.keywords];
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<KeywordDetectorConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
    }
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    keywordsDetectedCount: number;
    totalNoteTakingTimeMs: number;
    isListening: boolean;
    isNoteTakingMode: boolean;
  } {
    return {
      keywordsDetectedCount: this.keywordsDetectedCount,
      totalNoteTakingTimeMs: this.totalNoteTakingTimeMs,
      isListening: this.isListening,
      isNoteTakingMode: this.isNoteTakingMode,
    };
  }

  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.keywordsDetectedCount = 0;
    this.totalNoteTakingTimeMs = 0;
  }

  /**
   * Register event callback
   */
  public on(eventType: KeywordEventType, callback: (event: KeywordEvent) => void): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  /**
   * Remove event callback
   */
  public off(eventType: KeywordEventType, callback: (event: KeywordEvent) => void): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(eventType: KeywordEventType, event: KeywordEvent): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * Dispose and cleanup
   */
  public dispose(): void {
    this.stopListening();
    this.eventCallbacks.clear();
    this.recognition = null;
  }
}

// Singleton instance
let keywordDetectorInstance: KeywordDetector | null = null;

export function getKeywordDetector(): KeywordDetector {
  if (!keywordDetectorInstance) {
    keywordDetectorInstance = new KeywordDetector();
  }
  return keywordDetectorInstance;
}

export default KeywordDetector;
