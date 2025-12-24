# 🚀 Deployment Preparation Guide

**Project:** Maldives Adventure Hub (KVS Scuba Maldivi)  
**Version:** 1.0.0-prod  
**Status:** Production Ready  
**Last Updated:** December 23, 2025

---

## Executive Summary

This guide walks through complete preparation for production deployment across 6 phases. The project is a React/TypeScript frontend with Supabase backend integration, fully designed for cloud deployment.

### Key Features
- ✅ React 19 + TypeScript + Vite
- ✅ Supabase Authentication & Database
- ✅ Responsive Tailwind CSS Design
- ✅ Multilingual Support (English/Bosnian)
- ✅ Google OAuth Integration
- ✅ Real-time APIs (Weather, Maps, Geoapify)

---

## Phase 1: Codebase Organization & Cleanup

### 1.1 Current Structure Review

**Frontend Source:**
```
├── App.tsx                 # Main application component
├── index.tsx              # React entry point
├── index.html             # HTML template
├── components/            # React components
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   └── ... (12+ components)
├── services/              # API/external services
│   ├── supabaseClient.ts
│   ├── apiService.ts
│   ├── weatherService.ts
│   └── ... (8+ services)
├── contexts/              # React contexts
│   ├── AuthProvider.tsx
│   └── PinAuthContext.tsx
├── utils/                 # Utility functions
│   └── pinCrypto.ts
├── src/                   # Additional source files
│   ├── locales/          # Translation files
│   └── components/       # Extra components
└── types.ts              # TypeScript type definitions
```

### 1.2 Cleanup Actions

#### Remove Unnecessary Files
- [ ] Delete all `desktop.ini` files (platform-specific)
- [ ] Remove development documentation (PHASE*.md, MANDATE*.md)
- [ ] Keep only: README.md, DEPLOYMENT_*.md, USER_GUIDE.md
- [ ] Remove test scripts (test-form-submission.sh)

#### Keep in Git
Files to version control:
```
.gitignore              # Exclude node_modules, .env.local, dist/
package.json            # Dependencies
package-lock.json       # Lock file
tsconfig.json          # TypeScript config
vite.config.ts         # Vite configuration
tailwind.config.ts     # Tailwind config
postcss.config.js      # PostCSS config
.env.example           # Environment template
```

#### Recommended .gitignore
```bash
# Environment variables
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Node dependencies
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store
desktop.ini

# OS
Thumbs.db
.DS_Store

# Logs
logs/
*.log

# Temporary files
*.tmp
temp/
```

### 1.3 Update package.json

Add deployment and build optimization scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:prod": "vite build --minify terser",
    "lint": "tsc --noEmit",
    "test": "vitest",
    "predeploy": "npm run build",
    "deploy": "npm run build && echo 'Build complete. Deploy dist/ folder'"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 1.4 Environment Configuration

Ensure `.env.example` is complete and up-to-date:

```bash
# Frontend - Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Frontend - OAuth & APIs
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key
VITE_FIXER_API_KEY=your-fixer-api-key
VITE_SHEETS_API_KEY=your-sheets-api-key (optional)

# Frontend - Runtime Config
VITE_API_URL=https://api.yourdomain.com (for future backend)
VITE_MODE=production
VITE_LOG_LEVEL=error

# Build
VITE_BUILD_TIME=auto
```

---

## Phase 2: Database Setup & Migrations

### 2.1 Current Database Schema

**Supabase Tables:**

#### divers
```sql
CREATE TABLE public.divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  certification_level TEXT,
  experience_level TEXT,
  status TEXT DEFAULT 'pending',
  access_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### access_requests
```sql
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE CASCADE,
  expedition_id UUID,
  request_date TIMESTAMP DEFAULT now(),
  approval_date TIMESTAMP,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### expeditions
```sql
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  max_participants INT,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT now()
);
```

### 2.2 Migration Strategy

**Pre-Deployment Checklist:**

- [ ] All tables created in production database
- [ ] Indexes created on frequently queried columns:
  ```sql
  CREATE INDEX idx_divers_email ON divers(email);
  CREATE INDEX idx_divers_status ON divers(status);
  CREATE INDEX idx_access_requests_diver_id ON access_requests(diver_id);
  CREATE INDEX idx_access_requests_status ON access_requests(status);
  ```

- [ ] Row-Level Security (RLS) policies enabled:
  ```sql
  -- Allow anonymous users to insert access requests
  ALTER TABLE divers ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Allow anonymous insert" ON divers
    FOR INSERT WITH CHECK (true);
  
  CREATE POLICY "Allow authenticated select own data" ON divers
    FOR SELECT USING (auth.uid() = auth_id);
  ```

- [ ] Backup strategy documented
- [ ] Replication configured for production database

### 2.3 Data Migration Checklist

- [ ] Existing data backed up
- [ ] Database version documented
- [ ] Migration scripts tested in staging
- [ ] Rollback plan prepared

---

## Phase 3: Security & Optimization

### 3.1 Security Hardening

#### CORS Configuration
```typescript
// vite.config.ts - Add server configuration
export default defineConfig({
  server: {
    cors: {
      origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  }
});
```

#### Security Headers (for reverse proxy/nginx)
```nginx
# Add these headers in production
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

#### Input Validation
- ✅ Email validation (regex check already in form)
- ✅ Phone number validation (if provided)
- ✅ Name length limits (1-100 characters)
- ✅ Escape all user inputs before database insertion

#### Rate Limiting
For production, implement rate limiting:
```typescript
// Example: Rate limit form submissions
const SUBMISSION_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
};
```

### 3.2 Performance Optimization

#### Production Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
          'i18n-vendor': ['i18next', 'react-i18next']
        }
      }
    }
  }
});
```

#### Image & Asset Optimization
- [ ] Compress all images (use tools like ImageOptim, TinyPNG)
- [ ] Use WebP format for modern browsers
- [ ] Lazy load images where possible
- [ ] Minimize CSS (Tailwind already does this)

#### Caching Headers
```
# .htaccess or nginx configuration
# Cache static assets for 1 year (they have hash names)
*.js              max-age=31536000
*.css             max-age=31536000
*.woff2           max-age=31536000

# Cache HTML for 24 hours (since it references hashed assets)
*.html            max-age=86400, must-revalidate

# Don't cache JSON data
*.json            max-age=0, no-cache
```

### 3.3 Code Quality

- [ ] Run TypeScript compiler: `npm run lint`
- [ ] No console errors in production build
- [ ] All API calls have error handling
- [ ] All external API keys are in environment variables

---

## Phase 4: Deployment Configuration

### 4.1 Docker Setup

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
      - VITE_MODE=production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

### 4.2 Nginx Reverse Proxy

Create `nginx.conf`:
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml 
               text/x-component text/x-cross-domain-policy;

    # Upstream
    upstream app {
        server app:3000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates (use Let's Encrypt)
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security Headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Proxy to app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
```

### 4.3 Environment-Specific Configuration

Create `config/environments.ts`:
```typescript
export const environments = {
  development: {
    apiUrl: 'http://localhost:3001',
    logLevel: 'debug',
    enableAnalytics: false,
  },
  staging: {
    apiUrl: 'https://staging-api.yourdomain.com',
    logLevel: 'info',
    enableAnalytics: true,
  },
  production: {
    apiUrl: 'https://api.yourdomain.com',
    logLevel: 'error',
    enableAnalytics: true,
  },
};
```

---

## Phase 5: Documentation

### 5.1 Update README.md

See [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) for complete template.

### 5.2 API Documentation

Document all services:
- Supabase endpoints
- External APIs (Weather, Geoapify, Google OAuth)
- Authentication flow
- Error handling

---

## Phase 6: GitHub Repository Setup

### 6.1 Repository Initialization

```bash
# Initialize git if not already done
git init

# Add remote (replace with your repo)
git remote add origin https://github.com/IDSS123a/maldives-adventure-hub.git

# Create and switch to main branch
git checkout -b main

# Add .gitignore
echo "node_modules/" >> .gitignore
echo ".env.local" >> .gitignore
echo "dist/" >> .gitignore

# Initial commit
git add .
git commit -m "Initial commit: Production-ready deployment"

# Push to GitHub
git push -u origin main
```

### 6.2 GitHub Configuration

**Branch Protection Rules (Settings → Branches):**
- [ ] Require pull request reviews before merging
- [ ] Require status checks to pass
- [ ] Require branches to be up to date

**GitHub Secrets (Settings → Secrets):**
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_GOOGLE_CLIENT_ID`
- [ ] `DEPLOY_KEY` (for deployment)

### 6.3 GitHub Actions Workflow

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)

---

## Deployment Checklist

### Pre-Deployment (1-2 Days Before)

- [ ] All code committed and pushed
- [ ] .env.example updated with all variables
- [ ] No sensitive data in codebase
- [ ] TypeScript compilation passes
- [ ] npm install runs without errors
- [ ] npm run build succeeds
- [ ] dist/ folder created successfully
- [ ] All tests pass (if applicable)

### Deployment Day

- [ ] Database backups created
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Docker image built successfully
- [ ] All environment variables set on server
- [ ] Nginx configuration tested
- [ ] Health checks passing
- [ ] Monitoring alerts configured

### Post-Deployment (First 24 Hours)

- [ ] Monitor error logs
- [ ] Check application performance
- [ ] Verify all features work
- [ ] Test OAuth login flow
- [ ] Verify email notifications (when added)
- [ ] Monitor database connections
- [ ] Test database backups

### 30-Day Post-Deployment

- [ ] Review error logs for patterns
- [ ] Analyze user analytics
- [ ] Performance metrics assessment
- [ ] Security audit results
- [ ] Plan for future improvements

---

## Deployment Target Options

### Option 1: DigitalOcean (Recommended)
- Droplet: Ubuntu 22.04, 2GB RAM, $12/month
- Deploy with Docker Compose
- Use DigitalOcean Spaces for static files
- Managed database option available

### Option 2: Heroku
- Easy deployment with Git push
- Automatic SSL certificates
- Simple environment variables
- More expensive for long-term (~$50+/month)

### Option 3: AWS
- More complex setup
- Highly scalable
- Use: EC2 + RDS + CloudFront
- Requires AWS expertise

### Option 4: Vercel
- Optimized for Next.js (consider migrating)
- Zero-config deployments
- Automatic scaling
- Good for frontend-only apps

---

## Support & Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port 3000 Already in Use:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

**Environment Variables Not Loading:**
- Verify .env file exists (not .env.local)
- Restart development server
- Check `VITE_` prefix for frontend vars

**Database Connection Issues:**
- Verify Supabase credentials
- Check RLS policies
- Test connection in Supabase dashboard

---

## Next Steps

1. **Complete Phase 1-6** using this guide
2. **Run deployment checklist** before going live
3. **Set up monitoring** (Sentry, LogRocket)
4. **Configure email notifications** (SendGrid, Mailgun)
5. **Plan Phase 2 features** (Admin panel, PIN system)

---

**Last Updated:** December 23, 2025  
**Status:** Ready for Implementation  
**Version:** 1.0.0
