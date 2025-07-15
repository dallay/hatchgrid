# Guidelines for Hatchgrid

## Project Overview

Hatchgrid is a Spring Boot application built with Kotlin and Gradle, providing a reactive backend infrastructure. The project uses modern Spring technologies, including WebFlux, R2DBC, and OAuth2, and follows a modular architecture approach with Spring Modulith.

## Technology Stack

- **Language:** Kotlin 1.9+ with coroutines
- **Framework:** Spring Boot 3.4+
- **API:** Reactive REST APIs with Spring WebFlux
- **Database:** PostgreSQL with R2DBC for reactive data access
- **Database Migrations:** Liquibase
- **Authentication:** OAuth2 (Authorization Server, Resource Server, and Client)
- **Testing:** JUnit 5, Testcontainers
- **Documentation:** Spring REST Docs
- **Monitoring:** Spring Boot Actuator, Prometheus
- **Build Tool:** Gradle 8+

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

For a detailed guide on our development conventions, please refer to the documents in the [`docs/conventions`](../docs/conventions) directory. These documents cover everything from our REST API design to our security guidelines.
## Best Practices

- Include validation for all input data
- Implement proper error handling with meaningful error messages
- Configure appropriate logging at different levels
- Use Spring's reactive patterns consistently
- Follow the Single Responsibility Principle in class design
- Utilize Spring Boot's auto-configuration capabilities when possible
- Ensure proper security controls for all endpoints
- Include monitoring endpoints via Spring Boot Actuator

## AI Assistant Development Instructions for Hatchgrid

For AI Assistant development instructions, see [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
