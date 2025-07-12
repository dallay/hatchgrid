# GitHub Copilot Instructions for Hatchgrid

## Project Overview
Hatchgrid is a Spring Boot application built with Kotlin and Gradle, providing a reactive backend infrastructure. The project uses modern Spring technologies including WebFlux, R2DBC, OAuth2, and follows a modular architecture approach with Spring Modulith.

## Technology Stack
- **Language:** Kotlin 1.9.25 with coroutines
- **Framework:** Spring Boot 3.4.5
- **API:** Reactive REST APIs with Spring WebFlux
- **Database:** PostgreSQL with R2DBC for reactive data access
- **Database Migrations:** Liquibase
- **Authentication:** OAuth2 (Authorization Server, Resource Server and Client)
- **Testing:** JUnit 5, Testcontainers
- **Documentation:** Spring REST Docs
- **Monitoring:** Spring Boot Actuator, Prometheus
- **Build Tool:** Gradle 8.x

## Project Structure
- `src/main/kotlin` - Primary Kotlin source files
- `src/main/resources` - Configuration files, including:
  - `application.yml` - Main application configuration
  - `db/changelog` - Liquibase migration files
- `src/test/kotlin` - Test source files

## Coding Conventions
- Follow Kotlin coding conventions with 4-space indentation
- Use functional and extension-based approaches where appropriate
- Utilize Kotlin coroutines for asynchronous operations
- Prefer immutability with `val` over `var`
- Implement reactive patterns using Spring WebFlux and R2DBC
- Document public APIs and complex functions with KDoc

## Testing Guidelines
- Write unit tests for all business logic
- Use Testcontainers for integration tests with real PostgreSQL instances
- Prefer reactive testing utilities (StepVerifier, WebTestClient)
- Follow BDD-style naming for test methods (should_doSomething_when_condition)
- Maintain test coverage for critical components

## Common Development Tasks
- Database schema changes should be added as Liquibase migrations
- Security configurations should follow the principle of least privilege
- REST endpoints should follow RESTful conventions
- New modules should integrate with the Spring Modulith architecture

## Development Conventions
For a detailed guide on our development conventions, please refer to the documents in the [`docs/conventions`](../../docs/conventions) directory. These documents cover everything from our REST API design to our security guidelines.

## Best Practices
- Include validation for all input data
- Implement proper error handling with meaningful error messages
- Configure appropriate logging at different levels
- Use Spring's reactive patterns consistently
- Follow the Single Responsibility Principle in class design
- Utilize Spring Boot's auto-configuration capabilities when possible
- Ensure proper security controls for all endpoints
- Include monitoring endpoints via Spring Boot Actuator

# AI Assistant Development Instructions for Hatchgrid

These instructions serve as a guide for GitHub Copilot and any AI-powered developer assistant to contribute effectively and consistently to the Hatchgrid project.

---

## 🔍 Project Overview

**Hatchgrid** is a modular, full-stack platform designed to automate content publishing for creators. It is built as a monorepo with a reactive Kotlin backend, a Vue 3 frontend, and Astro for static content delivery.

---

## 🧠 High-Level Architecture

- **Monorepo** managed with `pnpm`
- **Backend:** Kotlin + Spring Boot + R2DBC + Keycloak + Liquibase
- **Frontend:** Vue 3 + TypeScript + Vite
- **Static Site:** Astro + MDX + Sveltia CMS
- **Auth:** OAuth2 via Keycloak (Authorization Server + Resource Server + Client)
- **Database:** PostgreSQL + RLS + Liquibase for schema management
- **CI/CD:** GitHub Actions (with coverage, build, quality gates, etc.)
- **Infrastructure:** Docker, Prometheus, Grafana, CodeQL
- **Documentation:** Located in `docs/`, maintained in markdown and version-controlled

---

## 📁 Project Structure

- `apps/web/` - Vue 3 frontend
- `apps/landing-page/` - Landing Page - Astro-based static site
- `apps/backend/` - Spring Boot reactive backend
- `shared/` - Shared components across applications
- `docs/` - Project documentation (must be kept up-to-date)
- `.github/` - CI/CD configurations

---

## 🧪 Required Build and Test Commands

All changes must pass the following in the **project root**:

```bash
pnpm run check && pnpm run test && pnpm run build
```

For the **backend**:

```bash
./gradlew detektAll --no-daemon --stacktrace
./gradlew build
```

If these commands fail, the pull request must not be merged.

---

## ✅ Development Principles

- ✅ **All new features must include unit and integration tests**
- ✅ **Documentation (`/docs`) must be updated with every relevant change**
- ✅ **Every build must be green before merging to main**
- ✅ **Prefer test-first or BDD-style development**
- ✅ **Design modules for extension, not modification**

---

## 💡 Best Practices

### Backend (Kotlin + Spring Boot)

- Use `val` over `var` (immutability)
- Follow modular design using Spring Modulith
- Prefer coroutines for async operations
- Use `WebFlux`, `R2DBC`, and `Liquibase` idiomatically
- Follow `Single Responsibility Principle` in class design
- Secure endpoints by default (Keycloak + OAuth2 scopes)
- Follow reactive patterns consistently
- Configure and expose metrics via Actuator + Prometheus

### Frontend (Vue 3 + Vite)

- Follow composition API and TypeScript best practices
- Use `pnpm` workspaces to manage dependencies
- Isolate logic in composables
- Use ESLint + Prettier for consistency
- Document components with JSDoc / TS comments

---

## 🧪 Testing Guidelines

- **Backend:**
  - Use JUnit 5 and Testcontainers
  - Reactive testing: `StepVerifier`, `WebTestClient`
  - Test class naming: `should_doSomething_when_condition`

- **Frontend:**
  - Use Vitest + Vue Test Utils
  - Keep test coverage high, especially for components and composables

---

## 📚 Documentation Guidelines

- Project documentation lives in `/docs`
- Every change to behavior, APIs, architecture, or configuration **must** be reflected
- Use markdown and commit with relevant PRs
- Refer to this folder as the canonical reference for devs and agents

---

## 💬 AI Assistant Usage Guidelines

All AI agents (Copilot, ChatGPT, etc.) must:

- Respect the architectural choices (reactive, modular, OAuth2-secured)
- Apply consistent coding conventions (documented above)
- Prioritize security, performance, and testability
- Suggest changes that **do not break existing tests or architecture**
- Refuse to produce logic without corresponding test stubs
- Propose changes **only** if the required checks and builds can pass

---

## 🧷 Summary Checklist Before Merging Code

- [ ] Tests written and passing
- [ ] Builds passing (`pnpm` and `Gradle`)
- [ ] `docs/` updated if relevant
- [ ] Code format and lint clean
- [ ] Secure, modular, and extensible

---
