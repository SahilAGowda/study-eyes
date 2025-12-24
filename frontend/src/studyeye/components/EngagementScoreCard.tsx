/**
 * EngagementScoreCard Component
 * 
 * Displays real-time engagement score with visual indicators,
 * progress bar, and trend analysis.
 * 
 * Requirements: 5.3, 5.4, 5.6
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Psychology as EngagementIcon,
} from '@mui/icons-material';

interface EngagementScoreCardProps {
  score: number; // 0-100
  trend?: 'up' | 'down' | 'flat';
  lastUpdated?: Date;
}

export const EngagementScoreCard: React.FC<EngagementScoreCardProps> = ({
  score,
  trend = 'flat',
  lastUpdated,
}) => {
  // Determine score level and color
  const getScoreLevel = (score: number): { level: string; color: string } => {
    if (score >= 75) {
      return { level: 'High', color: '#4caf50' }; // Green
    } else if (score >= 50) {
      return { level: 'Medium', color: '#ff9800' }; // Orange
    } else {
      return { level: 'Low', color: '#f44336' }; // Red
    }
  };

  const { level, color } = getScoreLevel(score);

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: '#f44336', fontSize: 28 }} />;
      case 'flat':
      default:
        return <TrendingFlatIcon sx={{ color: '#757575', fontSize: 28 }} />;
    }
  };

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
        p: 3,
        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(33, 150, 243, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(156, 39, 176, 0.3)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EngagementIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Engagement Score
        </Typography>
        {getTrendIcon()}
      </Box>

      {/* Score Display */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: color,
            fontSize: { xs: '3rem', sm: '4rem' },
            lineHeight: 1,
            mb: 1,
            transition: 'color 0.3s ease',
          }}
        >
          {Math.round(score)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          out of 100
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 6,
              transition: 'transform 0.5s ease, background-color 0.3s ease',
            },
          }}
        />
      </Box>

      {/* Level and Status */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Chip
          label={`${level} Engagement`}
          sx={{
            backgroundColor: `${color}20`,
            color: color,
            fontWeight: 600,
            borderColor: color,
          }}
          variant="outlined"
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatLastUpdated(lastUpdated)}
        </Typography>
      </Box>

      {/* Decorative gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${color}15, transparent)`,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />
    </Paper>
  );
};

export default EngagementScoreCard;
