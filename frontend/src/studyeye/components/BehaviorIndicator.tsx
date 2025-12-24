/**
 * BehaviorIndicator Component
 * 
 * Displays current behavior classification with icon and confidence.
 * 
 * Requirements: 5.2, 5.5, 5.6
 */

import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import {
  Visibility as FocusedIcon,
  VisibilityOff as LookingAwayIcon,
  RecordVoiceOver as SpeakingIcon,
  Create as WritingIcon,
  PersonOff as NoFaceIcon,
  PhoneAndroid as PhoneIcon,
  Psychology as BehaviorIcon,
} from '@mui/icons-material';
import type { BehaviorClass, EmotionCategory } from '../types';

interface BehaviorIndicatorProps {
  behaviorClass: BehaviorClass;
  confidence: number; // 0-1
  lastUpdated?: Date;
  emotion?: EmotionCategory; // Optional emotion data
  emotionConfidence?: number; // Optional emotion confidence
}

export const BehaviorIndicator: React.FC<BehaviorIndicatorProps> = ({
  behaviorClass,
  confidence,
  lastUpdated,
  emotion,
  emotionConfidence,
}) => {
  // Get behavior display info
  const getBehaviorInfo = (
    behavior: BehaviorClass
  ): { label: string; icon: React.ReactNode; color: string } => {
    switch (behavior) {
      case 'focused_on_screen':
        return {
          label: 'Focused on Screen',
          icon: <FocusedIcon />,
          color: '#4caf50',
        };
      case 'looking_away':
        return {
          label: 'Looking Away / Distracted',
          icon: <LookingAwayIcon />,
          color: '#ff9800',
        };
      case 'speaking':
        return {
          label: 'Speaking Detected',
          icon: <SpeakingIcon />,
          color: '#2196f3',
        };
      case 'note_taking':
        return {
          label: 'Note-taking / Writing',
          icon: <WritingIcon />,
          color: '#9c27b0',
        };
      case 'no_face_detected':
        return {
          label: 'No Face Detected',
          icon: <NoFaceIcon />,
          color: '#f44336',
        };
      case 'phone_detected':
        return {
          label: 'Phone / Unauthorized Object',
          icon: <PhoneIcon />,
          color: '#f44336',
        };
      default:
        return {
          label: 'Unknown',
          icon: <BehaviorIcon />,
          color: '#757575',
        };
    }
  };

  const { label, icon, color } = getBehaviorInfo(behaviorClass);
  const confidencePercent = Math.round(confidence * 100);

  // Get emotion emoji and label
  const getEmotionDisplay = (emotionType?: EmotionCategory): { emoji: string; label: string; color: string } => {
    if (!emotionType) return { emoji: '😐', label: 'Neutral', color: '#757575' };
    
    switch (emotionType) {
      case 'happy':
        return { emoji: '🙂', label: 'Happy', color: '#4caf50' };
      case 'confused':
        return { emoji: '😕', label: 'Confused', color: '#ff9800' };
      case 'frustrated':
        return { emoji: '😤', label: 'Frustrated', color: '#f44336' };
      case 'bored':
        return { emoji: '😑', label: 'Bored', color: '#9e9e9e' };
      case 'drowsy':
        return { emoji: '😴', label: 'Drowsy', color: '#673ab7' };
      case 'focused':
        return { emoji: '🧐', label: 'Focused', color: '#2196f3' };
      case 'neutral':
      default:
        return { emoji: '😐', label: 'Neutral', color: '#757575' };
    }
  };

  const emotionDisplay = getEmotionDisplay(emotion);
  const emotionConfidencePercent = emotionConfidence ? Math.round(emotionConfidence * 100) : 0;

  // Format last updated time
  const formatLastUpdated = (date?: Date | number): string => {
    if (!date) return 'Just now';
    const timestamp = typeof date === 'number' ? date : date.getTime();
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2.5,
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(156, 39, 176, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BehaviorIcon sx={{ color: '#2196f3', fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Current Behavior
        </Typography>
      </Box>

      {/* Behavior Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}20`,
            color: color,
            fontSize: 28,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: color, mb: 0.5 }}>
            {label}
          </Typography>
          {emotion && (
            <Typography variant="body2" sx={{ fontWeight: 500, color: emotionDisplay.color, mb: 0.5 }}>
              {emotionDisplay.emoji} Emotion: {emotionDisplay.label} ({emotionConfidencePercent}%)
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatLastUpdated(lastUpdated)}
          </Typography>
        </Box>
      </Box>

      {/* Confidence Bar */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Confidence
          </Typography>
          <Typography variant="caption" sx={{ color: color, fontWeight: 600 }}>
            {confidencePercent}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={confidencePercent}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 4,
              transition: 'transform 0.5s ease',
            },
          }}
        />
      </Box>

      {/* Status Chip */}
      <Chip
        label={confidencePercent >= 70 ? 'High Confidence' : confidencePercent >= 50 ? 'Medium Confidence' : 'Low Confidence'}
        size="small"
        sx={{
          backgroundColor: `${color}15`,
          color: color,
          fontWeight: 600,
          fontSize: '0.7rem',
        }}
      />
    </Paper>
  );
};

export default BehaviorIndicator;
