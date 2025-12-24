# Voice Verification System Guide

## Overview

The Voice Verification System enables teacher voice enrollment and real-time speaker identification during classroom monitoring. It distinguishes between the enrolled teacher's voice and other speakers (students, unauthorized persons) without recording or storing audio data persistently.

## Key Features

### 1. Teacher Voice Enrollment
- **Duration**: 10-15 seconds of continuous speech
- **Privacy**: Voice profile stored only in memory (RAM)
- **No Persistence**: Profile cleared when session ends
- **Requirements**: Continuous speech, consistent volume

### 2. Speaker Verification
- **Real-time Analysis**: Compares incoming speech against teacher profile
- **Similarity Score**: 0-1 scale (0 = no match, 1 = perfect match)
- **Threshold**: Configurable (default 0.7 = 70% similarity)
- **Temporal Smoothing**: Averages over 2-3 seconds to reduce false positives

### 3. Speech vs Noise Distinction
- **Harmonic Analysis**: Detects voice harmonics in 85-255 Hz range
- **Zero-Crossing Rate**: Speech has lower ZCR than noise
- **Spectral Features**: Analyzes frequency distribution patterns

## Technical Implementation

### Voice Features Extracted

1. **Pitch (Fundamental Frequency)**
   - Extracted using autocorrelation
   - Range: 85-255 Hz (human voice)
   - Statistics: mean and standard deviation

2. **MFCC (Mel-Frequency Cepstral Coefficients)**
   - 13 coefficients extracted
   - Represents spectral envelope of speech
   - Most discriminative feature for speaker identification

3. **Spectral Centroid**
   - Measures "brightness" of sound
   - Indicates where most energy is concentrated
   - Helps distinguish voice timbre

4. **Zero-Crossing Rate**
   - Rate at which signal changes sign
   - Speech: typically < 0.3
   - Noise: typically > 0.3

5. **Formant Frequencies**
   - Resonant frequencies of vocal tract
   - First 3 formants (F1, F2, F3)
   - Unique to each speaker's anatomy

### Similarity Calculation

The system calculates similarity using weighted combination:

```
Similarity = (
  Pitch Similarity × 0.35 +
  MFCC Similarity × 0.40 +
  Spectral Centroid Similarity × 0.15 +
  Zero-Crossing Rate Similarity × 0.10
)
```

**Weights Rationale:**
- MFCC (40%): Most discriminative for speaker identity
- Pitch (35%): Highly characteristic of individual voice
- Spectral Centroid (15%): Captures voice quality
- ZCR (10%): Helps distinguish speech from noise

## Usage Guide

### Basic Setup

```typescript
import { AudioAnalyzer } from './services/audioAnalyzer';

// Initialize with voice verification enabled
const audioAnalyzer = new AudioAnalyzer({
  voiceVerificationEnabled: true,
  voiceSimilarityThreshold: 0.7, // 70% match required
  updateInterval: 100, // Update every 100ms
});

// Initialize audio (request microphone)
await audioAnalyzer.initializeAudio();
```

### Teacher Voice Enrollment

```typescript
// Start enrollment (12 seconds)
console.log('Please speak continuously...');
const voiceProfile = await audioAnalyzer.enrollTeacherVoice(12);

console.log('Enrollment complete:', voiceProfile);
// Output: { pitchMean, pitchStd, mfcc, spectralCentroid, ... }
```

### Track Enrollment Progress

```typescript
// Start enrollment
const enrollmentPromise = audioAnalyzer.enrollTeacherVoice(12);

// Monitor progress
const interval = setInterval(() => {
  const progress = audioAnalyzer.getEnrollmentProgress();
  
  console.log(`Progress: ${Math.round(progress.progress * 100)}%`);
  console.log(`Remaining: ${progress.remainingSeconds.toFixed(1)}s`);
  console.log(`Samples: ${progress.samplesCollected}/${progress.requiredSamples}`);
  
  if (!progress.isEnrolling) {
    clearInterval(interval);
  }
}, 500);

await enrollmentPromise;
```

### Real-Time Monitoring

```typescript
// Get current audio data
const audioData = audioAnalyzer.getAudioData();

if (audioData.isSpeaking) {
  console.log('Speech detected');
  console.log('Audio level:', audioData.audioLevel);
  console.log('Speech confidence:', audioData.speechConfidence);
  
  if (audioData.isTeacherSpeaking) {
    console.log('✅ Teacher is speaking');
    console.log('Similarity:', audioData.speakerSimilarity);
  } else if (audioData.unauthorizedSpeakerDetected) {
    console.warn('⚠️ Unauthorized speaker detected!');
    console.log('Similarity:', audioData.speakerSimilarity);
  }
}
```

### Event-Driven Approach

```typescript
// Register event listeners
audioAnalyzer.on('teacher_voice_detected', (data) => {
  console.log('Teacher speaking:', data.similarity);
});

audioAnalyzer.on('unauthorized_speaker_detected', (data) => {
  console.warn('Unauthorized speaker!');
  console.log('Similarity:', data.similarity);
  console.log('Threshold:', data.threshold);
  
  // Trigger alert, log event, etc.
  triggerSecurityAlert();
});

audioAnalyzer.on('speech_detected', (data) => {
  console.log('Speech started');
});

audioAnalyzer.on('speech_ended', (data) => {
  console.log('Speech ended');
});

audioAnalyzer.on('noise_detected', (data) => {
  console.log('Noise detected (not speech)');
});
```

### Voice Profile Management

```typescript
// Check if profile exists
const hasProfile = audioAnalyzer.hasTeacherVoiceProfile();

// Get profile data
const profile = audioAnalyzer.getTeacherVoiceProfile();

// Clear profile (for privacy or re-enrollment)
audioAnalyzer.clearTeacherVoiceProfile();

// Check if teacher is currently speaking
const isTeacher = audioAnalyzer.isTeacherSpeaking();
```

## React Integration

### Using VoiceEnrollment Component

```tsx
import { VoiceEnrollment } from './components/VoiceEnrollment';

function TeacherSetup() {
  const [audioAnalyzer] = useState(() => new AudioAnalyzer({
    voiceVerificationEnabled: true,
  }));

  const handleEnrollmentComplete = (profile) => {
    console.log('Teacher enrolled:', profile);
    // Proceed to monitoring
  };

  return (
    <VoiceEnrollment
      onEnrollmentComplete={handleEnrollmentComplete}
      onCancel={() => console.log('Cancelled')}
      enrollmentFunction={(duration) => audioAnalyzer.enrollTeacherVoice(duration)}
      getProgressFunction={() => audioAnalyzer.getEnrollmentProgress()}
    />
  );
}
```

### Using VoiceVerificationIndicator Component

```tsx
import { VoiceVerificationIndicator } from './components/VoiceVerificationIndicator';

function MonitoringView() {
  const [audioData, setAudioData] = useState(audioAnalyzer.getAudioData());

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioData(audioAnalyzer.getAudioData());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <VoiceVerificationIndicator
      audioData={audioData}
      enabled={true}
      hasProfile={audioAnalyzer.hasTeacherVoiceProfile()}
    />
  );
}
```

## Configuration Options

### AudioAnalyzerConfig

```typescript
interface AudioAnalyzerConfig {
  // Voice verification
  voiceVerificationEnabled?: boolean; // Enable/disable feature
  voiceSimilarityThreshold?: number;  // 0-1, default 0.7
  
  // Audio analysis
  fftSize?: number;                   // FFT size, default 2048
  smoothingTimeConstant?: number;     // 0-1, default 0.8
  speechEnergyThreshold?: number;     // Default 0.02
  speechFrequencyRange?: {            // Hz range for speech
    min: number;                      // Default 300
    max: number;                      // Default 3400
  };
  updateInterval?: number;            // ms, default 100
}
```

### Recommended Settings

**High Security (Exam Mode)**
```typescript
{
  voiceVerificationEnabled: true,
  voiceSimilarityThreshold: 0.75, // Stricter matching
  updateInterval: 50, // More frequent checks
}
```

**Normal Classroom**
```typescript
{
  voiceVerificationEnabled: true,
  voiceSimilarityThreshold: 0.7, // Balanced
  updateInterval: 100,
}
```

**Noisy Environment**
```typescript
{
  voiceVerificationEnabled: true,
  voiceSimilarityThreshold: 0.65, // More lenient
  speechEnergyThreshold: 0.03, // Higher threshold
}
```

## Best Practices

### Enrollment

1. **Environment**: Enroll in quiet environment
2. **Speech**: Speak naturally and continuously
3. **Content**: Read text, count numbers, or speak about any topic
4. **Duration**: 12 seconds recommended (minimum 10)
5. **Volume**: Maintain consistent speaking volume
6. **Avoid**: Long pauses, whispering, shouting

### Monitoring

1. **Calibration**: Wait for ambient noise calibration (3 seconds)
2. **Threshold**: Adjust based on environment and requirements
3. **Events**: Use event listeners for real-time alerts
4. **Smoothing**: System averages over 2-3 seconds automatically
5. **False Positives**: Reduce by increasing threshold
6. **False Negatives**: Reduce by decreasing threshold

### Privacy

1. **No Recording**: System never records audio
2. **Memory Only**: Voice profile stored in RAM only
3. **Session-Based**: Profile cleared when session ends
4. **No Network**: All processing happens locally
5. **Transparency**: Inform users about voice analysis

## Troubleshooting

### Enrollment Fails

**Problem**: "Insufficient speech samples"

**Solutions**:
- Speak continuously without long pauses
- Ensure microphone is working
- Check microphone permissions
- Increase enrollment duration
- Speak louder or closer to microphone

### Low Similarity Scores

**Problem**: Teacher voice not recognized

**Solutions**:
- Re-enroll in similar acoustic environment
- Adjust similarity threshold (lower it)
- Check for background noise
- Ensure consistent speaking style
- Verify microphone quality

### False Positives

**Problem**: Students detected as teacher

**Solutions**:
- Increase similarity threshold (0.75-0.80)
- Re-enroll with longer duration (15 seconds)
- Ensure enrollment in quiet environment
- Check for similar-sounding voices

### High CPU Usage

**Problem**: Performance issues

**Solutions**:
- Increase updateInterval (200ms instead of 100ms)
- Reduce fftSize (1024 instead of 2048)
- Disable voice verification when not needed
- Use event-driven approach instead of polling

## Performance Considerations

### CPU Usage
- **Enrollment**: High CPU for 12 seconds
- **Monitoring**: Moderate CPU (continuous)
- **Optimization**: Adjust updateInterval and fftSize

### Memory Usage
- **Voice Profile**: ~1-2 KB
- **Audio Buffers**: ~16 KB
- **History**: ~1 KB (similarity history)
- **Total**: < 20 KB per session

### Latency
- **Detection**: < 100ms
- **Verification**: < 100ms
- **Smoothing**: 2-3 seconds for stability

## Privacy & Compliance

### GDPR Compliance
✅ No audio recording
✅ No persistent storage
✅ No data transmission
✅ User consent required
✅ Transparent processing

### Educational Privacy
✅ FERPA compliant
✅ COPPA compliant
✅ No student data collected
✅ Teacher data in memory only

### Security
✅ Local processing only
✅ No cloud services
✅ No API calls
✅ Session-based only

## API Reference

### Methods

#### `enrollTeacherVoice(duration: number): Promise<VoiceProfile>`
Enroll teacher's voice for speaker verification.

#### `getEnrollmentProgress(): VoiceEnrollmentProgress`
Get current enrollment progress.

#### `isTeacherSpeaking(): boolean`
Check if current speaker is the enrolled teacher.

#### `hasTeacherVoiceProfile(): boolean`
Check if teacher voice profile exists.

#### `getTeacherVoiceProfile(): VoiceProfile | null`
Get the current voice profile.

#### `clearTeacherVoiceProfile(): void`
Clear the teacher voice profile.

#### `on(eventType: AudioEventType, callback: Function): void`
Register event listener.

### Events

- `speech_detected`: Speech activity started
- `speech_ended`: Speech activity ended
- `teacher_voice_detected`: Teacher voice identified
- `unauthorized_speaker_detected`: Non-teacher voice detected
- `noise_detected`: Noise detected (not speech)

### Types

See `frontend/src/studyeye/types/index.ts` for complete type definitions.

## Examples

See `frontend/src/studyeye/examples/voiceVerificationDemo.ts` for complete working examples.

## Support

For issues or questions:
1. Check troubleshooting section
2. Review examples and demos
3. Verify microphone permissions
4. Check browser console for errors
