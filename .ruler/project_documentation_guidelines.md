# Hatchgrid Documentation & Source of Truth

All project documentation and canonical development guidelines are maintained in the `docs/src/content/docs` folder at the root of the repository. This folder serves as the single source of truth for architecture, conventions, API specifications, and workflow standards.

## Architecture Principles

- **Reactive-First**: Use Spring WebFlux and R2DBC for non-blocking, reactive operations
- **Domain-Driven Design**: Organize backend code by business domains, not technical layers
- **API-First**: Design RESTful APIs with OpenAPI documentation before implementation
- **Security by Default**: OAuth2/JWT authentication required for all protected endpoints
- **Multi-tenant Ready**: Design components to support tenant isolation from the start

## Code Style & Conventions

### Backend (Kotlin/Spring Boot)

- Use `@RestController` with reactive return types (`Mono<T>`, `Flux<T>`)
- Repository layer uses Spring Data R2DBC with reactive repositories
- Service layer handles business logic and coordinates between repositories
- Use `@Validated` and Bean Validation annotations for input validation
- Place Liquibase migrations in `src/main/resources/db/changelog/`
- Follow Kotlin naming conventions: PascalCase for classes, camelCase for functions
- Use data classes for DTOs and domain models
- Prefer constructor injection over field injection

### Frontend (Vue.js/TypeScript)

- Use Composition API with `<script setup>` syntax
- Implement TypeScript strict mode with proper type definitions

---

**Documentation Policy:**

- All documentation must be written in English.
- Documentation files (except for project-level README.md) must be placed inside the `docs/src/content/docs` folder at the root of the project.
- Each new documentation `.md` file should be placed in its corresponding subfolder within `docs/src/content/docs` (e.g., conventions, authentication, frontend, landing, etc.) according to its topic.
- The `docs/src/content/docs` folder is the canonical source of truth for all project documentation, conventions, and technical specifications.

**Note:** For the latest and most accurate information, always refer to the `docs/src/content/docs` folder in the root of the project. Any change to architecture, APIs, or conventions must be reflected here.
