/**
 * SessionAnalyticsPanel Component
 * 
 * Displays real-time session analytics with actual tracked data
 * instead of dummy/placeholder values.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Visibility as FocusIcon,
  VisibilityOff as DistractedIcon,
  Edit as NoteIcon,
  TrendingUp as TrendIcon,
  Warning as AlertIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import type { SessionMetrics } from '../services/sessionTracker';

interface SessionAnalyticsPanelProps {
  metrics: SessionMetrics | null;
  isSessionActive: boolean;
  currentBehavior: string;
  currentEngagement: number;
  isNoteTakingMode: boolean;
}

export const SessionAnalyticsPanel: React.FC<SessionAnalyticsPanelProps> = ({
  metrics,
  isSessionActive,
  currentBehavior,
  currentEngagement,
  isNoteTakingMode,
}) => {
  // Format duration
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Get behavior display info
  const getBehaviorInfo = (behavior: string) => {
    const behaviors: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      focused_on_screen: { label: 'Focused', color: '#4caf50', icon: <FocusIcon /> },
      looking_away: { label: 'Looking Away', color: '#ff9800', icon: <DistractedIcon /> },
      note_taking: { label: 'Taking Notes', color: '#2196f3', icon: <NoteIcon /> },
      no_face_detected: { label: 'Not Detected', color: '#9e9e9e', icon: <AlertIcon /> },
      phone_detected: { label: 'Phone Detected', color: '#f44336', icon: <AlertIcon /> },
      speaking: { label: 'Speaking', color: '#9c27b0', icon: <SchoolIcon /> },
    };
    return behaviors[behavior] || { label: behavior, color: '#9e9e9e', icon: <AlertIcon /> };
  };

  // Get rating color
  const getRatingColor = (percentage: number): string => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#8bc34a';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
  };

  const behaviorInfo = getBehaviorInfo(currentBehavior);

  if (!isSessionActive || !metrics) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '16px',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          📊 Session Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Start monitoring to see real-time analytics
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📊 Session Analytics
        </Typography>
        <Chip
          icon={<TimerIcon />}
          label={formatDuration(metrics.sessionDuration)}
          color="primary"
          size="small"
        />
      </Box>

      {/* Current Status */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Current Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={behaviorInfo.icon as React.ReactElement}
            label={isNoteTakingMode ? '📝 Note-Taking Mode' : behaviorInfo.label}
            sx={{
              backgroundColor: isNoteTakingMode ? '#2196f3' : behaviorInfo.color,
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Engagement
            </Typography>
            <LinearProgress
              variant="determinate"
              value={currentEngagement}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getRatingColor(currentEngagement),
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: getRatingColor(currentEngagement) }}>
            {Math.round(currentEngagement)}%
          </Typography>
        </Box>
      </Box>

      {/* Main Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
        {/* Focus Percentage */}
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
          <FocusIcon sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
            {metrics.focusPercentage}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Focus Rate
          </Typography>
        </Box>

        {/* Distractions */}
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
          <DistractedIcon sx={{ fontSize: 32, color: '#ff9800', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
            {metrics.distractionCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Distractions
          </Typography>
        </Box>

        {/* Note-Taking Moments */}
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
          <NoteIcon sx={{ fontSize: 32, color: '#2196f3', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
            {metrics.noteTakingCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Note-Taking
          </Typography>
        </Box>

        {/* Keywords Detected */}
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(103, 58, 183, 0.1)', borderRadius: 2 }}>
          <SchoolIcon sx={{ fontSize: 32, color: '#673ab7', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#673ab7' }}>
            {metrics.keywordsDetectedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Keywords
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Time Breakdown */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Time Breakdown
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TimeBar
            label="Focused"
            time={metrics.totalFocusedTime}
            total={metrics.sessionDuration}
            color="#4caf50"
          />
          <TimeBar
            label="Distracted"
            time={metrics.totalDistractedTime}
            total={metrics.sessionDuration}
            color="#ff9800"
          />
          <TimeBar
            label="Note-Taking"
            time={metrics.totalNoteTakingTime}
            total={metrics.sessionDuration}
            color="#2196f3"
          />
        </Box>
      </Box>

      {/* Alerts Summary */}
      {metrics.unauthorizedSpeakerCount > 0 && (
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertIcon sx={{ color: '#f44336', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#f44336' }}>
              {metrics.unauthorizedSpeakerCount} unauthorized speaker alert{metrics.unauthorizedSpeakerCount > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Engagement Score */}
      <Box sx={{ mt: 2, textAlign: 'center', p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Overall Engagement Score
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: getRatingColor(metrics.engagementScore),
          }}
        >
          {metrics.engagementScore}%
        </Typography>
        <Chip
          label={
            metrics.engagementScore >= 80 ? 'Excellent' :
            metrics.engagementScore >= 60 ? 'Good' :
            metrics.engagementScore >= 40 ? 'Fair' : 'Needs Improvement'
          }
          size="small"
          sx={{
            mt: 1,
            backgroundColor: getRatingColor(metrics.engagementScore),
            color: 'white',
          }}
        />
      </Box>
    </Paper>
  );
};

// Time bar component
interface TimeBarProps {
  label: string;
  time: number;
  total: number;
  color: string;
}

const TimeBar: React.FC<TimeBarProps> = ({ label, time, total, color }) => {
  const percentage = total > 0 ? (time / total) * 100 : 0;
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
          {formatTime(time)} ({Math.round(percentage)}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

export default SessionAnalyticsPanel;
