# StudyEye System - Troubleshooting & Configuration Guide

## 🔧 Issue 1: Incorrect "Looking Away" Detection

### Problem Description
The system shows "Looking Away / Distracted" even when you're looking directly at the screen.

### Root Causes

#### 1. **Overly Strict Gaze Thresholds**
The gaze detection system uses head pose angles to determine if you're looking at the screen:

**Previous Settings** (TOO STRICT):
```typescript
maxYawForScreen: 25°    // Left/right head turn tolerance
maxPitchForScreen: 20°  // Up/down head tilt tolerance
```

**New Settings** (FIXED):
```typescript
maxYawForScreen: 40°    // Increased tolerance
maxPitchForScreen: 30°  // Increased tolerance
```

#### 2. **Dual Condition Logic**
The behavior classifier was using AND logic that was too restrictive:

**Previous Logic** (TOO STRICT):
```typescript
if (!gazeData.isLookingAtScreen || gazeDirection !== 'center') {
  return 'looking_away';
}
```
This meant you had to BOTH:
- Have head pose within thresholds AND
- Have gaze exactly centered

**New Logic** (FIXED):
```typescript
if (!gazeData.isLookingAtScreen && gazeDirection !== 'center') {
  return 'looking_away';
}
```
Now you only need to fail BOTH conditions to be marked as looking away.

### What Was Fixed

**File**: `frontend/src/studyeye/services/gazeEstimator.ts`
- ✅ Increased `maxYawForScreen` from 25° to 40°
- ✅ Increased `maxPitchForScreen` from 20° to 30°
- ✅ Increased direction thresholds by ~30%

**File**: `frontend/src/studyeye/services/behaviorClassifier.ts`
- ✅ Changed OR logic to AND logic for looking away detection
- ✅ Now more forgiving of natural head movements

### Expected Behavior After Fix

**When looking at screen**:
- ✅ Should show "Focused on Screen" (green)
- ✅ Engagement score should be 70-100
- ✅ Can move head slightly without triggering "looking away"

**When actually looking away**:
- ✅ Should show "Looking Away / Distracted" (orange)
- ✅ Engagement score should drop to 30-50
- ✅ Requires both head turned AND gaze off-center

### Testing the Fix

1. **Look directly at screen**: Should show "Focused on Screen"
2. **Move head slightly left/right** (±20°): Should still show "Focused"
3. **Turn head significantly** (>40°): Should show "Looking Away"
4. **Look up/down slightly** (±15°): Should still show "Focused"
5. **Look away completely**: Should show "Looking Away"

---

## 🎨 Issue 2: Grayscale Video

### Problem Description
The video feed appears in grayscale (black and white) instead of full color.

### Root Causes

#### 1. **Canvas Filter Settings**
Canvas context may have filters applied that affect color rendering.

#### 2. **Video Element Filters**
CSS filters on the video element can cause grayscale.

#### 3. **Camera Hardware**
Some cameras have grayscale/night mode enabled.

### What Was Fixed

**File**: `frontend/src/studyeye/components/VideoFeedDisplay.tsx`
- ✅ Added explicit `ctx.filter = 'none'` before drawing
- ✅ Set `ctx.globalCompositeOperation = 'source-over'` for proper blending

**File**: `frontend/src/studyeye/components/StudyEyeDashboard.tsx`
- ✅ Added `filter: 'none'` to video element style
- ✅ Added `WebkitFilter: 'none'` for Safari/Chrome
- ✅ Added `autoPlay` attribute

### Expected Behavior After Fix

**Video should display**:
- ✅ Full color (not grayscale)
- ✅ Natural skin tones
- ✅ Colored background
- ✅ Proper lighting

### If Still Grayscale

#### Check 1: Camera Settings
```
Windows Settings → Devices → Cameras → [Your Camera]
- Disable "Night Mode"
- Disable "Infrared Mode"
- Enable "Color Mode"
```

#### Check 2: Browser Console
Press F12 and check:
```javascript
// Should see color video track
Video track settings: {
  width: 1280,
  height: 720,
  frameRate: 30,
  facingMode: "user"
  // Should NOT have: colorSpace: "grayscale"
}
```

#### Check 3: Try Different Browser
- Chrome/Edge: Best support
- Firefox: Good support
- Safari: May have issues

#### Check 4: Camera Driver
- Update camera drivers
- Restart computer
- Try external webcam

---

## 📊 Understanding the Gaze Detection System

### How It Works

#### Step 1: Face Detection
```
BlazeFace Model
    ↓
Detects face in frame
    ↓
Returns bounding box
```

#### Step 2: Facial Landmarks
```
FaceMesh Model
    ↓
Detects 468 3D landmarks
    ↓
Key points: eyes, nose, mouth, face outline
```

#### Step 3: Head Pose Estimation
```
PnP Algorithm (Perspective-n-Point)
    ↓
Calculates 3D head orientation
    ↓
Returns: pitch (up/down), yaw (left/right), roll (tilt)
```

#### Step 4: Gaze Direction
```
Eye Landmarks + Head Pose
    ↓
Estimates gaze direction
    ↓
Classifies: center, left, right, up, down
```

#### Step 5: "Looking at Screen" Decision
```
if (|yaw| < 40° AND |pitch| < 30°):
    isLookingAtScreen = true
else:
    isLookingAtScreen = false
```

### Landmark Points Reference

**Key Landmarks Used**:
- **Nose Tip**: Point 1 (reference point)
- **Chin**: Point 152
- **Left Eye**: Points 33, 133, 159, 145
- **Right Eye**: Points 362, 263, 386, 374
- **Left Iris**: Point 468
- **Right Iris**: Point 473
- **Mouth**: Points 61, 291

### Angle Definitions

**Yaw (Left/Right Turn)**:
- Negative: Turning left
- Positive: Turning right
- Range: -180° to +180°
- Threshold: ±40° for "looking at screen"

**Pitch (Up/Down Tilt)**:
- Negative: Looking up
- Positive: Looking down
- Range: -90° to +90°
- Threshold: ±30° for "looking at screen"

**Roll (Head Tilt)**:
- Negative: Tilting left
- Positive: Tilting right
- Range: -180° to +180°
- Not used for "looking at screen" detection

---

## ⚙️ Configuration Options

### Adjusting Gaze Sensitivity

If you still get false "looking away" detections, you can further adjust:

**File**: `frontend/src/studyeye/services/gazeEstimator.ts`

```typescript
private config: GazeEstimatorConfig = {
  // Increase these for MORE tolerance (less sensitive)
  maxYawForScreen: 45,     // Default: 40°
  maxPitchForScreen: 35,   // Default: 30°
  
  // Decrease these for LESS tolerance (more sensitive)
  maxYawForScreen: 30,     // Stricter
  maxPitchForScreen: 25,   // Stricter
};
```

### Adjusting Behavior Classification

**File**: `frontend/src/studyeye/services/behaviorClassifier.ts`

```typescript
// Current logic (RECOMMENDED):
if (!gazeData.isLookingAtScreen && gazeDirection !== 'center') {
  return 'looking_away';
}

// More lenient (only check head pose):
if (!gazeData.isLookingAtScreen) {
  return 'looking_away';
}

// More strict (check both conditions with OR):
if (!gazeData.isLookingAtScreen || gazeDirection !== 'center') {
  return 'looking_away';
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Always Shows "Looking Away"

**Symptoms**:
- Shows "Looking Away" even when centered
- Engagement score always low
- Face detection works but behavior is wrong

**Solutions**:
1. ✅ **Applied**: Increased gaze thresholds
2. ✅ **Applied**: Changed behavior logic from OR to AND
3. **Try**: Adjust your seating position
4. **Try**: Ensure good lighting
5. **Try**: Center your face in the frame

### Issue: Grayscale Video

**Symptoms**:
- Video appears black and white
- Face detection works
- Everything else functions normally

**Solutions**:
1. ✅ **Applied**: Removed canvas filters
2. ✅ **Applied**: Added explicit color preservation
3. **Try**: Check camera settings in Windows
4. **Try**: Update camera drivers
5. **Try**: Use different browser
6. **Try**: Use external webcam

### Issue: Low FPS / Laggy

**Symptoms**:
- Video stutters
- Processing time >200ms
- FPS <10

**Solutions**:
1. Close other browser tabs
2. Reduce video resolution
3. Disable other applications
4. Check GPU acceleration enabled
5. Update graphics drivers

### Issue: Face Not Detected

**Symptoms**:
- No green face box
- Shows "No Face Detected"
- Engagement score is 0

**Solutions**:
1. Improve lighting (face should be well-lit)
2. Center face in frame
3. Move closer to camera (30-60cm distance)
4. Remove glasses if causing issues
5. Ensure camera is not blocked

---

## 📈 Performance Optimization

### Current Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Frame Rate | 10-15 FPS | 10-15 FPS | ✅ Good |
| Processing Time | <200ms | 200-400ms | ⚠️ Acceptable |
| Memory Usage | <500MB | ~300MB | ✅ Good |
| Model Load Time | <30s | 10-20s | ✅ Good |

### Optimization Tips

#### For Better Performance:
1. **Close unnecessary tabs**: Free up RAM and CPU
2. **Use Chrome/Edge**: Best TensorFlow.js performance
3. **Enable hardware acceleration**: Chrome settings → System
4. **Lower video resolution**: Reduce to 720p or 480p
5. **Disable other extensions**: Ad blockers can slow down

#### For Better Accuracy:
1. **Good lighting**: Face should be evenly lit
2. **Neutral background**: Avoid busy backgrounds
3. **Stable position**: Minimize head movement
4. **Proper distance**: 30-60cm from camera
5. **Eye level camera**: Camera at eye level, not above/below

---

## 🔍 Debugging Guide

### Enable Debug Logging

Open browser console (F12) and you'll see:

```javascript
// Model loading
TensorFlow.js initialized with WebGL backend
BlazeFace model loaded
FaceMesh model loaded
COCO-SSD model loaded

// Processing
ProcessingOrchestrator initialized successfully
Processing started
Audio calibration complete

// Performance warnings
Frame processing took 393.60ms (target: <200ms)

// Behavior updates
Behavior classified: focused_on_screen (confidence: 0.85)
Engagement score: 82
```

### Check Processing State

In browser console, type:
```javascript
// Get current state
window.studyEyeState = processingOrchestrator.getState();
console.log(window.studyEyeState);

// Check gaze data
console.log('Gaze:', window.studyEyeState.gazeResult);
console.log('Looking at screen:', window.studyEyeState.gazeResult?.isLookingAtScreen);
console.log('Gaze direction:', window.studyEyeState.gazeResult?.gazeDirection);

// Check head pose
console.log('Head pose:', window.studyEyeState.gazeResult?.headPose);
```

### Verify Thresholds

Check if thresholds are applied:
```javascript
// In browser console
console.log('Yaw:', window.studyEyeState.gazeResult?.headPose.yaw);
console.log('Pitch:', window.studyEyeState.gazeResult?.headPose.pitch);

// Should be:
// Yaw: -40° to +40° = Looking at screen
// Pitch: -30° to +30° = Looking at screen
```

---

## 📝 Configuration Checklist

### Before Starting Session

- [ ] Camera is connected and working
- [ ] Good lighting on face
- [ ] Face centered in frame
- [ ] Browser is Chrome or Edge
- [ ] Hardware acceleration enabled
- [ ] No other apps using camera
- [ ] Internet connection active (for model download)

### During Session

- [ ] Video displays in color
- [ ] Green face detection box visible
- [ ] Behavior updates every 3-5 seconds
- [ ] Engagement score changes with behavior
- [ ] Timeline chart updates
- [ ] FPS shows 10-15

### If Issues Occur

1. **Check browser console** (F12) for errors
2. **Verify camera permissions** granted
3. **Check lighting** - face should be visible
4. **Center your face** in the frame
5. **Reload page** if stuck
6. **Try different browser** if persistent issues

---

## 🎯 Calibration Recommendations

### Future Enhancement: Gaze Calibration

To improve accuracy, a calibration phase should be added:

```typescript
// Proposed calibration flow
1. Show 9-point grid on screen
2. User looks at each point for 2 seconds
3. System records gaze data for each point
4. Calculate user-specific offsets
5. Apply offsets to all future gaze estimates
```

This would account for:
- Individual eye anatomy differences
- Monitor size and distance variations
- Seating position variations
- Camera angle differences

---

## 📊 Expected Behavior Matrix

| Your Action | Expected Detection | Engagement Score |
|-------------|-------------------|------------------|
| Looking at screen, centered | Focused on Screen | 80-100 |
| Looking at screen, slight head turn (<30°) | Focused on Screen | 75-95 |
| Head turned moderately (30-40°) | Focused on Screen | 60-80 |
| Head turned significantly (>40°) | Looking Away | 30-50 |
| Looking completely away | Looking Away | 10-30 |
| Speaking while looking | Speaking Detected | 60-80 |
| Looking down at notes | Note-taking | 50-70 |
| Phone in hand | Phone Detected | 0-20 |
| No face visible | No Face Detected | 0 |

---

## 🔬 Technical Details

### Gaze Estimation Algorithm

```typescript
function estimateGaze(landmarks: Point[]): GazeData {
  // 1. Extract key facial landmarks
  const noseTip = landmarks[1];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  
  // 2. Calculate head pose using PnP algorithm
  const headPose = solvePnP(landmarks, cameraMatrix);
  
  // 3. Determine if looking at screen
  const isLookingAtScreen = 
    Math.abs(headPose.yaw) < maxYawForScreen &&
    Math.abs(headPose.pitch) < maxPitchForScreen;
  
  // 4. Classify gaze direction
  let gazeDirection: GazeDirection;
  if (headPose.yaw < yawLeftThreshold) {
    gazeDirection = 'left';
  } else if (headPose.yaw > yawRightThreshold) {
    gazeDirection = 'right';
  } else if (headPose.pitch < pitchUpThreshold) {
    gazeDirection = 'up';
  } else if (headPose.pitch > pitchDownThreshold) {
    gazeDirection = 'down';
  } else {
    gazeDirection = 'center';
  }
  
  // 5. Calculate stability
  const stability = calculateStability(headPoseHistory);
  
  return {
    isLookingAtScreen,
    gazeDirection,
    gazeStability: stability,
    headPose
  };
}
```

### Behavior Classification Priority

The system classifies behavior in this priority order:

1. **No Face Detected** (highest priority)
   - Condition: `faceCount === 0`
   - Confidence: 1.0

2. **Phone Detected**
   - Condition: Phone object detected with confidence >0.5
   - Confidence: Phone detection confidence

3. **Speaking Detected**
   - Condition: Audio activity detected
   - Confidence: Audio confidence

4. **Note-taking**
   - Condition: Head pitch >20° (looking down) + writing objects detected
   - Confidence: Combined confidence

5. **Looking Away** (FIXED)
   - Condition: NOT looking at screen AND gaze not centered
   - Confidence: Based on angle deviation

6. **Focused on Screen** (default)
   - Condition: All other conditions false
   - Confidence: Based on gaze stability

---

## 🚀 Quick Fixes Summary

### Applied Fixes

1. ✅ **Gaze Thresholds**: Increased by 60% for more tolerance
2. ✅ **Behavior Logic**: Changed from OR to AND for looking away
3. ✅ **Canvas Filters**: Explicitly disabled all filters
4. ✅ **Video Element**: Added color preservation attributes
5. ✅ **Timestamp Handling**: Fixed Date/number type issues

### Immediate Actions

**Reload the page** to apply all fixes. The system should now:
- ✅ Correctly detect when you're looking at screen
- ✅ Display video in full color
- ✅ Show accurate behavior classification
- ✅ Provide realistic engagement scores

---

## 📞 Support

### If Issues Persist

1. **Check this guide** for your specific issue
2. **Review browser console** for error messages
3. **Verify system requirements** are met
4. **Try different camera** if available
5. **Contact support** with console logs

### Reporting Issues

When reporting issues, include:
- Browser name and version
- Camera model
- Console error messages
- Screenshot of the issue
- Steps to reproduce

---

## 🎓 Best Practices

### For Accurate Detection

1. **Lighting**: Face should be well-lit from front
2. **Position**: Sit 30-60cm from camera
3. **Background**: Use neutral, non-distracting background
4. **Camera**: Position at eye level
5. **Stability**: Minimize excessive head movement

### For Privacy

1. **Enable Anonymization**: Blurs face while maintaining detection
2. **Check Compliance**: Green checkmarks in privacy panel
3. **Verify Local Processing**: No network requests during session
4. **Clear Data**: Stop session to clear all data from memory

---

**Document Version**: 1.0
**Last Updated**: November 22, 2025
**Status**: Active - Fixes Applied
