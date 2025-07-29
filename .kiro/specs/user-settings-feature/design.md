# Design Document: User Settings Feature

## Overview

The User Settings Feature will provide a comprehensive system for managing user preferences across the application. This design document outlines the architecture, components, data models, and implementation strategy for both backend and frontend aspects of the feature.

The feature will allow users to customize their experience by configuring preferences such as theme (dark/light mode), language, notification preferences, and other application-specific settings. The system is designed to be extensible, allowing for easy addition of new setting types in the future.

## Architecture

The User Settings Feature follows the project's hexagonal architecture pattern, with clear separation between:

1. **API Layer** - REST controllers handling HTTP requests
2. **Service Layer** - Business logic for managing settings
3. **Repository Layer** - Data access for persisting settings
4. **Domain Model** - Core entities and value objects

### Backend Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  REST API       │────▶│  Service Layer  │────▶│  Repository     │
│  Controllers    │     │  (Business      │     │  Layer          │
│                 │◀────│  Logic)         │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      │                       │
         ▼                      ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  DTOs           │     │  Domain         │     │  Database       │
│  (Request/      │     │  Models         │     │  (PostgreSQL)   │
│   Response)     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Frontend Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Settings UI    │────▶│  Settings       │────▶│  API Service    │
│  Components     │     │  Store (Pinia)  │     │  Layer          │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Components and Interfaces

### Backend Components

1. **UserSettingController**
   - REST controller exposing endpoints for CRUD operations on user settings
   - Handles authentication and authorization
   - Maps DTOs to domain models and vice versa

2. **UserSettingService**
   - Implements business logic for managing settings
   - Handles default values and fallbacks
   - Validates setting values

3. **UserSettingRepository**
   - Reactive R2DBC repository for database operations
   - Handles persistence of user settings

4. **UserSetting Domain Model**
   - Represents the core entity for user settings
   - Contains validation logic

### Frontend Components

1. **SettingsPage**
   - Main container component for the settings UI
   - Organizes settings into categories

2. **SettingItem**
   - Reusable component for individual settings
   - Adapts to different setting types (toggle, select, input, etc.)

3. **SettingsStore**
   - Pinia store for managing settings state
   - Handles API communication and local state

4. **SettingsService**
   - API service for communicating with the backend
   - Handles error states and loading states

## Data Models

### Backend Data Models

#### UserSetting Entity

```kotlin
@Table("user_settings")
data class UserSetting(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column("user_id")
    val userId: UUID,

    @Column("key")
    val key: String,

    @Column("value")
    val value: String,

    @Column("data_type")
    val dataType: String,

    @Column("created_at")
    val createdAt: Instant = Instant.now(),

    @Column("updated_at")
    val updatedAt: Instant = Instant.now()
)
```

#### UserSettingDTO

```kotlin
data class UserSettingDTO(
    val id: UUID?,
    val key: String,
    val value: String,
    val dataType: String
)
```

#### UserSettingsResponse

```kotlin
data class UserSettingsResponse(
    val settings: List<UserSettingDTO>
)
```

### Frontend Data Models

```typescript
interface UserSetting {
  id: string;
  key: string;
  value: string;
  dataType: string;
}

type SettingDataType = 'string' | 'boolean' | 'number' | 'json' | 'enum';

interface SettingDefinition {
  key: string;
  label: string;
  description?: string;
  dataType: SettingDataType;
  defaultValue: any;
  options?: Array<{value: any, label: string}>;  // For enum types
  category: string;
}
```

## API Endpoints

### GET /api/v1/users/settings

Retrieves all settings for the authenticated user.

**Response:**

```json
{
  "settings": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "key": "theme",
      "value": "dark",
      "dataType": "string"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "key": "language",
      "value": "en",
      "dataType": "string"
    }
  ]
}
```

### GET /api/v1/users/settings/{key}

Retrieves a specific setting by key.

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "key": "theme",
  "value": "dark",
  "dataType": "string"
}
```

### PUT /api/v1/users/settings/{key}

Updates a specific setting.

**Request:**

```json
{
  "value": "light",
  "dataType": "string"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "key": "theme",
  "value": "light",
  "dataType": "string"
}
```

### PUT /api/v1/users/settings

Batch updates multiple settings.

**Request:**

```json
{
  "settings": [
    {
      "key": "theme",
      "value": "light",
      "dataType": "string"
    },
    {
      "key": "language",
      "value": "fr",
      "dataType": "string"
    }
  ]
}
```

**Response:**

```json
{
  "settings": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "key": "theme",
      "value": "light",
      "dataType": "string"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "key": "language",
      "value": "fr",
      "dataType": "string"
    }
  ]
}
```

## Database Schema

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_user_setting UNIQUE (user_id, key)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

## Error Handling

### Backend Error Handling

1. **Validation Errors**
   - Return 400 Bad Request with detailed error messages
   - Include field-specific validation errors

2. **Authentication/Authorization Errors**
   - Return 401 Unauthorized for unauthenticated requests
   - Return 403 Forbidden for authenticated but unauthorized requests

3. **Not Found Errors**
   - Return 404 Not Found when a setting doesn't exist

4. **Server Errors**
   - Return 500 Internal Server Error for unexpected exceptions
   - Log detailed error information for debugging

### Frontend Error Handling

1. **API Error Handling**
   - Display user-friendly error messages
   - Provide retry mechanisms for transient errors
   - Log errors to monitoring system

2. **Validation Feedback**
   - Immediate visual feedback for invalid inputs
   - Clear error messages explaining validation requirements

## Testing Strategy

### Backend Testing

1. **Unit Tests**
   - Test service layer business logic
   - Test controller request/response mapping
   - Test repository queries

2. **Integration Tests**
   - Test API endpoints with TestContainers
   - Verify database operations
   - Test authentication/authorization

3. **Test Coverage**
   - Aim for >80% code coverage
   - Focus on business logic and edge cases

### Frontend Testing

1. **Component Tests**
   - Test individual UI components
   - Verify component rendering and interactions

2. **Store Tests**
   - Test Pinia store mutations and actions
   - Verify state management

3. **API Service Tests**
   - Mock API responses
   - Test error handling

4. **End-to-End Tests**
   - Test complete user flows
   - Verify integration between components
