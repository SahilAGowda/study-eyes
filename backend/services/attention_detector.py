"""
AI attention detection service using TensorFlow and computer vision
"""

import tensorflow as tf
import numpy as np
import cv2
from datetime import datetime, timedelta
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

class AttentionDetector:
    """AI-powered attention detection using machine learning"""
    
    def __init__(self, model_path=None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), '..', 'models', 'ai_models')
        self.attention_model = None
        self.distraction_model = None
        self.fatigue_model = None
        
        # Feature extractors
        self.feature_history = []
        self.history_window = 30  # seconds of history
        
        # Load or create models
        self._load_or_create_models()
        
    def _load_or_create_models(self):
        """Load existing models or create new ones"""
        try:
            # Try to load existing models
            attention_model_file = os.path.join(self.model_path, 'attention_model.joblib')
            distraction_model_file = os.path.join(self.model_path, 'distraction_model.joblib')
            fatigue_model_file = os.path.join(self.model_path, 'fatigue_model.joblib')
            
            if all(os.path.exists(f) for f in [attention_model_file, distraction_model_file, fatigue_model_file]):
                self.attention_model = joblib.load(attention_model_file)
                self.distraction_model = joblib.load(distraction_model_file)
                self.fatigue_model = joblib.load(fatigue_model_file)
                print("Loaded existing AI models")
            else:
                print("Creating new AI models with default parameters")
                self._create_default_models()
                
        except Exception as e:
            print(f"Error loading models: {e}")
            self._create_default_models()
    
    def _create_default_models(self):
        """Create default machine learning models"""
        # Create basic models with default parameters
        self.attention_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.distraction_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        
        self.fatigue_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            random_state=42
        )
        
        # Train with synthetic data if no real data available
        self._train_with_synthetic_data()
    
    def _train_with_synthetic_data(self):
        """Train models with synthetic data for initial functionality"""
        print("Training models with synthetic data...")
        
        # Generate synthetic training data
        n_samples = 1000
        features = self._generate_synthetic_features(n_samples)
        
        # Attention labels (binary: focused/not focused)
        attention_labels = self._generate_attention_labels(features)
        
        # Distraction type labels (0: none, 1: phone, 2: away, 3: closed_eyes)
        distraction_labels = self._generate_distraction_labels(features)
        
        # Fatigue labels (0: alert, 1: tired, 2: very_tired)
        fatigue_labels = self._generate_fatigue_labels(features)
        
        # Train models
        self.attention_model.fit(features, attention_labels)
        self.distraction_model.fit(features, distraction_labels)
        self.fatigue_model.fit(features, fatigue_labels)
        
        # Save models
        os.makedirs(self.model_path, exist_ok=True)
        joblib.dump(self.attention_model, os.path.join(self.model_path, 'attention_model.joblib'))
        joblib.dump(self.distraction_model, os.path.join(self.model_path, 'distraction_model.joblib'))
        joblib.dump(self.fatigue_model, os.path.join(self.model_path, 'fatigue_model.joblib'))
        
        print("Models trained and saved successfully")
    
    def _generate_synthetic_features(self, n_samples):
        """Generate synthetic feature data for training"""
        np.random.seed(42)
        
        features = []
        for _ in range(n_samples):
            # Gaze features
            gaze_x = np.random.normal(0, 10)  # Center-focused gaze
            gaze_y = np.random.normal(0, 10)
            gaze_stability = np.random.uniform(0.5, 1.0)
            
            # Head pose features
            head_pitch = np.random.normal(0, 15)
            head_yaw = np.random.normal(0, 20)
            head_roll = np.random.normal(0, 10)
            
            # Eye features
            blink_rate = np.random.uniform(10, 30)  # blinks per minute
            eye_openness = np.random.uniform(0.3, 1.0)
            pupil_dilation = np.random.uniform(0.4, 0.8)
            
            # Temporal features
            gaze_fixation_duration = np.random.uniform(0.1, 3.0)  # seconds
            movement_frequency = np.random.uniform(0, 20)  # movements per minute
            
            # Distance and posture
            distance_from_screen = np.random.uniform(40, 100)  # cm
            posture_score = np.random.uniform(0.3, 1.0)
            
            features.append([
                gaze_x, gaze_y, gaze_stability, head_pitch, head_yaw, head_roll,
                blink_rate, eye_openness, pupil_dilation, gaze_fixation_duration,
                movement_frequency, distance_from_screen, posture_score
            ])
        
        return np.array(features)
    
    def _generate_attention_labels(self, features):
        """Generate attention labels based on feature patterns"""
        labels = []
        for feature in features:
            gaze_x, gaze_y, gaze_stability, head_pitch, head_yaw, head_roll, \
            blink_rate, eye_openness, pupil_dilation, fixation_duration, \
            movement_freq, distance, posture = feature
            
            # Calculate attention score based on multiple factors
            attention_score = 1.0
            
            # Gaze factors
            if abs(gaze_x) > 15 or abs(gaze_y) > 15:
                attention_score -= 0.3
            if gaze_stability < 0.7:
                attention_score -= 0.2
            
            # Head pose factors
            if abs(head_pitch) > 20 or abs(head_yaw) > 25:
                attention_score -= 0.3
            
            # Eye factors
            if eye_openness < 0.6:
                attention_score -= 0.4
            if blink_rate > 25 or blink_rate < 12:
                attention_score -= 0.1
            
            # Movement factors
            if movement_freq > 15:
                attention_score -= 0.2
            
            # Distance and posture
            if distance > 80 or distance < 50:
                attention_score -= 0.1
            if posture < 0.6:
                attention_score -= 0.1
            
            # Binary classification
            labels.append(1 if attention_score > 0.6 else 0)
        
        return np.array(labels)
    
    def _generate_distraction_labels(self, features):
        """Generate distraction type labels"""
        labels = []
        for feature in features:
            gaze_x, gaze_y, gaze_stability, head_pitch, head_yaw, head_roll, \
            blink_rate, eye_openness, pupil_dilation, fixation_duration, \
            movement_freq, distance, posture = feature
            
            # Determine distraction type
            if eye_openness < 0.3:
                labels.append(3)  # closed_eyes
            elif abs(head_yaw) > 30 or abs(gaze_x) > 25:
                labels.append(2)  # looking_away
            elif movement_freq > 20 and gaze_stability < 0.5:
                labels.append(1)  # phone/device
            else:
                labels.append(0)  # no distraction
        
        return np.array(labels)
    
    def _generate_fatigue_labels(self, features):
        """Generate fatigue level labels"""
        labels = []
        for feature in features:
            gaze_x, gaze_y, gaze_stability, head_pitch, head_yaw, head_roll, \
            blink_rate, eye_openness, pupil_dilation, fixation_duration, \
            movement_freq, distance, posture = feature
            
            # Calculate fatigue score
            fatigue_score = 0
            
            # Blink rate indicator
            if blink_rate > 25:
                fatigue_score += 1
            if blink_rate > 30:
                fatigue_score += 1
            
            # Eye openness
            if eye_openness < 0.7:
                fatigue_score += 1
            if eye_openness < 0.5:
                fatigue_score += 1
            
            # Head position (drooping)
            if head_pitch > 15:
                fatigue_score += 1
            
            # Gaze stability (tired eyes wander)
            if gaze_stability < 0.6:
                fatigue_score += 1
            
            # Movement frequency (restlessness or sluggishness)
            if movement_freq > 25 or movement_freq < 5:
                fatigue_score += 1
            
            # Classify fatigue level
            if fatigue_score >= 4:
                labels.append(2)  # very_tired
            elif fatigue_score >= 2:
                labels.append(1)  # tired
            else:
                labels.append(0)  # alert
        
        return np.array(labels)
    
    def extract_features(self, tracking_data_history):
        """Extract features from tracking data history"""
        if not tracking_data_history:
            return None
        
        # Convert to numerical features
        features = []
        
        # Latest data point
        latest = tracking_data_history[-1]
        
        # Gaze features
        gaze_x = latest.get('gaze_x', 0) or 0
        gaze_y = latest.get('gaze_y', 0) or 0
        
        # Calculate gaze stability (variance over time)
        if len(tracking_data_history) >= 5:
            recent_gaze_x = [d.get('gaze_x', 0) or 0 for d in tracking_data_history[-5:]]
            recent_gaze_y = [d.get('gaze_y', 0) or 0 for d in tracking_data_history[-5:]]
            gaze_stability = 1.0 / (1.0 + np.var(recent_gaze_x) + np.var(recent_gaze_y))
        else:
            gaze_stability = 0.5
        
        # Head pose features
        head_pitch = latest.get('head_pitch', 0) or 0
        head_yaw = latest.get('head_yaw', 0) or 0
        head_roll = latest.get('head_roll', 0) or 0
        
        # Eye features
        eye_openness = 1.0 if not latest.get('is_blinking', False) else 0.3
        
        # Calculate blink rate
        blink_count = sum(1 for d in tracking_data_history[-30:] if d.get('is_blinking', False))
        blink_rate = (blink_count / min(len(tracking_data_history), 30)) * 60  # per minute
        
        # Pupil dilation (placeholder - would need actual pupil size data)
        pupil_dilation = 0.6  # Default value
        
        # Temporal features
        gaze_fixation_duration = 1.0  # Placeholder
        
        # Movement frequency (head movement)
        if len(tracking_data_history) >= 10:
            movement_count = 0
            for i in range(1, min(len(tracking_data_history), 10)):
                prev_pitch = tracking_data_history[-i-1].get('head_pitch', 0) or 0
                curr_pitch = tracking_data_history[-i].get('head_pitch', 0) or 0
                prev_yaw = tracking_data_history[-i-1].get('head_yaw', 0) or 0
                curr_yaw = tracking_data_history[-i].get('head_yaw', 0) or 0
                
                if abs(curr_pitch - prev_pitch) > 2 or abs(curr_yaw - prev_yaw) > 2:
                    movement_count += 1
            
            movement_frequency = movement_count * 6  # Scale to per minute
        else:
            movement_frequency = 5  # Default
        
        # Distance and posture
        distance_from_screen = latest.get('distance_cm', 65) or 65
        posture_score = 0.8  # Placeholder - would calculate from head pose
        
        features = [
            gaze_x, gaze_y, gaze_stability, head_pitch, head_yaw, head_roll,
            blink_rate, eye_openness, pupil_dilation, gaze_fixation_duration,
            movement_frequency, distance_from_screen, posture_score
        ]
        
        return np.array(features).reshape(1, -1)
    
    def predict_attention(self, tracking_data_history):
        """Predict attention level from tracking data"""
        features = self.extract_features(tracking_data_history)
        if features is None:
            return 0.5, False, "none", 0.5
        
        try:
            # Predict attention
            attention_prob = self.attention_model.predict_proba(features)[0]
            is_focused = attention_prob[1] > 0.6
            attention_score = attention_prob[1]
            
            # Predict distraction type
            distraction_pred = self.distraction_model.predict(features)[0]
            distraction_types = ["none", "phone", "away", "closed_eyes"]
            distraction_type = distraction_types[min(distraction_pred, len(distraction_types)-1)]
            
            # Predict fatigue level
            fatigue_pred = self.fatigue_model.predict(features)[0]
            fatigue_levels = [0.0, 0.5, 1.0]  # alert, tired, very_tired
            fatigue_level = fatigue_levels[min(fatigue_pred, len(fatigue_levels)-1)]
            
            return attention_score, is_focused, distraction_type, fatigue_level
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return 0.5, False, "none", 0.5
    
    def update_feature_history(self, tracking_data):
        """Update feature history with new tracking data"""
        self.feature_history.append({
            'timestamp': tracking_data.get('timestamp', datetime.utcnow()),
            'data': tracking_data
        })
        
        # Keep only recent history
        cutoff_time = datetime.utcnow() - timedelta(seconds=self.history_window)
        self.feature_history = [
            item for item in self.feature_history 
            if item['timestamp'] > cutoff_time
        ]
    
    def retrain_models(self, training_data):
        """Retrain models with new data"""
        if len(training_data) < 100:
            print("Insufficient training data")
            return False
        
        try:
            # Extract features and labels from training data
            features = []
            attention_labels = []
            distraction_labels = []
            fatigue_labels = []
            
            for session_data in training_data:
                for tracking_point in session_data['tracking_data']:
                    feature_vector = self.extract_features([tracking_point])
                    if feature_vector is not None:
                        features.append(feature_vector[0])
                        
                        # Get labels from session data
                        attention_labels.append(tracking_point.get('is_focused', False))
                        distraction_labels.append(tracking_point.get('distraction_type', 'none'))
                        fatigue_labels.append(tracking_point.get('fatigue_level', 0.0))
            
            if len(features) < 100:
                print("Insufficient feature data")
                return False
            
            features = np.array(features)
            attention_labels = np.array([1 if label else 0 for label in attention_labels])
            
            # Convert string labels to numerical
            distraction_map = {"none": 0, "phone": 1, "away": 2, "closed_eyes": 3}
            distraction_labels = np.array([distraction_map.get(label, 0) for label in distraction_labels])
            
            fatigue_labels = np.array([min(int(label * 2), 2) for label in fatigue_labels])
            
            # Split data
            X_train, X_test, y_att_train, y_att_test = train_test_split(
                features, attention_labels, test_size=0.2, random_state=42
            )
            
            # Retrain models
            self.attention_model.fit(X_train, y_att_train)
            
            # Test accuracy
            y_att_pred = self.attention_model.predict(X_test)
            accuracy = accuracy_score(y_att_test, y_att_pred)
            
            print(f"Model retrained with accuracy: {accuracy:.3f}")
              # Save updated models
            joblib.dump(self.attention_model, os.path.join(self.model_path, 'attention_model.joblib'))
            joblib.dump(self.distraction_model, os.path.join(self.model_path, 'distraction_model.joblib'))
            joblib.dump(self.fatigue_model, os.path.join(self.model_path, 'fatigue_model.joblib'))
            
            return True
            
        except Exception as e:
            print(f"Retraining error: {e}")
            return False
    
    def get_model_info(self):
        """Get information about the current models"""
        return {
            'attention_model': type(self.attention_model).__name__ if self.attention_model else None,
            'distraction_model': type(self.distraction_model).__name__ if self.distraction_model else None,
            'fatigue_model': type(self.fatigue_model).__name__ if self.fatigue_model else None,
            'feature_count': 13,
            'history_window_seconds': self.history_window
        }
    
    def analyze_attention(self, features):
        """Analyze attention using the trained AI models"""
        try:
            # Convert features to numpy array
            if isinstance(features, list):
                features_array = np.array(features).reshape(1, -1)
            else:
                features_array = features.reshape(1, -1)
            
            # Get predictions from all models
            attention_prediction = self.attention_model.predict(features_array)[0]
            attention_confidence = self.attention_model.predict_proba(features_array)[0]
            
            distraction_prediction = self.distraction_model.predict(features_array)[0]
            distraction_confidence = self.distraction_model.predict_proba(features_array)[0]
            
            fatigue_prediction = self.fatigue_model.predict(features_array)[0]
            fatigue_confidence = self.fatigue_model.predict_proba(features_array)[0]
            
            # Calculate attention score (0-100)
            if attention_prediction == 1:
                attention_score = max(60, int(attention_confidence[1] * 100))
            else:
                attention_score = min(40, int(attention_confidence[0] * 100))
            
            # Determine focus level
            if attention_score >= 80:
                focus_level = 'high'
            elif attention_score >= 60:
                focus_level = 'medium'
            else:
                focus_level = 'low'
            
            # Map distraction types
            distraction_types = ['none', 'phone', 'looking_away', 'closed_eyes']
            distraction_type = distraction_types[distraction_prediction] if distraction_prediction < len(distraction_types) else 'none'
            
            # Map fatigue levels
            fatigue_levels = ['alert', 'tired', 'very_tired']
            fatigue_level = fatigue_levels[fatigue_prediction] if fatigue_prediction < len(fatigue_levels) else 'alert'
            
            # Calculate eye strain level (0-30, higher is worse)
            eye_strain_level = max(0, min(30, int(fatigue_confidence[fatigue_prediction] * 30)))
            
            # Calculate posture score (60-95, higher is better)
            gaze_x, gaze_y = features[0], features[1]
            head_pitch, head_yaw = features[3], features[4]
            
            posture_score = 95
            if abs(gaze_x) > 15 or abs(gaze_y) > 15:
                posture_score -= 15
            if abs(head_pitch) > 20 or abs(head_yaw) > 25:
                posture_score -= 20
            posture_score = max(60, posture_score)
            
            return {
                'attention_score': attention_score,
                'focus_level': focus_level,
                'distraction_type': distraction_type,
                'fatigue_level': fatigue_level,
                'eye_strain_level': eye_strain_level,
                'posture_score': posture_score,
                'attention_confidence': float(attention_confidence[attention_prediction]),
                'distraction_confidence': float(distraction_confidence[distraction_prediction]),
                'fatigue_confidence': float(fatigue_confidence[fatigue_prediction])
            }
            
        except Exception as e:
            print(f"Error in analyze_attention: {e}")
            # Return fallback values
            return {
                'attention_score': 75,
                'focus_level': 'medium',
                'distraction_type': 'none',
                'fatigue_level': 'alert',
                'eye_strain_level': 10,
                'posture_score': 80,
                'attention_confidence': 0.7,
                'distraction_confidence': 0.6,
                'fatigue_confidence': 0.8
            }
