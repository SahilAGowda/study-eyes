# Study Eyes - Deployment Guide

This guide covers various deployment options for the Study Eyes application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Deployment](#development-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (for production)
- Redis 7+ (for production)
- Docker & Docker Compose (for containerized deployment)

### Required Services
- Database (PostgreSQL for production, SQLite for development)
- Redis (for session management and caching)
- File storage (local or cloud storage)

## Development Deployment

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd study-eye

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade

# Setup frontend
cd ../frontend
npm install

# Start development servers
cd ..
./start-dev.bat  # On Windows
# or
chmod +x start-dev.sh && ./start-dev.sh  # On Linux/Mac
```

### Manual Development Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run development server
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
```

## Docker Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose build
docker-compose up -d
```

### Individual Container Deployment

#### Backend Container
```bash
cd backend
docker build -t study-eyes-backend .
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET_KEY=your-secret-key \
  study-eyes-backend
```

#### Frontend Container
```bash
cd frontend
docker build -t study-eyes-frontend .
docker run -p 3000:3000 study-eyes-frontend
```

## Production Deployment

### Server Setup

#### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash studyeyes
sudo usermod -aG sudo studyeyes
```

#### 2. Database Setup
```bash
# Configure PostgreSQL
sudo -u postgres createuser --createdb studyeyes
sudo -u postgres createdb study_eyes -O studyeyes
sudo -u postgres psql -c "ALTER USER studyeyes PASSWORD 'your-secure-password';"
```

#### 3. Application Deployment
```bash
# Clone repository
sudo -u studyeyes git clone <repository-url> /home/studyeyes/study-eye
cd /home/studyeyes/study-eye

# Setup backend
cd backend
sudo -u studyeyes python3.11 -m venv venv
sudo -u studyeyes ./venv/bin/pip install -r requirements.txt

# Setup environment
sudo -u studyeyes cp .env.production .env
# Edit .env with production values

# Initialize database
sudo -u studyeyes ./venv/bin/flask db upgrade

# Setup frontend
cd ../frontend
sudo -u studyeyes npm install
sudo -u studyeyes npm run build
```

#### 4. Process Management (Systemd)

Create backend service:
```bash
sudo tee /etc/systemd/system/study-eyes-backend.service > /dev/null <<EOF
[Unit]
Description=Study Eyes Backend
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=studyeyes
Group=studyeyes
WorkingDirectory=/home/studyeyes/study-eye/backend
Environment=PATH=/home/studyeyes/study-eye/backend/venv/bin
ExecStart=/home/studyeyes/study-eye/backend/venv/bin/gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 wsgi:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable study-eyes-backend
sudo systemctl start study-eyes-backend
sudo systemctl status study-eyes-backend
```

#### 5. Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/study-eyes > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/studyeyes/study-eye/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/study-eyes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Configuration
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS
1. Create ECS cluster
2. Push Docker images to ECR
3. Create task definitions
4. Setup load balancer
5. Configure RDS and ElastiCache

#### Using AWS Elastic Beanstalk
1. Package application
2. Create Elastic Beanstalk application
3. Configure environment variables
4. Deploy application

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT-ID/study-eyes-backend backend/
gcloud builds submit --tag gcr.io/PROJECT-ID/study-eyes-frontend frontend/

# Deploy services
gcloud run deploy study-eyes-backend --image gcr.io/PROJECT-ID/study-eyes-backend --platform managed
gcloud run deploy study-eyes-frontend --image gcr.io/PROJECT-ID/study-eyes-frontend --platform managed
```

### Heroku Deployment

#### Backend Deployment
```bash
# Create Heroku app
heroku create study-eyes-backend

# Add buildpack
heroku buildpacks:set heroku/python

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set JWT_SECRET_KEY=your-secret-key

# Add database
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git subtree push --prefix backend heroku main
```

## Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
# Application
FLASK_ENV=production
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SQLALCHEMY_DATABASE_URI=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
BCRYPT_LOG_ROUNDS=12
JWT_ACCESS_TOKEN_EXPIRES=86400

# File Upload
UPLOAD_FOLDER=/var/uploads
MAX_CONTENT_LENGTH=16777216

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/study-eyes/app.log

# Features
ENABLE_ANALYTICS=true
ENABLE_CAMERA=true
ENABLE_EYE_TRACKING=true
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

## Monitoring and Logging

### Application Monitoring
- Use application logs in `/var/log/study-eyes/`
- Monitor system resources (CPU, memory, disk)
- Track database performance
- Monitor WebSocket connections

### Health Checks
```bash
# Backend health check
curl http://localhost:5000/api/health

# Database connection
curl http://localhost:5000/api/health/db

# Redis connection
curl http://localhost:5000/api/health/redis
```

### Log Management
```bash
# View application logs
sudo journalctl -u study-eyes-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
sudo tail -f /home/studyeyes/study-eye/backend/logs/app.log
```

## Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check service status
sudo systemctl status study-eyes-backend

# Check logs
sudo journalctl -u study-eyes-backend -f

# Check environment variables
sudo -u studyeyes env | grep FLASK
```

#### Database Connection Issues
```bash
# Test database connection
sudo -u studyeyes psql -h localhost -U studyeyes -d study_eyes

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Frontend Build Issues
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Performance Optimization

#### Database Optimization
- Add database indexes
- Configure connection pooling
- Setup read replicas
- Enable query caching

#### Application Optimization
- Use Redis for session storage
- Implement API caching
- Optimize image processing
- Use CDN for static assets

#### Frontend Optimization
- Enable Gzip compression
- Use code splitting
- Optimize bundle size
- Implement lazy loading

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Database access controls
- [ ] File upload restrictions
