# Git Configuration Guide

## Overview
This document explains the `.gitignore` configuration for the Study Eye project to prevent large files and unnecessary artifacts from being committed to the repository.

## Current .gitignore Coverage

### Python/Backend Files
- `__pycache__/` - Python bytecode cache
- `*.pyc`, `*.pyo`, `*.pyd` - Compiled Python files
- `venv/`, `.venv/`, `env/` - Virtual environments
- `*.egg-info/` - Python package metadata
- `.pytest_cache/` - PyTest cache
- `.coverage`, `htmlcov/` - Coverage reports

### Node.js/Frontend Files
- `node_modules/` - NPM dependencies
- `dist/`, `build/` - Build outputs
- `.cache/`, `.parcel-cache/` - Build caches
- `*.log` - Log files

### Machine Learning & Data Files
- `*.model`, `*.pkl`, `*.h5` - Model files
- `*.weights`, `*.ckpt` - Model weights
- `*.tflite`, `*.onnx`, `*.pt` - Model formats
- `models/`, `data/`, `datasets/` - Data directories

### Media Files (Often Large)
- `*.mp4`, `*.avi`, `*.mov` - Video files
- `*.mp3`, `*.wav` - Audio files
- `*.jpg`, `*.png`, `*.gif` - Image files
- `media/`, `assets/`, `uploads/` - Media directories

### Development Tools
- `.vscode/`, `.idea/` - IDE configurations
- `*.swp`, `*.swo` - Editor temporary files
- `.DS_Store`, `Thumbs.db` - OS generated files

### Database Files
- `*.db`, `*.sqlite`, `*.sqlite3` - Database files
- `*.db-journal` - SQLite journal files

## Large File Detection

### Automated Checking
Use the included `check_large_files.py` script to scan for files larger than 10MB:

```bash
python check_large_files.py
```

Options:
- `--max-size 5` - Set different size threshold (MB)
- `--dir ./specific/path` - Scan specific directory

### Current Large Files Found
As of the last scan, the following large files are properly ignored:

**Backend Virtual Environment (`venv/`):**
- `libclang.dll` - 80.1MB
- `cv2.pyd` - 69.08MB  
- `xla_extension.pyd` - 171.14MB
- Various MediaPipe models (1-6MB each)
- TensorFlow binaries and models

**Frontend Dependencies (`node_modules/`):**
- `esbuild.exe` - 10.03MB
- Various bundled dependencies

All these files are automatically excluded by the `.gitignore` patterns.

## Best Practices

### Before Committing
1. Run `python check_large_files.py` to verify no large files
2. Use `git status` to review staged files
3. Check file sizes with `git ls-files --cached --others | xargs -I {} ls -la {}`

### Adding New Patterns
When you encounter new large file types:
1. Add the pattern to `.gitignore`
2. Update this documentation
3. Run the large file checker to verify

### Model and Data Files
- Store large models in cloud storage (AWS S3, Google Drive, etc.)
- Use model registries (MLflow, W&B) for ML artifacts
- Keep only small reference/demo files in the repository
- Document where large files are stored in README.md

### Environment Files
- Never commit `.env` files with secrets
- Use `.env.example` as templates
- Store credentials in secure environment variables

## Emergency Cleanup

If large files were accidentally committed:

```bash
# Remove file from git history (dangerous - use carefully)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if safe to do so)
git push origin --force --all
```

## Monitoring

### Regular Checks
- Run `check_large_files.py` weekly
- Monitor repository size growth
- Review `.gitignore` effectiveness periodically

### Repository Size
Keep total repository size under:
- **Ideal:** < 100MB
- **Warning:** 100MB - 500MB  
- **Critical:** > 500MB

## Related Files
- `.gitignore` - Main ignore patterns
- `frontend/.gitignore` - Frontend-specific patterns
- `check_large_files.py` - Automated large file detection
- `README.md` - Project documentation
