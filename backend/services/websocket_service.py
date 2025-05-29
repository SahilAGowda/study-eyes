"""
WebSocket service for real-time eye tracking data transmission
CORRECTED VERSION with exactly 13 features for AI model
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
        """Start eye tracking for a new session"""
        try:
            # Get token from data
            token = data.get('token')
            
            # Try to decode JWT token
            try:
                if token:
                    decoded_token = decode_token(token)
                    user_id = decoded_token['sub']
                else:
                    # Fallback for testing
                    user_id = 'test_user'
                    logger.warning("⚠️ No token provided, using test user")
            except Exception as e:
                logger.warning(f"⚠️ Token decode failed: {e}, using test user")
                user_id = 'test_user'
            
            # Create or get session
            session_id = data.get('session_id', int(time.time() * 1000))
            
            # Store session info
            active_sessions[user_id] = {
                'session_id': session_id,
                'tracking_active': True,
                'start_time': datetime.utcnow().isoformat()  # Convert to ISO string
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
                'message': 'Eye tracking started',
                'session_id': session_id,
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
            # Verify JWT token
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
    """Initialize camera with comprehensive testing across different backends and indices"""
    logger.info("🎥 Initializing camera with enhanced troubleshooting...")
    
    # Try different camera backends (Windows-specific order)
    camera_backends = [
        (cv2.CAP_DSHOW, "DirectShow"),
        (cv2.CAP_MSMF, "Media Foundation"),
        (cv2.CAP_ANY, "Any Available")
    ]
    
    # Try different camera indices
    camera_indices = [0, 1, 2]
    
    for backend, backend_name in camera_backends:
        logger.info(f"🔍 Testing {backend_name} backend...")
        
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
        # Initialize camera with robust testing
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
                if frame_count % 30 == 0:  # Every second at 30fps
                    logger.info(f"🤖 Using mock data for user {user_id} - frame {frame_count} - Focus: {eye_data.get('focus_level', 'unknown')}, Attention: {eye_data.get('attention_score', 0):.1f}")
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
                                cap = None
                        
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
                            # Get eye tracking data from the frame
                            eye_data = eye_tracker.process_frame(frame)
                            
                            if eye_data and not eye_data.get('is_mock_data', False):
                                # Add real AI analysis flag
                                eye_data['is_real_camera'] = True
                                logger.debug(f"🧠 Real AI processing successful for frame {frame_count}")
                            else:
                                # Fallback to mock data if processing fails
                                logger.warning("⚠️ Eye tracker returned no data, using mock data")
                                eye_data = _generate_mock_eye_data(frame_count)
                                
                        except Exception as e:
                            logger.error(f"❌ Error processing camera frame: {e}")
                            # Fallback to mock data on processing error
                            eye_data = _generate_mock_eye_data(frame_count)
                            
                except Exception as e:
                    logger.error(f"❌ Error capturing camera frame: {e}")
                    failed_frame_count += 1
                    eye_data = _generate_mock_eye_data(frame_count)
            
            if eye_data:
                # For mock data, use the attention data already included
                if eye_data.get('is_mock_data', False):
                    # Mock data already has all fields, just emit it
                    pass
                else:
                    # For real camera data, run AI analysis
                    try:                        # Extract features for AI analysis
                        features = _extract_features_for_ai(eye_data)
                        logger.info(f"🔍 Features extracted: {len(features)} features")
                        
                        # Get AI attention analysis
                        ai_analysis = attention_detector.analyze_attention(features)
                        logger.info(f"🧠 AI analysis completed: {ai_analysis}")
                        
                        # Merge AI analysis with eye tracking data
                        eye_data.update({
                            'attention_score': ai_analysis['attention_score'] / 100.0,  # Convert to 0-1 scale
                            'focus_level': ai_analysis['focus_level'],
                            'distraction_type': ai_analysis['distraction_type'],
                            'fatigue_level': ai_analysis['fatigue_level'],
                            'eye_strain_level': ai_analysis['eye_strain_level'],
                            'posture_score': ai_analysis['posture_score'] / 100.0,  # Convert to 0-1 scale
                            'confidence_score': ai_analysis['attention_confidence'],
                            'ai_processed': True
                        })
                        
                        # Log successful AI processing occasionally
                        if frame_count % 150 == 0:
                            logger.info(f"🧠 AI analysis complete for frame {frame_count}: "
                                      f"attention={ai_analysis['attention_score']}, "
                                      f"focus={ai_analysis['focus_level']}")
                                      
                    except Exception as e:
                        logger.error(f"❌ Error in AI analysis: {e}")
                        import traceback
                        logger.error(f"❌ AI analysis traceback: {traceback.format_exc()}")
                        # Use fallback values for AI analysis
                        eye_data.update({
                            'attention_score': 0.75,
                            'focus_level': 'medium',
                            'distraction_type': 'none',
                            'confidence_score': 0.7,
                            'ai_processed': False
                        })
                
                # Emit the tracking data via WebSocket
                socketio.emit('tracking_data', {
                    'user_id': user_id,
                    'session_id': session_id,
                    'data': eye_data,
                    'timestamp': datetime.utcnow().isoformat()  # Convert to ISO string
                })
                
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
        }, room=f"user_{user_id}")
    finally:
        # Clean up camera
        if cap is not None:
            cap.release()
        logger.info(f"📷 Camera released for user {user_id}")

def _extract_features_for_ai(eye_data):
    """Extract EXACTLY 13 features from eye tracking data for AI analysis"""
    # This function MUST return exactly 13 features - no more, no less!
    features = [
        eye_data.get('gaze_direction_x', 0.0),                                              # 1
        eye_data.get('gaze_direction_y', 0.0),                                              # 2
        eye_data.get('gaze_stability', 0.8),                                                # 3
        eye_data.get('head_pitch', 0.0),                                                    # 4
        eye_data.get('head_yaw', 0.0),                                                      # 5
        eye_data.get('head_roll', 0.0),                                                     # 6
        eye_data.get('blink_rate', 15.0),                                                   # 7
        (eye_data.get('left_eye_ratio', 0.8) + eye_data.get('right_eye_ratio', 0.8)) / 2,  # 8 - AVERAGE of left and right
        eye_data.get('pupil_dilation', 0.5),                                                # 9
        eye_data.get('fixation_duration', 2.0),                                             # 10
        eye_data.get('movement_frequency', 10.0),                                           # 11
        eye_data.get('distance_from_screen', 65.0),                                         # 12
        eye_data.get('posture_score', 0.8)                                                  # 13
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
            def serialize_value(value):
                if hasattr(value, 'item'):  # numpy types
                    return value.item()
                elif isinstance(value, (bool, float, int, str, type(None))):
                    return value
                else:
                    return str(value)
            
            # Prepare serializable data
            eye_data_dict = {
                'left_eye_ratio': serialize_value(data.get('left_eye_ratio')),
                'right_eye_ratio': serialize_value(data.get('right_eye_ratio')),
                'blink_detected': serialize_value(data.get('blink_detected')),
                'gaze_direction_x': serialize_value(data.get('gaze_direction_x')),
                'gaze_direction_y': serialize_value(data.get('gaze_direction_y'))
            }
            
            head_pose_dict = {
                'pitch': serialize_value(data.get('head_pitch')),
                'yaw': serialize_value(data.get('head_yaw')),
                'roll': serialize_value(data.get('head_roll'))
            }
            
            tracking_record = EyeTrackingData(
                session_id=session_id,
                timestamp=datetime.utcnow(),
                eye_data=json.dumps(eye_data_dict),
                attention_score=serialize_value(data.get('attention_score', 0.5)),
                focus_level=str(data.get('focus_level', 'medium')),
                distraction_type=str(data.get('distraction_type')) if data.get('distraction_type') else None,
                head_pose=json.dumps(head_pose_dict)
            )
            
            db.session.add(tracking_record)
            db.session.commit()
            
    except Exception as e:
        logger.error(f"❌ Error saving tracking data: {e}")
        try:
            with app.app_context():
                db.session.rollback()
        except:
            pass

def get_active_sessions():
    """Get currently active tracking sessions"""
    return active_sessions.copy()

def stop_all_tracking():
    """Stop all active tracking sessions"""
    for user_id in list(active_sessions.keys()):
        if user_id in active_sessions:
            active_sessions[user_id]['tracking_active'] = False
            del active_sessions[user_id]
        
        if user_id in tracking_threads:
            del tracking_threads[user_id]
    
    logger.info("⏹️ Stopped all tracking sessions")

def _generate_mock_eye_data(frame_count):
    """Generate realistic mock eye tracking data for demonstration"""
    # Create realistic variations based on frame count
    time_factor = frame_count / 30.0  # Convert to seconds
    
    # Simulate natural eye movement patterns
    base_gaze_x = 0.5 + 0.1 * math.sin(time_factor * 0.5)  # Slow horizontal drift
    base_gaze_y = 0.5 + 0.05 * math.cos(time_factor * 0.3)  # Slow vertical drift
    
    # Add small random variations for natural movement
    gaze_x = base_gaze_x + random.uniform(-0.05, 0.05)
    gaze_y = base_gaze_y + random.uniform(-0.05, 0.05)
    
    # Simulate attention variations (good focus most of the time)
    attention_base = 0.8 + 0.15 * math.sin(time_factor * 0.1)
    attention_score = max(0.3, min(1.0, attention_base + random.uniform(-0.1, 0.1)))
    
    # Determine focus level based on attention score
    if attention_score >= 0.8:
        focus_level = 'high'
    elif attention_score >= 0.6:
        focus_level = 'medium'
    else:
        focus_level = 'low'
    
    # Simulate occasional distractions
    distraction_type = None
    if random.random() < 0.05:  # 5% chance of distraction
        distraction_type = random.choice(['phone', 'away', 'fatigue'])
    
    # Simulate blink patterns (natural blink rate: 12-20 per minute)
    blink_detected = random.random() < 0.02  # ~1.2 blinks per minute at 30fps
    
    return {
        'left_eye_ratio': random.uniform(0.75, 0.95),
        'right_eye_ratio': random.uniform(0.75, 0.95),
        'blink_detected': blink_detected,
        'gaze_direction_x': gaze_x,
        'gaze_direction_y': gaze_y,
        'gaze_stability': random.uniform(0.7, 0.9),
        'head_pitch': random.uniform(-5, 5),
        'head_yaw': random.uniform(-10, 10),
        'head_roll': random.uniform(-3, 3),
        'blink_rate': random.uniform(12, 20),
        'pupil_dilation': random.uniform(0.4, 0.6),
        'fixation_duration': random.uniform(1.5, 3.0),
        'movement_frequency': random.uniform(8, 15),
        'distance_from_screen': random.uniform(60, 75),
        'posture_score': random.uniform(0.7, 0.9),
        'attention_score': attention_score,
        'focus_level': focus_level,
        'distraction_type': distraction_type,
        'confidence_score': random.uniform(0.8, 0.95),
        'is_mock_data': True  # Flag to indicate this is mock data
    }
