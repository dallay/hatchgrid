# Hatchgrid

A Spring Boot application built with Kotlin and Gradle, providing a robust backend infrastructure.

## Prerequisites

- JDK 21 or later
- Gradle 8.x or later (or use the included Gradle wrapper)
- Docker and Docker Compose (for running the PostgreSQL database)
- Git

## Project Setup

### Clone the Repository

```bash
git clone <repository-url>
cd Hatchgrid
```

### Build the Project

```bash
./gradlew build
```

## Running the Application

### Using Gradle

```bash
./gradlew bootRun
```

### Using Java

```bash
./gradlew build
java -jar build/libs/Hatchgrid-0.0.1-SNAPSHOT.jar
```

## Database Configuration

The application uses PostgreSQL as its database. The connection is configured in `application.yml`.

### Using Docker Compose

The project includes a `compose.yaml` file that sets up a PostgreSQL database:

```bash
# Start the database
docker compose -f compose.yaml up -d

# Stop the database
docker compose -f compose.yaml down
```

Alternatively, Spring Boot's Docker Compose support will automatically start the required containers when you run the application.

## Database Migrations

This project uses Liquibase for database migrations. The changelog file is located at:

```
src/main/resources/db/changelog/db.changelog-master.yaml
```

## Development Workflow

1. Make changes to the code
2. Run tests: `./gradlew test`
3. Build the application: `./gradlew build`
4. Run the application: `./gradlew bootRun`

## Testing

### Running Tests

```bash
./gradlew test
```

### Integration Tests with Testcontainers

The project uses Testcontainers for integration tests, which automatically spin up Docker containers for testing.

```bash
./gradlew integrationTest
```

## Project Structure

- `src/main/kotlin` - Kotlin source files
- `src/main/resources` - Configuration files and resources
- `src/test/kotlin` - Test source files

## Key Features

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

## API Documentation

API documentation is generated using Spring REST Docs and is available at:

```
build/generated-snippets
```

## Monitoring

The application includes Spring Boot Actuator endpoints for monitoring:

- Health check: `/actuator/health`
- Metrics: `/actuator/metrics`
- Prometheus metrics: `/actuator/prometheus`
