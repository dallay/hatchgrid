# 🔧 Hatchgrid Custom Actions

This documentation describes the custom composite actions created to optimize and reuse common configurations in CI/CD workflows.

---

## 📁 Actions Structure

```text
.github/actions/
├── setup-java/          # Java and Gradle configuration
├── setup-node/          # Node.js and pnpm configuration
└── docker-build-push/   # Docker image build and push
```

---

## ☕ Setup Java Action

**Location**: `.github/actions/setup-java/action.yml`

### Purpose: Setup Java

Configures Java 21 with Temurin JDK and Gradle with optimized caching.

### Features: Setup Java

- **JDK**: OpenJDK 21 (Eclipse Temurin)
- **Gradle**: Uses project wrapper
- **Cache**: Automatic for Gradle dependencies

### Usage: Setup Java

```yaml
- name: Setup Java
  uses: ./.github/actions/setup-java
```

### Implementation

```yaml
steps:
  - name: Set up JDK 21
    uses: actions/setup-java@v4
    with:
      java-version: '21'
      distribution: 'temurin'
      cache: gradle

  - name: Setup Gradle
    uses: gradle/actions/setup-gradle@v3
    with:
      gradle-version: wrapper
```

### Benefits: Setup Java

- Consistent Java configuration across all workflows
- Automatic caching of Gradle dependencies
- Uses wrapper for specific Gradle version

---

## 🟢 Setup Node Action

**Location**: `.github/actions/setup-node/action.yml`

### Purpose: Setup Node

Configures Node.js 22 with pnpm and optimized cache management.

### Features: Setup Node

- **Node.js**: Version 22
- **pnpm**: Version 10.10.0
- **Cache**: pnpm store with lockfile-based key
- **Installation**: Dependencies with `--frozen-lockfile`

### Usage: Setup Node

```yaml
- name: Setup Node.js and pnpm
  uses: ./.github/actions/setup-node
```

### Detailed Implementation

```yaml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '22'

  - name: Install pnpm
    uses: pnpm/action-setup@v3
    with:
      version: 10.10.0
      run_install: false

  - name: Verify pnpm installation and setup cache
    shell: bash
    run: |
      echo "Checking pnpm installation"
      pnpm --version
      echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_ENV

  - name: Setup pnpm cache
    uses: actions/cache@v4
    with:
      path: ${{ env.STORE_PATH }}
      key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
      restore-keys: |
        ${{ runner.os }}-pnpm-store-

  - name: Install dependencies
    shell: bash
    run: pnpm install --frozen-lockfile
```

### Note on Duplication

The current action has duplicate cache and installation steps. This should be optimized by removing the duplication.

### Benefits: Setup Node

- Consistent Node.js and pnpm configuration
- Smart caching based on pnpm-lock.yaml
- Deterministic installation with frozen-lockfile

---

## 🐳 Docker Build Push Action

**Location**: `.github/actions/docker-build-push/action.yml`

### Purpose: Docker Build Push

Builds and pushes Docker images to GitHub Container Registry with cache optimizations.

### Features: Docker Build Push

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `image-name` | Docker image name | ✅ | - |
| `dockerfile` | Path to Dockerfile | ✅ | - |
| `context` | Build context | ❌ | `.` |
| `github-token` | GitHub token for authentication | ✅ | - |
| `build-args` | Build arguments for Docker | ❌ | `''` |

### Usage: Docker Build Push

```yaml
- name: Build and push Docker image
  uses: ./.github/actions/docker-build-push
  with:
    image-name: backend
    dockerfile: ./server/thryve/Dockerfile
    context: .
    github-token: ${{ secrets.GITHUB_TOKEN }}
    build-args: |
      NODE_ENV=production
      API_URL=https://api.example.com
```

### Advanced Features

#### Metadata and Tags

- Automatic tags based on branch, tag, and SHA
- Metadata labels for traceability
- Long SHA format for unique identification

#### Cache Strategy

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

- GitHub Actions cache for fast builds
- `max` mode for complete layer caching

#### Registry

- GitHub Container Registry (`ghcr.io`)
- Automatic authentication with GitHub token
- Repository-based namespace

### Complete Implementation

```yaml
steps:
  - name: Set up Docker Buildx
    uses: docker/setup-buildx-action@v3

  - name: Login to GitHub Container Registry
    uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ inputs.github-token }}

  - name: Extract metadata for Docker
    id: meta
    uses: docker/metadata-action@v5
    with:
      images: ghcr.io/${{ github.repository }}/${{ inputs.image-name }}
      tags: |
        type=ref,event=branch
        type=ref,event=tag
        type=sha,format=long

  - name: Build and push Docker image
    uses: docker/build-push-action@v5
    with:
      context: ${{ inputs.context }}
      file: ${{ inputs.dockerfile }}
      push: true
      tags: ${{ steps.meta.outputs.tags }}
      labels: ${{ steps.meta.outputs.labels }}
      build-args: ${{ inputs.build-args }}
      cache-from: type=gha
      cache-to: type=gha,mode=max
```

---

## 🚀 Optimizations and Best Practices

### Action Versioning

- Use specific versions with SHA hash for security
- Example: `actions/setup-node@v4` → `actions/setup-node@8f152de45cc393bb48ce5d89d36b731f54556e65`

### Cache Strategy

- **Gradle**: Cache `~/.gradle/caches` and `~/.gradle/wrapper`
- **pnpm**: Cache dynamic store path
- **Docker**: GitHub Actions cache for layers

### Security

- Minimal permissions in each action
- Use specific tokens (not generic PATs)
- Input validation when necessary

### Performance

- Parallelization when possible
- Smart caching with specific keys
- Reuse of common configurations

---

## 🔄 Maintenance

### Version Updates

1. Review new versions of base actions
2. Test in development branch
3. Update documentation
4. Deploy gradually

### Monitoring

- Review execution times regularly
- Monitor cache hit rates
- Verify resource usage

### Future Extensions

- Action for test database setup
- Action for custom notifications
- Action for performance analysis

---

## 📊 Metrics and Benefits

### Time Saved

- Setup Java: ~30 seconds per workflow
- Setup Node: ~45 seconds per workflow
- Docker Build: ~2-3 minutes with cache hits

### Consistency

- Uniform configuration across all workflows
- Centralized and controlled versions
- Reduced configuration errors

### Maintainability

- Centralized changes in one location
- Easy version updates
- Centralized documentation

---
