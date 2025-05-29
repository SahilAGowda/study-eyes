#!/usr/bin/env python3
"""
Pre-commit verification script for the Study Eye project.
This script performs various checks before allowing a commit.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, capture_output=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=capture_output, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_large_files(max_size_mb=10):
    """Check for large files using our existing script."""
    success, stdout, stderr = run_command(f"python check_large_files.py --max-size {max_size_mb}")
    return success, stdout + stderr

def check_secrets():
    """Check for potential secrets or sensitive information."""
    patterns = [
        r"password\s*=",
        r"secret\s*=", 
        r"api_key\s*=",
        r"token\s*=",
        r"private_key",
        r"-----BEGIN.*PRIVATE KEY-----"
    ]
    
    issues = []
    for pattern in patterns:
        success, stdout, stderr = run_command(f'grep -r -i "{pattern}" . --exclude-dir=venv --exclude-dir=node_modules --exclude-dir=.git')
        if success and stdout.strip():
            issues.append(f"Potential secret found: {pattern}")
            issues.append(stdout[:200] + "..." if len(stdout) > 200 else stdout)
    
    return len(issues) == 0, "\n".join(issues)

def check_python_syntax():
    """Check Python files for syntax errors."""
    python_files = list(Path(".").rglob("*.py"))
    python_files = [f for f in python_files if "venv" not in str(f) and "__pycache__" not in str(f)]
    
    errors = []
    for py_file in python_files:
        success, stdout, stderr = run_command(f"python -m py_compile {py_file}")
        if not success:
            errors.append(f"Syntax error in {py_file}: {stderr}")
    
    return len(errors) == 0, "\n".join(errors)

def check_package_files():
    """Check that package files are properly formatted."""
    issues = []
    
    # Check package.json exists and is valid
    package_json = Path("frontend/package.json")
    if package_json.exists():
        success, stdout, stderr = run_command("cd frontend && npm ls --depth=0")
        if not success:
            issues.append("Frontend package dependencies have issues")
    
    # Check requirements.txt exists
    requirements = Path("backend/requirements.txt")
    if not requirements.exists():
        issues.append("Backend requirements.txt is missing")
    
    return len(issues) == 0, "\n".join(issues)

def main():
    """Main verification function."""
    print("Running pre-commit verification...")
    print("=" * 50)
    
    checks = [
        ("Large Files", check_large_files),
        ("Secrets", check_secrets),
        ("Python Syntax", check_python_syntax),
        ("Package Files", check_package_files)
    ]
    
    all_passed = True
    
    for check_name, check_func in checks:
        print(f"\n{check_name}...")
        try:
            passed, message = check_func()
            if passed:
                print(f"PASS: {check_name}")
            else:
                print(f"FAIL: {check_name}")
                if message:
                    print(f"   {message}")
                all_passed = False
        except Exception as e:
            print(f"ERROR: {check_name} - {e}")
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("All checks passed! Ready to commit.")
        return 0
    else:
        print("Some checks failed. Please fix issues before committing.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
