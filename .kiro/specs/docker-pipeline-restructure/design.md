# Design Document

## Overview

This design restructures the Docker build pipeline by replacing the single generic Docker composition action with specialized actions for backend and frontend applications. The new architecture will provide optimized build processes, better caching strategies, and improved maintainability while preserving existing workflow integration.

## Architecture

### Current State

- Single generic Docker action (`.github/actions/docker/action.yml`)
- Used by deploy workflow for both backend and frontend builds
- Generic approach doesn't leverage technology-specific optimizations

### Target State

- **Backend Docker Action**: Specialized for Spring Boot/Gradle builds using `bootBuildImage`
- **Frontend Web App Action**: Optimized for Vue.js application builds
- **Frontend Landing Page Action**: Optimized for Astro static site builds
- **Shared Security Scanning**: Common Trivy vulnerability scanning across all actions

## Components and Interfaces

### 1. Backend Docker Composition Action

**Location**: `.github/actions/docker/backend/action.yml`

**Inputs**:

```yaml
inputs:
  image-name:
    description: 'Name of the Docker image'
    required: true
    default: 'backend'
  github-token:
    description: 'GitHub token for authentication'
    required: true
  docker-username:
    description: 'Docker Hub username'
    required: false
  docker-password:
    description: 'Docker Hub password'
    required: false
  deliver:
    description: 'Whether to push to registries'
    required: false
    default: 'true'
  gradle-args:
    description: 'Additional Gradle arguments'
    required: false
    default: ''
```

**Key Features**:

- Uses existing Java setup action
- Executes `./gradlew bootBuildImage -x test`
- Supports both GHCR and Docker Hub publishing
- Includes Gradle dependency caching
- Integrated Trivy security scanning

### 2. Frontend Web App Docker Composition Action

**Location**: `.github/actions/docker/frontend-web/action.yml`

**Inputs**:

```yaml
inputs:
  image-name:
    description: 'Name of the Docker image'
    required: true
    default: 'frontend-web'
  github-token:
    description: 'GitHub token for authentication'
    required: true
  build-env:
    description: 'Build environment (development, staging, production)'
    required: false
    default: 'production'
  dockerfile:
    description: 'Path to Dockerfile'
    required: false
    default: './client/apps/web/Dockerfile'
```

**Key Features**:

- Uses existing Node.js/pnpm setup action
- Builds only the web app (`pnpm build:web`)
- Multi-stage Docker build with Node.js optimization
- Environment-specific build configurations

### 3. Frontend Landing Page Docker Composition Action

**Location**: `.github/actions/docker/frontend-landing/action.yml`

**Inputs**:

```yaml
inputs:
  image-name:
    description: 'Name of the Docker image'
    required: true
    default: 'frontend-landing'
  github-token:
    description: 'GitHub token for authentication'
    required: true
  build-env:
    description: 'Build environment'
    required: false
    default: 'production'
  dockerfile:
    description: 'Path to Dockerfile'
    required: false
    default: './client/apps/landing-page/Dockerfile'
```

**Key Features**:

- Uses existing Node.js/pnpm setup action
- Builds only the landing page (`pnpm build:landing`)
- Optimized for static site generation
- Astro-specific build optimizations

### 4. Shared Security Scanning Component

**Location**: `.github/actions/docker/security-scan/action.yml`

**Inputs**:

```yaml
inputs:
  image-ref:
    description: 'Docker image reference to scan'
    required: true
  report-name:
    description: 'Name for the security report'
    required: true
  category:
    description: 'SARIF category for GitHub Security'
    required: true
```

**Features**:

- Trivy vulnerability scanning
- SARIF report generation
- GitHub Security tab integration
- Artifact upload for scan results

## Data Models

### Docker Image Metadata

```yaml
ImageMetadata:
  registry: string (ghcr.io)
  repository: string (github.repository)
  name: string (backend|frontend-web|frontend-landing)
  tags: array[string]
    - type=ref,event=branch
    - type=ref,event=tag
    - type=sha,format=long
  labels: map[string, string]
```

### Build Context

```yaml
BuildContext:
  backend:
    context: "." (root for Gradle access)
    gradle_args: string
    java_version: "21"
  frontend:
    context: "./client"
    node_version: "22"
    pnpm_version: "10.10.0"
    build_env: string
```

### Security Scan Result

```yaml
SecurityScanResult:
  image_ref: string
  severity_levels: ["HIGH", "CRITICAL"]
  report_format: "sarif"
  output_file: string
  category: string
```

## Error Handling

### Build Failures

- **Gradle Build Errors**: Capture and display Gradle error output with context
- **Node.js Build Errors**: Show pnpm/npm error details with dependency information
- **Docker Build Errors**: Display Docker layer failure information

### Authentication Failures

- **GHCR Authentication**: Clear error messages for GitHub token issues
- **Docker Hub Authentication**: Specific error handling for Docker Hub credentials
- **Registry Push Failures**: Detailed error reporting for push operations

### Security Scan Failures

- **Non-blocking**: Security scan failures should not fail the entire pipeline
- **Reporting**: Upload partial results and error reports as artifacts
- **Alerting**: Log warnings for scan failures while continuing deployment

## Testing Strategy

### Unit Testing

- **Action Validation**: Test each composition action's input validation
- **Script Testing**: Validate shell scripts used in actions
- **Mock Testing**: Test actions with mocked external dependencies

### Integration Testing

- **Workflow Testing**: Test complete workflows with new actions
- **Registry Integration**: Verify image push/pull operations
- **Security Integration**: Test Trivy scanning integration

### End-to-End Testing

- **Multi-Environment**: Test across development, staging, production
- **Cross-Platform**: Verify actions work on different runner types
- **Failure Scenarios**: Test error handling and recovery

## Migration Strategy

### Phase 1: Create New Actions

1. Implement backend Docker composition action
2. Implement frontend Docker composition actions
3. Implement shared security scanning action
4. Add comprehensive testing

### Phase 2: Update Workflows

1. Update deploy.yml to use new backend action
2. Update deploy.yml to use new frontend actions
3. Maintain backward compatibility during transition
4. Update CI workflows if needed

### Phase 3: Cleanup

1. Remove old generic Docker action
2. Update documentation
3. Verify all workflows use new actions
4. Monitor for any issues

## Performance Considerations

### Caching Strategy

- **Gradle Cache**: Leverage existing Gradle caching in Java setup action
- **pnpm Cache**: Utilize existing pnpm store caching in Node setup action
- **Docker Layer Cache**: Use GitHub Actions cache for Docker layers
- **Registry Cache**: Implement cache-from/cache-to for multi-stage builds

### Parallel Execution

- **Independent Builds**: Backend and frontend builds can run in parallel
- **Security Scanning**: Run vulnerability scans in parallel with other steps
- **Multi-Registry Push**: Push to GHCR and Docker Hub simultaneously

### Resource Optimization

- **Build Context**: Minimize Docker build context size
- **Multi-Stage Builds**: Use multi-stage builds for smaller final images
- **Dependency Optimization**: Leverage existing dependency caching mechanisms
