# Environment Configuration for Task Manager

This document outlines all environment variables needed for the Task Manager application across different environments.

## Development Environment

Create a `.env.development` file in the `backend/` directory:

```env
# Application
NODE_ENV=development
APP_VERSION=1.0.0
LOG_LEVEL=debug
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager-dev
MONGODB_POOL_SIZE=10

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=dev_secret_key_change_this_in_production
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=dev_refresh_secret_key
JWT_REFRESH_EXPIRY=7d

# AWS (S3 for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_S3_BUCKET=taskmanager-dev-bucket

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
FROM_EMAIL=noreply@taskmanager.local

# SMS Service (Twilio - Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (Voice & AI)
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxxxxxxxxx@sentry.io/xxxxxxxxxxxx

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Features
ENABLE_AI_FEATURES=true
ENABLE_PAYMENTS=true
ENABLE_VOICE_INPUT=true
ENABLE_NOTIFICATIONS=true
MAX_FILE_SIZE=10485760  # 10MB

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Pagination
DEFAULT_PAGE_LIMIT=20
MAX_PAGE_LIMIT=100

# Admin
ADMIN_EMAIL=admin@taskmanager.local
ADMIN_PASSWORD=changeme
```

## Testing Environment

Create `.env.test` file:

```env
NODE_ENV=test
LOG_LEVEL=error
PORT=5001

# Use test database
MONGODB_URI=mongodb://localhost:27017/taskmanager-test
REDIS_HOST=localhost
REDIS_PORT=6379
USE_MOCK_REDIS=true

# Use mock services
USE_MOCK_EMAIL=true
USE_MOCK_STORAGE=true
USE_MOCK_OPENAI=true
USE_MOCK_STRIPE=true

# Test credentials
JWT_SECRET=test_secret_key
JWT_REFRESH_SECRET=test_refresh_secret

TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

## Staging Environment

Create `.env.staging` file:

```env
NODE_ENV=staging
APP_VERSION=1.0.0
LOG_LEVEL=info
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster-staging.mongodb.net/taskmanager-staging?retryWrites=true&w=majority
MONGODB_POOL_SIZE=20

# Cache
REDIS_HOST=redis-staging.xxxxxxxxxxxx.ng.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=xxxxxxxxxxxx
REDIS_DB=0

# Authentication
JWT_SECRET=staging_secret_key_random_string_here
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=staging_refresh_secret_key
JWT_REFRESH_EXPIRY=7d

# AWS Production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
AWS_S3_BUCKET=taskmanager-staging-bucket

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
FROM_EMAIL=noreply@staging.taskmanager.com

# External Services
OPENAI_API_KEY=sk-xxxxxxxxxxxx (staging key)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
SENTRY_DSN=https://xxxxxxxxxxxx@sentry.io/xxxxxxxxxxxx

# CORS
CORS_ORIGIN=https://staging.taskmanager.com,https://app-staging.taskmanager.com

# Features
ENABLE_AI_FEATURES=true
ENABLE_PAYMENTS=true
ENABLE_NOTIFICATIONS=true

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
DATADOG_API_KEY=xxxxxxxxxxxx
MONITORING_ENABLED=true
```

## Production Environment

Create `.env.production` file (SECRET - never commit to git):

```env
NODE_ENV=production
APP_VERSION=1.0.0
LOG_LEVEL=info
PORT=5000

# Database (MongoDB Atlas Production)
MONGODB_URI=mongodb+srv://prod_user:secure_password@cluster-production.mongodb.net/taskmanager?retryWrites=true&w=majority&replicaSet=rs0
MONGODB_POOL_SIZE=50

# Cache
REDIS_HOST=redis-production.xxxxxxxxxxxx.ng.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=xxx_secure_long_password_xxx
REDIS_DB=0

# Authentication (Rotate regularly)
JWT_SECRET=production_ultra_secure_random_string_min_32_chars
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=production_refresh_ultra_secure_random_string
JWT_REFRESH_EXPIRY=7d

# AWS Production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=xxx_secure_long_secret_key_xxx
AWS_S3_BUCKET=taskmanager-production-bucket

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx_production_key_xxx
FROM_EMAIL=noreply@taskmanager.com
SUPPORT_EMAIL=support@taskmanager.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxx_secure_token_xxx
TWILIO_PHONE_NUMBER=+1-800-TASKMGR

# AI Services (OpenAI Production API)
OPENAI_API_KEY=sk-xxx_production_key_xxx
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Sentry (Production DSN)
SENTRY_DSN=https://production_key@sentry.io/production_project_id

# Security
CORS_ORIGIN=https://taskmanager.com,https://app.taskmanager.com
ALLOWED_HOSTS=taskmanager.com,app.taskmanager.com,api.taskmanager.com

# Features
ENABLE_AI_FEATURES=true
ENABLE_PAYMENTS=true
ENABLE_NOTIFICATIONS=true
ENABLE_VOICE_INPUT=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=5000

# Pagination
DEFAULT_PAGE_LIMIT=20
MAX_PAGE_LIMIT=100

# File Upload
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif,xls,xlsx

# Monitoring & Analytics
DATADOG_API_KEY=xxx_production_api_key_xxx
DATADOG_APP_KEY=xxx_production_app_key_xxx
MONITORING_ENABLED=true
PERFORMANCE_MONITORING=true

# Backup & Disaster Recovery
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30

# API Keys (Rotate monthly)
ADMIN_API_KEY=xxx_secure_long_key_xxx
SERVICE_API_KEY=xxx_secure_long_key_xxx

# Timezone & Localization
DEFAULT_TIMEZONE=America/New_York
SUPPORTED_LANGUAGES=en,es,fr,de,ja

# Feature Flags
FEATURE_BETA_DASHBOARD=false
FEATURE_EXPORT_HISTORY=true
FEATURE_ADVANCED_ANALYTICS=true

# Caching
CACHE_STRATEGY=redis
DEFAULT_CACHE_TTL=300
ANALYTICS_CACHE_TTL=1800

# Logging Destination
LOG_DESTINATION=cloudwatch
LOG_GROUP_NAME=/aws/task-manager/production
LOG_STREAM_NAME=application-logs
```

## Environment Variable Categories

### Core Application
- `NODE_ENV` - Environment (development/staging/production)
- `APP_VERSION` - Application version
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `PORT` - Server port

### Database & Cache
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis configuration

### Authentication
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRY` - Token expiration time
- `JWT_REFRESH_SECRET` - Refresh token secret

### External Services
- `SENDGRID_API_KEY` - Email service
- `OPENAI_API_KEY` - AI services
- `STRIPE_SECRET_KEY` - Payment processing
- `SENTRY_DSN` - Error tracking

### AWS/Storage
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name

### Security
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_MAX_REQUESTS` - Rate limit threshold

## Setup Instructions

### Local Development

```bash
# 1. Copy example file
cp backend/.env.example backend/.env.development

# 2. Update values for your environment
# For localhost development, most defaults work

# 3. Start backend
cd backend
npm run dev

# 4. In another terminal, start frontend
cd frontend
npm run dev
```

### Production Deployment

```bash
# 1. Set environment variables in deployment platform
# AWS ECS: Use task definition environment variables
# Heroku: Use Config Vars
# Docker: Use docker-compose.yml or pass -e flags

# 2. Never commit .env files to git (they're in .gitignore)

# 3. Rotate sensitive keys regularly
# - JWT_SECRET every 3 months
# - API Keys monthly
# - Database passwords quarterly

# 4. Use secret management service
# - AWS Secrets Manager (recommended)
# - HashiCorp Vault
# - GitGuardian for scanning
```

## Security Best Practices

✅ **DO:**
- Store secrets in environment variables
- Use strong, random values (min 32 characters)
- Rotate keys regularly
- Use HTTPS URLs
- Different keys per environment

❌ **DON'T:**
- Commit .env files to git
- Use same keys across environments
- Share secrets via email/chat
- Use predictable values
- Hardcode secrets in code

## Monitoring Environment Variables

```bash
# Check if required variables are set (no-op, just for reference)
# This is a checklist, not actual code

- NODE_ENV ✓
- MONGODB_URI ✓
- REDIS_HOST ✓
- JWT_SECRET ✓
- SENDGRID_API_KEY ✓
- OPENAI_API_KEY ✓
- STRIPE_SECRET_KEY ✓
- SENTRY_DSN ✓
- AWS_ACCESS_KEY_ID ✓
- AWS_SECRET_ACCESS_KEY ✓
```

## Troubleshooting

**Issue: "Cannot connect to MongoDB"**
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Issue: "Redis connection refused"**
- Check `REDIS_HOST` and `REDIS_PORT`
- Verify Redis is running locally
- Check firewall rules for cloud Redis

**Issue: "OpenAI API errors"**
- Verify `OPENAI_API_KEY` is valid
- Check API rate limits
- Ensure API has sufficient credits

**Issue: "Stripe webhook failures"**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL is public
- Ensure TLS certificate is valid
