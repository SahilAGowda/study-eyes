# Voice Verification Integration Guide

## Quick Start Integration

This guide shows how to integrate the voice verification system into the existing StudyEye monitoring system.

## Step 1: Update ProcessingOrchestrator

Add voice verification to the main processing orchestrator:

```typescript
// frontend/src/studyeye/services/processingOrchestrator.ts

import { AudioAnalyzer } from './audioAnalyzer';
import type { VoiceProfile } from '../types';

export class ProcessingOrchestrator {
  private audioAnalyzer: AudioAnalyzer;
  private voiceVerificationEnabled: boolean = false;

  constructor() {
    // Initialize with voice verification
    this.audioAnalyzer = new AudioAnalyzer({
      voiceVerificationEnabled: false, // Enable after enrollment
      voiceSimilarityThreshold: 0.7,
      updateInterval: 100,
    });
  }

  async initialize() {
    // ... existing initialization code ...
    
    // Initialize audio
    await this.audioAnalyzer.initializeAudio();
  }

  enableVoiceVerification() {
    this.voiceVerificationEnabled = true;
    // Update config
    this.audioAnalyzer = new AudioAnalyzer({
      voiceVerificationEnabled: true,
      voiceSimilarityThreshold: 0.7,
    });
  }

  async enrollTeacherVoice(duration: number = 12): Promise<VoiceProfile> {
    const profile = await this.audioAnalyzer.enrollTeacherVoice(duration);
    this.enableVoiceVerification();
    return profile;
  }

  getAudioData() {
    return this.audioAnalyzer.getAudioData();
  }

  setupVoiceVerificationEvents(callbacks: {
    onTeacherVoice?: () => void;
    onUnauthorizedSpeaker?: () => void;
  }) {
    if (callbacks.onTeacherVoice) {
      this.audioAnalyzer.on('teacher_voice_detected', callbacks.onTeacherVoice);
    }
    if (callbacks.onUnauthorizedSpeaker) {
      this.audioAnalyzer.on('unauthorized_speaker_detected', callbacks.onUnauthorizedSpeaker);
    }
  }
}
```

## Step 2: Add to StudyEyeDashboard

Integrate voice enrollment into the main dashboard:

```typescript
// frontend/src/studyeye/components/StudyEyeDashboard.tsx

import React, { useState } from 'react';
import { VoiceEnrollment } from './VoiceEnrollment';
import { VoiceVerificationIndicator } from './VoiceVerificationIndicator';

export const StudyEyeDashboard: React.FC = () => {
  const [showVoiceEnrollment, setShowVoiceEnrollment] = useState(false);
  const [voiceVerificationEnabled, setVoiceVerificationEnabled] = useState(false);
  const [audioData, setAudioData] = useState(null);

  // ... existing state and hooks ...

  const handleEnrollTeacher = async () => {
    setShowVoiceEnrollment(true);
  };

  const handleEnrollmentComplete = (profile) => {
    console.log('Teacher voice enrolled:', profile);
    setVoiceVerificationEnabled(true);
    setShowVoiceEnrollment(false);
    
    // Set up event listeners
    orchestrator.setupVoiceVerificationEvents({
      onUnauthorizedSpeaker: () => {
        // Trigger alert
        alert('Unauthorized speaker detected!');
        // Log event
        logSecurityEvent('unauthorized_speaker');
      },
    });
  };

  // Update audio data periodically
  useEffect(() => {
    if (!orchestrator) return;

    const interval = setInterval(() => {
      setAudioData(orchestrator.getAudioData());
    }, 100);

    return () => clearInterval(interval);
  }, [orchestrator]);

  return (
    <div className="studyeye-dashboard">
      {/* Existing dashboard content */}
      
      {/* Voice Verification Controls */}
      <div className="voice-verification-section">
        {!voiceVerificationEnabled && (
          <button
            onClick={handleEnrollTeacher}
            className="btn-primary"
          >
            Enable Voice Verification
          </button>
        )}

        {voiceVerificationEnabled && audioData && (
          <VoiceVerificationIndicator
            audioData={audioData}
            enabled={voiceVerificationEnabled}
            hasProfile={true}
          />
        )}
      </div>

      {/* Voice Enrollment Modal */}
      {showVoiceEnrollment && (
        <div className="modal-overlay">
          <VoiceEnrollment
            onEnrollmentComplete={handleEnrollmentComplete}
            onCancel={() => setShowVoiceEnrollment(false)}
            enrollmentFunction={(duration) => orchestrator.enrollTeacherVoice(duration)}
            getProgressFunction={() => orchestrator.audioAnalyzer.getEnrollmentProgress()}
          />
        </div>
      )}
    </div>
  );
};
```

## Step 3: Add to Exam Mode

For exam monitoring, integrate unauthorized speaker detection:

```typescript
// frontend/src/studyeye/services/modeManager.ts

export class ModeManager {
  private voiceVerificationEnabled: boolean = false;

  setExamMode() {
    this.currentMode = 'exam';
    
    // Enable voice verification for exam mode
    if (this.voiceVerificationEnabled) {
      this.setupExamVoiceMonitoring();
    }
  }

  private setupExamVoiceMonitoring() {
    this.orchestrator.setupVoiceVerificationEvents({
      onUnauthorizedSpeaker: () => {
        // Log exam violation
        this.logExamEvent({
          event_type: 'unauthorized_speaker',
          timestamp: Date.now(),
          severity: 'high',
        });

        // Increment violation count
        this.examViolations.unauthorized_speaker++;

        // Trigger alert if threshold exceeded
        if (this.examViolations.unauthorized_speaker > 3) {
          this.triggerExamAlert('Multiple unauthorized speakers detected');
        }
      },
    });
  }

  getExamOutput(): ExamOutput {
    return {
      event_type: 'unauthorized_speaker',
      count: this.examViolations.unauthorized_speaker || 0,
      timestamp: Date.now(),
    };
  }
}
```

## Step 4: Add to Teacher LiveSession

For teacher monitoring view:

```typescript
// frontend/src/components/teacher/LiveSession.jsx

import { VoiceVerificationIndicator } from '../../studyeye/components/VoiceVerificationIndicator';

export const LiveSession = () => {
  const [audioData, setAudioData] = useState(null);
  const [voiceVerificationEnabled, setVoiceVerificationEnabled] = useState(false);

  // ... existing code ...

  return (
    <div className="live-session">
      {/* Existing session content */}

      {/* Voice Verification Status */}
      {voiceVerificationEnabled && (
        <div className="voice-status-panel">
          <h3>Voice Verification</h3>
          <VoiceVerificationIndicator
            audioData={audioData}
            enabled={voiceVerificationEnabled}
            hasProfile={true}
          />
        </div>
      )}

      {/* Student Grid */}
      <div className="students-grid">
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            audioData={student.audioData}
            voiceVerificationEnabled={voiceVerificationEnabled}
          />
        ))}
      </div>
    </div>
  );
};
```

## Step 5: Add Settings/Configuration

Add voice verification settings to privacy controls:

```typescript
// frontend/src/studyeye/components/PrivacyControls.tsx

export const PrivacyControls: React.FC = () => {
  const [voiceVerificationEnabled, setVoiceVerificationEnabled] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  return (
    <div className="privacy-controls">
      {/* Existing privacy controls */}

      <div className="control-section">
        <h3>Voice Verification</h3>
        
        <label className="control-item">
          <input
            type="checkbox"
            checked={voiceVerificationEnabled}
            onChange={(e) => setVoiceVerificationEnabled(e.target.checked)}
          />
          <span>Enable Teacher Voice Verification</span>
        </label>

        {voiceVerificationEnabled && (
          <>
            <div className="control-item">
              <label>Similarity Threshold: {Math.round(similarityThreshold * 100)}%</label>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              />
            </div>

            <div className="privacy-notice">
              <p>
                Voice profiles are stored in memory only and never saved to disk.
                All processing happens locally on your device.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

## Step 6: Add to Analytics

Track voice verification events in analytics:

```typescript
// backend/models/analytics.py

class SessionAnalytics:
    def __init__(self):
        self.unauthorized_speaker_events = []
        self.teacher_speaking_duration = 0
        self.student_speaking_duration = 0

    def log_voice_event(self, event_type, timestamp, similarity=None):
        event = {
            'type': event_type,
            'timestamp': timestamp,
            'similarity': similarity,
        }
        
        if event_type == 'unauthorized_speaker':
            self.unauthorized_speaker_events.append(event)
        
        return event

    def get_voice_statistics(self):
        return {
            'unauthorized_speakers': len(self.unauthorized_speaker_events),
            'teacher_speaking_time': self.teacher_speaking_duration,
            'student_speaking_time': self.student_speaking_duration,
            'total_voice_events': len(self.unauthorized_speaker_events),
        }
```

## Step 7: Add API Endpoints

Create endpoints for voice verification data:

```python
# backend/routes/analytics_routes.py

@analytics_bp.route('/voice-events', methods=['GET'])
@login_required
def get_voice_events():
    """Get voice verification events for a session"""
    session_id = request.args.get('session_id')
    
    # Fetch voice events from database
    events = VoiceEvent.query.filter_by(session_id=session_id).all()
    
    return jsonify({
        'events': [event.to_dict() for event in events],
        'statistics': calculate_voice_statistics(events),
    })

@analytics_bp.route('/unauthorized-speakers', methods=['GET'])
@login_required
def get_unauthorized_speakers():
    """Get unauthorized speaker detections"""
    session_id = request.args.get('session_id')
    
    events = VoiceEvent.query.filter_by(
        session_id=session_id,
        event_type='unauthorized_speaker'
    ).all()
    
    return jsonify({
        'count': len(events),
        'events': [event.to_dict() for event in events],
    })
```

## Complete Integration Example

Here's a complete example showing all pieces together:

```typescript
// frontend/src/studyeye/hooks/useVoiceVerification.ts

import { useState, useEffect, useCallback } from 'react';
import type { AudioAnalyzer } from '../services/audioAnalyzer';
import type { VoiceProfile, AudioData } from '../types';

export function useVoiceVerification(audioAnalyzer: AudioAnalyzer) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [unauthorizedSpeakerCount, setUnauthorizedSpeakerCount] = useState(0);

  // Update audio data
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      setAudioData(audioAnalyzer.getAudioData());
    }, 100);

    return () => clearInterval(interval);
  }, [isEnabled, audioAnalyzer]);

  // Set up event listeners
  useEffect(() => {
    if (!isEnabled) return;

    const handleUnauthorizedSpeaker = () => {
      setUnauthorizedSpeakerCount(prev => prev + 1);
      
      // Log to backend
      fetch('/api/analytics/voice-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'unauthorized_speaker',
          timestamp: Date.now(),
        }),
      });
    };

    audioAnalyzer.on('unauthorized_speaker_detected', handleUnauthorizedSpeaker);

    return () => {
      // Cleanup would go here if we had removeListener
    };
  }, [isEnabled, audioAnalyzer]);

  const enrollTeacher = useCallback(async (duration: number = 12) => {
    try {
      const profile = await audioAnalyzer.enrollTeacherVoice(duration);
      setHasProfile(true);
      setIsEnabled(true);
      return profile;
    } catch (error) {
      console.error('Enrollment failed:', error);
      throw error;
    }
  }, [audioAnalyzer]);

  const clearProfile = useCallback(() => {
    audioAnalyzer.clearTeacherVoiceProfile();
    setHasProfile(false);
    setIsEnabled(false);
    setUnauthorizedSpeakerCount(0);
  }, [audioAnalyzer]);

  return {
    isEnabled,
    hasProfile,
    audioData,
    unauthorizedSpeakerCount,
    enrollTeacher,
    clearProfile,
    getEnrollmentProgress: () => audioAnalyzer.getEnrollmentProgress(),
  };
}
```

## Usage in Component

```typescript
import { useVoiceVerification } from '../hooks/useVoiceVerification';

function MonitoringComponent() {
  const { orchestrator } = useStudyEye();
  const voiceVerification = useVoiceVerification(orchestrator.audioAnalyzer);

  return (
    <div>
      {!voiceVerification.hasProfile && (
        <button onClick={() => voiceVerification.enrollTeacher()}>
          Enroll Teacher Voice
        </button>
      )}

      {voiceVerification.isEnabled && (
        <>
          <VoiceVerificationIndicator
            audioData={voiceVerification.audioData}
            enabled={true}
            hasProfile={true}
          />

          <div className="stats">
            Unauthorized Speakers: {voiceVerification.unauthorizedSpeakerCount}
          </div>
        </>
      )}
    </div>
  );
}
```

## Testing Integration

```typescript
// Test voice verification integration
async function testVoiceVerification() {
  const orchestrator = new ProcessingOrchestrator();
  await orchestrator.initialize();

  // Enroll teacher
  console.log('Enrolling teacher...');
  const profile = await orchestrator.enrollTeacherVoice(12);
  console.log('Enrolled:', profile);

  // Monitor for 30 seconds
  let unauthorizedCount = 0;
  orchestrator.setupVoiceVerificationEvents({
    onUnauthorizedSpeaker: () => {
      unauthorizedCount++;
      console.log('Unauthorized speaker detected!', unauthorizedCount);
    },
  });

  await new Promise(resolve => setTimeout(resolve, 30000));
  console.log('Test complete. Unauthorized speakers:', unauthorizedCount);
}
```

## Summary

The voice verification system integrates seamlessly with the existing StudyEye architecture:

1. **ProcessingOrchestrator**: Central audio management
2. **StudyEyeDashboard**: UI for enrollment and monitoring
3. **ModeManager**: Exam mode integration
4. **LiveSession**: Teacher monitoring view
5. **PrivacyControls**: Settings and configuration
6. **Analytics**: Event tracking and reporting
7. **Custom Hook**: Reusable React integration

All components work together to provide comprehensive voice verification while maintaining privacy and performance standards.
