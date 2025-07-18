# 🔧 Configuration and Troubleshooting — GitHub Actions

This guide provides detailed information about configuration, troubleshooting, and optimization of GitHub Actions workflows in Hatchgrid.

---

## 📋 Table of Contents

- [Initial Configuration](#️initial-configuration)
- [Environment Variables and Secrets](#environment-variables-and-secrets)
- [Common Troubleshooting](#common-troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Alerts](#monitoring-and-alerts)

---

## ⚙️ Initial Configuration

### Required Secrets

#### Repository Level

```yaml
# Codecov for coverage reports
CODECOV_TOKEN: "uuid-token-from-codecov"

# NVD API for vulnerability analysis
NVD_API_KEY: "api-key-from-nvd"

# Kubernetes for deployments
KUBECONFIG: |
  apiVersion: v1
  kind: Config
  clusters: [...]
```

#### Environment Level

```yaml
# Per environment (development, staging, production)
KUBECONFIG: "environment-specific-kubeconfig"
DATABASE_URL: "environment-specific-db-url"
API_KEYS: "environment-specific-keys"
```

### Dependabot Configuration

**File**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    commit-message:
      prefix: "chore"
      include: "scope"
```

### Labels Configuration

**File**: `.github/labeler.yml`

```yaml
backend:
  - server/**/*
  - shared/**/*
  - build.gradle.kts

frontend:
  - client/**/*
  - package.json
  - pnpm-lock.yaml

documentation:
  - docs/**/*
  - "**/*.md"

ci/cd:
  - .github/**/*
```

---

## 🔐 Environment Variables and Secrets

### Secrets Management

#### Secrets Hierarchy

1. **Organization Level** - Shared secrets
2. **Repository Level** - Repository-specific secrets
3. **Environment Level** - Environment-specific secrets

#### Secret Rotation

```bash
# Script for automatic rotation
#!/bin/bash
# rotate-secrets.sh

# Codecov Token
gh secret set CODECOV_TOKEN --body "new-token"

# NVD API Key
gh secret set NVD_API_KEY --body "new-api-key"

# Kubernetes Config
gh secret set KUBECONFIG --body "$(cat new-kubeconfig.yaml)"
```

### Environment Variables by Workflow

#### Backend CI

```yaml
env:
  NVD_API_KEY: ${{ secrets.NVD_API_KEY }}
  GRADLE_OPTS: "-Dorg.gradle.daemon=false"
  JAVA_OPTS: "-Xmx2g"
```

#### Frontend CI

```yaml
env:
  NODE_ENV: "test"
  PNPM_CACHE_FOLDER: ".pnpm"
  CI: "true"
```

#### Deploy

```yaml
env:
  DOCKER_BUILDKIT: "1"
  COMPOSE_DOCKER_CLI_BUILD: "1"
  KUBE_NAMESPACE: ${{ needs.determine-environment.outputs.environment }}
```

---

## 🚨 Common Troubleshooting

### Cache Issues

#### Symptom: Frequent Cache Miss

```yaml
# Problem: Too specific cache key
key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}-${{ github.sha }}

# Solution: More generic key with restore-keys
key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}
restore-keys: |
  ${{ runner.os }}-gradle-
```

#### Symptom: Corrupted Cache

```bash
# Clean cache manually
gh extension install actions/gh-actions-cache
gh actions-cache delete "cache-key" --confirm
```

### Dependency Issues

#### Symptom: pnpm install fails

```yaml
# Diagnosis
- name: Debug pnpm
  run: |
    echo "pnpm version: $(pnpm --version)"
    echo "Node version: $(node --version)"
    echo "Store path: $(pnpm store path)"
    ls -la ~/.pnpm-store || echo "Store not found"

# Solution: Clean store
- name: Clean pnpm store
  run: pnpm store prune
```

#### Symptom: Gradle build fails

```yaml
# Diagnosis
- name: Debug Gradle
  run: |
    ./gradlew --version
    ./gradlew dependencies --configuration runtimeClasspath
    echo "JAVA_HOME: $JAVA_HOME"
    echo "PATH: $PATH"

# Solution: Clean cache
- name: Clean Gradle
  run: ./gradlew clean --no-daemon
```

### Docker Issues

#### Symptom: Image build fails

```yaml
# Diagnosis
- name: Debug Docker
  run: |
    docker version
    docker buildx version
    docker system df
    docker system info

# Solution: Clean system
- name: Clean Docker
  run: |
    docker system prune -f
    docker builder prune -f
```

#### Symptom: Registry push fails

```yaml
# Diagnosis
- name: Debug Registry
  run: |
    echo "Registry: ghcr.io"
    echo "Actor: ${{ github.actor }}"
    echo "Repository: ${{ github.repository }}"
    docker images | grep ghcr.io

# Solution: Re-login
- name: Re-login to registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
    logout: false
```

### Permission Issues

#### Symptom: Permission denied on GitHub API

```yaml
# Verify workflow permissions
permissions:
  contents: read
  packages: write
  security-events: write
  pull-requests: write
```

#### Symptom: Kubernetes deployment fails

```yaml
# Verify KUBECONFIG
- name: Debug Kubernetes
  run: |
    kubectl version --client
    kubectl config current-context
    kubectl auth can-i create deployments
```

---

## 🚀 Performance Optimization

### Job Parallelization

#### Matrix Strategy

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    node-version: [18, 20, 22]
  fail-fast: false
  max-parallel: 6
```

#### Conditional Jobs

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.changes.outputs.backend }}
      frontend: ${{ steps.changes.outputs.frontend }}
    steps:
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            backend:
              - 'server/**'
            frontend:
              - 'client/**'

  backend:
    needs: changes
    if: ${{ needs.changes.outputs.backend == 'true' }}
    # ... rest of job
```

### Cache Optimization

#### Cache Layering

```yaml
# Dependencies cache
- name: Cache dependencies
  uses: actions/cache@5a3ec84eff668545956fd18022155c47e93e2684 # v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
      ~/.pnpm-store
    key: deps-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml', '**/*.gradle*') }}

# Build cache
- name: Cache build
  uses: actions/cache@5a3ec84eff668545956fd18022155c47e93e2684 # v4
  with:
    path: |
      server/*/build
      client/*/dist
    key: build-${{ runner.os }}-${{ github.sha }}
```

#### Cache Warming

```yaml
# Pre-warm cache in separate workflow
name: Cache Warmer
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  warm-cache:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4
      - name: Setup Java
        uses: ./.github/actions/setup/java
      - name: Setup Node
        uses: ./.github/actions/setup/node
      - name: Warm Gradle cache
        run: ./gradlew dependencies
      - name: Warm pnpm cache
        run: pnpm install --frozen-lockfile
```

### Runner Optimization

#### Self-hosted Runners

```yaml
# For intensive workloads
runs-on: [self-hosted, linux, x64, high-memory]

# With specific labels
runs-on: [self-hosted, gpu, cuda]
```

#### Runner Sizing

```yaml
# For large builds
runs-on: ubuntu-latest-8-cores

# For normal builds
runs-on: ubuntu-latest
```

---

## 📊 Monitoring and Alerts

### Key Metrics

#### Execution Time

```yaml
- name: Track execution time
  run: |
    echo "WORKFLOW_START=$(date +%s)" >> $GITHUB_ENV

# At the end of workflow
- name: Report execution time
  run: |
    WORKFLOW_END=$(date +%s)
    DURATION=$((WORKFLOW_END - WORKFLOW_START))
    echo "Workflow duration: ${DURATION}s"

    # Send to monitoring system
    curl -X POST "https://metrics.example.com/github-actions" \
      -H "Content-Type: application/json" \
      -d "{\"workflow\": \"${{ github.workflow }}\", \"duration\": $DURATION}"
```

#### Cache Hit Rate

```yaml
- name: Cache statistics
  run: |
    echo "Cache hit: ${{ steps.cache.outputs.cache-hit }}"
    echo "Cache key: ${{ steps.cache.outputs.cache-primary-key }}"
    echo "Cache restored from: ${{ steps.cache.outputs.cache-matched-key }}"
```

### Automatic Alerts

#### Slack Notifications

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    channel: '#ci-cd'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
```

#### Email Notifications

```yaml
- name: Send email on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.MAIL_USERNAME }}
    password: ${{ secrets.MAIL_PASSWORD }}
    subject: "CI/CD Failure: ${{ github.workflow }}"
    body: |
      Workflow ${{ github.workflow }} failed.
      Repository: ${{ github.repository }}
      Branch: ${{ github.ref }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
    to: devops@hatchgrid.com
```

---

## 🔧 Specific Configurations

### Detekt Configuration

**File**: `config/detekt/detekt.yml`

```yaml
build:
  maxIssues: 0
  excludeCorrectable: false

config:
  validation: true
  warningsAsErrors: false

processors:
  active: true

console-reports:
  active: true

output-reports:
  active: true
  exclude:
    - 'TxtOutputReport'

formatting:
  active: true
  android: false
  autoCorrect: true
```

### Biome Configuration

**File**: `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.1/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "useConst": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "es5",
      "semicolons": "always"
    }
  }
}
```

### Codecov Configuration

**File**: `codecov.yml`

```yaml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 1%
    patch:
      default:
        target: 70%

comment:
  layout: "reach,diff,flags,tree,reach"
  behavior: default
  require_changes: false

ignore:
  - "**/*Test.kt"
  - "**/*.test.ts"
  - "**/test/**"
  - "**/tests/**"
```

---

## 🔄 Regular Maintenance

### Weekly Checklist

- [ ] Review execution metrics
- [ ] Verify cache hit rates
- [ ] Update critical dependencies
- [ ] Review error logs

### Monthly Checklist

- [ ] Update action versions
- [ ] Review security configurations
- [ ] Optimize slow workflows
- [ ] Clean old artifacts

### Quarterly Checklist

- [ ] Complete security audit
- [ ] CI/CD architecture review
- [ ] Documentation updates
- [ ] Team training on new features

---

## 📚 Additional Resources

### Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Debugging Tools

- [act](https://github.com/nektos/act) - Run workflows locally
- [GitHub CLI](https://cli.github.com/) - Command line management
- [actionlint](https://github.com/rhymond/actionlint) - Workflow linter

### Community

- [GitHub Actions Community](https://github.com/actions/community)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)

---
