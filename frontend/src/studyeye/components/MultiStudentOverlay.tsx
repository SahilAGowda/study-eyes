/**
 * Multi-Student Overlay Component
 * 
 * Renders real-time engagement overlays for multiple students with bounding boxes,
 * state indicators, engagement scores, attention targets, and confidence levels.
 */

import React, { useRef, useEffect } from 'react';
import type { ClassroomState, StudentState } from '../types/studentState';
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

interface StudentOverlayData {
  student: StudentState;
  analysis?: BehaviorAnalysis;
  displayName: string;
  color: string;
}

const ENGAGEMENT_COLORS = {
  high: '#22c55e',      // Green
  medium: '#f59e0b',    // Amber
  low: '#ef4444',       // Red
  disengaged: '#6b7280' // Gray
};

const BEHAVIOR_COLORS = {
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

  useEffect(() => {
    if (!canvasRef.current || !videoElement || !classroomState) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderOverlay = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size to match video
      if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
      }

      // Prepare student data for rendering
      const studentOverlays = prepareStudentOverlays(classroomState, behaviorAnalyses, anonymizeStudents);

      // Render each student overlay
      studentOverlays.forEach((overlay, index) => {
        renderStudentOverlay(ctx, overlay, index, {
          showConfidence,
          showAttentionTarget,
          showBehaviorHistory
        });
      });

      // Render classroom summary
      renderClassroomSummary(ctx, classroomState, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, classroomState, behaviorAnalyses, showConfidence, showAttentionTarget, showBehaviorHistory, anonymizeStudents]);

  return null; // This component only renders to canvas
};

/**
 * Prepare student data for overlay rendering
 */
function prepareStudentOverlays(
  classroomState: ClassroomState,
  behaviorAnalyses: Map<string, BehaviorAnalysis> | null,
  anonymizeStudents: boolean
): StudentOverlayData[] {
  const overlays: StudentOverlayData[] = [];
  let studentIndex = 0;

  for (const [studentId, student] of classroomState.students) {
    if (!student.isActive) continue;

    const analysis = behaviorAnalyses?.get(studentId);
    const displayName = anonymizeStudents ? `Student ${studentIndex + 1}` : `S${studentIndex + 1}`;
    const color = generateStudentColor(studentIndex);

    overlays.push({
      student,
      analysis,
      displayName,
      color
    });

    studentIndex++;
  }

  return overlays;
}

/**
 * Generate consistent color for student based on index
 */
function generateStudentColor(index: number): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];
  return colors[index % colors.length];
}

/**
 * Render individual student overlay
 */
function renderStudentOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: StudentOverlayData,
  index: number,
  options: {
    showConfidence: boolean;
    showAttentionTarget: boolean;
    showBehaviorHistory: boolean;
  }
): void {
  const { student, analysis, displayName, color } = overlay;
  const { boundingBox, engagement, behavior, attention } = student;

  // Calculate overlay position
  const x = boundingBox.x;
  const y = boundingBox.y;
  const width = boundingBox.width;
  const height = boundingBox.height;

  // Draw bounding box
  drawBoundingBox(ctx, x, y, width, height, engagement.level, color);

  // Draw student ID label
  drawStudentLabel(ctx, x, y, displayName, color);

  // Draw engagement score
  drawEngagementScore(ctx, x + width + 10, y, engagement);

  // Draw behavior state
  drawBehaviorState(ctx, x + width + 10, y + 30, behavior, analysis);

  // Draw attention target (optional)
  if (options.showAttentionTarget) {
    drawAttentionTarget(ctx, x + width + 10, y + 60, attention);
  }

  // Draw confidence indicator (optional)
  if (options.showConfidence) {
    drawConfidenceIndicator(ctx, x, y + height + 5, student.trackingConfidence, behavior.overallConfidence);
  }

  // Draw behavior history (optional)
  if (options.showBehaviorHistory && student.history.behaviors.length > 0) {
    drawBehaviorHistory(ctx, x, y + height + 25, student.history.behaviors.slice(-10));
  }

  // Draw gaze indicators
  if (attention.gazePoint) {
    drawGazeIndicator(ctx, attention.gazePoint.x, attention.gazePoint.y, attention.confidence);
  }
}

/**
 * Draw bounding box with engagement-based styling
 */
function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  engagementLevel: string,
  studentColor: string
): void {
  const color = ENGAGEMENT_COLORS[engagementLevel as keyof typeof ENGAGEMENT_COLORS] || studentColor;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, width, height);

  // Add corner indicators
  const cornerSize = 15;
  ctx.fillStyle = color;
  
  // Top-left corner
  ctx.fillRect(x, y, cornerSize, 3);
  ctx.fillRect(x, y, 3, cornerSize);
  
  // Top-right corner
  ctx.fillRect(x + width - cornerSize, y, cornerSize, 3);
  ctx.fillRect(x + width - 3, y, 3, cornerSize);
  
  // Bottom-left corner
  ctx.fillRect(x, y + height - 3, cornerSize, 3);
  ctx.fillRect(x, y + height - cornerSize, 3, cornerSize);
  
  // Bottom-right corner
  ctx.fillRect(x + width - cornerSize, y + height - 3, cornerSize, 3);
  ctx.fillRect(x + width - 3, y + height - cornerSize, 3, cornerSize);
}

/**
 * Draw student identification label
 */
function drawStudentLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  displayName: string,
  color: string
): void {
  const labelY = y - 5;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, labelY - 20, displayName.length * 8 + 10, 25);
  
  // Text
  ctx.fillStyle = color;
  ctx.font = 'bold 14px Arial';
  ctx.fillText(displayName, x + 5, labelY - 5);
}

/**
 * Draw engagement score indicator
 */
function drawEngagementScore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  engagement: StudentState['engagement']
): void {
  const score = Math.round(engagement.score);
  const level = engagement.level;
  const color = ENGAGEMENT_COLORS[level];
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, 120, 25);
  
  // Score bar
  const barWidth = (score / 100) * 100;
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, barWidth, 21);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px Arial';
  ctx.fillText(`${score}% ${level.toUpperCase()}`, x + 5, y + 16);
}

/**
 * Draw behavior state indicator
 */
function drawBehaviorState(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  behavior: StudentState['behavior'],
  analysis?: BehaviorAnalysis
): void {
  const behaviorName = analysis?.currentBehavior.pattern.name || behavior.primaryBehavior;
  const confidence = Math.round((analysis?.currentBehavior.confidence || behavior.overallConfidence) * 100);
  const color = BEHAVIOR_COLORS[behaviorName as keyof typeof BEHAVIOR_COLORS] || '#6b7280';
  
  // Format behavior name for display
  const displayName = behaviorName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, Math.max(displayName.length * 7 + 20, 120), 25);
  
  // Behavior indicator
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, 4, 21);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText(`${displayName} (${confidence}%)`, x + 10, y + 16);
}

/**
 * Draw attention target indicator
 */
function drawAttentionTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  attention: StudentState['attention']
): void {
  const target = attention.target;
  const confidence = Math.round(attention.confidence * 100);
  
  // Format target name
  const displayTarget = target.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, Math.max(displayTarget.length * 7 + 40, 120), 20);
  
  // Text
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '11px Arial';
  ctx.fillText(`→ ${displayTarget} (${confidence}%)`, x + 5, y + 14);
}

/**
 * Draw confidence indicators
 */
function drawConfidenceIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  trackingConfidence: number,
  behaviorConfidence: number
): void {
  const trackingPercent = Math.round(trackingConfidence * 100);
  const behaviorPercent = Math.round(behaviorConfidence * 100);
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, 100, 15);
  
  // Confidence bars
  ctx.fillStyle = trackingConfidence > 0.7 ? '#10b981' : trackingConfidence > 0.4 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(x + 2, y + 2, (trackingConfidence * 45), 5);
  
  ctx.fillStyle = behaviorConfidence > 0.7 ? '#10b981' : behaviorConfidence > 0.4 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(x + 2, y + 8, (behaviorConfidence * 45), 5);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = '9px Arial';
  ctx.fillText(`T:${trackingPercent}% B:${behaviorPercent}%`, x + 50, y + 11);
}

/**
 * Draw behavior history timeline
 */
function drawBehaviorHistory(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  behaviorHistory: StudentState['behavior'][]
): void {
  if (behaviorHistory.length === 0) return;
  
  const historyWidth = Math.min(behaviorHistory.length * 8, 200);
  const historyHeight = 10;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, historyWidth, historyHeight);
  
  // Draw behavior segments
  behaviorHistory.forEach((behavior, index) => {
    const segmentWidth = historyWidth / behaviorHistory.length;
    const segmentX = x + (index * segmentWidth);
    const color = BEHAVIOR_COLORS[behavior.primaryBehavior as keyof typeof BEHAVIOR_COLORS] || '#6b7280';
    
    ctx.fillStyle = color;
    ctx.fillRect(segmentX, y + 1, segmentWidth - 1, historyHeight - 2);
  });
}

/**
 * Draw gaze point indicator
 */
function drawGazeIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  confidence: number
): void {
  const radius = 3 + (confidence * 2);
  const alpha = 0.3 + (confidence * 0.4);
  
  ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Inner dot
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y, 1, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Render classroom summary information
 */
function renderClassroomSummary(
  ctx: CanvasRenderingContext2D,
  classroomState: ClassroomState,
  canvasWidth: number,
  canvasHeight: number
): void {
  const summaryX = canvasWidth - 250;
  const summaryY = 20;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(summaryX, summaryY, 230, 120);
  
  // Title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Classroom Overview', summaryX + 10, summaryY + 20);
  
  // Statistics
  ctx.font = '12px Arial';
  ctx.fillText(`Active Students: ${classroomState.activeStudents}`, summaryX + 10, summaryY + 40);
  ctx.fillText(`Avg Engagement: ${Math.round(classroomState.averageEngagement)}%`, summaryX + 10, summaryY + 55);
  
  // Engagement distribution
  const dist = classroomState.engagementDistribution;
  ctx.fillText('Engagement Distribution:', summaryX + 10, summaryY + 75);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.high;
  ctx.fillText(`High: ${dist.high}`, summaryX + 15, summaryY + 90);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.medium;
  ctx.fillText(`Medium: ${dist.medium}`, summaryX + 70, summaryY + 90);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.low;
  ctx.fillText(`Low: ${dist.low}`, summaryX + 15, summaryY + 105);
  
  ctx.fillStyle = ENGAGEMENT_COLORS.disengaged;
  ctx.fillText(`Disengaged: ${dist.disengaged}`, summaryX + 70, summaryY + 105);
  
  // Alerts indicator
  if (classroomState.alerts.length > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(summaryX + 200, summaryY + 5, 20, 20);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(classroomState.alerts.length.toString(), summaryX + 207, summaryY + 18);
  }
}

export default MultiStudentOverlay;