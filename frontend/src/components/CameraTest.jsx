import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Alert,
  List,
  ListItem,
  ListItemText 
} from '@mui/material';
import { 
  Videocam as CameraIcon, 
  VideocamOff as CameraOffIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import cameraService from '../services/cameraService';

const CameraTest = () => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [permissions, setPermissions] = useState('unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissions();
    getDevices();
  }, []);

  const checkPermissions = async () => {
    try {
      const permission = await cameraService.checkPermissions();
      setPermissions(permission);
    } catch (err) {
      console.error('Permission check failed:', err);
    }
  };

  const getDevices = async () => {
    try {
      const videoDevices = await cameraService.getVideoDevices();
      setDevices(videoDevices);
    } catch (err) {
      console.error('Failed to get devices:', err);
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) {
      setError('Video element not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await cameraService.initializeCamera(videoRef.current);
      setCameraActive(true);
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Camera start failed:', err);
      setError(err.message || 'Failed to start camera');
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    try {
      cameraService.stopCamera();
      setCameraActive(false);
      setError(null);
      console.log('Camera stopped');
    } catch (err) {
      console.error('Camera stop failed:', err);
      setError(err.message || 'Failed to stop camera');
    }
  };

  const refreshDevices = async () => {
    await getDevices();
    await checkPermissions();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Camera Test
          </Typography>

          {/* Permission Status */}
          <Alert 
            severity={permissions === 'granted' ? 'success' : permissions === 'denied' ? 'error' : 'warning'}
            sx={{ mb: 2 }}
          >
            Camera Permission: {permissions}
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Camera Controls */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color={cameraActive ? "error" : "primary"}
              startIcon={cameraActive ? <CameraOffIcon /> : <CameraIcon />}
              onClick={cameraActive ? stopCamera : startCamera}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Loading...' : cameraActive ? 'Stop Camera' : 'Start Camera'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshDevices}
            >
              Refresh Devices
            </Button>
          </Box>

          {/* Video Display */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '640px',
                height: 'auto',
                backgroundColor: '#000',
                border: '2px solid #ccc',
                borderRadius: '8px'
              }}
              autoPlay
              playsInline
              muted
            />
          </Box>

          {/* Device List */}
          <Typography variant="h6" gutterBottom>
            Available Cameras ({devices.length})
          </Typography>
          <List>
            {devices.length > 0 ? (
              devices.map((device, index) => (
                <ListItem key={device.deviceId}>
                  <ListItemText
                    primary={device.label || `Camera ${index + 1}`}
                    secondary={`Device ID: ${device.deviceId}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No cameras found" />
              </ListItem>
            )}
          </List>

          {/* Debug Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Debug Information
            </Typography>
            <Typography variant="body2">
              • Camera Active: {cameraActive ? 'Yes' : 'No'}<br />
              • Permissions: {permissions}<br />
              • Devices Found: {devices.length}<br />
              • Navigator Support: {navigator.mediaDevices ? 'Yes' : 'No'}<br />
              • HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}<br />
              • User Agent: {navigator.userAgent.substring(0, 50)}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CameraTest;