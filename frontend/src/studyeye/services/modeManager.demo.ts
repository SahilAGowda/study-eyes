/**
 * ModeManager Demo Script
 * 
 * Demonstrates the functionality of the ModeManager service
 * Run this to verify the implementation works correctly
 */

import { ModeManager } from './modeManager';
import { BehaviorResult, EngagementScore } from '../types';
import { AlertEvent } from './temporalAnalyzer';

// Create a ModeManager instance
const modeManager = new ModeManager('classroom');

console.log('=== ModeManager Demo ===\n');

// Demo 1: Classroom Mode Output
console.log('1. Classroom Mode Output:');
console.log('Current mode:', modeManager.getMode());
console.log('Mode config:', modeManager.getModeConfig());

const classroomBehavior: BehaviorResult = {
  behaviorClass: 'focused_on_screen',
  confidence: 0.92,
  timestamp: Date.now(),
};

const engagementScore: EngagementScore = {
  score: 85,
  level: 'high',
  trend: 'stable',
};

const alert: AlertEvent = {
  timestamp: Date.now(),
  type: 'engagement_drop',
  severity: 'medium',
  message: 'Engagement dropped by 35% in 10 seconds',
  metadata: {},
};

const classroomOutput = modeManager.formatOutput(classroomBehavior, engagementScore, alert);
console.log('Classroom output:', JSON.stringify(classroomOutput, null, 2));

// Demo 2: Switch to Exam Mode
console.log('\n2. Switching to Exam Mode:');
modeManager.setMode('exam');
console.log('Current mode:', modeManager.getMode());
console.log('Mode config:', modeManager.getModeConfig());

// Demo 3: Exam Mode Event Logging
console.log('\n3. Exam Mode Event Logging:');

const examBehaviors: BehaviorResult[] = [
  { behaviorClass: 'looking_away', confidence: 0.88, timestamp: Date.now() },
  { behaviorClass: 'focused_on_screen', confidence: 0.95, timestamp: Date.now() + 1000 },
  { behaviorClass: 'speaking', confidence: 0.75, timestamp: Date.now() + 2000 },
  { behaviorClass: 'looking_away', confidence: 0.82, timestamp: Date.now() + 3000 },
  { behaviorClass: 'phone_detected', confidence: 0.91, timestamp: Date.now() + 4000 },
];

examBehaviors.forEach((behavior, index) => {
  const output = modeManager.formatOutput(behavior, engagementScore);
  console.log(`Event ${index + 1} (${behavior.behaviorClass}):`, JSON.stringify(output, null, 2));
});

// Demo 4: Event Counts and Statistics
console.log('\n4. Event Counts and Statistics:');
console.log('Event counts:', Object.fromEntries(modeManager.getEventCounts()));
console.log('Total events in log:', modeManager.getEventLog().length);
console.log('Session statistics:', modeManager.getSessionStatistics());

// Demo 5: Event Log Filtering
console.log('\n5. Event Log Filtering:');
console.log('Looking away events:', modeManager.getEventLogByType('looking_away').length);
console.log('Speaking events:', modeManager.getEventLogByType('speaking').length);
console.log('Phone detected events:', modeManager.getEventLogByType('phone_detected').length);

// Demo 6: Switch back to Classroom Mode
console.log('\n6. Switching back to Classroom Mode:');
modeManager.setMode('classroom');
console.log('Current mode:', modeManager.getMode());
console.log('Event counts after mode switch:', Object.fromEntries(modeManager.getEventCounts()));

// Demo 7: Export Event Log
console.log('\n7. Export Event Log (JSON):');
const exportedLog = modeManager.exportEventLog();
console.log(exportedLog);

console.log('\n=== Demo Complete ===');
