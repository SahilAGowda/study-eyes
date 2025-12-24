/**
 * Multi-Student Overlay Component
 * 
 * PURE DATA-DRIVEN RENDERER - No logic computation, only visualization
 * 
 * Renders real-time engagement overlays for multiple students:
 * - Bounding boxes with engagement-based coloring
 * - Semantic label blocks showing:
 *   - Behavior State (Active Listening, Passive Listening, etc.)
 *   - Engagement Score (0-100)
 *   - Attention Target (Teacher, Board, Notes, Peer, None)
 *   - Confidence Level (Low / Medium / High)
 * 
 * All data comes from StudentState objects - UI does NOT compute or guess
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { ClassroomState, StudentState, PrimaryBehavior } from '../types/studentState';
import type { BehaviorAnalysis } from '../services/temporalBehaviorEngine';

interface MultiStudentOverlayProps {
  videoElement: HTMLVideoElement | null;
  classroomState: ClassroomState | null;
  behaviorAnalyses: Map<string, BehaviorAnalysis> | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  showConfidence?: boolean;
  showAttentionTarget?: boolean;
  showBehaviorHistory?: boolean;
  anonymizeStudents?: boolean;
}

// Color schemes based on engagement level
const ENGAGEMENT_COLORS: Record<string, string> = {
  high: '#22c55e',      // Green
  medium: '#f59e0b',    // Amber
  low: '#ef4444',       // Red
  disengaged: '#6b7280' // Gray
};

// Color schemes based on behavior state
const BEHAVIOR_COLORS: Record<PrimaryBehavior, string> = {
  active_listening: '#10b981',    // Emerald
  passive_listening: '#3b82f6',   // Blue
  cognitive_load: '#f59e0b',      // Amber
  peer_discussion: '#8b5cf6',     // Violet
  off_task_talking: '#f97316',    // Orange
  note_taking: '#06b6d4',         // Cyan
  distracted: '#ef4444',          // Red
  disengaged: '#6b7280',          // Gray
  technology_use: '#dc2626'       // Dark red
};

// Format behavior name for display
const formatBehaviorName = (behavior: PrimaryBehavior): string => {
  return behavior
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format attention target for display
const formatAttentionTarget = (target: string): string => {
  return target
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get confidence level label
const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.4) return 'Medium';
  return 'Low';
};

export const MultiStudentOverlay: React.FC<MultiStudentOverlayProps> = ({
  videoElement,
  classroomState,
  behaviorAnalyses,
  canvasRef,
  showConfidence = true,
  showAttentionTarget = true,
  showBehaviorHistory = false,
  anonymizeStudents = false
}) => {
  const animationFrameRef = useRef<number>(0);

  const renderFrame = useCallback(() => {
    if (!canvasRef.current || !videoElement || !classroomState) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sync canvas size with video
    if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render each active student
    let studentIndex = 0;
    for (const [studentId, student] of classroomState.students) {
      if (!student.isActive) continue;

      const analysis = behaviorAnalyses?.get(studentId);
      const displayName = anonymizeStudents 
        ? `Student ${studentIndex + 1}` 
        : `S${studentIndex + 1}`;

      renderStudentOverlay(ctx, student, analysis, displayName, studentIndex, {
        showConfidence,
        showAttentionTarget,
        showBehaviorHistory,
      });

      studentIndex++;
    }

    // Render classroom summary panel
    renderClassroomSummary(ctx, classroomState, canvas.width);

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [videoElement, classroomState, behaviorAnalyses, canvasRef, showConfidence, showAttentionTarget, showBehaviorHistory, anonymizeStudents]);

  useEffect(() => {
    renderFrame();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderFrame]);

  return null; // Pure canvas renderer
};

/**
 * Render individual student overlay
 * ALL DATA FROM StudentState - NO COMPUTATION
 */
function renderStudentOverlay(
  ctx: CanvasRenderingContext2D,
  student: StudentState,
  analysis: BehaviorAnalysis | undefined,
  displayName: string,
  index: number,
  options: {
    showConfidence: boolean;
    showAttentionTarget: boolean;
    showBehaviorHistory: boolean;
  }
): void {
  const { boundingBox, engagement, behavior, attention, emotion, trackingConfidence } = student;
  const { x, y, width, height } = boundingBox;

  // Get colors from state
  const engagementColor = ENGAGEMENT_COLORS[engagement.level] || ENGAGEMENT_COLORS.medium;
  const behaviorColor = BEHAVIOR_COLORS[behavior.primaryBehavior] || '#6b7280';

  // 1. Draw bounding box with engagement-based color
  drawBoundingBox(ctx, x, y, width, height, engagementColor);

  // 2. Draw student ID label
  drawLabel(ctx, x, y - 25, displayName, engagementColor);

  // 3. Draw semantic label block (right side of bounding box)
  const labelX = x + width + 8;
  const labelY = y;
  
  drawSemanticLabelBlock(ctx, labelX, labelY, {
    state: behavior.primaryBehavior,
    stateColor: behaviorColor,
    engagementScore: engagement.score,
    engagementLevel: engagement.level,
    engagementTrend: engagement.trend,
    attentionTarget: attention.target,
    attentionConfidence: attention.confidence,
    overallConfidence: behavior.overallConfidence,
    emotion: emotion.primaryEmotion,
    showAttention: options.showAttentionTarget,
    showConfidence: options.showConfidence,
  });

  // 4. Draw confidence bar (bottom of bounding box)
  if (options.showConfidence) {
    drawConfidenceBar(ctx, x, y + height + 4, width, trackingConfidence, behavior.overallConfidence);
  }

  // 5. Draw behavior history timeline (optional)
  if (options.showBehaviorHistory && student.history.behaviors.length > 0) {
    drawBehaviorTimeline(ctx, x, y + height + 20, width, student.history.behaviors.slice(-20));
  }

  // 6. Draw engagement trend indicator
  drawTrendIndicator(ctx, x + width - 20, y + 5, engagement.trend);
}

/**
 * Draw bounding box with corner accents
 */
function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  color: string
): void {
  // Main box
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, width, height);

  // Corner accents
  const cornerSize = Math.min(15, width * 0.15, height * 0.15);
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + cornerSize);
  ctx.lineTo(x, y);
  ctx.lineTo(x + cornerSize, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + width - cornerSize, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + cornerSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + height - cornerSize);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + cornerSize, y + height);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + width - cornerSize, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - cornerSize);
  ctx.stroke();
}

/**
 * Draw student label
 */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string, color: string
): void {
  const padding = 4;
  ctx.font = 'bold 12px Arial';
  const textWidth = ctx.measureText(text).width;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, textWidth + padding * 2, 20);

  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, x + padding, y + 14);
}

/**
 * Draw semantic label block showing all engagement metrics
 * This is the main information display per student
 */
function drawSemanticLabelBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  data: {
    state: PrimaryBehavior;
    stateColor: string;
    engagementScore: number;
    engagementLevel: string;
    engagementTrend: string;
    attentionTarget: string;
    attentionConfidence: number;
    overallConfidence: number;
    emotion: string;
    showAttention: boolean;
    showConfidence: boolean;
  }
): void {
  const lineHeight = 18;
  const blockWidth = 160;
  let currentY = y;

  // Background panel
  const totalLines = 2 + (data.showAttention ? 1 : 0) + (data.showConfidence ? 1 : 0);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(x, y, blockWidth, totalLines * lineHeight + 8);

  // Left accent bar (behavior color)
  ctx.fillStyle = data.stateColor;
  ctx.fillRect(x, y, 4, totalLines * lineHeight + 8);

  const textX = x + 10;
  currentY += 14;

  // Line 1: Behavior State
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = data.stateColor;
  ctx.fillText(`State: ${formatBehaviorName(data.state)}`, textX, currentY);
  currentY += lineHeight;

  // Line 2: Engagement Score with bar
  const engColor = ENGAGEMENT_COLORS[data.engagementLevel] || '#f59e0b';
  ctx.font = '11px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Eng: `, textX, currentY);
  
  // Score bar
  const barX = textX + 28;
  const barWidth = 60;
  const barHeight = 8;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(barX, currentY - 8, barWidth, barHeight);
  ctx.fillStyle = engColor;
  ctx.fillRect(barX, currentY - 8, (data.engagementScore / 100) * barWidth, barHeight);
  
  // Score text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${data.engagementScore}%`, barX + barWidth + 4, currentY);
  currentY += lineHeight;

  // Line 3: Attention Target (optional)
  if (data.showAttention) {
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '10px Arial';
    ctx.fillText(`Attn: ${formatAttentionTarget(data.attentionTarget)}`, textX, currentY);
    currentY += lineHeight;
  }

  // Line 4: Confidence Level (optional)
  if (data.showConfidence) {
    const confLabel = getConfidenceLabel(data.overallConfidence);
    const confColor = data.overallConfidence >= 0.7 ? '#22c55e' : 
                      data.overallConfidence >= 0.4 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = confColor;
    ctx.font = '10px Arial';
    ctx.fillText(`Conf: ${confLabel}`, textX, currentY);
  }
}

/**
 * Draw confidence bar
 */
function drawConfidenceBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number,
  trackingConf: number, behaviorConf: number
): void {
  const barHeight = 4;
  const halfWidth = width / 2 - 2;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, barHeight * 2 + 2);

  // Tracking confidence bar
  const trackColor = trackingConf >= 0.7 ? '#22c55e' : trackingConf >= 0.4 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = trackColor;
  ctx.fillRect(x + 1, y + 1, trackingConf * halfWidth, barHeight);

  // Behavior confidence bar
  const behavColor = behaviorConf >= 0.7 ? '#22c55e' : behaviorConf >= 0.4 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = behavColor;
  ctx.fillRect(x + halfWidth + 3, y + 1, behaviorConf * halfWidth, barHeight);

  // Labels
  ctx.fillStyle = '#888888';
  ctx.font = '8px Arial';
  ctx.fillText('T', x + 2, y + barHeight * 2);
  ctx.fillText('B', x + halfWidth + 4, y + barHeight * 2);
}

/**
 * Draw trend indicator arrow
 */
function drawTrendIndicator(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  trend: string
): void {
  ctx.font = '14px Arial';
  
  if (trend === 'increasing') {
    ctx.fillStyle = '#22c55e';
    ctx.fillText('↑', x, y + 12);
  } else if (trend === 'decreasing') {
    ctx.fillStyle = '#ef4444';
    ctx.fillText('↓', x, y + 12);
  } else {
    ctx.fillStyle = '#6b7280';
    ctx.fillText('→', x, y + 12);
  }
}

/**
 * Draw behavior history timeline
 */
function drawBehaviorTimeline(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number,
  behaviors: Array<{ primaryBehavior: PrimaryBehavior }>
): void {
  if (behaviors.length === 0) return;

  const segmentWidth = Math.max(4, width / behaviors.length);
  const height = 6;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, height);

  // Draw behavior segments
  behaviors.forEach((behavior, index) => {
    const segmentX = x + (index * segmentWidth);
    const color = BEHAVIOR_COLORS[behavior.primaryBehavior] || '#6b7280';
    
    ctx.fillStyle = color;
    ctx.fillRect(segmentX, y, segmentWidth - 1, height);
  });
}

/**
 * Render classroom summary panel
 */
function renderClassroomSummary(
  ctx: CanvasRenderingContext2D,
  classroomState: ClassroomState,
  canvasWidth: number
): void {
  const panelWidth = 220;
  const panelHeight = 130;
  const panelX = canvasWidth - panelWidth - 15;
  const panelY = 15;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  // Border
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  const textX = panelX + 12;
  let textY = panelY + 20;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Classroom Overview', textX, textY);
  textY += 22;

  // Stats
  ctx.font = '11px Arial';
  
  // Active students
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(`Active Students: ${classroomState.activeStudents}`, textX, textY);
  textY += 16;

  // Average engagement
  const avgEngColor = classroomState.averageEngagement >= 70 ? '#22c55e' :
                      classroomState.averageEngagement >= 50 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = avgEngColor;
  ctx.fillText(`Avg Engagement: ${Math.round(classroomState.averageEngagement)}%`, textX, textY);
  textY += 18;

  // Engagement distribution
  ctx.fillStyle = '#888888';
  ctx.font = '10px Arial';
  ctx.fillText('Distribution:', textX, textY);
  textY += 14;

  const dist = classroomState.engagementDistribution;
  const distX = textX + 8;
  
  ctx.fillStyle = ENGAGEMENT_COLORS.high;
  ctx.fillText(`High: ${dist.high}`, distX, textY);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.medium;
  ctx.fillText(`Med: ${dist.medium}`, distX + 55, textY);
  textY += 12;

  ctx.fillStyle = ENGAGEMENT_COLORS.low;
  ctx.fillText(`Low: ${dist.low}`, distX, textY);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.disengaged;
  ctx.fillText(`Dis: ${dist.disengaged}`, distX + 55, textY);

  // Alerts indicator
  if (classroomState.alerts.length > 0) {
    const alertX = panelX + panelWidth - 30;
    const alertY = panelY + 8;
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(alertX + 10, alertY + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(classroomState.alerts.length.toString(), alertX + 7, alertY + 14);
  }
}

export default MultiStudentOverlay;
