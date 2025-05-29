"""
WebSocket service for real-time eye tracking data transmission
Fixed version with comprehensive camera handling and AI integration
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
            logger.info("Client connected to WebSocket")
            
            emit('connected', {
                'message': 'Connected to Study Eyes tracking service',
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'success'
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Connection error: {e}")
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info("Client disconnected")
    
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
                    logger.warning("No token provided, using test user")
            except Exception as e:
                logger.warning(f"Token decode failed: {e}, using test user")
                user_id = 'test_user'
            
            # Create or get session
            session_id = data.get('session_id', int(time.time() * 1000))
            
            # Store session info
            active_sessions[user_id] = {
                'session_id': session_id,
                'tracking_active': True,
                'start_time': datetime.utcnow()
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
            
            logger.info(f"Started tracking for user {user_id}, session {session_id}")
            
        except Exception as e:
            logger.error(f"Error starting tracking: {e}")
            emit('error', {'message': 'Failed to start tracking'})
    
    @socketio.on('stop_tracking')
    def handle_stop_tracking(data):
        """Stop eye tracking for a session"""
        try:
            # Verify JWT token
            token = data.get('token')
            if not token:
                emit('error', {'message': 'Authentication token required'})
                return
            
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
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
            
            logger.info(f"Stopped tracking for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error stopping tracking: {e}")
            emit('error', {'message': 'Failed to stop tracking'})

def _initialize_camera():
    """Initialize camera with robust testing across different backends and indices"""
    logger.info("🔍 Initializing camera with comprehensive testing...")
    
    # Try different camera backends (Windows-specific order)
    camera_backends = [
        (cv2.CAP_DSHOW, "DirectShow"),
        (cv2.CAP_MSMF, "Media Foundation"),
        (cv2.CAP_ANY, "Any Available")
    ]
    
    # Try different camera indices
    camera_indices = [0, 1, 2]
    
    for backend, backend_name in camera_backends:
        logger.info(f"Testing {backend_name} backend...")
        
        for camera_idx in camera_indices:
            try:
                logger.info(f"  Testing camera index {camera_idx}...")
                
                # Create test capture
                test_cap = cv2.VideoCapture(camera_idx, backend)
                
                if not test_cap.isOpened():
                    logger.warning(f"    Camera {camera_idx} could not be opened")
                    continue
                
                # Set optimal camera properties
                test_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                test_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                test_cap.set(cv2.CAP_PROP_FPS, 30)
                test_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                test_cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
                
                # Allow camera to initialize
                time.sleep(1.0)
                
                # Test frame capture thoroughly
                successful_reads = 0
                total_attempts = 15
                
                logger.info(f"    Testing {total_attempts} frame captures...")
                
                for test_attempt in range(total_attempts):
                    ret, test_frame = test_cap.read()
                    
                    if ret and test_frame is not None and test_frame.size > 0:
                        # Validate frame has actual content
                        gray = cv2.cvtColor(test_frame, cv2.COLOR_BGR2GRAY)
                        mean_intensity = gray.mean()
                        
                        if mean_intensity > 5:  # Frame is not completely black/empty
                            successful_reads += 1
                            if test_attempt % 5 == 0:
                                logger.info(f"      Frame {test_attempt + 1}: SUCCESS (intensity: {mean_intensity:.2f})")
                        else:
                            logger.warning(f"      Frame {test_attempt + 1}: empty/black frame (intensity: {mean_intensity:.2f})")
                    else:
                        logger.warning(f"      Frame {test_attempt + 1}: failed to read")
                    
                    time.sleep(0.1)
                
                test_cap.release()
                
                success_rate = successful_reads / total_attempts
                logger.info(f"    Camera {camera_idx} success rate: {success_rate:.1%} ({successful_reads}/{total_attempts})")
                
                # Require high success rate for reliability
                if success_rate >= 0.8:  # Need at least 80% success rate
                    logger.info(f"✅ Camera {camera_idx} with {backend_name} is RELIABLE!")
                    
                    # Create final capture object
                    final_cap = cv2.VideoCapture(camera_idx, backend)
                    final_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    final_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    final_cap.set(cv2.CAP_PROP_FPS, 30)
                    final_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    final_cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
                    
                    # Final validation
                    time.sleep(0.5)
                    ret, test_frame = final_cap.read()
                    if ret and test_frame is not None:
                        logger.info(f"✅ Final camera validation successful!")
                        return final_cap, camera_idx, backend_name
                    else:
                        logger.warning(f"❌ Final validation failed")
                        final_cap.release()
                else:
                    logger.warning(f"❌ Camera {camera_idx} unreliable ({success_rate:.1%})")
                    
            except Exception as e:
                logger.error(f"    Error testing camera {camera_idx}: {e}")
                continue
    
    logger.warning("❌ No reliable camera found")
    return None, None, None

def _tracking_loop(socketio, user_id, session_id):
    """Main tracking loop that runs in a separate thread"""
    
    cap = None
    use_mock_data = False
    frame_count = 0
    failed_frame_count = 0
    max_failed_frames = 50  # Switch to mock after many failures
    camera_info = "Unknown"
    
    try:
        # Initialize camera with comprehensive testing
        cap, camera_idx, backend_name = _initialize_camera()
        
        if cap is None:
            logger.warning("⚠️ No working camera found, using mock data for demonstration")
            use_mock_data = True
        else:
            camera_info = f"Camera {camera_idx} ({backend_name})"
            logger.info(f"✅ Camera initialized successfully for user {user_id}: {camera_info}")
        
        # Main tracking loop
        while user_id in active_sessions and active_sessions[user_id]['tracking_active']:
            frame_count += 1
            
            if use_mock_data:
                # Generate mock eye tracking data
                eye_data = _generate_mock_eye_data(frame_count)
                
                # Log occasionally to show mock data is being used
                if frame_count % 150 == 0:  # Every 5 seconds at 30fps
                    logger.info(f"📊 Using mock data for user {user_id} - frame {frame_count}")
                    
            else:
                # Capture frame from real camera
                try:
                    ret, frame = cap.read()
                    
                    if not ret or frame is None or frame.size == 0:
                        failed_frame_count += 1
                        
                        if failed_frame_count % 10 == 0:  # Log every 10 failures
                            logger.warning(f"⚠️ Camera frame failure #{failed_frame_count} for {camera_info}")
                        
                        # Switch to mock data after too many failures
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
                            logger.info(f"📹 Processing real camera frame {frame_count} from {camera_info}")
                        
                        # Process real camera frame through AI models
                        try:
                            # Get eye tracking data from the frame
                            eye_data = eye_tracker.process_frame(frame)
                            
                            if eye_data and not eye_data.get('is_mock_data', False):
                                # Successfully processed real camera data
                                eye_data['is_real_camera'] = True
                                eye_data['camera_info'] = camera_info
                                
                                # Log successful AI processing occasionally
                                if frame_count % 150 == 0:
                                    logger.info(f"🤖 Real AI processing successful for frame {frame_count}")
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
            
            # Process eye data through AI models if it's real camera data
            if eye_data:
                if not eye_data.get('is_mock_data', False):
                    # For real camera data, run comprehensive AI analysis
                    try:
                        # Extract features for AI analysis
                        features = _extract_features_for_ai(eye_data)
                        
                        # Get AI attention analysis
                        ai_analysis = attention_detector.analyze_attention(features)
                        
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
                                      f"attention={ai_analysis['attention_score']:.1f}%, "
                                      f"focus={ai_analysis['focus_level']}")
                                      
                    except Exception as e:
                        logger.error(f"❌ Error in AI analysis: {e}")
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
                    'timestamp': datetime.utcnow().isoformat()
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
        logger.error(f"❌ Fatal error in tracking loop: {e}")
        
    finally:
        # Cleanup
        if cap:
            cap.release()
        logger.info(f"🏁 Tracking loop ended for user {user_id}")

def _extract_features_for_ai(eye_data):
    """Extract features from eye tracking data for AI analysis"""
    features = [
        eye_data.get('left_eye_ratio', 0.85),           # eye_openness
        eye_data.get('right_eye_ratio', 0.85),          # eye_openness_right
        eye_data.get('gaze_direction_x', 0.0),          # gaze_x
        eye_data.get('gaze_direction_y', 0.0),          # gaze_y
        eye_data.get('head_pitch', 0.0),                # head_pose_pitch
        eye_data.get('head_yaw', 0.0),                  # head_pose_yaw
        eye_data.get('head_roll', 0.0),                 # head_pose_roll
        eye_data.get('blink_rate', 15.0),               # blink_frequency
        eye_data.get('pupil_dilation', 0.5),            # pupil_size
        eye_data.get('gaze_stability', 0.8),            # gaze_stability
        eye_data.get('fixation_duration', 2.0),         # fixation_duration
        eye_data.get('movement_frequency', 10.0),       # movement_freq
        eye_data.get('distance_from_screen', 65.0),     # distance
        eye_data.get('posture_score', 0.8)              # posture
    ]
    
    return features

def _save_tracking_data(session_id, data):
    """Save tracking data to database"""
    try:
        tracking_record = EyeTrackingData(
            session_id=session_id,
            timestamp=datetime.utcnow(),
            eye_data=json.dumps({
                'left_eye_ratio': data.get('left_eye_ratio'),
                'right_eye_ratio': data.get('right_eye_ratio'),
                'blink_detected': data.get('blink_detected'),
                'gaze_direction_x': data.get('gaze_direction_x'),
                'gaze_direction_y': data.get('gaze_direction_y')
            }),
            attention_score=data.get('attention_score', 0.5),
            focus_level=data.get('focus_level', 'medium'),
            distraction_type=data.get('distraction_type'),
            head_pose=json.dumps({
                'pitch': data.get('head_pitch'),
                'yaw': data.get('head_yaw'),
                'roll': data.get('head_roll')
            })
        )
        
        db.session.add(tracking_record)
        db.session.commit()
        
    except Exception as e:
        logger.error(f"Error saving tracking data: {e}")
        db.session.rollback()

def _generate_mock_eye_data(frame_count):
    """Generate realistic mock eye tracking data for demonstration"""
    import math
    import random
    
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
    
    logger.info("Stopped all tracking sessions")
