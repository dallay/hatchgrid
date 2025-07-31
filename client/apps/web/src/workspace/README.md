# Workspace Module

The Workspace module implements a clean architecture approach for workspace management in the frontend application. It provides workspace listing, selection, and management capabilities while maintaining clear separation of concerns and following domain-driven design principles.

## Architecture Overview

The module is structured into four primary layers:

```
src/workspace/
├── domain/           # Core business logic, entities, and interfaces
├── infrastructure/   # External API integrations and adapters
├── store/            # State management (Pinia) and orchestration
├── providers/        # Dependency injection and store factories
└── composables/      # Reusable composition functions
```

### Layer Dependencies

- Presentation → Store → Domain ← Infrastructure
- Domain layer is framework-agnostic and contains no external dependencies
- Infrastructure layer implements domain interfaces to provide concrete data access
- Store coordinates use cases and maintains reactive state
- Providers handle dependency injection and store creation

## Quick Start

### Basic Usage

```typescript
import { useWorkspaceStoreProvider } from "@/workspace";

// Get the workspace store instance
const workspaceStore = useWorkspaceStoreProvider();

// Load all workspaces
await workspaceStore.loadAll();

// Select a workspace
await workspaceStore.selectWorkspace("workspace-id");

// Access current workspace
const currentWorkspace = workspaceStore.currentWorkspace;
```

### Using the WorkspaceSelector Component

```vue
<template>
  <WorkspaceSelector
    :workspaces="workspaces"
    :loading="loading"
    :error="error"
    :initial-workspace-id="selectedWorkspaceId"
    @workspace-change="handleWorkspaceChange"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import WorkspaceSelector from "@/components/WorkspaceSelector.vue";
import { useWorkspaceStoreProvider } from "@/workspace";

const workspaceStore = useWorkspaceStoreProvider();

const handleWorkspaceChange = (workspaceId: string) => {
  workspaceStore.selectWorkspace(workspaceId);
};

const handleRetry = () => {
  workspaceStore.loadAll();
};
</script>
```

## Core Types

### Workspace

```typescript
interface Workspace {
  readonly id: string;           // UUID
  readonly name: string;         // Display name
  readonly description?: string; // Optional description
  readonly ownerId: string;      // Owner UUID
  readonly createdAt: string;    // ISO 8601 timestamp
  readonly updatedAt: string;    // ISO 8601 timestamp
}
```

### WorkspaceRepository

```typescript
interface WorkspaceRepository {
  list(): Promise<CollectionResponse<Workspace>>;
  getById(id: string): Promise<SingleItemResponse<Workspace> | null>;
}
```

### WorkspaceStore

```typescript
interface WorkspaceStore {
  // State
  readonly workspaces: Workspace[];
  readonly currentWorkspace: Workspace | null;
  readonly loading: LoadingStates;
  readonly error: WorkspaceError | null;

  // Actions
  loadAll(): Promise<void>;
  selectWorkspace(id: string): Promise<void>;
  clearError(): void;

  // Getters
  readonly hasWorkspaces: boolean;
  readonly isWorkspaceSelected: boolean;
  readonly workspaceCount: number;
}
```

## Use Cases

### ListWorkspaces

Retrieves all accessible workspaces for the current user.

```typescript
import { ListWorkspaces } from "@/workspace";

const listWorkspaces = new ListWorkspaces(repository);
const workspaces = await listWorkspaces.execute();
```

### GetWorkspaceById

Retrieves detailed information for a single workspace by ID.

```typescript
import { GetWorkspaceById } from "@/workspace";

const getWorkspaceById = new GetWorkspaceById(repository);
const workspace = await getWorkspaceById.execute("workspace-id");
```

## Error Handling

The module provides comprehensive error handling with typed error states:

```typescript
interface WorkspaceError {
  readonly message: string;
  readonly code?: string;
  readonly timestamp: Date;
}
```

### Error Recovery

```typescript
// Check if error is recoverable
if (workspaceStore.error && workspaceStore.isRetryable) {
  await workspaceStore.loadAll(); // Retry the operation
}
```

## Caching

The store implements intelligent caching to minimize API calls:

```typescript
// Cache configuration
interface CacheConfig {
  readonly ttl: number;           // Time to live in milliseconds
  readonly maxEntries: number;    // Maximum cache entries
  readonly enabled: boolean;      // Enable/disable caching
}
```

## Testing

### Unit Testing Use Cases

```typescript
import { ListWorkspaces } from "@/workspace";

describe("ListWorkspaces", () => {
  it("should return workspaces from repository", async () => {
    const mockRepository = {
      list: vi.fn().mockResolvedValue({ data: mockWorkspaces }),
      getById: vi.fn(),
    };

    const useCase = new ListWorkspaces(mockRepository);
    const result = await useCase.execute();

    expect(result.data).toEqual(mockWorkspaces);
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });
});
```

### Testing Store Actions

```typescript
import { createWorkspaceStore } from "@/workspace";

describe("WorkspaceStore", () => {
  it("should load workspaces successfully", async () => {
    const mockRepository = createMockRepository();
    const store = createWorkspaceStore({ repository: mockRepository });

    await store.loadAll();

    expect(store.workspaces).toHaveLength(2);
    expect(store.loading.loadingAll).toBe(false);
  });
});
```

### Component Testing

```typescript
import { mount } from "@vue/test-utils";
import WorkspaceSelector from "@/components/WorkspaceSelector.vue";

describe("WorkspaceSelector", () => {
  it("should emit workspace-change when workspace is selected", async () => {
    const wrapper = mount(WorkspaceSelector, {
      props: { workspaces: mockWorkspaces },
    });

    await wrapper.find('[data-testid="workspace-item"]').trigger("click");

    expect(wrapper.emitted("workspace-change")).toBeTruthy();
  });
});
```

## Performance Considerations

### Caching Strategy

- Workspace lists are cached for 5 minutes by default
- Individual workspace details are cached for 10 minutes
- Cache is automatically invalidated on workspace updates

### Search Optimization

- Search is debounced with a 300ms delay
- Search is only enabled when there are 5+ workspaces
- Results are filtered client-side for immediate feedback

### Loading States

- Skeleton loading states prevent layout shifts
- Progressive loading shows available data immediately
- Error boundaries prevent cascading failures

## Extensibility

The module is designed for easy extension:

### Adding New Use Cases

```typescript
export class CreateWorkspace {
  constructor(private readonly repository: WorkspaceRepository) {}

  async execute(data: CreateWorkspaceData): Promise<Workspace> {
    // Implementation
  }
}
```

### Custom Repository Implementations

```typescript
export class GraphQLWorkspaceRepository implements WorkspaceRepository {
  async list(): Promise<CollectionResponse<Workspace>> {
    // GraphQL implementation
  }

  async getById(id: string): Promise<SingleItemResponse<Workspace> | null> {
    // GraphQL implementation
  }
}
```

### Store Extensions

```typescript
// Extend the store with additional actions
const extendedStore = {
  ...workspaceStore,

  async createWorkspace(data: CreateWorkspaceData) {
    // Custom action implementation
  }
};
```

## Migration Guide

### From TeamSwitcher to WorkspaceSelector

The WorkspaceSelector component replaces the legacy TeamSwitcher:

```typescript
// Before
import TeamSwitcher from "@/components/TeamSwitcher.vue";

// After
import WorkspaceSelector from "@/components/WorkspaceSelector.vue";
```

### Props Migration

```typescript
// Before (TeamSwitcher)
interface TeamSwitcherProps {
  teams: Team[];
}

// After (WorkspaceSelector)
interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  loading?: boolean;
  error?: WorkspaceError | null;
  // ... additional props
}
```

## API Reference

For detailed API documentation, see the individual module exports:

- [Domain Models](./domain/models/index.ts)
- [Use Cases](./domain/usecases/index.ts)
- [Repository Interface](./domain/repositories/index.ts)
- [Store Implementation](./store/index.ts)
- [Infrastructure Layer](./infrastructure/index.ts)
- [Providers](./providers/index.ts)

## Contributing

When contributing to the workspace module:

1. Follow the clean architecture principles
2. Add comprehensive tests for new functionality
3. Update JSDoc comments for public APIs
4. Ensure type safety with TypeScript
5. Follow the existing error handling patterns
6. Update this documentation for significant changes

## License

This module is part of the Hatchgrid project and follows the same license terms.
