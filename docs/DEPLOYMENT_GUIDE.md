# PeoplePay360 - Deployment Guide

This guide covers deploying PeoplePay360 to production environments.

## Prerequisites

- Node.js 18+ installed on production server
- MongoDB Atlas account (or self-hosted MongoDB)
- Domain name (optional, for HTTPS)
- SMTP server credentials (for email functionality)

## Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/peoplepay360?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-random-secret-key-min-32-chars

# Server
PORT=5000
NODE_ENV=production

# Email (optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=PeoplePay360 <noreply@yourcompany.com>

# Admin Account (for initial setup)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMPLOYEE_NUMBER=EMP000
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator

# CORS (frontend URL)
FRONTEND_URL=https://yourapp.com
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.yourapp.com/api
```

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Clone repository
git clone https://github.com/yourusername/peoplepay360.git
cd peoplepay360
```

#### 2. Backend Deployment
```bash
cd backend

# Install dependencies
npm ci --production

# Create .env file
nano .env
# (Paste production environment variables)

# Create admin account
npm run seed:admin

# Start with PM2
pm2 start src/index.js --name peoplepay360-backend
pm2 save
pm2 startup
```

#### 3. Frontend Deployment
```bash
cd ../frontend

# Install dependencies
npm ci

# Create .env file
nano .env
# (Paste production environment variables)

# Build for production
npm run build

# Serve with Nginx (configure below)
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/peoplepay360

# Backend API
server {
    listen 80;
    server_name api.yourapp.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourapp.com www.yourapp.com;
    
    root /path/to/peoplepay360/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/peoplepay360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL/HTTPS with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourapp.com -d www.yourapp.com -d api.yourapp.com

# Auto-renewal is configured automatically
```

### Option 2: Heroku

#### Backend
```bash
# Login to Heroku
heroku login

# Create app
heroku create peoplepay360-api

# Add MongoDB addon (or use MongoDB Atlas)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://peoplepay360.herokuapp.com

# Deploy
git subtree push --prefix backend heroku main

# Create admin
heroku run npm run seed:admin
```

#### Frontend
```bash
# Build static files
cd frontend
npm run build

# Deploy to Heroku with static buildpack
heroku create peoplepay360-frontend
heroku buildpacks:set heroku/static
echo '{"root": "dist/"}' > static.json
git add static.json
git commit -m "Add static.json"
git push heroku main
```

### Option 3: Docker Containers

#### Dockerfile - Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

#### Dockerfile - Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

```bash
# Deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 4: Vercel + Railway/Render

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variable in Vercel dashboard
# VITE_API_URL = https://your-backend.up.railway.app/api
```

#### Backend on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables in dashboard
6. Deploy automatically

## Post-Deployment Tasks

### 1. Create Admin Account
```bash
# SSH into server or use platform CLI
npm run seed:admin --prefix backend

# Or create via API
curl -X POST https://api.yourapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Configure SMTP for Emails
Test email configuration:
```bash
# Use a service like SendGrid, Mailgun, or Gmail
# Update backend/.env with proper credentials
# Test by triggering "Send Payslips" in application
```

### 3. Set Up Monitoring

#### PM2 Monitoring (if using PM2)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor
pm2 monit
```

#### Error Tracking with Sentry (Optional)
```bash
# Install Sentry
npm install @sentry/node --save

# Add to backend/src/index.js
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

### 4. Database Backups

#### MongoDB Atlas (Automatic)
- Atlas provides automatic backups
- Configure in Atlas dashboard under "Backup"
- Set retention policy and snapshot frequency

#### Self-Hosted MongoDB
```bash
# Manual backup
mongodump --uri="mongodb://localhost:27017/peoplepay360" --out=/backups/$(date +%Y%m%d)

# Automated daily backup (crontab)
0 2 * * * mongodump --uri="mongodb://localhost:27017/peoplepay360" --out=/backups/$(date +\%Y\%m\%d) && find /backups -type d -mtime +30 -delete
```

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] HTTPS/SSL certificates installed
- [ ] MongoDB authentication enabled
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] JWT secret is long and random (32+ characters)
- [ ] CORS configured to allow only frontend domain
- [ ] Rate limiting enabled (optional: express-rate-limit)
- [ ] Helmet.js for HTTP headers (optional)
- [ ] Regular dependency updates (`npm audit`)
- [ ] Database connection string not exposed
- [ ] Secrets not in Git history
- [ ] Admin password changed from demo credentials

## Performance Optimization

### Backend
- Enable gzip compression
- Implement API response caching (Redis)
- Add database indexes on frequently queried fields
- Use MongoDB aggregation pipeline for complex queries
- Enable PM2 cluster mode for multiple cores

### Frontend
- Vite already optimizes build
- Enable CDN for static assets
- Implement service worker for offline capability
- Add lazy loading for images
- Use React.memo for expensive components

### Database
- Create indexes:
```javascript
// Run in MongoDB shell or Compass
db.employees.createIndex({ employeeNumber: 1 })
db.employees.createIndex({ department: 1 })
db.employees.createIndex({ status: 1 })
db.attendance.createIndex({ employeeId: 1, workDate: -1 })
db.payslips.createIndex({ employeeId: 1, periodStart: -1 })
db.payruns.createIndex({ status: 1, createdAt: -1 })
```

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple backend instances behind load balancer
- Use session store (Redis) for JWT tokens (if needed)
- Separate read/write MongoDB connections

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas for read-heavy operations
- Sharding for large datasets (50M+ documents)

### Caching Strategy
```bash
# Install Redis
npm install redis

# Implement caching layer
# Cache dashboard data, employee lists, salary structures
# Invalidate on mutations
```

## Monitoring & Logging

### Application Logs
```bash
# PM2 logs
pm2 logs peoplepay360-backend

# Custom logging with Winston
npm install winston
```

### Metrics to Monitor
- API response times
- Database query performance
- Error rates
- Active users
- Memory usage
- CPU usage
- Disk space

### Health Checks
```bash
# Already implemented at /api/health
curl https://api.yourapp.com/api/health

# Add to uptime monitoring (UptimeRobot, Pingdom)
```

## Rollback Strategy

### Quick Rollback
```bash
# PM2
pm2 stop peoplepay360-backend
git checkout previous-commit
npm ci --production
pm2 restart peoplepay360-backend

# Docker
docker-compose down
git checkout previous-commit
docker-compose up -d --build
```

### Database Rollback
- Restore from backup
- Test in staging first
- Run migration scripts if schema changed

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check logs for errors
- [ ] Weekly: Review system metrics
- [ ] Monthly: Update npm dependencies
- [ ] Monthly: Database backup verification
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Troubleshooting Common Issues

**"Cannot connect to database"**
- Check MongoDB URI in .env
- Verify network access in MongoDB Atlas
- Check firewall rules

**"JWT verification failed"**
- Ensure JWT_SECRET matches between deployments
- Check token expiration settings
- Clear localStorage and login again

**"CORS error"**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in backend
- Ensure API URL is correct in frontend

**"502 Bad Gateway"**
- Backend not running: `pm2 restart peoplepay360-backend`
- Check backend logs: `pm2 logs`
- Verify port not blocked by firewall

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

**Questions? Check the GitHub repository issues or contact the development team.**
