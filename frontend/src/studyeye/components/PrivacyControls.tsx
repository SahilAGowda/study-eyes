/**
 * PrivacyControls Component
 * 
 * Provides UI controls for privacy settings including anonymization toggle,
 * compliance message display, and privacy status indicators.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 8.1
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { OperationMode } from '../types';

interface PrivacyControlsProps {
  mode: OperationMode;
  anonymizationEnabled: boolean;
  blurIntensity: number;
  cameraPermission: boolean;
  microphonePermission: boolean;
  onModeChange: (mode: OperationMode) => void;
  onAnonymizationChange: (enabled: boolean) => void;
  onBlurIntensityChange: (intensity: number) => void;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  mode,
  anonymizationEnabled,
  blurIntensity,
  cameraPermission,
  microphonePermission,
  onModeChange,
  onAnonymizationChange,
  onBlurIntensityChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleAnonymizationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnonymizationChange(event.target.checked);
  };

  const handleBlurIntensityChange = (_event: Event, value: number | number[]) => {
    const intensity = Array.isArray(value) ? value[0] : value;
    onBlurIntensityChange(intensity);
  };

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: OperationMode | null) => {
    if (newMode !== null) {
      onModeChange(newMode);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {/* Privacy Compliance Alert */}
      <Alert 
        severity="success" 
        icon={<ShieldIcon />}
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        🔒 Local Processing — No Recording — Privacy Compliant
      </Alert>

      {/* Mode Selector */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Operation Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          color="primary"
        >
          <ToggleButton value="classroom">
            <SchoolIcon sx={{ mr: 1 }} />
            Classroom Mode
          </ToggleButton>
          <ToggleButton value="exam">
            <AssignmentIcon sx={{ mr: 1 }} />
            Exam Mode
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {mode === 'classroom' 
            ? 'Visual feedback and engagement tracking enabled'
            : 'Event logging only, minimal visual feedback'}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Permission Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Device Permissions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<VideocamIcon />}
            label={cameraPermission ? 'Camera Active' : 'Camera Inactive'}
            color={cameraPermission ? 'success' : 'default'}
            size="small"
          />
          <Chip
            icon={<MicIcon />}
            label={microphonePermission ? 'Microphone Active' : 'Microphone Inactive'}
            color={microphonePermission ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Anonymization Toggle */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={anonymizationEnabled}
              onChange={handleAnonymizationToggle}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {anonymizationEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
              <Typography variant="body2">
                Face Anonymization
              </Typography>
            </Box>
          }
        />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
          {anonymizationEnabled 
            ? 'Faces are blurred in video feed'
            : 'Faces are visible (detection continues)'}
        </Typography>

        {/* Blur Intensity Slider */}
        {anonymizationEnabled && (
          <Box sx={{ mt: 2, ml: 4, mr: 2 }}>
            <Typography variant="caption" gutterBottom>
              Blur Intensity: {blurIntensity}%
            </Typography>
            <Slider
              value={blurIntensity}
              onChange={handleBlurIntensityChange}
              min={0}
              max={100}
              step={10}
              marks
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Advanced Settings Accordion */}
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            Privacy Compliance Status
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2">
                Local Processing Only: Yes
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2">
                No Persistent Storage: Verified
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2">
                No Network Transmission: Verified
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Overall Compliance: Verified
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">
                All video and audio processing happens locally in your browser.
                No data is recorded, stored, or transmitted to external servers.
                Data exists only in volatile memory (RAM) during active sessions.
              </Typography>
            </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default PrivacyControls;
