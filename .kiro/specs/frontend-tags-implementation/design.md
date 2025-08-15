# Design Document

## Overview

The tags implementation follows the hexagonal architecture pattern established in the subscribers module, ensuring consistency and maintainability across the codebase. The design implements a complete CRUD system for tag management with proper separation of concerns across domain, application, and infrastructure layers.

The implementation leverages the existing Tag domain model and extends it with the full architecture stack including repositories, use cases, API integration, state management, and Vue.js components.

## Architecture

The tags module follows the same hexagonal architecture as subscribers:

```text
src/tag/
├── domain/                    # Business logic and entities
│   ├── models/               # Domain models and types
│   ├── repositories/         # Repository interfaces
│   └── usecases/            # Business use cases
├── application/              # Application services
│   └── composables/         # Vue composables
├── infrastructure/           # External concerns
│   ├── api/                 # HTTP API implementations
│   ├── di/                  # Dependency injection
│   ├── store/               # Pinia state management
│   └── views/               # Vue components and pages
├── __tests__/               # Module-level tests
├── di.ts                    # DI re-export
└── index.ts                 # Public API
```

### Layer Responsibilities

- **Domain Layer**: Contains business entities (Tag), repository interfaces, and use cases
- **Application Layer**: Provides composables that orchestrate domain use cases
- **Infrastructure Layer**: Implements external concerns (API, store, UI components)

## Components and Interfaces

### Domain Layer

#### Models

- **Tag**: Domain model with id (UUID v4), name, color, subscribers, timestamps
- **TagResponse**: API response type for tag data
- **TagColors**: Enum for available tag colors
- **Schemas**: Zod validation schemas for tag data, including UUID validation

#### Repository Interface

```typescript
interface TagRepository {
    findAll(): Promise<Tag[]>
    findById(id: string): Promise<Tag | null>
    create(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag>
    update(id: string, tag: Partial<Tag>): Promise<Tag>
    delete(id: string): Promise<void>
}
```

#### Use Cases

- **FetchTags**: Retrieve all tags with optional filtering
- **CreateTag**: Create a new tag with validation (Zod, UUID, name uniqueness)
- **UpdateTag**: Update existing tag with validation
- **DeleteTag**: Remove a tag from the system

### Application Layer

#### Composables

- **useTags**: Main composable providing reactive tag management functionality
    - Exposes tag list, loading states, error handling
    - Provides methods for CRUD operations
    - Manages local state and API interactions

### Infrastructure Layer

#### API Implementation

- **TagApi**: HTTP client for tag-related API calls
    - Implements TagRepository interface
    - Handles API errors and response transformation
    - Uses existing HTTP client configuration
    - All endpoints and models annotated with OpenAPI/Swagger

#### State Management

- **TagStore**: Pinia store for tag state management
    - Manages tag list, loading states, and errors
    - Provides actions for CRUD operations
    - Integrates with use cases through dependency injection

#### Dependency Injection

- **Container**: DI container for tag dependencies
- **Initialization**: Module initialization functions
- **Configuration**: Setup for repository and use case instances

#### Views and Components

- **TagList**: Component for displaying list of tags
- **TagForm**: Component for creating/editing tags
- **TagItem**: Component for individual tag display
- **TagPage**: Main page component for tag management
- **DeleteConfirmation**: Modal for tag deletion confirmation

## Data Models

### Tag Entity

```typescript
class Tag {
    id: string // UUID v4, validated
    name: string
    color: TagColors
    subscribers: ReadonlyArray<string> | string
    createdAt?: Date | string
    updatedAt?: Date | string

    // Methods
    static fromResponse(response: TagResponse): Tag
    get colorClass(): string
    get subscriberCount(): number
}
```

### API Response Types

```typescript
interface TagResponse {
    id: string // UUID v4
    name: string
    color: string
    subscribers: ReadonlyArray<string> | string
    createdAt?: string
    updatedAt?: string
}

interface CreateTagRequest {
    name: string
    color: TagColors
}

interface UpdateTagRequest {
    name?: string
    color?: TagColors
}
```

### Store State

```typescript
interface TagStoreState {
    tags: Tag[]
    loading: LoadingStates
    error: TagError | null
}

interface LoadingStates {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
}
```

## Validation

- All tag IDs are validated as UUID v4 (Zod schema)
- Tag names: required, max 50 chars, unique per workspace
- Tag color: required, from predefined palette or valid hex code
- All user input is validated before API calls

## Error Handling

### Error Types

- **TagApiError**: HTTP API errors with standardized structure `{ code, message, details }`
- **TagValidationError**: Client-side validation errors
- **TagNotFoundError**: Specific error for missing tags

### Error Handling Strategy

- API errors are caught and transformed into user-friendly messages (i18n keys)
- Validation errors are displayed inline in forms
- Network errors trigger retry mechanisms
- Global error handling through store error state

### Error Recovery

- Automatic retry for transient network errors
- Manual retry buttons for failed operations
- Optimistic updates with rollback on failure
- Clear error states after successful operations

## Internationalization (i18n)

- All user-facing text uses i18n keys (e.g., `tag.list.empty`, `tag.create.success`)
- Support for RTL languages and pluralization
- Locale-specific date formatting

## Security

- Input validation for all endpoints (UUID, name, color)
- Output encoding and sanitization for tag names
- CSRF protection for API calls
- OAuth2 authentication and RBAC enforced
- No sensitive data in logs

## Testing Strategy

### Unit Tests

- **Domain Models**: Test Tag class methods and validation
- **Use Cases**: Test business logic with mocked repositories
- **API Client**: Test HTTP interactions with mock responses
- **Store**: Test state mutations and actions

### Integration Tests

- **Component Integration**: Test component interactions with store
- **API Integration**: Test full API flow with test server
- **Module Integration**: Test complete tag workflows

### Architecture Tests

- **Isolation Tests**: Ensure proper layer separation
- **Dependency Tests**: Verify dependency injection configuration
- **Import Tests**: Validate clean architecture boundaries

### Test Structure

```text
__tests__/
├── architecture-isolation.test.ts
├── component-integration.test.ts
├── integration.test.ts
└── repository.mock.ts
```

### Testing Tools

- **Vitest**: Test runner and assertion library
- **@testing-library/vue**: Component testing utilities
- **MSW**: API mocking for integration tests
- **Test Containers**: For full integration testing

- All new logic must be covered by tests, with test names following the pattern `should do something when condition`.

## Implementation Considerations

### Performance

- Virtual scrolling for large tag lists
- Computed properties for filtered/sorted data
- Debounced search functionality
- Cache tag data with appropriate invalidation

### Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance for tag colors

### Browser Compatibility

- Support for modern browsers (ES2020+)
- Graceful degradation for older browsers
- Progressive enhancement approach
- Polyfills where necessary

