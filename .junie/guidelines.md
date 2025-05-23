# Hatchgrid Development Guidelines

This document provides essential information for developers working on the Hatchgrid project.

## Project Overview
Hatchgrid is a Spring Boot application built with Kotlin and Gradle, providing a reactive backend infrastructure. The project uses modern Spring technologies including WebFlux, R2DBC, OAuth2, and follows a modular architecture approach with Spring Modulith.

## Build/Configuration Instructions

### Prerequisites
- JDK 21 or later
- Gradle 8.x or later (or use the included Gradle wrapper)
- Docker and Docker Compose

### Building the Project
```bash
./gradlew build
```

### Running the Application
There are two ways to run the application:

1. Using Gradle:
```bash
./gradlew bootRun
```

2. Using Java:
```bash
./gradlew build
java -jar build/libs/Hatchgrid-0.0.1-SNAPSHOT.jar
```

### Database Configuration
The application uses PostgreSQL as its database. The connection is configured through Docker Compose.

#### Docker Compose Configuration
The project includes a `compose.yaml` file that sets up a PostgreSQL database with the following configuration:
- Database name: mydatabase
- Username: myuser
- Password: secret
- Port: 5432 (mapped to a random port on the host)

Spring Boot's Docker Compose support will automatically start the required containers when you run the application.

#### Manual Docker Compose Commands
```bash
# Start the database
docker compose -f compose.yaml up -d

# Stop the database
docker compose -f compose.yaml down
```

### Database Migrations
This project uses Liquibase for database migrations. The changelog file is located at:
```
src/main/resources/db/changelog/db.changelog-master.yaml
```

## Testing Information

### Testing Framework
The project uses JUnit 5 and Mockk for testing, along with:
- Spring Boot Test for integration testing
- Testcontainers for database testing
- Spring REST Docs for API documentation

### Running Tests
To run all tests:
```bash
./gradlew test
```

To run a specific test class:
```bash
./gradlew test --tests "com.hatchgrid.thryve.ExampleTest"
```

### Test Configuration
Tests that require a database use Testcontainers to automatically spin up a PostgreSQL container. The configuration is in `TestcontainersConfiguration.kt`.

### Adding New Tests
1. Create a new test class in the `src/test/kotlin/com/hatchgrid/thryve` directory
2. Annotate the class with `@UnitTest` for unit tests or `@IntegrationTest` for integration tests
3. Add test methods annotated with `@Test`

### Example Test
Here's a simple example test:

```kotlin
// File: src/test/kotlin/com/hatchgrid/thryve/ExampleTest.kt
@UnitTest
class ExampleTest {

    @Test
    fun simpleAdditionTest() {
        // A simple test to demonstrate testing
        val result = 2 + 2
        assertEquals(4, result, "2 + 2 should equal 4")
    }
}
```

### Debugging Tests
You can add debug logging to your tests:
```kotlin
println("[DEBUG_LOG] Your debug message here")
```

### Testing Guidelines
- Write unit tests for all business logic
- Use Testcontainers for integration tests with real PostgreSQL instances
- Prefer reactive testing utilities (StepVerifier, WebTestClient)
- Follow BDD-style naming for test methods (should_doSomething_when_condition)
- Maintain test coverage for critical components

### Known Issues
There is a warning about Mockito's self-attaching mechanism that will need to be addressed in future JDK releases:
```
Mockito is currently self-attaching to enable the inline-mock-maker. This will no longer work in future releases of the JDK.
```

## Additional Development Information

### Project Structure
The project follows a hexagonal architecture pattern:
- `src/main/kotlin/com/hatchgrid/thryve` - Main application code
  - `application` - Application services and use cases
  - `domain` - Domain models and business logic
  - `infrastructure` - External dependencies and adapters
- `src/main/resources` - Configuration files and resources
- `src/test/kotlin` - Test source files
- `src/main/resources/db/changelog` - Liquibase database migration files

### Key Technologies
- Spring Boot 3.4.5
- Kotlin 1.9.25
- Reactive programming with Spring WebFlux
- OAuth2 Authorization Server
- Spring Security
- Spring Data R2DBC for reactive database access
- Liquibase for database migrations
- Spring Boot Admin for application monitoring
- Docker Compose support
- Testcontainers for integration testing

### Coding Conventions
- Follow Kotlin coding conventions with 4-space indentation
- Use functional and extension-based approaches where appropriate
- Utilize Kotlin coroutines for asynchronous operations
- Prefer immutability with `val` over `var`
- Implement reactive patterns using Spring WebFlux and R2DBC
- Document public APIs and complex functions with KDoc
- Follow domain-driven design principles
- Use value objects for domain concepts
- Use CQRS pattern with commands and responses
- Use event-driven architecture with event publishing
- Proper error handling with specific exceptions
- Logging with SLF4J

### API Documentation
API documentation is generated using Spring REST Docs and is available at:
```
build/generated-snippets
```

### Monitoring
The application includes Spring Boot Actuator endpoints for monitoring:
- Health check: `/actuator/health`
- Metrics: `/actuator/metrics`
- Prometheus metrics: `/actuator/prometheus`

## Common Development Tasks
- Database schema changes should be added as Liquibase migrations
- Security configurations should follow the principle of least privilege
- REST endpoints should follow RESTful conventions
- New modules should integrate with the Spring Modulith architecture

## Best Practices
- Include validation for all input data
- Implement proper error handling with meaningful error messages
- Configure appropriate logging at different levels
- Use Spring's reactive patterns consistently
- Follow the Single Responsibility Principle in class design
- Utilize Spring Boot's auto-configuration capabilities when possible
- Ensure proper security controls for all endpoints
- Include monitoring endpoints via Spring Boot Actuator
