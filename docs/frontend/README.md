# Frontend Documentation

This directory contains documentation for the Hatchgrid frontend application.

## Overview

The frontend is a Vue 3 application built with TypeScript, using modern tooling and best practices:

- **Framework**: Vue 3 with Composition API and Options API
- **Language**: TypeScript
- **Module System**: ECMAScript Modules (ESM)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Components**: Radix Vue + shadcn/ui
- **Testing**: Vitest + Testing Library

## Architecture Documents

### [Layout System](layout-system.md)
Comprehensive documentation of the smart layout system implementation that allows dynamic layout switching based on route metadata.

**Features:**
- Dynamic layout loading with middleware
- Multiple layout types (Auth, User, Admin)
- Code splitting and lazy loading
- Error handling with fallbacks

### [Auth Store Refactoring](auth-store.md)
Documentation of the authentication store refactoring from Composition API to Options API pattern.

**Changes:**
- Options API pattern implementation
- Enhanced state management
- Profile management capabilities
- Improved error handling
- Better TypeScript integration

### [Translation Integration](TRANSLATION_INTEGRATION.md)
Complete documentation of the vue-i18n integration with the Vue 3 application, following modern patterns.

### [Landing Page](landing-page.md)
Documentation of the Astro-based landing page application structure and configuration.

**Features:**
- Astro static site generator setup
- Content collections for structured content
- Internationalization with file-based routing
- Biome configuration for code quality

**Features:**
- Vue-i18n v10 integration with Composition API
- Dynamic translation file loading
- Pinia-based translation store
- Service-based translation management
- Language preference persistence
- Integration with user account preferences

## Service Architecture

- **Translation Service**: Manages i18n operations and language switching
- **Account Service**: Handles user authentication and profile management
- **Initialization Service**: Orchestrates app startup and service integration
- **Service Injection**: Global service provision through Vue's inject/provide pattern

## Project Structure

```
client/apps/web/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── layouts/            # Layout components
│   │   ├── AppLayout.vue           # Dynamic layout wrapper
│   │   ├── AppLayoutUser.vue       # Standard user layout
│   │   ├── AuthLayoutGuest.vue     # Authentication layout
│   │   ├── AppLayoutAdmin.vue      # Admin dashboard layout
│   │   └── components/             # Layout-specific components
│   ├── router/             # Vue Router configuration
│   │   ├── index.ts               # Main router setup
│   │   └── middleware/            # Route middleware
│   ├── stores/             # Pinia stores
│   │   └── auth.ts                # Authentication store
│   ├── views/              # Page components
│   ├── security/           # Authentication models
│   ├── config/             # Configuration files
│   └── main.ts             # Application entry point
├── tests/                  # Test files
└── docs/                   # Local documentation (moved to /docs/frontend/)
```

## Development Workflow

1. **Setup**: `pnpm install` in the workspace root
2. **Development**: `pnpm run dev` to start dev server
3. **Testing**: `pnpm run test` for unit tests
4. **Linting**: `pnpm run check` for code quality
5. **Building**: `pnpm run build` for production

## Key Features

### Smart Layout System
- **Dynamic Loading**: Layouts loaded based on route metadata
- **Multiple Layouts**: Support for different user roles and contexts
- **Code Splitting**: Layouts loaded only when needed
- **Type Safety**: Full TypeScript support

### Authentication
- **Pinia Store**: Centralized auth state management
- **Route Guards**: Protected routes with automatic redirects
- **Session Management**: Cached session validation
- **Profile Support**: Multi-profile user management

### Styling
- **Tailwind CSS**: Utility-first styling approach
- **Design System**: Consistent component library
- **Dark Mode**: Built-in light/dark theme support
- **Responsive**: Mobile-first responsive design

### Testing
- **Unit Tests**: Comprehensive store and component testing
- **Type Checking**: TypeScript compilation verification
- **Coverage Reports**: Code coverage tracking
- **CI Integration**: Automated testing in workflows

## Contributing

When adding new features:

1. Follow the established patterns in the codebase
2. Add appropriate tests for new functionality
3. Update documentation for significant changes
4. Ensure all checks pass (`pnpm run check && pnpm run test && pnpm run build`)
5. Document any breaking changes

## Related Documentation

- [Authentication](../authentication/) - Backend authentication setup
- [Landing](../landing/) - Landing page design documentation
- [Clean Code](../clean_code.md) - Coding standards and practices
- [JavaScript Modules](../conventions/javascript-modules.md) - JavaScript module system conventions
