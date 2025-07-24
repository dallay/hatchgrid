# Custom GitHub Actions

This document provides an overview of the custom GitHub Actions available in the Hatchgrid project.

## Docker Composition Actions

The Docker composition actions are specialized GitHub Actions that handle building and pushing Docker images for different application types. For detailed information, see:

- [Docker Composition Actions Documentation](./docker-composition-actions.md)
- [Docker Actions Migration Guide](./docker-actions-migration-guide.md)

### Available Docker Actions

- **Backend Docker Action**: `.github/actions/docker/backend/action.yml`
- **Frontend Web App Action**: `.github/actions/docker/frontend-web/action.yml`
- **Frontend Landing Page Action**: `.github/actions/docker/frontend-landing/action.yml`
- **Security Scanning Action**: `.github/actions/docker/security-scan/action.yml`

## Setup Actions

The setup actions are used to configure the build environment for different technology stacks.

### Java Setup Action

**Location**: `.github/actions/setup/java/action.yml`

**Purpose**: Sets up Java and Gradle with caching for backend builds.

**Usage Example**:

```yaml
- name: Setup Java
  uses: ./.github/actions/setup/java
  with:
    java-version: '21'
```

### Node.js Setup Action

**Location**: `.github/actions/setup/node/action.yml`

**Purpose**: Sets up Node.js and pnpm with caching for frontend builds.

**Usage Example**:

```yaml
- name: Setup Node.js and pnpm
  uses: ./.github/actions/setup/node
  with:
    node-version: '22'
```

## Best Practices

1. **Use Specialized Actions**: Choose the appropriate specialized action for your application type
2. **Leverage Caching**: All actions include caching mechanisms to speed up builds
3. **Security Scanning**: Always include security scanning in your workflows
4. **Error Handling**: Check the action outputs and logs for detailed error information
5. **Documentation**: Keep the documentation up-to-date when modifying actions
