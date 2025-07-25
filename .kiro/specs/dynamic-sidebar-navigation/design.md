# Design Document

## Overview

The dynamic sidebar navigation feature will create a flexible AppSidebar component that builds its UI from a declarative configuration structure. The component will integrate seamlessly with the existing Reka UI sidebar components and support advanced features like conditional visibility, access control, nested menus, and active state management.

## Architecture

### Component Hierarchy

```text
AppSidebar.vue (main component)
├── AppSidebarItem.vue (recursive item renderer)
├── types.ts (TypeScript interfaces)
└── utils.ts (helper functions)
└── index.ts (export all components and types)
```

### Integration Points

- **Existing UI Components**: Leverages Sidebar, SidebarMenu, SidebarMenuItem, Collapsible components from `@/components/ui/sidebar`
- **Icon System**: Uses Lucide Vue Next icons with LucideIcon type
- **Router Integration**: Supports Vue Router with RouterLink for navigation
- **Tooltip System**: Integrates with existing tooltip components for collapsed state

## Components and Interfaces

### Core Types (types.ts)

```typescript
import type { LucideIcon } from "lucide-vue-next";

export interface AppSidebarItem {
  title: string;
  url?: string; // Optional - if missing, renders as container/category
  icon?: LucideIcon; // Optional Lucide icon
  isActive?: boolean; // Force active state
  tooltip?: string; // Custom tooltip text (defaults to title)
  visible?: boolean | (() => boolean); // Visibility control
  canAccess?: () => boolean | Promise<boolean>; // Access control
  items?: AppSidebarItem[]; // Nested submenu items
}

export interface AppSidebarProps {
  items: AppSidebarItem[];
}
```

### AppSidebar.vue

**Purpose**: Main container component that orchestrates the sidebar rendering

**Key Features**:

- Accepts `items` prop of type `AppSidebarItem[]`
- Filters items based on visibility and access permissions
- Renders using existing Sidebar, SidebarContent structure
- Handles async access control without blocking UI

**Template Structure**:

```vue
<Sidebar>
  <SidebarContent>
    <SidebarGroup>
      <SidebarMenu>
        <AppSidebarItem
          v-for="item in filteredItems"
          :key="item.title"
          :item="item"
        />
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

### AppSidebarItem.vue

**Purpose**: Recursive component that renders individual navigation items

**Key Features**:

- Recursive rendering for nested items
- Conditional rendering based on URL presence
- Integration with Collapsible for submenus
- Active state detection and management
- Tooltip integration for collapsed sidebar

**Rendering Logic**:

1. **With URL**: Renders as `SidebarMenuButton` with RouterLink/anchor
2. **Without URL**: Renders as category header or collapsible trigger
3. **With Items**: Wraps in Collapsible component for submenu functionality
4. **Active State**: Applies active styling and auto-expands parent menus

### Helper Functions (utils.ts)

#### Visibility Control

```typescript
export function isVisible(item: AppSidebarItem): boolean {
  if (typeof item.visible === "function") return item.visible();
  return item.visible !== false;
}
```

#### Access Control

```typescript
export async function canAccess(item: AppSidebarItem): Promise<boolean> {
  if (!item.canAccess) return true;
  const result = item.canAccess();
  return typeof result === "boolean" ? result : await result;
}
```

#### Navigation Filtering

```typescript
export async function filterNavItems(
  items: AppSidebarItem[]
): Promise<AppSidebarItem[]> {
  const results: AppSidebarItem[] = [];

  for (const item of items) {
    if (!isVisible(item)) continue;
    if (!(await canAccess(item))) continue;

    const children = item.items ? await filterNavItems(item.items) : undefined;

    results.push({
      ...item,
      items: children,
    });
  }

  return results;
}
```

#### Active State Detection

```typescript
export function isItemActive(item: AppSidebarItem, currentRoute: string): boolean {
  if (item.isActive) return true;
  if (item.url && currentRoute === item.url) return true;
  return item.items?.some(child => isItemActive(child, currentRoute)) ?? false;
}
```

## Data Models

### Navigation Item Structure

```typescript
// Example configuration
const navigationItems: AppSidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
    isActive: true
  },
  {
    title: "Models",
    icon: Bot,
    canAccess: () => userStore.hasPermission('models.read'),
    items: [
      { title: "Genesis", url: "/models/genesis" },
      { title: "Explorer", url: "/models/explorer" }
    ]
  },
  {
    title: "Admin",
    icon: Settings2,
    visible: () => userStore.isAdmin,
    items: [
      { title: "Users", url: "/admin/users" },
      { title: "Settings", url: "/admin/settings" }
    ]
  }
];
```

### State Management

The component will be stateless and rely on:

- **Props**: Navigation configuration via `items` prop
- **Vue Router**: Current route detection for active states
- **External Stores**: User permissions and application state
- **Local State**: Collapsible menu open/closed states

## Error Handling

### Async Access Control

- Use `Promise.resolve()` to normalize sync/async access functions
- Handle rejected promises gracefully by defaulting to no access
- Implement loading states for async permission checks
- Avoid blocking UI rendering during permission evaluation

### Invalid Configuration

- Validate required properties (title) at runtime
- Provide meaningful console warnings for missing icons or invalid URLs
- Gracefully handle circular references in nested items
- Default to safe fallbacks for malformed configuration

### Router Integration

- Handle missing routes gracefully
- Support both hash and history router modes
- Provide fallback for non-Vue Router environments (use anchor tags)

## Testing Strategy

### Unit Tests

- **AppSidebar.vue**: Props validation, filtering logic, rendering
- **AppSidebarItem.vue**: Recursive rendering, active states, tooltips
- **utils.ts**: Visibility functions, access control, filtering algorithms

### Integration Tests

- Navigation flow with Vue Router
- Permission-based visibility with mock user stores
- Collapsible behavior and state persistence
- Tooltip display in collapsed sidebar mode

### Test Scenarios

1. **Basic Rendering**: Simple flat navigation structure
2. **Nested Menus**: Multi-level navigation with proper indentation
3. **Conditional Visibility**: Items shown/hidden based on functions
4. **Access Control**: Async permission checking
5. **Active States**: Route-based and manual active state management
6. **Edge Cases**: Empty items array, missing properties, circular references

### Mock Data

```typescript
const mockNavItems: AppSidebarItem[] = [
  {
    title: "Public Item",
    url: "/public",
    icon: BookOpen
  },
  {
    title: "Admin Only",
    url: "/admin",
    icon: Settings2,
    canAccess: () => Promise.resolve(false)
  },
  {
    title: "Nested Menu",
    icon: Bot,
    items: [
      { title: "Sub Item 1", url: "/nested/1" },
      { title: "Sub Item 2", url: "/nested/2" }
    ]
  }
];
```

## Performance Considerations

### Async Operations

- Debounce permission checks to avoid excessive API calls
- Cache permission results with appropriate TTL
- Use `Promise.all()` for parallel permission evaluation
- Implement loading indicators for slow permission checks

### Rendering Optimization

- Use `v-show` vs `v-if` appropriately for visibility toggles
- Implement virtual scrolling for large navigation trees
- Lazy load nested menu items when expanded
- Memoize computed properties for active state detection

### Memory Management

- Clean up event listeners in `onUnmounted`
- Avoid memory leaks in recursive component structure
- Use weak references for circular dependency prevention
