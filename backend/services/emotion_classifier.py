"""
CNN-based Emotion Classification Service

This service uses a Convolutional Neural Network trained on the FER2013 dataset
from Kaggle for accurate facial emotion recognition.

Supports both TensorFlow (.h5) and PyTorch (.pth) models.
Uses DNN-based face detection for better accuracy at any distance.

Emotions detected:
- angry, disgust, fear, happy, sad, surprise, neutral

Mapped to engagement states:
- engaged (happy, surprise)
- focused (neutral with attention)
- confused (fear, surprise with low confidence)
- bored (sad, neutral with low arousal)
- frustrated (angry, disgust)
- drowsy (neutral with eye closure indicators)
"""

import os
import numpy as np
import cv2
from datetime import datetime
import json

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Try to import PyTorch first (better GPU support on Windows)
PYTORCH_AVAILABLE = False
TENSORFLOW_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    PYTORCH_AVAILABLE = True
except ImportError:
    pass

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import load_model
    TENSORFLOW_AVAILABLE = True
except ImportError:
    pass


# ============================================================================
# SE Block for channel attention
# ============================================================================
class SEBlock(nn.Module):
    """Squeeze-and-Excitation block."""
    def __init__(self, channels, reduction=16):
        super().__init__()
        self.squeeze = nn.AdaptiveAvgPool2d(1)
        self.excitation = nn.Sequential(
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        b, c, _, _ = x.size()
        y = self.squeeze(x).view(b, c)
        y = self.excitation(y).view(b, c, 1, 1)
        return x * y.expand_as(x)


class ResidualBlock(nn.Module):
    """Residual block with SE attention."""
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.se = SEBlock(out_channels)
        self.relu = nn.ReLU(inplace=True)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
    
    def forward(self, x):
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = self.se(out)
        out += self.shortcut(x)
        out = self.relu(out)
        return out


class PyTorchEmotionCNN(nn.Module):
    """Legacy CNN model for backward compatibility."""
    def __init__(self, num_classes=7):
        super(PyTorchEmotionCNN, self).__init__()
        
        self.features = nn.Sequential(
            nn.Conv2d(1, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2, 2), nn.Dropout(0.25),
            
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.MaxPool2d(2, 2), nn.Dropout(0.25),
            
            nn.Conv2d(128, 256, 3, padding=1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.Conv2d(256, 256, 3, padding=1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.MaxPool2d(2, 2), nn.Dropout(0.25),
            
            nn.Conv2d(256, 512, 3, padding=1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.Conv2d(512, 512, 3, padding=1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.MaxPool2d(2, 2), nn.Dropout(0.25),
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 3 * 3, 512), nn.BatchNorm1d(512), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(512, 256), nn.BatchNorm1d(256), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


class EmotionResNet(nn.Module):
    """ResNet-style architecture for better emotion recognition."""
    def __init__(self, num_classes=7):
        super().__init__()
        
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 64, 7, 2, 3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, 2, 1)
        )
        
        self.layer1 = self._make_layer(64, 64, 2, stride=1)
        self.layer2 = self._make_layer(64, 128, 2, stride=2)
        self.layer3 = self._make_layer(128, 256, 2, stride=2)
        self.layer4 = self._make_layer(256, 512, 2, stride=2)
        
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(512, num_classes)
    
    def _make_layer(self, in_channels, out_channels, num_blocks, stride):
        layers = [ResidualBlock(in_channels, out_channels, stride)]
        for _ in range(1, num_blocks):
            layers.append(ResidualBlock(out_channels, out_channels))
        return nn.Sequential(*layers)
    
    def forward(self, x):
        x = self.conv1(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        x = self.fc(x)
        return x


class EmotionMiniXception(nn.Module):
    """
    Mini-Xception architecture - proven to work well for FER2013.
    Based on the paper "Real-time Convolutional Neural Networks for Emotion 
    and Gender Classification" which achieved state-of-the-art on FER2013.
    """
    
    def __init__(self, num_classes=7):
        super().__init__()
        
        # Initial conv
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 8, 3, padding=1, bias=False),
            nn.BatchNorm2d(8),
            nn.ReLU(inplace=True),
            nn.Conv2d(8, 8, 3, padding=1, bias=False),
            nn.BatchNorm2d(8),
            nn.ReLU(inplace=True)
        )
        
        # Residual blocks with depthwise separable convolutions
        self.block1 = self._make_block(8, 16, 2)
        self.block2 = self._make_block(16, 32, 2)
        self.block3 = self._make_block(32, 64, 2)
        self.block4 = self._make_block(64, 128, 2)
        
        # Final conv
        self.conv_final = nn.Sequential(
            nn.Conv2d(128, 256, 3, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True)
        )
        
        # Global average pooling + classifier
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(256, num_classes)
    
    def _make_block(self, in_ch, out_ch, stride):
        """Residual block with depthwise separable convolution."""
        return nn.ModuleDict({
            'residual': nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_ch)
            ),
            'sep_conv1': nn.Sequential(
                nn.Conv2d(in_ch, in_ch, 3, padding=1, groups=in_ch, bias=False),
                nn.BatchNorm2d(in_ch),
                nn.ReLU(inplace=True),
                nn.Conv2d(in_ch, out_ch, 1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True)
            ),
            'sep_conv2': nn.Sequential(
                nn.Conv2d(out_ch, out_ch, 3, padding=1, groups=out_ch, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_ch, out_ch, 1, bias=False),
                nn.BatchNorm2d(out_ch)
            ),
            'pool': nn.MaxPool2d(3, stride=stride, padding=1)
        })
    
    def _forward_block(self, block, x):
        """Forward through a residual block."""
        residual = block['residual'](x)
        x = block['sep_conv1'](x)
        x = block['sep_conv2'](x)
        x = block['pool'](x)
        return nn.functional.relu(x + residual)
    
    def forward(self, x):
        x = self.conv1(x)
        x = self._forward_block(self.block1, x)
        x = self._forward_block(self.block2, x)
        x = self._forward_block(self.block3, x)
        x = self._forward_block(self.block4, x)
        x = self.conv_final(x)
        x = self.gap(x)
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        x = self.fc(x)
        return x


class EmotionClassifier:
    """
    CNN-based emotion classifier trained on FER2013 dataset.
    
    The model architecture is based on VGG-style networks optimized for
    facial expression recognition on 48x48 grayscale images.
    """
    
    # FER2013 emotion labels
    EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
    
    # Mapping from FER2013 emotions to engagement states
    EMOTION_TO_ENGAGEMENT = {
        'angry': 'frustrated',
        'disgust': 'frustrated', 
        'fear': 'confused',
        'happy': 'engaged',
        'sad': 'bored',
        'surprise': 'engaged',
        'neutral': 'focused'
    }
    
    # Valence scores for each emotion (-1 to 1)
    EMOTION_VALENCE = {
        'angry': -0.7,
        'disgust': -0.6,
        'fear': -0.4,
        'happy': 0.9,
        'sad': -0.5,
        'surprise': 0.3,
        'neutral': 0.0
    }
    
    # Arousal scores for each emotion (0 to 1)
    EMOTION_AROUSAL = {
        'angry': 0.8,
        'disgust': 0.5,
        'fear': 0.7,
        'happy': 0.8,
        'sad': 0.2,
        'surprise': 0.9,
        'neutral': 0.3
    }
    
    def __init__(self, model_path=None):
        """
        Initialize the emotion classifier.
        
        Args:
            model_path: Path to the trained model file. If None, uses default path.
        """
        self.model_dir = os.path.join(
            os.path.dirname(__file__), '..', 'models', 'ai_models'
        )
        self.pytorch_model_path = os.path.join(self.model_dir, 'emotion_cnn_pytorch.pth')
        self.tensorflow_model_path = os.path.join(self.model_dir, 'emotion_cnn_keras.h5')
        # Also check for legacy .h5 file
        self.tensorflow_model_path_legacy = os.path.join(self.model_dir, 'emotion_cnn.h5')
        
        self.model = None
        self.model_type = None  # 'pytorch' or 'tensorflow'
        self.device = None
        self.face_cascade = None
        self.dnn_net = None
        self.use_dnn_detector = False
        self.input_shape = (48, 48, 1)  # Default, will be updated from model
        
        # Load face detector
        self._load_face_detector()
        
        # Load model (prefer PyTorch for better GPU support)
        self._load_model()
        
        # Update input shape from loaded model
        if self.model is not None and self.model_type == 'tensorflow':
            self.input_shape = tuple(self.model.input_shape[1:])
            print(f"Model input shape: {self.input_shape}")
        
        # History for temporal smoothing
        self.emotion_history = []
        self.history_window = 10  # frames
        
    def _load_face_detector(self):
        """Load face detector - prefer DNN-based for better accuracy."""
        # Try to load DNN-based face detector (much better than Haar Cascade)
        self.use_dnn_detector = False
        
        # OpenCV DNN face detector paths
        model_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'face_detection')
        prototxt_path = os.path.join(model_dir, 'deploy.prototxt')
        caffemodel_path = os.path.join(model_dir, 'res10_300x300_ssd_iter_140000.caffemodel')
        
        if os.path.exists(prototxt_path) and os.path.exists(caffemodel_path):
            try:
                self.dnn_net = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
                self.use_dnn_detector = True
                print("Using DNN-based face detector (better accuracy)")
            except Exception as e:
                print(f"Failed to load DNN face detector: {e}")
        
        # Fallback to Haar Cascade
        if not self.use_dnn_detector:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            print("Using Haar Cascade face detector (fallback)")
    
    def _load_model(self):
        """Load TensorFlow/Keras model (preferred) or PyTorch model."""
        # Try TensorFlow/Keras first (proven architecture from notebook)
        if TENSORFLOW_AVAILABLE:
            for tf_path in [self.tensorflow_model_path, self.tensorflow_model_path_legacy]:
                if os.path.exists(tf_path):
                    try:
                        self.model = load_model(tf_path)
                        self.model_type = 'tensorflow'
                        print(f"Loaded TensorFlow/Keras emotion model from {tf_path}")
                        return
                    except Exception as e:
                        print(f"Failed to load TensorFlow model from {tf_path}: {e}")
        
        # Fall back to PyTorch
        if PYTORCH_AVAILABLE and os.path.exists(self.pytorch_model_path):
            # Try each architecture in order of preference
            architectures = [
                ('MiniXception', EmotionMiniXception),
                ('ResNet', EmotionResNet),
                ('LegacyCNN', PyTorchEmotionCNN)
            ]
            
            for arch_name, arch_class in architectures:
                try:
                    self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
                    self.model = arch_class()
                    self.model.load_state_dict(torch.load(
                        self.pytorch_model_path, 
                        map_location=self.device, 
                        weights_only=True
                    ))
                    self.model.to(self.device)
                    self.model.eval()
                    self.model_type = 'pytorch'
                    print(f"Loaded {arch_name} model on {self.device}")
                    return
                except Exception as e:
                    continue  # Try next architecture
            
            print(f"Failed to load PyTorch model with any architecture")
        
        print("No trained emotion model found. Please train a model first.")
        print(f"  TensorFlow path: {self.tensorflow_model_path}")
        print(f"  PyTorch path: {self.pytorch_model_path}")
    
    def preprocess_face(self, face_image):
        """
        Preprocess face image for model input.
        
        Args:
            face_image: BGR or grayscale face image
            
        Returns:
            Preprocessed image array
        """
        # Convert to grayscale if needed
        if len(face_image.shape) == 3:
            gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = face_image
            
        # Resize to model's expected size
        img_size = self.input_shape[0]  # Height
        resized = cv2.resize(gray, (img_size, img_size), interpolation=cv2.INTER_AREA)
        
        # Normalize based on model type
        if self.model_type == 'tensorflow':
            # TensorFlow/Keras: rescale to [0, 1]
            normalized = resized.astype('float32') / 255.0
            # TensorFlow: (batch, height, width, channels)
            return normalized.reshape(1, img_size, img_size, 1)
        else:
            # PyTorch: normalize to [-1, 1]
            normalized = resized.astype('float32') / 255.0
            normalized = (normalized - 0.5) / 0.5
            # PyTorch: (batch, channels, height, width)
            preprocessed = normalized.reshape(1, 1, img_size, img_size)
            return torch.from_numpy(preprocessed).to(self.device)
    
    def detect_faces(self, image):
        """
        Detect faces in an image using DNN or Haar Cascade.
        
        Args:
            image: BGR image
            
        Returns:
            List of face bounding boxes (x, y, w, h)
        """
        if self.use_dnn_detector:
            return self._detect_faces_dnn(image)
        else:
            return self._detect_faces_haar(image)
    
    def _detect_faces_dnn(self, image, confidence_threshold=0.5):
        """Detect faces using DNN-based detector (works at any distance)."""
        h, w = image.shape[:2]
        
        # Create blob from image
        blob = cv2.dnn.blobFromImage(
            cv2.resize(image, (300, 300)), 1.0, (300, 300),
            (104.0, 177.0, 123.0), swapRB=False, crop=False
        )
        
        self.dnn_net.setInput(blob)
        detections = self.dnn_net.forward()
        
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            if confidence > confidence_threshold:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype(int)
                
                # Ensure valid coordinates
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w, x2)
                y2 = min(h, y2)
                
                face_w = x2 - x1
                face_h = y2 - y1
                
                # Filter out very small faces
                if face_w > 20 and face_h > 20:
                    faces.append((x1, y1, face_w, face_h))
        
        return faces
    
    def _detect_faces_haar(self, image):
        """Detect faces using Haar Cascade (fallback)."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(48, 48)
        )
        return faces
    
    def classify_emotion(self, face_image):
        """
        Classify emotion from a face image.
        
        Args:
            face_image: Face image (BGR or grayscale)
            
        Returns:
            Dictionary with emotion predictions and engagement mapping
        """
        if self.model is None:
            return self._get_default_result()
            
        try:
            # Preprocess
            preprocessed = self.preprocess_face(face_image)
            
            # Predict based on model type
            if self.model_type == 'pytorch':
                with torch.no_grad():
                    outputs = self.model(preprocessed)
                    predictions = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            else:
                predictions = self.model.predict(preprocessed, verbose=0)[0]
            
            # Get top emotion
            emotion_idx = np.argmax(predictions)
            emotion = self.EMOTION_LABELS[emotion_idx]
            confidence = float(predictions[emotion_idx])
            
            # Get all emotion scores
            emotion_scores = {
                label: float(predictions[i]) 
                for i, label in enumerate(self.EMOTION_LABELS)
            }
            
            # Map to engagement state
            engagement_state = self.EMOTION_TO_ENGAGEMENT[emotion]
            
            # Calculate valence and arousal
            valence = sum(
                self.EMOTION_VALENCE[label] * score 
                for label, score in emotion_scores.items()
            )
            arousal = sum(
                self.EMOTION_AROUSAL[label] * score 
                for label, score in emotion_scores.items()
            )
            
            result = {
                'primary_emotion': emotion,
                'confidence': confidence,
                'emotion_scores': emotion_scores,
                'engagement_state': engagement_state,
                'valence': valence,
                'arousal': arousal,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Apply temporal smoothing
            result = self._apply_temporal_smoothing(result)
            
            return result
            
        except Exception as e:
            print(f"Emotion classification error: {e}")
            return self._get_default_result()
    
    def classify_from_frame(self, frame):
        """
        Detect faces and classify emotions from a video frame.
        
        Args:
            frame: BGR video frame
            
        Returns:
            List of results, one per detected face
        """
        results = []
        faces = self.detect_faces(frame)
        
        for (x, y, w, h) in faces:
            # Extract face region with padding
            padding = int(0.1 * w)
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(frame.shape[1], x + w + padding)
            y2 = min(frame.shape[0], y + h + padding)
            
            face_img = frame[y1:y2, x1:x2]
            
            # Classify emotion
            emotion_result = self.classify_emotion(face_img)
            emotion_result['bounding_box'] = {
                'x': int(x), 'y': int(y), 
                'width': int(w), 'height': int(h)
            }
            
            results.append(emotion_result)
            
        return results
    
    def _apply_temporal_smoothing(self, result):
        """
        Apply temporal smoothing to reduce flickering.
        
        Args:
            result: Current emotion result
            
        Returns:
            Smoothed result
        """
        self.emotion_history.append(result)
        
        # Keep only recent history
        if len(self.emotion_history) > self.history_window:
            self.emotion_history = self.emotion_history[-self.history_window:]
        
        if len(self.emotion_history) < 3:
            return result
            
        # Smooth emotion scores
        smoothed_scores = {}
        for emotion in self.EMOTION_LABELS:
            scores = [h['emotion_scores'][emotion] for h in self.emotion_history]
            # Exponential moving average
            alpha = 0.4
            smoothed = scores[-1]
            for i in range(len(scores) - 2, -1, -1):
                smoothed = alpha * scores[i] + (1 - alpha) * smoothed
            smoothed_scores[emotion] = smoothed
        
        # Recalculate primary emotion from smoothed scores
        primary_emotion = max(smoothed_scores, key=smoothed_scores.get)
        
        result['emotion_scores'] = smoothed_scores
        result['primary_emotion'] = primary_emotion
        result['confidence'] = smoothed_scores[primary_emotion]
        result['engagement_state'] = self.EMOTION_TO_ENGAGEMENT[primary_emotion]
        
        return result
    
    def _get_default_result(self):
        """Return default result when classification fails."""
        return {
            'primary_emotion': 'neutral',
            'confidence': 0.5,
            'emotion_scores': {label: 1/7 for label in self.EMOTION_LABELS},
            'engagement_state': 'focused',
            'valence': 0.0,
            'arousal': 0.3,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_model_info(self):
        """Get information about the current model."""
        return {
            'model_type': self.model_type,
            'pytorch_model_path': self.pytorch_model_path,
            'tensorflow_model_path': self.tensorflow_model_path,
            'pytorch_model_exists': os.path.exists(self.pytorch_model_path),
            'tensorflow_model_exists': os.path.exists(self.tensorflow_model_path),
            'model_loaded': self.model is not None,
            'device': str(self.device) if self.device else 'cpu',
            'input_shape': self.input_shape,
            'num_classes': len(self.EMOTION_LABELS),
            'emotion_labels': self.EMOTION_LABELS,
            'history_window': self.history_window
        }
    
    def reset_history(self):
        """Reset emotion history for new session."""
        self.emotion_history = []


# Singleton instance
_emotion_classifier = None

def get_emotion_classifier():
    """Get or create the emotion classifier singleton."""
    global _emotion_classifier
    if _emotion_classifier is None:
        _emotion_classifier = EmotionClassifier()
    return _emotion_classifier
