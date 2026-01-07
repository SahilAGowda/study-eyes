# StudyEye Core Functionality Fixes - Requirements

## Problem Statement

The StudyEye monitoring system has three critical features that are NOT working:
1. **Emotion Recognition** - Yawning/drowsiness doesn't affect engagement score
2. **Note-taking Detection** - Writing notes is not recognized
3. **Phone Detection** - Watching phone is not detected

Only gaze/face detection works (looking at screen = focused, looking away = drops score).

## Root Cause Analysis

### Issue 1: Emotion Recognition Not Affecting Engagement

**Current Flow:**
```
emotionRecognizer.ts → multiStudentTracker.ts → engagement calculation
```

**Problems Found:**
1. `emotionRecognizer.ts` has `baseline` parameter declared but NEVER USED in 7 functions:
   - `calculateSmileScore(features, baseline)` - baseline unused
   - `calculateFocusedScore(features, baseline)` - baseline unused
   - `calculateConfusedScore(features, baseline)` - baseline unused
   - `calculateBoredScore(features, baseline)` - baseline unused
   - `calculateFrustratedScore(features, baseline)` - baseline unused
   - `calculateDrowsyScore(features, baseline)` - baseline unused
   - `calculateNeutralScore(features, baseline)` - baseline unused

2. **Drowsy detection is weak** - `calculateDrowsyScore()` only checks:
   - Eye openness < 0.4 (half-closed eyes)
   - Mouth slightly open (0.1-0.4)
   - Low facial activity
   - **MISSING: Yawning detection** (wide open mouth + squinted eyes)

3. **Temporal smoothing too aggressive** - `smoothingAlpha: 0.4` means 60% of previous value retained, making emotion changes slow to register

4. **Engagement calculation in multiStudentTracker** uses emotion scores correctly, but if emotion detection is wrong, engagement will be wrong

### Issue 2: Note-taking Detection Not Working

**Current Flow:**
```
behaviorClassifier.ts → checks head pitch + object detection
multiStudentTracker.ts → classifyBehaviorWithTemporal() → checks attention.target === 'notes'
```

**Problems Found:**
1. **In behaviorClassifier.ts:**
   - Note-taking requires: `headPose.pitch < -15°` (looking down) AND writing objects detected
   - Writing objects: 'book', 'pen', 'pencil' from COCO-SSD
   - **ISSUE:** COCO-SSD rarely detects pens/pencils reliably in webcam footage

2. **In multiStudentTracker.ts:**
   - Note-taking rule: `attention.target === 'notes' && pose.pitch > 15 && gazeStability > 0.5`
   - **ISSUE:** Conflicting pitch direction! behaviorClassifier uses `< -15` (negative), multiStudentTracker uses `> 15` (positive)
   - This inconsistency means note-taking is NEVER detected

3. **Object detector frame skipping:**
   - `objectDetector.ts` processes every 2-3 frames
   - `processingOrchestrator.ts` runs object detection every 5th frame
   - Combined: objects detected every 10-15 frames = very sparse detection

### Issue 3: Phone Detection Not Working

**Current Flow:**
```
objectDetector.ts (COCO-SSD) → processingOrchestrator.ts → behaviorClassifier.ts
```

**Problems Found:**
1. **Object detection is NOT integrated into multi-student pipeline:**
   - `processingOrchestrator.ts` stores `objectDetections` in state
   - BUT `multiStudentTracker.processFrame()` only receives `faces` array
   - **Object detections are NEVER passed to per-student processing!**

2. **behaviorClassifier.ts** checks for phones correctly:
   ```typescript
   const phoneDetected = this.isPhoneDetected(objectData);
   if (phoneDetected.detected) {
     return { behaviorClass: 'phone_detected', ... };
   }
   ```
   - But this is only used in LEGACY single-student mode
   - Multi-student mode in `multiStudentTracker` doesn't receive object data

3. **COCO-SSD confidence threshold:**
   - Default: `confidenceThreshold: 0.5`
   - Phone detection in real webcam conditions often has lower confidence
   - May need to lower to 0.3-0.4 for phones specifically

---

## User Stories

### US-1: Emotion-Based Engagement
**As a** teacher monitoring students
**I want** the system to detect when students are yawning or drowsy
**So that** I can see their engagement score drop and take action

**Acceptance Criteria:**
- [ ] Yawning (wide open mouth + squinted eyes) triggers drowsy detection
- [ ] Drowsy emotion causes engagement score to drop to "low" or "disengaged"
- [ ] Emotion changes reflect in UI within 1-2 seconds (not 5+ seconds)
- [ ] Baseline comparison is used to detect changes from neutral state

### US-2: Note-taking Detection
**As a** teacher monitoring students
**I want** the system to detect when students are taking notes
**So that** I can see they are engaged in a productive activity

**Acceptance Criteria:**
- [ ] Looking down (head pitch > 15°) triggers note-taking consideration
- [ ] Note-taking is detected even without pen/pencil object detection
- [ ] Note-taking behavior shows as "Note-taking" state in UI
- [ ] Note-taking maintains high engagement score (80-85)

### US-3: Phone Detection
**As a** teacher monitoring students
**I want** the system to detect when students are using phones
**So that** I can see unauthorized device usage

**Acceptance Criteria:**
- [ ] Phone detection works in multi-student mode
- [ ] Phone detected triggers "Phone Detected" state
- [ ] Phone usage drops engagement score significantly
- [ ] Phone detection confidence threshold is appropriate for webcam conditions

---

## Technical Requirements

### TR-1: Fix Emotion Recognition
1. Implement yawning detection in `calculateDrowsyScore()`:
   - Wide mouth opening (mouthOpenness > 0.5)
   - Eye squint during yawn
   - Combine with existing drowsy indicators

2. Use baseline comparison in emotion score calculations:
   - Compare current features to baseline
   - Detect deviations from neutral state

3. Reduce temporal smoothing for faster response:
   - Change `smoothingAlpha` from 0.4 to 0.5-0.6
   - Or implement adaptive smoothing

### TR-2: Fix Note-taking Detection
1. Fix pitch direction inconsistency:
   - Standardize on positive pitch = looking down
   - Update both `behaviorClassifier.ts` and `multiStudentTracker.ts`

2. Make note-taking detection less dependent on object detection:
   - Primary: head pitch > 15° (looking down)
   - Secondary: writing objects detected (bonus confidence)
   - Tertiary: stable gaze while looking down

### TR-3: Fix Phone Detection
1. Pass object detections to multi-student tracker:
   - Modify `processingOrchestrator.processMultiStudentFrame()` to include objects
   - Modify `multiStudentTracker.processFrame()` to accept objects parameter

2. Add phone detection to per-student behavior classification:
   - Check if phone bounding box overlaps with student bounding box
   - Trigger 'technology_use' behavior for that student

3. Adjust confidence threshold:
   - Lower phone detection threshold to 0.35
   - Keep other objects at 0.5

---

## Files to Modify

1. `frontend/src/studyeye/services/emotionRecognizer.ts`
   - Fix yawning detection
   - Use baseline in score calculations
   - Adjust smoothing

2. `frontend/src/studyeye/services/multiStudentTracker.ts`
   - Fix note-taking pitch direction
   - Add object detection integration
   - Add phone detection per student

3. `frontend/src/studyeye/services/processingOrchestrator.ts`
   - Pass object detections to multi-student tracker

4. `frontend/src/studyeye/services/objectDetector.ts`
   - Adjust phone confidence threshold

5. `frontend/src/studyeye/services/behaviorClassifier.ts`
   - Fix note-taking pitch direction (for legacy mode consistency)
