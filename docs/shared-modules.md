# Shared Modules Documentation

The Hatchgrid project includes two shared modules that provide common functionality across the application: `shared/common` and `shared/spring-boot-common`. These modules implement domain-driven design patterns, CQRS architecture, and Spring Boot integrations.

## Overview

### Module Structure

```text
shared/
├── common/                 # Core domain logic and patterns
└── spring-boot-common/     # Spring Boot specific implementations
```

> **Spring Modulith Integration:**
>
> The `shared/*` modules are organized as [Spring Modulith](https://docs.spring.io/spring-modulith/docs/current/reference/html/) named slices:
>
> - **shared:common** defines the core domain model, CQRS, and DDD patterns as a Modulith slice with no external dependencies, forming the foundation for all backend modules.
> - **shared:spring-boot-common** is a separate Modulith slice that integrates the domain logic with Spring Boot, providing auto-configuration, dependency injection, and infrastructure adapters. It depends only on `shared:common` and exposes its own public API boundary.
>
> These boundaries are enforced in the Modulith graph, ensuring clear separation and explicit dependencies between domain, infrastructure, and application layers. See `/docs/architecture/hexagonal-architecture.md` for more on Modulith boundaries in Hatchgrid.

### Dependencies

- **shared/common**: Pure Kotlin module with no external framework dependencies
- **shared/spring-boot-common**: Depends on `shared/common` and Spring Boot ecosystem

## shared/common Module

The `common` module provides framework-agnostic domain logic, patterns, and utilities.

### Core Components

#### Domain Entities

**BaseEntity<ID>**

- Abstract base class for all domain entities
- Provides common properties: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
- Manages domain events with `record()` and `pullDomainEvents()` methods
- Implements proper equality and hashing based on entity ID

**AggregateRoot<ID>**

- Extends `BaseEntity` to represent aggregate roots in DDD
- Marker class for identifying aggregate boundaries

**AuditableEntity**

- Provides auditing capabilities for entities
- Tracks creation and modification timestamps and users

#### CQRS and Mediator Pattern

**Mediator Interface**

- Central dispatcher for commands, queries, and notifications
- Supports async operations with Kotlin coroutines
- Methods:
  - `send(query: Query<TResponse>): TResponse`
  - `send(command: Command)`
  - `send(command: CommandWithResult<TResult>): TResult`
  - `publish(notification: Notification)`

**Command Bus**

- `Command`: Marker interface for commands (state-changing operations)
- `CommandWithResult<TResult>`: Commands that return results
- `CommandHandler<TCommand>`: Handles command execution
- `CommandHandlerExecutionError`: Exception for command handling errors

**Query Bus**

- `Query<TResponse>`: Interface for queries (read operations)
- `QueryHandler<TQuery, TResponse>`: Handles query execution
- `Response`: Base interface for query responses

**Event Bus**

- `DomainEvent`: Base interface for domain events
- `Notification`: Interface for cross-cutting notifications
- Support for different publishing strategies

#### Criteria and Filtering

**Criteria System**

- Type-safe query building with sealed classes
- Supported operations:
  - Basic: `Equals`, `NotEquals`, `IsNull`, `IsNotNull`
  - Comparison: `LessThan`, `GreaterThan`, `Between`
  - Text: `Like`, `Ilike`, `NotLike`, `Regexp`
  - Collections: `In`, `NotIn`
  - Logical: `And`, `Or`
  - Boolean: `IsTrue`, `IsFalse`

**CriteriaParser**

- Converts criteria objects to database-specific queries
- Runtime parsing capabilities

#### Presentation Layer

**PageResponse<T>**

- Base class for paginated responses
- Implements the `Response` interface

**Filter System**

- RHS (Right-Hand Side) filter parsing
- Support for complex filtering expressions

**Pagination**

- Cursor-based pagination support
- Traditional offset-based pagination

#### Value Objects

**Email Value Objects**

- Type-safe email handling with validation
- Domain-specific email exceptions

**Name Value Objects**

- Structured name handling (first, last, display names)

**Credential Value Objects**

- Secure credential management

#### Utilities

**SQL Like Transpiler**

- Converts SQL LIKE patterns to regular expressions
- Tokenizer for pattern parsing

**Memoizers**

- Caching utilities for expensive operations

### Error Handling

- `BusinessRuleValidationException`: Domain rule violations
- `EntityNotFoundException`: Missing entity errors
- `AggregateException`: Multiple error aggregation
- `InvalidFilterOperator`: Filter validation errors

## shared/spring-boot-common Module

The `spring-boot-common` module provides Spring Boot-specific implementations and integrations.

### Core Components

#### Auto-Configuration

**HatchgridAutoConfiguration**

- Spring Boot auto-configuration class
- Automatically registers mediator and dependency injection
- Configured via `META-INF/spring.factory`

**HatchgridSpringBeanProvider**

- Integrates Spring's dependency injection with the mediator pattern
- Resolves handlers from Spring application context

#### Base Controller

**ApiController**

- Abstract base class for REST controllers
- Provides common functionality:
  - Command dispatching via `dispatch(command)`
  - Query handling via `ask(query)`
  - Authentication access via `authentication()` and `userId()`
  - Path variable sanitization for security (see `sanitizePathVariable()` below)
- Includes Swagger/OpenAPI security annotations
- Supports JWT and username/password authentication

> **Helper Implementation:**
>
> The `sanitizePathVariable()` helper is defined in [`ApiController`](../../shared/spring-boot-common/src/main/kotlin/com/hatchgrid/spring/boot/ApiController.kt). It validates path variables using an allow-list regex to prevent path traversal and injection attacks:
>
> ```kotlin
> protected fun sanitizePathVariable(pathVariable: String): String {
>     val regex = "^[a-zA-Z0-9_-]+$".toRegex()
>     require(pathVariable.matches(regex)) {
>         "Invalid path variable. Only alphanumeric characters, underscores, and hyphens are allowed."
>     }
>     return URLEncoder.encode(pathVariable, "UTF-8")
> }
> ```
>
> You can use this method in your controllers by extending `ApiController`.

#### Repository Layer

**ReactiveSearchRepository<T>**

- Interface for reactive database operations
- Methods:
  - `findAll(criteria, domainType): Flow<T>`
  - `findAll(criteria, pageable, domainType): Page<T>`
  - `findAllByCursor(criteria, size, domainType, sort, cursor): CursorPageResponse<T>`

**ReactiveSearchRepositoryImpl**

- Implementation using Spring Data R2DBC
- Converts domain criteria to R2DBC queries

**R2DBCCriteriaParser**

- Translates domain criteria to R2DBC `Criteria` objects
- Handles all supported criteria operations

#### Presentation Layer

**Presenter Interface**

- Contract for presentation layer transformations
- Converts domain objects to DTOs

**ResponseBodyResultHandlerAdapter**

- Custom Spring WebFlux result handler
- Integrates with the presentation system

**Pagination Support**

- `PageResponsePresenter`: Converts domain pages to API responses
- Cursor-based pagination implementation
- Sort parameter parsing and validation

**Filter Support**

- RHS filter parsing for HTTP requests
- Integration with domain criteria system

#### Event System

**Event Configuration**

- Spring-specific event handling setup
- Integration with domain event publishing

### Dependencies

The `spring-boot-common` module includes:

- Spring Boot Starter Data R2DBC (reactive database access)
- Spring Boot Starter Security (authentication/authorization)
- Spring Boot Starter OAuth2 Resource Server (JWT support)
- Apache Commons Text (text processing utilities)

## Usage Patterns

### Command Handling

```kotlin
// Define a command
data class CreateUserCommand(val email: String, val name: String) : Command

// Handle the command
@Component
class CreateUserCommandHandler(
    private val userRepository: UserRepository
) : CommandHandler<CreateUserCommand> {
    override suspend fun handle(command: CreateUserCommand) {
        // Business logic here
    }
}

// Use in controller
@RestController
class UserController(mediator: Mediator) : ApiController(mediator) {
    @PostMapping("/users")
    suspend fun createUser(@RequestBody request: CreateUserRequest) {
        val command = CreateUserCommand(request.email, request.name)
        dispatch(command)
    }
}
```

### Query Handling

```kotlin
// Define a query
data class GetUserQuery(val userId: String) : Query<UserResponse>

// Handle the query
@Component
class GetUserQueryHandler(
    private val userRepository: UserRepository
) : QueryHandler<GetUserQuery, UserResponse> {
    override suspend fun handle(query: GetUserQuery): UserResponse {
        // Query logic here
    }
}

// Use in controller
@GetMapping("/users/{id}")
suspend fun getUser(@PathVariable id: String): UserResponse {
    val query = GetUserQuery(sanitizePathVariable(id))
    return ask(query)
}
```

### Repository Usage

```kotlin
@Repository
class UserRepositoryImpl(
    private val searchRepository: ReactiveSearchRepository<User>
) {
    suspend fun findActiveUsers(): Flow<User> {
        val criteria = Criteria.Equals("active", true)
        return searchRepository.findAll(criteria, User::class)
    }

    suspend fun findUsersPaginated(pageable: Pageable): Page<User> {
        val criteria = Criteria.Empty
        return searchRepository.findAll(criteria, pageable, User::class)
    }
}
```

## Best Practices

### Domain Design

- Use aggregate roots to define consistency boundaries
- Record domain events for cross-aggregate communication
- Keep domain logic in the domain layer, not in controllers

### CQRS Implementation

- Separate read and write models when complexity justifies it
- Use commands for state changes, queries for reads
- Handle cross-cutting concerns with notifications

### Security

- Always sanitize path variables using `sanitizePathVariable()`
- Use JWT authentication for API access
- Validate input at the presentation layer

### Performance

- Leverage reactive programming with R2DBC
- Use cursor-based pagination for large datasets
- Implement proper indexing strategies for criteria queries

### Testing

- Test domain logic independently of infrastructure
- Use test containers for integration testing
- Mock external dependencies in unit tests

## Configuration

### Auto-Configuration

The modules are automatically configured when included in a Spring Boot application. The auto-configuration:

- Registers the mediator bean
- Sets up dependency injection integration
- Configures reactive repository implementations

### Custom Configuration

You can override default configurations by providing your own beans:

```kotlin
@Configuration
class CustomMediatorConfiguration {
    @Bean
    @Primary
    fun customMediator(dependencyProvider: DependencyProvider): Mediator {
        return MediatorBuilder(dependencyProvider)
            .withCustomBehavior()
            .build()
    }
}
```

## Migration Guide

When upgrading shared modules:

1. Check for breaking changes in criteria API
2. Update command/query handlers if interfaces change
3. Review security-related changes in ApiController
4. Test reactive repository implementations thoroughly
5. Validate pagination behavior with your data sets

## Troubleshooting

### Common Issues

**Handler Not Found**

- Ensure handlers are annotated with `@Component`
- Verify handler implements correct interface
- Check Spring component scanning configuration

**Criteria Parsing Errors**

- Validate field names match entity properties
- Check data types in criteria values
- Ensure proper escaping for string values

**Authentication Issues**

- Verify JWT configuration in Spring Security
- Check token validation settings
- Ensure proper CORS configuration for frontend

**Reactive Issues**

- Use proper coroutine context
- Handle backpressure appropriately
- Test with realistic data volumes
