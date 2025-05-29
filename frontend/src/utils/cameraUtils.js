/**
 * Camera utility functions for debugging and cleanup
 */

/**
 * Force stop all media streams and clean up camera resources
 */
export const forceCleanupAllCameras = async () => {
  try {
    console.log('🔧 Starting camera cleanup...')
    
    // Get all media devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    
    console.log(`📹 Found ${videoDevices.length} video devices:`, videoDevices.map(d => d.label || 'Unknown Camera'))
    
    // Try to get a stream to ensure we have access, then immediately stop it
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240 
        }, 
        audio: false 
      })
      
      console.log('✅ Camera access granted, stopping test stream...')
      testStream.getTracks().forEach(track => {
        track.stop()
        console.log(`🛑 Stopped track: ${track.kind} - ${track.label}`)
      })
      
      return { success: true, message: 'Camera cleaned up successfully' }
    } catch (error) {
      console.error('❌ Camera cleanup failed:', error)
      return { 
        success: false, 
        message: error.name === 'NotReadableError' 
          ? 'Camera is in use by another application' 
          : error.message 
      }
    }
  } catch (error) {
    console.error('❌ Error during camera cleanup:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Check if camera is available and not in use
 */
export const checkCameraAvailability = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    
    if (videoDevices.length === 0) {
      return { available: false, message: 'No camera devices found' }
    }
    
    // Try to briefly access the camera
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: false 
      })
      
      // Immediately stop the test stream
      testStream.getTracks().forEach(track => track.stop())
      
      return { 
        available: true, 
        message: `Camera available (${videoDevices.length} device${videoDevices.length > 1 ? 's' : ''} found)` 
      }
    } catch (error) {
      return { 
        available: false, 
        message: error.name === 'NotReadableError' 
          ? 'Camera is in use by another application' 
          : error.message 
      }
    }
  } catch (error) {
    return { available: false, message: error.message }
  }
}

/**
 * Get helpful instructions for camera issues
 */
export const getCameraInstructions = (errorType) => {
  const instructions = {
    'NotReadableError': [
      '1. Close all other browser tabs that might be using the camera',
      '2. Close any video conferencing apps (Zoom, Teams, etc.)',
      '3. Restart your browser',
      '4. If using Windows, check that no other apps have camera access in Settings > Privacy > Camera'
    ],
    'NotAllowedError': [
      '1. Click the camera icon in your browser address bar',
      '2. Select "Allow" for camera access',
      '3. Refresh the page',
      '4. Try again'
    ],
    'NotFoundError': [
      '1. Make sure your camera is connected',
      '2. Check that your camera drivers are installed',
      '3. Try a different camera if available',
      '4. Restart your computer if needed'
    ],
    'default': [
      '1. Refresh the page and try again',
      '2. Check your browser settings for camera permissions',
      '3. Try a different browser',
      '4. Contact support if the issue persists'
    ]
  }
  
  return instructions[errorType] || instructions.default
}
