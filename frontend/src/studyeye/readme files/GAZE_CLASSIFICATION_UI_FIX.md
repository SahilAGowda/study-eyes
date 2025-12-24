# Gaze Classification and UI Placement Fix

## Problems Fixed

### 1. Gaze Classification Logic
**Problem**: System marked users as "Focused on Screen" even when looking left/right/up/down because it wasn't using the `gazeDirection` information.

**Solution**: Enhanced the behavior classification logic to incorporate gaze direction:

```typescript
// Priority order for "Looking Away" detection:
1. No eyes detected → 95% confidence
2. Gaze direction NOT "center" → 80% confidence  
3. Eyes outside bounding box → 70% confidence
4. Both eyes + inside box + centered → Focused
```

### 2. UI Label Overlap
**Problem**: "Speaking Detected" label overlapped with the main engagement status label at top-left.

**Solution**: Separated label positions:
- **Main engagement status** (Focused/Distracted/No Face/Phone): Top-left
- **Speaking Detected**: Bottom-left (separate position)

## Changes Made

### A) Behavior Classifier (`behaviorClassifier.ts`)

Updated the classification logic in `performClassification()`:

```typescript
// Check for no eyes detected first (highest priority)
if (!gazeData.eyesDetected) {
  return {
    behaviorClass: 'looking_away',
    confidence: 0.95, // Very high confidence
    timestamp,
  };
}

// Check gaze direction - if not looking at center, user is distracted
if (gazeData.gazeDirection !== 'center') {
  return {
    behaviorClass: 'looking_away',
    confidence: 0.80, // High confidence - gaze indicates looking away
    timestamp,
  };
}

// Check if eyes are outside bounding box
if (!gazeData.eyesInsideBoundingBox) {
  return {
    behaviorClass: 'looking_away',
    confidence: 0.70, // Medium-high confidence
    timestamp,
  };
}

// If we reach here: both eyes + inside box + centered → Focused
```

### B) Video Feed Display (`VideoFeedDisplay.tsx`)

Updated `drawBehaviorLabel()` to position labels separately:

```typescript
// Speaking label at bottom-left
if (behaviorResult.behaviorClass === 'speaking') {
  const x = 20;
  const y = ctx.canvas.height - 30; // Bottom position
  // ... draw at bottom
} else {
  // All other behaviors at top-left
  const x = 20;
  const y = 30; // Top position
  // ... draw at top
}
```

## Classification Rules Summary

### Focused on Screen
- ✅ Both eyes detected
- ✅ Eyes inside bounding box
- ✅ Gaze direction = "center"
- Confidence: >85%

### Looking Away / Distracted
Triggered by ANY of:
- ❌ No eyes detected (95% confidence)
- ❌ Gaze direction is "left", "right", "up", or "down" (80% confidence)
- ❌ Eyes outside bounding box (70% confidence)
- ❌ Only one eye detected (70% confidence)

### Speaking Detected
- 🎤 Audio activity detected
- Displayed at bottom-left (never overlaps focus status)
- Confidence: Based on audio analysis

### No Face Detected
- ❌ Face count = 0
- Confidence: 100%

## Expected Behavior

✅ **When user looks away**: Classification switches to "Looking Away / Distracted"
✅ **When eyes are centered**: Label shows "Focused on Screen"
✅ **When speaking**: Label appears at bottom-left, separate from focus status
✅ **No visual overlap**: Speaking and focus indicators never overlap

## Files Modified

1. `frontend/src/studyeye/services/behaviorClassifier.ts`
   - Enhanced classification logic with gaze direction checks
   - Added confidence levels based on detection quality

2. `frontend/src/studyeye/components/VideoFeedDisplay.tsx`
   - Separated speaking label to bottom-left position
   - Main engagement status remains at top-left
   - No label overlap

## Testing Checklist

- [ ] Look left → Should show "Looking Away / Distracted"
- [ ] Look right → Should show "Looking Away / Distracted"
- [ ] Look up → Should show "Looking Away / Distracted"
- [ ] Look down → Should show "Looking Away / Distracted"
- [ ] Look at center → Should show "Focused on Screen"
- [ ] Speak while focused → "Speaking Detected" at bottom, no overlap
- [ ] Turn away completely → Should show "Looking Away / Distracted" or "No Face Detected"
