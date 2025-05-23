# GitHub Actions Workflows

This directory contains GitHub Actions workflows and reusable composite actions for the Hatchgrid monorepo.

## Workflows

### Backend CI

The `backend-ci.yml` workflow is triggered when changes are made to the backend code. It builds and tests the backend code.

**Triggers:**
- Push to `main` branch (only backend-related files)
- Pull requests (only backend-related files)

**Jobs:**
- Build and Test: Builds the backend code and runs tests

### Frontend CI

The `frontend-ci.yml` workflow is triggered when changes are made to the frontend code. It lints, builds, and tests the frontend code.

**Triggers:**
- Push to `main` branch (only frontend-related files)
- Pull requests (only frontend-related files)

**Jobs:**
- Lint: Runs linting on the frontend code
- Build: Builds the frontend code
- Test: Runs tests on the frontend code

### Monorepo CI

The `monorepo-ci.yml` workflow is triggered when changes affect both frontend and backend, or when manually triggered. It runs both the backend and frontend CI workflows, and then runs integration tests.

**Triggers:**
- Push to `main` branch (excluding files that would trigger only backend or frontend CI)
- Pull requests (excluding files that would trigger only backend or frontend CI)
- Manual trigger with environment selection

**Jobs:**
- Backend: Runs the backend CI workflow
- Frontend: Runs the frontend CI workflow
- Integration: Runs integration tests after backend and frontend jobs complete

### Deploy

The `deploy.yml` workflow is used to deploy the application to different environments.

**Triggers:**
- Manual trigger with environment selection
- Push to `main` branch (automatic deployment to development)
- Push of tags starting with `v` (automatic deployment to production)

**Jobs:**
- Determine Environment: Determines which environment to deploy to
- Build Backend: Builds and pushes the backend Docker image
- Build Frontend: Builds and pushes the frontend Docker image
- Deploy: Deploys the application to the selected environment

## Composite Actions

### Setup Java

The `setup-java` action sets up Java 21 and Gradle with caching.

**Usage:**
```yaml
- name: Setup Java
  uses: ./.github/actions/setup-java
```

### Setup Node.js and pnpm

The `setup-node` action sets up Node.js and pnpm with caching.

**Usage:**
```yaml
- name: Setup Node.js and pnpm
  uses: ./.github/actions/setup-node
```

### Docker Build and Push

The `docker-build-push` action builds and pushes a Docker image to the GitHub Container Registry.

**Usage:**
```yaml
- name: Build and push Docker image
  uses: ./.github/actions/docker-build-push
  with:
    image-name: backend
    dockerfile: ./server/thryve/Dockerfile
    context: .
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Inputs:**
- `image-name`: Name of the Docker image
- `dockerfile`: Path to the Dockerfile
- `context`: Build context (default: `.`)
- `github-token`: GitHub token for authentication
- `build-args`: Build arguments for Docker build (optional)
