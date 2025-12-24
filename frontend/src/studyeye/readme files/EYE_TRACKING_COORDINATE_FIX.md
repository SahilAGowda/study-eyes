# Eye Tracking Coordinate Transformation Fix

## Problem
Eye markers were appearing shifted/misplaced on the canvas because they weren't using the same coordinate transformation pipeline as the face bounding box.

## Root Cause
- **Face bounding box**: Raw FaceMesh coords → scale to canvas → mirror horizontally ✅
- **Eye markers (before fix)**: Raw FaceMesh coords → draw directly ❌
- **React overlay dots (before fix)**: Raw coords → percentage without mirroring ❌

## Solution Applied

### 1. Canvas Drawing (Already Correct)
The `drawEyeIndicators` function in `VideoFeedDisplay.tsx` already applies the correct transformation:

```typescript
// Step 1: Scale to canvas dimensions
const scaledX = gazeData.leftEyePosition.x * scaleX;
const scaledY = gazeData.leftEyePosition.y * scaleY;

// Step 2: Mirror X coordinate (video is flipped horizontally)
const mirroredX = canvasWidth - scaledX;

// Step 3: Draw at transformed position
ctx.arc(mirroredX, scaledY, 10, 0, 2 * Math.PI);
```

### 2. React Overlay Dots (FIXED)
Updated the absolutely positioned eye indicator dots to use mirrored percentage values:

**Before:**
```typescript
left: `${(gazeData.leftEyePosition.x / videoWidth) * 100}%`
```

**After:**
```typescript
// Mirror X: 100 - (raw.x / videoWidth * 100)
left: `${100 - (gazeData.leftEyePosition.x / videoWidth) * 100}%`
// Y stays the same: raw.y / videoHeight * 100
top: `${(gazeData.leftEyePosition.y / videoHeight) * 100}%`
```

## Transformation Pipeline

### Complete Flow:
1. **FaceMesh Detection**: Returns landmarks in original video coordinate space (0 to videoWidth/Height)
2. **Scale to Canvas**: Multiply by scale factors (canvasWidth/videoWidth, canvasHeight/videoHeight)
3. **Mirror Horizontally**: Subtract from canvas width (canvasWidth - scaledX)
4. **Draw/Position**: Use transformed coordinates

### Formula Summary:
```
scaledX = raw.x * (canvasWidth / videoWidth)
scaledY = raw.y * (canvasHeight / videoHeight)
mirroredX = canvasWidth - scaledX

For CSS positioning (percentage):
left = 100 - (raw.x / videoWidth * 100)
top = raw.y / videoHeight * 100
```

## Result
✅ Eye markers now stay attached to the face naturally
✅ Markers appear inside the bounding box when face is detected
✅ Both canvas and React overlays use consistent mirrored coordinates
✅ Turning head left/right/up/down shows proper tracking

## Files Modified
- `frontend/src/studyeye/components/VideoFeedDisplay.tsx`
  - Fixed React overlay dot positioning with mirrored X coordinates
  - Removed duplicate useEffect code
  - Added comments explaining transformation logic
