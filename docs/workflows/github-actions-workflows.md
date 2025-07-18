# 🚀 GitHub Actions Workflows - Hatchgrid

This documentation provides a comprehensive overview of all workflows and custom actions in the Hatchgrid monorepo.

---

## 📋 Workflows Index

### 🔄 Main Workflows

- [Monorepo CI](#monorepo-ci) - Main CI/CD pipeline
- [Backend CI](#backend-ci) - Kotlin/Java specific CI
- [Frontend CI](#frontend-ci) - Node.js/TypeScript specific CI
- [Deploy](#deploy) - Deployment to multiple environments

### 🛠️ Support Workflows

- [Cleanup Cache](#cleanup-cache) - Automatic cache management
- [Issue Labeler](#issue-labeler) - Automatic issue labeling
- [Semantic Pull Request](#semantic-pull-request) - PR validation
- [Test PNPM](#test-pnpm) - Configuration verification

### 🔧 Custom Actions

- [Setup Java](#setup-java) - Java and Gradle configuration
- [Setup Node](#setup-node) - Node.js and pnpm configuration
- [Specialized Docker Actions](#specialized-docker-actions) - Specialized Docker actions

---

## 🔄 Monorepo CI

**File**: `.github/workflows/monorepo-ci.yml`

### Description

Main workflow that orchestrates the entire CI/CD process, including security analysis, linting, testing, and integration.

### Triggers

```yaml
on:
  push:
    branches: [ main ]
    paths-ignore: [ '**.md', '.github/workflows/backend-ci.yml', ... ]
  pull_request:
    paths-ignore: [ '**.md', '.github/workflows/backend-ci.yml', ... ]
  workflow_dispatch:
    inputs:
      environment: [ development, staging ]
```

### Executed Jobs

1. **labeler** - Automatic PR labeling
2. **codeql-analysis** - Security analysis (JavaScript, Kotlin)
3. **super-linter** - Code validation with multiple linters
4. **dependency-review** - Dependency review in PRs
5. **owasp-dependency-check** - OWASP vulnerability analysis
6. **backend** - Delegation to backend workflow
7. **frontend** - Delegation to frontend workflow
8. **integration** - Post-build integration tests

### Special Features

- **Concurrency**: Cancels previous runs on the same branch
- **Security**: Multiple layers of security analysis
- **Artifacts**: Generates integration and security reports

---

## 🏗️ Backend CI

**File**: `.github/workflows/backend-ci.yml`

### Description

Specific CI for the backend developed in Kotlin/Java with Gradle.

### Triggers

```yaml
paths:
  - 'server/**'
  - 'shared/**'
  - 'build.gradle.kts'
  - 'settings.gradle.kts'
  - 'gradle/**'
```

### Jobs

#### Lint Job

- **Tool**: Detekt for Kotlin static analysis
- **Integration**: Reviewdog for automatic PR comments
- **Format**: SARIF reports for GitHub Security

#### Build Job

- **Build**: `./gradlew build -x test`
- **Testing**: `./gradlew test`
- **Coverage**: Kover → Codecov
- **Artifacts**: Compiled JARs and test reports

### Environment Variables

- `NVD_API_KEY`: For dependency vulnerability analysis

---

## 🎨 Frontend CI

**File**: `.github/workflows/frontend-ci.yml`

### Description

Specific CI for the frontend developed in Node.js/TypeScript.

### Triggers

```yaml
paths:
  - 'client/**'
  - 'package.json'
  - 'pnpm-lock.yaml'
  - 'pnpm-workspace.yaml'
```

### Jobs

#### Lint Job

- **Tool**: Biome for linting and formatting
- **Integration**: Reviewdog for PR feedback
- **Configuration**: Fails on errors, warnings as suggestions

#### Build Job

- **Command**: `pnpm build`
- **Artifacts**: Compiled applications and landing page

#### Test Job

- **Command**: `pnpm test`
- **Coverage**: LCOV → Codecov

---

## 🚀 Deploy

**File**: `.github/workflows/deploy.yml`

### Description

Deployment pipeline with support for multiple environments and deployment strategies.

### Triggers and Strategies

```yaml
# Manual with environment selection
workflow_dispatch:
  inputs:
    environment: [development, staging, production]

# Automatic based on branch/tag
push:
  branches: [main]     # → development
  tags: ['v*']         # → production
```

### Jobs Pipeline

#### 1. determine-environment

Environment determination logic:

- Manual: Uses user input
- Tag `v*`: production
- Push to main: development

#### 2. build-backend

- Compilation with Gradle
- Docker image build
- Security scanning with Trivy
- Push to GitHub Container Registry

#### 3. build-frontend

- Compilation with pnpm
- Docker image build
- Security scanning with Trivy
- Push to GitHub Container Registry

#### 4. deploy

- kubectl configuration
- K8s manifests update
- Cluster deployment
- Rollout verification

### Deploy Security

- Image scanning with Trivy
- SARIF results to GitHub Security
- Manifests versioned by SHA

---

## 🧹 Cleanup Cache

**File**: `.github/workflows/cleanup-cache.yml`

### Purpose

Automatic cache cleanup when a PR is closed to optimize storage usage.

### Operation

```yaml
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    - gh extension install actions/gh-actions-cache
    - gh actions-cache list -R $REPO -B $BRANCH
    - gh actions-cache delete $cacheKey --confirm
```

---

## 🏷️ Issue Labeler

**File**: `.github/workflows/issue-labeler.yml`

### Purpose

Automatic issue labeling based on content and patterns.

### Configuration

- **Config file**: `.github/issue-labeler-config.yml`
- **Trigger**: Issues opened/edited
- **Action**: `github/issue-labeler`

---

## ✅ Semantic Pull Request

**File**: `.github/workflows/semantic-pull-request.yml`

### Purpose

PR title validation according to Conventional Commits.

### Features

- **Validation**: Conventional Commits spec
- **Feedback**: Automatic PR comments
- **Auto-cleanup**: Removes comments when fixed

### Valid Title Examples

```text
feat: add user authentication
fix: resolve memory leak in cache
docs: update API documentation
chore: update dependencies
```

---

## 🧪 Test PNPM

**File**: `.github/workflows/test-pnpm.yml`

### Purpose

Test workflow to verify pnpm configuration.

### Usage

- Manual execution only (`workflow_dispatch`)
- Debugging configuration issues
- Version and path verification

---

## 🔧 Custom Actions

### Setup Java

**Location**: `.github/actions/setup/java/`

```yaml
- name: Setup Java
  uses: ./.github/actions/setup/java
```

**Features**:

- Java 21 (Eclipse Temurin)
- Gradle wrapper
- Automatic dependency caching

### Setup Node

**Location**: `.github/actions/setup/node/`

```yaml
- name: Setup Node.js and pnpm
  uses: ./.github/actions/setup/node
```

**Features**:

- Node.js 22
- pnpm 10.13.1
- Intelligent store caching
- Installation with frozen-lockfile

### Specialized Docker Actions

**Location**: `.github/actions/docker/`

> **Note**: Specialized Docker actions have replaced the previous generic Docker action. For more details, see the [Docker actions documentation](./docker-composition-actions.md).

**Backend Docker Action**:

```yaml
- name: Build and push backend Docker image
  uses: ./.github/actions/docker/backend/action.yml
  with:
    image-name: backend
    github-token: ${{ secrets.GITHUB_TOKEN }}
    gradle-args: "-Pversion=latest -Penv=production"
    module-path: server:thryve
    deliver: 'true'
```

**Frontend Web App Action**:

```yaml
- name: Build and push frontend web app Docker image
  uses: ./.github/actions/docker/frontend-web/action.yml
  with:
    image-name: frontend-web
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    api-url: https://api.example.com
    deliver: 'true'
```

**Frontend Landing Page Action**:

```yaml
- name: Build and push frontend landing page Docker image
  uses: ./.github/actions/docker/frontend-landing/action.yml
  with:
    image-name: frontend-landing
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    base-url: https://example.com
    deliver: 'true'
```

**Security Scanning Action**:

```yaml
- name: Scan Docker image for vulnerabilities
  uses: ./.github/actions/docker/security-scan/action.yml
  with:
    image-ref: ghcr.io/myorg/myapp:latest
    report-name: myapp-security-scan
    category: backend-trivy
```

**Features**:

- Specialized actions by application type
- GitHub Container Registry and Docker Hub
- GitHub Actions cache
- Integrated Trivy security scanning
- Automatic metadata
- Multi-platform support

---

## 📊 Metrics and Monitoring

### Typical Execution Times

- **Backend CI**: ~8-12 minutes
- **Frontend CI**: ~5-8 minutes
- **Monorepo CI**: ~15-20 minutes
- **Deploy**: ~10-15 minutes

### Cache Hit Rates

- **Gradle**: ~85-90%
- **pnpm**: ~90-95%
- **Docker**: ~70-80%

### Generated Artifacts

- Test reports (JUnit XML)
- Coverage reports (Kover, LCOV)
- Security reports (SARIF)
- Docker images
- Integration reports

---

## 🔒 Security and Compliance

### Security Analysis

- **CodeQL**: Static code analysis
- **OWASP**: Dependency vulnerabilities
- **Trivy**: Docker image scanning
- **Dependency Review**: New dependency review

### Required Secrets

```yaml
CODECOV_TOKEN      # Coverage upload
NVD_API_KEY       # Vulnerability API
KUBECONFIG        # Kubernetes configuration
GITHUB_TOKEN      # Automatic, for registry
```

### Minimum Permissions

Each workflow has specific minimum permissions following the principle of least privilege.

---

## 🚀 Best Practices

### Versioning

- Use specific versions with SHA hash
- Regular updates with Dependabot
- Test changes in development branches

### Performance

- Parallelization of independent jobs
- Intelligent caching with specific keys
- Concurrency to cancel obsolete runs

### Maintenance

- Updated documentation
- Execution metrics monitoring
- Regular configuration review

---

For detailed documentation of specific workflows, see:

- [CI/CD Guide](ci-guide.md)
- [Custom Actions](custom-actions.md)
