import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

const CameraOverlay = ({ 
  videoRef, 
  eyeTrackingData, 
  focusScore = 0, 
  isConnected = false 
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });

  // Update canvas dimensions when video loads
  useEffect(() => {
    const updateDimensions = () => {
      if (videoRef?.current) {
        const video = videoRef.current;
        setDimensions({
          width: video.videoWidth || 640,
          height: video.videoHeight || 480
        });
      }
    };

    const video = videoRef?.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateDimensions);
      return () => video.removeEventListener('loadedmetadata', updateDimensions);
    }
  }, [videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match video
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw overlays
    drawFocusOverlay(ctx, focusScore, isConnected);
    
    if (eyeTrackingData) {
      drawTrackingData(ctx, eyeTrackingData);
    }
  }, [eyeTrackingData, focusScore, isConnected, dimensions]);

  const drawFocusOverlay = (ctx, score, connected) => {
    const { width, height } = dimensions;
    
    // Connection status
    ctx.shadowBlur = 8;
    ctx.shadowColor = connected ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 68, 68, 0.8)';
    ctx.fillStyle = connected ? '#00ff00' : '#ff4444';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(connected ? '🟢 CONNECTED' : '🔴 DISCONNECTED', width * 0.02, height * 0.05);

    // Focus percentage display
    const focusPercentage = Math.round(score);
    const focusColor = focusPercentage >= 70 ? '#00ff00' : 
                      focusPercentage >= 50 ? '#ffff00' : '#ff4444';
    
    // Background for focus score
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(width * 0.75, height * 0.02, width * 0.23, height * 0.15);
    
    // Focus score text
    ctx.shadowBlur = 10;
    ctx.shadowColor = focusColor;
    ctx.fillStyle = focusColor;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${focusPercentage}%`, width * 0.78, height * 0.09);
    
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('FOCUS', width * 0.78, height * 0.13);

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawTrackingData = (ctx, data) => {
    const { width, height } = dimensions;
    
    // Draw eye indicators if available
    if (data.left_eye_ratio !== undefined && data.right_eye_ratio !== undefined) {
      drawEyeIndicator(ctx, width * 0.35, height * 0.45, data.left_eye_ratio, 'Left Eye');
      drawEyeIndicator(ctx, width * 0.65, height * 0.45, data.right_eye_ratio, 'Right Eye');
    }

    // Blink detection
    if (data.blink_detected) {
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = 'rgba(255, 68, 68, 0.5)';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('BLINK DETECTED', width * 0.02, height * 0.15);
    }

    // Gaze direction
    if (data.gaze_direction_x !== undefined && data.gaze_direction_y !== undefined) {
      drawGazeIndicator(ctx, data.gaze_direction_x, data.gaze_direction_y, width, height);
    }

    // Head pose
    if (data.head_pitch !== undefined || data.head_yaw !== undefined || data.head_roll !== undefined) {
      drawHeadPoseIndicator(ctx, {
        pitch: data.head_pitch || 0,
        yaw: data.head_yaw || 0,
        roll: data.head_roll || 0
      }, width, height);
    }

    ctx.shadowBlur = 0;
  };

  const drawEyeIndicator = (ctx, x, y, ratio, label) => {
    ctx.shadowBlur = 10;
    ctx.shadowColor = ratio > 0.3 ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 68, 68, 0.8)';
    
    // Eye circle
    ctx.strokeStyle = ratio > 0.3 ? '#00ff00' : '#ff4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    // Fill based on eye openness
    const openness = Math.max(0, Math.min(1, ratio));
    ctx.fillStyle = ratio > 0.3 ? '#00ff00' : '#ff4444';
    ctx.beginPath();
    ctx.arc(x, y, 15 * openness, 0, 2 * Math.PI);
    ctx.fill();

    // Label
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(label, x - 25, y + 35);
    ctx.fillText(`${(ratio * 100).toFixed(1)}%`, x - 20, y + 50);
  };

  const drawGazeIndicator = (ctx, gazeX, gazeY, width, height) => {
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    
    // Gaze direction arrow
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.6)';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + gazeX * 50, centerY + gazeY * 50);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(gazeY, gazeX);
    const arrowLength = 15;
    ctx.beginPath();
    ctx.moveTo(centerX + gazeX * 50, centerY + gazeY * 50);
    ctx.lineTo(
      centerX + gazeX * 50 - arrowLength * Math.cos(angle - Math.PI / 6),
      centerY + gazeY * 50 - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(centerX + gazeX * 50, centerY + gazeY * 50);
    ctx.lineTo(
      centerX + gazeX * 50 - arrowLength * Math.cos(angle + Math.PI / 6),
      centerY + gazeY * 50 - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();

    // Label
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Gaze Direction', width * 0.02, height * 0.25);
  };

  const drawHeadPoseIndicator = (ctx, headPose, width, height) => {
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 12px Arial';
    
    const startY = height * 0.85;
    ctx.fillText(`Pitch: ${headPose.pitch?.toFixed(1) || 'N/A'}°`, width * 0.02, startY);
    ctx.fillText(`Yaw: ${headPose.yaw?.toFixed(1) || 'N/A'}°`, width * 0.02, startY + 15);
    ctx.fillText(`Roll: ${headPose.roll?.toFixed(1) || 'N/A'}°`, width * 0.02, startY + 30);
  };

  return (
    <Box
      position="relative"
      display="inline-block"
      sx={{
        '& canvas': {
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 10
        }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    </Box>
  );
};

export default CameraOverlay;