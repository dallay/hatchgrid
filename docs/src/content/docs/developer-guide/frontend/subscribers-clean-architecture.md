---
title: Subscribers Clean Architecture Implementation
description: Comprehensive documentation for the subscribers module implementation using clean architecture principles in Vue.js frontend application.
---
# Subscribers Clean Architecture Implementation

This document provides comprehensive documentation for the subscribers module implementation using clean architecture principles in the Vue.js frontend application.

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Folder Structure (Screaming Architecture)](#folder-structure-screaming-architecture)
- [Layer Implementation](#layer-implementation)
- [Dependency Injection](#dependency-injection)
- [Testing Patterns](#testing-patterns)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The subscribers module implements a clean architecture pattern that separates concerns into four distinct layers:

- **Domain Layer**: Contains business logic, entities, and interfaces
- **Infrastructure Layer**: Handles external services and API communication
- **Presentation Layer**: Manages UI components and user interactions
- **Store Layer**: Provides state management with dependency injection

This architecture ensures high testability, maintainability, and extensibility while following established patterns in the existing codebase.

### Key Benefits

- **Testability**: Each layer can be tested in isolation with mocked dependencies
- **Maintainability**: Clear separation of concerns makes code easier to understand and modify
- **Extensibility**: New features can be added without affecting existing layers
- **Flexibility**: Data sources can be changed without affecting business logic

## Architecture Principles

### 1. Dependency Inversion

Higher-level modules (domain) do not depend on lower-level modules (infrastructure). Both depend on abstractions (interfaces).

```typescript
// Domain layer defines the interface
export interface SubscriberRepository {
  fetchAll(workspaceId: string, filters?: Record<string, string>): Promise<Subscriber[]>
}

// Infrastructure layer implements the interface
export class SubscriberApi implements SubscriberRepository {
  async fetchAll(workspaceId: string, filters?: Record<string, string>): Promise<Subscriber[]> {
    // HTTP API implementation
  }
}
```

### 2. Single Responsibility

Each class and module has a single, well-defined responsibility:

- **Use Cases**: Handle specific business operations
- **Repository**: Abstract data access
- **API**: Handle HTTP communication
- **Store**: Manage application state

### 3. Interface Segregation

Interfaces are focused and specific to their use cases, avoiding large, monolithic contracts.

### 4. Screaming Architecture

The folder structure reflects business capabilities rather than technical concerns, making the domain purpose immediately clear.

## Folder Structure (Screaming Architecture)

```text
src/subscribers/
├── __tests__/
├── application/
│   ├── composables/
│   └── index.ts
├── domain/
│   ├── models/
│   ├── repositories/
│   └── usecases/
├── infrastructure/
│   ├── api/
│   ├── di/
│   ├── store/
│   └── views/
├── di.ts
└── index.ts
```

### Why Screaming Architecture?

This structure emphasizes business modularity by keeping all technical layers that serve the `subscribers` concern within the same bounded context directory. This approach:

- **Highlights Business Purpose**: The folder name immediately tells you this is about subscribers
- **Enforces Isolation**: All subscriber-related code lives in one place
- **Promotes Autonomy**: The module is self-contained and can evolve independently
- **Improves Focus**: Developers working on subscriber features don't need to navigate across technical layers
## Layer Implementation

### Domain Layer

The domain layer contains the core business logic and is independent of external concerns.

#### Models (`domain/models/`)

Domain entities represent the core business concepts:

```typescript
// Subscriber.ts - Core domain entity
export interface Subscriber {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly status: SubscriberStatus
  readonly attributes?: Attributes
  readonly workspaceId: string
  readonly createdAt?: Date | string
  readonly updatedAt?: Date | string
}

export enum SubscriberStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  BLOCKLISTED = 'BLOCKLISTED'
}
```

**Key Features:**
- **Immutability**: All properties are `readonly` to enforce immutability
- **Type Safety**: Strong TypeScript typing throughout
- **Validation**: Zod schemas for runtime validation
- **Utility Functions**: Domain-specific helper functions

#### Repository Interface (`domain/repositories/`)

Abstract interfaces define data access contracts:

```typescript
// SubscriberRepository.ts - Abstract repository interface
export interface SubscriberRepository {
  fetchAll(workspaceId: string, filters?: Record<string, string>): Promise<Subscriber[]>
  countByStatus(workspaceId: string): Promise<CountByStatusResponse[]>
  countByTags(workspaceId: string): Promise<CountByTagsResponse[]>
}
```

**Key Features:**
- **Abstraction**: No implementation details, only contracts
- **Testability**: Easy to mock for unit tests
- **Flexibility**: Multiple implementations possible (API, local storage, etc.)

#### Use Cases (`domain/usecases/`)

Use cases encapsulate business logic for specific operations:

```typescript
// FetchSubscribers.ts - Business logic for fetching subscribers
export class FetchSubscribers {
  constructor(private readonly repository: SubscriberRepository) {}

  async execute(workspaceId: string, filters?: FetchSubscribersFilters): Promise<Subscriber[]> {
    // Validate workspace ID
    if (!workspaceId || workspaceId.trim() === '') {
      throw new Error('Workspace ID is required')
    }

    // Sanitize filters
    const repositoryFilters = filters ? this.sanitizeFilters(filters) : undefined

    // Fetch from repository
    const subscribers = await this.repository.fetchAll(workspaceId, repositoryFilters)

    // Apply business logic filtering
    return this.applyBusinessLogicFilters(subscribers, filters)
  }
}
```

**Key Features:**
- **Single Responsibility**: Each use case handles one business operation
- **Dependency Injection**: Depends only on repository interface
- **Business Logic**: Contains domain-specific rules and validation
- **Error Handling**: Proper error handling and validation
### Infrastructure Layer

The infrastructure layer handles external services and API communication.

#### API Implementation (`infrastructure/api/`)

Concrete implementation of repository interfaces:

```typescript
// SubscriberApi.ts - HTTP API implementation
export class SubscriberApi implements SubscriberRepository {
  private readonly baseUrl = "/api"

  async fetchAll(workspaceId: string, filters?: Record<string, string>): Promise<Subscriber[]> {
    this.validateWorkspaceId(workspaceId)

    const queryParams = this.buildQueryParams(filters)
    const url = `${this.baseUrl}/workspaces/${workspaceId}/subscribers${queryParams}`

    return this.makeApiRequest(
      url,
      this.transformSubscriber.bind(this),
      subscribersArraySchema.safeParse.bind(subscribersArraySchema),
      "fetchAll subscribers",
      "Invalid subscriber data received from API"
    )
  }
}
```

**Key Features:**
- **Interface Implementation**: Implements repository interface
- **HTTP Integration**: Uses existing axios configuration
- **Data Transformation**: Converts API responses to domain models
- **Error Handling**: Transforms infrastructure errors to domain errors
- **Validation**: Uses Zod schemas to validate API responses

### Presentation Layer

The presentation layer manages UI components and user interactions.

#### Components (`presentation/components/`)

Reusable UI components that receive data through props:

```vue
<!-- SubscriberList.vue - Reusable subscriber list component -->
<script setup lang="ts">
import type { Subscriber } from '../../domain/models'

interface Props {
  subscribers: Subscriber[]
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'edit-subscriber', subscriber: Subscriber): void
  (e: 'toggle-status', subscriber: Subscriber): void
  (e: 'delete-subscriber', subscriber: Subscriber): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()
</script>
```

**Key Features:**
- **Props-Based**: Receives data through props, not direct API calls
- **Type Safety**: Proper TypeScript typing for props and emits
- **Composition API**: Uses `<script setup>` syntax
- **Event Emission**: Communicates with parent through events
#### Views (`presentation/views/`)

Page-level components that coordinate between store and child components:

```vue
<!-- SubscriberPage.vue - Page-level component -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSubscribers } from '../../composables/useSubscribers'
import SubscriberList from '../components/SubscriberList.vue'

const {
  subscribers,
  isLoading,
  hasError,
  error,
  fetchAllData,
  clearError
} = useSubscribers()

onMounted(async () => {
  await fetchAllData('current-workspace-id')
})
</script>
```

**Key Features:**
- **Store Integration**: Uses composables to access store
- **Lifecycle Management**: Handles component lifecycle events
- **Error Handling**: Manages error states and user feedback

### Store Layer

The store layer provides state management with dependency injection.

#### Pinia Store (`store/`)

Reactive state management with injected use cases:

```typescript
// subscriber.store.ts - Pinia store with dependency injection
export const useSubscriberStore = defineStore('subscriber', () => {
  // Reactive state
  const subscribers: Ref<Subscriber[]> = ref([])
  const loading: Ref<LoadingStates> = ref({ ...defaultLoadingStates })
  const error: Ref<SubscriberError | null> = ref(null)

  // Injected use cases
  let useCases: SubscriberUseCases | null = null

  // Store actions with use case injection
  const fetchSubscribers = async (workspaceId: string, filters?: FetchSubscribersFilters): Promise<void> => {
    await withAsyncAction(
      'fetchingSubscribers',
      () => useCases!.fetchSubscribers.execute(workspaceId, filters),
      (result) => { subscribers.value = result },
      'FETCH_SUBSCRIBERS_ERROR',
      'Failed to fetch subscribers',
      workspaceId
    )
  }

  return {
    // State
    subscribers: readonly(subscribers),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    fetchSubscribers,
    initializeStore,
    resetState
  }
})
```

**Key Features:**
- **Dependency Injection**: Use cases are injected, not created directly
- **Reactive State**: Vue 3 reactivity with proper typing
- **Error Handling**: Consistent error state management
- **Loading States**: Granular loading states for different operations
## Dependency Injection

The module uses a dependency injection container to manage dependencies and ensure proper layer isolation.

### Container (`di/container.ts`)

```typescript
// container.ts - Dependency injection container
export function createContainer(): SubscriberContainer {
  const repository = createRepository()
  const useCases = createUseCases()

  return {
    repository,
    useCases
  }
}

export function createUseCases(): SubscriberUseCases {
  if (useCasesInstance === null) {
    const repository = createRepository()

    useCasesInstance = {
      fetchSubscribers: new FetchSubscribers(repository),
      countByStatus: new CountByStatus(repository),
      countByTags: new CountByTags(repository)
    }
  }
  return useCasesInstance
}
```

### Store Initialization (`di/initialization.ts`)

```typescript
// initialization.ts - Store initialization with DI
export function initializeSubscriberStore(): void {
  if (isInitialized) return

  const store = useSubscriberStore()
  const useCases = createUseCases()

  store.initializeStore(useCases)
  isInitialized = true
}
```

### Composable Integration (`composables/useSubscribers.ts`)

```typescript
// useSubscribers.ts - Main composable with auto-initialization
export function useSubscribers() {
  // Auto-initialize store if needed
  initializeSubscriberStore()

  const store = useSubscriberStore()

  return {
    // State
    subscribers: store.subscribers,
    isLoading: store.isLoading,
    hasError: store.hasError,

    // Actions
    fetchSubscribers: store.fetchSubscribers,
    clearError: store.clearError,
    resetState: store.resetState,

    // Store reference
    store
  }
}
```
## Testing Patterns

The clean architecture enables comprehensive testing at each layer with proper isolation.

### Unit Testing Strategy

#### Domain Layer Tests

**Use Case Testing with Mocked Repository:**

```typescript
// FetchSubscribers.test.ts
describe('FetchSubscribers', () => {
  let useCase: FetchSubscribers
  const mockRepository: SubscriberRepository = {
    fetchAll: vi.fn(),
    countByStatus: vi.fn(),
    countByTags: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new FetchSubscribers(mockRepository)
  })

  it('should fetch subscribers successfully without filters', async () => {
    // Arrange
    const workspaceId = 'd2054881-b8c1-4bfa-93ce-a0e94d003ead23'
    vi.mocked(mockRepository.fetchAll).mockResolvedValue(mockSubscribers)

    // Act
    const result = await useCase.execute(workspaceId)

    // Assert
    expect(mockRepository.fetchAll).toHaveBeenCalledWith(workspaceId, undefined)
    expect(result).toEqual(mockSubscribers)
  })
})
```

**Key Testing Patterns:**
- **Mock Dependencies**: Use `vi.fn()` to mock repository methods
- **Arrange-Act-Assert**: Clear test structure
- **Edge Cases**: Test validation, error handling, and boundary conditions
- **Isolation**: Each test is independent with proper setup/teardown

#### Infrastructure Layer Tests

**API Testing with Mocked HTTP Responses:**

```typescript
// SubscriberApi.test.ts
describe('SubscriberApi', () => {
  let subscriberApi: SubscriberApi

  beforeEach(() => {
    subscriberApi = new SubscriberApi()
    vi.clearAllMocks()
  })

  it('should fetch subscribers successfully', async () => {
    // Mock axios response
    mockedAxios.get.mockResolvedValueOnce({ data: mockApiResponse })

    const result = await subscriberApi.fetchAll(mockWorkspaceId)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/workspaces/d2054881-b8c1-4bfa-93ce-a0e94d003ead23/subscribers',
      { withCredentials: true }
    )
    expect(result).toHaveLength(1)
  })
})
```

**Key Testing Patterns:**
- **HTTP Mocking**: Mock axios responses for different scenarios
- **Error Scenarios**: Test various HTTP error codes and network failures
- **Data Transformation**: Verify API responses are correctly transformed to domain models
- **Validation**: Test Zod schema validation with invalid data
#### Presentation Layer Tests

**Component Testing with Vue Testing Library:**

```typescript
// SubscriberList.test.ts
describe('SubscriberList', () => {
  it('renders subscribers table with data', () => {
    const wrapper = mount(SubscriberList, {
      props: {
        subscribers: mockSubscribers
      }
    })

    expect(wrapper.find('[data-testid="subscribers-list"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="subscriber-item"]')).toHaveLength(3)
  })

  it('emits edit-subscriber event when edit is clicked', async () => {
    const wrapper = mount(SubscriberList, {
      props: { subscribers: [mockSubscribers[0]] }
    })

    const editButton = wrapper.find('[data-testid="edit-button"]')
    await editButton.trigger('click')

    expect(wrapper.emitted('edit-subscriber')).toBeTruthy()
    expect(wrapper.emitted('edit-subscriber')?.[0]).toEqual([mockSubscribers[0]])
  })
})
```

**Key Testing Patterns:**
- **Component Mounting**: Use `@vue/test-utils` for component testing
- **Props Testing**: Test component behavior with different prop values
- **Event Testing**: Verify component emits correct events
- **UI State Testing**: Test loading, error, and empty states
- **Mock UI Components**: Mock complex UI library components for focused testing

#### Store Layer Tests

**Store Testing with Mocked Use Cases:**

```typescript
// subscriber.store.test.ts
describe('useSubscriberStore', () => {
  let store: SubscriberStore
  let mockUseCases: SubscriberUseCases

  beforeEach(() => {
    setActivePinia(createPinia())
    mockUseCases = {
      fetchSubscribers: { execute: vi.fn() },
      countByStatus: { execute: vi.fn() },
      countByTags: { execute: vi.fn() }
    }

    store = useSubscriberStore()
    store.initializeStore(mockUseCases)
  })

  it('should fetch subscribers and update state', async () => {
    // Mock use case response
    vi.mocked(mockUseCases.fetchSubscribers.execute).mockResolvedValue(mockSubscribers)

    await store.fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead23')

    expect(store.subscribers).toEqual(mockSubscribers)
    expect(store.isLoading).toBe(false)
  })
})
```

**Key Testing Patterns:**
- **Pinia Testing**: Use `createPinia()` and `setActivePinia()` for store testing
- **Dependency Injection**: Mock use cases and inject them into store
- **State Verification**: Test reactive state updates
- **Async Actions**: Test loading states and error handling
### Integration Testing

**Full Layer Integration:**

```typescript
// integration.test.ts
describe('Subscribers Module Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetContainer()
    configureContainer({ customRepository: mockRepository })
  })

  it('should integrate all layers through dependency injection', async () => {
    const { subscribers, fetchSubscribers, isLoading } = useSubscribers()

    await fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead')

    expect(isLoading.value).toBe(false)
    expect(subscribers.value).toHaveLength(2)
    expect(mockRepository.fetchAll).toHaveBeenCalledWith('d2054881-b8c1-4bfa-93ce-a0e94d003ead', undefined)
  })
})
```

**Key Integration Testing Patterns:**
- **End-to-End Flow**: Test complete data flow from composable to repository
- **Dependency Injection**: Verify proper dependency wiring
- **State Management**: Test state updates across layers
- **Error Propagation**: Verify errors are properly handled across layers

### Mocking Strategy

The module uses a layered mocking strategy:

1. **Unit Tests**: Mock immediate dependencies only
2. **Integration Tests**: Mock external services (HTTP, storage)
3. **Component Tests**: Mock complex UI components and services
4. **Store Tests**: Mock use cases and business logic

**Note on MSW (Mock Service Worker):**
While the current implementation uses axios mocking for API tests, the architecture is designed to easily integrate with MSW for more realistic HTTP mocking:

```typescript
// Example MSW integration (not currently implemented)
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/workspaces/:workspaceId/subscribers', (req, res, ctx) => {
    return res(ctx.json(mockSubscribers))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
## Usage Examples

### Basic Usage

**1. Using the Composable in a Component:**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSubscribers } from '@/subscribers'

const {
  subscribers,
  isLoading,
  hasError,
  error,
  fetchSubscribers,
  clearError
} = useSubscribers()

onMounted(async () => {
  await fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead23')
})

const handleRetry = async () => {
  clearError()
  await fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead23')
}
</script>

<template>
  <div>
    <div v-if="isLoading">Loading subscribers...</div>
    <div v-else-if="hasError" class="error">
      Error: {{ error?.message }}
      <button @click="handleRetry">Retry</button>
    </div>
    <div v-else>
      <h2>Subscribers ({{ subscribers.length }})</h2>
      <ul>
        <li v-for="subscriber in subscribers" :key="subscriber.id">
          {{ subscriber.name || subscriber.email }} - {{ subscriber.status }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

**2. Using with Filters:**

```typescript
// Fetch subscribers with filters
await fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead23', {
  status: 'ENABLED',
  search: 'john@example.com'
})

// Fetch all data at once
await fetchAllData('d2054881-b8c1-4bfa-93ce-a0e94d003ead23', { status: 'ENABLED' })
```

**3. Using Status and Tag Counts:**

```vue
<script setup lang="ts">
const {
  statusCounts,
  tagCounts,
  fetchAllData
} = useSubscribers()

onMounted(async () => {
  await fetchAllData('d2054881-b8c1-4bfa-93ce-a0e94d003ead23')
})
</script>

<template>
  <div>
    <h3>Status Distribution</h3>
    <ul>
      <li v-for="status in statusCounts" :key="status.status">
        {{ status.status }}: {{ status.count }}
      </li>
    </ul>

    <h3>Top Tags</h3>
    <ul>
      <li v-for="tag in tagCounts" :key="tag.tag">
        {{ tag.tag }}: {{ tag.count }}
      </li>
    </ul>
  </div>
</template>
```
### Advanced Usage

**1. Custom Repository Implementation:**

```typescript
// Create a custom repository for testing or different data sources
class LocalStorageSubscriberRepository implements SubscriberRepository {
  async fetchAll(workspaceId: string, filters?: Record<string, string>): Promise<Subscriber[]> {
    const data = localStorage.getItem(`subscribers-${workspaceId}`)
    return data ? JSON.parse(data) : []
  }

  async countByStatus(workspaceId: string): Promise<CountByStatusResponse[]> {
    // Implementation for local storage
  }

  async countByTags(workspaceId: string): Promise<CountByTagsResponse[]> {
    // Implementation for local storage
  }
}

// Configure container with custom repository
configureContainer({
  customRepository: new LocalStorageSubscriberRepository()
})
```

**2. Direct Store Usage:**

```typescript
// Direct store access for advanced scenarios
import { useSubscriberStore } from '@/subscribers/store'

const store = useSubscriberStore()

// Access specific loading states
if (store.loading.fetchingSubscribers) {
  console.log('Fetching subscribers...')
}

// Access computed values
console.log('Total subscribers:', store.subscriberCount)
console.log('Total status count:', store.totalStatusCount)

// Reset store state
store.resetState()
```

**3. Error Handling:**

```typescript
const { fetchSubscribers, hasError, error, clearError } = useSubscribers()

try {
  await fetchSubscribers('d2054881-b8c1-4bfa-93ce-a0e94d003ead23')
} catch (err) {
  // Error is automatically captured in store state
  if (hasError.value) {
    console.error('Error code:', error.value?.code)
    console.error('Error message:', error.value?.message)
    console.error('Error timestamp:', error.value?.timestamp)
  }
}

// Clear error manually
clearError()
```
## Best Practices

### 1. Layer Isolation

**DO:**
```typescript
// Domain use case depends only on repository interface
export class FetchSubscribers {
  constructor(private readonly repository: SubscriberRepository) {}
}

// Infrastructure implements the interface
export class SubscriberApi implements SubscriberRepository {
  // Implementation details
}
```

**DON'T:**
```typescript
// Don't import infrastructure in domain layer
import { SubscriberApi } from '../infrastructure/api/SubscriberApi' // ❌

export class FetchSubscribers {
  constructor(private readonly api: SubscriberApi) {} // ❌
}
```

### 2. Immutability

**DO:**
```typescript
// Use readonly properties in domain models
export interface Subscriber {
  readonly id: string
  readonly email: string
  readonly status: SubscriberStatus
}

// Return readonly state from store
return {
  subscribers: readonly(subscribers),
  loading: readonly(loading)
}
```

**DON'T:**
```typescript
// Don't expose mutable state
export interface Subscriber {
  id: string // ❌ - should be readonly
  email: string // ❌ - should be readonly
}
```

### 3. Error Handling

**DO:**
```typescript
// Create domain-specific error types
export class SubscriberValidationError extends Error {
  constructor(message: string, public readonly validationErrors: unknown) {
    super(message)
    this.name = 'SubscriberValidationError'
  }
}

// Handle errors at appropriate layers
try {
  const result = await this.repository.fetchAll(workspaceId)
  return result
} catch (error) {
  if (error instanceof SubscriberValidationError) {
    // Handle validation errors
  }
  throw error // Re-throw if not handled
}
```

**DON'T:**
```typescript
// Don't swallow errors silently
try {
  await this.repository.fetchAll(workspaceId)
} catch (error) {
  // ❌ - Don't ignore errors
}

// Don't expose internal error details
throw new Error(`Database connection failed: ${internalError.stack}`) // ❌
```
### 4. Testing

**DO:**
```typescript
// Test each layer in isolation
describe('FetchSubscribers', () => {
  const mockRepository: SubscriberRepository = {
    fetchAll: vi.fn(),
    countByStatus: vi.fn(),
    countByTags: vi.fn()
  }

  it('should validate workspace ID', async () => {
    const useCase = new FetchSubscribers(mockRepository)

    await expect(useCase.execute('')).rejects.toThrow('Workspace ID is required')
    expect(mockRepository.fetchAll).not.toHaveBeenCalled()
  })
})
```

**DON'T:**
```typescript
// Don't test multiple layers together in unit tests
describe('FetchSubscribers', () => {
  it('should fetch from real API', async () => {
    const api = new SubscriberApi() // ❌ - Creates real dependencies
    const useCase = new FetchSubscribers(api)

    const result = await useCase.execute('d2054881-b8c1-4bfa-93ce-a0e94d003ead23') // ❌ - Makes real HTTP calls
  })
})
```

### 5. Dependency Injection

**DO:**
```typescript
// Use factory functions for dependency creation
export function createUseCases(): SubscriberUseCases {
  const repository = createRepository()

  return {
    fetchSubscribers: new FetchSubscribers(repository),
    countByStatus: new CountByStatus(repository),
    countByTags: new CountByTags(repository)
  }
}

// Initialize store with injected dependencies
const useCases = createUseCases()
store.initializeStore(useCases)
```

**DON'T:**
```typescript
// Don't create dependencies directly in classes
export class FetchSubscribers {
  private repository = new SubscriberApi() // ❌ - Hard dependency

  async execute(workspaceId: string): Promise<Subscriber[]> {
    return this.repository.fetchAll(workspaceId)
  }
}
```

### 6. Component Design

**DO:**
```vue
<!-- Receive data through props -->
<script setup lang="ts">
interface Props {
  subscribers: Subscriber[]
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'edit-subscriber', subscriber: Subscriber): void
  (e: 'delete-subscriber', subscriber: Subscriber): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

**DON'T:**
```vue
<!-- Don't make API calls directly in components -->
<script setup lang="ts">
import { SubscriberApi } from '../infrastructure/api/SubscriberApi' // ❌

const api = new SubscriberApi() // ❌
const subscribers = ref<Subscriber[]>([])

onMounted(async () => {
  subscribers.value = await api.fetchAll('d2054881-b8c1-4bfa-93ce-a0e94d003ead23') // ❌
})
</script>
```
## Troubleshooting

### Common Issues

#### 1. Store Not Initialized Error

**Error:** `Store must be initialized with use cases before use`

**Solution:**
```typescript
// Ensure store is initialized before use
import { initializeSubscriberStore } from '@/subscribers/di'

// Initialize before using store
initializeSubscriberStore()

// Or use the composable which auto-initializes
const { subscribers } = useSubscribers()
```

#### 2. Circular Dependency Issues

**Error:** Module import cycles or circular dependencies

**Solution:**
- Use index.ts files for clean exports
- Avoid importing from parent directories
- Use dependency injection instead of direct imports

```typescript
// Good - Use index.ts for exports
export { FetchSubscribers } from './FetchSubscribers'
export { CountByStatus } from './CountByStatus'

// Good - Import from index
import { FetchSubscribers, CountByStatus } from '../usecases'
```

#### 3. Type Errors with Readonly State

**Error:** Cannot assign to readonly property

**Solution:**
```typescript
// Don't try to mutate readonly state directly
subscribers.value.push(newSubscriber) // ❌

// Use store actions instead
await store.fetchSubscribers(workspaceId) // ✅

// Or create new arrays
subscribers.value = [...subscribers.value, newSubscriber] // ✅
```

#### 4. Testing Mock Issues

**Error:** Mocks not working correctly in tests

**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Reset container for integration tests
beforeEach(() => {
  resetContainer()
  configureContainer({ customRepository: mockRepository })
})

// Use proper mock typing
const mockRepository = {
  fetchAll: vi.fn(),
  countByStatus: vi.fn(),
  countByTags: vi.fn()
} as SubscriberRepository
```

#### 5. Validation Errors

**Error:** Zod validation failures with API responses

**Solution:**
```typescript
// Check API response format matches domain models
// Add logging to see actual vs expected data
console.log('API Response:', apiResponse)
console.log('Validation Error:', validationResult.error)

// Update schemas if API format changes
export const subscriberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  // Add new fields as needed
  newField: z.string().optional()
})
```

This comprehensive documentation provides everything needed to understand, use, and maintain the subscribers clean architecture implementation. The modular design ensures that the system remains maintainable and extensible as requirements evolve.
