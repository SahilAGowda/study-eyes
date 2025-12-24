# Voice Verification Quick Reference

## 🚀 Quick Start (3 Steps)

```typescript
// 1. Initialize
const analyzer = new AudioAnalyzer({ voiceVerificationEnabled: true });
await analyzer.initializeAudio();

// 2. Enroll Teacher
await analyzer.enrollTeacherVoice(12);

// 3. Monitor
const data = analyzer.getAudioData();
if (data.unauthorizedSpeakerDetected) alert('Unauthorized!');
```

## 📋 Essential Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `enrollTeacherVoice(duration)` | Enroll teacher voice | `Promise<VoiceProfile>` |
| `isTeacherSpeaking()` | Check if teacher is speaking | `boolean` |
| `getAudioData()` | Get current audio data | `AudioData` |
| `hasTeacherVoiceProfile()` | Check if profile exists | `boolean` |
| `clearTeacherVoiceProfile()` | Clear voice profile | `void` |
| `getEnrollmentProgress()` | Get enrollment progress | `VoiceEnrollmentProgress` |
| `on(event, callback)` | Register event listener | `void` |

## 🎯 Events

```typescript
// Teacher detected
analyzer.on('teacher_voice_detected', (data) => {
  console.log('Teacher speaking:', data.similarity);
});

// Unauthorized speaker
analyzer.on('unauthorized_speaker_detected', (data) => {
  alert('Unauthorized speaker!');
});

// Speech activity
analyzer.on('speech_detected', () => console.log('Speech started'));
analyzer.on('speech_ended', () => console.log('Speech ended'));

// Noise detection
analyzer.on('noise_detected', () => console.log('Noise detected'));
```

## ⚙️ Configuration

```typescript
new AudioAnalyzer({
  voiceVerificationEnabled: true,    // Enable feature
  voiceSimilarityThreshold: 0.7,     // 70% match required
  updateInterval: 100,               // Update every 100ms
  fftSize: 2048,                     // FFT size
  speechEnergyThreshold: 0.02,       // Speech detection threshold
})
```

## 🎨 React Components

### VoiceEnrollment
```tsx
<VoiceEnrollment
  enrollmentFunction={(d) => analyzer.enrollTeacherVoice(d)}
  getProgressFunction={() => analyzer.getEnrollmentProgress()}
  onEnrollmentComplete={(profile) => console.log('Done:', profile)}
  onCancel={() => console.log('Cancelled')}
/>
```

### VoiceVerificationIndicator
```tsx
<VoiceVerificationIndicator
  audioData={analyzer.getAudioData()}
  enabled={true}
  hasProfile={analyzer.hasTeacherVoiceProfile()}
/>
```

## 📊 AudioData Interface

```typescript
interface AudioData {
  isSpeaking: boolean;                    // Is anyone speaking?
  audioLevel: number;                     // 0-100
  speechConfidence: number;               // 0-1
  ambientNoiseLevel: number;              // 0-100
  isTeacherSpeaking?: boolean;            // Is teacher speaking?
  speakerSimilarity?: number;             // 0-1 similarity score
  unauthorizedSpeakerDetected?: boolean;  // Unauthorized speaker?
}
```

## 🔧 Common Patterns

### Basic Setup
```typescript
const analyzer = new AudioAnalyzer({ voiceVerificationEnabled: true });
await analyzer.initializeAudio();
await analyzer.enrollTeacherVoice(12);
```

### Event-Driven Monitoring
```typescript
analyzer.on('unauthorized_speaker_detected', (data) => {
  logEvent('unauthorized_speaker', data);
  triggerAlert();
});
```

### Polling Pattern
```typescript
setInterval(() => {
  const data = analyzer.getAudioData();
  if (data.unauthorizedSpeakerDetected) {
    handleUnauthorizedSpeaker(data);
  }
}, 100);
```

### React Hook Pattern
```typescript
const [audioData, setAudioData] = useState(null);

useEffect(() => {
  const interval = setInterval(() => {
    setAudioData(analyzer.getAudioData());
  }, 100);
  return () => clearInterval(interval);
}, []);
```

## 🎯 Recommended Thresholds

| Environment | Threshold | Use Case |
|-------------|-----------|----------|
| Quiet Room | 0.75 | High security, exam mode |
| Normal Classroom | 0.70 | Standard monitoring |
| Noisy Environment | 0.65 | Busy classroom |
| Very Noisy | 0.60 | Last resort |

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Enrollment fails | Speak continuously, check mic permissions |
| Low similarity | Re-enroll, lower threshold, check noise |
| False positives | Increase threshold to 0.75-0.80 |
| High CPU | Increase updateInterval to 200ms |
| No detection | Check mic permissions, verify initialization |

## 📁 File Locations

```
frontend/src/studyeye/
├── services/audioAnalyzer.ts              # Main implementation
├── types/index.ts                         # Type definitions
├── components/
│   ├── VoiceEnrollment.tsx               # Enrollment UI
│   └── VoiceVerificationIndicator.tsx    # Status display
├── examples/
│   ├── voiceVerificationDemo.ts          # Code examples
│   └── voiceVerificationTest.html        # Test page
└── docs/
    ├── VOICE_VERIFICATION_README.md      # Overview
    ├── VOICE_VERIFICATION_GUIDE.md       # Complete guide
    └── VOICE_VERIFICATION_INTEGRATION.md # Integration
```

## 🔒 Privacy Checklist

- ✅ No audio recording
- ✅ Memory-only storage
- ✅ No network transmission
- ✅ Profile cleared on session end
- ✅ Local processing only

## 📈 Performance Targets

- **Memory**: < 20 KB
- **CPU**: < 10% average
- **Latency**: < 100ms
- **Accuracy**: > 70%

## 🎓 Learning Resources

1. **Quick Start**: VOICE_VERIFICATION_README.md
2. **Complete Guide**: VOICE_VERIFICATION_GUIDE.md
3. **Integration**: VOICE_VERIFICATION_INTEGRATION.md
4. **Examples**: voiceVerificationDemo.ts
5. **Test Page**: voiceVerificationTest.html

## 💡 Pro Tips

1. **Enrollment**: Quiet environment, continuous speech
2. **Threshold**: Start at 0.7, adjust based on results
3. **Events**: Use event-driven approach for alerts
4. **Smoothing**: System automatically smooths over 2-3 seconds
5. **Testing**: Use voiceVerificationTest.html for quick tests

## 🚨 Common Mistakes

❌ **Don't**: Record or store audio  
✅ **Do**: Use voice profile only

❌ **Don't**: Set threshold too high (>0.85)  
✅ **Do**: Use 0.65-0.75 range

❌ **Don't**: Poll too frequently (<50ms)  
✅ **Do**: Use 100ms update interval

❌ **Don't**: Enroll in noisy environment  
✅ **Do**: Enroll in quiet room

❌ **Don't**: Forget to clear profile  
✅ **Do**: Clear on session end

## 📞 Need Help?

1. Check VOICE_VERIFICATION_GUIDE.md
2. Run voiceVerificationTest.html
3. Review examples in voiceVerificationDemo.ts
4. Check browser console for errors
5. Verify microphone permissions

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: Novembe