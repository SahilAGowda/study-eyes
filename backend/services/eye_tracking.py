"""
Eye tracking service using MediaPipe and OpenCV
"""

import cv2
import mediapipe as mp
import numpy as np
from datetime import datetime
import threading
import queue
import time

class EyeTracker:
    """Real-time eye tracking using MediaPipe Face Mesh"""
    
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialize face mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Eye landmark indices
        self.LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        
        # Iris indices
        self.LEFT_IRIS_INDICES = [474, 475, 476, 477]
        self.RIGHT_IRIS_INDICES = [469, 470, 471, 472]
        
        # Camera properties
        self.camera_width = 640
        self.camera_height = 480
        
        # Tracking data
        self.is_tracking = False
        self.last_blink_time = time.time()
        self.blink_count = 0
        self.blink_threshold = 0.21  # Eye aspect ratio threshold for blink detection
        
        # Data queue for real-time processing
        self.data_queue = queue.Queue(maxsize=100)
        
    def calculate_eye_aspect_ratio(self, eye_landmarks):
        """Calculate Eye Aspect Ratio (EAR) for blink detection"""
        # Vertical eye landmarks
        A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
        
        # Horizontal eye landmark
        C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
        
        # Compute the eye aspect ratio
        ear = (A + B) / (2.0 * C)
        return ear
    
    def extract_eye_landmarks(self, landmarks, indices, image_width, image_height):
        """Extract eye landmarks from face mesh"""
        eye_points = []
        for idx in indices:
            landmark = landmarks[idx]
            x = int(landmark.x * image_width)
            y = int(landmark.y * image_height)
            eye_points.append([x, y])
        return np.array(eye_points)
    
    def calculate_gaze_direction(self, left_iris, right_iris, left_eye_center, right_eye_center):
        """Estimate gaze direction based on iris position relative to eye center"""
        # Calculate iris centers
        left_iris_center = np.mean(left_iris, axis=0)
        right_iris_center = np.mean(right_iris, axis=0)
        
        # Calculate relative positions
        left_gaze_x = left_iris_center[0] - left_eye_center[0]
        left_gaze_y = left_iris_center[1] - left_eye_center[1]
        
        right_gaze_x = right_iris_center[0] - right_eye_center[0]
        right_gaze_y = right_iris_center[1] - right_eye_center[1]
        
        # Average gaze direction
        gaze_x = (left_gaze_x + right_gaze_x) / 2
        gaze_y = (left_gaze_y + right_gaze_y) / 2
        
        # Determine gaze direction
        threshold = 5  # pixels
        
        if abs(gaze_x) < threshold and abs(gaze_y) < threshold:
            direction = "center"
        elif abs(gaze_x) > abs(gaze_y):
            direction = "left" if gaze_x < 0 else "right"
        else:
            direction = "up" if gaze_y < 0 else "down"
        
        return gaze_x, gaze_y, direction
    
    def calculate_head_pose(self, landmarks, image_width, image_height):
        """Calculate head pose angles (pitch, yaw, roll)"""
        # Key facial landmarks for pose estimation
        nose_tip = landmarks[1]
        chin = landmarks[18]
        left_eye_corner = landmarks[33]
        right_eye_corner = landmarks[263]
        left_mouth_corner = landmarks[61]
        right_mouth_corner = landmarks[291]
        
        # Convert to pixel coordinates
        image_points = np.array([
            [nose_tip.x * image_width, nose_tip.y * image_height],
            [chin.x * image_width, chin.y * image_height],
            [left_eye_corner.x * image_width, left_eye_corner.y * image_height],
            [right_eye_corner.x * image_width, right_eye_corner.y * image_height],
            [left_mouth_corner.x * image_width, left_mouth_corner.y * image_height],
            [right_mouth_corner.x * image_width, right_mouth_corner.y * image_height]
        ], dtype="double")
        
        # 3D model points
        model_points = np.array([
            [0.0, 0.0, 0.0],             # Nose tip
            [0.0, -330.0, -65.0],        # Chin
            [-225.0, 170.0, -135.0],     # Left eye corner
            [225.0, 170.0, -135.0],      # Right eye corner
            [-150.0, -150.0, -125.0],    # Left mouth corner
            [150.0, -150.0, -125.0]      # Right mouth corner
        ])
        
        # Camera matrix (approximation)
        focal_length = image_width
        center = (image_width/2, image_height/2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype="double")
        
        # Distortion coefficients (assuming no distortion)
        dist_coeffs = np.zeros((4, 1))
        
        # Solve PnP
        success, rotation_vector, translation_vector = cv2.solvePnP(
            model_points, image_points, camera_matrix, dist_coeffs
        )
        
        if success:
            # Convert rotation vector to rotation matrix
            rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
            
            # Calculate Euler angles
            sy = np.sqrt(rotation_matrix[0, 0] * rotation_matrix[0, 0] + rotation_matrix[1, 0] * rotation_matrix[1, 0])
            
            singular = sy < 1e-6
            
            if not singular:
                x = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
                y = np.arctan2(-rotation_matrix[2, 0], sy)
                z = np.arctan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
            else:
                x = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
                y = np.arctan2(-rotation_matrix[2, 0], sy)
                z = 0
            
            # Convert to degrees
            pitch = np.degrees(x)
            yaw = np.degrees(y)
            roll = np.degrees(z)
            
            return pitch, yaw, roll
        
        return 0, 0, 0
    
    def calculate_attention_score(self, gaze_direction, head_pitch, head_yaw, ear_left, ear_right):
        """Calculate attention score based on gaze and head pose"""
        score = 1.0
        
        # Gaze direction penalty
        if gaze_direction not in ["center"]:
            score -= 0.3
        
        # Head pose penalty
        if abs(head_pitch) > 15:  # Looking too far up or down
            score -= 0.2
        if abs(head_yaw) > 20:    # Looking too far left or right
            score -= 0.2
          # Blink/closed eyes penalty
        avg_ear = (ear_left + ear_right) / 2
        if avg_ear < self.blink_threshold:
            score -= 0.4
        
        return max(0.0, score)
    
    def process_frame(self, frame):
        """Process a single frame for eye tracking"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        tracking_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'face_detected': False,
            'left_eye_x': None,
            'left_eye_y': None,
            'right_eye_x': None,
            'right_eye_y': None,
            'gaze_x': None,
            'gaze_y': None,
            'gaze_direction': None,
            'attention_score': 0.0,
            'is_focused': False,
            'is_blinking': False,
            'blink_duration': None,
            'head_pitch': 0.0,
            'head_yaw': 0.0,
            'head_roll': 0.0,
            'distance_cm': None
        }
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                tracking_data['face_detected'] = True
                
                # Extract landmarks
                landmarks = face_landmarks.landmark
                h, w = frame.shape[:2]
                
                # Extract eye landmarks
                left_eye = self.extract_eye_landmarks(landmarks, self.LEFT_EYE_INDICES[:6], w, h)
                right_eye = self.extract_eye_landmarks(landmarks, self.RIGHT_EYE_INDICES[:6], w, h)
                
                # Extract iris landmarks if available
                if len(landmarks) > max(self.LEFT_IRIS_INDICES + self.RIGHT_IRIS_INDICES):
                    left_iris = self.extract_eye_landmarks(landmarks, self.LEFT_IRIS_INDICES, w, h)
                    right_iris = self.extract_eye_landmarks(landmarks, self.RIGHT_IRIS_INDICES, w, h)
                else:
                    left_iris = left_eye
                    right_iris = right_eye
                
                # Calculate eye centers
                left_eye_center = np.mean(left_eye, axis=0)
                right_eye_center = np.mean(right_eye, axis=0)
                
                tracking_data['left_eye_x'] = float(left_eye_center[0])
                tracking_data['left_eye_y'] = float(left_eye_center[1])
                tracking_data['right_eye_x'] = float(right_eye_center[0])
                tracking_data['right_eye_y'] = float(right_eye_center[1])
                
                # Calculate Eye Aspect Ratios
                ear_left = self.calculate_eye_aspect_ratio(left_eye)
                ear_right = self.calculate_eye_aspect_ratio(right_eye)
                avg_ear = (ear_left + ear_right) / 2
                
                # Blink detection
                is_blinking = avg_ear < self.blink_threshold
                tracking_data['is_blinking'] = is_blinking
                
                if is_blinking:
                    if not hasattr(self, 'blink_start_time'):
                        self.blink_start_time = time.time()
                elif hasattr(self, 'blink_start_time'):
                    blink_duration = (time.time() - self.blink_start_time) * 1000  # milliseconds
                    tracking_data['blink_duration'] = blink_duration
                    delattr(self, 'blink_start_time')
                    self.blink_count += 1
                
                # Gaze direction
                gaze_x, gaze_y, gaze_direction = self.calculate_gaze_direction(
                    left_iris, right_iris, left_eye_center, right_eye_center
                )
                
                tracking_data['gaze_x'] = float(gaze_x)
                tracking_data['gaze_y'] = float(gaze_y)
                tracking_data['gaze_direction'] = gaze_direction
                
                # Head pose
                head_pitch, head_yaw, head_roll = self.calculate_head_pose(landmarks, w, h)
                tracking_data['head_pitch'] = float(head_pitch)
                tracking_data['head_yaw'] = float(head_yaw)
                tracking_data['head_roll'] = float(head_roll)
                  # Attention score
                attention_score = self.calculate_attention_score(
                    gaze_direction, head_pitch, head_yaw, ear_left, ear_right
                )
                tracking_data['attention_score'] = float(attention_score)
                tracking_data['is_focused'] = attention_score > 0.7
                
                # Add additional fields expected by WebSocket service
                tracking_data['gaze_direction_x'] = float(gaze_x)
                tracking_data['gaze_direction_y'] = float(gaze_y)
                tracking_data['left_eye_ratio'] = float(ear_left)
                tracking_data['right_eye_ratio'] = float(ear_right)
                tracking_data['blink_detected'] = is_blinking
                tracking_data['gaze_stability'] = 0.8  # Placeholder - would need history
                tracking_data['blink_rate'] = self.get_blink_rate()
                tracking_data['pupil_dilation'] = 0.5  # Placeholder
                tracking_data['fixation_duration'] = 2.0  # Placeholder
                tracking_data['movement_frequency'] = 10.0  # Placeholder
                tracking_data['posture_score'] = 0.8  # Placeholder
                  # Distance estimation (rough approximation)
                eye_width = np.linalg.norm(left_eye_center - right_eye_center)
                if eye_width > 0:
                    # Average eye distance is about 6.3cm, assuming 65cm distance gives ~100 pixels
                    estimated_distance = (6.3 * 100) / eye_width
                    tracking_data['distance_from_screen'] = float(estimated_distance)
                else:
                    tracking_data['distance_from_screen'] = 65.0
                
                # Add face landmarks for frontend overlay drawing
                # Convert landmarks to a list of dictionaries for JSON serialization
                landmarks_list = []
                for landmark in landmarks:
                    landmarks_list.append({
                        'x': float(landmark.x),
                        'y': float(landmark.y),
                        'z': float(landmark.z) if hasattr(landmark, 'z') else 0.0
                    })
                
                tracking_data['face_landmarks'] = landmarks_list
                tracking_data['landmark_count'] = len(landmarks_list)
                
                # Also include specific eye and facial feature points for easier access
                tracking_data['facial_features'] = {
                    'left_eye_landmarks': left_eye.tolist(),
                    'right_eye_landmarks': right_eye.tolist(),
                    'left_iris_landmarks': left_iris.tolist(),
                    'right_iris_landmarks': right_iris.tolist(),
                    'nose_tip': [float(landmarks[1].x), float(landmarks[1].y)],  # Nose tip
                    'chin': [float(landmarks[18].x), float(landmarks[18].y)]  # Chin
                }
                
                break  # Only process first face
        
        return tracking_data
    
    def start_camera_tracking(self, camera_index=0):
        """Start real-time camera tracking"""
        cap = cv2.VideoCapture(camera_index)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.camera_width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.camera_height)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.is_tracking = True
        
        try:
            while self.is_tracking:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process frame
                tracking_data, processed_frame = self.process_frame(frame)
                
                # Add to queue (non-blocking)
                try:
                    self.data_queue.put_nowait(tracking_data)
                except queue.Full:
                    # Remove oldest item and add new one
                    try:
                        self.data_queue.get_nowait()
                        self.data_queue.put_nowait(tracking_data)
                    except queue.Empty:
                        pass
                
                # Optional: Display frame (for debugging)
                # cv2.imshow('Eye Tracking', processed_frame)
                # if cv2.waitKey(1) & 0xFF == ord('q'):
                #     break
                
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.is_tracking = False
    
    def stop_tracking(self):
        """Stop eye tracking"""
        self.is_tracking = False
    
    def get_latest_data(self):
        """Get latest tracking data from queue"""
        try:
            return self.data_queue.get_nowait()
        except queue.Empty:
            return None
    
    def get_blink_rate(self, time_window_seconds=60):
        """Calculate blink rate (blinks per minute)"""
        current_time = time.time()
        if hasattr(self, 'last_blink_time'):
            time_elapsed = current_time - self.last_blink_time
            if time_elapsed >= time_window_seconds:
                blink_rate = (self.blink_count / time_elapsed) * 60
                # Reset counters
                self.blink_count = 0
                self.last_blink_time = current_time
                return blink_rate
        return 0.0
