"""
Emotion Model Testing Script

This script provides comprehensive testing of the trained emotion model:
1. Overall accuracy on test set
2. Per-class accuracy (confusion matrix)
3. Real-time webcam testing
4. Single image testing
5. Performance metrics (inference time)

Usage:
    # Test on FER2013 test set
    python test_emotion_model.py --data_path d:\study-eyes\backend\data --mode test
    
    # Test with webcam
    python test_emotion_model.py --mode webcam
    
    # Test single image
    python test_emotion_model.py --mode image --image_path path/to/image.jpg
"""

import os
import sys
import argparse
import numpy as np
import cv2
import time
import json
from datetime import datetime

# TensorFlow imports
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
EMOTION_EMOJIS = ['😠', '🤢', '😨', '😊', '😢', '😲', '😐']

# Model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'ai_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'emotion_cnn_keras.h5')
FACE_DETECTION_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'face_detection')


class EmotionModelTester:
    def __init__(self):
        self.model = None
        self.face_detector = None
        self.use_dnn_detector = False
        self.img_size = 48  # Default, will be updated from model
        self.load_model()
        self.load_face_detector()
    
    def load_model(self):
        """Load the trained emotion model."""
        if not os.path.exists(MODEL_PATH):
            print(f"ERROR: Model not found at {MODEL_PATH}")
            print("Please train the model first using train_emotion_model.py")
            sys.exit(1)
        
        print(f"Loading model from: {MODEL_PATH}")
        self.model = load_model(MODEL_PATH)
        print("Model loaded successfully!")
        print(f"Input shape: {self.model.input_shape}")
        print(f"Output shape: {self.model.output_shape}")
        
        # Get expected input size from model
        self.img_size = self.model.input_shape[1]  # Height (should be 48 or 64)
        print(f"Expected image size: {self.img_size}x{self.img_size}")
    
    def load_face_detector(self):
        """Load face detector - prefer DNN-based."""
        prototxt_path = os.path.join(FACE_DETECTION_DIR, 'deploy.prototxt')
        caffemodel_path = os.path.join(FACE_DETECTION_DIR, 'res10_300x300_ssd_iter_140000.caffemodel')
        
        if os.path.exists(prototxt_path) and os.path.exists(caffemodel_path):
            try:
                self.face_detector = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
                self.use_dnn_detector = True
                print("Using DNN-based face detector")
            except Exception as e:
                print(f"Failed to load DNN detector: {e}")
        
        if not self.use_dnn_detector:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_detector = cv2.CascadeClassifier(cascade_path)
            print("Using Haar Cascade face detector (fallback)")
    
    def detect_faces(self, image, confidence_threshold=0.5):
        """Detect faces in image."""
        if self.use_dnn_detector:
            h, w = image.shape[:2]
            blob = cv2.dnn.blobFromImage(
                cv2.resize(image, (300, 300)), 1.0, (300, 300),
                (104.0, 177.0, 123.0), swapRB=False, crop=False
            )
            self.face_detector.setInput(blob)
            detections = self.face_detector.forward()
            
            faces = []
            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > confidence_threshold:
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    x1, y1, x2, y2 = box.astype(int)
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)
                    if x2 - x1 > 20 and y2 - y1 > 20:
                        faces.append((x1, y1, x2 - x1, y2 - y1))
            return faces
        else:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            return self.face_detector.detectMultiScale(gray, 1.1, 5, minSize=(48, 48))
    
    def preprocess_face(self, face_image):
        """Preprocess face for model input."""
        if len(face_image.shape) == 3:
            gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = face_image
        
        # Resize to model's expected size
        resized = cv2.resize(gray, (self.img_size, self.img_size), interpolation=cv2.INTER_AREA)
        normalized = resized.astype('float32') / 255.0
        return normalized.reshape(1, self.img_size, self.img_size, 1)
    
    def predict_emotion(self, face_image):
        """Predict emotion from face image."""
        preprocessed = self.preprocess_face(face_image)
        predictions = self.model.predict(preprocessed, verbose=0)[0]
        
        emotion_idx = np.argmax(predictions)
        emotion = EMOTION_LABELS[emotion_idx]
        confidence = float(predictions[emotion_idx])
        
        return {
            'emotion': emotion,
            'confidence': confidence,
            'all_scores': {EMOTION_LABELS[i]: float(predictions[i]) for i in range(7)},
            'emoji': EMOTION_EMOJIS[emotion_idx]
        }

    def test_on_dataset(self, data_path):
        """Test model on FER2013 test set with detailed metrics."""
        print(f"\n{'='*70}")
        print("TESTING ON FER2013 TEST SET")
        print(f"{'='*70}")
        
        test_dir = os.path.join(data_path, 'test')
        if not os.path.exists(test_dir):
            print(f"ERROR: Test directory not found: {test_dir}")
            return
        
        test_datagen = ImageDataGenerator(rescale=1./255)
        test_generator = test_datagen.flow_from_directory(
            directory=test_dir,
            target_size=(self.img_size, self.img_size),  # Use model's expected size
            batch_size=64,
            color_mode="grayscale",
            class_mode="categorical",
            shuffle=False
        )
        
        # Get predictions
        print("\nGenerating predictions...")
        predictions = self.model.predict(test_generator, verbose=1)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = test_generator.classes
        
        # Overall accuracy
        accuracy = np.mean(predicted_classes == true_classes)
        print(f"\n{'='*70}")
        print(f"OVERALL TEST ACCURACY: {accuracy*100:.2f}%")
        print(f"{'='*70}")
        
        # Per-class accuracy
        print("\nPER-CLASS ACCURACY:")
        print("-" * 50)
        class_accuracies = {}
        for class_name, class_idx in sorted(test_generator.class_indices.items(), key=lambda x: x[1]):
            mask = true_classes == class_idx
            class_acc = np.mean(predicted_classes[mask] == true_classes[mask])
            class_accuracies[class_name] = class_acc
            emoji = EMOTION_EMOJIS[class_idx]
            print(f"  {emoji} {class_name:12s}: {class_acc*100:6.2f}%")
        
        # Confusion matrix
        print(f"\n{'='*70}")
        print("CONFUSION MATRIX")
        print(f"{'='*70}")
        print("\nPredicted →")
        print("Actual ↓")
        print()
        
        # Header
        header = "          "
        for label in EMOTION_LABELS:
            header += f"{label[:4]:>6s}"
        print(header)
        print("-" * len(header))
        
        # Matrix
        confusion = np.zeros((7, 7), dtype=int)
        for true_idx, pred_idx in zip(true_classes, predicted_classes):
            confusion[true_idx][pred_idx] += 1
        
        for i, label in enumerate(EMOTION_LABELS):
            row = f"{label[:8]:8s} |"
            for j in range(7):
                row += f"{confusion[i][j]:6d}"
            print(row)
        
        # Most confused pairs
        print(f"\n{'='*70}")
        print("MOST CONFUSED EMOTION PAIRS")
        print(f"{'='*70}")
        
        confusions = []
        for i in range(7):
            for j in range(7):
                if i != j and confusion[i][j] > 0:
                    confusions.append((EMOTION_LABELS[i], EMOTION_LABELS[j], confusion[i][j]))
        
        confusions.sort(key=lambda x: x[2], reverse=True)
        for true_label, pred_label, count in confusions[:10]:
            print(f"  {true_label} → {pred_label}: {count} times")
        
        # Inference speed test
        print(f"\n{'='*70}")
        print("INFERENCE SPEED TEST")
        print(f"{'='*70}")
        
        # Create dummy input with correct size
        dummy_input = np.random.rand(1, self.img_size, self.img_size, 1).astype('float32')
        
        # Warm up
        for _ in range(10):
            self.model.predict(dummy_input, verbose=0)
        
        # Time 100 predictions
        start = time.time()
        for _ in range(100):
            self.model.predict(dummy_input, verbose=0)
        elapsed = time.time() - start
        
        avg_time = elapsed / 100 * 1000  # ms
        fps = 1000 / avg_time
        print(f"  Average inference time: {avg_time:.2f} ms")
        print(f"  Theoretical max FPS: {fps:.1f}")
        print(f"  Suitable for real-time: {'YES' if fps > 30 else 'NO'}")
        
        # Save test results
        results = {
            'test_date': datetime.now().isoformat(),
            'overall_accuracy': float(accuracy),
            'per_class_accuracy': {k: float(v) for k, v in class_accuracies.items()},
            'inference_time_ms': float(avg_time),
            'theoretical_fps': float(fps)
        }
        
        results_path = os.path.join(MODEL_DIR, 'test_results.json')
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to: {results_path}")
        
        return results
    
    def test_webcam(self):
        """Test model with webcam in real-time."""
        print(f"\n{'='*70}")
        print("WEBCAM REAL-TIME TEST")
        print("Press 'q' to quit, 's' to save screenshot")
        print(f"{'='*70}")
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("ERROR: Could not open webcam")
            return
        
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        fps_history = []
        emotion_history = []
        
        while True:
            start_time = time.time()
            
            ret, frame = cap.read()
            if not ret:
                break
            
            # Detect faces
            faces = self.detect_faces(frame)
            
            for (x, y, w, h) in faces:
                # Extract face with padding
                padding = int(0.1 * w)
                x1 = max(0, x - padding)
                y1 = max(0, y - padding)
                x2 = min(frame.shape[1], x + w + padding)
                y2 = min(frame.shape[0], y + h + padding)
                
                face_img = frame[y1:y2, x1:x2]
                
                # Predict emotion
                result = self.predict_emotion(face_img)
                emotion_history.append(result['emotion'])
                
                # Keep only last 10 for smoothing
                if len(emotion_history) > 10:
                    emotion_history.pop(0)
                
                # Get most common emotion in history
                from collections import Counter
                smoothed_emotion = Counter(emotion_history).most_common(1)[0][0]
                smoothed_idx = EMOTION_LABELS.index(smoothed_emotion)
                
                # Draw bounding box
                color = (0, 255, 0) if result['confidence'] > 0.5 else (0, 165, 255)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                
                # Draw emotion label
                label = f"{EMOTION_EMOJIS[smoothed_idx]} {smoothed_emotion} ({result['confidence']*100:.0f}%)"
                cv2.putText(frame, label, (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                
                # Draw emotion bar chart
                bar_x = x + w + 10
                bar_y = y
                bar_width = 100
                bar_height = 15
                
                for i, (emotion, score) in enumerate(result['all_scores'].items()):
                    y_pos = bar_y + i * (bar_height + 2)
                    # Background
                    cv2.rectangle(frame, (bar_x, y_pos), 
                                 (bar_x + bar_width, y_pos + bar_height), 
                                 (50, 50, 50), -1)
                    # Score bar
                    score_width = int(score * bar_width)
                    bar_color = (0, 255, 0) if emotion == smoothed_emotion else (100, 100, 100)
                    cv2.rectangle(frame, (bar_x, y_pos), 
                                 (bar_x + score_width, y_pos + bar_height), 
                                 bar_color, -1)
                    # Label
                    cv2.putText(frame, f"{emotion[:3]}", (bar_x - 30, y_pos + 12),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            
            # Calculate FPS
            elapsed = time.time() - start_time
            fps = 1.0 / elapsed if elapsed > 0 else 0
            fps_history.append(fps)
            if len(fps_history) > 30:
                fps_history.pop(0)
            avg_fps = sum(fps_history) / len(fps_history)
            
            # Draw FPS
            cv2.putText(frame, f"FPS: {avg_fps:.1f}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('Emotion Detection Test', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                filename = f"emotion_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                cv2.imwrite(filename, frame)
                print(f"Screenshot saved: {filename}")
        
        cap.release()
        cv2.destroyAllWindows()
        print(f"\nAverage FPS: {avg_fps:.1f}")
    
    def test_image(self, image_path):
        """Test model on a single image."""
        print(f"\n{'='*70}")
        print(f"TESTING IMAGE: {image_path}")
        print(f"{'='*70}")
        
        if not os.path.exists(image_path):
            print(f"ERROR: Image not found: {image_path}")
            return
        
        image = cv2.imread(image_path)
        if image is None:
            print("ERROR: Could not read image")
            return
        
        faces = self.detect_faces(image)
        print(f"Detected {len(faces)} face(s)")
        
        for i, (x, y, w, h) in enumerate(faces):
            padding = int(0.1 * w)
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(image.shape[1], x + w + padding)
            y2 = min(image.shape[0], y + h + padding)
            
            face_img = image[y1:y2, x1:x2]
            result = self.predict_emotion(face_img)
            
            print(f"\nFace {i+1}:")
            print(f"  Emotion: {result['emoji']} {result['emotion']}")
            print(f"  Confidence: {result['confidence']*100:.1f}%")
            print(f"  All scores:")
            for emotion, score in sorted(result['all_scores'].items(), key=lambda x: x[1], reverse=True):
                bar = '█' * int(score * 20)
                print(f"    {emotion:10s}: {bar} {score*100:.1f}%")
            
            # Draw on image
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            label = f"{result['emoji']} {result['emotion']} ({result['confidence']*100:.0f}%)"
            cv2.putText(image, label, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Show result
        cv2.imshow('Emotion Detection Result', image)
        print("\nPress any key to close...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description='Test Emotion Model')
    parser.add_argument('--mode', type=str, default='test', 
                       choices=['test', 'webcam', 'image'],
                       help='Test mode: test (dataset), webcam, or image')
    parser.add_argument('--data_path', type=str, 
                       help='Path to FER2013 data (required for test mode)')
    parser.add_argument('--image_path', type=str,
                       help='Path to image (required for image mode)')
    args = parser.parse_args()
    
    tester = EmotionModelTester()
    
    if args.mode == 'test':
        if not args.data_path:
            print("ERROR: --data_path required for test mode")
            sys.exit(1)
        tester.test_on_dataset(args.data_path)
    elif args.mode == 'webcam':
        tester.test_webcam()
    elif args.mode == 'image':
        if not args.image_path:
            print("ERROR: --image_path required for image mode")
            sys.exit(1)
        tester.test_image(args.image_path)


if __name__ == '__main__':
    main()
