# 📋 Deployment Checklist & Timeline

**Project:** Maldives Adventure Hub  
**Deployment Date:** [PLANNED_DATE]  
**Environment:** Production  
**Deployed By:** [YOUR_NAME]  
**Reviewed By:** [REVIEWER_NAME]

---

## Pre-Deployment Phase (2 Weeks Before)

### Week 1: Planning & Preparation

- [ ] **Schedule deployment** - Choose date and time (avoid peak hours)
- [ ] **Notify stakeholders** - Inform team of deployment window
- [ ] **Create backup** - Full database and code backup
- [ ] **Test backup restore** - Verify backup can be restored
- [ ] **Reserve downtime** - If needed (typically 5-15 minutes)
- [ ] **Prepare rollback plan** - Document rollback steps

### Code Review & Testing

- [ ] **Final code review** - All PRs reviewed and merged
- [ ] **Run full test suite** - All tests passing
- [ ] **TypeScript compilation** - No errors: `npm run lint`
- [ ] **Production build test** - `npm run build` succeeds
- [ ] **Security audit** - No sensitive data in code
- [ ] **Check bundle size** - Verify < 1MB gzipped
- [ ] **Performance test** - Lighthouse score > 90
- [ ] **Cross-browser test** - Chrome, Firefox, Safari, Edge

### Environment Preparation

- [ ] **Obtain all API keys** - Supabase, Google OAuth, etc.
- [ ] **Verify SSL certificate** - Valid and not expired
- [ ] **DNS records ready** - Pointing to correct server
- [ ] **Email configured** - For notifications (if using)
- [ ] **Monitoring setup** - Sentry, LogRocket, etc.
- [ ] **Backup services active** - Automated daily backups

### Server Preparation

- [ ] **SSH key configured** - Access to deployment server
- [ ] **Docker installed** - Latest stable version
- [ ] **Docker Compose installed** - Latest version
- [ ] **Nginx installed** - Reverse proxy ready (optional)
- [ ] **Firewall rules updated** - Ports 80, 443 open
- [ ] **Disk space sufficient** - At least 5GB free
- [ ] **Memory sufficient** - At least 2GB RAM available
- [ ] **Port 3000 free** - Not used by other services

### Documentation

- [ ] **Deployment guide prepared** - Steps documented
- [ ] **Rollback plan written** - If deployment fails
- [ ] **Emergency contacts listed** - Who to call if issues
- [ ] **Runbooks created** - For common problems
- [ ] **README updated** - With deployment info

---

## Deployment Day (Morning of Deployment)

### Pre-Deployment Checks (4 Hours Before)

- [ ] **Final code review** - Last-minute changes reviewed
- [ ] **Create database backup** - Right before deployment
- [ ] **Verify all environment variables** - Set correctly
- [ ] **Check server resources** - CPU, memory, disk usage
- [ ] **Verify internet connectivity** - Stable connection
- [ ] **Prepare communication** - Status page, team chat ready
- [ ] **Test deployment process** - Run through steps once
- [ ] **Verify monitoring alerts** - All systems monitoring

### Immediate Pre-Deployment (30 Minutes Before)

- [ ] **Announce maintenance window** - If applicable
- [ ] **Enable maintenance mode** - Redirect users (optional)
- [ ] **Pause automated jobs** - If any scheduled tasks
- [ ] **Final database backup** - Last backup before deploy
- [ ] **Disable auto-scaling** - If using load balancers
- [ ] **Verify team is ready** - Everyone on call
- [ ] **Test communication** - Can everyone be reached?
- [ ] **Screenshot current state** - For comparison

---

## Deployment Phase (During Deployment)

### Step 1: Pull Latest Code (5 minutes)

```bash
cd ~/apps/maldives-hub
git pull origin main
git log --oneline -1  # Verify correct commit
```

**Verification:**
- [ ] Correct commit SHA matches expected version
- [ ] No merge conflicts
- [ ] All files present

### Step 2: Install Dependencies (5 minutes)

```bash
npm ci  # Use ci for exact versions
npm list --depth=0  # Verify dependencies
```

**Verification:**
- [ ] No vulnerabilities (npm audit)
- [ ] All required packages installed
- [ ] Correct versions match package-lock.json

### Step 3: Build Production Bundle (10 minutes)

```bash
npm run build
ls -lah dist/  # Verify build output
```

**Verification:**
- [ ] No build errors
- [ ] dist/ folder created with files
- [ ] CSS files present
- [ ] JavaScript bundles present
- [ ] Source maps included (optional)

### Step 4: Set Environment Variables (5 minutes)

```bash
# Copy and update .env file
cp .env.example .env
# Edit .env with production values
nano .env  # or your preferred editor

# Verify variables set
env | grep VITE_
```

**Verification:**
- [ ] VITE_SUPABASE_URL set
- [ ] VITE_SUPABASE_ANON_KEY set
- [ ] VITE_GOOGLE_CLIENT_ID set
- [ ] No empty required variables

### Step 5: Stop Old Container (2 minutes)

```bash
docker-compose down
docker ps  # Verify no containers running
```

**Verification:**
- [ ] All containers stopped
- [ ] No port 3000 in use
- [ ] Clean state

### Step 6: Build Docker Image (10 minutes)

```bash
docker build -t maldives-hub:latest .
docker images maldives-hub:latest
```

**Verification:**
- [ ] Image built successfully
- [ ] Tagged as 'latest'
- [ ] Image size reasonable (~200MB)

### Step 7: Start New Container (2 minutes)

```bash
docker-compose up -d
sleep 5  # Wait for startup
docker ps  # Verify running
```

**Verification:**
- [ ] Container is running
- [ ] Port 3000 is listening
- [ ] Health check passing

### Step 8: Verify Deployment (5 minutes)

```bash
# Health check
curl -i http://localhost:3000

# Check logs
docker logs maldives-hub-app

# Verify Supabase connection
# (Check for "Connected to Supabase" in logs)
```

**Verification:**
- [ ] HTTP 200 response
- [ ] No error logs
- [ ] Database connection successful
- [ ] Assets loading

### Step 9: Production Smoke Tests (5 minutes)

```bash
# Test main page loads
curl -s http://localhost:3000 | grep -q "<!DOCTYPE"

# Test API connectivity
# Try accessing restricted endpoints - should not error
```

**Verification:**
- [ ] Main page loads
- [ ] No 500 errors
- [ ] CSS/JS assets loading
- [ ] No console errors (check browser)

### Step 10: DNS & SSL Verification (5 minutes)

```bash
# Test via domain (if DNS already switched)
curl -I https://yourdomain.com
```

**Verification:**
- [ ] HTTPS 200 response
- [ ] Valid SSL certificate
- [ ] Redirects from HTTP to HTTPS

---

## Post-Deployment Phase (First 24 Hours)

### Immediate Post-Deployment (Within 1 Hour)

- [ ] **Disable maintenance mode** - Users can access app
- [ ] **Monitor error logs** - Check for issues
- [ ] **Check error tracking** - Sentry/LogRocket for errors
- [ ] **Verify user logins** - Test Google OAuth
- [ ] **Test key workflows** - Access request form, etc.
- [ ] **Check performance metrics** - Load times reasonable
- [ ] **Monitor API calls** - Supabase queries working
- [ ] **Announce deployment complete** - Notify team

### First 4 Hours

- [ ] **Monitor application** - Watch for errors
- [ ] **Check database queries** - Supabase Dashboard
- [ ] **Review error logs** - Any warnings?
- [ ] **Monitor server resources** - CPU, memory, disk
- [ ] **Check network connectivity** - No latency issues
- [ ] **Verify backups running** - Automated backups working
- [ ] **Test all key features** - Document any issues
- [ ] **Customer communications** - Update if incidents

### First 24 Hours

- [ ] **Continuous monitoring** - Alerts configured
- [ ] **Error tracking review** - Any patterns?
- [ ] **Performance metrics** - Within acceptable ranges
- [ ] **Database size check** - Not growing unexpectedly
- [ ] **User feedback check** - Any reported issues?
- [ ] **Log analysis** - Review for anomalies
- [ ] **Security audit** - No suspicious access
- [ ] **Update documentation** - If anything changed

---

## Rollback Procedures

### If Critical Error Occurs

**Immediate Actions (< 5 minutes):**

```bash
# 1. Enable maintenance mode
touch ~/apps/maldives-hub/MAINTENANCE

# 2. Stop new container
docker-compose down

# 3. Verify old container is available
docker ps -a | grep maldives-hub

# 4. Restore database (if data modified)
# From backup created before deployment
supabase db restore --project-id xxxx --backup-id xxxx
```

**Verification:**
- [ ] Error message shows to users
- [ ] New container stopped
- [ ] Old version still available
- [ ] Database restored to pre-deployment state

### Rollback Decision Tree

```
ERROR DETECTED
│
├─ Deployment just happened?
│  └─ YES → Proceed with rollback
│
├─ Application not starting?
│  └─ Check Docker logs
│     ├─ Out of memory? → Increase resource limits
│     ├─ Missing env var? → Add to .env
│     └─ Build error? → Fix code and rebuild
│
├─ Cannot connect to database?
│  └─ Check Supabase dashboard
│     ├─ Service down? → Wait or switch to backup
│     ├─ Connection limit? → Restart container
│     └─ Network issue? → Check firewall
│
├─ Performance degraded?
│  └─ Load test the app
│     ├─ High load? → Scale horizontally
│     ├─ Database slow? → Check queries
│     └─ Sustained? → Rollback if unacceptable
│
└─ Users reporting issues?
   └─ Collect details
      ├─ Widespread? → Rollback
      ├─ Few users? → Investigate
      └─ Expected behavior? → Proceed
```

### Full Rollback Steps

**If rollback necessary:**

```bash
# 1. Announce rollback
# → Notify team, status page, customers

# 2. Stop current version
docker-compose down

# 3. Checkout previous version
git checkout HEAD~1  # Go back one commit

# 4. Restore database (if needed)
# Use backup from before deployment

# 5. Rebuild and restart with previous version
npm ci
npm run build
docker build -t maldives-hub:rollback .
docker-compose up -d

# 6. Verify previous version
curl -i http://localhost:3000
```

**Verification:**
- [ ] Previous version is running
- [ ] Database restored to known good state
- [ ] Users can access application
- [ ] Error logs show recovery

**After successful rollback:**
- [ ] Post-mortem scheduled
- [ ] Root cause analysis started
- [ ] Changes reverted in code
- [ ] Tests added to prevent similar issues
- [ ] Team debriefing scheduled

---

## Monitoring Checklist (First 7 Days)

### Daily (First 3 Days)

- [ ] **Check error logs** - Any new issues?
- [ ] **Review performance** - Load times steady?
- [ ] **Verify backups** - Running automatically?
- [ ] **Monitor resources** - CPU/memory stable?
- [ ] **User feedback** - Any issues reported?
- [ ] **Database size** - Growing as expected?
- [ ] **API quota usage** - Consuming as expected?

### Weekly (Days 4-7)

- [ ] **Performance analysis** - Trends normal?
- [ ] **Error rate review** - Expected levels?
- [ ] **Security audit** - No suspicious access?
- [ ] **Cost analysis** - Within budget?
- [ ] **Feature usage** - Working as expected?
- [ ] **Update documentation** - Capture any learnings

---

## Success Criteria

### Deployment is Successful if:

✅ **Functionality:**
- [ ] All pages load and render correctly
- [ ] Authentication (Google OAuth) works
- [ ] Access request form submits successfully
- [ ] Dashboard displays user data
- [ ] Admin panel functions correctly
- [ ] No 500 errors in logs

✅ **Performance:**
- [ ] Page load time < 3 seconds
- [ ] Time to first paint < 1 second
- [ ] No significant performance degradation
- [ ] API calls respond < 500ms
- [ ] Database queries < 100ms

✅ **Stability:**
- [ ] No crashes or restarts in first 24 hours
- [ ] Error rate < 0.1%
- [ ] No memory leaks detected
- [ ] Connection pool stable
- [ ] No timeout errors

✅ **Security:**
- [ ] HTTPS working with valid certificate
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] Authentication secure
- [ ] SQL injection prevention working

### Deployment Failed if:

❌ Any critical functionality is broken  
❌ Application crashes repeatedly  
❌ Database is inaccessible  
❌ Security vulnerability introduced  
❌ Performance degrades significantly  
❌ Data corruption detected

---

## Post-Deployment Metrics

### Track These Metrics

```
Deployment Time:         [__:__ total]
Build Time:              [__:__ mins]
Startup Time:            [__:__ secs]
First Error Detected:    [__ mins after deployment]
Time to Resolution:      [__ mins]
Downtime (if any):       [__ minutes]
Rollback Time:           [N/A or __ minutes]

Performance Impact:
- Page Load Time:        [__ seconds]
- Time to First Paint:   [__ seconds]
- API Response Time:     [__ ms]

Stability:
- Error Rate:            [___%]
- Uptime:                [___%]
- Crashes:               [__ incidents]

User Impact:
- Reported Issues:       [__ tickets]
- Users Affected:        [__ users]
- Severity:              [Low/Medium/High]
```

### Post-Deployment Report

Create a report including:
1. **Timeline** - Exact timestamps of each step
2. **Issues Encountered** - Any problems and resolutions
3. **Performance Data** - Before/after metrics
4. **User Feedback** - Comments from users
5. **Lessons Learned** - What went well, what to improve
6. **Follow-up Actions** - Any items for future

---

## Emergency Contacts

```
On-Call Engineer:   [NAME] [PHONE]
Team Lead:          [NAME] [PHONE]
Database Admin:     [NAME] [PHONE]
Infrastructure:     [NAME] [PHONE]
Customer Support:   [TEAM] [PHONE/EMAIL]

Escalation:
- 15 min: Notify on-call engineer
- 30 min: Notify team lead
- 45 min: Begin rollback
- 60 min: Notify customers
```

---

## Sign-Off

**Deployment Status:** [ ] Successful [ ] Rolled Back

**Deployment Engineer:**  
Name: ________________  
Signature: ________________  
Date/Time: ________________

**QA Sign-Off:**  
Name: ________________  
Signature: ________________  
Date/Time: ________________

**Team Lead Approval:**  
Name: ________________  
Signature: ________________  
Date/Time: ________________

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Next Review:** [DATE]

