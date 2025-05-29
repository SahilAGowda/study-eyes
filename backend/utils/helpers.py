"""
Utility functions for the Study Eyes application
"""

import os
import secrets
import string
from datetime import datetime, timedelta
import cv2
import numpy as np
from werkzeug.utils import secure_filename
import hashlib
import base64

def generate_secret_key(length=32):
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_uploaded_file(file, upload_folder, max_size_mb=16):
    """Save uploaded file securely"""
    try:
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > max_size_mb * 1024 * 1024:
            return None, f"File too large. Maximum size is {max_size_mb}MB"
        
        # Secure filename
        filename = secure_filename(file.filename)
        if not filename:
            return None, "Invalid filename"
        
        # Create unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        unique_filename = f"{timestamp}_{name}{ext}"
        
        # Ensure upload directory exists
        os.makedirs(upload_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        return unique_filename, None
        
    except Exception as e:
        return None, f"Error saving file: {str(e)}"

def format_duration(seconds):
    """Format duration in seconds to human readable format"""
    if seconds < 60:
        return f"{int(seconds)}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = int(seconds % 60)
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = int(seconds // 3600)
        remaining_minutes = int((seconds % 3600) // 60)
        return f"{hours}h {remaining_minutes}m"

def calculate_focus_streak(analytics_data):
    """Calculate the longest focus streak from analytics data"""
    if not analytics_data:
        return 0
    
    current_streak = 0
    max_streak = 0
    
    for day_data in analytics_data:
        if day_data['average_focus_percentage'] >= 70:  # 70% focus threshold
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 0
    
    return max_streak

def validate_camera_access():
    """Validate if camera is accessible"""
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return False, "Camera not accessible"
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return False, "Cannot read from camera"
        
        return True, "Camera accessible"
        
    except Exception as e:
        return False, f"Camera error: {str(e)}"

def resize_image(image, max_width=640, max_height=480):
    """Resize image while maintaining aspect ratio"""
    height, width = image.shape[:2]
    
    # Calculate scaling factor
    scale_w = max_width / width
    scale_h = max_height / height
    scale = min(scale_w, scale_h)
    
    if scale < 1:
        new_width = int(width * scale)
        new_height = int(height * scale)
        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        return resized
    
    return image

def encode_image_base64(image):
    """Encode image as base64 string"""
    try:
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{image_base64}"
    except Exception as e:
        return None

def generate_session_hash(user_id, timestamp):
    """Generate unique hash for session identification"""
    data = f"{user_id}_{timestamp.isoformat()}"
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def calculate_productivity_score(focus_percentage, completion_rate, consistency_score):
    """Calculate overall productivity score"""
    weights = {
        'focus': 0.4,
        'completion': 0.35,
        'consistency': 0.25
    }
    
    score = (
        focus_percentage * weights['focus'] +
        completion_rate * weights['completion'] +
        consistency_score * weights['consistency']
    )
    
    return min(100, max(0, score))

def get_time_of_day_category(timestamp):
    """Categorize time of day for analytics"""
    hour = timestamp.hour
    
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "night"

def calculate_break_recommendations(session_duration, focus_percentage):
    """Calculate break recommendations based on session data"""
    recommendations = []
    
    # Duration-based recommendations
    if session_duration > 45:
        recommendations.append("Consider taking breaks every 25-30 minutes for optimal focus")
    
    # Focus-based recommendations
    if focus_percentage < 60:
        recommendations.append("Take a 5-10 minute break to refresh your concentration")
    elif focus_percentage < 80:
        recommendations.append("You're doing well! A short 2-3 minute break might help maintain focus")
    
    # Default recommendation
    if not recommendations:
        recommendations.append("Keep up the great work! Remember to take breaks when needed")
    
    return recommendations

def sanitize_input(text, max_length=500):
    """Sanitize user input text"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = text.strip()
    sanitized = sanitized.replace('<', '&lt;').replace('>', '&gt;')
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "..."
    
    return sanitized

def validate_session_duration(duration_minutes):
    """Validate session duration is within acceptable limits"""
    min_duration = 5    # 5 minutes
    max_duration = 480  # 8 hours
    
    if duration_minutes < min_duration:
        return False, f"Session duration must be at least {min_duration} minutes"
    
    if duration_minutes > max_duration:
        return False, f"Session duration cannot exceed {max_duration} minutes"
    
    return True, "Valid duration"

def generate_analytics_summary(analytics_data):
    """Generate summary statistics from analytics data"""
    if not analytics_data:
        return {
            'total_study_time': 0,
            'average_focus': 0,
            'total_sessions': 0,
            'best_day': None,
            'improvement_trend': 'stable'
        }
    
    # Calculate totals
    total_study_time = sum(day['total_study_time'] for day in analytics_data)
    total_sessions = sum(day['total_sessions'] for day in analytics_data)
    
    # Calculate averages
    focus_percentages = [day['average_focus_percentage'] for day in analytics_data if day['total_sessions'] > 0]
    average_focus = sum(focus_percentages) / len(focus_percentages) if focus_percentages else 0
    
    # Find best day
    best_day = max(analytics_data, key=lambda x: x['total_study_time']) if analytics_data else None
    
    # Calculate trend
    if len(analytics_data) >= 7:
        first_half = analytics_data[:len(analytics_data)//2]
        second_half = analytics_data[len(analytics_data)//2:]
        
        first_avg = sum(day['average_focus_percentage'] for day in first_half) / len(first_half)
        second_avg = sum(day['average_focus_percentage'] for day in second_half) / len(second_half)
        
        if second_avg > first_avg + 5:
            improvement_trend = 'improving'
        elif second_avg < first_avg - 5:
            improvement_trend = 'declining'
        else:
            improvement_trend = 'stable'
    else:
        improvement_trend = 'stable'
    
    return {
        'total_study_time': total_study_time,
        'average_focus': round(average_focus, 2),
        'total_sessions': total_sessions,
        'best_day': best_day,
        'improvement_trend': improvement_trend
    }

class RateLimiter:
    """Simple rate limiter for API endpoints"""
    
    def __init__(self, max_requests=100, time_window=3600):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = {}
    
    def is_allowed(self, identifier):
        """Check if request is allowed for the identifier"""
        current_time = datetime.utcnow()
        
        # Clean old entries
        cutoff_time = current_time - timedelta(seconds=self.time_window)
        
        if identifier in self.requests:
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if req_time > cutoff_time
            ]
        else:
            self.requests[identifier] = []
        
        # Check if under limit
        if len(self.requests[identifier]) < self.max_requests:
            self.requests[identifier].append(current_time)
            return True
        
        return False
    
    def get_remaining_requests(self, identifier):
        """Get remaining requests for identifier"""
        if identifier not in self.requests:
            return self.max_requests
        
        current_count = len(self.requests[identifier])
        return max(0, self.max_requests - current_count)
