# Emotion Detection Quick Reference

## Current Thresholds (More Sensitive)

### Smile Detection
- **marHappyThreshold**: 0.15 (mouth opening for smile)
- **mouthCurvatureThreshold**: 0.015 (upward curve of mouth)
- **cheekRaiseThreshold**: 0.04 (cheek raise for genuine smile)

### Confusion Detection
- **eyebrowRaisedThreshold**: 0.08 (raised eyebrows)
- **eyebrowAsymmetryThreshold**: 0.04 (one eyebrow higher than other)

### Other Emotions
- **earDrowsyThreshold**: 0.20 (eye aspect ratio for drowsiness)
- **eyebrowFrownedThreshold**: -0.06 (furrowed eyebrows for frustration)

### Confidence
- **EMOTION_THRESHOLD**: 0.50 (minimum confidence to show emotion)

## Temporal Smoothing (Faster Response)

- **smoothingWindowSize**: 3 frames (reduced from 6)
- **smoothingAlpha**: 0.45 (less weight on history)
- **Smoothing window**: Last 2 frames only (reduced from full window)

## Debug Mode

### Enable/Disable
```typescript
emotionClassifier.setDebugMode(true);  // Enable
emotionClassifier.setDebugMode(false); // Disable
```

### What Gets Logged (Every Frame)
1. **Feature Values**:
   - EAR (Eye Aspect Ratio)
   - MAR (Mouth Aspect Ratio)
   - eyebrowPosition
   - mouthCurvature
   - cheekRaise
   - asymmetry
   - jawDrop

2. **Emotion Scores**:
   - happy, confused, frustrated, bored, drowsy, focused, neutral

3. **Primary Emotion**:
   - Selected emotion with confidence

4. **Calibration Data** (every 2 seconds):
   - Current feature values
   - Current thresholds

## Emotion Detection Logic

### Happy 😊
```
IF mouthCurvature > 0.015 THEN happy = 0.60+
OR
IF (MAR > 0.15 AND cheekRaise > 0.03) THEN happy = 0.60+
BONUS: All features present → +0.15
```

### Confused 😕
```
IF eyebrowPosition > 0.08 OR asymmetry > 0.04 THEN confused = 0.65+
BONUS: Slight mouth opening (MAR 0.18-0.35) → +0.15
```

### Frustrated 😤
```
IF eyebrowPosition < -0.06 THEN frustrated = 0.60+
BONUS: Tight mouth (high width/height ratio) → +0.25
```

### Bored 😑
```
IF MAR < 0.15 AND EAR < 0.25 AND |eyebrowPosition| < 0.1 THEN bored = 0.65+
```

### Drowsy 😴
```
IF avgEAR < 0.20 OR slowBlink THEN drowsy = 0.75+
```

### Focused 🎯
```
IF EAR in [0.22, 0.30] AND |eyebrowPosition| < 0.1 AND MAR < 0.25 AND stable THEN focused = 0.70
```

## Calibration Helper

### Log Current Features
```typescript
// In processingOrchestrator.ts
if (emotionClassifier.getConfig().debugMode && frameCount % 30 === 0) {
  emotionClassifier.logCurrentFeatures(landmarks);
}
```

### Output
```
=== EMOTION CALIBRATION ===
Try different expressions and note these values:
{
  EAR: 0.245,
  MAR: 0.182,
  eyebrowPosition: 0.092,
  mouthCurvature: 0.018,
  cheekRaise: 0.045,
  asymmetry: 0.012,
  jawDrop: 0.234
}
Current thresholds: {
  marHappy: 0.15,
  mouthCurve: 0.015,
  cheekRaise: 0.04,
  eyebrowRaised: 0.08
}
```

## Video Feed Display

### Emotion Overlay Location
- **Position**: Top-right corner
- **Size**: 200x80 pixels
- **Padding**: 20px from edges

### Components
1. **Emoji**: 32px, left side
2. **Label**: 16px bold, emotion name
3. **Confidence**: 14px, percentage
4. **Progress Bar**: 8px height, color-coded

### Color Scheme
| Emotion | Color | Emoji |
|---------|-------|-------|
| Happy | Green (#4caf50) | 😊 |
| Confused | Orange (#ff9800) | 😕 |
| Frustrated | Red (#f44336) | 😤 |
| Bored | Gray (#9e9e9e) | 😑 |
| Drowsy | Purple (#673ab7) | 😴 |
| Focused | Blue (#2196f3) | 🎯 |
| Neutral | Light Gray (#757575) | 😐 |

## Performance Metrics

- **Target FPS**: 15
- **Frame Processing**: < 50ms
- **Emotion Classification**: ~5-10ms
- **Update Frequency**: Every frame (no delay)
- **Smoothing Delay**: 1-2 frames (67-133ms at 15 FPS)

## Tuning Guide

### Make Detection More Sensitive
1. Reduce thresholds (marHappy, mouthCurve, etc.)
2. Reduce EMOTION_THRESHOLD (e.g., 0.50 → 0.45)
3. Increase base scores in calculateEmotionScores()

### Make Detection Less Sensitive
1. Increase thresholds
2. Increase EMOTION_THRESHOLD (e.g., 0.50 → 0.60)
3. Decrease base scores

### Faster Response
1. Reduce smoothingWindowSize (e.g., 3 → 2)
2. Reduce smoothingAlpha (e.g., 0.45 → 0.30)
3. Use only last frame in getSmoothedEmotion()

### Slower Response (More Stable)
1. Increase smoothingWindowSize (e.g., 3 → 5)
2. Increase smoothingAlpha (e.g., 0.45 → 0.65)
3. Use more frames in getSmoothedEmotion()

## Common Issues

### Issue: Emotions not detected
**Solution**: 
- Check debug logs for feature values
- Compare with thresholds
- Try exaggerating expressions
- Ensure good lighting

### Issue: Emotions changing too fast
**Solution**:
- Increase smoothingWindowSize
- Increase smoothingAlpha
- Increase EMOTION_THRESHOLD

### Issue: Emotions stuck on neutral
**Solution**:
- Reduce EMOTION_THRESHOLD
- Reduce individual thresholds
- Check if face is detected properly

### Issue: Wrong emotions detected
**Solution**:
- Review calibration logs
- Adjust specific thresholds
- Check for lighting issues
- Verify face landmarks are accurate
