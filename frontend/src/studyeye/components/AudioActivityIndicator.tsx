/**
 * AudioActivityIndicator Component
 * 
 * Displays audio activity status with animated level meter.
 * 
 * Requirements: 5.2, 5.5, 5.6
 */

import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as AudioIcon,
} from '@mui/icons-material';

interface AudioActivityIndicatorProps {
  isActive: boolean;
  audioLevel: number; // 0-100
  isSpeaking: boolean;
  lastUpdated?: Date;
}

export const AudioActivityIndicator: React.FC<AudioActivityIndicatorProps> = ({
  isActive,
  audioLevel,
  isSpeaking,
  lastUpdated,
}) => {
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

  const statusColor = isSpeaking ? '#2196f3' : '#757575';
  const statusLabel = isSpeaking ? 'Speaking' : 'Silent';

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2.5,
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AudioIcon sx={{ color: '#2196f3', fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Audio Activity
        </Typography>
      </Box>

      {/* Status Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          {isSpeaking ? (
            <MicIcon sx={{ fontSize: 28 }} />
          ) : (
            <MicOffIcon sx={{ fontSize: 28 }} />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: statusColor, mb: 0.5 }}>
            {statusLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatLastUpdated(lastUpdated)}
          </Typography>
        </Box>
      </Box>

      {/* Audio Level Meter */}
      {isActive && (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Audio Level
            </Typography>
            <Typography variant="caption" sx={{ color: statusColor, fontWeight: 600 }}>
              {Math.round(audioLevel)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={audioLevel}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: statusColor,
                borderRadius: 4,
                transition: 'transform 0.2s ease',
                animation: isSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
              },
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.7,
                },
              },
            }}
          />
        </Box>
      )}

      {/* Status Chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            backgroundColor: `${statusColor}15`,
            color: statusColor,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
        {!isActive && (
          <Chip
            label="Microphone Off"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default AudioActivityIndicator;
