#!/usr/bin/env python3
"""
Camera Diagnostic Script
Test camera functionality with enhanced troubleshooting
"""

import cv2
import time
import numpy as np
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def diagnose_camera():
    """Comprehensive camera diagnosis"""
    print("🔍 Starting Camera Diagnostic...")
    print("=" * 60)
    
    # Test different backends
    backends = [
        (cv2.CAP_DSHOW, "DirectShow"),
        (cv2.CAP_MSMF, "Media Foundation"), 
        (cv2.CAP_ANY, "Any Available")
    ]
    
    # Test different indices
    indices = [0, 1, 2]
    
    working_cameras = []
    
    for backend, backend_name in backends:
        print(f"\n🎥 Testing {backend_name} Backend...")
        
        for idx in indices:
            print(f"  📹 Testing Camera Index {idx}...")
            
            try:
                # Create capture
                cap = cv2.VideoCapture(idx, backend)
                
                if not cap.isOpened():
                    print(f"    ❌ Cannot open camera {idx}")
                    continue
                
                # Get camera properties
                width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                fps = cap.get(cv2.CAP_PROP_FPS)
                
                print(f"    📊 Camera Properties: {width}x{height} @ {fps}fps")
                
                # Set enhanced properties
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                cap.set(cv2.CAP_PROP_FPS, 30)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
                cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)
                cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)
                cap.set(cv2.CAP_PROP_CONTRAST, 0.5)
                
                # For DirectShow, try MJPEG
                if backend == cv2.CAP_DSHOW:
                    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))
                
                print(f"    ⚙️ Applied enhanced settings")
                
                # Extended warmup
                print(f"    ⏳ Warming up camera (3 seconds)...")
                time.sleep(3.0)
                
                # Clear buffer
                print(f"    🔄 Clearing buffer...")
                for _ in range(10):
                    ret, _ = cap.read()
                    time.sleep(0.1)
                
                # Test frame capture
                print(f"    🧪 Testing frame capture...")
                good_frames = 0
                total_frames = 10
                
                for i in range(total_frames):
                    ret, frame = cap.read()
                    
                    if ret and frame is not None and frame.size > 0:
                        # Analyze frame
                        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                        mean_intensity = gray.mean()
                        std_intensity = gray.std()
                        
                        print(f"      Frame {i+1}: ret={ret}, shape={frame.shape if frame is not None else 'None'}, "
                              f"intensity={mean_intensity:.2f}, std={std_intensity:.2f}")
                        
                        # Check for actual content
                        if mean_intensity > 10 and std_intensity > 5:
                            good_frames += 1
                            print(f"        ✅ Good frame!")
                        elif mean_intensity > 1:
                            print(f"        ⚠️ Low content frame")
                        else:
                            print(f"        ❌ Black/empty frame")
                    else:
                        print(f"      Frame {i+1}: ❌ Failed to read")
                    
                    time.sleep(0.1)
                
                cap.release()
                
                success_rate = good_frames / total_frames
                print(f"    📊 Success Rate: {success_rate:.1%} ({good_frames}/{total_frames})")
                
                if success_rate > 0:
                    working_cameras.append((idx, backend_name, success_rate))
                    print(f"    ✅ Camera {idx} with {backend_name} is functional!")
                else:
                    print(f"    ❌ Camera {idx} produces no usable frames")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("📋 DIAGNOSIS SUMMARY:")
    
    if working_cameras:
        print(f"✅ Found {len(working_cameras)} working camera(s):")
        for idx, backend, rate in working_cameras:
            print(f"   • Camera {idx} ({backend}): {rate:.1%} success rate")
        
        # Recommend best camera
        best_camera = max(working_cameras, key=lambda x: x[2])
        print(f"\n🏆 RECOMMENDED: Camera {best_camera[0]} with {best_camera[1]} backend")
        
        return True
    else:
        print("❌ NO WORKING CAMERAS FOUND")
        print("\n🔧 TROUBLESHOOTING SUGGESTIONS:")
        print("   1. Check if camera is being used by another application")
        print("   2. Verify camera drivers are installed correctly")
        print("   3. Try running as administrator")
        print("   4. Check Windows Camera privacy settings")
        print("   5. Test with built-in Windows Camera app first")
        
        return False

def test_camera_permissions():
    """Test camera permissions and access"""
    print("\n🔐 Testing Camera Permissions...")
    
    try:
        # Try to access default camera
        cap = cv2.VideoCapture(0)
        
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print("✅ Camera access successful")
                print(f"📊 Frame shape: {frame.shape}")
            else:
                print("⚠️ Camera opened but no frame captured")
            cap.release()
        else:
            print("❌ Cannot access camera - permission or driver issue")
            
    except Exception as e:
        print(f"❌ Camera access error: {e}")

if __name__ == "__main__":
    print("🔍 STUDY EYES CAMERA DIAGNOSTIC TOOL")
    print("=" * 60)
    
    # Test camera permissions first
    test_camera_permissions()
    
    # Run comprehensive diagnosis
    if diagnose_camera():
        print("\n🎉 Camera diagnostic completed - working cameras found!")
    else:
        print("\n❌ Camera diagnostic failed - no working cameras")
    
    print("\n✅ Diagnostic complete.")
