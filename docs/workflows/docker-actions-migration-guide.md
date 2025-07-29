# Docker Actions Migration Guide

This document provides guidance on migrating from the old generic Docker action to the new specialized Docker composition actions.

## Overview

The Hatchgrid CI/CD pipeline has been restructured to use specialized Docker composition actions for different application types:

- **Backend Docker Action**: Specialized for Spring Boot/Gradle builds using `bootBuildImage`
- **Frontend Web App Action**: Optimized for Vue.js application builds
- **Frontend Landing Page Action**: Optimized for Astro static site builds
- **Shared Security Scanning**: Common Trivy vulnerability scanning across all actions

These specialized actions replace the previous generic Docker action (`.github/actions/docker/action.yml`), which has been removed.

## Migration Steps

### 1. Identify Your Application Type

First, determine which specialized action is appropriate for your application:

- **Spring Boot Backend**: Use the backend Docker action
- **Vue.js Web App**: Use the frontend web app Docker action
- **Astro Landing Page**: Use the frontend landing page Docker action

### 2. Update Your Workflow

Replace references to the old generic Docker action with the appropriate specialized action:

**Old (Generic Docker Action - Removed)**:

```yaml
- name: Build and push Docker image
  uses: ./.github/actions/docker/action.yml  # This action no longer exists
  with:
    image-name: myapp
    dockerfile: ./path/to/Dockerfile
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

**New (Specialized Action)**:

For Spring Boot backend applications:

```yaml
- name: Build and push backend Docker image
  uses: ./.github/actions/docker/backend/action.yml
  with:
    image-name: backend
    github-token: ${{ secrets.GITHUB_TOKEN }}
    gradle-args: "-Pversion=${{ github.ref_name == 'main' && 'latest' || github.ref_name }} -Penv=production"
    module-path: server:thryve
    deliver: 'true'
```

For Vue.js web applications:

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

For Astro landing pages:

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

### 3. Add Security Scanning

Security scanning is integrated into each specialized action, but you can also use it separately:

```yaml
- name: Scan Docker image for vulnerabilities
  uses: ./.github/actions/docker/security-scan/action.yml
  with:
    image-ref: ghcr.io/myorg/myapp:latest
    report-name: myapp-security-scan
    category: backend-trivy
    severity: 'HIGH,CRITICAL'
    fail-on-error: 'false'
```

## Benefits of Specialized Actions

The specialized Docker composition actions offer several advantages over the generic action:

1. **Optimized Builds**: Each action is tailored to the specific technology stack
2. **Better Caching**: Technology-specific caching strategies improve build performance
3. **Integrated Security**: Vulnerability scanning is integrated into each action
4. **Improved Error Handling**: More detailed error messages for each application type
5. **Environment Support**: Better support for environment-specific configurations

## Troubleshooting

If you encounter issues after migrating to the specialized actions:

1. **Check Action Inputs**: Ensure you're providing all required inputs for the specialized action
2. **Review Logs**: Check the workflow logs for detailed error messages
3. **Verify Registry Access**: Ensure your GitHub token has the necessary permissions
4. **Check Build Context**: Verify the build context is correct for your application

For more detailed information about each specialized action, see the [Docker Composition Actions Documentation](./docker-composition-actions.md).
