/**
 * VideoFeedDisplay Component
 * 
 * Renders live webcam feed with behavior labels, face detection box,
 * and privacy controls (anonymization). Integrates with Material-UI theme.
 * 
 * Requirements: 5.1, 5.2, 5.7, 6.2
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Badge,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  FiberManualRecord as LiveIcon,
} from '@mui/icons-material';
import type { BehaviorResult, FaceDetectionResult, OperationMode, EmotionResult } from '../types';

interface VideoFeedDisplayProps {
  videoElement: HTMLVideoElement | null;
  behaviorResult: BehaviorResult | null;
  faceDetection: FaceDetectionResult | null;
  mode: OperationMode;
  anonymizationEnabled: boolean;
  blurIntensity: number;
  isLive: boolean;
  emotionResult?: EmotionResult | null;
  gazeData?: {
    eyesDetected: boolean;
    eyesInsideBoundingBox: boolean;
    leftEyePosition?: { x: number; y: number };
    rightEyePosition?: { x: number; y: number };
    leftEyeDetected?: boolean;
    rightEyeDetected?: boolean;
  } | null;
}

export const VideoFeedDisplay: React.FC<VideoFeedDisplayProps> = ({
  videoElement,
  behaviorResult,
  faceDetection,
  mode,
  anonymizationEnabled,
  blurIntensity,
  isLive,
  emotionResult = null,
  gazeData = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debug logging for eye detection data
  useEffect(() => {
    if (gazeData) {
      console.log('👁️ Eye Detection Data:', {
        leftEyeDetected: gazeData?.leftEyeDetected,
        rightEyeDetected: gazeData?.rightEyeDetected,
        eyesDetected: gazeData?.eyesDetected,
        eyesInsideBoundingBox: gazeData?.eyesInsideBoundingBox,
        leftEyePosition: gazeData?.leftEyePosition,
        rightEyePosition: gazeData?.rightEyePosition,
      });
    }
  }, [gazeData]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });

  // Update canvas dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.round(width * (3 / 4)); // 4:3 aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw video feed and overlays on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Ensure color preservation
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        
        // Mirror the video horizontally for natural viewing
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Apply anonymization blur if enabled
        if (anonymizationEnabled && faceDetection && faceDetection.faceCount > 0) {
          applyFaceBlurToAllFaces(ctx, faceDetection, blurIntensity);
        }

        // Draw overlays in Classroom Mode
        if (mode === 'classroom') {
          drawAllFaceDetectionBoxes(ctx, faceDetection);
          drawEyeIndicators(ctx, gazeData);
          drawBehaviorLabel(ctx, behaviorResult);
          drawEmotionOverlay(ctx, emotionResult);
        }
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoElement, faceDetection, behaviorResult, mode, anonymizationEnabled, blurIntensity, gazeData, emotionResult]);



  /**
   * Apply blur to all detected face regions
   */
  const applyFaceBlurToAllFaces = (
    ctx: CanvasRenderingContext2D,
    faceDetection: FaceDetectionResult,
    intensity: number
  ) => {
    if (!faceDetection.faces || faceDetection.faces.length === 0) return;

    const videoWidth = videoElement?.videoWidth || 640;
    const videoHeight = videoElement?.videoHeight || 480;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const scaleX = canvasWidth / videoWidth;
    const scaleY = canvasHeight / videoHeight;

    // Apply blur to each detected face
    faceDetection.faces.forEach((face) => {
      const { x, y, width, height } = face.boundingBox;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Mirror x coordinate for flipped video
      const mirroredX = canvasWidth - scaledX - scaledWidth;

      // Ensure coordinates are within canvas bounds
      const clampedX = Math.max(0, Math.min(mirroredX, canvasWidth - scaledWidth));
      const clampedY = Math.max(0, Math.min(scaledY, canvasHeight - scaledHeight));
      const clampedWidth = Math.min(scaledWidth, canvasWidth - clampedX);
      const clampedHeight = Math.min(scaledHeight, canvasHeight - clampedY);

      if (clampedWidth > 0 && clampedHeight > 0) {
        // Extract face region
        const imageData = ctx.getImageData(clampedX, clampedY, clampedWidth, clampedHeight);
        
        // Apply blur using CSS filter
        ctx.save();
        ctx.filter = `blur(${intensity / 5}px)`;
        ctx.putImageData(imageData, clampedX, clampedY);
        ctx.restore();
      }
    });
  };

  /**
   * Draw clean eye detection indicators
   */
  const drawEyeIndicators = (
    ctx: CanvasRenderingContext2D,
    gazeData: {
      eyesDetected: boolean;
      eyesInsideBoundingBox: boolean;
      leftEyePosition?: { x: number; y: number };
      rightEyePosition?: { x: number; y: number };
    } | null
  ) => {
    if (!gazeData || !videoElement) {
      console.log('[VideoFeedDisplay] No gaze data or video element');
      return;
    }

    console.log('[VideoFeedDisplay] Drawing eye indicators:', {
      eyesDetected: gazeData.eyesDetected,
      eyesInsideBoundingBox: gazeData.eyesInsideBoundingBox,
      hasLeftEye: !!gazeData.leftEyePosition,
      hasRightEye: !!gazeData.rightEyePosition,
    });

    const videoWidth = videoElement.videoWidth || 640;
    const videoHeight = videoElement.videoHeight || 480;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const scaleX = canvasWidth / videoWidth;
    const scaleY = canvasHeight / videoHeight;

    // Determine color based on PURE eye detection status
    // Green = Both eyes detected and inside
    // Orange = Partially detected (one eye or outside box)
    // Red = No eyes detected
    let eyeColor: string;
    let hasLeftEye = !!gazeData.leftEyePosition;
    let hasRightEye = !!gazeData.rightEyePosition;
    
    if (gazeData.eyesDetected && gazeData.eyesInsideBoundingBox) {
      eyeColor = '#4caf50'; // Green - Focused
    } else if (hasLeftEye || hasRightEye) {
      eyeColor = '#ff9800'; // Orange - Partially detected
    } else {
      eyeColor = '#f44336'; // Red - No eyes
    }

    // Draw left eye indicator (highly visible)
    if (gazeData.leftEyePosition) {
      // FaceMesh coordinates are in original video space (not mirrored)
      // Scale to canvas size
      const scaledX = gazeData.leftEyePosition.x * scaleX;
      const scaledY = gazeData.leftEyePosition.y * scaleY;
      
      // Mirror X coordinate to match the flipped video display
      const mirroredX = canvasWidth - scaledX;

      console.log('[VideoFeedDisplay] Left eye:', {
        original: gazeData.leftEyePosition,
        scaled: { x: scaledX, y: scaledY },
        mirrored: { x: mirroredX, y: scaledY },
      });

      // Outer glow ring
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Middle ring for visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Inner colored dot
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw right eye indicator (highly visible)
    if (gazeData.rightEyePosition) {
      // FaceMesh coordinates are in original video space (not mirrored)
      // Scale to canvas size
      const scaledX = gazeData.rightEyePosition.x * scaleX;
      const scaledY = gazeData.rightEyePosition.y * scaleY;
      
      // Mirror X coordinate to match the flipped video display
      const mirroredX = canvasWidth - scaledX;

      console.log('[VideoFeedDisplay] Right eye:', {
        original: gazeData.rightEyePosition,
        scaled: { x: scaledX, y: scaledY },
        mirrored: { x: mirroredX, y: scaledY },
      });

      // Outer glow ring
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Middle ring for visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Inner colored dot
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(mirroredX, scaledY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  /**
   * Draw bounding boxes for all detected faces
   */
  const drawAllFaceDetectionBoxes = (
    ctx: CanvasRenderingContext2D,
    faceDetection: FaceDetectionResult | null
  ) => {
    if (!faceDetection || faceDetection.faceCount === 0 || !faceDetection.faces) return;

    const videoWidth = videoElement?.videoWidth || 640;
    const videoHeight = videoElement?.videoHeight || 480;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const scaleX = canvasWidth / videoWidth;
    const scaleY = canvasHeight / videoHeight;

    // Draw box for each detected face
    faceDetection.faces.forEach((face, index) => {
      const { x, y, width, height } = face.boundingBox;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Mirror x coordinate for flipped video
      const mirroredX = canvasWidth - scaledX - scaledWidth;

      // Use different colors for different faces
      const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'];
      const color = colors[index % colors.length];

      // Draw rounded rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const radius = 10;
      ctx.beginPath();
      ctx.moveTo(mirroredX + radius, scaledY);
      ctx.lineTo(mirroredX + scaledWidth - radius, scaledY);
      ctx.quadraticCurveTo(mirroredX + scaledWidth, scaledY, mirroredX + scaledWidth, scaledY + radius);
      ctx.lineTo(mirroredX + scaledWidth, scaledY + scaledHeight - radius);
      ctx.quadraticCurveTo(mirroredX + scaledWidth, scaledY + scaledHeight, mirroredX + scaledWidth - radius, scaledY + scaledHeight);
      ctx.lineTo(mirroredX + radius, scaledY + scaledHeight);
      ctx.quadraticCurveTo(mirroredX, scaledY + scaledHeight, mirroredX, scaledY + scaledHeight - radius);
      ctx.lineTo(mirroredX, scaledY + radius);
      ctx.quadraticCurveTo(mirroredX, scaledY, mirroredX + radius, scaledY);
      ctx.closePath();
      ctx.stroke();

      // Draw label above box
      ctx.font = 'bold 14px Arial';
      const confidence = Math.round(face.confidence * 100);
      const label = `Face ${index + 1} (${confidence}%)`;
      const labelWidth = ctx.measureText(label).width;
      const labelX = mirroredX + (scaledWidth - labelWidth) / 2;
      const labelY = scaledY - 10;

      // Draw label background
      ctx.fillStyle = color.replace(')', ', 0.9)').replace('rgb', 'rgba');
      ctx.fillRect(labelX - 5, labelY - 16, labelWidth + 10, 20);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, labelX, labelY);
    });
  };

  /**
   * Draw behavior label overlay with MULTI-LABEL support
   * Primary engagement status (focused/distracted/no_face) shown at TOP-LEFT
   * Speaking status shown separately at BOTTOM-LEFT (never overlaps)
   */
  const drawBehaviorLabel = (
    ctx: CanvasRenderingContext2D,
    behaviorResult: BehaviorResult | null
  ) => {
    if (!behaviorResult) return;

    // Draw PRIMARY BEHAVIOR at top-left (focused, looking_away, no_face, phone, note_taking)
    const primaryBehavior = behaviorResult.primaryBehavior || behaviorResult.behaviorClass;
    const primaryLabel = formatBehaviorLabel(primaryBehavior);
    const primaryConfidence = Math.round(behaviorResult.confidence * 100);

    // Top-left: Primary engagement status
    const topX = 20;
    const topY = 30;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(topX - 10, topY - 25, 300, 40);

    ctx.fillStyle = getBehaviorColor(primaryBehavior);
    ctx.font = 'bold 18px Arial';
    ctx.fillText(primaryLabel, topX, topY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`${primaryConfidence}% confidence`, topX, topY + 18);

    // Draw SPEAKING STATUS at bottom-left (if detected)
    if (behaviorResult.isSpeaking) {
      const bottomX = 20;
      const bottomY = ctx.canvas.height - 30;
      const speakingConfidence = Math.round((behaviorResult.speakingConfidence || 0) * 100);

      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(bottomX - 10, bottomY - 25, 250, 40);

      // Draw label text
      ctx.fillStyle = getBehaviorColor('speaking');
      ctx.font = 'bold 18px Arial';
      ctx.fillText('🎤 Speaking Detected', bottomX, bottomY);

      // Draw confidence
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(`${speakingConfidence}% confidence`, bottomX, bottomY + 18);
    }
  };

  /**
   * Draw emotion overlay in top-right corner
   */
  const drawEmotionOverlay = (
    ctx: CanvasRenderingContext2D,
    emotionResult: EmotionResult | null
  ) => {
    if (!emotionResult) return;

    const emotion = emotionResult.primaryEmotion;
    const confidence = Math.round(emotionResult.confidence * 100);

    // Position in top-right corner
    const padding = 20;
    const boxWidth = 200;
    const boxHeight = 80;
    const x = ctx.canvas.width - boxWidth - padding;
    const y = padding;

    // Get emotion emoji and color
    const emotionEmoji = getEmotionEmoji(emotion);
    const emotionColor = getEmotionColor(emotion);
    const emotionLabel = formatEmotionLabel(emotion);

    // Draw semi-transparent background with backdrop blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Draw colored border
    ctx.strokeStyle = emotionColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Draw emoji (large)
    ctx.font = 'bold 32px Arial';
    ctx.fillText(emotionEmoji, x + 15, y + 40);

    // Draw emotion label
    ctx.fillStyle = emotionColor;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(emotionLabel, x + 60, y + 30);

    // Draw confidence percentage
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`${confidence}% confidence`, x + 60, y + 50);

    // Draw confidence bar
    const barX = x + 10;
    const barY = y + 60;
    const barWidth = boxWidth - 20;
    const barHeight = 8;

    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Confidence bar
    ctx.fillStyle = emotionColor;
    ctx.fillRect(barX, barY, (barWidth * confidence) / 100, barHeight);
  };

  /**
   * Get emoji for emotion
   */
  const getEmotionEmoji = (emotion: string): string => {
    const emojis: Record<string, string> = {
      happy: '😊',
      confused: '😕',
      frustrated: '😤',
      bored: '😑',
      drowsy: '😴',
      focused: '🎯',
      neutral: '😐',
    };
    return emojis[emotion] || '😐';
  };

  /**
   * Get color for emotion
   */
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      happy: '#4caf50',
      confused: '#ff9800',
      frustrated: '#f44336',
      bored: '#9e9e9e',
      drowsy: '#673ab7',
      focused: '#2196f3',
      neutral: '#757575',
    };
    return colors[emotion] || '#757575';
  };

  /**
   * Format emotion as human-readable label
   */
  const formatEmotionLabel = (emotion: string): string => {
    const labels: Record<string, string> = {
      happy: 'Happy',
      confused: 'Confused',
      frustrated: 'Frustrated',
      bored: 'Bored',
      drowsy: 'Drowsy',
      focused: 'Focused',
      neutral: 'Neutral',
    };
    return labels[emotion] || 'Unknown';
  };

  /**
   * Format behavior class as human-readable label
   */
  const formatBehaviorLabel = (behaviorClass: string): string => {
    const labels: Record<string, string> = {
      focused_on_screen: 'Focused on Screen',
      looking_away: 'Looking Away / Distracted',
      speaking: 'Speaking Detected',
      note_taking: 'Note-taking / Writing',
      no_face_detected: 'No Face Detected',
      phone_detected: 'Phone / Unauthorized Object Detected',
    };
    return labels[behaviorClass] || 'Unknown';
  };

  /**
   * Get color for behavior class
   */
  const getBehaviorColor = (behaviorClass: string): string => {
    const colors: Record<string, string> = {
      focused_on_screen: '#4caf50',
      looking_away: '#ff9800',
      speaking: '#2196f3',
      note_taking: '#9c27b0',
      no_face_detected: '#f44336',
      phone_detected: '#f44336',
    };
    return colors[behaviorClass] || '#757575';
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: '16px',
        position: 'relative',
      }}
    >
      {/* Header with LIVE indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideocamIcon sx={{ color: '#2196f3' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Video Feed
          </Typography>
        </Box>

        {isLive && (
          <Badge
            badgeContent={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LiveIcon sx={{ fontSize: 12, color: '#f44336' }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                  LIVE
                </Typography>
              </Box>
            }
            color="error"
          >
            <Chip
              label="LIVE"
              color="error"
              size="small"
              icon={<LiveIcon />}
              sx={{
                fontWeight: 'bold',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 },
                },
              }}
            />
          </Badge>
        )}
      </Box>

      {/* Video Canvas Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          aspectRatio: '4 / 3',
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Privacy indicator overlay */}
        {anonymizationEnabled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(156, 39, 176, 0.9)',
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              🔒 Anonymized
            </Typography>
          </Box>
        )}

        {/* Mode indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: mode === 'classroom' ? 'rgba(33, 150, 243, 0.9)' : 'rgba(255, 152, 0, 0.9)',
            color: '#fff',
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {mode === 'classroom' ? '🎓 Classroom Mode' : '📝 Exam Mode'}
          </Typography>
        </Box>

        {/* Eye indicator dots - MIRRORED to match video feed */}
        {gazeData?.leftEyePosition && gazeData.leftEyeDetected && (
          <Box
            sx={{
              position: 'absolute',
              // Mirror X: 100 - (raw.x / videoWidth * 100)
              left: `${100 - (gazeData.leftEyePosition.x / (videoElement?.videoWidth || 640)) * 100}%`,
              // Y stays the same: raw.y / videoHeight * 100
              top: `${(gazeData.leftEyePosition.y / (videoElement?.videoHeight || 480)) * 100}%`,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: gazeData.eyesDetected && gazeData.eyesInsideBoundingBox ? '#10B981' : gazeData.leftEyeDetected ? '#F59E0B' : '#EF4444',
              border: '2px solid white',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          />
        )}
        {gazeData?.rightEyePosition && gazeData.rightEyeDetected && (
          <Box
            sx={{
              position: 'absolute',
              // Mirror X: 100 - (raw.x / videoWidth * 100)
              left: `${100 - (gazeData.rightEyePosition.x / (videoElement?.videoWidth || 640)) * 100}%`,
              // Y stays the same: raw.y / videoHeight * 100
              top: `${(gazeData.rightEyePosition.y / (videoElement?.videoHeight || 480)) * 100}%`,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: gazeData.eyesDetected && gazeData.eyesInsideBoundingBox ? '#10B981' : gazeData.rightEyeDetected ? '#F59E0B' : '#EF4444',
              border: '2px solid white',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          />
        )}
      </Box>

      {/* Status info */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {faceDetection && faceDetection.faceCount > 0 && (
          <Chip
            label={`${faceDetection.faceCount} Face${faceDetection.faceCount > 1 ? 's' : ''} Detected`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {behaviorResult && mode === 'classroom' && (
          <Chip
            label={formatBehaviorLabel(behaviorResult.behaviorClass)}
            size="small"
            sx={{
              backgroundColor: `${getBehaviorColor(behaviorResult.behaviorClass)}20`,
              color: getBehaviorColor(behaviorResult.behaviorClass),
              borderColor: getBehaviorColor(behaviorResult.behaviorClass),
            }}
            variant="outlined"
          />
        )}
      </Box>
    </Paper>
  );
};

export default VideoFeedDisplay;
