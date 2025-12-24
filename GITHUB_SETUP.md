# GitHub Repository Setup Guide

## Step 1: Initialize Git Repository

```bash
# Navigate to project directory
cd /path/to/kvs-scuba-maldivi

# Initialize git (if not already done)
git init

# Check git status
git status
```

## Step 2: Create .gitignore

The project should already have `.gitignore`. Verify it includes:

```
# Dependencies
node_modules/
npm-debug.log
yarn-error.log
package-lock.json  # Optional: usually include

# Environment variables
.env.local
.env.*.local
.env.production.local

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
VS Code/.

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
logs/
*.log

# Temporary
temp/
*.tmp
.cache/
```

## Step 3: Add Remote Repository

```bash
# Add GitHub remote
git remote add origin https://github.com/IDSS123a/maldives-adventure-hub.git

# Verify remote added
git remote -v
```

## Step 4: Initial Commit

```bash
# Stage all files
git add .

# Commit
git commit -m "Initial commit: Production-ready deployment"

# View commit
git log --oneline -1
```

## Step 5: Create and Push Branches

```bash
# Create main branch (if not default)
git checkout -b main

# Push to GitHub
git push -u origin main

# Verify
git branch -a
```

## Step 6: GitHub Repository Configuration

### 6.1 Repository Settings

Go to: `https://github.com/IDSS123a/maldives-adventure-hub/settings`

#### General Settings
- [ ] **Repository name:** maldives-adventure-hub
- [ ] **Description:** Production-ready SPA for expedition access requests
- [ ] **Public:** Yes (make repo visible)
- [ ] **Include in search:** Checked
- [ ] **Sponsorships:** Not needed

#### Features
- [ ] **Wikis:** Disabled
- [ ] **Issues:** Enabled
- [ ] **Discussions:** Disabled
- [ ] **Projects:** Enabled (optional)
- [ ] **Deployments:** Enabled

### 6.2 Branch Protection Rules

Go to: `Settings` → `Branches` → `Branch protection rules`

Click **Add rule** for branch `main`:

```
✓ Require a pull request before merging
  └─ Require approvals: 1

✓ Require status checks to pass before merging
  └─ Require branches to be up to date before merging
  └─ Select required checks:
     └─ build-and-test (from GitHub Actions)

✓ Require code reviews from code owners
  └─ Required number of reviews: 1
  └─ Dismiss stale pull request approvals: Checked

✓ Require status checks to pass before merging
  └─ Require conversations be resolved before merging

✓ Include administrators
  └─ Enforce all above rules on administrators
```

### 6.3 GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

Add these secrets for CI/CD deployment:

```
VITE_SUPABASE_URL                [Your Supabase Project URL]
VITE_SUPABASE_ANON_KEY           [Your Supabase Anon Key]
VITE_GOOGLE_CLIENT_ID            [Your Google OAuth Client ID]

DEPLOY_HOST                       [your-server.com]
DEPLOY_PORT                       [22]
DEPLOY_USER                       [deploy-user]
DEPLOY_KEY                        [SSH Private Key]

SLACK_WEBHOOK                     [Slack Webhook URL - optional]
```

**How to generate SSH keys:**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# Private key (DEPLOY_KEY):
cat deploy_key  # Add to GitHub Secrets

# Public key (add to server):
cat deploy_key.pub >> ~/.ssh/authorized_keys
```

### 6.4 Collaborators & Teams

Go to: `Settings` → `Collaborators and teams`

- [ ] Add team members as collaborators
- [ ] Set appropriate permissions (Admin/Write/Read)
- [ ] Enable 2FA for all contributors

### 6.5 Webhooks (Optional)

Go to: `Settings` → `Webhooks`

Add webhook for Slack notifications:
- Payload URL: Your Slack Webhook URL
- Content type: application/json
- Events: Push, Pull requests, Issues
- Active: Checked

## Step 7: Add Documentation Files

The project already has deployment documentation. Ensure these exist in root:

- [x] `README.md` - Project overview
- [x] `DEPLOYMENT_README.md` - How to use and deploy
- [x] `DEPLOYMENT_PREPARATION.md` - Complete setup guide
- [x] `DEPLOYMENT_CHECKLIST.md` - Pre/during/post deployment
- [ ] Create `CONTRIBUTING.md` - How to contribute

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Maldives Adventure Hub

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/maldives-adventure-hub.git`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Make changes
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open Pull Request

## Code Standards

- Use TypeScript for type safety
- Follow existing code style
- Run `npm run lint` before committing
- Write clear commit messages
- Test thoroughly

## Testing

```bash
npm run build  # Ensure production build works
npm run lint   # Check TypeScript
```

## Pull Request Process

1. Update README.md if needed
2. Ensure all tests pass
3. Add description of changes
4. Request review from maintainers
5. Address any feedback
6. Get approval before merge

## License

By contributing, you agree code is licensed under project license.
```

## Step 8: Setup Deployment Workflow

GitHub Actions workflow is already created at `.github/workflows/deploy.yml`

Verify it exists and is configured:

```bash
ls -la .github/workflows/deploy.yml
```

This workflow:
- Runs on every push to `main`
- Builds application
- Runs tests
- Deploys to production server (if secrets configured)

## Step 9: Create Issue Templates

Go to: `Settings` → `Features` → `Manage Issues and PR templates`

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
## Describe the Bug

[Clear description of the bug]

## Steps to Reproduce

1. Go to...
2. Click on...
3. See error...

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Screenshots

[If applicable]

## Environment

- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- App Version: [e.g., 1.0.0]

## Additional Context

[Any other context]
```

## Step 10: First Push

```bash
# Ensure all changes are committed
git status

# If clean:
git push origin main

# Verify on GitHub
# Go to: https://github.com/IDSS123a/maldives-adventure-hub
```

## Step 11: Configure GitHub Pages (Optional)

To host documentation site:

Go to: `Settings` → `Pages`

```
Source: Deploy from a branch
Branch: main
Folder: /docs (if you have docs folder)
```

Then visit: `https://IDSS123a.github.io/maldives-adventure-hub`

## Step 12: Add Topics

Go to: Repository page → About section → Edit

Add topics:
- react
- typescript
- vite
- supabase
- expedition-management
- scuba-diving

## Step 13: Setup Status Badge

Add to `README.md`:

```markdown
[![Deploy to Production](https://github.com/IDSS123a/maldives-adventure-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/IDSS123a/maldives-adventure-hub/actions/workflows/deploy.yml)
```

## Step 14: Verify Everything Works

### Test the GitHub Actions Workflow:

1. Make a small change to a file
2. Commit and push to a feature branch
3. Open Pull Request
4. Watch GitHub Actions run (Actions tab)
5. If all checks pass, merge to main
6. Verify deployment workflow runs

### Expected Results:
- ✅ Code builds successfully
- ✅ TypeScript compiles
- ✅ GitHub Actions completes
- ✅ If secrets configured, deployment runs

## Step 15: Team Documentation

Create a team wiki or docs:

Go to: `Settings` → `Manage Access` → Add team documentation

Document:
- [ ] Development setup instructions
- [ ] How to deploy
- [ ] Code review guidelines
- [ ] Release process
- [ ] Troubleshooting guide

## Continuous Integration / Continuous Deployment (CI/CD)

Your GitHub Actions workflow provides:

### On Every Push to main:
1. ✅ Installs dependencies
2. ✅ Runs TypeScript type checking
3. ✅ Builds production bundle
4. ✅ Checks bundle size
5. ✅ (If secrets set) Deploys to server
6. ✅ (If Slack configured) Sends notification

### To Enable Deployment:

Set GitHub Secrets:
```
DEPLOY_HOST         = your-server-ip-or-domain
DEPLOY_USER         = deploy
DEPLOY_KEY          = SSH private key
DEPLOY_PORT         = 22
```

Then pushes to `main` will automatically deploy!

## Troubleshooting

### GitHub Actions Failing?

1. Check `.github/workflows/deploy.yml` exists
2. View workflow in Actions tab
3. Check for error messages
4. Verify secrets are set
5. Ensure Node.js version is 18+

### Deployment Not Running?

- Verify you pushed to `main` branch
- Check GitHub Secrets are configured
- View Actions logs for details
- SSH into server and check manually

### Build Fails?

```bash
# Test build locally
npm install
npm run build

# Check for errors
npm run lint
```

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Configure branch protection
3. ✅ Add GitHub Secrets for deployment
4. ✅ Test GitHub Actions workflow
5. ✅ Configure server for automated deployment
6. ✅ Monitor deployments

---

**Repository URL:** https://github.com/IDSS123a/maldives-adventure-hub  
**Status:** Ready for team collaboration  
**Last Updated:** December 23, 2025
