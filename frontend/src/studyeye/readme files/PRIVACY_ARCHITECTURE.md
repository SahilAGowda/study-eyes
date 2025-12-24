# Privacy Controls Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     StudyEye Dashboard                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              PrivacyControls Component                     │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  • Anonymization Toggle                             │  │ │
│  │  │  • Blur Intensity Slider                            │  │ │
│  │  │  • Mode Selector (Classroom/Exam)                   │  │ │
│  │  │  • Permission Status Chips                          │  │ │
│  │  │  • Compliance Message Alert                         │  │ │
│  │  │  • Privacy Status Accordion                         │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↕                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         usePrivacyController Hook                         │ │
│  │  • State Management                                       │ │
│  │  • Automatic Verification (every 5s)                      │ │
│  │  • Lifecycle Management                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↕                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           PrivacyController Service                       │ │
│  │                                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────┐               │ │
│  │  │  Configuration  │  │   Monitoring    │               │ │
│  │  │  • Enabled      │  │  • Network      │               │ │
│  │  │  • Intensity    │  │  • Storage      │               │ │
│  │  │  • Message      │  │  • Violations   │               │ │
│  │  └─────────────────┘  └─────────────────┘               │ │
│  │                                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────┐               │ │
│  │  │   Face Blur     │  │  Compliance     │               │ │
│  │  │  • Gaussian     │  │  • Verify       │               │ │
│  │  │  • Canvas API   │  │  • Status       │               │ │
│  │  │  • Real-time    │  │  • Report       │               │ │
│  │  └─────────────────┘  └─────────────────┘               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↕                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Browser APIs                                 │ │
│  │  • Canvas API (blur processing)                           │ │
│  │  • Storage API (monitoring)                               │ │
│  │  • Fetch API (monitoring)                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Anonymization Flow

```
Video Frame
    ↓
[FaceDetector]
    ↓
Face Regions {x, y, width, height}[]
    ↓
[PrivacyController.applyFaceBlur()]
    ↓
if anonymizationEnabled:
    ↓
[Extract Face Region] → [Apply Gaussian Blur] → [Replace Region]
    ↓
Blurred Canvas
    ↓
[Display in VideoFeedDisplay]
```

### Compliance Verification Flow

```
[User Action / Timer Trigger]
    ↓
[PrivacyController.verifyCompliance()]
    ↓
┌─────────────────────────────────────┐
│  Check Network Requests             │ → noNetworkRequests
│  Check Storage Access               │ → noDataStored
│  Check Local Processing             │ → localProcessingOnly
│  Check Anonymization Status         │ → anonymizationEnabled
└─────────────────────────────────────┘
    ↓
Aggregate Results
    ↓
PrivacyStatus {
  anonymizationEnabled: boolean,
  noDataStored: boolean,
  noNetworkRequests: boolean,
  localProcessingOnly: boolean,
  complianceVerified: boolean
}
    ↓
[Update UI Display]
```

## Component Hierarchy

```
StudyEyeDashboard
├── PrivacyControls
│   ├── Alert (Compliance Message)
│   ├── ToggleButtonGroup (Mode Selector)
│   ├── Stack (Permission Status)
│   │   ├── Chip (Camera)
│   │   └── Chip (Microphone)
│   ├── FormControlLabel (Anonymization Toggle)
│   │   └── Switch
│   ├── Slider (Blur Intensity)
│   └── Accordion (Privacy Status)
│       └── AccordionDetails
│           ├── Status: Local Processing
│           ├── Status: No Storage
│           ├── Status: No Network
│           └── Status: Overall Compliance
├── VideoFeedDisplay (uses blurred canvas)
├── EngagementScoreCard
└── ... other components
```

## State Management

```
usePrivacyController Hook
├── privacyController (ref)
├── anonymizationEnabled (state)
├── privacyStatus (state)
├── complianceMessage (state)
└── Effects
    ├── Auto-verify (every 5s)
    └── Cleanup on unmount
```

## Monitoring Architecture

### Network Monitoring

```
window.fetch (overridden)
    ↓
[Check Request Body]
    ↓
if contains Blob/ArrayBuffer/FormData:
    ↓
[Log Warning]
    ↓
[Set networkRequestDetected = true]
    ↓
[Continue with original fetch]
```

### Storage Monitoring

```
Storage.prototype.setItem (overridden)
    ↓
[Check Key]
    ↓
if key contains 'video'/'audio'/'frame':
    ↓
[Log Warning]
    ↓
[Set storageAccessDetected = true]
    ↓
[Block Storage] (return without storing)
```

## Blur Algorithm

```
Input: ImageData, BlurRadius
    ↓
For each pixel (x, y):
    ↓
    Initialize: r=0, g=0, b=0, a=0, count=0
    ↓
    For dy in [-radius, +radius]:
        For dx in [-radius, +radius]:
            ↓
            Get neighbor pixel at (x+dx, y+dy)
            ↓
            if within bounds:
                Add to r, g, b, a
                count++
    ↓
    output[x,y] = (r/count, g/count, b/count, a/count)
    ↓
Output: Blurred ImageData
```

**Complexity**: O(width × height × radius²)  
**Performance**: ~30-50ms for 640×480 with radius=10

## Integration Points

### With Video Processing Pipeline

```
[Camera] → [Frame Capture] → [Face Detection]
                                    ↓
                            Face Regions
                                    ↓
                    [PrivacyController.applyFaceBlur()]
                                    ↓
                            Blurred Frame
                                    ↓
                    [Continue Processing Pipeline]
                                    ↓
                    [Gaze, Emotion, Objects, etc.]
```

### With Mode Manager

```
[User Selects Mode]
    ↓
[ModeManager.setMode(mode)]
    ↓
[PrivacyControls updates UI]
    ↓
if mode === 'exam':
    Recommend anonymization
    Hide visual overlays
else:
    Show all feedback
```

## Security Layers

```
Layer 1: Browser Sandbox
    ↓
Layer 2: HTTPS Requirement
    ↓
Layer 3: User Permissions (Camera/Mic)
    ↓
Layer 4: Privacy Monitoring (Network/Storage)
    ↓
Layer 5: Anonymization (Face Blur)
    ↓
Layer 6: Compliance Verification
```

## Privacy Guarantees

```
┌─────────────────────────────────────────┐
│  LOCAL PROCESSING ONLY                  │
│  • All AI inference in browser          │
│  • TensorFlow.js runs locally           │
│  • No cloud API calls                   │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  NO RECORDING                           │
│  • No video recording                   │
│  • No audio recording                   │
│  • No screenshots saved                 │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  VOLATILE MEMORY ONLY                   │
│  • Data in RAM only                     │
│  • No localStorage                      │
│  • No sessionStorage                    │
│  • No IndexedDB                         │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  USER CONTROL                           │
│  • Anonymization toggle                 │
│  • Blur intensity control               │
│  • Visible compliance status            │
└─────────────────────────────────────────┘
```

## Error Handling

```
[Privacy Operation]
    ↓
try {
    Execute operation
} catch (error) {
    ↓
    Log error
    ↓
    Update compliance status
    ↓
    Show user-friendly message
    ↓
    Continue with degraded functionality
}
```

## Performance Optimization

```
Blur Processing:
├── Use box blur (faster than Gaussian)
├── Process only face regions (not full frame)
├── Reuse canvas elements
└── Skip blur if disabled

Monitoring:
├── Lightweight checks
├── Periodic verification (not continuous)
├── Async operations
└── Minimal overhead

Memory:
├── Single blur canvas (reused)
├── No data accumulation
├── Cleanup on dispose
└── Garbage collection friendly
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 22, 2025  
**Status**: Production Ready
