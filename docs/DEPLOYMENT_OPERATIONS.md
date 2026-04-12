# Production Deployment & Operations Guide

## Pre-Deployment Checklist

### Security Verification (CRITICAL)

```
AUTHENTICATION & AUTHORIZATION
☑ All endpoints require JWT authentication
☑ Refresh token rotation implemented
☑ Rate limiting configured (1000 req/hour per user)
☑ CORS whitelist configured for production domains
☑ HTTPS/TLS enforced on all endpoints
☑ API keys rotated and stored in secrets manager
☑ Sensitive data redacted from logs

DATABASE & DATA
☑ Database encryption enabled at rest
☑ Database backups automated (daily)
☑ Backup encryption enabled
☑ Point-in-time recovery tested
☑ Database connection pooling optimized
☑ Read replicas configured for HA
☑ Sharding plan documented for future scaling

SECRETS MANAGEMENT
☑ All secrets in AWS Secrets Manager
☑ No secrets in code or git history
☑ Secret rotation policy documented
☑ Access logs enabled for secret access
☑ Audit trail configured

NETWORK SECURITY
☑ VPC configured with public/private subnets
☑ Security groups restrict traffic
☑ Network ACLs properly configured
☑ WAF rules configured
☑ DDoS protection enabled (CloudFlare/AWS Shield)
☑ API Gateway rate limiting enabled
```

### Performance Verification

```
CACHING & OPTIMIZATION
☑ Redis cluster configured with HA
☑ Cache invalidation strategy tested
☑ Database indexes reviewed and optimized
☑ API response times < 200ms (p95)
☑ Database queries < 100ms (p95)
☑ Bundle size optimized (frontend < 500KB)
☑ Images optimized and served via CDN
☑ Gzip compression enabled
☑ Connection pooling configured

SCALABILITY
☑ Auto-scaling policies configured
☑ Load balancer health checks enabled
☑ Graceful shutdown implemented
☑ Connection draining configured (30s)
☑ Horizontal scaling tested (minimum 3 replicas)
☑ Database sharding plan documented
```

### Reliability & Compliance

```
MONITORING & ALERTING
☑ Sentry configured for error tracking
☑ DataDog/New Relic APM enabled
☑ Custom dashboards created
☑ Alert thresholds set for critical metrics
☑ On-call rotation established
☑ Incident response plan documented
☑ Postmortem process defined

LOGGING & AUDIT
☑ ELK stack deployed (or CloudWatch)
☑ Structured logging implemented
☑ Audit logs for sensitive operations
☑ Log retention policy enforced (90 days)
☑ Log analysis rules configured
☑ SIEM integration (if applicable)

COMPLIANCE
☑ GDPR compliance verified
☑ CCPA compliance verified
☑ Privacy policy published
☑ Terms of Service published
☑ Cookie consent implemented
☑ Data export functionality working
☑ Account deletion working
☑ PII not logged in info/debug levels
```

### Testing & Validation

```
TESTING COVERAGE
☑ Unit tests: 80%+ coverage
☑ Integration tests: All critical flows
☑ E2E tests: All main user flows
☑ Load testing: 1000+ concurrent users
☑ Security testing: OWASP Top 10
☑ Accessibility testing: WCAG 2.1 AA
☑ Cross-browser testing: Chrome, Firefox, Safari

API TESTING
☑ All endpoints tested
☑ Error responses tested
☑ Rate limiting tested
☑ Authorization tested
☑ Input validation tested
☑ Pagination tested
☑ Sorting/filtering tested

DEPLOYMENT TESTING
☑ Deployment script tested in staging
☑ Rollback procedure tested
☑ Database migration tested
☑ Zero-downtime deployment verified
```

---

## Step-by-Step Deployment Process

### Phase 1: Pre-Deployment (1 week before)

**1. Infrastructure Preparation**

```bash
# Provision AWS resources
terraform apply -target=aws_rds_cluster.mongodb_prod
terraform apply -target=aws_elasticache_cluster.redis_prod
terraform apply -target=aws_alb.main
terraform apply -target=aws_ecs_cluster.production

# Verify resources
aws rds describe-db-clusters --db-cluster-identifier taskmanager-prod
aws elasticache describe-cache-clusters --cache-cluster-id taskmanager-redis-prod
```

**2. Database Preparation**

```bash
# Create production database
mongo "mongodb+srv://prod_user@cluster-prod.mongodb.net/admin" \
  --eval "db.createUser({
    user: 'taskmanager_app',
    pwd: '<<SECURE_PASSWORD>>',
    roles: ['readWrite']
  })"

# Verify connection
mongo "mongodb+srv://taskmanager_app:password@cluster-prod.mongodb.net/taskmanager" \
  --eval "db.adminCommand('ping')"

# Create indexes
npm run create-indexes -- --env=production
```

**3. Certificate & Domain Setup**

```bash
# Create SSL certificate
aws acm request-certificate \
  --domain-name taskmanager.com \
  --domain-name "*.taskmanager.com" \
  --validation-method DNS

# Verify DNS records
dig taskmanager.com
dig api.taskmanager.com
dig app.taskmanager.com

# Update DNS with ACM validation records
```

**4. Load Testing**

```bash
# Run load tests with k6
# Load test script: k6-load-tests.js
k6 run --vus 100 --duration 5m k6-load-tests.js

# Monitor metrics during load test
# Expected: P95 response time < 200ms, error rate < 0.1%
```

### Phase 2: Staging Validation (3 days before)

**1. Deploy to Staging**

```bash
# Build Docker images
docker build -t task-manager-backend:1.0.0 ./backend
docker build -t task-manager-frontend:1.0.0 ./frontend

# Push to registry
docker tag task-manager-backend:1.0.0 \
  123456789.dkr.ecr.us-east-1.amazonaws.com/task-manager-backend:1.0.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/task-manager-backend:1.0.0

# Deploy to staging ECS
aws ecs update-service \
  --cluster task-manager-staging \
  --service task-manager-backend \
  --force-new-deployment

# Monitor deployment
aws ecs describe-services \
  --cluster task-manager-staging \
  --services task-manager-backend
```

**2. Smoke Tests**

```bash
# Test critical endpoints
curl -H "Authorization: Bearer $TEST_TOKEN" \
  https://api-staging.taskmanager.com/api/v1/tasks

# Test user flow end-to-end
npx cypress run --env api_url=https://api-staging.taskmanager.com

# Monitor logs
aws logs tail /aws/ecs/task-manager-staging --follow
```

**3. Performance Validation**

```bash
# Check metrics in DataDog
datadog query \
  "avg:trace.web.request.duration{service:task-manager}" \
  count_for_percentile[0.95]

# Target: < 200ms P95
```

**4. Security Scanning**

```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api-staging.taskmanager.com

# Trivy vulnerability scan
trivy image 123456789.dkr.ecr.us-east-1.amazonaws.com/task-manager-backend:1.0.0
```

### Phase 3: Production Deployment (Deployment Day)

**1. Backup Everything**

```bash
# Backup MongoDB
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/taskmanager" \
  --archive=taskmanager-backup.archive --gzip

# Backup Redis
redis-cli --rdb /backups/redis-dumps.rdb

# Verify backups
ls -lh /backups/
```

**2. Canary Deployment (10% traffic)**

```bash
# Update load balancer to route 10% to new version
aws elbv2 modify-listener-rules \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --rules "Type=forward,TargetGroups=[{TargetGroupArn=arn:...,Weight=10}]"

# Monitor error rates
watch -n 5 'aws cloudwatch get-metric-statistics \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --start-time $(date -d "5 minutes ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum'

# Wait 30 minutes, observe metrics
# If OK, proceed to next phase
```

**3. Gradual Rollout (50% traffic)**

```bash
# Increase to 50%
aws elbv2 modify-listener-rules \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --rules "Type=forward,TargetGroups=[{TargetGroupArn=arn:...,Weight=50}]"

# Monitor for 1 hour
```

**4. Full Rollout (100% traffic)**

```bash
# Complete rollout
aws elbv2 modify-listener-rules \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --rules "Type=forward,TargetGroups=[{TargetGroupArn=arn:...,Weight=100}]"

# Verify all services
curl -f https://api.taskmanager.com/health
curl -f https://taskmanager.com/
```

### Phase 4: Post-Deployment Verification (1 week)

**1. Monitoring & Alerts**

```bash
# Check Sentry for errors
# Target: Error rate < 0.1%

# Check DataDog metrics
# Target: P95 latency < 200ms, Apdex score > 0.95

# Check application logs
aws logs tail /aws/ecs/task-manager-prod --follow --since 1h
```

**2. User Testing**

```
FUNCTIONALITY
☑ Create task and verify XP awarded
☑ Delete task and verify removal
☑ Update task priority
☑ Mark task complete
☑ Create team and invite member
☑ Use voice input for task creation
☑ Generate AI suggestions
☑ Filter and sort tasks
☑ View analytics dashboard
☑ Process payment subscription
```

**3. Performance Validation**

```
METRICS TO VERIFY
☑ API response times < 200ms (P95)
☑ Database query times < 100ms (P95)
☑ Error rate < 0.1%
☑ Cache hit ratio > 80%
☑ CPU usage < 70%
☑ Memory usage < 75%
☑ Network bandwidth within limits
☑ Queue processing lag < 1 minute
```

**4. Security Verification**

```bash
# Verify SSL/TLS
openssl s_client -connect api.taskmanager.com:443 -tls1_2

# Verify security headers
curl -I https://api.taskmanager.com | grep -i security

# Check authentication
curl -X POST https://api.taskmanager.com/api/v1/tasks \
  2>&1 | grep -i unauthorized
```

---

## Rollback Procedure

If something goes wrong:

```bash
# 1. ALERT - Notify team
echo "INCIDENT: Production deployment issue detected"

# 2. PAUSE - Stop current deployment
aws elbv2 modify-listener-rules \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --rules "Type=forward,TargetGroups=[{TargetGroupArn=arn-old,Weight=100}]"

# 3. VERIFY - Check rollback status
for i in {1..10}; do
  curl -f https://api.taskmanager.com/health && break
  sleep 5
done

# 4. COMMUNICATE - Update status
slack-notify "Rolled back to previous version. Issue: ..."

# 5. ROOT CAUSE - Investigate
# - Check logs in Sentry
# - Check metrics in DataDog
# - Check application logs in CloudWatch
```

---

## Monitoring During First 24 Hours

**Every 30 minutes:**
- Error rate (should be < 0.1%)
- API latency P95 (should be < 200ms)
- Database query times
- Cache hit ratio
- Active users
- Payment processing success rate

**Every hour:**
- Memory usage trends
- CPU usage trends
- Disk I/O patterns
- Network bandwidth usage
- Queue job backlog

**Every 4 hours:**
- Database replication lag
- Failed login attempts
- Rate limit hits
- Slow query logs

---

## Incident Response

**If error rate exceeds 1%:**

```bash
# 1. Assess severity
ERROR_RATE=$(aws cloudwatch get-metric-statistics --metric-name HTTPCode_Target_5XX_Count ...)

# 2. Check recent changes
git log --oneline -10 --since="1 hour ago"

# 3. View recent logs
aws logs tail /aws/ecs/task-manager-prod --follow --since 30m | grep ERROR

# 4. Decide: Rollback or Fix
# If critical: Rollback immediately
# If minor: Apply fix with canary deployment
```

---

## Post-Deployment Success Criteria

✅ All automated tests pass
✅ Error rate < 0.1% for 24 hours
✅ API latency P95 < 200ms for 24 hours
✅ No customer complaints in first 24 hours
✅ Database replication healthy
✅ Backup jobs completed successfully
✅ All alerts configured and working
✅ Monitoring dashboards showing normal patterns

---

## Next Steps After Successful Deployment

1. **Documentation Update**
   - Update deployment docs with lessons learned
   - Document any issues encountered
   - Update runbooks

2. **Performance Analysis**
   - Collect 1-week of performance data
   - Identify optimization opportunities
   - Plan Phase 2 improvements

3. **Team Debrief**
   - Document lessons learned
   - Update deployment playbook
   - Schedule training on new features

4. **Plan Next Release** 
   - Begin Phase 2 development
   - Prioritize feature requests
   - Plan performance optimizations
