import React, { useState } from 'react';
import { Box, Paper, Typography, Button, LinearProgress, Chip, Alert, IconButton, Collapse, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon, RecordVoiceOver as VoiceIcon, VolumeUp as SpeakerIcon, Warning as WarningIcon, CheckCircle as CheckIcon, Edit as EditIcon, ExpandMore as ExpandIcon, ExpandLess as CollapseIcon, NotificationsActive as AlertIcon, School as TeacherIcon, Person as PersonIcon } from '@mui/icons-material';

const TeacherVoicePanel = (props) => {
  const [expanded, setExpanded] = useState(true);
  const { isEnrolling, enrollmentProgress, hasVoiceProfile, onStartEnrollment, onClearProfile, isTeacherSpeaking, speakerSimilarity, isSpeaking, isKeywordDetectionActive, isNoteTakingMode, noteTakingRemainingSeconds, lastKeywordDetected, onToggleKeywordDetection, noiseAlerts, onDismissAlert, onClearAllAlerts } = props;

  return (
    <Paper elevation={4} sx={{ background: 'linear-gradient(135deg, rgba(103,58,183,0.1), rgba(33,150,243,0.1))', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TeacherIcon sx={{ color: '#673ab7' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Teacher Voice</Typography>
        </Box>
        <IconButton size="small">{expanded ? <CollapseIcon /> : <ExpandIcon />}</IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          {isEnrolling ? (
            <Box><CircularProgress size={24} /><Typography>Recording...</Typography></Box>
          ) : hasVoiceProfile ? (
            <Alert severity="success">Voice enrolled <Button onClick={onClearProfile}>Re-record</Button></Alert>
          ) : (
            <Button variant="contained" startIcon={<MicIcon />} onClick={onStartEnrollment}>Record Voice</Button>
          )}
          <Divider sx={{ my: 2 }} />
          <Button onClick={onToggleKeywordDetection}>{isKeywordDetectionActive ? 'Stop' : 'Start'} Keywords</Button>
          {isNoteTakingMode && <Alert severity="info">Note-Taking Mode</Alert>}
          <Divider sx={{ my: 2 }} />
          <Typography>Alerts: {noiseAlerts.length}</Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TeacherVoicePanel;
