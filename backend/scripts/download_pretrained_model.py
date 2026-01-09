"""
Download Pre-trained Emotion Model

This script downloads a pre-trained emotion recognition model that achieves
~66% accuracy on FER2013 (state-of-the-art for this dataset).

We'll use the fer2013_mini_XCEPTION model which is proven to work well.
"""

import os
import urllib.request
import sys

def download_with_progress(url, filepath):
    """Download file with progress bar."""
    def reporthook(count, block_size, total_size):
        percent = int(count * block_size * 100 / total_size)
        sys.stdout.write(f"\r  Progress: {percent}%")
        sys.stdout.flush()
    
    print(f"Downloading from: {url}")
    print(f"Saving to: {filepath}")
    urllib.request.urlretrieve(url, filepath, reporthook)
    print("\n  Done!")


def main():
    # Model directory
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'ai_models')
    os.makedirs(model_dir, exist_ok=True)
    
    print("\n" + "="*70)
    print("DOWNLOADING PRE-TRAINED EMOTION MODEL")
    print("="*70 + "\n")
    
    # Download pre-trained Mini-Xception model
    # This model was trained on FER2013 and achieves ~66% accuracy
    model_url = "https://github.com/oarriaga/face_classification/raw/master/trained_models/emotion_models/fer2013_mini_XCEPTION.102-0.66.hdf5"
    model_path = os.path.join(model_dir, 'emotion_cnn_keras.h5')
    
    if os.path.exists(model_path):
        print(f"Model already exists at: {model_path}")
        response = input("Do you want to re-download? (y/n): ")
        if response.lower() != 'y':
            print("Skipping download.")
            return
        os.remove(model_path)
    
    try:
        download_with_progress(model_url, model_path)
        
        print("\n" + "="*70)
        print("DOWNLOAD COMPLETE")
        print("="*70)
        print(f"Model saved to: {model_path}")
        print(f"Expected accuracy: ~66% on FER2013")
        print("\nYou can now test the model with:")
        print("  python scripts/test_emotion_model.py --data_path d:\\study-eyes\\backend\\data --mode test")
        print("  python scripts/test_emotion_model.py --mode webcam")
        
    except Exception as e:
        print(f"\nERROR: Failed to download model: {e}")
        print("\nAlternative: Download manually from:")
        print(model_url)
        print(f"And save it to: {model_path}")
        sys.exit(1)


if __name__ == '__main__':
    main()
