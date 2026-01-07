"""
Test script to diagnose emotion model predictions.
Run this to see what the model is actually detecting for different expressions.

Usage:
    python scripts/test_emotion_model.py --webcam
    python scripts/test_emotion_model.py --image path/to/image.jpg
"""

import os
import sys
import argparse
import cv2
import numpy as np

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.emotion_classifier import get_emotion_classifier


def test_with_webcam():
    """Test emotion detection with webcam in real-time."""
    classifier = get_emotion_classifier()
    
    print("\n" + "="*60)
    print("EMOTION MODEL DIAGNOSTIC TEST")
    print("="*60)
    print(f"Model type: {classifier.model_type}")
    print(f"Model loaded: {classifier.model is not None}")
    print(f"Device: {classifier.device}")
    print(f"Face detector: {'DNN (better)' if classifier.use_dnn_detector else 'Haar Cascade'}")
    print("="*60)
    
    if classifier.model is None:
        print("ERROR: No model loaded!")
        return
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam")
        return
    
    # Set camera resolution for better face detection
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("\nInstructions:")
    print("  - Look at the camera with different expressions")
    print("  - Try: SMILE (happy), NEUTRAL, SAD, SURPRISED, ANGRY")
    print("  - Watch the console AND window for emotion predictions")
    print("  - Press 'q' to quit, 's' to save current frame, 'r' to reset history")
    print("="*60 + "\n")
    
    frame_count = 0
    last_emotion = None
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        display_frame = frame.copy()
        
        # Process every 3rd frame for better responsiveness
        if frame_count % 3 == 0:
            # Detect and classify
            results = classifier.classify_from_frame(frame)
            
            if results:
                for i, result in enumerate(results):
                    # Draw bounding box
                    bbox = result.get('bounding_box', {})
                    x, y, w, h = bbox.get('x', 0), bbox.get('y', 0), bbox.get('width', 0), bbox.get('height', 0)
                    
                    # Get emotion info
                    emotion = result['primary_emotion']
                    confidence = result['confidence']
                    engagement = result['engagement_state']
                    scores = result['emotion_scores']
                    
                    # Color based on emotion
                    colors = {
                        'happy': (0, 255, 0),      # Green
                        'surprise': (0, 255, 255), # Yellow
                        'neutral': (255, 255, 0),  # Cyan
                        'sad': (255, 0, 0),        # Blue
                        'angry': (0, 0, 255),      # Red
                        'fear': (255, 0, 255),     # Magenta
                        'disgust': (0, 128, 128)   # Olive
                    }
                    color = colors.get(emotion, (0, 255, 0))
                    
                    # Draw box
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), color, 2)
                    
                    # Draw emotion label with background
                    label = f"{emotion.upper()}: {confidence*100:.0f}%"
                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
                    cv2.rectangle(display_frame, (x, y-30), (x + label_size[0] + 10, y), color, -1)
                    cv2.putText(display_frame, label, (x+5, y-8), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
                    
                    # Draw engagement state
                    eng_label = f"State: {engagement}"
                    cv2.putText(display_frame, eng_label, (x, y+h+20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                    
                    # Draw emotion bars on the right side
                    bar_x = x + w + 10
                    bar_y = y
                    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
                    
                    for emo, score in sorted_scores:
                        bar_width = int(score * 100)
                        bar_color = colors.get(emo, (128, 128, 128))
                        if emo == emotion:
                            bar_color = color
                        cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + 12), bar_color, -1)
                        cv2.putText(display_frame, f"{emo[:3]}", (bar_x + bar_width + 5, bar_y + 10), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)
                        bar_y += 16
                    
                    # Print to console only when emotion changes
                    if emotion != last_emotion:
                        print(f"\n{'='*50}")
                        print(f"EMOTION CHANGED: {emotion.upper()} ({confidence*100:.1f}%)")
                        print(f"Engagement: {engagement}")
                        print(f"All scores: ", end="")
                        for emo, score in sorted_scores:
                            print(f"{emo}={score*100:.0f}% ", end="")
                        print(f"\n{'='*50}")
                        last_emotion = emotion
            else:
                cv2.putText(display_frame, "No face detected - move closer", (20, 40), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        # Show instructions on frame
        cv2.putText(display_frame, "Q=quit  S=save  R=reset", (10, display_frame.shape[0]-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Show frame
        cv2.imshow('Emotion Model Test - Press Q to quit', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            filename = f"emotion_test_frame_{frame_count}.jpg"
            cv2.imwrite(filename, frame)
            print(f"Saved: {filename}")
        elif key == ord('r'):
            classifier.reset_history()
            last_emotion = None
            print("History reset!")
    
    cap.release()
    cv2.destroyAllWindows()


def test_with_image(image_path):
    """Test emotion detection on a single image."""
    classifier = get_emotion_classifier()
    
    print("\n" + "="*60)
    print("EMOTION MODEL DIAGNOSTIC TEST - IMAGE")
    print("="*60)
    print(f"Model type: {classifier.model_type}")
    print(f"Model loaded: {classifier.model is not None}")
    print(f"Image: {image_path}")
    print("="*60)
    
    if classifier.model is None:
        print("ERROR: No model loaded!")
        return
    
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"ERROR: Could not load image: {image_path}")
        return
    
    results = classifier.classify_from_frame(frame)
    
    if not results:
        print("No faces detected in image")
        return
    
    for i, result in enumerate(results):
        print(f"\nFace {i+1}:")
        print(f"  Primary Emotion: {result['primary_emotion'].upper()}")
        print(f"  Confidence: {result['confidence']*100:.1f}%")
        print(f"  Engagement State: {result['engagement_state']}")
        print(f"  Valence: {result['valence']:.2f}")
        print(f"  Arousal: {result['arousal']:.2f}")
        print(f"\n  All Emotion Scores:")
        scores = result['emotion_scores']
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        for emo, score in sorted_scores:
            bar = "█" * int(score * 30)
            print(f"    {emo:10s}: {score*100:5.1f}% {bar}")


def test_fer2013_samples():
    """Test on FER2013 validation samples to check model accuracy."""
    classifier = get_emotion_classifier()
    
    print("\n" + "="*60)
    print("TESTING ON FER2013 SAMPLES")
    print("="*60)
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    test_path = os.path.join(data_path, 'test')
    
    if not os.path.exists(test_path):
        print(f"Test data not found at: {test_path}")
        return
    
    emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
    
    total_correct = 0
    total_samples = 0
    
    for emotion in emotions:
        emotion_path = os.path.join(test_path, emotion)
        if not os.path.exists(emotion_path):
            continue
        
        images = os.listdir(emotion_path)[:20]  # Test 20 samples per emotion
        correct = 0
        
        for img_name in images:
            img_path = os.path.join(emotion_path, img_name)
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            result = classifier.classify_emotion(img)
            predicted = result['primary_emotion']
            
            if predicted == emotion:
                correct += 1
            
            total_samples += 1
        
        accuracy = correct / len(images) * 100 if images else 0
        total_correct += correct
        print(f"  {emotion:10s}: {correct}/{len(images)} correct ({accuracy:.1f}%)")
    
    overall = total_correct / total_samples * 100 if total_samples else 0
    print(f"\n  Overall: {total_correct}/{total_samples} ({overall:.1f}%)")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Test emotion model')
    parser.add_argument('--webcam', action='store_true', help='Test with webcam')
    parser.add_argument('--image', type=str, help='Test with image file')
    parser.add_argument('--fer2013', action='store_true', help='Test on FER2013 samples')
    
    args = parser.parse_args()
    
    if args.webcam:
        test_with_webcam()
    elif args.image:
        test_with_image(args.image)
    elif args.fer2013:
        test_fer2013_samples()
    else:
        # Default to webcam test
        test_with_webcam()
