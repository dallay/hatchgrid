
# Copilot & AI Agent Instructions for Hatchgrid

## 🏗️ Big Picture Architecture
Hatchgrid is a modular monorepo for automating content publishing for creators. It includes:
- **Backend:** Kotlin + Spring Boot (WebFlux, R2DBC, OAuth2, Liquibase, Keycloak)
- **Frontend:** Vue 3 + TypeScript + Vite
- **Static Site:** Astro + MDX
- **Database:** PostgreSQL (RLS, migrations via Liquibase)
- **CI/CD:** GitHub Actions, CodeQL, Docker, Prometheus
- **Docs:** All conventions and architecture in `docs/src/content/docs/conventions` (see [README](../../README.md) for entry points)

## 📁 Key Project Structure
- `server/` and `shared/` — Spring Boot backend, Kotlin modules, shared code
- `client/apps/landing-page/` — Astro static site
- `client/apps/web/` — Vue 3 frontend
- `docs/` — All conventions, API, security, i18n, and architecture docs
- `.github/` — CI/CD workflows, PR templates

## 🧑‍💻 Critical Developer Workflows
- **Build & Lint (root):** `pnpm run check && pnpm run test && pnpm run build`
- **Backend:** `./gradlew detektAll --no-daemon --stacktrace && ./gradlew build`
- **Frontend:** `pnpm run test` (unit), `pnpm run test:e2e` (integration), `pnpm run storybook` (UI)
- **Database:** Use `compose.yaml` for local PostgreSQL; migrations in `src/main/resources/db/changelog/`
- **Testing:** Backend uses JUnit 5, Testcontainers; Frontend uses Vitest, Vue Test Utils
- **API Docs:** Generated via Spring REST Docs (`build/generated-snippets`)
- **Monitoring:** `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`

## 📝 Project-Specific Conventions
- **REST API:** See `docs/conventions/rest-api.md` for URL, method, error, and versioning standards
- **Controllers:** Thin, dependency-injected, DTOs, global exception handler (`docs/conventions/controller-pattern.md`)
- **Security:** OAuth2, RBAC, input validation, output encoding, dependency scanning (`docs/conventions/security.md`)
- **UUIDs:** Use UUIDv4, stored as `binary(16)`, exposed in APIs (`docs/conventions/uuid-strategy.md`)
- **i18n:** Resource bundles in `src/main/resources/i18n`, message keys are descriptive (`docs/conventions/i18n.md`)
- **Offline First:** IndexedDB, Cache API, service worker, last-write-wins sync (`docs/conventions/offline-first.md`)
- **Swagger:** Annotate controllers, models, and responses (`docs/conventions/swagger.md`)
- **Code Style:** Prettier, ESLint, Stylelint, 4-space indent for Kotlin, composition API for Vue
- **Commits:** Conventional Commits, small PRs, clear descriptions, link to issues (`docs/conventions/project-guidelines.md`)

## 🧪 AI Agent Guidance
- Always update `docs/src/content/docs` for any change in API, architecture, or config
- Refuse changes that break tests, builds, or conventions
- Propose only secure, modular, and extensible solutions
- Add test stubs for new logic (unit/integration)
- Prefer BDD-style test naming (`should_doSomething_when_condition`)
- Use idiomatic patterns for Kotlin (coroutines, WebFlux, R2DBC) and Vue (composables, TypeScript)
- Document public APIs and complex logic with KDoc/JSDoc
- Respect architectural boundaries and service responsibilities

## 🧷 Merge Checklist
- [ ] Tests written and passing
- [ ] Builds passing (`pnpm` and `Gradle`)
- [ ] `docs/src/content/docs` updated if relevant
- [ ] Code format and lint clean
- [ ] Secure, modular, and extensible

## 📚 Reference Docs
- See `docs/src/content/docs/conventions/README.md` for links to all conventions
- See `/README.md` for setup, build, and run instructions

---
For any unclear or missing conventions, open a PR to `docs/src/content/docs/conventions` and update this file.

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
- ✅ **Documentation (`docs/src/content/docs`) must be updated with every relevant change**
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

- Project documentation lives in `docs/src/content/docs`
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
