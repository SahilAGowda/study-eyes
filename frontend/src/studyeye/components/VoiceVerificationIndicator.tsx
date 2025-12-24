/**
 * VoiceVerificationIndicator Component
 * 
 * Displays real-time voice verification status during monitoring.
 * Shows when teacher is speaking vs unauthorized speakers.
 */

import React from 'react';
import type { AudioData } from '../types';

interface VoiceVerificationIndicatorProps {
  audioData: AudioData;
  enabled: boolean;
  hasProfile: boolean;
}

export const VoiceVerificationIndicator: React.FC<VoiceVerificationIndicatorProps> = ({
  audioData,
  enabled,
  hasProfile,
}) => {
  if (!enabled || !hasProfile) {
    return null;
  }

  const { isSpeaking, isTeacherSpeaking, speakerSimilarity, unauthorizedSpeakerDetected } = audioData;

  if (!isSpeaking) {
    return (
      <div className="voice-verification-indicator bg-gray-100 rounded-lg p-3 border border-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">No Speech Detected</span>
        </div>
      </div>
    );
  }

  if (isTeacherSpeaking) {
    return (
      <div className="voice-verification-indicator bg-green-50 rounded-lg p-3 border border-green-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800 font-medium">Teacher Speaking</span>
          </div>
          <div className="text-xs text-green-600">
            {Math.round((speakerSimilarity || 0) * 100)}% match
          </div>
        </div>
      </div>
    );
  }

  if (unauthorizedSpeakerDetected) {
    return (
      <div className="voice-verification-indicator bg-red-50 rounded-lg p-3 border border-red-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-800 font-medium">Unauthorized Speaker</span>
          </div>
          <div className="text-xs text-red-600">
            {Math.round((speakerSimilarity || 0) * 100)}% match
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-verification-indicator bg-yellow-50 rounded-lg p-3 border border-yellow-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-yellow-800 font-medium">Analyzing Speaker...</span>
        </div>
        <div className="text-xs text-yellow-600">
          {Math.round((speakerSimilarity || 0) * 100)}% match
        </div>
      </div>
    </div>
  );
};
