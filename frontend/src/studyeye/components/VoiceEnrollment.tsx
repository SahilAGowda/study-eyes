/**
 * VoiceEnrollment Component
 * 
 * UI for enrolling teacher's voice for speaker verification.
 * Guides teacher through the enrollment process.
 */

import React, { useState, useEffect } from 'react';
import type { VoiceEnrollmentProgress, VoiceProfile } from '../types';

interface VoiceEnrollmentProps {
  onEnrollmentComplete: (profile: VoiceProfile) => void;
  onCancel: () => void;
  enrollmentFunction: (duration: number) => Promise<VoiceProfile>;
  getProgressFunction: () => VoiceEnrollmentProgress;
}

export const VoiceEnrollment: React.FC<VoiceEnrollmentProps> = ({
  onEnrollmentComplete,
  onCancel,
  enrollmentFunction,
  getProgressFunction,
}) => {
  const [enrollmentState, setEnrollmentState] = useState<'idle' | 'enrolling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState<VoiceEnrollmentProgress>({
    isEnrolling: false,
    progress: 0,
    remainingSeconds: 0,
    samplesCollected: 0,
    requiredSamples: 0,
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let intervalId: number | null = null;

    if (enrollmentState === 'enrolling') {
      intervalId = window.setInterval(() => {
        const currentProgress = getProgressFunction();
        setProgress(currentProgress);
      }, 100);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [enrollmentState, getProgressFunction]);

  const startEnrollment = async () => {
    setEnrollmentState('enrolling');
    setError('');

    try {
      const profile = await enrollmentFunction(12); // 12 seconds enrollment
      setEnrollmentState('complete');
      onEnrollmentComplete(profile);
    } catch (err) {
      setEnrollmentState('error');
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    }
  };

  const handleCancel = () => {
    setEnrollmentState('idle');
    onCancel();
  };

  return (
    <div className="voice-enrollment-container bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Teacher Voice Enrollment</h2>

      {enrollmentState === 'idle' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            To enable speaker verification, we need to record your voice for 12 seconds.
            This creates a voice profile that helps identify when you're speaking during class.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Speak naturally and continuously for 12 seconds</li>
              <li>You can read text, count numbers, or speak about any topic</li>
              <li>Maintain consistent volume and speaking pace</li>
              <li>Avoid long pauses or silence</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Privacy Notice:</h3>
            <p className="text-yellow-800 text-sm">
              Your voice profile is stored only in memory and is never saved to disk or transmitted over the network.
              It will be cleared when you close the session.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={startEnrollment}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Enrollment
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {enrollmentState === 'enrolling' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 animate-pulse">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Recording...</h3>
            <p className="text-gray-600">Please speak continuously</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progress * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Samples: {progress.samplesCollected} / {progress.requiredSamples}</span>
              <span>{progress.remainingSeconds.toFixed(1)}s remaining</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-700 text-sm">
              Suggestion: Read this text aloud or count from 1 to 50
            </p>
          </div>
        </div>
      )}

      {enrollmentState === 'complete' && (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Enrollment Complete!</h3>
          <p className="text-gray-600">
            Your voice profile has been created successfully. Speaker verification is now active.
          </p>
        </div>
      )}

      {enrollmentState === 'error' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Enrollment Failed</h3>
            <p className="text-red-600 mb-4">{error}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEnrollmentState('idle')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
