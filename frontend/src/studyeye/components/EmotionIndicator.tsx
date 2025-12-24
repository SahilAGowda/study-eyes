/**
 * EmotionIndicator Component
 * 
 * Displays detected emotion with icon, label, and confidence.
 * Separate visual badge for emotion status.
 */

import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import {
  SentimentSatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as FrustratedIcon,
  Help as ConfusedIcon,
  Bedtime as DrowsyIcon,
  EventBusy as BoredIcon,
  Visibility as FocusedIcon,
  Psychology as EmotionIcon,
} from '@mui/icons-material';
import type { EmotionCategory } from '../types';

interface EmotionIndicatorProps {
  emotion: EmotionCategory;
  confidence: number; // 0-1
  lastUpdated?: Date;
}

export const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({
  emotion,
  confidence,
  lastUpdated,
}) => {
  // Get emotion display info with emoji
  const getEmotionInfo = (
    emotionType: EmotionCategory
  ): { label: string; emoji: string; icon: React.ReactNode; color: string } => {
    switch (emotionType) {
      case 'happy':
        return {
          label: 'Happy',
          emoji: '🙂',
          icon: <HappyIcon />,
          color: '#4caf50',
        };
      case 'confused':
        return {
          label: 'Confused',
          emoji: '😕',
          icon: <ConfusedIcon />,
          color: '#ff9800',
        };
      case 'frustrated':
        return {
          label: 'Frustrated',
          emoji: '😤',
          icon: <FrustratedIcon />,
          color: '#f44336',
        };
      case 'bored':
        return {
          label: 'Bored',
          emoji: '😑',
          icon: <BoredIcon />,
          color: '#9e9e9e',
        };
      case 'drowsy':
        return {
          label: 'Drowsy',
          emoji: '😴',
          icon: <DrowsyIcon />,
          color: '#673ab7',
        };
      case 'focused':
        return {
          label: 'Focused',
          emoji: '🧐',
          icon: <FocusedIcon />,
          color: '#2196f3',
        };
      case 'neutral':
      default:
        return {
          label: 'Neutral',
          emoji: '😐',
          icon: <NeutralIcon />,
          color: '#757575',
        };
    }
  };

  const { label, emoji, icon, color } = getEmotionInfo(emotion);
  const confidencePercent = Math.round(confidence * 100);

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
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmotionIcon sx={{ color: '#4caf50', fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Detected Emotion
        </Typography>
      </Box>

      {/* Emotion Display */}
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
            fontSize: '28px',
          }}
        >
          {emoji}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: color, mb: 0.5 }}>
            {emoji} {label}
          </Typography>
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

export default EmotionIndicator;
