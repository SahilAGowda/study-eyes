/**
 * TemporalTimeline Component
 * 
 * Displays 60-second engagement history as a line chart with alert markers.
 * Uses Recharts for visualization.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

export interface TimelineDataPoint {
  timestamp: number; // Unix timestamp
  engagementScore: number; // 0-100
  isAlert?: boolean; // True if this point triggered an alert
}

interface TemporalTimelineProps {
  data: TimelineDataPoint[];
  maxDataPoints?: number;
}

export const TemporalTimeline: React.FC<TemporalTimelineProps> = ({
  data,
  maxDataPoints = 60,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Format data for Recharts
  const chartData = data.slice(-maxDataPoints).map((point, index) => {
    const secondsAgo = Math.floor((Date.now() - point.timestamp) / 1000);
    return {
      time: -secondsAgo, // Negative for "seconds ago"
      score: point.engagementScore,
      isAlert: point.isAlert,
      timestamp: point.timestamp,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const secondsAgo = Math.abs(data.time);
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(33, 150, 243, 0.5)',
          }}
        >
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
            Score: {Math.round(data.score)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>
            {secondsAgo}s ago
          </Typography>
          {data.isAlert && (
            <Typography variant="caption" sx={{ color: '#f44336', display: 'block', mt: 0.5 }}>
              ⚠️ Alert triggered
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 75) return '#4caf50'; // Green
    if (score >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  // Calculate average score
  const avgScore = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length)
    : 0;

  // Count alerts
  const alertCount = chartData.filter(d => d.isAlert).length;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color: '#2196f3' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Engagement Timeline
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Avg: <strong>{avgScore}</strong>
          </Typography>
          {alertCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AlertIcon sx={{ color: '#f44336', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 600 }}>
                {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: isMobile ? 200 : 250 }}>
        {chartData.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No data yet. Start monitoring to see timeline.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="time"
                stroke="#aaa"
                tick={{ fill: '#aaa', fontSize: 12 }}
                tickFormatter={(value) => `${Math.abs(value)}s`}
                label={{
                  value: 'Time (seconds ago)',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: '#aaa', fontSize: 12 },
                }}
              />
              <YAxis
                stroke="#aaa"
                tick={{ fill: '#aaa', fontSize: 12 }}
                domain={[0, 100]}
                label={{
                  value: 'Score',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#aaa', fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2196f3"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#2196f3' }}
                animationDuration={500}
              />
              {/* Alert markers */}
              {chartData.map((point, index) =>
                point.isAlert ? (
                  <ReferenceDot
                    key={`alert-${index}`}
                    x={point.time}
                    y={point.score}
                    r={6}
                    fill="#f44336"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 3, backgroundColor: '#2196f3', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Engagement
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: '#f44336',
              borderRadius: '50%',
              border: '2px solid #fff',
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Alert Event
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TemporalTimeline;
