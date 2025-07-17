# Docker Actions (DEPRECATED)

> **IMPORTANT**: The generic Docker action has been removed. This document is kept for historical reference only. Please refer to the following documents for current information:
>
> - [Docker Composition Actions](./docker-composition-actions.md) - Detailed information about the specialized Docker actions
> - [Docker Actions Migration Guide](./docker-actions-migration-guide.md) - Guide for migrating from the old generic action
>
> **All workflows should now use the specialized Docker composition actions.**

## Overview

The Docker composition actions are specialized GitHub Actions that handle building and pushing Docker images for different application types:

- **Backend Docker Action**: Specialized for Spring Boot/Gradle builds using `bootBuildImage`
- **Frontend Web App Action**: Optimized for Vue.js application builds
- **Frontend Landing Page Action**: Optimized for Astro static site builds
- **Shared Security Scanning**: Common Trivy vulnerability scanning across all actions

These actions replace the previous generic Docker action with technology-specific optimizations.

## Actions

### Backend Docker Action

**Location**: `.github/actions/docker/backend/action.yml`

**Purpose**: Builds and pushes a Spring Boot Docker image using Gradle's `bootBuildImage` task.

**Key Features**:

- Uses existing Java setup action
- Executes `./gradlew bootBuildImage -x test`
- Supports both GHCR and Docker Hub publishing
- Includes Gradle dependency caching
- Integrated Trivy security scanning

**Usage Example**:

```yaml
- name: Build and push backend Docker image
  id: build-backend
  uses: ./.github/actions/docker/backend/action.yml
  with:
    image-name: backend
    github-token: ${{ secrets.GITHUB_TOKEN }}
    gradle-args: "-Pversion=${{ github.ref_name == 'main' && 'latest' || github.ref_name }} -Penv=production"
    module-path: server:thryve
    deliver: 'true'
```

**Inputs**:

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `image-name` | Name of the Docker image | Yes | `backend` |
| `github-token` | GitHub token for authentication | Yes | - |
| `docker-username` | Docker Hub username | No | - |
| `docker-password` | Docker Hub password | No | - |
| `deliver` | Whether to push to registries | No | `true` |
| `gradle-args` | Additional Gradle arguments | No | - |
| `module-path` | Path to the Gradle module to build | No | `server:thryve` |
| `java-version` | Java version to use | No | `21` |

**Outputs**:

| Output | Description |
|--------|-------------|
| `image-full-name` | Full name of the built image including registry and tag |
| `image-tags` | Tags applied to the image |

### Frontend Web App Action

**Location**: `.github/actions/docker/frontend-web/action.yml`

**Purpose**: Builds and pushes a Vue.js web application Docker image with multi-stage build support.

**Key Features**:

- Uses existing Node.js/pnpm setup action
- Multi-stage Docker build with Node.js optimization
- Environment-specific build configurations
- Integrated Trivy security scanning

**Usage Example**:

```yaml
- name: Build and push frontend web app Docker image
  id: build-frontend-web
  uses: ./.github/actions/docker/frontend-web/action.yml
  with:
    image-name: frontend-web
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    api-url: https://api.example.com
    deliver: 'true'
```

**Inputs**:

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `image-name` | Name of the Docker image | Yes | `frontend-web` |
| `github-token` | GitHub token for authentication | Yes | - |
| `docker-username` | Docker Hub username | No | - |
| `docker-password` | Docker Hub password | No | - |
| `deliver` | Whether to push to registries | No | `true` |
| `build-env` | Build environment (development, staging, production) | No | `production` |
| `dockerfile` | Path to Dockerfile | No | `./client/apps/web/Dockerfile` |
| `context` | Build context | No | `.` |
| `api-url` | API URL for the frontend application | No | - |

**Outputs**:

| Output | Description |
|--------|-------------|
| `image-full-name` | Full name of the built image including registry and tag |
| `image-tags` | Tags applied to the image |

### Frontend Landing Page Action

**Location**: `.github/actions/docker/frontend-landing/action.yml`

**Purpose**: Builds and pushes an Astro landing page Docker image optimized for static site generation.

**Key Features**:

- Uses existing Node.js/pnpm setup action
- Optimized for static site generation
- Astro-specific build optimizations
- Integrated Trivy security scanning

**Usage Example**:

```yaml
- name: Build and push frontend landing page Docker image
  id: build-frontend-landing
  uses: ./.github/actions/docker/frontend-landing/action.yml
  with:
    image-name: frontend-landing
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-env: production
    base-url: https://example.com
    deliver: 'true'
```

**Inputs**:

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `image-name` | Name of the Docker image | Yes | `frontend-landing` |
| `github-token` | GitHub token for authentication | Yes | - |
| `docker-username` | Docker Hub username | No | - |
| `docker-password` | Docker Hub password | No | - |
| `deliver` | Whether to push to registries | No | `true` |
| `build-env` | Build environment (development, staging, production) | No | `production` |
| `dockerfile` | Path to Dockerfile | No | `./client/apps/landing-page/Dockerfile` |
| `context` | Build context | No | `.` |
| `base-url` | Base URL for the landing page | No | - |

**Outputs**:

| Output | Description |
|--------|-------------|
| `image-full-name` | Full name of the built image including registry and tag |
| `image-tags` | Tags applied to the image |

### Security Scanning Action

**Location**: `.github/actions/docker/security-scan/action.yml`

**Purpose**: Scans Docker images for vulnerabilities using Trivy and uploads SARIF reports.

**Key Features**:

- Trivy vulnerability scanning
- SARIF report generation
- GitHub Security tab integration
- Artifact upload for scan results

**Usage Example**:

```yaml
- name: Scan Docker image for vulnerabilities
  uses: ./.github/actions/docker/security-scan
  with:
    image-ref: ghcr.io/myorg/myapp:latest
    report-name: myapp-security-scan
    category: backend-trivy
    severity: 'HIGH,CRITICAL'
    fail-on-error: 'false'
```

**Inputs**:

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `image-ref` | Docker image reference to scan | Yes | - |
| `report-name` | Name for the security report file (without extension) | Yes | - |
| `category` | SARIF category for GitHub Security tab | Yes | - |
| `severity` | Comma-separated list of severities to scan for | No | `HIGH,CRITICAL` |
| `fail-on-error` | Whether to fail the pipeline if scan fails | No | `false` |

**Outputs**:

| Output | Description |
|--------|-------------|
| `scan-result` | Result of the security scan (success, failed, error) |
| `sarif-file` | Path to the generated SARIF file |

## Migration Guide

### From Generic Docker Action to Specialized Actions

If you're migrating from the old generic Docker action to the new specialized actions, follow these steps:

1. **Identify the application type** - Determine if your application is a backend (Spring Boot), frontend web app (Vue.js), or frontend landing page (Astro).

2. **Update your workflow** - Replace the old Docker action with the appropriate specialized action:

   **Old (Generic Docker Action - Removed)**:

   ```yaml
   # This action has been removed and should no longer be used
   # The following is shown for historical reference only
   - name: Build and push Docker image
     uses: ./.github/actions/docker/action.yml  # This action no longer exists
     with:
       image-name: myapp
       dockerfile: ./path/to/Dockerfile
       github-token: ${{ secrets.GITHUB_TOKEN }}
   ```

   **New (Specialized Action)**:

   ```yaml
   - name: Build and push Docker image
     uses: ./.github/actions/docker/backend/action.yml  # or frontend-web or frontend-landing
     with:
       image-name: myapp
       github-token: ${{ secrets.GITHUB_TOKEN }}
       # Additional specialized parameters as needed
   ```

3. **Add security scanning** - The security scanning is integrated into each specialized action, but you can also use it separately:

   ```yaml
   - name: Scan Docker image for vulnerabilities
     uses: ./.github/actions/docker/security-scan
     with:
       image-ref: ghcr.io/myorg/myapp:latest
       report-name: myapp-security-scan
       category: app-trivy
   ```

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check that your GitHub token has the necessary permissions (`write:packages`, `read:packages`)
   - For Docker Hub, ensure credentials are correct and consider using a personal access token if 2FA is enabled

2. **Build Failures**:
   - For backend builds, check Gradle logs for dependency or compilation issues
   - For frontend builds, verify Node.js dependencies and build configuration
   - Check for disk space issues on the runner

3. **Security Scanning Issues**:
   - Ensure the image exists and is accessible
   - Check network connectivity to the registry
   - Review the scan logs for specific error messages

### Logs and Artifacts

Each action produces detailed logs and artifacts that can help with troubleshooting:

- **Build Logs**: Available as workflow artifacts
- **Security Scan Reports**: Uploaded as artifacts and to GitHub Security tab
- **Cache Information**: Logged during the build process

## Best Practices

1. **Use Caching**: All actions include caching mechanisms to speed up builds
2. **Environment-Specific Builds**: Use the `build-env` parameter for environment-specific configurations
3. **Security Scanning**: Always include security scanning in your workflows
4. **Error Handling**: Check the action outputs and logs for detailed error information
5. **Registry Authentication**: Configure both GHCR and Docker Hub for maximum flexibility
