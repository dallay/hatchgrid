# Project Structure

## Root Level Organization

```text
├── client/                 # Frontend monorepo
├── server/                 # Backend services
├── shared/                 # Shared libraries
├── infra/                  # Infrastructure & deployment
├── docs/                   # Project documentation
├── config/                 # Build and quality configs
└── gradle/                 # Gradle configuration
```

## Backend Structure (`server/`)

```text
server/
└── thryve/                 # Main Spring Boot application
    ├── src/main/kotlin/    # Kotlin source code
    ├── src/main/resources/ # Configuration files, migrations
    └── src/test/kotlin/    # Test source code
```

### Backend Package Organization

- Follow domain-driven design principles
- Use reactive programming patterns (WebFlux, R2DBC)
- Separate controllers, services, repositories, and domain models
- Place Liquibase migrations in `src/main/resources/db/changelog/`

## Frontend Structure (`client/`)

```text
client/
├── apps/
│   ├── web/               # Main Vue.js application
│   └── landing-page/      # Astro marketing site
├── packages/
│   ├── utilities/         # Shared utility functions
│   └── tsconfig/         # Shared TypeScript configs
└── config/               # Shared build configurations
```

### Frontend App Structure

- **Web App** (`client/apps/web/`): Vue 3 + TypeScript SPA
  - `src/components/` - Reusable Vue components
  - `src/views/` - Page-level components
  - `src/stores/` - Pinia state management
  - `src/services/` - API service layers
  - `src/router/` - Vue Router configuration

- **Landing Page** (`client/apps/landing-page/`): Astro static site
  - `src/pages/` - Astro page routes
  - `src/components/` - Astro/Vue components
  - `src/layouts/` - Page layout templates
  - `src/data/` - Content collections (blog, FAQ, etc.)

## Shared Libraries (`shared/`)

```text
shared/
├── common/                # Common utilities (Kotlin)
└── spring-boot-common/    # Spring Boot shared components
```

## Infrastructure (`infra/`)

```text
infra/
├── keycloak/             # Keycloak configuration
├── postgresql/           # Database setup and init scripts
└── ssl/                  # Local SSL certificates
```

## Documentation (`docs/`)

```text
docs/
├── conventions/          # Development guidelines
├── authentication/       # Auth documentation
├── frontend/            # Frontend-specific docs
└── landing/             # Landing page assets
```

## Key Conventions

### File Naming

- **Kotlin**: PascalCase for classes, camelCase for functions/properties
- **TypeScript/Vue**: PascalCase for components, camelCase for utilities
- **Configuration**: kebab-case for config files

### Import Organization

- Group imports: standard library → third-party → internal
- Use absolute imports with path aliases (`@/` for src directory)

### Component Structure

- **Vue Components**: Use `<script setup>` with TypeScript
- **Astro Components**: Prefer `.astro` files, use Vue for interactivity
- **Shared Components**: Place in respective `components/` directories

### Testing Structure

- **Backend**: Tests mirror source structure in `src/test/kotlin/`
- **Frontend**: Tests alongside source files with `.test.ts` suffix
- **Integration Tests**: Use Testcontainers for database/service testing

### Configuration Management

- **Backend**: Use `application.yml` with profiles
- **Frontend**: Environment-specific configs in `.env` files
- **Shared**: Centralized configs in `client/config/`

### Monorepo Workspace Management

- Use pnpm workspaces for frontend package management
- Shared dependencies defined at workspace root
- Each app/package has its own `package.json`
- Use workspace protocol (`workspace:*`) for internal dependencies
