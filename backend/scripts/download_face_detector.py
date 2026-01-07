"""
Download OpenCV DNN Face Detector Model

This downloads the pre-trained SSD face detector which works much better
than Haar Cascade, especially at different distances from the camera.

Usage:
    python download_face_detector.py
"""

import os
import urllib.request
import sys

def download_file(url, filepath):
    """Download a file with progress indicator."""
    print(f"Downloading: {url}")
    print(f"To: {filepath}")
    
    def progress_hook(count, block_size, total_size):
        percent = int(count * block_size * 100 / total_size)
        sys.stdout.write(f"\r  Progress: {percent}%")
        sys.stdout.flush()
    
    urllib.request.urlretrieve(url, filepath, progress_hook)
    print("\n  Done!")


def main():
    # Create directory
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'face_detection')
    os.makedirs(model_dir, exist_ok=True)
    
    print("="*60)
    print("DOWNLOADING OPENCV DNN FACE DETECTOR")
    print("="*60)
    print(f"Target directory: {model_dir}\n")
    
    # URLs for the model files
    base_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/"
    
    files = {
        'deploy.prototxt': base_url + 'deploy.prototxt',
        'res10_300x300_ssd_iter_140000.caffemodel': 
            'https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel'
    }
    
    for filename, url in files.items():
        filepath = os.path.join(model_dir, filename)
        
        if os.path.exists(filepath):
            print(f"✓ {filename} already exists")
            continue
        
        try:
            download_file(url, filepath)
        except Exception as e:
            print(f"✗ Failed to download {filename}: {e}")
            return False
    
    print("\n" + "="*60)
    print("DOWNLOAD COMPLETE!")
    print("="*60)
    print("\nThe DNN face detector will now be used automatically.")
    print("This provides much better face detection at any distance.")
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
