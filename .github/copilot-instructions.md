---
Source: .ruler/api_design_guidelines.md
---
---
title: REST API Conventions
description: Guidelines for designing and building REST APIs in the Hatchgrid project.
---
## REST API Conventions

This document outlines the REST API conventions for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the API.

## Table of Contents

- [REST API Conventions](#rest-api-conventions)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [URL Structure](#url-structure)
- [HTTP Methods](#http-methods)
- [Status Codes](#status-codes)
- [Request and Response](#request-and-response)
  - [JSON](#json)
  - [Error Handling](#error-handling)
- [Versioning](#versioning)
- [Authentication](#authentication)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [HATEOAS](#hateoas)

## Introduction

This document provides a set of conventions for designing and building REST APIs. The goal is to create a consistent and easy-to-use API that is both powerful and flexible.

## URL Structure

- Use nouns instead of verbs in the URL.
- Use plural nouns for collections.
- Use kebab-case for URL segments.
- Use a consistent URL structure.

**Good:**

- `/users`
- `/users/{id}`
- `/users/{id}/posts`

**Bad:**

- `/getUsers`
- `/user/{id}`
- `/users/{id}/getPosts`

## HTTP Methods

Use the appropriate HTTP method for the action being performed.

- `GET`: Retrieve a resource or a collection of resources.
- `POST`: Create a new resource.
- `PUT`: Update an existing resource.
- `PATCH`: Partially update an existing resource.
- `DELETE`: Delete a resource.

## Status Codes

Use the appropriate HTTP status code to indicate the result of the request.

- `200 OK`: The request was successful.
- `201 Created`: The resource was created successfully.
- `204 No Content`: The request was successful, but there is no content to return.
- `400 Bad Request`: The request was invalid.
- `401 Unauthorized`: The user is not authenticated.
- `403 Forbidden`: The user is not authorized to perform the action.
- `404 Not Found`: The resource was not found.
- `500 Internal Server Error`: An error occurred on the server.

## Request and Response

### JSON

- Use JSON for all request and response bodies.
- Use camelCase for all JSON properties.

### Error Handling

- Use a consistent error format for all error responses.
- The error response should include a unique error code, a descriptive error message, and a list of validation errors (if any).

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid.",
    "errors": [
      {
        "field": "email",
        "message": "The email address is invalid."
      }
    ]
  }
}
```

## Versioning

- Version the API to avoid breaking changes.
- The API version should be included in the URL, e.g., `/v1/users`.

## Authentication

- Use a standard authentication mechanism, such as OAuth 2.0 or JWT.
- The authentication token should be included in the `Authorization` header of the request.

## Pagination

- Use pagination to limit the number of results returned in a single request.
- The pagination information should be included in the response.

## Sorting

- Allow the user to sort the results by one or more fields.
- The sorting information should be included in the query string of the request.

## Filtering

- Allow the user to filter the results by one or more fields.
- The filtering information should be included in the query string of the request.

## HATEOAS

- Use HATEOAS to provide links to related resources in the response.
- This allows the client to discover the API without prior knowledge of the URL structure.

---
Source: .ruler/architecture_overview.md
---
---
title: Hexagonal Architecture
description: Learn about Hexagonal Architecture (Ports and Adapters) and how it is implemented in Hatchgrid to ensure separation of concerns, testability, and maintainability.
---
## Hexagonal Architecture

![Hexagonal Architecture Schema](hexagonal-architecture.png)

## Overview

Hexagonal Architecture, also known as Ports and Adapters, is a software design pattern that emphasizes the separation of concerns by isolating the core business logic from external systems. This architecture allows for easier testing, maintenance, and adaptability to changes in external dependencies.

## Key Concepts

- **Core Domain**: The central part of the application that contains the business logic. It is independent of external systems and frameworks.
- **Ports**: Interfaces that define how the core domain interacts with external systems. They can be inbound (for receiving commands) or outbound (for sending data).
- **Adapters**: Implementations of the ports that connect the core domain to external systems, such as databases, message queues, or web services. Adapters can be inbound (e.g., REST controllers) or outbound (e.g., repositories).
- **Dependency Inversion**: The core domain should not depend on external systems. Instead, it should define interfaces (ports) that adapters implement. This allows for easy replacement of external systems without affecting the core logic.
- **Testing**: The separation of the core domain from external systems allows for easier unit testing of business logic without needing to mock external dependencies. Integration tests can be used to verify the interaction between the core domain and adapters.
- **Flexibility**: The architecture allows for easy changes to external systems without impacting the core domain. New adapters can be added or existing ones modified without affecting the business logic.

## Clean Architecture in Hatchgrid

At Hatchgrid, we follow a strict Clean Architecture approach to enforce separation of concerns and long-term maintainability. This structure promotes testability, framework independence, and high cohesion within each feature or bounded context.

### Folder Structure

Each feature is self-contained and follows this standard structure:

```text
📁{feature}
├── 📁domain         // Core domain logic (pure Kotlin, no framework dependencies)
├── 📁application    // Use cases (pure, framework-agnostic)
└── 📁infrastructure // Framework integration (Spring Boot, R2DBC, HTTP, etc.)
```

![Feature folder structure](form-feature-folder-structure.png)

### Layer Breakdown

#### 1. `domain`: The Core

- **Pure Kotlin**: No framework annotations or external dependencies.
- **Domain Building Blocks**:
  - **Value Objects**: Immutable objects that represent a descriptive aspect of the domain with no conceptual identity. For example:
    - `FormId`: A special value object that wraps a UUID and extends `BaseId<UUID>`.
    - `HexColor`: A validated string-based color value object extending `BaseValidateValueObject<String>`.
  - **Base Classes**:
    - `BaseId<T>`: Abstract class for typed IDs, ensuring type safety and consistent behavior.
    - `BaseValueObject<T>` and `BaseValidateValueObject<T>`: For defining immutable value objects with or without validation logic.
  - **Entities and Aggregate Roots**:
    - `Form`: A typical aggregate root extending `BaseEntity<FormId>`, responsible for business rules and recording domain events such as `FormCreatedEvent` and `FormUpdatedEvent`.
    - `BaseEntity<ID>`: Provides audit tracking and domain event management.
    - `AggregateRoot<ID>`: Marker base class to distinguish aggregate roots from regular entities.
  - **Domain Contracts**:
    - Defined through interfaces like `FormRepository`, `FormFinderRepository`, etc., which are implemented by adapters in the infrastructure layer.
  - **Domain Events**:
    - Encapsulate business-relevant occurrences like `FormCreatedEvent`, `FormUpdatedEvent`, etc., used to decouple the core from side effects.
  - **Domain Exceptions**:
    - Represent business-rule violations and are defined explicitly, e.g., `FormException`.
- **Entities, Value Objects, Events, Exceptions, and Interfaces** that define contracts with the outside.
- Example files: `Form.kt`, `FormId.kt`, `FormCreatedEvent.kt`, `FormRepository.kt`.

#### 2. `application`: Use Cases

- Defines **commands**, **queries**, and **handlers** (CQRS-style).
- Contains **services** that orchestrate interactions between domain logic and ports.
- Completely framework-independent. We even avoid `@Service` from Spring by defining our own annotation:

```kotlin
package com.hatchgrid.common.domain
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
@MustBeDocumented
annotation class Service
```

- Example:
  - `CreateFormCommandHandler.kt` coordinates domain logic via `FormCreator.kt`.
  - `SearchFormsQueryHandler.kt` reads through `FormFinder.kt`.

- **CQRS (Command Query Responsibility Segregation)**:
  - The application layer implements CQRS by separating write and read concerns into `commands` and `queries`, each with their own handlers.
  - **Commands** represent state-changing operations. They are handled by classes implementing `CommandHandler<T>`:
    - Example: `CreateFormCommandHandler` receives a `CreateFormCommand`, authorizes the action, builds a domain object (`Form`), and delegates creation to `FormCreator`.
    - `FormCreator` persists the new entity via `FormRepository` and broadcasts relevant domain events (`FormCreatedEvent`) using an `EventPublisher`.
  - **Queries** represent read-only operations. They are handled by classes implementing `QueryHandler<TQuery, TResult>`:
    - Example: `FindFormQueryHandler` receives a `FindFormQuery`, fetches the entity via a `FormFinder`, and maps the result to a DTO (`FormResponse`).
  - All command and query objects are pure data structures implementing the shared `Command` or `Query<T>` interfaces, making them easy to validate, log, and trace.
  - Command and query handlers are marked with our custom `@Service` annotation to remain decoupled from Spring-specific logic.

#### 3. `infrastructure`: Adapters

- Implements the interfaces defined in `domain` and integrates with:
  - **HTTP layer**:
    - All controllers extend a shared base class `ApiController` that centralizes common logic:
      - Authentication via JWT (e.g., extracting user ID).
      - Input sanitization.
      - Dispatching commands or queries via a `Mediator`, which abstracts handler resolution.
    - Controllers are versioned via custom media types in the `Accept` header (e.g., `application/vnd.api.v1+json`).
    - Fully documented with **Swagger (OpenAPI v3)** annotations for automatic API documentation.
    - Example: `CreateFormController`, `FindFormController`.
  - **Persistence layer**:
    - Repositories and entities interact with the database using **Spring Data R2DBC**.
    - Mapping between domain and persistence models is done through dedicated mappers (e.g., `FormMapper.kt`).
    - Example: `FormR2dbcRepository` implements domain interfaces like `FormRepository`.

- This layer is the only one allowed to use framework-specific features (Spring annotations, I/O, etc.).

### Example Feature: `form`

```text
form/
├── application/
│   ├── create/
│   │   ├── CreateFormCommand.kt
│   │   ├── CreateFormCommandHandler.kt
│   │   └── FormCreator.kt
│   └── ...
├── domain/
│   ├── Form.kt
│   ├── FormId.kt
│   ├── FormRepository.kt
│   └── event/FormCreatedEvent.kt
└── infrastructure/
    ├── http/
    │   └── CreateFormController.kt
    └── persistence/
        ├── entity/FormEntity.kt
        └── repository/FormR2dbcRepository.kt
```

### Principles Applied

- **Single Responsibility per Layer**: Core logic, use cases, and adapters are strictly separated.
- **Framework Independence**: Core logic remains decoupled from Spring Boot or any infrastructure.
- **Port-Driven**: Infrastructure implements domain interfaces, not the other way around.
- **Isolation for Testing**: Domain and application layers can be unit-tested with no framework setup.

---
Source: .ruler/astro_conventions.md
---
# Astro Framework Conventions

This document outlines the conventions and best practices for working with the Astro framework in this project.

## Project Structure

- Use the default `src/pages`, `src/components`, and `src/layouts` folders.
- Use `src/content` and Astro Collections for structured content.
- Organize content by language (e.g., `content/blog/en/...`).
- Prefer file-based routing for pages and API endpoints.

## Components

- Use `.astro` components for layout and structure.
- Use framework components (e.g., `.vue`) only for dynamic interactivity.
- Co-locate styles in components; prefer `style` blocks scoped to the component.
- Name components in PascalCase (e.g., `HeroBanner.astro`).

## Content Management

- Use Astro Collections to validate and type content.
- Use Markdown/MDX for articles and rich content.
- Group articles in folders following the format `YYYY/MM/DD/slug`.
- Localize content using directory structure and `i18n` fields.

## Styling

- Use Tailwind CSS as the default utility-first CSS framework.
- Prefer component-scoped styles over global styles.
- Global styles should reside in `src/styles/global.css`.

## Markdown & MDX

- Use MDX only when interactivity is required.
- Keep frontmatter consistent and validated through Astro Collections.
- Use `Content` component to render markdown safely.

## Performance

- Avoid large JavaScript bundles — prefer partial hydration.
- Use `client:only` or `client:load` strategically.
- Optimize images with the `<Image />` component.

## SEO

- Use `<Head>` component to inject dynamic meta tags.
- Set canonical URLs, `og:` tags, and localized alternate links.
- Use structured data (JSON-LD) where appropriate.

## Testing & Linting

- Lint all markdown and Astro files using Biome.
- Validate collection schemas and frontmatter.
- Prefer unit tests for components with dynamic logic (e.g., Vue).

---

These conventions ensure consistency and maintainability across static site content, layout, and dynamic interactivity in Astro.

---
Source: .ruler/ci_cd_best_practices.md
---
---
applyTo: '.github/workflows/*.yml'
description: 'Comprehensive guide for building robust, secure, and efficient CI/CD pipelines using GitHub Actions. Covers workflow structure, jobs, steps, environment variables, secret management, caching, matrix strategies, testing, and deployment strategies.'
---

# GitHub Actions CI/CD Best Practices

## Your Mission

As GitHub Copilot, you are an expert in designing and optimizing CI/CD pipelines using GitHub Actions. Your mission is to assist developers in creating efficient, secure, and reliable automated workflows for building, testing, and deploying their applications. You must prioritize best practices, ensure security, and provide actionable, detailed guidance.

## Core Concepts and Structure

### **1. Workflow Structure (`.github/workflows/*.yml`)**

- **Principle:** Workflows should be clear, modular, and easy to understand, promoting reusability and maintainability.
- **Deeper Dive:**
  - **Naming Conventions:** Use consistent, descriptive names for workflow files (e.g., `build-and-test.yml`, `deploy-prod.yml`).
  - **Triggers (`on`):** Understand the full range of events: `push`, `pull_request`, `workflow_dispatch` (manual), `schedule` (cron jobs), `repository_dispatch` (external events), `workflow_call` (reusable workflows).
  - **Concurrency:** Use `concurrency` to prevent simultaneous runs for specific branches or groups, avoiding race conditions or wasted resources.
  - **Permissions:** Define `permissions` at the workflow level for a secure default, overriding at the job level if needed.
- **Guidance for Copilot:**
  - Always start with a descriptive `name` and appropriate `on` trigger. Suggest granular triggers for specific use cases (e.g., `on: push: branches: [main]` vs. `on: pull_request`).
  - Recommend using `workflow_dispatch` for manual triggers, allowing input parameters for flexibility and controlled deployments.
  - Advise on setting `concurrency` for critical workflows or shared resources to prevent resource contention.
  - Guide on setting explicit `permissions` for `GITHUB_TOKEN` to adhere to the principle of least privilege.
- **Pro Tip:** For complex repositories, consider using reusable workflows (`workflow_call`) to abstract common CI/CD patterns and reduce duplication across multiple projects.

### **2. Jobs**

- **Principle:** Jobs should represent distinct, independent phases of your CI/CD pipeline (e.g., build, test, deploy, lint, security scan).
- **Deeper Dive:**
  - **`runs-on`:** Choose appropriate runners. `ubuntu-latest` is common, but `windows-latest`, `macos-latest`, or `self-hosted` runners are available for specific needs.
  - **`needs`:** Clearly define dependencies. If Job B `needs` Job A, Job B will only run after Job A successfully completes.
  - **`outputs`:** Pass data between jobs using `outputs`. This is crucial for separating concerns (e.g., build job outputs artifact path, deploy job consumes it).
  - **`if` Conditions:** Leverage `if` conditions extensively for conditional execution based on branch names, commit messages, event types, or previous job status (`if: success()`, `if: failure()`, `if: always()`).
  - **Job Grouping:** Consider breaking large workflows into smaller, more focused jobs that run in parallel or sequence.
- **Guidance for Copilot:**
  - Define `jobs` with clear `name` and appropriate `runs-on` (e.g., `ubuntu-latest`, `windows-latest`, `self-hosted`).
  - Use `needs` to define dependencies between jobs, ensuring sequential execution and logical flow.
  - Employ `outputs` to pass data between jobs efficiently, promoting modularity.
  - Utilize `if` conditions for conditional job execution (e.g., deploy only on `main` branch pushes, run E2E tests only for certain PRs, skip jobs based on file changes).
- **Example (Conditional Deployment and Output Passing):**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact_path: ${{ steps.package_app.outputs.path }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 22
      - name: Install dependencies and build
        run: |
          npm ci
          npm run build
      - name: Package application
        id: package_app
        run: | # Assume this creates a 'dist.zip' file
          zip -r dist.zip dist
          echo "path=dist.zip" >> "$GITHUB_OUTPUT"
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: my-app-build
          path: dist.zip

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: my-app-build
      - name: Deploy to Staging
        run: |
          unzip dist.zip
          echo "Deploying ${{ needs.build.outputs.artifact_path }} to staging..."
          # Add actual deployment commands here
```

### **3. Steps and Actions**

- **Principle:** Steps should be atomic, well-defined, and actions should be versioned for stability and security.
- **Deeper Dive:**
  - **`uses`:** Referencing marketplace actions (e.g., `actions/checkout@v4`, `actions/setup-node@v3`) or custom actions. Always pin to a full length commit SHA for maximum security and immutability, or at least a major version tag (e.g., `@v4`). Avoid pinning to `main` or `latest`.
  - **`name`:** Essential for clear logging and debugging. Make step names descriptive.
  - **`run`:** For executing shell commands. Use multi-line scripts for complex logic and combine commands to optimize layer caching in Docker (if building images).
  - **`env`:** Define environment variables at the step or job level. Do not hardcode sensitive data here.
  - **`with`:** Provide inputs to actions. Ensure all required inputs are present.
- **Guidance for Copilot:**
  - Use `uses` to reference marketplace or custom actions, always specifying a secure version (tag or SHA).
  - Use `name` for each step for readability in logs and easier debugging.
  - Use `run` for shell commands, combining commands with `&&` for efficiency and using `|` for multi-line scripts.
  - Provide `with` inputs for actions explicitly, and use expressions (`${{ }}`) for dynamic values.
- **Security Note:** Audit marketplace actions before use. Prefer actions from trusted sources (e.g., `actions/` organization) and review their source code if possible. Use `dependabot` for action version updates.

## Security Best Practices in GitHub Actions

### **1. Secret Management**

- **Principle:** Secrets must be securely managed, never exposed in logs, and only accessible by authorized workflows/jobs.
- **Deeper Dive:**
  - **GitHub Secrets:** The primary mechanism for storing sensitive information. Encrypted at rest and only decrypted when passed to a runner.
  - **Environment Secrets:** For greater control, create environment-specific secrets, which can be protected by manual approvals or specific branch conditions.
  - **Secret Masking:** GitHub Actions automatically masks secrets in logs, but it's good practice to avoid printing them directly.
  - **Minimize Scope:** Only grant access to secrets to the workflows/jobs that absolutely need them.
- **Guidance for Copilot:**
  - Always instruct users to use GitHub Secrets for sensitive information (e.g., API keys, passwords, cloud credentials, tokens).
  - Access secrets via `secrets.<SECRET_NAME>` in workflows.
  - Recommend using environment-specific secrets for deployment environments to enforce stricter access controls and approvals.
  - Advise against constructing secrets dynamically or printing them to logs, even if masked.
- **Example (Environment Secrets with Approval):**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://prod.example.com
    steps:
      - name: Deploy to production
        env:
          PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
        run: ./deploy-script.sh
```

### **2. OpenID Connect (OIDC) for Cloud Authentication**

- **Principle:** Use OIDC for secure, credential-less authentication with cloud providers (AWS, Azure, GCP, etc.), eliminating the need for long-lived static credentials.
- **Deeper Dive:**
  - **Short-Lived Credentials:** OIDC exchanges a JWT token for temporary cloud credentials, significantly reducing the attack surface.
  - **Trust Policies:** Requires configuring identity providers and trust policies in your cloud environment to trust GitHub's OIDC provider.
  - **Federated Identity:** This is a key pattern for modern, secure cloud deployments.
- **Guidance for Copilot:**
  - Strongly recommend OIDC for authenticating with AWS, Azure, GCP, and other cloud providers instead of storing long-lived access keys as secrets.
  - Provide examples of how to configure the OIDC action for common cloud providers (e.g., `aws-actions/configure-aws-credentials@v4`).
  - Explain the concept of trust policies and how they relate to OIDC setup.
- **Pro Tip:** OIDC is a fundamental shift towards more secure cloud deployments and should be prioritized whenever possible.

### **3. Least Privilege for `GITHUB_TOKEN`**

- **Principle:** Grant only the necessary permissions to the `GITHUB_TOKEN` for your workflows, reducing the blast radius in case of compromise.
- **Deeper Dive:**
  - **Default Permissions:** By default, the `GITHUB_TOKEN` has broad permissions. This should be explicitly restricted.
  - **Granular Permissions:** Define `permissions` at the workflow or job level (e.g., `contents: read`, `pull-requests: write`, `issues: read`).
  - **Read-Only by Default:** Start with `contents: read` as the default and add write permissions only when strictly necessary.
- **Guidance for Copilot:**
  - Configure `permissions` at the workflow or job level to restrict access. Always prefer `contents: read` as the default.
  - Advise against using `contents: write` or `pull-requests: write` unless the workflow explicitly needs to modify the repository.
  - Provide a clear mapping of common workflow needs to specific `GITHUB_TOKEN` permissions.
- **Example (Least Privilege):**

```yaml
permissions:
  contents: read  # Default is write, explicitly set to read-only for security
  pull-requests: write # Only if workflow needs to update PRs
  checks: write      # For updating checks

jobs:
  lint:
    permissions:
      contents: read # This job only needs to read code, override workflow default
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
```

### **4. Dependency Review and Software Composition Analysis (SCA)**

- **Principle:** Continuously scan dependencies for known vulnerabilities and licensing issues.
- **Deeper Dive:**
  - **Early Detection:** Integrate dependency checks early in the CI pipeline to catch issues before deployment.
  - **Tools:** Use `dependency-review-action`, Snyk, Trivy, Mend (formerly WhiteSource).
  - **Supply Chain Security:** This is a critical component of securing your software supply chain.
- **Guidance for Copilot:**
  - Integrate `dependency-review-action` or other SCA tools into the CI pipeline.
  - Recommend regular scanning for vulnerabilities in third-party libraries and setting up alerts for new findings.
  - Emphasize the importance of maintaining up-to-date dependency lists and understanding transitive dependencies.

### **5. Static Application Security Testing (SAST)**

- **Principle:** Identify security vulnerabilities in source code before runtime.
- **Deeper Dive:**
  - **Shift Left:** SAST enables finding and fixing vulnerabilities early in the development lifecycle, which is more cost-effective.
  - **Tools:** CodeQL, SonarQube, Bandit (Python), ESLint with security plugins (JS/TS).
  - **Automated Enforcement:** Configure SAST to break builds or block PRs if critical vulnerabilities are found.
- **Guidance for Copilot:**
  - Integrate SAST tools (e.g., CodeQL for GitHub Advanced Security, or open-source alternatives) into the CI pipeline.
  - Configure security scanning as a blocking step if critical vulnerabilities are found, enforcing a secure by default posture.
  - Suggest adding security linters or static analysis to pre-commit hooks for earlier feedback.

### **6. Secret Scanning and Credential Leak Prevention**

- **Principle:** Prevent secrets from being committed into the repository or exposed in logs.
- **Deeper Dive:**
  - **GitHub Secret Scanning:** Built-in feature to detect secrets in your repository.
  - **Pre-commit Hooks:** Tools like `git-secrets` can prevent secrets from being committed locally.
  - **Environment Variables Only:** Secrets should only be passed to the environment where they are needed at runtime, never in the build artifact.
- **Guidance for Copilot:**
  - Suggest enabling GitHub's built-in secret scanning for the repository.
  - Recommend implementing pre-commit hooks that scan for common secret patterns.
  - Advise reviewing workflow logs for accidental secret exposure, even with masking.

### **7. Immutable Infrastructure & Image Signing**

- **Principle:** Ensure that container images and deployed artifacts are tamper-proof and verified.
- **Deeper Dive:**
  - **Reproducible Builds:** Ensure that building the same code always results in the exact same image.
  - **Image Signing:** Use tools like Notary or Cosign to cryptographically sign container images, verifying their origin and integrity.
  - **Deployment Gate:** Enforce that only signed images can be deployed to production environments.
- **Guidance for Copilot:**
  - Advocate for reproducible builds in Dockerfiles and build processes.
  - Suggest integrating image signing into the CI pipeline and verification during deployment stages.

## Optimization and Performance

### **1. Caching GitHub Actions**

- **Principle:** Cache dependencies and build outputs to significantly speed up subsequent workflow runs.
- **Deeper Dive:**
  - **Cache Hit Ratio:** Aim for a high cache hit ratio by designing effective cache keys.
  - **Cache Keys:** Use a unique key based on file hashes (e.g., `hashFiles('**/package-lock.json')`, `hashFiles('**/requirements.txt')`) to invalidate the cache only when dependencies change.
  - **Restore Keys:** Use `restore-keys` for fallbacks to older, compatible caches.
  - **Cache Scope:** Understand that caches are scoped to the repository and branch.
- **Guidance for Copilot:**
  - Use `actions/cache@v3` for caching common package manager dependencies (Node.js `node_modules`, Python `pip` packages, Java Maven/Gradle dependencies) and build artifacts.
  - Design highly effective cache keys using `hashFiles` to ensure optimal cache hit rates.
  - Advise on using `restore-keys` to gracefully fall back to previous caches.
- **Example (Advanced Caching for Monorepo):**

```yaml
- name: Cache Node.js modules
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ./node_modules # For monorepos, cache specific project node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-${{ github.run_id }}
    restore-keys: |
      ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-node-
```

### **2. Matrix Strategies for Parallelization**

- **Principle:** Run jobs in parallel across multiple configurations (e.g., different Node.js versions, OS, Python versions, browser types) to accelerate testing and builds.
- **Deeper Dive:**
  - **`strategy.matrix`:** Define a matrix of variables.
  - **`include`/`exclude`:** Fine-tune combinations.
  - **`fail-fast`:** Control whether job failures in the matrix stop the entire strategy.
  - **Maximizing Concurrency:** Ideal for running tests across various environments simultaneously.
- **Guidance for Copilot:**
  - Utilize `strategy.matrix` to test applications against different environments, programming language versions, or operating systems concurrently.
  - Suggest `include` and `exclude` for specific matrix combinations to optimize test coverage without unnecessary runs.
  - Advise on setting `fail-fast: true` (default) for quick feedback on critical failures, or `fail-fast: false` for comprehensive test reporting.
- **Example (Multi-version, Multi-OS Test Matrix):**

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false # Run all tests even if one fails
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [16.x, 18.x, 20.x]
        browser: [chromium, firefox]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install Playwright browsers
        run: npx playwright install ${{ matrix.browser }}
      - name: Run tests
        run: npm test
```

### **3. Self-Hosted Runners**

- **Principle:** Use self-hosted runners for specialized hardware, network access to private resources, or environments where GitHub-hosted runners are cost-prohibitive.
- **Deeper Dive:**
  - **Custom Environments:** Ideal for large build caches, specific hardware (GPUs), or access to on-premise resources.
  - **Cost Optimization:** Can be more cost-effective for very high usage.
  - **Security Considerations:** Requires securing and maintaining your own infrastructure, network access, and updates. This includes proper hardening of the runner machines, managing access controls, and ensuring timely patching.
  - **Scalability:** Plan for how self-hosted runners will scale with demand, either manually or using auto-scaling solutions.
- **Guidance for Copilot:**
  - Recommend self-hosted runners when GitHub-hosted runners do not meet specific performance, cost, security, or network access requirements.
  - Emphasize the user's responsibility for securing, maintaining, and scaling self-hosted runners, including network configuration and regular security audits.
  - Advise on using runner groups to organize and manage self-hosted runners efficiently.

### **4. Fast Checkout and Shallow Clones**

- **Principle:** Optimize repository checkout time to reduce overall workflow duration, especially for large repositories.
- **Deeper Dive:**
  - **`fetch-depth`:** Controls how much of the Git history is fetched. `1` for most CI/CD builds is sufficient, as only the latest commit is usually needed. A `fetch-depth` of `0` fetches the entire history, which is rarely needed and can be very slow for large repos.
  - **`submodules`:** Avoid checking out submodules if not required by the specific job. Fetching submodules adds significant overhead.
  - **`lfs`:** Manage Git LFS (Large File Storage) files efficiently. If not needed, set `lfs: false`.
  - **Partial Clones:** Consider using Git's partial clone feature (`--filter=blob:none` or `--filter=tree:0`) for extremely large repositories, though this is often handled by specialized actions or Git client configurations.
- **Guidance for Copilot:**
  - Use `actions/checkout@v4` with `fetch-depth: 1` as the default for most build and test jobs to significantly save time and bandwidth.
  - Only use `fetch-depth: 0` if the workflow explicitly requires full Git history (e.g., for release tagging, deep commit analysis, or `git blame` operations).
  - Advise against checking out submodules (`submodules: false`) if not strictly necessary for the workflow's purpose.
  - Suggest optimizing LFS usage if large binary files are present in the repository.

### **5. Artifacts for Inter-Job and Inter-Workflow Communication**

- **Principle:** Store and retrieve build outputs (artifacts) efficiently to pass data between jobs within the same workflow or across different workflows, ensuring data persistence and integrity.
- **Deeper Dive:**
  - **`actions/upload-artifact`:** Used to upload files or directories produced by a job. Artifacts are automatically compressed and can be downloaded later.
  - **`actions/download-artifact`:** Used to download artifacts in subsequent jobs or workflows. You can download all artifacts or specific ones by name.
  - **`retention-days`:** Crucial for managing storage costs and compliance. Set an appropriate retention period based on the artifact's importance and regulatory requirements.
  - **Use Cases:** Build outputs (executables, compiled code, Docker images), test reports (JUnit XML, HTML reports), code coverage reports, security scan results, generated documentation, static website builds.
  - **Limitations:** Artifacts are immutable once uploaded. Max size per artifact can be several gigabytes, but be mindful of storage costs.
- **Guidance for Copilot:**
  - Use `actions/upload-artifact@v3` and `actions/download-artifact@v3` to reliably pass large files between jobs within the same workflow or across different workflows, promoting modularity and efficiency.
  - Set appropriate `retention-days` for artifacts to manage storage costs and ensure old artifacts are pruned.
  - Advise on uploading test reports, coverage reports, and security scan results as artifacts for easy access, historical analysis, and integration with external reporting tools.
  - Suggest using artifacts to pass compiled binaries or packaged applications from a build job to a deployment job, ensuring the exact same artifact is deployed that was built and tested.

## Comprehensive Testing in CI/CD (Expanded)

### **1. Unit Tests**

- **Principle:** Run unit tests on every code push to ensure individual code components (functions, classes, modules) function correctly in isolation. They are the fastest and most numerous tests.
- **Deeper Dive:**
  - **Fast Feedback:** Unit tests should execute rapidly, providing immediate feedback to developers on code quality and correctness. Parallelization of unit tests is highly recommended.
  - **Code Coverage:** Integrate code coverage tools (e.g., Istanbul for JS, Coverage.py for Python, JaCoCo for Java) and enforce minimum coverage thresholds. Aim for high coverage, but focus on meaningful tests, not just line coverage.
  - **Test Reporting:** Publish test results using `actions/upload-artifact` (e.g., JUnit XML reports) or specific test reporter actions that integrate with GitHub Checks/Annotations.
  - **Mocking and Stubbing:** Emphasize the use of mocks and stubs to isolate units under test from their dependencies.
- **Guidance for Copilot:**
  - Configure a dedicated job for running unit tests early in the CI pipeline, ideally triggered on every `push` and `pull_request`.
  - Use appropriate language-specific test runners and frameworks (Jest, Vitest, Pytest, Go testing, JUnit, NUnit, XUnit, RSpec).
  - Recommend collecting and publishing code coverage reports and integrating with services like Codecov, Coveralls, or SonarQube for trend analysis.
  - Suggest strategies for parallelizing unit tests to reduce execution time.

### **2. Integration Tests**

- **Principle:** Run integration tests to verify interactions between different components or services, ensuring they work together as expected. These tests typically involve real dependencies (e.g., databases, APIs).
- **Deeper Dive:**
  - **Service Provisioning:** Use `services` within a job to spin up temporary databases, message queues, external APIs, or other dependencies via Docker containers. This provides a consistent and isolated testing environment.
  - **Test Doubles vs. Real Services:** Balance between mocking external services for pure unit tests and using real, lightweight instances for more realistic integration tests. Prioritize real instances when testing actual integration points.
  - **Test Data Management:** Plan for managing test data, ensuring tests are repeatable and data is cleaned up or reset between runs.
  - **Execution Time:** Integration tests are typically slower than unit tests. Optimize their execution and consider running them less frequently than unit tests (e.g., on PR merge instead of every push).
- **Guidance for Copilot:**
  - Provision necessary services (databases like PostgreSQL/MySQL, message queues like RabbitMQ/Kafka, in-memory caches like Redis) using `services` in the workflow definition or Docker Compose during testing.
  - Advise on running integration tests after unit tests, but before E2E tests, to catch integration issues early.
  - Provide examples of how to set up `service` containers in GitHub Actions workflows.
  - Suggest strategies for creating and cleaning up test data for integration test runs.

### **3. End-to-End (E2E) Tests**

- **Principle:** Simulate full user behavior to validate the entire application flow from UI to backend, ensuring the complete system works as intended from a user's perspective.
- **Deeper Dive:**
  - **Tools:** Use modern E2E testing frameworks like Cypress, Playwright, or Selenium. These provide browser automation capabilities.
  - **Staging Environment:** Ideally run E2E tests against a deployed staging environment that closely mirrors production, for maximum fidelity. Avoid running directly in CI unless resources are dedicated and isolated.
  - **Flakiness Mitigation:** Address flakiness proactively with explicit waits, robust selectors, retries for failed tests, and careful test data management. Flaky tests erode trust in the pipeline.
  - **Visual Regression Testing:** Consider integrating visual regression testing (e.g., Applitools, Percy) to catch UI discrepancies.
  - **Reporting:** Capture screenshots and video recordings on failure to aid debugging.
- **Guidance for Copilot:**
  - Use tools like Cypress, Playwright, or Selenium for E2E testing, providing guidance on their setup within GitHub Actions.
  - Recommend running E2E tests against a deployed staging environment to catch issues before production and validate the full deployment process.
  - Configure test reporting, video recordings, and screenshots on failure to aid debugging and provide richer context for test results.
  - Advise on strategies to minimize E2E test flakiness, such as robust element selection and retry mechanisms.

### **4. Performance and Load Testing**

- **Principle:** Assess application performance and behavior under anticipated and peak load conditions to identify bottlenecks, ensure scalability, and prevent regressions.
- **Deeper Dive:**
  - **Tools:** JMeter, k6, Locust, Gatling, Artillery. Choose based on language, complexity, and specific needs.
  - **Integration:** Integrate into CI/CD for continuous performance regression detection. Run these tests less frequently than unit/integration tests (e.g., nightly, weekly, or on significant feature merges).
  - **Thresholds:** Define clear performance thresholds (e.g., response time, throughput, error rates) and fail builds if these are exceeded.
  - **Baseline Comparison:** Compare current performance metrics against established baselines to detect degradation.
- **Guidance for Copilot:**
  - Suggest integrating performance and load testing into the CI pipeline for critical applications, providing examples for common tools.
  - Advise on setting performance baselines and failing the build if performance degrades beyond a set threshold.
  - Recommend running these tests in a dedicated environment that simulates production load patterns.
  - Guide on analyzing performance test results to pinpoint areas for optimization (e.g., database queries, API endpoints).

### **5. Test Reporting and Visibility**

- **Principle:** Make test results easily accessible, understandable, and visible to all stakeholders (developers, QA, product owners) to foster transparency and enable quick issue resolution.
- **Deeper Dive:**
  - **GitHub Checks/Annotations:** Leverage these for inline feedback directly in pull requests, showing which tests passed/failed and providing links to detailed reports.
  - **Artifacts:** Upload comprehensive test reports (JUnit XML, HTML reports, code coverage reports, video recordings, screenshots) as artifacts for long-term storage and detailed inspection.
  - **Integration with Dashboards:** Push results to external dashboards or reporting tools (e.g., SonarQube, custom reporting tools, Allure Report, TestRail) for aggregated views and historical trends.
  - **Status Badges:** Use GitHub Actions status badges in your README to indicate the latest build/test status at a glance.
- **Guidance for Copilot:**
  - Use actions that publish test results as annotations or checks on PRs for immediate feedback and easy debugging directly in the GitHub UI.
  - Upload detailed test reports (e.g., XML, HTML, JSON) as artifacts for later inspection and historical analysis, including negative results like error screenshots.
  - Advise on integrating with external reporting tools for a more comprehensive view of test execution trends and quality metrics.
  - Suggest adding workflow status badges to the README for quick visibility of CI/CD health.

## Advanced Deployment Strategies (Expanded)

### **1. Staging Environment Deployment**

- **Principle:** Deploy to a staging environment that closely mirrors production for comprehensive validation, user acceptance testing (UAT), and final checks before promotion to production.
- **Deeper Dive:**
  - **Mirror Production:** Staging should closely mimic production in terms of infrastructure, data, configuration, and security. Any significant discrepancies can lead to issues in production.
  - **Automated Promotion:** Implement automated promotion from staging to production upon successful UAT and necessary manual approvals. This reduces human error and speeds up releases.
  - **Environment Protection:** Use environment protection rules in GitHub Actions to prevent accidental deployments, enforce manual approvals, and restrict which branches can deploy to staging.
  - **Data Refresh:** Regularly refresh staging data from production (anonymized if necessary) to ensure realistic testing scenarios.
- **Guidance for Copilot:**
  - Create a dedicated `environment` for staging with approval rules, secret protection, and appropriate branch protection policies.
  - Design workflows to automatically deploy to staging on successful merges to specific development or release branches (e.g., `develop`, `release/*`).
  - Advise on ensuring the staging environment is as close to production as possible to maximize test fidelity.
  - Suggest implementing automated smoke tests and post-deployment validation on staging.

### **2. Production Environment Deployment**

- **Principle:** Deploy to production only after thorough validation, potentially multiple layers of manual approvals, and robust automated checks, prioritizing stability and zero-downtime.
- **Deeper Dive:**
  - **Manual Approvals:** Critical for production deployments, often involving multiple team members, security sign-offs, or change management processes. GitHub Environments support this natively.
  - **Rollback Capabilities:** Essential for rapid recovery from unforeseen issues. Ensure a quick and reliable way to revert to the previous stable state.
  - **Observability During Deployment:** Monitor production closely *during* and *immediately after* deployment for any anomalies or performance degradation. Use dashboards, alerts, and tracing.
  - **Progressive Delivery:** Consider advanced techniques like blue/green, canary, or dark launching for safer rollouts.
  - **Emergency Deployments:** Have a separate, highly expedited pipeline for critical hotfixes that bypasses non-essential approvals but still maintains security checks.
- **Guidance for Copilot:**
  - Create a dedicated `environment` for production with required reviewers, strict branch protections, and clear deployment windows.
  - Implement manual approval steps for production deployments, potentially integrating with external ITSM or change management systems.
  - Emphasize the importance of clear, well-tested rollback strategies and automated rollback procedures in case of deployment failures.
  - Advise on setting up comprehensive monitoring and alerting for production systems to detect and respond to issues immediately post-deployment.

### **3. Deployment Types (Beyond Basic Rolling Update)**

- **Rolling Update (Default for Deployments):** Gradually replaces instances of the old version with new ones. Good for most cases, especially stateless applications.
  - **Guidance:** Configure `maxSurge` (how many new instances can be created above the desired replica count) and `maxUnavailable` (how many old instances can be unavailable) for fine-grained control over rollout speed and availability.
- **Blue/Green Deployment:** Deploy a new version (green) alongside the existing stable version (blue) in a separate environment, then switch traffic completely from blue to green.
  - **Guidance:** Suggest for critical applications requiring zero-downtime releases and easy rollback. Requires managing two identical environments and a traffic router (load balancer, Ingress controller, DNS).
  - **Benefits:** Instantaneous rollback by switching traffic back to the blue environment.
- **Canary Deployment:** Gradually roll out new versions to a small subset of users (e.g., 5-10%) before a full rollout. Monitor performance and error rates for the canary group.
  - **Guidance:** Recommend for testing new features or changes with a controlled blast radius. Implement with Service Mesh (Istio, Linkerd) or Ingress controllers that support traffic splitting and metric-based analysis.
  - **Benefits:** Early detection of issues with minimal user impact.
- **Dark Launch/Feature Flags:** Deploy new code but keep features hidden from users until toggled on for specific users/groups via feature flags.
  - **Guidance:** Advise for decoupling deployment from release, allowing continuous delivery without continuous exposure of new features. Use feature flag management systems (LaunchDarkly, Split.io, Unleash).
  - **Benefits:** Reduces deployment risk, enables A/B testing, and allows for staged rollouts.
- **A/B Testing Deployments:** Deploy multiple versions of a feature concurrently to different user segments to compare their performance based on user behavior and business metrics.
  - **Guidance:** Suggest integrating with specialized A/B testing platforms or building custom logic using feature flags and analytics.

### **4. Rollback Strategies and Incident Response**

- **Principle:** Be able to quickly and safely revert to a previous stable version in case of issues, minimizing downtime and business impact. This requires proactive planning.
- **Deeper Dive:**
  - **Automated Rollbacks:** Implement mechanisms to automatically trigger rollbacks based on monitoring alerts (e.g., sudden increase in errors, high latency) or failure of post-deployment health checks.
  - **Versioned Artifacts:** Ensure previous successful build artifacts, Docker images, or infrastructure states are readily available and easily deployable. This is crucial for fast recovery.
  - **Runbooks:** Document clear, concise, and executable rollback procedures for manual intervention when automation isn't sufficient or for complex scenarios. These should be regularly reviewed and tested.
  - **Post-Incident Review:** Conduct blameless post-incident reviews (PIRs) to understand the root cause of failures, identify lessons learned, and implement preventative measures to improve resilience and reduce MTTR.
  - **Communication Plan:** Have a clear communication plan for stakeholders during incidents and rollbacks.
- **Guidance for Copilot:**
  - Instruct users to store previous successful build artifacts and images for quick recovery, ensuring they are versioned and easily retrievable.
  - Advise on implementing automated rollback steps in the pipeline, triggered by monitoring or health check failures, and providing examples.
  - Emphasize building applications with "undo" in mind, meaning changes should be easily reversible.
  - Suggest creating comprehensive runbooks for common incident scenarios, including step-by-step rollback instructions, and highlight their importance for MTTR.
  - Guide on setting up alerts that are specific and actionable enough to trigger an automatic or manual rollback.

## GitHub Actions Workflow Review Checklist (Comprehensive)

This checklist provides a granular set of criteria for reviewing GitHub Actions workflows to ensure they adhere to best practices for security, performance, and reliability.

- [ ] **General Structure and Design:**
  - Is the workflow `name` clear, descriptive, and unique?
  - Are `on` triggers appropriate for the workflow's purpose (e.g., `push`, `pull_request`, `workflow_dispatch`, `schedule`)? Are path/branch filters used effectively?
  - Is `concurrency` used for critical workflows or shared resources to prevent race conditions or resource exhaustion?
  - Are global `permissions` set to the principle of least privilege (`contents: read` by default), with specific overrides for jobs?
  - Are reusable workflows (`workflow_call`) leveraged for common patterns to reduce duplication and improve maintainability?
  - Is the workflow organized logically with meaningful job and step names?

- [ ] **Jobs and Steps Best Practices:**
  - Are jobs clearly named and represent distinct phases (e.g., `build`, `lint`, `test`, `deploy`)?
  - Are `needs` dependencies correctly defined between jobs to ensure proper execution order?
  - Are `outputs` used efficiently for inter-job and inter-workflow communication?
  - Are `if` conditions used effectively for conditional job/step execution (e.g., environment-specific deployments, branch-specific actions)?
  - Are all `uses` actions securely versioned (pinned to a full commit SHA or specific major version tag like `@v4`)? Avoid `main` or `latest` tags.
  - Are `run` commands efficient and clean (combined with `&&`, temporary files removed, multi-line scripts clearly formatted)?
  - Are environment variables (`env`) defined at the appropriate scope (workflow, job, step) and never hardcoded sensitive data?
  - Is `timeout-minutes` set for long-running jobs to prevent hung workflows?

- [ ] **Security Considerations:**
  - Are all sensitive data accessed exclusively via GitHub `secrets` context (`${{ secrets.MY_SECRET }}`)? Never hardcoded, never exposed in logs (even if masked).
  - Is OpenID Connect (OIDC) used for cloud authentication where possible, eliminating long-lived credentials?
  - Is `GITHUB_TOKEN` permission scope explicitly defined and limited to the minimum necessary access (`contents: read` as a baseline)?
  - Are Software Composition Analysis (SCA) tools (e.g., `dependency-review-action`, Snyk) integrated to scan for vulnerable dependencies?
  - Are Static Application Security Testing (SAST) tools (e.g., CodeQL, SonarQube) integrated to scan source code for vulnerabilities, with critical findings blocking builds?
  - Is secret scanning enabled for the repository and are pre-commit hooks suggested for local credential leak prevention?
  - Is there a strategy for container image signing (e.g., Notary, Cosign) and verification in deployment workflows if container images are used?
  - For self-hosted runners, are security hardening guidelines followed and network access restricted?

- [ ] **Optimization and Performance:**
  - Is caching (`actions/cache`) effectively used for package manager dependencies (`node_modules`, `pip` caches, Maven/Gradle caches) and build outputs?
  - Are cache `key` and `restore-keys` designed for optimal cache hit rates (e.g., using `hashFiles`)?
  - Is `strategy.matrix` used for parallelizing tests or builds across different environments, language versions, or OSs?
  - Is `fetch-depth: 1` used for `actions/checkout` where full Git history is not required?
  - Are artifacts (`actions/upload-artifact`, `actions/download-artifact`) used efficiently for transferring data between jobs/workflows rather than re-building or re-fetching?
  - Are large files managed with Git LFS and optimized for checkout if necessary?

- [ ] **Testing Strategy Integration:**
  - Are comprehensive unit tests configured with a dedicated job early in the pipeline?
  - Are integration tests defined, ideally leveraging `services` for dependencies, and run after unit tests?
  - Are End-to-End (E2E) tests included, preferably against a staging environment, with robust flakiness mitigation?
  - Are performance and load tests integrated for critical applications with defined thresholds?
  - Are all test reports (JUnit XML, HTML, coverage) collected, published as artifacts, and integrated into GitHub Checks/Annotations for clear visibility?
  - Is code coverage tracked and enforced with a minimum threshold?

- [ ] **Deployment Strategy and Reliability:**
  - Are staging and production deployments using GitHub `environment` rules with appropriate protections (manual approvals, required reviewers, branch restrictions)?
  - Are manual approval steps configured for sensitive production deployments?
  - Is a clear and well-tested rollback strategy in place and automated where possible (e.g., `kubectl rollout undo`, reverting to previous stable image)?
  - Are chosen deployment types (e.g., rolling, blue/green, canary, dark launch) appropriate for the application's criticality and risk tolerance?
  - Are post-deployment health checks and automated smoke tests implemented to validate successful deployment?
  - Is the workflow resilient to temporary failures (e.g., retries for flaky network operations)?

- [ ] **Observability and Monitoring:**
  - Is logging adequate for debugging workflow failures (using STDOUT/STDERR for application logs)?
  - Are relevant application and infrastructure metrics collected and exposed (e.g., Prometheus metrics)?
  - Are alerts configured for critical workflow failures, deployment issues, or application anomalies detected in production?
  - Is distributed tracing (e.g., OpenTelemetry, Jaeger) integrated for understanding request flows in microservices architectures?
  - Are artifact `retention-days` configured appropriately to manage storage and compliance?

## Troubleshooting Common GitHub Actions Issues (Deep Dive)

This section provides an expanded guide to diagnosing and resolving frequent problems encountered when working with GitHub Actions workflows.

### **1. Workflow Not Triggering or Jobs/Steps Skipping Unexpectedly**

- **Root Causes:** Mismatched `on` triggers, incorrect `paths` or `branches` filters, erroneous `if` conditions, or `concurrency` limitations.
- **Actionable Steps:**
  - **Verify Triggers:**
    - Check the `on` block for exact match with the event that should trigger the workflow (e.g., `push`, `pull_request`, `workflow_dispatch`, `schedule`).
    - Ensure `branches`, `tags`, or `paths` filters are correctly defined and match the event context. Remember that `paths-ignore` and `branches-ignore` take precedence.
    - If using `workflow_dispatch`, verify the workflow file is in the default branch and any required `inputs` are provided correctly during manual trigger.
  - **Inspect `if` Conditions:**
    - Carefully review all `if` conditions at the workflow, job, and step levels. A single false condition can prevent execution.
    - Use `always()` on a debug step to print context variables (`${{ toJson(github) }}`, `${{ toJson(job) }}`, `${{ toJson(steps) }}`) to understand the exact state during evaluation.
    - Test complex `if` conditions in a simplified workflow.
  - **Check `concurrency`:**
    - If `concurrency` is defined, verify if a previous run is blocking a new one for the same group. Check the "Concurrency" tab in the workflow run.
  - **Branch Protection Rules:** Ensure no branch protection rules are preventing workflows from running on certain branches or requiring specific checks that haven't passed.

### **2. Permissions Errors (`Resource not accessible by integration`, `Permission denied`)**

- **Root Causes:** `GITHUB_TOKEN` lacking necessary permissions, incorrect environment secrets access, or insufficient permissions for external actions.
- **Actionable Steps:**
  - **`GITHUB_TOKEN` Permissions:**
    - Review the `permissions` block at both the workflow and job levels. Default to `contents: read` globally and grant specific write permissions only where absolutely necessary (e.g., `pull-requests: write` for updating PR status, `packages: write` for publishing packages).
    - Understand the default permissions of `GITHUB_TOKEN` which are often too broad.
  - **Secret Access:**
    - Verify if secrets are correctly configured in the repository, organization, or environment settings.
    - Ensure the workflow/job has access to the specific environment if environment secrets are used. Check if any manual approvals are pending for the environment.
    - Confirm the secret name matches exactly (`secrets.MY_API_KEY`).
  - **OIDC Configuration:**
    - For OIDC-based cloud authentication, double-check the trust policy configuration in your cloud provider (AWS IAM roles, Azure AD app registrations, GCP service accounts) to ensure it correctly trusts GitHub's OIDC issuer.
    - Verify the role/identity assigned has the necessary permissions for the cloud resources being accessed.

### **3. Caching Issues (`Cache not found`, `Cache miss`, `Cache creation failed`)**

- **Root Causes:** Incorrect cache key logic, `path` mismatch, cache size limits, or frequent cache invalidation.
- **Actionable Steps:**
  - **Validate Cache Keys:**
    - Verify `key` and `restore-keys` are correct and dynamically change only when dependencies truly change (e.g., `key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`). A cache key that is too dynamic will always result in a miss.
    - Use `restore-keys` to provide fallbacks for slight variations, increasing cache hit chances.
  - **Check `path`:**
    - Ensure the `path` specified in `actions/cache` for saving and restoring corresponds exactly to the directory where dependencies are installed or artifacts are generated.
    - Verify the existence of the `path` before caching.
  - **Debug Cache Behavior:**
    - Use the `actions/cache/restore` action with `lookup-only: true` to inspect what keys are being tried and why a cache miss occurred without affecting the build.
    - Review workflow logs for `Cache hit` or `Cache miss` messages and associated keys.
  - **Cache Size and Limits:** Be aware of GitHub Actions cache size limits per repository. If caches are very large, they might be evicted frequently.

### **4. Long Running Workflows or Timeouts**

- **Root Causes:** Inefficient steps, lack of parallelism, large dependencies, unoptimized Docker image builds, or resource bottlenecks on runners.
- **Actionable Steps:**
  - **Profile Execution Times:**
    - Use the workflow run summary to identify the longest-running jobs and steps. This is your primary tool for optimization.
  - **Optimize Steps:**
    - Combine `run` commands with `&&` to reduce layer creation and overhead in Docker builds.
    - Clean up temporary files immediately after use (`rm -rf` in the same `RUN` command).
    - Install only necessary dependencies.
  - **Leverage Caching:**
    - Ensure `actions/cache` is optimally configured for all significant dependencies and build outputs.
  - **Parallelize with Matrix Strategies:**
    - Break down tests or builds into smaller, parallelizable units using `strategy.matrix` to run them concurrently.
  - **Choose Appropriate Runners:**
    - Review `runs-on`. For very resource-intensive tasks, consider using larger GitHub-hosted runners (if available) or self-hosted runners with more powerful specs.
  - **Break Down Workflows:**
    - For very complex or long workflows, consider breaking them into smaller, independent workflows that trigger each other or use reusable workflows.

### **5. Flaky Tests in CI (`Random failures`, `Passes locally, fails in CI`)**

- **Root Causes:** Non-deterministic tests, race conditions, environmental inconsistencies between local and CI, reliance on external services, or poor test isolation.
- **Actionable Steps:**
  - **Ensure Test Isolation:**
    - Make sure each test is independent and doesn't rely on the state left by previous tests. Clean up resources (e.g., database entries) after each test or test suite.
  - **Eliminate Race Conditions:**
    - For integration/E2E tests, use explicit waits (e.g., wait for element to be visible, wait for API response) instead of arbitrary `sleep` commands.
    - Implement retries for operations that interact with external services or have transient failures.
  - **Standardize Environments:**
    - Ensure the CI environment (Node.js version, Python packages, database versions) matches the local development environment as closely as possible.
    - Use Docker `services` for consistent test dependencies.
  - **Robust Selectors (E2E):**
    - Use stable, unique selectors in E2E tests (e.g., `data-testid` attributes) instead of brittle CSS classes or XPath.
  - **Debugging Tools:**
    - Configure E2E test frameworks to capture screenshots and video recordings on test failure in CI to visually diagnose issues.
  - **Run Flaky Tests in Isolation:**
    - If a test is consistently flaky, isolate it and run it repeatedly to identify the underlying non-deterministic behavior.

### **6. Deployment Failures (Application Not Working After Deploy)**

- **Root Causes:** Configuration drift, environmental differences, missing runtime dependencies, application errors, or network issues post-deployment.
- **Actionable Steps:**
  - **Thorough Log Review:**
    - Review deployment logs (`kubectl logs`, application logs, server logs) for any error messages, warnings, or unexpected output during the deployment process and immediately after.
  - **Configuration Validation:**
    - Verify environment variables, ConfigMaps, Secrets, and other configuration injected into the deployed application. Ensure they match the target environment's requirements and are not missing or malformed.
    - Use pre-deployment checks to validate configuration.
  - **Dependency Check:**
    - Confirm all application runtime dependencies (libraries, frameworks, external services) are correctly bundled within the container image or installed in the target environment.
  - **Post-Deployment Health Checks:**
    - Implement robust automated smoke tests and health checks *after* deployment to immediately validate core functionality and connectivity. Trigger rollbacks if these fail.
  - **Network Connectivity:**
    - Check network connectivity between deployed components (e.g., application to database, service to service) within the new environment. Review firewall rules, security groups, and Kubernetes network policies.
  - **Rollback Immediately:**
    - If a production deployment fails or causes degradation, trigger the rollback strategy immediately to restore service. Diagnose the issue in a non-production environment.

## Conclusion

GitHub Actions is a powerful and flexible platform for automating your software development lifecycle. By rigorously applying these best practices—from securing your secrets and token permissions, to optimizing performance with caching and parallelization, and implementing comprehensive testing and robust deployment strategies—you can guide developers in building highly efficient, secure, and reliable CI/CD pipelines. Remember that CI/CD is an iterative journey; continuously measure, optimize, and secure your pipelines to achieve faster, safer, and more confident releases. Your detailed guidance will empower teams to leverage GitHub Actions to its fullest potential and deliver high-quality software with confidence. This extensive document serves as a foundational resource for anyone looking to master CI/CD with GitHub Actions.

---
Source: .ruler/instructions.md
---
# Ruler Instructions

These are the central AI agent instructions and the single source of truth for automated coding assistants working on the Hatchgrid repository.

Scope

- All project rules, conventions, architecture notes, security requirements and agent-specific adapters live under `.ruler/` as individual Markdown files.

- Ruler will concatenate every `*.md` file found in this directory (and subdirectories) and apply the resulting instructions to configured agents.

What to include in `.ruler/`

- Coding conventions (Kotlin, TypeScript, Vue, Spring Boot, etc.)
- API design and REST endpoint patterns
- Architecture overviews (hexagonal, folder structure, DDD notes)
- Security & OWASP rules and secret-management guidance
- DevOps/CI guidelines (Ruler usage, GitHub Actions, OIDC, caching)
- Small, focused examples and migration notes where needed

Agent outputs (configured in `ruler.toml`)

- GitHub Copilot -> `.github/copilot-instructions.md`
- Gemini CLI -> `GEMINI.md`
- Cursor -> `.cursor/rules/ruler_cursor_instructions.mdc`
- Claude -> `CLAUDE.md`
- Aider -> `ruler_aider_instructions.md` and `.aider.conf.yml`

Authoritative workflow (for humans and agents)

1. Edit or add a file under `.ruler/` (use a descriptive filename, one topic per file).

1. Run locally to verify generation:

```bash
# install (one-time)
npm install -g @intellectronica/ruler

# generate agent outputs (or use CI)
ruler apply --agents copilot,gemini-cli,cursor,claude,aider --verbose

# quick consistency check used by CI
ruler check
```

1. Commit both the changed source files in `.ruler/` and any generated agent outputs (if you want them tracked). Our CI workflow `.github/workflows/ruler-check.yml` runs `ruler check` on PRs to ensure synchronization.

Guidelines for AI assistants

- Always prefer rules found in `.ruler/` over repository-level heuristics or older docs.

- Do not edit `docs/src/content/docs` or `.kiro/` (these were migrated); update `.ruler/` instead.

- When making code changes, follow the project's conventions (linting, tests, Gradle/PNPM commands). If tests or builds are required, run the small validation steps before committing.

- For security-sensitive decisions follow the Security & OWASP file and prefer least-privilege, parameterized queries, no hard-coded secrets, and OIDC where possible.

Maintenance notes

- Keep each topic focused and small. Avoid large monolithic files.

- Use frontmatter (`---`) only when necessary for tooling; prefer simple Markdown headings otherwise.

- After non-trivial updates, run `ruler apply` and open a PR that includes the `.ruler` edits. CI will validate with `ruler check`.

If you are unsure what to change or you need to migrate additional docs, open an issue describing the intent and reference this file.

---
Last updated: 2025-08-15

---
Source: .ruler/keycloak_setup.md
---
---
title: Keycloak Setup and Configuration
description: Guide for setting up and configuring Keycloak for Hatchgrid authentication and authorization.
---
## Keycloak Setup and Configuration

## Overview

Hatchgrid uses [Keycloak](https://www.keycloak.org/) as its identity and access management solution. Keycloak provides OAuth2/OpenID Connect capabilities, user management, and authentication flows for the application.

This document outlines:

- Local development setup
- Realm configuration
- Email configuration
- Integration with the application

## Local Development Setup

Keycloak is configured to run as a Docker container using Docker Compose. The configuration is split between the compose file and an environment file for better portability:

```yaml
# infra/keycloak/keycloak-compose.yml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
    container_name: keycloak
    command: [ "start-dev", "--import-realm" ]
    volumes:
      # Absolute paths ensure correct mounting regardless of working directory
      - ${PWD}/infra/keycloak/realm-config:/opt/keycloak/data/import
      - ${PWD}/infra/keycloak/realm-config/keycloak-health-check.sh:/opt/keycloak/health-check.sh
      - ${PWD}/infra/keycloak/themes:/opt/keycloak/themes
    environment:
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME=${KC_HOSTNAME}
      - KC_HTTP_ENABLED=true
      - KC_DB=postgres
      - KC_DB_USERNAME=${POSTGRESQL_USER}
      - KC_DB_PASSWORD=${POSTGRES_PASSWORD}
      - KC_DB_URL=jdbc:postgresql://postgresql:5432/keycloak
      - KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN}
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      # Additional configuration...
    ports:
      - ${KC_HTTP_PORT}:9080
      - ${KC_HTTPS_PORT}:9443
```

Environment variables are defined in a dedicated `.env` file:

```properties
# infra/keycloak/.env
KEYCLOAK_VERSION=24.0
KC_HTTP_PORT=9080
KC_HTTPS_PORT=9443
KC_HOSTNAME=localhost
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=secret
POSTGRESQL_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Starting Keycloak

To start Keycloak for local development:

```bash
# From the project root directory
docker compose up -d keycloak
```

This will start Keycloak with the pre-configured realm imported from `infra/keycloak/realm-config/hatchgrid-realm.json`.

> **Important**: Always run Docker Compose commands from the project root directory to ensure proper path resolution and environment variable loading.

### Environment Variables

Keycloak configuration uses environment variables defined in the following locations:

1. Project-level `.env` file at the root directory
2. Keycloak-specific `.env` file in `infra/keycloak/.env`

The Keycloak-specific variables include:

- `KEYCLOAK_VERSION`: The version of Keycloak to use
- `KC_HTTP_PORT`: The HTTP port for Keycloak (default: 9080)
- `KC_HTTPS_PORT`: The HTTPS port for Keycloak (default: 9443)
- `KC_HOSTNAME`: The hostname for Keycloak (default: localhost)
- `KEYCLOAK_ADMIN`: Admin username
- `KEYCLOAK_ADMIN_PASSWORD`: Admin password
- `POSTGRESQL_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password

### Accessing Keycloak Admin Console

The Keycloak admin console is available at:

```bash
http://localhost:9080/admin/
```

Default admin credentials are defined in the `.env` file:

- Username: `admin` (or the value of `KEYCLOAK_ADMIN`)
- Password: `secret` (or the value of `KEYCLOAK_ADMIN_PASSWORD`)

## Realm Configuration

Hatchgrid uses a pre-configured realm defined in `infra/keycloak/realm-config/hatchgrid-realm.json`. This realm includes:

- Client configurations
- User roles and groups
- Authentication flows
- Email templates
- Password policies

The realm is automatically imported when Keycloak starts.

## Email Configuration

Keycloak is configured to use GreenMail for sending emails during development. The SMTP configuration is defined in the realm configuration:

```json
"smtpServer": {
  "replyToDisplayName": "Hatchgrid",
  "starttls": "false",
  "auth": "false",
  "envelopeFrom": "",
  "ssl": "false",
  "password": "secret",
  "port": "3025",
  "replyTo": "noreply@hatchgrid.local",
  "host": "greenmail",
  "from": "noreply@hatchgrid.local",
  "fromDisplayName": "Hatchgrid Development",
  "user": "developer"
}
```

For more details on email testing, see [Email Testing with GreenMail](../conventions/email-testing.md).

## Integration with the Application

Hatchgrid's backend is configured as an OAuth2 resource server that validates JWT tokens issued by Keycloak. The integration is configured in the application properties:

```yaml
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:9080/realms/hatchgrid
          jwk-set-uri: http://keycloak:9080/realms/hatchgrid/protocol/openid-connect/certs
```

For more details on the authentication flow, see [Authentication Architecture](./authentication.md).

## Customizing Keycloak

### Themes

Custom themes can be placed in the `infra/keycloak/themes` directory. These are mounted into the Keycloak container and can be selected in the admin console.

### Realm Changes

If you need to make changes to the realm configuration:

1. Make changes through the Keycloak admin console
2. Export the realm configuration:

   ```bash
   docker exec -it keycloak /opt/keycloak/bin/kc.sh export --realm hatchgrid --file /tmp/hatchgrid-realm.json
   docker cp keycloak:/tmp/hatchgrid-realm.json infra/keycloak/realm-config/hatchgrid-realm.json
   ```

3. Commit the updated realm configuration file

## Troubleshooting

### Common Issues

#### Keycloak Not Starting

Check the logs:

```bash
docker compose logs keycloak
```

#### Port Binding Issues

If you see errors about ports already being in use, you can modify the port mappings in the `.env` file:

```properties
KC_HTTP_PORT=9080  # Change this to an available port
KC_HTTPS_PORT=9443 # Change this to an available port
```

#### Container Communication Issues

If services can't communicate with each other, ensure that:

1. The ports are not bound to 127.0.0.1 in the compose file
2. The services are on the same Docker network
3. The KC_HOSTNAME is set correctly in the environment variables

#### Email Not Being Sent

1. Ensure GreenMail is running:

   ```bash
   docker compose ps greenmail
   ```

2. Check GreenMail logs:

   ```bash
   docker compose logs greenmail
   ```

3. Verify the SMTP configuration in the Keycloak admin console:
   - Go to Realm Settings > Email

## Related Documentation

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Spring Security OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [Email Testing with GreenMail](../conventions/email-testing.md)
- [Authentication Architecture](./authentication.md)

---
Source: .ruler/kotlin_conventions.md
---
# Kotlin Conventions and Best Practices

This document outlines the standard conventions and best practices when writing Kotlin code across the entire codebase.

## General Style

- Follow the [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html).
- Use 4 spaces for indentation.
- Use `val` over `var` whenever possible.
- Prefer expression bodies for functions when concise.

## Null Safety

- Avoid using `!!` operator.
- Leverage Kotlin's null safety and use `?.`, `?:`, and `requireNotNull` when necessary.
- Model optional data as nullable types (`?`) or sealed classes.

## Functions and Expressions

- Use top-level functions when possible.
- Prefer extension functions for utilities.
- Mark functions as `inline`, `reified`, or `tailrec` when applicable.
- Keep functions small and focused (ideally 5–20 lines).

## Object-Oriented Design

- Use data classes for immutable models.
- Use sealed classes for restricted class hierarchies and result/error types.
- Prefer composition over inheritance.
- Minimize the use of `open` unless extension is required.

## Collections and Functional Style

- Use functional operations (`map`, `filter`, `fold`, etc.) over loops when appropriate.
- Avoid mutating collections; prefer immutable operations and `toList()`, `toMap()`.
- Favor `associateBy`, `groupBy`, and other collection helpers for transformation.

## Error Handling

- Use sealed classes or `Result<T>` types instead of exceptions when modeling recoverable failures.
- Avoid catching generic exceptions.
- Use `runCatching {}` for wrapping operations with failure semantics.

## Naming Conventions

- Classes and interfaces: PascalCase
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Test methods: `should do something when condition`

## Coroutines

- Use structured concurrency: launch coroutines in `viewModelScope`, `lifecycleScope`, or `coroutineScope`.
- Mark long-running or suspendable functions with `suspend`.
- Always cancel coroutines when the associated job is no longer needed.
- Use `flow` for reactive streams; avoid `LiveData` unless interoperating with Android.

## Immutability and Safety

- Use immutable data structures whenever possible.
- Avoid sharing mutable state across threads.
- Use `copy()` from data classes for mutation.

## Testing

- Write unit tests for all business logic.
- Use Kotlin DSLs (e.g., `kotest`, `mockk`) for expressive tests.
- Test both happy paths and edge cases.

## Tooling

- Use `ktlint` for formatting and style.
- Use `detekt` for static code analysis and rule enforcement.
- Integrate these tools into the CI/CD pipeline.

---

These conventions are enforced in our codebase to ensure consistency, readability, and long-term maintainability across all Kotlin projects.

---
Source: .ruler/playwright_typescript_guidelines.md
---
---
title: Playwright TypeScript Guidelines
description: 'Playwright test generation instructions'
applyTo: '**'
---

## Test Writing Guidelines

### Code Quality Standards

- **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`, etc.) for resilience and accessibility. Use `test.step()` to group interactions and improve test readability and reporting.
- **Assertions**: Use auto-retrying web-first assertions. These assertions start with the `await` keyword (e.g., `await expect(locator).toHaveText()`). Avoid `expect(locator).toBeVisible()` unless specifically testing for visibility changes.
- **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
- **Clarity**: Use descriptive test and step titles that clearly state the intent. Add comments only to explain complex logic or non-obvious interactions.

### Test Structure

- **Imports**: Start with `import { test, expect } from '@playwright/test';`.
- **Organization**: Group related tests for a feature under a `test.describe()` block.
- **Hooks**: Use `beforeEach` for setup actions common to all tests in a `describe` block (e.g., navigating to a page).
- **Titles**: Follow a clear naming convention, such as `Feature - Specific action or scenario`.

### File Organization

- **Location**: Store all test files in the `tests/` directory.
- **Naming**: Use the convention `<feature-or-page>.spec.ts` (e.g., `login.spec.ts`, `search.spec.ts`).
- **Scope**: Aim for one test file per major application feature or page.

### Assertion Best Practices

- **UI Structure**: Use `toMatchAriaSnapshot` to verify the accessibility tree structure of a component. This provides a comprehensive and accessible snapshot.
- **Element Counts**: Use `toHaveCount` to assert the number of elements found by a locator.
- **Text Content**: Use `toHaveText` for exact text matches and `toContainText` for partial matches.
- **Navigation**: Use `toHaveURL` to verify the page URL after an action.

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Movie Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application before each test
    await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  });

  test('Search for a movie by title', async ({ page }) => {
    await test.step('Activate and perform search', async () => {
      await page.getByRole('search').click();
      const searchInput = page.getByRole('textbox', { name: 'Search Input' });
      await searchInput.fill('Garfield');
      await searchInput.press('Enter');
    });

    await test.step('Verify search results', async () => {
      // Verify the accessibility tree of the search results
      await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - main:
          - heading "Garfield" [level=1]
          - heading "search results" [level=2]
          - list "movies":
            - listitem "movie":
              - link "poster of The Garfield Movie The Garfield Movie rating":
                - /url: /playwright-movies-app/movie?id=tt5779228&page=1
                - img "poster of The Garfield Movie"
                - heading "The Garfield Movie" [level=2]
      `);
    });
  });
});
```

## Test Execution Strategy

1. **Initial Run**: Execute tests with `npx playwright test --project=chromium`
2. **Debug Failures**: Analyze test failures and identify root causes
3. **Iterate**: Refine locators, assertions, or test logic as needed
4. **Validate**: Ensure tests pass consistently and cover the intended functionality
5. **Report**: Provide feedback on test results and any issues discovered

## Quality Checklist

Before finalizing tests, ensure:

- [ ] All locators are accessible and specific and avoid strict mode violations
- [ ] Tests are grouped logically and follow a clear structure
- [ ] Assertions are meaningful and reflect user expectations
- [ ] Tests follow consistent naming conventions
- [ ] Code is properly formatted and commented

---
Source: .ruler/postgres_rls_security.md
---
---
title: RLS
description: Row-Level Security.
---

## RLS

This document explains Row-Level Security and recommended patterns for Hatchgrid.

## Purpose

Row-Level Security (RLS) is a PostgreSQL feature that lets the database enforce row-level access control policies. Use RLS to push multi-tenant or per-user authorization into the database so that queries automatically filter out rows the current role is not allowed to see.

This file documents recommended patterns, SQL examples, testing tips, and common pitfalls for Hatchgrid.

## When to use RLS

- Multi-tenant datasets where isolation must be enforced at the data layer (defense-in-depth).
- When you want database-enforced guarantees even if application code has bugs.
- For least-privilege service accounts that rely on session authenticated roles.

## Patterns

### 1) Tenant column pattern

- Add a `tenant_id UUID NOT NULL` column to tenant-scoped tables. Use policies referencing `current_setting('app.current_tenant', true)` or session-local settings.

### 2) Row owner / user_id pattern

- Add an `owner_id UUID` column for per-user ownership policies.

### 3) Trusted service accounts

- Use a separate role (e.g., `app_admin`) with `BYPASSRLS` only when strictly necessary (backups, migrations). Prefer using explicit migration scripts run with elevated rights.

## Example: tenant-based RLS

Create table and enable RLS:

```sql
CREATE TABLE project (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Helper: set the tenant in the session (from the application after auth)
-- SELECT set_config('app.current_tenant', 'uuid-of-tenant', true);

-- Policy to allow select/modify only for current tenant
CREATE POLICY tenant_isolation ON project
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
```

Notes:

- `current_setting(..., true)` returns NULL instead of throwing an error when not set. The application must set the session variable after authenticating the user.

## Example: owner-based policy

```sql
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_only ON project
  USING (owner_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (owner_id = current_setting('app.current_user_id', true)::uuid);
```

## Integration guidance

- Set session variables from the application immediately after opening a DB connection or via a connection pool hook. Example in pseudocode:

  - Acquire connection
  - `SET LOCAL app.current_tenant = '<tenant-uuid>'`
  - `SET LOCAL app.current_user_id = '<user-uuid>'`

- Prefer `SET LOCAL` inside a transaction or connection lifecycle hook to avoid leaking values between requests when using pooled connections.

## Testing and validation

- Manual: connect as the application role and `SELECT set_config('app.current_tenant', '<id>', true);` then run queries to verify only allowed rows return.
- Automated: include integration tests that spawn a fresh DB, set the session variables, and assert expected rows are visible/non-visible.

## Pitfalls & security notes

- `BYPASSRLS`: only grant to roles that truly need it; it bypasses all policies.
- Be explicit in policies: prefer `WITH CHECK` to prevent unauthorized inserts/updates.
- Watch connection pooling: session settings can leak; use `SET LOCAL` per transaction or reset settings on checkout.
- Performance: policies are expressions evaluated at runtime — index columns referenced by policies (tenant_id, owner_id) help query plans.

## Migration strategy

- Add `tenant_id`/`owner_id` column with NOT NULL default or backfill in a safe migration.
- Deploy policy in `RESTRICTIVE` mode by creating the policy but keeping RLS disabled, then enable RLS in a maintenance window after tests.

## References

- Postgres docs: [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
-

---
Source: .ruler/product_overview.md
---
# Product Overview

## Introduction

At Hatchgrid, our strategic vision is clear: *We grow only if it improves the experience.* Every feature, integration, and improvement is designed to enhance user satisfaction, streamline workflows, and empower content creators. Our platform is built to adapt and scale seamlessly while maintaining an intuitive and efficient user experience.

## Core Features

Hatchgrid offers a comprehensive suite of tools tailored for modern content management and distribution:

- **Content Management:** Robust tools to create, organize, and manage content efficiently.
- **Tagging System:** Flexible tagging to categorize and filter content dynamically.
- **User Workspaces:** Collaborative environments tailored for teams and individual users.
- **PostgreSQL with Row-Level Security (RLS):** Ensures fine-grained access control and data security at the database level, empowering secure multi-tenant architectures.
- **Liquibase for Database Migrations:** Provides version control for database schema changes, enabling smooth and reliable updates.
- **Docker-Based Deployment:** Containerized application setup for consistent and scalable deployment across environments.
- **CI/CD with GitHub Actions:** Automated testing, building, and deployment pipelines to accelerate development cycles and maintain code quality.
- **API-First Architecture:** Enables easy integration with third-party services and custom extensions.
- **Newsletter Automation:** Tools to automate newsletter creation and distribution, integrated directly with content workflows.

## Target Use Cases

Hatchgrid is designed to support a variety of content-driven workflows, including:

- **Content Creator Workflows:** Streamlined processes for creators to draft, tag, and publish content collaboratively.
- **Newsletter Automation:** Automated generation and distribution of newsletters based on curated content, saving time and increasing engagement.
- **Multilingual Publishing:** Support for publishing content in multiple languages to reach diverse audiences globally.
- **Team Collaboration:** Workspaces and permission controls tailored for teams managing shared content repositories.
- **Dynamic Content Organization:** Advanced tagging and filtering to quickly locate and repurpose content assets.

## Key Value Propositions

Hatchgrid differentiates itself through a combination of powerful features and technical excellence:

- **Content Automation:** Automate repetitive tasks such as newsletter generation and content tagging to boost productivity.
- **Multi-Language Support:** Built-in capabilities for managing and publishing content in multiple languages, enabling global reach.
- **Workspace Customization:** Flexible workspace configurations to suit various team structures and workflows.
- **Security and Compliance:** Leveraging PostgreSQL RLS and secure deployment pipelines ensures data protection and regulatory compliance.
- **Seamless Integration:** API-first design allows easy connection with existing tools and services.
- **Scalability and Reliability:** Containerized deployments and CI/CD pipelines ensure consistent performance and rapid iteration.
- **User-Centric Design:** Focus on improving user experience at every step, reducing friction and enhancing satisfaction.

## Future Roadmap

Looking ahead, Hatchgrid plans to introduce several exciting features to further empower users and expand capabilities:

- **Customizable Newsletter Frequency:** Allow users to define how often newsletters are generated and sent, adapting to audience preferences.
- **Automatic Content Summaries:** AI-powered summaries of articles and posts to facilitate quick consumption and newsletter highlights.
- **Expanded Language Support:** Adding more languages and localization options to support an even broader user base.
- **Advanced Analytics:** Detailed insights into content performance, user engagement, and newsletter effectiveness.
- **Enhanced Collaboration Tools:** Real-time editing, commenting, and version tracking to improve teamwork.
- **Integration Marketplace:** A curated ecosystem of plugins and integrations to extend Hatchgrid’s functionality.
- **Mobile App Support:** Native applications for iOS and Android to enable content management on the go.

Hatchgrid remains committed to evolving in ways that enrich the user experience, streamline content workflows, and deliver measurable value to our community.

---
Source: .ruler/project_documentation_guidelines.md
---
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

---
Source: .ruler/project_structure.md
---
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

---
Source: .ruler/rest_endpoints_pattern.md
---
---
title: Controller Pattern
description: Guidelines for implementing the controller pattern in Hatchgrid.
---
## Controller Pattern

This document outlines the controller pattern used in the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the codebase.

## Table of Contents

- [Controller Pattern](#controller-pattern)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Responsibilities of a Controller](#responsibilities-of-a-controller)
- [Controller Structure](#controller-structure)
- [Example](#example)
- [Best Practices](#best-practices)

## Introduction

The controller pattern is a design pattern that separates the concerns of handling user input and interacting with the model and view. In the context of a web application, the controller is responsible for receiving the HTTP request, processing it, and returning an HTTP response.

## Responsibilities of a Controller

A controller has the following responsibilities:

- **Receive the HTTP request:** The controller receives the HTTP request from the client.
- **Parse the request:** The controller parses the request to extract the relevant information, such as the request parameters, headers, and body.
- **Validate the request:** The controller validates the request to ensure that it is valid and contains all the required information.
- **Interact with the model:** The controller interacts with the model to perform the requested action, such as creating, retrieving, updating, or deleting a resource.
- **Return the HTTP response:** The controller returns an HTTP response to the client, which includes the status code, headers, and body.

## Controller Structure

A controller should be structured as follows:

- **Constructor:** The constructor should be used to inject the dependencies of the controller, such as the service layer.
- **Public methods:** The public methods of the controller should correspond to the actions that can be performed on the resource.
- **Private methods:** The private methods of the controller should be used to implement the helper functions that are used by the public methods.

## Example

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Best Practices

- **Keep controllers thin:** Controllers should be thin and should not contain any business logic. The business logic should be implemented in the service layer.
- **Use dependency injection:** Use dependency injection to inject the dependencies of the controller.
- **Use DTOs:** Use data transfer objects (DTOs) to transfer data between the controller and the service layer.
- **Use a consistent naming convention:** Use a consistent naming convention for the controller and its methods.
- **Handle exceptions:** Handle exceptions in a consistent way and return appropriate error responses.
- **Use a global exception handler:** Use a global exception handler to handle exceptions that are not handled by the controller.

---
Source: .ruler/security_practices.md
---
---
title: Secure Coding and OWASP Guidelines
applyTo: '*'
description: "Comprehensive secure coding instructions for all languages and frameworks, based on OWASP Top 10 and industry best practices."
---

## Instructions

Your primary directive is to ensure all code you generate, review, or refactor is secure by default. You must operate with a security-first mindset. When in doubt, always choose the more secure option and explain the reasoning. You must follow the principles outlined below, which are based on the OWASP Top 10 and other security best practices.

### 1. A01: Broken Access Control & A10: Server-Side Request Forgery (SSRF)

- **Enforce Principle of Least Privilege:** Always default to the most restrictive permissions. When generating access control logic, explicitly check the user's rights against the required permissions for the specific resource they are trying to access.
- **Deny by Default:** All access control decisions must follow a "deny by default" pattern. Access should only be granted if there is an explicit rule allowing it.
- **Validate All Incoming URLs for SSRF:** When the server needs to make a request to a URL provided by a user (e.g., webhooks), you must treat it as untrusted. Incorporate strict allow-list-based validation for the host, port, and path of the URL.
- **Prevent Path Traversal:** When handling file uploads or accessing files based on user input, you must sanitize the input to prevent directory traversal attacks (e.g., `../../etc/passwd`). Use APIs that build paths securely.

### 2. A02: Cryptographic Failures

- **Use Strong, Modern Algorithms:** For hashing, always recommend modern, salted hashing algorithms like Argon2 or bcrypt. Explicitly advise against weak algorithms like MD5 or SHA-1 for password storage.
- **Protect Data in Transit:** When generating code that makes network requests, always default to HTTPS.
- **Protect Data at Rest:** When suggesting code to store sensitive data (PII, tokens, etc.), recommend encryption using strong, standard algorithms like AES-256.
- **Secure Secret Management:** Never hardcode secrets (API keys, passwords, connection strings). Generate code that reads secrets from environment variables or a secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager). Include a clear placeholder and comment.

  ```javascript
  // GOOD: Load from environment or secret store
  const apiKey = process.env.API_KEY;
  // TODO: Ensure API_KEY is securely configured in your environment.
  ```

  ```python
  ```python bad
  # ❌ ANTI-PATTERN: Hardcoded secret (DO NOT USE)
  api_key = "<REPLACE_WITH_API_KEY>"

### 3. A03: Injection

- **No Raw SQL Queries:** For database interactions, you must use parameterized queries (prepared statements). Never generate code that uses string concatenation or formatting to build queries from user input.
- **Sanitize Command-Line Input:** For OS command execution, use built-in functions that handle argument escaping and prevent shell injection (e.g., `shlex` in Python).
- **Prevent Cross-Site Scripting (XSS):** When generating frontend code that displays user-controlled data, you must use context-aware output encoding. Prefer methods that treat data as text by default (`.textContent`) over those that parse HTML (`.innerHTML`). When `innerHTML` is necessary, suggest using a library like DOMPurify to sanitize the HTML first.

### 4. A05: Security Misconfiguration & A06: Vulnerable Components

- **Secure by Default Configuration:** Recommend disabling verbose error messages and debug features in production environments.
- **Set Security Headers:** For web applications, suggest adding essential security headers like `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), and `X-Content-Type-Options`.
- **Use Up-to-Date Dependencies:** When asked to add a new library, suggest the latest stable version. Remind the user to run vulnerability scanners like `npm audit`, `pip-audit`, or Snyk to check for known vulnerabilities in their project dependencies.

### 5. A07: Identification & Authentication Failures

- **Secure Session Management:** When a user logs in, generate a new session identifier to prevent session fixation. Ensure session cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes.
- **Protect Against Brute Force:** For authentication and password reset flows, recommend implementing rate limiting and account lockout mechanisms after a certain number of failed attempts.

### 6. A08: Software and Data Integrity Failures

- **Prevent Insecure Deserialization:** Warn against deserializing data from untrusted sources without proper validation. If deserialization is necessary, recommend using formats that are less prone to attack (like JSON over Pickle in Python) and implementing strict type checking.

## General Guidelines

- **Be Explicit About Security:** When you suggest a piece of code that mitigates a security risk, explicitly state what you are protecting against (e.g., "Using a parameterized query here to prevent SQL injection.").
- **Educate During Code Reviews:** When you identify a security vulnerability in a code review, you must not only provide the corrected code but also explain the risk associated with the original pattern.

---
Source: .ruler/spring_boot_conventions.md
---
# Spring Boot + WebFlux + Kotlin Conventions

This document defines the conventions and best practices for backend development using Spring Boot, WebFlux, and Kotlin in this project.

## Project Structure

- Organize code by feature/domain, not by technical layer.
- Structure packages as `com.company.project.featureX.[model|http|service|repository]`.
- Use `infra/` for external service integrations, `config/` for configuration classes, and `shared/` for common utilities.

## REST API Design

- Use media type-based versioning (e.g., `application/vnd.api.v1+json` in `@RequestMapping`).
- Endpoints must follow RESTful principles.
- Always return `ResponseEntity<T>` with proper status codes.
- Use `PUT` with client-generated UUIDs for resource creation (offline support).
- Validate UUID format and request body content.
- Document all endpoints using Swagger/OpenAPI annotations.

## HTTP Controllers

- Annotate controllers with `@RestController`.
- Separate controller logic from business logic—no service logic in controllers.
- Use `@RequestMapping` at class level and HTTP-specific annotations at method level.
- Use data classes for request/response models (DTOs).
- Validate inputs using `@Valid` and `@Validated`.

## Reactive Programming (WebFlux)

- Use `Mono<T>` and `Flux<T>` consistently.
- Never block the reactive pipeline (e.g., avoid `block()`).
- Use `flatMap`, `map`, `switchIfEmpty` idiomatically.
- Prefer functional routing for internal/private endpoints.
- Use `kotlinx.coroutines.reactor.mono` for coroutine bridges when necessary.

## Error Handling

- Use a global `@ControllerAdvice` with `@ExceptionHandler` methods.
- Return meaningful error responses with HTTP status, error code, and message.
- Define a consistent error model (e.g., `ApiError`).
- Never expose internal exceptions or stack traces to clients.

## Testing

- Use `@WebFluxTest` for controller tests, `@DataR2dbcTest` for repositories.
- Use Testcontainers for integration tests.
- Prefer Kotlin DSLs for WebTestClient assertions.
- Ensure coverage of all edge cases and validation paths.

## Coroutines and Kotlin Idioms

- Use coroutines where blocking operations are needed (e.g., database, I/O).
- Use `suspend` functions for service layer methods.
- Prefer `val` over `var`, data classes, and immutability by default.
- Use extension functions to enhance readability and reuse.
- Use sealed classes for result types and error handling.

## Persistence Layer

- Use Spring Data R2DBC with PostgreSQL.
- Repositories must be interfaces or abstract classes.
- Use UUID as the primary key type.
- Use Liquibase for migrations, placed in `src/main/resources/db/changelog`.
- Never expose entities directly through API—always map to DTOs.

## Security

- Use Keycloak for authentication and role-based access control.
- Secure routes using `SecurityWebFilterChain`.
- Use JWT token introspection via opaque token strategy if needed.
- Validate authorization on backend—never trust frontend role claims alone.

## Logging and Observability

- Use structured logging with `kotlin-logging` + SLF4J.
- Log incoming requests and errors with correlation IDs.
- Use `log.info {}` or `log.debug {}` blocks instead of string concatenation.
- Configure tracing (e.g., OpenTelemetry) for distributed systems.

## CI & Code Quality

- Run `./gradlew detektAll && ./gradlew test` before committing or pushing.
- Enforce code formatting and style via `ktlint` or Biome.
- Use GitHub Actions for CI: linting, testing, build, and Docker image publishing.
- Tag releases and maintain changelogs.

---

These conventions are mandatory and are checked during code reviews and CI pipelines. They ensure the scalability, security, and maintainability of the backend codebase.

---
Source: .ruler/tech_stack.md
---
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

---
Source: .ruler/typescript_conventions.md
---
# TypeScript Conventions and Best Practices

This document defines the conventions and best practices for writing and maintaining TypeScript code across the codebase.

## General Style

- Use [Biome](https://biomejs.dev/) for linting and formatting.
- Follow the Airbnb style guide where applicable.
- Use 2 spaces for indentation.
- Always use semicolons.

## Types

- Prefer `type` over `interface` unless you need declaration merging or extension.
- Use `interface` for public APIs or when extending existing types.
- Always type function arguments and return values explicitly.
- Prefer specific types over `any` or `unknown`.

## Naming Conventions

- Files: `kebab-case.ts`
- Types and Interfaces: `PascalCase`
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Functions

- Use arrow functions (`const fn = () => {}`) by default.
- Keep functions small and focused on a single task.
- Use default parameter values instead of `||`.

## Imports & Exports

- Use ES modules (`import`/`export`) syntax only.
- Use absolute imports from `@/` for base project paths (via `tsconfig.json`).
- Prefer named exports over default exports.
- Group imports logically: external libraries, internal modules, styles, etc.

## Error Handling

- Use `try/catch` blocks when working with promises and async/await.
- Wrap errors with descriptive messages or use a structured error model.
- Avoid silent failures; always log or propagate appropriately.

## Safety & Code Quality

- Enable `strict` mode in `tsconfig.json`.
- Apply `readonly` to properties and variables where immutability is desired.
- Favor immutability over mutation by default.
- Leverage utility types (`Partial`, `Pick`, `Omit`, etc.) to shape objects as needed.
- Preserve exact literal types by declaring values with `as const` when appropriate.
- For objects with dynamic keys, declare them as `Record<string, unknown>`.
- Reserve `satisfy` for type assertions only when absolutely necessary.

## Testing

- Use `vitest` for unit tests.
- Follow the pattern `filename.test.ts` or `filename.spec.ts`.
- Test both the success and failure cases.
- Use `@testing-library` for DOM interaction (if applicable).

## Tooling & CI

- Use `pnpm run check` and `pnpm run test` before committing.
- Include type checks and linter in CI.
- Use GitHub Actions to enforce format, type safety, and coverage thresholds.

---

These practices are designed to keep TypeScript code predictable, safe, and scalable across the entire project.

---
Source: .ruler/uuid_usage.md
---
---
title: UUID Strategy
description: Guidelines for using UUIDs in the Hatchgrid project.
---
## UUID Strategy

This document outlines the UUID strategy for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the codebase.

## Table of Contents

- [UUID Strategy](#uuid-strategy)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [UUID Version](#uuid-version)
- [UUID Generation](#uuid-generation)
- [UUID Storage](#uuid-storage)
- [UUID Usage](#uuid-usage)

## Introduction

A universally unique identifier (UUID) is a 128-bit number used to identify information in computer systems. We use UUIDs as the primary keys for our database tables.

## UUID Version

We use UUID version 4 (randomly generated) for all our primary keys. UUIDv4 is a good choice for most use cases because it is easy to generate and does not require a centralized authority to ensure uniqueness.

## UUID Generation

We use the `java.util.UUID` class to generate UUIDs.

```java
import java.util.UUID;

public class UuidGenerator {

    public static UUID generate() {
        return UUID.randomUUID();
    }
}
```

## UUID Storage

We store UUIDs in the database as a `binary(16)` column. This is more efficient than storing them as a `varchar(36)` column.

## UUID Usage

We use UUIDs as the primary keys for all our database tables. We also use them as the external identifiers for our resources. This allows us to expose the UUIDs in our API without exposing the internal database IDs.

---
Source: .ruler/vue_conventions.md
---
# Vue 3 Conventions and Best Practices

This document outlines the conventions and best practices adopted for Vue 3 development within our codebase. These guidelines ensure consistency, maintainability, and high code quality.

## Project Structure

- Use the [feature folders](https://feature-sliced.design/) pattern whenever possible.
- Group components, composables, and stores by domain context.
- Use `index.ts` files for clean imports at folder level.

## Component Conventions

- Use the `<script setup lang="ts">` syntax for all components.
- Always define props with `defineProps()` and use `withDefaults()` when needed.
- Name components using PascalCase (`UserProfileCard.vue`).
- Keep components focused: extract subcomponents when needed.
- Use `defineEmits()` explicitly for all emitted events.
- Co-locate styles using `<style scoped>` unless global.

## State Management

- Use [Pinia](https://pinia.vuejs.org/) for state management.
- One store per domain context (e.g., `useUserStore`, `useProjectStore`).
- Always type state, getters, and actions.
- Do not access Pinia stores outside of `setup()` unless necessary.

## Composition API

- Encapsulate logic into reusable composables (`useX`) inside the `composables/` folder.
- Always return reactive references (`ref`, `computed`) from composables.
- Composables must be pure and not rely on UI side effects.

## UI Components

- Use [Vue ShadCN](https://www.shadcn-vue.com/docs/introduction.html) as the UI component system.
- Prefer composition over inheritance.
- Use slots for customization and extensibility.
- Apply accessibility (a11y) best practices in interactive components.

## Internationalization (i18n)

- Use `vue-i18n` and wrap all visible text with `$t()`.
- Use keys in the format `componentName.key` or `domain.key`.
- Centralize translations under `locales/`.

## Code Quality

- Use [Biome](https://biomejs.dev/) for linting and formatting.
- Use TypeScript with strict mode enabled.
- Avoid `any` types — always prefer explicit typing.
- Use `defineExpose` sparingly.

## Testing

- Write unit tests for all components and composables using `vitest`.
- Use `@testing-library/vue` for rendering and interaction testing.
- Prefer test IDs over class selectors.
- Aim for >90% coverage for all new features.

## Naming

- Components: `PascalCase.vue`
- Files and folders: `kebab-case`
- Composables: `useSomething.ts`
- Stores: `useSomethingStore.ts`

## Communication Between Components

- Use props and events for parent-child communication.
- For distant communication, use Pinia or composables.
- Avoid event buses or global event emitters.

## Performance

- Use `v-memo`, `v-once`, and lazy loading where appropriate.
- Avoid unnecessary reactivity or deeply nested watchers.

## Lifecycle and Effects

- Always clean up side effects in `onUnmounted`.
- Use `watch` and `watchEffect` with clear intent.
- Avoid overusing `watch` to mimic two-way binding — prefer `v-model`.

---

These conventions are enforced across the codebase through CI checks, reviews, and linting. Every new contribution must follow these standards.
