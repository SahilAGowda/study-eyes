# Behavior Classification Tuning Guide

## Overview
This guide explains how the behavior classification system works and how to tune it for optimal performance in classroom conditions.

## Key Components

### 1. Face Detection (`faceDetector.ts`)
**Purpose**: Detects if a face is present in the frame

**Key Threshold**:
- `minFaceConfidence: 0.7` - Minimum confidence to consider a face "detected"
  - **Higher value (0.8-0.9)**: More strict, reduces false positives but may miss faces in poor lighting
  - **Lower value (0.5-0.6)**: More lenient, detects faces in poor conditions but may have false positives

**Current Behavior**:
- If `faceCount === 0` → "No Face Detected" (100% confidence)
- If `faceCount > 0` but `confidence < 0.7` → Still processes as face present, but with reduced confidence

### 2. Gaze Estimation (`gazeEstimator.ts`)
**Purpose**: Determines if user is looking at the screen based on head pose

**Key Thresholds**:
```typescript
maxYawForScreen: 45°      // Left/right head rotation tolerance
maxPitchForScreen: 35°    // Up/down head rotation tolerance
yawLeftThreshold: -25°    // Threshold for "looking left"
yawRightThreshold: 25°    // Threshold for "looking right"
pitchUpThreshold: -20°    // Threshold for "looking up"
pitchDownThreshold: 20°   // Threshold for "looking down"
```

**How It Works**:
- Calculates head pose angles (yaw, pitch, roll)
- If angles are within thresholds → `isLookingAtScreen = true`
- Provides `focusConfidence` score (0-1) based on how centered the head is

**Tuning Recommendations**:
- **For strict monitoring**: Reduce to 30° yaw, 25° pitch
- **For relaxed monitoring**: Increase to 50° yaw, 40° pitch
- **Current settings (45°/35°)**: Balanced for natural head movements

### 3. Behavior Classification (`behaviorClassifier.ts`)
**Purpose**: Combines all inputs to classify behavior with 3-second delay

**Key Logic**:

#### No Face Detection
```typescript
if (faceCount === 0) → "No Face Detected"
```
- **Never** shows "Looking Away" when no face is present
- Shows "No Face Detected" immediately (no delay)

#### Looking Away Detection
```typescript
if (!isLookingAtScreen && 
    (yawDeviation > 35° OR pitchDeviation > 30°) &&
    focusConfidence < 0.4) → "Looking Away"
```
- Requires **significant** head rotation beyond relaxed thresholds
- Requires **low** focus confidence (<0.4)
- Subject to 3-second confirmation delay

#### Focused Detection
```typescript
if (focusConfidence >= 0.6) → "Focused"
```
- Primary indicator is `focusConfidence` from gaze estimator
- Even if not perfectly centered, high focus confidence = focused
- No delay when transitioning from critical states

**3-Second Delay Mechanism**:
- **Critical states** (no_face_detected, phone_detected): Change immediately
- **Normal states** (focused, looking_away, speaking, note_taking): Require 3 seconds of consistent detection
- Prevents flickering from momentary head movements

## Common Issues and Solutions

### Issue 1: "Looking Away" when user is actually focused
**Symptoms**: User looking at screen but system shows "Looking Away"

**Diagnosis**:
1. Check console logs for `focusConfidence` value
2. Check `yawDeviation` and `pitchDeviation` values

**Solutions**:
- If `focusConfidence` is consistently < 0.6 but user appears focused:
  - Increase `maxYawForScreen` and `maxPitchForScreen` in `gazeEstimator.ts`
- If head pose angles are too sensitive:
  - Adjust the "looking away" thresholds in `behaviorClassifier.ts` (currently 35° yaw, 30° pitch)

### Issue 2: "Looking Away" when no face is present
**Symptoms**: System shows "Looking Away" instead of "No Face Detected"

**Diagnosis**:
1. Check console logs for `faceCount` value
2. Check `faceConfidence` value

**Solutions**:
- This should be **fixed** in the current implementation
- If still occurring, check that `faceCount === 0` is being properly detected
- Verify face detector is initialized correctly

### Issue 3: Too much flickering between states
**Symptoms**: Behavior label changes rapidly

**Solutions**:
- Increase `updateInterval` in `behaviorClassifier.ts` (currently 3000ms)
- Increase `smoothingWindowSize` (currently 5 frames)
- Increase `smoothingAlpha` in `gazeEstimator.ts` for more temporal smoothing

### Issue 4: System too slow to respond
**Symptoms**: Takes too long to detect state changes

**Solutions**:
- Decrease `updateInterval` (minimum recommended: 2000ms)
- Decrease `smoothingAlpha` for faster response
- Note: Faster response = more flickering

## Recommended Settings by Use Case

### Strict Exam Monitoring
```typescript
// gazeEstimator.ts
maxYawForScreen: 30°
maxPitchForScreen: 25°

// behaviorClassifier.ts
minFaceConfidence: 0.8
updateInterval: 2000 // 2 seconds
```

### Relaxed Classroom Monitoring
```typescript
// gazeEstimator.ts
maxYawForScreen: 50°
maxPitchForScreen: 40°

// behaviorClassifier.ts
minFaceConfidence: 0.6
updateInterval: 4000 // 4 seconds
```

### Current Balanced Settings (Recommended)
```typescript
// gazeEstimator.ts
maxYawForScreen: 45°
maxPitchForScreen: 35°

// behaviorClassifier.ts
minFaceConfidence: 0.7
updateInterval: 3000 // 3 seconds
```

## Testing and Validation

### Console Logging
Enable detailed logging to diagnose issues:
```typescript
console.log('[BehaviorClassifier]', {
  faceCount,
  faceConfidence,
  isLookingAtScreen,
  focusConfidence,
  headPose: { yaw, pitch },
  yawDeviation,
  pitchDeviation,
  immediateState,
  currentState,
  pendingState,
  timeUntilChange
});
```

### Test Scenarios
1. **Face present, looking at screen**: Should show "Focused"
2. **Face present, looking left/right**: Should show "Looking Away" after 3 seconds
3. **No face in frame**: Should show "No Face Detected" immediately
4. **Brief glance away**: Should remain "Focused" (< 3 seconds)
5. **Sustained look away**: Should change to "Looking Away" after 3 seconds

## Performance Considerations

### Frame Rate Impact
- Face detection: ~50-100ms per frame
- Gaze estimation: ~5-10ms per frame
- Behavior classification: ~1-2ms per update

### Optimization Tips
1. Reduce `targetFPS` in `processingOrchestrator.ts` (currently 15 FPS)
2. Increase `skipFrames` in face detector for lower-end devices
3. Use `performanceMonitoring: true` to track processing times

## Summary of Fixes Applied

### ✅ Fix 1: Relaxed Gaze Thresholds
- Increased `maxYawForScreen` from 30° to 45°
- Increased `maxPitchForScreen` from 25° to 35°
- **Result**: More natural head movements are considered "focused"

### ✅ Fix 2: Proper No-Face Detection
- Changed logic to check `faceCount === 0` explicitly
- Separated face presence from face confidence
- **Result**: "No Face Detected" only when no face is actually present

### ✅ Fix 3: Stricter Looking Away Detection
- Requires yaw > 35° OR pitch > 30° (beyond relaxed thresholds)
- Requires focusConfidence < 0.4
- **Result**: Only significant head turns trigger "Looking Away"

### ✅ Fix 4: 3-Second Confirmation Delay
- Already implemented, but now works correctly with new thresholds
- Critical states (no face, phone) change immediately
- Normal states require 3 seconds of consistent detection
- **Result**: No flickering from brief eye movements

## Configuration Files

### Update Gaze Thresholds
File: `frontend/src/studyeye/services/gazeEstimator.ts`
```typescript
private config: GazeEstimatorConfig = {
  maxYawForScreen: 45,     // Adjust this
  maxPitchForScreen: 35,   // Adjust this
  // ...
};
```

### Update Behavior Thresholds
File: `frontend/src/studyeye/services/behaviorClassifier.ts`
```typescript
const DEFAULT_CONFIG: BehaviorClassifierConfig = {
  minFaceConfidence: 0.7,  // Adjust this
  updateInterval: 3000,    // Adjust this
  // ...
};
```

### Update Processing Rate
File: `frontend/src/studyeye/services/processingOrchestrator.ts`
```typescript
private config: OrchestratorConfig = {
  targetFPS: 15,                    // Adjust this
  behaviorUpdateInterval: 3000,     // Adjust this
  // ...
};
```
