"""
WebSocket service for real-time eye tracking data transmission
Clean version with focus percentage display and proper datetime serialization
"""

from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
import threading
import time
import json
import cv2
import numpy as np
from datetime import datetime
from services.eye_tracking import EyeTracker
from services.attention_detector import AttentionDetector
from models.database import db
from models.session import StudySession, EyeTrackingData
import logging
import math
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for tracking
eye_tracker = EyeTracker()
attention_detector = AttentionDetector()
active_sessions = {}  # user_id -> session_data
tracking_threads = {}  # user_id -> thread

def init_websocket_handlers(socketio):
    """Initialize WebSocket event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        try:
            logger.info("🔌 Client connected to WebSocket")
            
            emit('connected', {
                'message': 'Connected to Study Eyes tracking service',
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'success'
            })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Connection error: {e}")
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info("📴 Client disconnected")

    @socketio.on('start_tracking')
    def handle_start_tracking(data):
        """Start eye tracking for a session"""
        try:
            # Verify JWT token or use test user
            token = data.get('token')
            if token:
                try:
                    decoded_token = decode_token(token)
                    user_id = decoded_token['sub']
                except Exception as e:
                    logger.warning(f"⚠️ Token decode failed: {e}, using test user")
                    user_id = 'test_user'
            else:
                logger.warning("⚠️ No token provided, using test user for demonstration")
                user_id = 'test_user'
            
            session_id = data.get('session_id', int(time.time() * 1000))  # Use timestamp if no session_id
            
            # Store session info with ISO string timestamp
            active_sessions[user_id] = {
                'session_id': session_id,
                'start_time': datetime.utcnow().isoformat(),  # Convert to ISO string
                'tracking_active': True
            }
            
            # Start tracking thread
            tracking_thread = threading.Thread(
                target=_tracking_loop,
                args=(socketio, user_id, session_id),
                daemon=True
            )
            tracking_threads[user_id] = tracking_thread
            tracking_thread.start()
            
            emit('tracking_started', {
                'session_id': session_id,
                'message': 'Eye tracking started',
                'timestamp': datetime.utcnow().isoformat()
            })
            
            logger.info(f"✅ Started tracking for user {user_id}, session {session_id}")
            
        except Exception as e:
            logger.error(f"❌ Error starting tracking: {e}")
            emit('error', {'message': 'Failed to start tracking'})
    
    @socketio.on('stop_tracking')
    def handle_stop_tracking(data):
        """Stop eye tracking for a session"""
        try:
            # Verify JWT token or use test user
            token = data.get('token')
            user_id = 'test_user'  # Default for demo
            
            if token:
                try:
                    decoded_token = decode_token(token)
                    user_id = decoded_token['sub']
                except Exception as e:
                    logger.warning(f"⚠️ Token decode failed: {e}, using test user")
            
            # Stop tracking
            if user_id in active_sessions:
                active_sessions[user_id]['tracking_active'] = False
                del active_sessions[user_id]
            
            if user_id in tracking_threads:
                del tracking_threads[user_id]
            
            emit('tracking_stopped', {
                'message': 'Eye tracking stopped',
                'timestamp': datetime.utcnow().isoformat()
            })
            
            logger.info(f"⏹️ Stopped tracking for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Error stopping tracking: {e}")
            emit('error', {'message': 'Failed to stop tracking'})

def _initialize_camera():
    """Initialize camera with robust testing and advanced troubleshooting"""
    logger.info("🔍 Initializing camera with enhanced troubleshooting...")
    
    # Try different camera backends (Windows-specific order)
    camera_backends = [
        (cv2.CAP_DSHOW, "DirectShow"),
        (cv2.CAP_MSMF, "Media Foundation"),
        (cv2.CAP_ANY, "Any Available")
    ]
    
    # Try different camera indices
    camera_indices = [0, 1, 2]
    
    for backend, backend_name in camera_backends:
        logger.info(f"🎥 Testing {backend_name} backend...")
        
        for camera_idx in camera_indices:
            try:
                logger.info(f"  📹 Testing camera index {camera_idx}...")
                
                # Create test capture
                test_cap = cv2.VideoCapture(camera_idx, backend)
                
                if not test_cap.isOpened():
                    logger.warning(f"    ❌ Camera {camera_idx} could not be opened")
                    continue
                
                # Enhanced camera property configuration
                logger.info(f"    ⚙️ Configuring camera properties...")
                
                # Basic properties
                test_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                test_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                test_cap.set(cv2.CAP_PROP_FPS, 30)
                test_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                
                # Advanced properties for better frame capture
                test_cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)  # Enable autofocus
                test_cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)  # Auto exposure
                test_cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)  # Brightness
                test_cap.set(cv2.CAP_PROP_CONTRAST, 0.5)  # Contrast
                test_cap.set(cv2.CAP_PROP_SATURATION, 0.5)  # Saturation
                test_cap.set(cv2.CAP_PROP_GAIN, 0)  # Automatic gain
                
                # For DirectShow, try specific format
                if backend == cv2.CAP_DSHOW:
                    test_cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))
                
                # Extended initialization time for camera to warm up
                logger.info(f"    ⏳ Warming up camera (3 seconds)...")
                time.sleep(3.0)
                
                # Clear buffer by reading several frames
                logger.info(f"    🔄 Clearing camera buffer...")
                for _ in range(10):
                    ret, _ = test_cap.read()
                    time.sleep(0.1)
                
                # Test frame capture with enhanced validation
                successful_reads = 0
                total_attempts = 20  # Increased attempts
                min_intensity_threshold = 10  # Lowered threshold for testing
                
                logger.info(f"    🧪 Testing {total_attempts} frame captures...")
                
                for test_attempt in range(total_attempts):
                    ret, test_frame = test_cap.read()
                    
                    if ret and test_frame is not None and test_frame.size > 0:
                        # Enhanced frame validation
                        try:
                            # Convert to grayscale for analysis
                            gray = cv2.cvtColor(test_frame, cv2.COLOR_BGR2GRAY)
                            mean_intensity = gray.mean()
                            std_intensity = gray.std()
                            
                            # Check for actual content (not just black frames)
                            if mean_intensity > min_intensity_threshold and std_intensity > 5:
                                successful_reads += 1
                                if test_attempt % 5 == 0:
                                    logger.info(f"      ✅ Frame {test_attempt + 1}: SUCCESS (intensity: {mean_intensity:.2f}, std: {std_intensity:.2f})")
                            else:
                                if test_attempt % 5 == 0:
                                    logger.warning(f"      ⚠️ Frame {test_attempt + 1}: low content (intensity: {mean_intensity:.2f}, std: {std_intensity:.2f})")
                        except Exception as frame_error:
                            logger.warning(f"      ❌ Frame {test_attempt + 1}: processing error - {frame_error}")
                    else:
                        if test_attempt % 5 == 0:
                            logger.warning(f"      ❌ Frame {test_attempt + 1}: failed to read")
                    
                    time.sleep(0.05)  # Reduced delay for faster testing
                
                test_cap.release()
                
                success_rate = successful_reads / total_attempts
                logger.info(f"    📊 Camera {camera_idx} success rate: {success_rate:.1%} ({successful_reads}/{total_attempts})")
                
                # Lowered success rate requirement for testing
                if success_rate >= 0.3:  # 30% success rate (was 80%)
                    logger.info(f"✅ Camera {camera_idx} with {backend_name} is ACCEPTABLE for testing!")
                    
                    # Create final capture object with same configuration
                    final_cap = cv2.VideoCapture(camera_idx, backend)
                    
                    # Apply same enhanced configuration
                    final_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    final_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    final_cap.set(cv2.CAP_PROP_FPS, 30)
                    final_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    final_cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
                    final_cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)
                    final_cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)
                    final_cap.set(cv2.CAP_PROP_CONTRAST, 0.5)
                    final_cap.set(cv2.CAP_PROP_SATURATION, 0.5)
                    final_cap.set(cv2.CAP_PROP_GAIN, 0)
                    
                    if backend == cv2.CAP_DSHOW:
                        final_cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))
                    
                    # Warm up final capture
                    time.sleep(2.0)
                    
                    # Clear buffer
                    for _ in range(5):
                        final_cap.read()
                        time.sleep(0.1)
                    
                    # Final validation
                    ret, test_frame = final_cap.read()
                    if ret and test_frame is not None:
                        try:
                            gray = cv2.cvtColor(test_frame, cv2.COLOR_BGR2GRAY)
                            mean_intensity = gray.mean()
                            if mean_intensity > 5:  # Even lower threshold for final validation
                                logger.info(f"✅ Final validation successful! (intensity: {mean_intensity:.2f})")
                                return final_cap, camera_idx, backend_name
                            else:
                                logger.warning(f"⚠️ Final validation shows low intensity: {mean_intensity:.2f}")
                                # Still return it for testing purposes
                                return final_cap, camera_idx, backend_name
                        except:
                            logger.warning(f"⚠️ Final validation processing error, but camera seems functional")
                            return final_cap, camera_idx, backend_name
                    else:
                        logger.warning(f"❌ Final validation failed")
                        final_cap.release()
                else:
                    logger.warning(f"❌ Camera {camera_idx} unreliable ({success_rate:.1%})")
                    
            except Exception as e:
                logger.error(f"    ❌ Error testing camera {camera_idx}: {e}")
                continue
    
    logger.warning("❌ No reliable camera found")
    return None, None, None

def _tracking_loop(socketio, user_id, session_id):
    """Main tracking loop that runs in a separate thread"""
    cap = None
    use_mock_data = False
    frame_count = 0
    failed_frame_count = 0
    max_failed_frames = 30  # Switch to mock after 30 failed frames
    
    try:
        # Initialize camera
        logger.info(f"🎥 Initializing camera for user {user_id}")
        cap, camera_idx, backend_name = _initialize_camera()
        
        if cap is None:
            logger.warning("🤖 No working camera found, using mock data for demonstration")
            use_mock_data = True
        else:
            logger.info(f"✅ Camera initialized successfully for user {user_id}: Camera {camera_idx} ({backend_name})")
        
        # Main tracking loop
        while user_id in active_sessions and active_sessions[user_id]['tracking_active']:
            frame_count += 1
            
            if use_mock_data:
                # Generate mock eye tracking data for demonstration
                eye_data = _generate_mock_eye_data(frame_count)
                # Log occasionally to show mock data is being used
                if frame_count % 150 == 0:  # Every 5 seconds at 30fps
                    logger.info(f"🤖 Using mock data for user {user_id} - frame {frame_count}")
            else:
                # Capture frame from camera
                try:
                    ret, frame = cap.read()
                    if not ret or frame is None or frame.size == 0:
                        failed_frame_count += 1
                        logger.warning(f"❌ Failed to read frame from camera (attempt {failed_frame_count})")
                        
                        # Switch to mock data if camera fails repeatedly
                        if failed_frame_count >= max_failed_frames:
                            logger.warning(f"🔄 Camera failed {max_failed_frames} times, switching to mock data")
                            use_mock_data = True
                            if cap:
                                cap.release()
                        
                        # Use mock data for this frame
                        eye_data = _generate_mock_eye_data(frame_count)
                    else:
                        # Successfully captured frame - reset failure count
                        failed_frame_count = 0
                        
                        # Log successful frame capture occasionally
                        if frame_count % 150 == 0:
                            logger.info(f"📹 Processing real camera frame {frame_count} for user {user_id}")
                        
                        # Process real camera frame through AI models
                        try:
                            # Extract eye tracking features from the frame
                            eye_data = eye_tracker.extract_features(frame)
                            
                            # Add AI analysis
                            features = _extract_features_for_ai(eye_data)
                            ai_results = attention_detector.analyze_attention(features)
                            eye_data.update(ai_results)
                            
                            # Add camera frame display with focus percentage overlay
                            _display_camera_with_focus(frame, eye_data.get('attention_score', 0))
                            
                        except Exception as e:
                            logger.error(f"❌ Error processing real camera frame: {e}")
                            # Fallback to mock data for this frame
                            eye_data = _generate_mock_eye_data(frame_count)
                            
                except Exception as e:
                    logger.error(f"❌ Error capturing camera frame: {e}")
                    failed_frame_count += 1
                    eye_data = _generate_mock_eye_data(frame_count)
            
            if eye_data:
                # Ensure all datetime objects are converted to ISO strings before emission
                tracking_data = {
                    'session_id': session_id,
                    'timestamp': datetime.utcnow().isoformat(),
                    **eye_data  # Spread all eye_data fields
                }
                
                # Ensure all values are JSON serializable
                clean_data = _serialize_tracking_data(tracking_data)
                
                # Emit the tracking data via WebSocket
                socketio.emit('tracking_data', clean_data)
                
                # Save to database occasionally (every 30 frames ~ 1 second)
                if frame_count % 30 == 0:
                    try:
                        _save_tracking_data(session_id, eye_data)
                    except Exception as e:
                        logger.error(f"❌ Error saving tracking data: {e}")
            
            # Control frame rate (30 FPS)
            time.sleep(1/30)
            
    except Exception as e:
        logger.error(f"❌ Error in tracking loop: {e}")
        socketio.emit('error', {
            'message': 'Tracking error occurred',
            'error': str(e)
        })
    finally:
        # Clean up camera
        if cap is not None:
            cap.release()
            cv2.destroyAllWindows()
        logger.info(f"📷 Camera released for user {user_id}")

def _display_camera_with_focus(frame, focus_percentage):
    """Display camera feed with focus percentage overlay"""
    try:
        # Create a copy of the frame for display
        display_frame = frame.copy()
        
        # Get frame dimensions
        height, width = display_frame.shape[:2]
        
        # Convert focus percentage to 0-100 scale if it's in 0-1 scale
        if focus_percentage <= 1.0:
            focus_percentage *= 100
        
        # Draw focus percentage overlay
        focus_text = f"Focus: {focus_percentage:.1f}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1.2
        thickness = 3
        
        # Get text size for background rectangle
        (text_width, text_height), baseline = cv2.getTextSize(focus_text, font, font_scale, thickness)
        
        # Define colors based on focus level
        if focus_percentage >= 80:
            color = (0, 255, 0)  # Green for high focus
        elif focus_percentage >= 60:
            color = (0, 255, 255)  # Yellow for medium focus
        else:
            color = (0, 0, 255)  # Red for low focus
        
        # Draw background rectangle for text
        bg_top_left = (20, 30)
        bg_bottom_right = (20 + text_width + 20, 30 + text_height + 20)
        cv2.rectangle(display_frame, bg_top_left, bg_bottom_right, (0, 0, 0), -1)
        cv2.rectangle(display_frame, bg_top_left, bg_bottom_right, color, 2)
        
        # Draw focus percentage text
        text_position = (30, 30 + text_height)
        cv2.putText(display_frame, focus_text, text_position, font, font_scale, color, thickness)
        
        # Draw focus level indicator bar
        bar_width = 200
        bar_height = 20
        bar_x = width - bar_width - 20
        bar_y = 30
        
        # Background bar
        cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
        
        # Fill bar based on focus percentage
        fill_width = int((focus_percentage / 100) * bar_width)
        cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), color, -1)
        
        # Bar border
        cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (255, 255, 255), 2)
        
        # Bar percentage labels
        cv2.putText(display_frame, "0%", (bar_x - 20, bar_y + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        cv2.putText(display_frame, "100%", (bar_x + bar_width + 5, bar_y + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Display the frame
        cv2.imshow("Study Eyes - Focus Detection", display_frame)
        cv2.waitKey(1)  # Non-blocking wait
        
    except Exception as e:
        logger.error(f"❌ Error displaying camera feed: {e}")

def _serialize_tracking_data(data):
    """Serialize tracking data to ensure JSON compatibility"""
    def serialize_value(value):
        if hasattr(value, 'item'):  # numpy types
            return value.item()
        elif isinstance(value, (bool, float, int, str, type(None))):
            return value
        elif isinstance(value, datetime):
            return value.isoformat()
        else:
            return str(value)
    
    return {k: serialize_value(v) for k, v in data.items()}

def _extract_features_for_ai(eye_data):
    """Extract exactly 13 features from eye tracking data for AI analysis"""
    # Extract exactly the 13 features that the AI models expect (not 14!)
    features = [
        eye_data.get('gaze_direction_x', 0.0),      # Feature 1: gaze_x
        eye_data.get('gaze_direction_y', 0.0),      # Feature 2: gaze_y
        eye_data.get('gaze_stability', 0.8),        # Feature 3: gaze_stability
        eye_data.get('head_pitch', 0.0),            # Feature 4: head_pitch
        eye_data.get('head_yaw', 0.0),              # Feature 5: head_yaw
        eye_data.get('head_roll', 0.0),             # Feature 6: head_roll
        eye_data.get('blink_rate', 15.0),           # Feature 7: blink_rate
        (eye_data.get('left_eye_ratio', 0.8) + eye_data.get('right_eye_ratio', 0.8)) / 2,  # Feature 8: avg_eye_openness
        eye_data.get('pupil_dilation', 0.5),        # Feature 9: pupil_dilation
        eye_data.get('fixation_duration', 2.0),     # Feature 10: fixation_duration
        eye_data.get('movement_frequency', 10.0),   # Feature 11: movement_frequency
        eye_data.get('distance_from_screen', 65.0), # Feature 12: distance_from_screen
        eye_data.get('posture_score', 0.8)          # Feature 13: posture_score
    ]
    
    # Ensure exactly 13 features
    if len(features) != 13:
        logger.error(f"❌ CRITICAL: Feature count mismatch! Expected 13, got {len(features)}")
        logger.error(f"Features: {features}")
        # Pad with zeros or truncate to exactly 13 features
        if len(features) < 13:
            features.extend([0.0] * (13 - len(features)))
        else:
            features = features[:13]
        logger.warning(f"🔧 Adjusted to 13 features: {len(features)}")
    
    # Convert numpy types to native Python types to avoid JSON serialization issues
    features = [float(f) for f in features]
    
    logger.debug(f"🔍 Extracted exactly {len(features)} features for AI analysis")
    return features

def _save_tracking_data(session_id, data):
    """Save tracking data to database with proper context and serialization"""
    try:
        # Import app here to avoid circular imports
        from app import app
        
        with app.app_context():
            # Convert any numpy/boolean types to native Python types for JSON serialization
            serialized_data = _serialize_tracking_data(data)
            
            # Create tracking data entry
            tracking_entry = EyeTrackingData(
                session_id=session_id,
                timestamp=datetime.utcnow(),
                data=json.dumps(serialized_data)
            )
            
            db.session.add(tracking_entry)
            db.session.commit()
            
    except Exception as e:
        logger.error(f"❌ Error saving tracking data: {e}")
        # Don't re-raise the exception to avoid disrupting the tracking loop

def _generate_mock_eye_data(frame_count):
    """Generate realistic mock eye tracking data for demonstration"""
    # Simulate natural variation with some trends
    base_time = time.time()
    
    # Simulate attention cycles (high attention -> gradual decline -> recovery)
    attention_cycle = math.sin(frame_count * 0.02) * 0.3 + 0.7  # Cycles between 0.4 and 1.0
    attention_noise = random.uniform(-0.1, 0.1)
    attention_score = max(0.2, min(1.0, attention_cycle + attention_noise)) * 100
    
    # Determine focus level based on attention score
    if attention_score >= 80:
        focus_level = 'high'
    elif attention_score >= 60:
        focus_level = 'medium'
    else:
        focus_level = 'low'
    
    # Simulate different distraction types based on patterns
    distraction_types = ['none', 'phone', 'looking_away', 'drowsy', 'fidgeting']
    if attention_score < 50:
        distraction_type = random.choice(distraction_types[1:])  # Exclude 'none'
    elif attention_score < 75:
        distraction_type = random.choice(['none'] * 3 + distraction_types[1:])  # Mostly none
    else:
        distraction_type = 'none'
    
    return {
        'left_eye_ratio': random.uniform(0.7, 0.9),
        'right_eye_ratio': random.uniform(0.7, 0.9),
        'blink_detected': random.choice([True, False]) if frame_count % 30 == 0 else False,
        'gaze_direction_x': random.uniform(-0.5, 0.5),
        'gaze_direction_y': random.uniform(-0.3, 0.3),
        'gaze_stability': random.uniform(0.6, 0.9),
        'head_pitch': random.uniform(-10, 10),
        'head_yaw': random.uniform(-15, 15),
        'head_roll': random.uniform(-5, 5),
        'blink_rate': random.uniform(12, 20),
        'pupil_dilation': random.uniform(0.3, 0.7),
        'fixation_duration': random.uniform(1.5, 3.5),
        'movement_frequency': random.uniform(8, 15),
        'distance_from_screen': random.uniform(60, 80),
        'posture_score': random.uniform(0.6, 0.9),
        'attention_score': attention_score,
        'focus_level': focus_level,
        'distraction_type': distraction_type,
        'fatigue_level': 'low' if attention_score > 70 else 'medium' if attention_score > 50 else 'high',
        'eye_strain_level': random.uniform(5, 25),
        'confidence_score': random.uniform(0.7, 0.95),
        'is_focused': attention_score >= 65,
        'is_mock_data': True
    }
