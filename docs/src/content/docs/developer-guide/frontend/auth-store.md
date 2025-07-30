---
title: Auth Store Refactoring
description: Refactor the auth store to follow the options API pattern for better maintainability and extensibility.
---
# Auth Store Refactoring

The auth store has been refactored to follow the options API pattern similar to the reference implementation provided.

## Changes Made

### 1. Store Structure
**Before (Composition API):**
```typescript
export const useAuthStore = defineStore("auth", () => {
  const account = ref<Account | null>(null);
  const isAuthenticated = computed(() => !!account.value);
  // ... functions
});
```

**After (Options API):**
```typescript
export const useAuthStore = defineStore('auth', {
  state: (): AuthStateStorable => ({ ...defaultAuthState }),
  getters: {
    account: (state) => state.userIdentity,
    isAuthenticated: (state) => state.authenticated,
  },
  actions: {
    // ... methods
  },
});
```

### 2. State Interface
Added explicit state interface and default state:

```typescript
export interface AuthStateStorable {
  logon: Promise<unknown> | null;
  userIdentity: Account | null;
  authenticated: boolean;
  profilesLoaded: boolean;
  ribbonOnProfiles: string;
  activeProfiles: string;
}

export const defaultAuthState: AuthStateStorable = {
  logon: null,
  userIdentity: null,
  authenticated: false,
  profilesLoaded: false,
  ribbonOnProfiles: '',
  activeProfiles: '',
};
```

### 3. New Actions Added

#### Profile Management
- `setProfilesLoaded()` - Mark profiles as loaded
- `setActiveProfiles(profile: string)` - Set active profile
- `setRibbonOnProfiles(ribbon: string)` - Set ribbon configuration

#### Authentication Flow
- `authenticate(promise: Promise<unknown>)` - Track authentication promise
- `setAuthentication(identity: Account)` - Set user identity and mark as authenticated
- `logout()` - Clear authentication state (sync)
- `logoutAsync()` - Logout with server call (async)

### 4. Method Changes

#### Login Process
```typescript
// Before
async function login(username: string, password: string): Promise<boolean>

// After
async login(username: string, password: string): Promise<boolean>
```
Now tracks the login promise with `authenticate()` method.

#### Logout Process
```typescript
// Before
async function logout(): Promise<void>

// After
logout() // Sync state clearing
logoutAsync(): Promise<void> // Async server logout
```

### 5. Component Updates

Updated components to use the new async logout method:
- `AppHeader.vue`: `authStore.logout()` → `authStore.logoutAsync()`
- `AppLayoutAdmin.vue`: `authStore.logout()` → `authStore.logoutAsync()`

### 6. Test Updates

Updated test file to work with the new store structure:
- Changed direct property access: `authStore.account` → `authStore.userIdentity`
- Updated logout test to use `authStore.logoutAsync()`

## Benefits

1. **Consistency**: Matches the reference implementation pattern
2. **Extensibility**: Easy to add profile management features
3. **State Tracking**: Better tracking of authentication promises
4. **Type Safety**: Explicit state interface with TypeScript support
5. **Separation of Concerns**: Clear distinction between sync/async operations

## Usage Examples

### Basic Authentication Check
```typescript
const authStore = useAuthStore();
if (authStore.isAuthenticated) {
  // User is logged in
}
```

### Login
```typescript
try {
  await authStore.login(username, password);
  // Success
} catch (error) {
  // Handle error
}
```

### Logout
```typescript
try {
  await authStore.logoutAsync();
  // Logged out successfully
} catch (error) {
  // Server logout failed, but local state is cleared
}
```

### Profile Management
```typescript
// Set active profile
authStore.setActiveProfiles('admin');

// Mark profiles as loaded
authStore.setProfilesLoaded();

// Set ribbon configuration
authStore.setRibbonOnProfiles('development');
```

The refactored store maintains backward compatibility for the core authentication features while adding new capabilities for profile management and better state tracking.
