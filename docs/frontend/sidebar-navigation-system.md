# Dynamic Sidebar Navigation System

## Overview

The dynamic sidebar navigation system provides a flexible, type-safe, and performant way to render navigation menus in the Vue.js application. It supports nested menus, conditional visibility, access control, active state management, and accessibility features.

## Architecture

### Core Components

- **AppSidebar.vue**: Main container component that orchestrates navigation rendering
- **AppSidebarItem.vue**: Recursive component for rendering individual navigation items
- **types.ts**: TypeScript interfaces and type definitions
- **utils.ts**: Utility functions for navigation processing and validation
- **composables/**: Reusable composition functions for error handling and navigation filtering

### Key Features

1. **Declarative Configuration**: Define navigation structure using TypeScript interfaces
2. **Recursive Rendering**: Support for unlimited nesting levels
3. **Conditional Visibility**: Show/hide items based on functions or boolean values
4. **Access Control**: Async permission checking with graceful error handling
5. **Active State Management**: Automatic detection and visual feedback for active routes
6. **Performance Optimization**: Memoization, caching, and efficient re-rendering
7. **Accessibility**: ARIA attributes, keyboard navigation, and screen reader support
8. **Error Boundaries**: Graceful degradation when navigation items fail to load

## Usage

### Basic Navigation Structure

```typescript
import type { AppSidebarItem } from "@/layouts/components/sidebar/types";
import { Home, Settings, Users } from "lucide-vue-next";

const navigationItems: AppSidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "All Users", url: "/admin/users" },
      { title: "User Settings", url: "/admin/settings" }
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    visible: () => userStore.isAdmin,
    canAccess: async () => await checkPermission('settings.read'),
    items: [
      { title: "General", url: "/settings/general" },
      { title: "Advanced", url: "/settings/advanced" }
    ]
  }
];
```

### Component Integration

```vue
<template>
  <AppSidebar
    :items="navigationItems"
    collapsible="icon"
    variant="sidebar"
    side="left"
  />
</template>

<script setup lang="ts">
import AppSidebar from "@/layouts/components/sidebar/AppSidebar.vue";
import { navigationItems } from "./navigation-config";
</script>
```

## Configuration Options

### AppSidebarItem Interface

```typescript
interface AppSidebarItem {
  title: string;                                    // Required: Display text
  url?: string;                                     // Optional: Navigation URL
  icon?: LucideIcon;                               // Optional: Lucide icon component
  isActive?: boolean;                              // Optional: Force active state
  tooltip?: string;                                // Optional: Tooltip text (defaults to title)
  visible?: boolean | (() => boolean);             // Optional: Visibility control
  canAccess?: () => boolean | Promise<boolean>;    // Optional: Access control
  items?: AppSidebarItem[];                        // Optional: Nested items
}
```

### Sidebar Props

```typescript
interface AppSidebarProps {
  items: AppSidebarItem[];                         // Navigation items array
  collapsible?: "icon" | "offcanvas" | "none";    // Collapse behavior
  variant?: "sidebar" | "floating" | "inset";     // Visual variant
  side?: "left" | "right";                        // Sidebar position
}
```

## Advanced Features

### Conditional Visibility

```typescript
// Boolean visibility
{ title: "Admin Panel", visible: false }

// Function-based visibility
{ title: "Admin Panel", visible: () => userStore.isAdmin }

// Reactive visibility
{ title: "Admin Panel", visible: () => computed(() => userStore.role === 'admin').value }
```

### Access Control

```typescript
// Synchronous access control
{
  title: "User Management",
  canAccess: () => userStore.hasPermission('users.read')
}

// Asynchronous access control
{
  title: "Admin Panel",
  canAccess: async () => {
    const response = await api.checkPermission('admin.access');
    return response.allowed;
  }
}
```

### Active State Management

```typescript
// Automatic active state (based on current route)
{ title: "Dashboard", url: "/dashboard" }

// Manual active state
{ title: "Dashboard", url: "/dashboard", isActive: true }

// Parent items automatically expand when children are active
{
  title: "Settings",
  items: [
    { title: "General", url: "/settings/general" } // Active if current route matches
  ]
}
```

## Performance Considerations

### Caching Strategy

The system implements multiple levels of caching:

1. **Active State Cache**: Memoizes active state calculations
2. **Permission Cache**: Caches access control results with TTL
3. **Key Generation Cache**: Optimizes Vue's key-based rendering

### Optimization Techniques

- **Parallel Processing**: Access control checks run in parallel
- **Lazy Evaluation**: Visibility functions called only when needed
- **Efficient Re-rendering**: Stable keys prevent unnecessary component recreation
- **Memory Management**: Automatic cache cleanup and size limits

## Error Handling

### Error Boundaries

The system includes comprehensive error handling:

```typescript
// Graceful degradation for invalid items
const safeItems = safeProcessNavItems(rawItems);

// Error recovery for failed permission checks
try {
  const hasAccess = await item.canAccess();
  return hasAccess;
} catch (error) {
  console.warn(`Access check failed for "${item.title}":`, error);
  return false; // Fail closed
}
```

### Error Types

- **Navigation Errors**: Failed to load navigation structure
- **Permission Errors**: Access control check failures
- **Validation Errors**: Invalid navigation configuration
- **Render Errors**: Component rendering failures

## Testing

### Test Structure

```
sidebar/
├── AppSidebar.test.ts           # Integration tests
├── AppSidebarItem.test.ts       # Component tests
├── utils.test.ts                # Utility function tests
├── test-factories.ts            # Test data factories
├── test-types.ts                # Test type definitions
└── test-utils.ts                # Test helper functions
```

### Testing Patterns

```typescript
// Use factories for consistent test data
const mockItem = createMockSidebarItem({
  title: "Test Item",
  url: "/test"
});

// Test async operations
const asyncItem = createAsyncPermissionItem(true, 50);
await waitForAsyncOperations();

// Performance testing
const { duration, passed } = createPerformanceTest(
  () => renderLargeNavigation(100),
  100 // max 100ms
);
```

## Accessibility

### ARIA Support

- **aria-expanded**: Indicates collapsible state
- **aria-label**: Descriptive labels for screen readers
- **role**: Appropriate roles for navigation elements
- **aria-current**: Marks active navigation items

### Keyboard Navigation

- **Tab**: Navigate between items
- **Enter/Space**: Activate items and toggle submenus
- **Arrow Keys**: Navigate within menu hierarchy
- **Escape**: Close expanded submenus

## Migration Guide

### From Static Navigation

```typescript
// Before: Static navigation
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
</nav>

// After: Dynamic navigation
const items: AppSidebarItem[] = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Settings", url: "/settings" }
];

<AppSidebar :items="items" />
```

### Adding Permissions

```typescript
// Add access control to existing items
const items: AppSidebarItem[] = [
  {
    title: "Admin Panel",
    url: "/admin",
    canAccess: () => userStore.isAdmin // Add this line
  }
];
```

## Best Practices

### Configuration

1. **Keep navigation flat**: Avoid excessive nesting (max 3 levels)
2. **Use meaningful titles**: Clear, concise navigation labels
3. **Implement proper permissions**: Always use access control for sensitive areas
4. **Provide tooltips**: Especially for icon-only collapsed states

### Performance

1. **Cache permission results**: Avoid repeated API calls
2. **Use stable keys**: Prevent unnecessary re-renders
3. **Lazy load large menus**: Consider virtualization for 100+ items
4. **Monitor performance**: Use built-in performance monitoring

### Accessibility

1. **Test with screen readers**: Verify ARIA attributes work correctly
2. **Support keyboard navigation**: Ensure all functionality is keyboard accessible
3. **Provide meaningful labels**: Use descriptive aria-label attributes
4. **Maintain focus management**: Proper focus handling in collapsible menus

## Troubleshooting

### Common Issues

1. **Items not showing**: Check visibility and access control functions
2. **Performance issues**: Review caching configuration and item count
3. **Active state not working**: Verify URL matching and route configuration
4. **Permission errors**: Check async function error handling

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('sidebar-debug', 'true');

// Check cache statistics
console.log(activeStateCache.getStats());

// Validate navigation configuration
validateNavConfig(navigationItems);
```

## API Reference

### Components

- `AppSidebar`: Main sidebar container
- `AppSidebarItem`: Recursive navigation item renderer

### Composables

- `useNavigationFiltering`: Handles item filtering and async operations
- `useErrorBoundary`: Provides error handling and recovery
- `useAccessibility`: Manages ARIA attributes and keyboard navigation

### Utilities

- `filterNavItems`: Filters items based on visibility and access
- `isItemActive`: Determines if an item is currently active
- `validateNavConfig`: Validates navigation configuration
- `measureNavigationPerformance`: Performance monitoring

### Types

- `AppSidebarItem`: Navigation item interface
- `AppSidebarProps`: Sidebar component props
- `Result<T>`: Success/error result type
