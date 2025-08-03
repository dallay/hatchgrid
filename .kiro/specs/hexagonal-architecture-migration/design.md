# Design Document

## Overview

This design document outlines the migration strategy for transforming the `client/apps/web` Vue.js application from its current mixed architecture to a consistent hexagonal architecture with screaming architecture principles. The migration will reorganize the codebase into domain-driven modules while preserving all existing functionality, tests, and user experience.

The current application has a partially implemented hexagonal architecture in some features (subscribers, workspace) while other features (account, dashboard, security) follow different organizational patterns. This migration will standardize the entire codebase to follow the established architectural patterns.

This structure follows Screaming Architecture principles, where top-level folders reflect business domains, not technical layers.

## Architecture

### Current State Analysis

The application currently has the following structure:

- **Compliant Features**: `subscribers/` and `workspace/` already follow hexagonal architecture
- **Non-Compliant Features**: `account/`, `dashboard/`, `security/`, `services/`, `stores/`
- **Shared Infrastructure**: `components/ui/`, `layouts/`, `router/`, `i18n/`, `config/`
- **Mixed Organization**: Some features are organized by technical concerns, others by business domains

### Target Architecture

The target architecture follows the hexagonal pattern with screaming architecture principles:

```text
src/
├── authentication/           # Authentication & Account Management Domain
│   ├── domain/
│   │   ├── models/          # Account, User, AuthState models
│   │   ├── errors/          # Authentication-specific errors
│   │   └── validation/      # Domain validation rules
│   ├── application/
│   │   ├── login.ts         # Login use case
│   │   ├── register.ts      # Registration use case
│   │   ├── logout.ts        # Logout use case
│   │   └── account-management.ts # Account operations
│   └── infrastructure/
│       ├── api/
│       │   └── auth.api.ts  # Authentication API client
│       ├── store/
│       │   └── useAuthStore.ts # Pinia store
│       └── routing/
│           └── auth.routes.ts # Authentication routes
├── dashboard/               # Dashboard Domain
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── workspace/               # Already compliant - minor adjustments
├── subscribers/             # Already compliant - minor adjustments
├── components/
│   └── ui/                  # Centralized UI components (unchanged)
├── layouts/                 # Application layouts (unchanged)
├── shared/                  # Cross-cutting concerns
│   ├── config/             # Configuration utilities
│   ├── cache/              # Caching utilities
│   └── utils/              # General utilities
├── router/                  # Main router configuration
├── i18n/                   # Internationalization (unchanged)
└── main.ts                 # Application entry point
```

This structure implicitly respects the Dependency Inversion Principle: domain and application layers remain independent of framework or delivery mechanisms, while infrastructure depends on them for behavior orchestration.

### Screaming Architecture Compliance

Each top-level folder in `src/` represents a business domain (e.g., `authentication`, `dashboard`, `workspace`) rather than a technical concern. This ensures the folder structure communicates the system's purpose at a glance and supports modular, team-oriented scaling.

### Domain Identification

Based on the current codebase analysis, the following domains have been identified:

1. **Authentication Domain** (`authentication/`)
   - Login, logout, registration
   - Account management and settings
   - Password reset and activation
   - User profile management
   - Authority and permission management

2. **Dashboard Domain** (`dashboard/`)
   - Dashboard views and components
   - Dashboard-specific business logic

3. **Workspace Domain** (`workspace/`)
   - Already implemented with hexagonal architecture
   - Minor adjustments for consistency

4. **Subscribers Domain** (`subscribers/`)
   - Already implemented with hexagonal architecture
   - Minor adjustments for consistency

## Components and Interfaces

### Authentication Domain Components

#### Domain Layer

- **Models**: `Account`, `User`, `AuthenticationState`, `RegistrationData`
- **Errors**: `AuthenticationError`, `InvalidCredentialsError`, `AccountNotActivatedError`
- **Validation**: Account validation rules, password strength validation

#### Application Layer

- **Use Cases**:
  - `LoginUseCase`: Handle user authentication
  - `LogoutUseCase`: Handle user logout
  - `RegisterUseCase`: Handle user registration
  - `AccountManagementUseCase`: Handle account updates
  - `PasswordResetUseCase`: Handle password reset flow

#### Infrastructure Layer

- **API**: `AuthenticationApi` for HTTP communication
- **Store**: `useAuthStore` for state management
- **Routing**: Authentication route definitions

### Shared UI Guidelines

All shared UI components MUST be placed under `components/ui/` and reused across all domains. No domain may redefine or duplicate foundational UI primitives (e.g., buttons, inputs, modals). This ensures visual consistency and avoids fragmentation of the design system.

### Migration Strategy Components

#### File Movement Mapper

A systematic mapping of current files to their new locations:

```typescript
interface FileMigrationMap {
  source: string;
  destination: string;
  type: 'move' | 'split' | 'merge';
  dependencies: string[];
}
```

#### Import Path Updater

A utility to systematically update import statements across the codebase:

```typescript
interface ImportUpdate {
  file: string;
  oldImport: string;
  newImport: string;
}
```

## Data Models

### Authentication Domain Models

```typescript
// Domain Models
interface Account {
  username: string;
  email?: string;
  fullname?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  authorities: ReadonlySet<string>;
  langKey?: string;
  activated?: boolean;
  imageUrl?: string;
  createdDate?: Date | string;
  lastModifiedDate?: Date | string;
}

interface AuthenticationState {
  isAuthenticated: boolean;
  account: Account | null;
  authorities: string[];
  profilesLoaded: boolean;
  activeProfiles: string[];
}

interface RegistrationData {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}
```

### Migration Tracking Models

```typescript
interface MigrationProgress {
  domain: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  filesProcessed: number;
  totalFiles: number;
  testsStatus: 'pending' | 'passing' | 'failing';
}

interface DependencyGraph {
  file: string;
  dependencies: string[];
  dependents: string[];
  migrationOrder: number;
}
```

## Error Handling

### Domain-Specific Error Handling

Each domain will have its own error types and handling strategies:

```typescript
// Authentication Domain Errors
class AuthenticationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super('Invalid username or password', 'INVALID_CREDENTIALS');
  }
}

class AccountNotActivatedError extends AuthenticationError {
  constructor() {
    super('Account is not activated', 'ACCOUNT_NOT_ACTIVATED');
  }
}
```

### Migration Error Handling

```typescript
class MigrationError extends Error {
  constructor(
    message: string,
    public file: string,
    public phase: 'analysis' | 'migration' | 'verification'
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}
```

## Testing Strategy

### Test Preservation Strategy

1. **Unit Tests**: Tests will be moved alongside their corresponding modules
2. **Integration Tests**: Import paths will be updated, test logic preserved
3. **E2E Tests**: No changes required as they test user-facing functionality
4. **Component Tests**: Moved to appropriate domain folders

### Test Organization

```text
authentication/
├── domain/
│   ├── models/
│   │   ├── Account.ts
│   │   └── Account.test.ts
├── application/
│   ├── login.ts
│   └── login.test.ts
└── infrastructure/
    ├── api/
    │   ├── auth.api.ts
    │   └── auth.api.test.ts
    └── store/
        ├── useAuthStore.ts
        └── useAuthStore.test.ts
```

### Test Migration Process

1. **Identify Test Dependencies**: Map each test file to its dependencies
2. **Update Import Statements**: Modify import paths to reflect new structure
3. **Verify Test Isolation**: Ensure tests remain isolated and don't break
4. **Run Incremental Validation**: Execute tests after each domain migration

## Implementation Phases

### Phase 1: Preparation and Analysis

- Analyze current file dependencies
- Create migration mapping
- Set up validation scripts
- Create backup of current state

### Phase 2: Shared Infrastructure Migration

- Move shared utilities to `src/shared/`
- Update configuration files
- Migrate cache and utility functions

### Phase 3: Authentication Domain Migration

- Create authentication domain structure
- Move account-related files
- Migrate authentication services and stores
- Update authentication routes
- Verify authentication tests

### Phase 4: Dashboard Domain Migration

- Create dashboard domain structure
- Move dashboard components and logic
- Update dashboard routes
- Verify dashboard functionality

### Phase 5: Existing Domain Adjustments

- Review and adjust workspace domain
- Review and adjust subscribers domain
- Ensure consistency with target architecture

### Phase 6: Import Path Updates

- Systematically update all import statements
- Update barrel exports (index.ts files)
- Verify no broken imports remain

### Phase 7: Validation and Testing

- Run full test suite
- Verify build process
- Test development server
- Validate e2e functionality

### Phase 8: Final Cleanup

- Remove unused files
- Update documentation
- Verify code quality standards

## Migration Tooling

### Automated Migration Scripts

```typescript
interface MigrationTool {
  analyzeDependencies(): DependencyGraph[];
  generateMigrationPlan(): MigrationPlan;
  executeFileMigration(plan: MigrationPlan): Promise<void>;
  updateImportPaths(): Promise<void>;
  validateMigration(): Promise<ValidationResult>;
}
```

### Validation Tools

```typescript
interface ValidationTool {
  checkBuildSuccess(): boolean;
  runTestSuite(): TestResult;
  validateImports(): ImportValidationResult;
  checkFunctionality(): FunctionalityTestResult;
}
```

## Risk Mitigation

### Identified Risks

1. **Import Path Breakage**: Risk of missing import updates
   - Mitigation: Automated import path scanning and updating
   - Validation: TypeScript compilation checks

2. **Test Failures**: Risk of breaking existing tests
   - Mitigation: Incremental migration with test validation at each step
   - Rollback: Git-based rollback strategy

3. **Functionality Regression**: Risk of breaking user-facing features
   - Mitigation: E2E test validation after each phase
   - Monitoring: Comprehensive functionality testing

4. **Build Process Disruption**: Risk of breaking development workflow
   - Mitigation: Continuous build validation
   - Testing: Development server testing at each phase

### Rollback Strategy

1. **Git-based Rollback**: Each phase committed separately for easy rollback
2. **Incremental Validation**: Issues caught early in the process
3. **Backup Strategy**: Full backup before starting migration
4. **Staged Deployment**: Migration can be paused at any phase

## Success Criteria

### Technical Success Criteria

1. **Build Success**: Application builds without errors
2. **Test Success**: All existing tests pass
3. **Import Validation**: No broken import statements
4. **Type Safety**: No TypeScript compilation errors

### Functional Success Criteria

1. **Authentication Flow**: Login/logout works identically
2. **Navigation**: All routes work correctly
3. **UI Consistency**: No visual changes to user interface
4. **Performance**: No significant performance degradation

### Architectural Success Criteria

1. **Domain Isolation**: Each domain is self-contained
2. **Dependency Direction**: Dependencies flow correctly (infrastructure → application → domain)
3. **Testability**: Domain and application layers are easily testable
4. **Maintainability**: New features can be added following clear patterns

## Architecture Anti-Patterns to Avoid

To ensure the success and maintainability of this architecture, the following practices are explicitly discouraged:

- ❌ **Cross-domain logic**: Do not import domain or application logic from one domain into another.
- ❌ **Direct API calls in use cases**: Use cases must only invoke functions from infrastructure (e.g., `auth.api.ts`), never raw `fetch` or `axios` calls.
- ❌ **Global state coupling**: Each domain must manage its own store; no domain should directly use global/shared Pinia stores.
- ❌ **UI duplication**: All shared UI must reside in `components/ui/`, not in feature folders.
- ❌ **Bidirectional dependencies**: Always maintain flow from infrastructure → application → domain. Never the reverse.
