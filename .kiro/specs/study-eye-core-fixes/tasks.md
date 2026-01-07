# StudyEye Core Functionality Fixes - Implementation Tasks

## Task Overview

| Task | Description | File | Priority | Status |
|------|-------------|------|----------|--------|
| 1 | Fix yawning/drowsy detection | emotionRecognizer.ts | HIGH | ✅ DONE |
| 2 | Use baseline in emotion calculations | emotionRecognizer.ts | HIGH | ✅ DONE |
| 3 | Adjust emotion temporal smoothing | emotionRecognizer.ts | MEDIUM | ✅ DONE |
| 4 | Fix note-taking pitch direction | behaviorClassifier.ts | HIGH | ✅ DONE |
| 5 | Fix note-taking pitch in tracker | multiStudentTracker.ts | HIGH | ✅ DONE |
| 6 | Make note-taking less object-dependent | multiStudentTracker.ts | MEDIUM | ✅ DONE |
| 7 | Pass objects to multi-student tracker | processingOrchestrator.ts | HIGH | ✅ DONE |
| 8 | Add phone detection per student | multiStudentTracker.ts | HIGH | ✅ DONE |
| 9 | Adjust phone confidence threshold | objectDetector.ts | MEDIUM | ✅ DONE |
| 10 | Add debug logging | multiple files | LOW | ✅ DONE |

---

## Task 1: Fix Yawning/Drowsy Detection
- [x] #1 Requirement: US-1 (Emotion-Based Engagement)
- [x] #2 File: `frontend/src/studyeye/services/emotionRecognizer.ts`
- [x] #3 Function: `calculateDrowsyScore()`
- [x] #4 Add yawning detection logic:
  - Wide mouth opening (mouthOpenness > 0.5)
  - Mouth height > baseline * 1.3
  - Eye squint during yawn (eyeSquint > 0.25)
  - If all conditions met, add 0.6 to drowsy score
- [x] #5 Verify drowsy score affects engagement calculation

---

## Task 2: Use Baseline in Emotion Calculations
- [x] #1 Requirement: US-1 (Emotion-Based Engagement)
- [x] #2 File: `frontend/src/studyeye/services/emotionRecognizer.ts`
- [x] #3 Update `calculateDrowsyScore()` to use baseline parameter
- [x] #4 Update `calculateBoredScore()` to use baseline parameter
- [x] #5 Update `calculateFocusedScore()` to use baseline parameter
- [x] #6 Update `calculateConfusedScore()` to use baseline parameter
- [x] #7 Update `calculateFrustratedScore()` to use baseline parameter
- [x] #8 Update `calculateSmileScore()` to use baseline parameter
- [x] #9 Update `calculateNeutralScore()` to use baseline parameter

---

## Task 3: Adjust Emotion Temporal Smoothing
- [x] #1 Requirement: US-1 (Emotion-Based Engagement)
- [x] #2 File: `frontend/src/studyeye/services/emotionRecognizer.ts`
- [x] #3 Change `smoothingAlpha` from 0.4 to 0.55 for faster response
- [x] #4 Verify emotion changes reflect in UI within 1-2 seconds

---

## Task 4: Fix Note-taking Pitch Direction in BehaviorClassifier
- [x] #1 Requirement: US-2 (Note-taking Detection)
- [x] #2 File: `frontend/src/studyeye/services/behaviorClassifier.ts`
- [x] #3 Change `noteTakingPitchThreshold` from -15 to 15 (positive = looking down)
- [x] #4 Update `isNoteTaking()` function:
  - Change `pitch < threshold` to `pitch > threshold`
- [x] #5 Verify note-taking detection works in legacy single-student mode

---

## Task 5: Fix Note-taking Pitch in MultiStudentTracker
- [x] #1 Requirement: US-2 (Note-taking Detection)
- [x] #2 File: `frontend/src/studyeye/services/multiStudentTracker.ts`
- [x] #3 Verify note-taking rule uses `pose.pitch > 15` (already correct)
- [x] #4 Reduce gazeStability threshold from 0.5 to 0.4 for easier detection

---

## Task 6: Make Note-taking Less Object-Dependent
- [x] #1 Requirement: US-2 (Note-taking Detection)
- [x] #2 File: `frontend/src/studyeye/services/multiStudentTracker.ts`
- [x] #3 Add fallback note-taking detection based on head pose alone:
  - If pitch > 20° AND gazeStability > 0.4 AND not drowsy
  - Classify as note_taking with 0.6 confidence
- [x] #4 Verify note-taking is detected without pen/pencil objects

---

## Task 7: Pass Object Detections to Multi-Student Tracker
- [x] #1 Requirement: US-3 (Phone Detection)
- [x] #2 File: `frontend/src/studyeye/services/processingOrchestrator.ts`
- [x] #3 Modify `processMultiStudentFrame()` to pass `this.state.objectDetections` to tracker
- [x] #4 Update `multiStudentTracker.processFrame()` call with objects parameter

---

## Task 8: Add Phone Detection Per Student
- [x] #1 Requirement: US-3 (Phone Detection)
- [x] #2 File: `frontend/src/studyeye/services/multiStudentTracker.ts`
- [x] #3 Add `currentObjectDetections` property to store objects
- [x] #4 Update `processFrame()` signature to accept objects parameter
- [x] #5 Add `checkPhoneForStudent()` method:
  - Filter objects for 'cell phone' with confidence >= 0.35
  - Check bounding box overlap with student
  - Check if phone is near student (within 2x face width)
- [x] #6 Add `calculateBoundingBoxOverlap()` helper method
- [x] #7 Add `isPhoneNearStudent()` helper method
- [x] #8 Call phone detection in `computeStudentSignals()`
- [x] #9 Set behavior to 'technology_use' when phone detected

---

## Task 9: Adjust Phone Confidence Threshold
- [x] #1 Requirement: US-3 (Phone Detection)
- [x] #2 File: `frontend/src/studyeye/services/objectDetector.ts`
- [x] #3 Add `phoneConfidenceThreshold: 0.35` to config
- [x] #4 Update `detectObjects()` to use lower threshold for phones
- [x] #5 Verify phone detection works in webcam conditions

---

## Task 10: Add Debug Logging (Optional)
- [x] #1 Requirement: All user stories
- [x] #2 Add console.log in emotionRecognizer for yawn detection (conditional)
- [x] #3 Add `enableDebugLogging` config option
- [x] #4 Debug logging only active when enabled

---

## Implementation Order

**Phase 1: Emotion Recognition (Tasks 1-3)** ✅ COMPLETE
1. Task 1: Fix yawning detection
2. Task 2: Use baseline in calculations
3. Task 3: Adjust smoothing

**Phase 2: Note-taking Detection (Tasks 4-6)** ✅ COMPLETE
4. Task 4: Fix pitch in behaviorClassifier
5. Task 5: Verify pitch in multiStudentTracker
6. Task 6: Add fallback detection

**Phase 3: Phone Detection (Tasks 7-9)** ✅ COMPLETE
7. Task 9: Adjust confidence threshold (do first)
8. Task 7: Pass objects to tracker
9. Task 8: Add per-student phone detection

**Phase 4: Testing & Debug (Task 10)** ✅ COMPLETE
10. Task 10: Add debug logging if needed

---

## Verification Checklist

After implementation, verify:

- [ ] **Yawning Test:** Open mouth wide → Drowsy detected → Engagement drops
- [ ] **Note-taking Test:** Look down at desk → Note-taking detected → Engagement medium-high
- [ ] **Phone Test:** Hold phone → Phone detected → Technology_use behavior → Engagement drops
- [ ] **No Regressions:** Existing gaze detection still works correctly
