# StudyEye Core Functionality Fixes - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ProcessingOrchestrator                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │ faceDetector│  │objectDetector│  │     audioAnalyzer           │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────────────┘ │
│         │                │                                          │
│         ▼                ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              multiStudentTracker.processFrame()              │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ Per-Student Processing:                                 │ │   │
│  │  │  • headPoseEstimator → pose                             │ │   │
│  │  │  • gazeEstimator → attention                            │ │   │
│  │  │  • emotionRecognizer → emotion  ← FIX #1               │ │   │
│  │  │  • classifyBehaviorWithTemporal → behavior ← FIX #2    │ │   │
│  │  │  • calculateEngagementWithTemporal → engagement         │ │   │
│  │  │  • [NEW] checkPhoneDetection → behavior ← FIX #3       │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fix #1: Emotion Recognition (Yawning/Drowsy Detection)

### Current Problem
The `calculateDrowsyScore()` function doesn't detect yawning properly:
```typescript
// Current - only checks half-closed eyes and slack jaw
private calculateDrowsyScore(features, baseline): number {
  // Heavy/closing eyelids
  if (avgEyeOpenness < 0.4) score += (0.4 - avgEyeOpenness) * 0.5;
  // Slack jaw/mouth slightly open
  if (features.mouthOpenness > 0.1 && features.mouthOpenness < 0.4) score += 0.25;
  // Low facial activity
  score += Math.max(0, lowActivity) * 0.25;
}
```

### Solution Design

#### 1.1 Add Yawning Detection
```typescript
private calculateDrowsyScore(features: FacialFeatures, baseline: FacialFeatures): number {
  let score = 0;
  
  // YAWNING DETECTION (NEW - highest priority)
  // Yawn = wide open mouth + eye squint + stretched face
  const isYawning = 
    features.mouthOpenness > 0.5 &&           // Wide open mouth
    features.mouthHeight > baseline.mouthHeight * 1.5 && // Mouth stretched vertically
    features.eyeSquint > 0.3;                 // Eyes squinting during yawn
  
  if (isYawning) {
    score += 0.6; // Strong drowsy indicator
  }
  
  // Heavy/closing eyelids (existing)
  const avgEyeOpenness = (features.leftEyeOpenness + features.rightEyeOpenness) / 2;
  if (avgEyeOpenness < 0.4) {
    score += (0.4 - avgEyeOpenness) * 0.5;
  }
  
  // Slack jaw (existing but adjusted)
  if (features.mouthOpenness > 0.1 && features.mouthOpenness < 0.4 && !isYawning) {
    score += 0.2;
  }
  
  // Compare to baseline - deviation indicates fatigue
  const eyeDeviation = baseline.leftEyeOpenness - features.leftEyeOpenness;
  if (eyeDeviation > 0.2) {
    score += eyeDeviation * 0.3;
  }
  
  return Math.min(1, Math.max(0, score));
}
```

#### 1.2 Use Baseline in All Score Functions
Each emotion score function should compare current features to baseline:
```typescript
private calculateBoredScore(features: FacialFeatures, baseline: FacialFeatures): number {
  let score = 0;
  
  // Compare eye openness to baseline (droopy eyes)
  const eyeDropFromBaseline = baseline.leftEyeOpenness - features.leftEyeOpenness;
  if (eyeDropFromBaseline > 0.15) {
    score += eyeDropFromBaseline * 0.4;
  }
  
  // ... rest of existing logic
}
```

#### 1.3 Adjust Temporal Smoothing
```typescript
// In EmotionConfig
smoothingAlpha: 0.55,  // Changed from 0.4 (faster response to changes)

// Or implement adaptive smoothing
private applyTemporalSmoothing(emotion: StudentEmotion): StudentEmotion {
  const alpha = this.calculateAdaptiveAlpha(emotion);
  // Use higher alpha (faster change) when emotion differs significantly
}
```

---

## Fix #2: Note-taking Detection

### Current Problem
Pitch direction is inconsistent:
- `behaviorClassifier.ts`: `pitch < -15` (negative = looking down)
- `multiStudentTracker.ts`: `pitch > 15` (positive = looking down)

### Solution Design

#### 2.1 Standardize Pitch Convention
Based on `headPoseEstimator.ts` analysis:
- **Positive pitch** = looking DOWN (chin toward chest)
- **Negative pitch** = looking UP (chin away from chest)

Fix in `behaviorClassifier.ts`:
```typescript
// BEFORE (wrong)
noteTakingPitchThreshold: -15, // Looking down 15+ degrees

// AFTER (correct)
noteTakingPitchThreshold: 15, // Looking down 15+ degrees (positive)

private isNoteTaking(gazeData, objectData): { detected: boolean; confidence: number } {
  // BEFORE: const headDown = gazeData.headPose.pitch < this.config.noteTakingPitchThreshold;
  // AFTER:
  const headDown = gazeData.headPose.pitch > this.config.noteTakingPitchThreshold;
  // ... rest unchanged
}
```

#### 2.2 Make Note-taking Less Object-Dependent
In `multiStudentTracker.ts`:
```typescript
// RULE: Note Taking (ENHANCED)
// Primary: gaze → notes (looking down), stable attention
// Secondary: writing objects detected (bonus)
else if (
  student.attention.target === 'notes' &&
  student.pose.pitch > 15 &&  // Looking down
  gazeStability > 0.4         // Reduced from 0.5 for easier detection
) {
  primaryBehavior = 'note_taking';
  visualConfidence = student.attention.confidence;
}
// NEW: Also detect note-taking from head pose alone
else if (
  student.pose.pitch > 20 &&  // Significantly looking down
  gazeStability > 0.5 &&
  student.emotion.primaryEmotion !== 'drowsy'  // Not sleeping
) {
  primaryBehavior = 'note_taking';
  visualConfidence = 0.6; // Lower confidence without gaze confirmation
}
```

---

## Fix #3: Phone Detection in Multi-Student Mode

### Current Problem
Object detections are stored in orchestrator state but never passed to multi-student tracker.

### Solution Design

#### 3.1 Modify ProcessingOrchestrator
```typescript
// In processMultiStudentFrame()
private async processMultiStudentFrame(faceDetection: FaceDetectionResult): Promise<void> {
  try {
    // Pass object detections to multi-student tracker
    const classroomState = await multiStudentTracker.processFrame(
      faceDetection.faces,
      this.state.objectDetections  // NEW: pass objects
    );
    this.state.classroomState = classroomState;
    // ... rest unchanged
  }
}
```

#### 3.2 Modify MultiStudentTracker
```typescript
// Update processFrame signature
async processFrame(
  faces: DetectedFace[],
  objectDetections: ObjectDetectionResult[] = []  // NEW parameter
): Promise<ClassroomState> {
  this.frameNumber++;
  const currentTime = Date.now();
  
  // Store object detections for per-student processing
  this.currentObjectDetections = objectDetections;
  
  // ... existing logic
}

// Add phone detection to computeStudentSignals
private async computeStudentSignals(
  student: StudentState,
  face: DetectedFace,
  currentTime: number
): Promise<void> {
  // ... existing signal computation
  
  // NEW: Check for phone detection
  const phoneDetection = this.checkPhoneForStudent(student);
  if (phoneDetection.detected) {
    student.behavior.primaryBehavior = 'technology_use';
    student.behavior.overallConfidence = phoneDetection.confidence;
  }
}

// NEW: Check if phone overlaps with student bounding box
private checkPhoneForStudent(student: StudentState): { detected: boolean; confidence: number } {
  const phones = this.currentObjectDetections.filter(
    obj => obj.objectType === 'cell phone' && obj.confidence >= 0.35
  );
  
  for (const phone of phones) {
    // Check if phone bounding box overlaps with student
    const overlap = this.calculateBoundingBoxOverlap(
      student.boundingBox,
      phone.boundingBox
    );
    
    // If phone is near/overlapping student, they're likely using it
    if (overlap > 0.1 || this.isPhoneNearStudent(student, phone)) {
      return { detected: true, confidence: phone.confidence };
    }
  }
  
  return { detected: false, confidence: 0 };
}

private isPhoneNearStudent(student: StudentState, phone: ObjectDetectionResult): boolean {
  // Check if phone is within reasonable distance of student's face
  const studentCenter = {
    x: student.boundingBox.x + student.boundingBox.width / 2,
    y: student.boundingBox.y + student.boundingBox.height / 2
  };
  const phoneCenter = {
    x: phone.boundingBox.x + phone.boundingBox.width / 2,
    y: phone.boundingBox.y + phone.boundingBox.height / 2
  };
  
  const distance = Math.sqrt(
    Math.pow(studentCenter.x - phoneCenter.x, 2) +
    Math.pow(studentCenter.y - phoneCenter.y, 2)
  );
  
  // Phone within 2x face width is considered "near"
  return distance < student.boundingBox.width * 2;
}
```

#### 3.3 Adjust Object Detector Confidence
```typescript
// In objectDetector.ts
private config: ObjectDetectorConfig = {
  confidenceThreshold: 0.5,
  phoneConfidenceThreshold: 0.35,  // NEW: lower threshold for phones
  frameSkip: 2,
};

// In detectObjects()
const detections: ObjectDetectionResult[] = predictions
  .filter(pred => {
    const isPhone = pred.class.toLowerCase() === 'cell phone';
    const threshold = isPhone 
      ? this.config.phoneConfidenceThreshold 
      : this.config.confidenceThreshold;
    return pred.score >= threshold && this.TARGET_CLASSES.includes(pred.class.toLowerCase());
  })
  // ... rest unchanged
```

---

## Data Flow After Fixes

```
Frame N:
┌─────────────────────────────────────────────────────────────────────┐
│ 1. faceDetector.detectFaces() → faces[]                             │
│ 2. objectDetector.detectObjects() → objects[] (phones, pens, etc)   │
│                                                                     │
│ 3. multiStudentTracker.processFrame(faces, objects)                 │
│    │                                                                │
│    ├─► For each student:                                            │
│    │   ├─► headPoseEstimator → pitch, yaw, roll                     │
│    │   ├─► gazeEstimator → attention target                         │
│    │   ├─► emotionRecognizer → emotion (with yawn detection)        │
│    │   ├─► checkPhoneForStudent(objects) → phone detected?          │
│    │   ├─► classifyBehaviorWithTemporal → behavior                  │
│    │   │   (note-taking if pitch > 15°)                             │
│    │   └─► calculateEngagementWithTemporal → score                  │
│    │                                                                │
│    └─► Return ClassroomState with all student states                │
│                                                                     │
│ 4. UI displays per-student overlays with correct states             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Manual Testing Scenarios

1. **Yawning Test:**
   - Open mouth wide while looking at camera
   - Expected: Drowsy emotion detected, engagement drops

2. **Note-taking Test:**
   - Look down at desk/paper
   - Expected: Note-taking behavior detected, engagement stays medium-high

3. **Phone Test:**
   - Hold phone in front of face
   - Expected: Phone detected, technology_use behavior, engagement drops

### Debug Logging
Add console logs to verify each fix:
```typescript
// In emotionRecognizer
console.log('[Emotion] Yawn detected:', isYawning, 'Drowsy score:', score);

// In multiStudentTracker
console.log('[Behavior] Pitch:', student.pose.pitch, 'Note-taking:', primaryBehavior === 'note_taking');

// In phone detection
console.log('[Phone] Detected:', phoneDetection.detected, 'Near student:', student.id.id);
```
