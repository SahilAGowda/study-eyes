#!/usr/bin/env python3
"""
Script to check for large files that should be gitignored.
Run this before committing to ensure no large files are accidentally included.
"""

import os
import sys
from pathlib import Path

def check_large_files(root_dir=".", max_size_mb=10):
    """
    Check for files larger than max_size_mb in the repository.
    
    Args:
        root_dir: Directory to scan (default: current directory)
        max_size_mb: Maximum file size in MB before flagging (default: 10MB)
    """
    root_path = Path(root_dir).resolve()
    large_files = []
    max_size_bytes = max_size_mb * 1024 * 1024
    
    # Directories to skip (already in .gitignore)
    skip_dirs = {
        '.git', '__pycache__', 'node_modules', 'venv', '.venv', 
        'env', '.env', 'dist', 'build', '.cache', '.pytest_cache',
        'coverage', 'htmlcov', '.nyc_output', '.tox', '.eggs',
        'site-packages'
    }
    
    print(f"Scanning {root_path} for files larger than {max_size_mb}MB...")
    print("-" * 60)
    
    for file_path in root_path.rglob("*"):
        if file_path.is_file():
            # Skip files in directories that should be ignored
            if any(skip_dir in file_path.parts for skip_dir in skip_dirs):
                continue
                
            try:
                file_size = file_path.stat().st_size
                if file_size > max_size_bytes:
                    size_mb = file_size / (1024 * 1024)
                    relative_path = file_path.relative_to(root_path)
                    large_files.append((relative_path, size_mb))
            except (OSError, PermissionError):
                # Skip files we can't access
                continue
    
    if large_files:
        print("WARNING: Large files found:")
        for file_path, size_mb in sorted(large_files, key=lambda x: x[1], reverse=True):
            print(f"  {size_mb:6.1f}MB  {file_path}")
        print()
        print("Consider adding these patterns to .gitignore:")
        for file_path, _ in large_files:
            if file_path.suffix:
                print(f"  *{file_path.suffix}")
            else:
                print(f"  {file_path.name}")
    else:
        print("SUCCESS: No large files found outside of ignored directories!")
    
    return large_files

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Check for large files in repository")
    parser.add_argument("--max-size", type=int, default=10, 
                       help="Maximum file size in MB (default: 10)")
    parser.add_argument("--dir", type=str, default=".",
                       help="Directory to scan (default: current directory)")
    
    args = parser.parse_args()
    
    large_files = check_large_files(args.dir, args.max_size)
    
    if large_files:
        sys.exit(1)  # Exit with error code if large files found
    else:
        sys.exit(0)  # Exit successfully if no large files
