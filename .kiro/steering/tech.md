# Technology Stack

## Backend Stack

- **Language**: Kotlin 2.0.20
- **Framework**: Spring Boot 3.3.4 with Spring WebFlux (reactive)
- **Database**: PostgreSQL with Spring Data R2DBC (reactive database access)
- **Security**: Spring Security with OAuth2 Resource Server
- **Authentication**: Keycloak 26.0.0 for SSO and user management
- **API Documentation**: SpringDoc OpenAPI 2.6.0
- **Database Migrations**: Liquibase
- **Testing**: JUnit 5, Kotest, Testcontainers, MockK
- **Build Tool**: Gradle 8.x with Kotlin DSL

## Frontend Stack

- **Web App**: Vue.js 3.5.17 with TypeScript
- **Landing Page**: Astro 5.11.1 with Vue components
- **Styling**: TailwindCSS 4.1.11
- **State Management**: Pinia 3.0.3
- **Form Validation**: Vee-Validate with Zod schemas
- **UI Components**: Reka UI, Lucide icons
- **Build Tool**: Vite 7.0.4
- **Package Manager**: pnpm 10.13.1 (monorepo with workspaces)

## Infrastructure & DevOps

- **Containerization**: Docker Compose for local development
- **Database**: PostgreSQL with Docker
- **Reverse Proxy**: Configured for API proxying (localhost:8080 → localhost:9876)
- **SSL**: Local SSL certificates for HTTPS development

## Code Quality & Testing

- **Linting**: Biome for JavaScript/TypeScript, Detekt for Kotlin
- **Testing**: Vitest for frontend, JUnit/Kotest for backend
- **Coverage**: Kover for Kotlin, Vitest coverage for frontend
- **Security**: OWASP Dependency Check
- **Git Hooks**: Lefthook for Git-hooks management

## Common Commands

### Backend (Gradle)

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Clean build artifacts
./gradlew clean

# Check for dependency vulnerabilities
./gradlew dependencyCheckAnalyze

# Run static code analysis (Detekt)
./gradlew detektAll

# Run code coverage report (Kover)
./gradlew koverXmlReport
# or, if you want both formats
# ./gradlew koverXmlReport koverHtmlReport

# Run all verification tasks (includes tests, checks, static analysis)
./gradlew check
```

### Frontend (pnpm)

```bash
# Install dependencies
pnpm install

# Start development servers (all apps)
pnpm dev

# Start only landing page
pnpm dev:landing

# Build all projects
pnpm build

# Run tests
pnpm test

# Lint and format code
pnpm check

# Update dependencies
pnpm update-deps
```

### Full-Stack Development

```bash
# Start both backend and frontend
pnpm start

# Run all tests (backend + frontend)
pnpm test:all

# Build everything
pnpm backend:build && pnpm build
```

### Docker Services

```bash
# Start PostgreSQL and Keycloak
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f
```
