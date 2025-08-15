---
title: Smart Layout System
description: Implement a smart layout system in Vue 3 that dynamically switches layouts based on route metadata
---
# Smart Layout System Implementation

This implementation follows the Vue 3 smart layout pattern as described in the article "Vue 3 layout system: smart layouts for VueJS". The system provides dynamic layout switching based on route metadata.

## Architecture

### 1. Core Components

#### Main Layout Wrapper (`src/layouts/AppLayout.vue`)
```vue
<template>
  <component :is="$route.meta.layoutComponent">
    <slot />
  </component>
</template>
```

This is the main layout that dynamically renders different layout components based on the route metadata.

#### Layout Middleware (`src/router/middleware/loadLayoutMiddleware.ts`)
```typescript
export async function loadLayoutMiddleware(route: RouteLocationNormalized) {
  try {
    const layout = route.meta.layout || 'AppLayout'
    const layoutComponent = await import(`@/layouts/${layout}.vue`)
    route.meta.layoutComponent = layoutComponent.default
  } catch (error) {
    // Load default layout on error
  }
}
```

This middleware dynamically imports layout components before each route navigation.

### 2. Available Layouts

#### `SimpleLayout.vue`
- **Use Case**: Authentication pages (login, register)
- **Features**: Centered card layout with branding and footer
- **Styling**: Gradient background, clean minimal design

#### `DashboardLayout.vue`
- **Use Case**: Main application pages for authenticated users
- **Features**: Header with navigation, main content area, footer
- **Styling**: Full-width layout with sticky header

### 3. Router Configuration

Routes are configured with layout metadata:

```typescript
{
  path: "/login",
  name: "login",
  component: LoginView,
  meta: {
    layout: 'AuthLayoutGuest'
  },
},
{
  path: "/",
  name: "home",
  component: HomeView,
  meta: {
    requiresAuth: true,
    layout: 'AppLayoutUser'
  },
}
```

### 4. App.vue Integration

The main App.vue wraps the RouterView with the dynamic AppLayout:

```vue
<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toaster />
</template>
```

## Benefits

1. **Dynamic Layout Switching**: Layouts change automatically based on route
2. **Code Splitting**: Layouts are dynamically imported only when needed
3. **Scalable**: Easy to add new layouts without router changes
4. **Maintainable**: Clear separation of layout concerns
5. **Flexible**: Each layout can have completely different structure and styling
6. **Error Handling**: Graceful fallback to default layout on errors

## Adding New Layouts

1. Create a new layout file in `src/layouts/` (e.g., `AppLayoutDashboard.vue`)
2. Add the layout name to route meta: `meta: { layout: 'AppLayoutDashboard' }`
3. The middleware will automatically load and apply the new layout

## Layout Naming Convention

- `AuthLayout*` - Authentication-related layouts
- `AppLayout*` - Main application layouts
- `AdminLayout*` - Administrative layouts
- Use descriptive suffixes: `Guest`, `User`, `Admin`, `Dashboard`, etc.

## Error Handling

If a layout fails to load, the system automatically falls back to the default `AppLayout` to ensure the application remains functional.
