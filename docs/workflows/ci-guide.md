

# 🧾 Hatchgrid CI/CD Workflow Guide

This guide describes how the GitHub Actions workflows are configured for Hatchgrid and how to maintain or extend them.

---

## 📋 Workflow Overview

### Main Workflows
- **Monorepo CI** (`monorepo-ci.yml`) - Main continuous integration pipeline
- **Backend CI** (`backend-ci.yml`) - Backend-specific CI (Kotlin/Java)
- **Frontend CI** (`frontend-ci.yml`) - Frontend-specific CI (Node.js/TypeScript)
- **Deploy** (`deploy.yml`) - Deployment pipeline to different environments

### Support Workflows
- **Cleanup Cache** (`cleanup-cache.yml`) - Automatic cache cleanup
- **Issue Labeler** (`issue-labeler.yml`) - Automatic issue labeling
- **Semantic PR** (`semantic-pull-request.yml`) - PR title validation
- **Test PNPM** (`test-pnpm.yml`) - PNPM configuration testing

---

## 🔄 Monorepo CI Workflow

**File**: `.github/workflows/monorepo-ci.yml`

### Triggers
- Push to `main` (excludes markdown files and specific workflows)
- Pull requests (excludes markdown files and specific workflows)
- Manual execution with environment selection

### Main Jobs

#### 1. `labeler`
- Automatically labels PRs based on modified paths
- Uses `actions/labeler@v5`

#### 2. `codeql-analysis`
- Security analysis with CodeQL
- Languages: `javascript`, `kotlin`
- Uploads results to GitHub Security

#### 3. `super-linter`
- Code validation with multiple linters
- Configured with `VALIDATE_ALL_CODEBASE: true`

#### 4. `dependency-review`
- Scans PRs for dependency vulnerabilities
- Automatically comments on PRs

#### 5. `owasp-dependency-check`
- OWASP security analysis
- Fails if vulnerabilities with CVSS ≥ 7 are found
- Generates HTML report as artifact

#### 6. `backend` and `frontend`
- Runs delegated backend and frontend workflows
- Runs in parallel to optimize time

#### 7. `integration`
- Runs after backend and frontend
- Downloads artifacts from both
- Executes `./gradlew integrationTest`
- Uploads integration reports

### Concurrency
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## 🏗️ Backend CI Workflow

**File**: `.github/workflows/backend-ci.yml`

### Triggers
- Changes in `server/**`, `shared/**`, Gradle files
- Push to `main` and pull requests

### Jobs

#### 1. `lint` - Detekt with Reviewdog
- Runs static analysis with Detekt
- Uses Reviewdog for PR comments
- Generates SARIF reports

#### 2. `build` - Build and Test
- Compiles with Gradle (`./gradlew build -x test`)
- Runs tests (`./gradlew test`)
- Publishes test results
- Uploads coverage to Codecov (Kover)
- Generates artifacts (JARs and reports)

### Environment Variables
- `NVD_API_KEY` - For vulnerability analysis

---

## 🎨 Frontend CI Workflow

**File**: `.github/workflows/frontend-ci.yml`

### Triggers
- Changes in `client/**`, Node.js configuration files
- Push to `main` and pull requests

### Jobs

#### 1. `lint` - Biome with Reviewdog
- Linting with Biome
- Automatic PR comments via Reviewdog
- Configured to fail on errors

#### 2. `build` - Build
- Compiles frontend applications (`pnpm build`)
- Uploads build artifacts

#### 3. `test` - Test
- Runs tests (`pnpm test`)
- Uploads coverage to Codecov

---

## 🚀 Deploy Workflow

**File**: `.github/workflows/deploy.yml`

### Triggers
- Manual with environment selection (development, staging, production)
- Push to `main` → automatic deployment to development
- Tags `v*` → automatic deployment to production

### Jobs

#### 1. `determine-environment`
- Determines deployment environment based on trigger

#### 2. `build-backend`
- Compiles backend with Gradle
- Builds and pushes Docker image
- Scans image with Trivy
- Uploads security results

#### 3. `build-frontend`
- Compiles frontend with pnpm
- Builds and pushes Docker image
- Scans image with Trivy
- Uploads security results

#### 4. `deploy`
- Configures kubectl
- Updates Kubernetes manifests
- Deploys to Kubernetes
- Waits for deployment confirmation

### Concurrency
```yaml
concurrency:
  group: deploy-${{ github.ref_name }}-${{ inputs.environment || 'development' }}
  cancel-in-progress: false
```

---

## 🛠️ Support Workflows

### Cleanup Cache
- Runs when a PR is closed
- Automatically cleans branch caches
- Uses GitHub CLI for cache management

### Issue Labeler
- Automatically labels issues when opened or edited
- Configuration in `.github/issue-labeler-config.yml`

### Semantic Pull Request
- Validates PR titles according to Conventional Commits
- Automatically comments if title is invalid
- Removes comments when corrected

### Test PNPM
- Test workflow for PNPM configuration
- Manual execution only
- Verifies installation and configuration

---

## 📦 Caching Strategy

### Gradle Cache
```yaml
path: |
  ~/.gradle/caches
  ~/.gradle/wrapper
key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

### PNPM Cache
```yaml
path: ~/.pnpm-store
key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

---

## 🔧 Extensions and Maintenance

### Add new language to CodeQL
```yaml
matrix:
  language: [ 'javascript', 'kotlin', 'java' ]
```

### Configure notifications
- Slack: `slackapi/slack-github-action`
- Discord: custom webhook
- Teams: `skitionek/notify-microsoft-teams`

### Update action versions
- Use specific versions with SHA hash
- Review regularly with Dependabot
- Test in development environment first

---

## 🔒 Security

### Minimal Permissions
- Each workflow has specific minimal permissions
- `contents: read` by default
- Additional permissions only when necessary

### Security Scanning
- CodeQL for static analysis
- OWASP Dependency Check for dependencies
- Trivy for Docker images
- Dependency Review for PRs

### Required Secrets
- `CODECOV_TOKEN` - For uploading coverage
- `NVD_API_KEY` - For vulnerability analysis
- `KUBECONFIG` - For Kubernetes deployments

---
