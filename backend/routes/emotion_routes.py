"""
Emotion Classification API Routes

Provides endpoints for:
- Classifying emotions from uploaded images
- Classifying emotions from base64 encoded images
- Getting model information
"""

from flask import Blueprint, request, jsonify
import base64
import numpy as np
import cv2
from datetime import datetime
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.emotion_classifier import get_emotion_classifier

emotion_bp = Blueprint('emotion', __name__, url_prefix='/api/emotion')


@emotion_bp.route('/classify', methods=['POST'])
def classify_emotion():
    """
    Classify emotion from an uploaded image or base64 encoded image.
    
    Request body (JSON):
        - image_base64: Base64 encoded image string
        - face_bbox (optional): Bounding box of face {x, y, width, height}
        
    Or multipart form:
        - image: Image file
        
    Returns:
        JSON with emotion classification results
    """
    try:
        classifier = get_emotion_classifier()
        
        # Check for base64 image in JSON
        if request.is_json:
            data = request.get_json()
            image_base64 = data.get('image_base64')
            
            if not image_base64:
                return jsonify({'error': 'No image provided'}), 400
            
            # Decode base64 image
            try:
                # Remove data URL prefix if present
                if ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]
                
                image_data = base64.b64decode(image_base64)
                nparr = np.frombuffer(image_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if image is None:
                    return jsonify({'error': 'Failed to decode image'}), 400
                    
            except Exception as e:
                return jsonify({'error': f'Invalid base64 image: {str(e)}'}), 400
            
            # Check if face bounding box is provided
            face_bbox = data.get('face_bbox')
            if face_bbox:
                x = int(face_bbox.get('x', 0))
                y = int(face_bbox.get('y', 0))
                w = int(face_bbox.get('width', image.shape[1]))
                h = int(face_bbox.get('height', image.shape[0]))
                
                # Extract face region
                face_image = image[y:y+h, x:x+w]
                result = classifier.classify_emotion(face_image)
                result['bounding_box'] = face_bbox
                
                return jsonify({
                    'success': True,
                    'result': result
                })
            else:
                # Detect faces and classify
                results = classifier.classify_from_frame(image)
                
                if not results:
                    return jsonify({
                        'success': True,
                        'result': classifier._get_default_result(),
                        'message': 'No faces detected'
                    })
                
                return jsonify({
                    'success': True,
                    'results': results,
                    'faces_detected': len(results)
                })
        
        # Check for file upload
        elif 'image' in request.files:
            file = request.files['image']
            
            # Read image
            file_bytes = np.frombuffer(file.read(), np.uint8)
            image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({'error': 'Failed to read image file'}), 400
            
            # Detect faces and classify
            results = classifier.classify_from_frame(image)
            
            if not results:
                return jsonify({
                    'success': True,
                    'result': classifier._get_default_result(),
                    'message': 'No faces detected'
                })
            
            return jsonify({
                'success': True,
                'results': results,
                'faces_detected': len(results)
            })
        
        else:
            return jsonify({'error': 'No image provided'}), 400
            
    except Exception as e:
        print(f"Emotion classification error: {e}")
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/classify-face', methods=['POST'])
def classify_face_emotion():
    """
    Classify emotion from a pre-cropped face image.
    
    This endpoint expects the face to already be cropped from the image.
    Use this when face detection is done on the frontend.
    
    Request body (JSON):
        - image_base64: Base64 encoded face image
        - face_id (optional): ID of the face for tracking
        
    Returns:
        JSON with emotion classification result
    """
    try:
        classifier = get_emotion_classifier()
        
        data = request.get_json()
        if not data or 'image_base64' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        image_base64 = data['image_base64']
        face_id = data.get('face_id', 'unknown')
        
        # Decode base64 image
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_data = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_data, np.uint8)
            face_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if face_image is None:
                return jsonify({'error': 'Failed to decode image'}), 400
                
        except Exception as e:
            return jsonify({'error': f'Invalid base64 image: {str(e)}'}), 400
        
        # Classify emotion
        result = classifier.classify_emotion(face_image)
        result['face_id'] = face_id
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        print(f"Face emotion classification error: {e}")
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/batch-classify', methods=['POST'])
def batch_classify_emotions():
    """
    Classify emotions for multiple faces in a single request.
    
    Request body (JSON):
        - faces: List of face objects, each containing:
            - image_base64: Base64 encoded face image
            - face_id: ID of the face
            - bounding_box (optional): Face bounding box
            
    Returns:
        JSON with emotion classification results for all faces
    """
    try:
        classifier = get_emotion_classifier()
        
        data = request.get_json()
        if not data or 'faces' not in data:
            return jsonify({'error': 'No faces provided'}), 400
        
        faces = data['faces']
        results = []
        
        for face_data in faces:
            image_base64 = face_data.get('image_base64')
            face_id = face_data.get('face_id', 'unknown')
            
            if not image_base64:
                results.append({
                    'face_id': face_id,
                    'error': 'No image provided'
                })
                continue
            
            try:
                # Decode image
                if ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]
                
                image_data = base64.b64decode(image_base64)
                nparr = np.frombuffer(image_data, np.uint8)
                face_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if face_image is None:
                    results.append({
                        'face_id': face_id,
                        'error': 'Failed to decode image'
                    })
                    continue
                
                # Classify
                result = classifier.classify_emotion(face_image)
                result['face_id'] = face_id
                
                if 'bounding_box' in face_data:
                    result['bounding_box'] = face_data['bounding_box']
                
                results.append(result)
                
            except Exception as e:
                results.append({
                    'face_id': face_id,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_faces': len(faces),
            'successful': len([r for r in results if 'error' not in r])
        })
        
    except Exception as e:
        print(f"Batch emotion classification error: {e}")
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """
    Get information about the emotion classification model.
    
    Returns:
        JSON with model information
    """
    try:
        classifier = get_emotion_classifier()
        info = classifier.get_model_info()
        
        return jsonify({
            'success': True,
            'model_info': info
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/reset-history', methods=['POST'])
def reset_emotion_history():
    """
    Reset the emotion history for temporal smoothing.
    
    Call this when starting a new session.
    """
    try:
        classifier = get_emotion_classifier()
        classifier.reset_history()
        
        return jsonify({
            'success': True,
            'message': 'Emotion history reset'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        classifier = get_emotion_classifier()
        model_exists = classifier.model is not None
        
        return jsonify({
            'status': 'healthy' if model_exists else 'degraded',
            'model_loaded': model_exists,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
