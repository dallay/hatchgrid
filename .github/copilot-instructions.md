
# Copilot & AI Agent Instructions for Hatchgrid

Goal: generate code, documentation, and tests consistent with Hatchgrid's architecture and standards. Avoid changes that break builds or tests.

## Architecture & stack
- Backend: Kotlin + Spring Boot (WebFlux, R2DBC, OAuth2, Liquibase, Keycloak)
- Frontend: Vue 3 + TypeScript + Vite
- Static Site: Astro + MDX
- DB: PostgreSQL (RLS)
- CI/CD: GitHub Actions, CodeQL, Docker, Prometheus
- Docs: `docs/` (keep up to date)

## Key conventions
- REST API: see `docs/src/content/docs/conventions/rest-api.md`
- Controllers: thin, DI, DTOs, global exception handler
- Security: OAuth2, RBAC, input validation, output encoding, dependency scanning
- UUIDs: v4, stored as binary(16), exposed in APIs
- i18n: bundles in `src/main/resources/i18n`, descriptive keys
- Offline First: IndexedDB, Cache API, service worker
- Swagger/OpenAPI: annotate controllers, models, and responses
- Style: 4 spaces in Kotlin; Vue Composition API; Prettier/ESLint/Stylelint
- Commits: Conventional Commits; small PRs with clear descriptions

## Required workflow
- Backend: `./gradlew build`
- Frontend: `pnpm -r run lint && pnpm -r run test && pnpm -r run build`
- Tests: required for new logic (JUnit5/Testcontainers, Vitest/Vue Test Utils)
- Test naming: `should_doSomething_when_condition`
- Docs: update `docs/src/content/docs` for API, architecture, or config changes
- Security: never expose secrets; validate inputs; use typed params; avoid SQL injection; sanitize outputs

## Idiomatic patterns
- Kotlin: coroutines, WebFlux, R2DBC, focused services, KDoc for public APIs
- Vue: composables, strict typing (TS), props/emit well-defined, JSDoc for complex functions

## Additional guidelines
- Endpoints: always validate UUIDs
- Errors: standardized structure (code, message, details)
- Logs: no sensitive data; appropriate levels
- Migrations: Liquibase with rollback
- PRs: must link an issue ("Closes #123"), pass CI, and update docs

## Commit examples
- feat(api): add content publishing scheduler (cron + retries)
- fix(web): handle offline cache revalidation correctly
- docs(conventions): clarify error response structure
