# Backend Docker Action

This action builds and pushes a Spring Boot Docker image using Gradle's `bootBuildImage` task.

## Key Features

- Uses existing Java setup action
- Executes `./gradlew bootBuildImage -x test`
- Supports both GHCR and Docker Hub publishing
- Includes Gradle dependency caching
- Integrated Trivy security scanning

## Usage Example

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

## Inputs

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

## Outputs

| Output | Description |
|--------|-------------|
| `image-full-name` | Full name of the built image including registry and tag |
| `image-tags` | Tags applied to the image |

For more detailed documentation, see the [Docker Composition Actions Documentation](../../../../docs/workflows/docker-composition-actions.md#backend-docker-action).
