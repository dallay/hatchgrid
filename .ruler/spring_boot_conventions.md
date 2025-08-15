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
