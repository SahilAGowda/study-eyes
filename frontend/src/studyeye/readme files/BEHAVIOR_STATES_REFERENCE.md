# Behavior States Reference Card

## Quick Reference: What Each State Means

### 🟢 Focused on Screen
**What it means**: Student is looking at the screen/camera with their face visible

**Detection criteria**:
- Face detected in frame (confidence ≥ 70%)
- Head pose within ±45° horizontal, ±35° vertical
- Focus confidence ≥ 60%
- No phone detected
- Not speaking or note-taking

**Transition delay**: 
- From "No Face" or "Phone": Immediate
- From "Looking Away": 3 seconds of consistent focus

**Example scenarios**:
- ✅ Looking directly at screen
- ✅ Slight head tilt while reading
- ✅ Natural micro-movements
- ✅ Leaning slightly forward/back

---

### 🟡 Looking Away / Distracted
**What it means**: Student's head is turned significantly away from the screen

**Detection criteria**:
- Face detected in frame
- Head pose beyond ±35° horizontal OR ±30° vertical
- Focus confidence < 40%
- Sustained for 3 seconds

**Transition delay**: 3 seconds

**Example scenarios**:
- ✅ Looking at another monitor
- ✅ Turned to talk to someone
- ✅ Looking at phone/paper on desk
- ❌ Brief glance to the side (< 3 seconds)

---

### 🔴 No Face Detected
**What it means**: No face is visible in the camera frame

**Detection criteria**:
- Face count = 0
- No facial landmarks detected

**Transition delay**: Immediate (critical state)

**Example scenarios**:
- ✅ Student left the room
- ✅ Camera covered
- ✅ Student moved out of frame
- ✅ Very poor lighting (face not detectable)

**Important**: This state will **never** show "Looking Away" - it specifically indicates no face is present.

---

### 🗣️ Speaking Detected
**What it means**: Audio activity detected from the student

**Detection criteria**:
- Face detected
- Audio energy above threshold
- Speech confidence ≥ 60%

**Transition delay**: 3 seconds

**Example scenarios**:
- ✅ Asking a question
- ✅ Participating in discussion
- ✅ Reading aloud

---

### ✍️ Note-taking / Writing
**What it means**: Student appears to be writing or taking notes

**Detection criteria**:
- Face detected
- Head tilted down (pitch < -15°)
- Optional: Writing objects detected (pen, paper, book)

**Transition delay**: 3 seconds

**Example scenarios**:
- ✅ Writing in notebook
- ✅ Taking notes on paper
- ✅ Reading from textbook

---

### 📱 Phone / Unauthorized Object Detected
**What it means**: Phone or unauthorized device detected in frame

**Detection criteria**:
- Phone object detected with confidence ≥ 50%

**Transition delay**: Immediate (critical state)

**Example scenarios**:
- ✅ Phone visible in hand
- ✅ Phone on desk in view
- ⚠️ May trigger false positives with similar objects

---

## State Transition Rules

### Immediate Transitions (No Delay)
These states change immediately without waiting:
- **To "No Face Detected"**: When face disappears
- **To "Phone Detected"**: When phone appears
- **From "No Face"**: When face reappears
- **From "Phone"**: When phone disappears

### Delayed Transitions (3 Second Confirmation)
These states require 3 seconds of consistent detection:
- **To "Looking Away"**: Must look away for 3 seconds
- **To "Focused"**: Must maintain focus for 3 seconds (except from critical states)
- **To "Speaking"**: Must speak for 3 seconds
- **To "Note-taking"**: Must maintain head-down position for 3 seconds

### Why the 3-Second Delay?
- Prevents flickering from brief eye movements
- Accounts for natural head movements during reading
- Reduces false positives from momentary glances
- Provides stable, reliable behavior classification

---

## Angle Reference Guide

### Head Pose Angles Explained

**Yaw (Left/Right Rotation)**:
```
        0° (Center)
         |
-45° ←---+---→ +45°
  Left   |   Right
```
- **0°**: Looking straight ahead
- **±20°**: Slight turn (still focused)
- **±35°**: Moderate turn (threshold for "looking away")
- **±45°**: Significant turn (definitely looking away)

**Pitch (Up/Down Rotation)**:
```
    -35° (Up)
       ↑
       |
    0° (Center)
       |
       ↓
    +35° (Down)
```
- **0°**: Looking straight ahead
- **-15°**: Looking slightly up
- **+15°**: Looking slightly down (reading)
- **±30°**: Threshold for "looking away"

---

## Confidence Scores

### Face Confidence
- **0.9-1.0**: Excellent detection (clear, well-lit face)
- **0.7-0.9**: Good detection (acceptable quality)
- **0.5-0.7**: Fair detection (poor lighting or angle)
- **< 0.5**: Poor detection (may not process)

### Focus Confidence
- **0.8-1.0**: Highly focused (looking directly at screen)
- **0.6-0.8**: Focused (within acceptable range)
- **0.4-0.6**: Moderately focused (borderline)
- **< 0.4**: Not focused (looking away)

---

## Troubleshooting Common Issues

### "Looking Away" when I'm actually focused
**Possible causes**:
1. Head tilted beyond 45° horizontally or 35° vertically
2. Poor lighting affecting face detection
3. Camera angle not optimal

**Solutions**:
- Adjust camera to be at eye level
- Improve lighting (face should be well-lit)
- Sit more centered in frame
- Reduce head tilt angle

### "No Face Detected" when my face is visible
**Possible causes**:
1. Very poor lighting
2. Face too far from camera
3. Face partially obscured
4. Camera quality issues

**Solutions**:
- Improve lighting (add front lighting)
- Move closer to camera
- Ensure face is fully visible
- Check camera permissions

### Behavior keeps changing rapidly
**Possible causes**:
1. Inconsistent head position
2. Poor lighting causing detection issues
3. System still in warm-up phase

**Solutions**:
- Maintain steady head position
- Improve lighting consistency
- Wait 10-15 seconds for system to stabilize

### System too slow to respond
**Expected behavior**: 3-second delay is intentional
- This prevents false positives
- Brief glances won't trigger "Looking Away"
- System prioritizes stability over speed

---

## Best Practices for Accurate Detection

### Camera Setup
✅ Position camera at eye level
✅ Ensure good front lighting
✅ Minimize backlighting (windows behind you)
✅ Keep face centered in frame
✅ Maintain 2-3 feet distance from camera

### During Use
✅ Sit in consistent position
✅ Avoid excessive head movements
✅ Keep face visible and well-lit
✅ Minimize background movement
✅ Use stable internet connection

### Environment
✅ Quiet room for audio detection
✅ Neutral background
✅ Consistent lighting
✅ Minimal distractions
✅ Stable seating position

---

## Technical Details

### Processing Pipeline
1. **Face Detection** (15 FPS): Detects face and landmarks
2. **Gaze Estimation** (15 FPS): Calculates head pose angles
3. **Behavior Classification** (every 3 seconds): Determines behavior state
4. **Temporal Smoothing**: Applies 3-second confirmation delay

### Performance Metrics
- Face detection: ~50-100ms per frame
- Gaze estimation: ~5-10ms per frame
- Behavior classification: ~1-2ms per update
- Total latency: ~100-150ms + 3-second confirmation

### Privacy
- All processing happens locally in browser
- No video/audio data sent to servers
- Only behavior labels and scores transmitted
- Face data never stored or transmitted
