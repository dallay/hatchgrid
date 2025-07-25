# @hatchgrid/logger Usage Guide

This guide provides comprehensive examples and patterns for using the `@hatchgrid/logger` package in different application contexts.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment-Based Configuration](#environment-based-configuration)
- [Web Application Integration](#web-application-integration)
- [Landing Page Integration](#landing-page-integration)
- [Hierarchical Logger Usage](#hierarchical-logger-usage)
- [Initialization Helpers](#initialization-helpers)
- [Advanced Patterns](#advanced-patterns)

## Quick Start

### Basic Setup

```typescript
import { LogManager, LogLevel, ConsoleTransport } from '@hatchgrid/logger';

// Configure the logger system
LogManager.configure({
  level: LogLevel.INFO,
  transports: [new ConsoleTransport()],
});

// Use loggers in your application
const logger = LogManager.getLogger('app');
logger.info('Application started successfully');
```

### Using the Configuration Builder

```typescript
import { LoggerConfigurationBuilder, ConsoleTransport } from '@hatchgrid/logger';

const config = LoggerConfigurationBuilder
  .development() // or .production()
  .withLoggerLevel('api.database', LogLevel.TRACE)
  .withLoggerLevel('ui.animation', LogLevel.WARN)
  .withTransport(new ConsoleTransport())
  .build();

LogManager.configure(config);
```

## Environment-Based Configuration

### Development Configuration

```typescript
import {
  LogManager,
  LogLevel,
  ConsoleTransport,
  LoggerConfigurationBuilder
} from '@hatchgrid/logger';

// Verbose logging for development
const config = LoggerConfigurationBuilder
  .development() // Starts with DEBUG level
  .withLoggerLevels({
    'api.database': LogLevel.TRACE, // Show all database queries
    'ui.animation': LogLevel.WARN,  // Reduce animation noise
    'performance': LogLevel.INFO,
    'security': LogLevel.DEBUG,
  })
  .withTransport(new ConsoleTransport())
  .build();

LogManager.configure(config);
```

### Production Configuration

```typescript
// Minimal logging for production
const config = LoggerConfigurationBuilder
  .production() // Starts with INFO level
  .withLoggerLevels({
    // Critical systems should log more
    'security': LogLevel.DEBUG,
    'payment': LogLevel.DEBUG,
    'audit': LogLevel.DEBUG,

    // Non-critical systems should log less
    'ui': LogLevel.WARN,
    'animation': LogLevel.ERROR,
  })
  .withTransport(new ConsoleTransport())
  .build();

LogManager.configure(config);
```

### Environment Detection

```typescript
import { Environment, initializeEnvironmentLogger } from '@hatchgrid/logger';

// Automatic environment-based configuration
initializeEnvironmentLogger({
  levels: {
    'custom.module': LogLevel.DEBUG,
  },
});

// Manual environment detection
if (Environment.isDevelopment()) {
  // Development-specific setup
} else if (Environment.isProduction()) {
  // Production-specific setup
}
```

## Web Application Integration

### Vue.js Application Setup

```typescript
// main.ts
import { initializeWebAppLogger } from '@hatchgrid/logger';

// Quick setup for Vue.js applications
initializeWebAppLogger({
  enableApiLogging: true,
  enableComponentLogging: true,
  enablePerformanceLogging: true,
  customLevels: {
    'app.auth': LogLevel.DEBUG,
    'app.routing': LogLevel.INFO,
  },
});

// Your Vue app setup continues...
```

### Vue Component Logging

```typescript
// In a Vue component
import { LogManager } from '@hatchgrid/logger';

export default {
  name: 'UserProfile',
  setup() {
    const logger = LogManager.getLogger('components.UserProfile');

    onMounted(() => {
      logger.debug('Component mounted', { userId: props.userId });
    });

    const handleSubmit = async (formData) => {
      logger.info('Form submission started', { formData });

      try {
        const result = await api.updateProfile(formData);
        logger.info('Profile updated successfully', { result });
      } catch (error) {
        logger.error('Profile update failed', error, { formData });
      }
    };

    return { handleSubmit };
  },
};
```

### Pinia Store Integration

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';
import { LogManager } from '@hatchgrid/logger';

export const useAuthStore = defineStore('auth', () => {
  const logger = LogManager.getLogger('store.auth');

  const login = async (credentials) => {
    logger.debug('Login attempt started', { username: credentials.username });

    try {
      const response = await authApi.login(credentials);
      logger.info('Login successful', { userId: response.userId });
      return response;
    } catch (error) {
      logger.error('Login failed', error, { username: credentials.username });
      throw error;
    }
  };

  return { login };
});
```

### API Client Integration

```typescript
// services/api.ts
import { LogManager } from '@hatchgrid/logger';

class ApiClient {
  private logger = LogManager.getLogger('api.client');
  private requestLogger = LogManager.getLogger('api.requests');
  private responseLogger = LogManager.getLogger('api.responses');

  async request(method: string, url: string, data?: any) {
    const requestId = `req-${Date.now()}`;
    const startTime = performance.now();

    this.requestLogger.debug('API request started', {
      requestId,
      method,
      url,
      data,
    });

    try {
      const response = await fetch(url, {
        method,
        body: data ? JSON.stringify(data) : undefined,
        headers: { 'Content-Type': 'application/json' },
      });

      const duration = performance.now() - startTime;

      this.responseLogger.debug('API request completed', {
        requestId,
        status: response.status,
        duration: Math.round(duration),
      });

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.logger.error('API request failed', {
        requestId,
        method,
        url,
        error: error.message,
        duration: Math.round(duration),
      });

      throw error;
    }
  }
}
```

## Landing Page Integration

### Astro Application Setup

```typescript
// src/pages/_app.ts (or similar entry point)
import { initializeLandingPageLogger } from '@hatchgrid/logger';

// Quick setup for Astro applications
initializeLandingPageLogger({
  enableBuildLogging: true,
  enableContentLogging: true,
  enableHydrationLogging: true,
  enableAnalyticsLogging: true,
  customLevels: {
    'seo': LogLevel.INFO,
    'performance': LogLevel.DEBUG,
  },
});
```

### Content Collection Logging

```typescript
// src/content/config.ts
import { LogManager } from '@hatchgrid/logger';
import { defineCollection, z } from 'astro:content';

const logger = LogManager.getLogger('content.collections');

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
  }).transform((data, ctx) => {
    logger.debug('Blog entry processed', {
      title: data.title,
      publishDate: data.publishDate,
      tags: data.tags,
    });
    return data;
  }),
});

export const collections = { blog };
```

### Client-Side Hydration

```typescript
// src/components/ContactForm.vue
<script setup lang="ts">
import { LogManager } from '@hatchgrid/logger';

const logger = LogManager.getLogger('hydration.ContactForm');

onMounted(() => {
  logger.debug('Contact form hydrated and ready for interaction');
});

const handleSubmit = async (formData) => {
  logger.info('Contact form submitted', {
    fields: Object.keys(formData),
    timestamp: new Date().toISOString(),
  });

  try {
    await submitForm(formData);
    logger.info('Contact form submission successful');
  } catch (error) {
    logger.error('Contact form submission failed', error);
  }
};
</script>
```

### Marketing Analytics

```typescript
// src/utils/analytics.ts
import { LogManager } from '@hatchgrid/logger';

const analyticsLogger = LogManager.getLogger('analytics.events');
const marketingLogger = LogManager.getLogger('marketing.tracking');

export function trackPageView(path: string, referrer?: string) {
  marketingLogger.info('Page view', {
    path,
    referrer,
    timestamp: new Date().toISOString(),
  });
}

export function trackConversion(eventName: string, value?: number) {
  analyticsLogger.info('Conversion event', {
    event: eventName,
    value,
    timestamp: new Date().toISOString(),
  });
}

export function trackUserInteraction(action: string, element: string) {
  analyticsLogger.debug('User interaction', {
    action,
    element,
    timestamp: new Date().toISOString(),
  });
}
```

## Hierarchical Logger Usage

### API Service Hierarchy

```typescript
// Different levels for different API layers
LogManager.configure({
  level: LogLevel.INFO,
  levels: {
    'api': LogLevel.DEBUG,           // All API logging at DEBUG
    'api.auth': LogLevel.TRACE,      // Authentication needs detailed logging
    'api.auth.jwt': LogLevel.DEBUG,  // JWT processing at DEBUG (less than auth)
    'api.database': LogLevel.WARN,   // Database operations only warnings and errors
    'api.cache': LogLevel.ERROR,     // Cache operations only errors
  },
  transports: [new ConsoleTransport()],
});

// Usage
const apiLogger = LogManager.getLogger('api');
const authLogger = LogManager.getLogger('api.auth');
const jwtLogger = LogManager.getLogger('api.auth.jwt');
const userAuthLogger = LogManager.getLogger('api.auth.user'); // Inherits TRACE from api.auth
const dbLogger = LogManager.getLogger('api.database');
```

### Frontend Component Hierarchy

```typescript
LogManager.configure({
  level: LogLevel.INFO,
  levels: {
    'ui': LogLevel.DEBUG,                    // All UI components at DEBUG
    'ui.components': LogLevel.INFO,          // General components at INFO
    'ui.components.forms': LogLevel.DEBUG,   // Forms need more detailed logging
    'ui.components.tables': LogLevel.WARN,   // Tables are stable, less logging
    'ui.router': LogLevel.ERROR,             // Router only errors
    'ui.store': LogLevel.DEBUG,              // State management debugging
  },
  transports: [new ConsoleTransport()],
});

// Usage
const formLogger = LogManager.getLogger('ui.components.forms.login');
const tableLogger = LogManager.getLogger('ui.components.tables.users');
const routerLogger = LogManager.getLogger('ui.router');
```

### Feature-Based Hierarchy

```typescript
LogManager.configure({
  level: LogLevel.INFO,
  levels: {
    // Feature-based organization
    'feature.dashboard': LogLevel.DEBUG,
    'feature.dashboard.widgets': LogLevel.INFO,
    'feature.dashboard.charts': LogLevel.WARN,

    'feature.reports': LogLevel.INFO,
    'feature.reports.generation': LogLevel.DEBUG,
    'feature.reports.export': LogLevel.WARN,

    'feature.admin': LogLevel.DEBUG,
    'feature.admin.users': LogLevel.TRACE,
    'feature.admin.settings': LogLevel.INFO,
  },
  transports: [new ConsoleTransport()],
});
```

## Initialization Helpers

### Quick Initialization Functions

```typescript
import {
  initializeWebAppLogger,
  initializeLandingPageLogger,
  initializeEnvironmentLogger,
  createLoggerConfig,
} from '@hatchgrid/logger';

// For Vue.js web applications
initializeWebAppLogger({
  enableApiLogging: true,
  enableComponentLogging: true,
  customLevels: { 'custom.module': LogLevel.DEBUG },
});

// For Astro landing pages
initializeLandingPageLogger({
  enableBuildLogging: true,
  enableContentLogging: true,
  enableAnalyticsLogging: true,
});

// Environment-based initialization
initializeEnvironmentLogger({
  levels: { 'custom.module': LogLevel.DEBUG },
});

// Use case-specific configurations
const apiConfig = createLoggerConfig('api-service');
const uiConfig = createLoggerConfig('ui-components');
const testConfig = createLoggerConfig('testing');
```

### Runtime Reconfiguration

```typescript
import { reconfigureLogger, debugLoggerConfiguration } from '@hatchgrid/logger';

// Update configuration at runtime
reconfigureLogger({
  level: LogLevel.DEBUG,
  loggerLevels: {
    'api.debug': LogLevel.TRACE,
    'ui.debug': LogLevel.DEBUG,
  },
});

// Debug current configuration
debugLoggerConfiguration();
```

## Advanced Patterns

### Conditional Logging

```typescript
const logger = LogManager.getLogger('app.conditional');

// Feature flag-based logging
const featureFlags = {
  enableDatabaseLogging: true,
  enablePerformanceLogging: false,
};

if (featureFlags.enableDatabaseLogging) {
  const dbLogger = LogManager.getLogger('database');
  dbLogger.debug('Database logging enabled');
}
```

### Performance Monitoring

```typescript
const perfLogger = LogManager.getLogger('performance.api');

const measureApiCall = async (operation: string, fn: () => Promise<any>) => {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    perfLogger.info('API operation completed', {
      operation,
      duration: Math.round(duration),
      status: 'success',
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    perfLogger.error('API operation failed', {
      operation,
      duration: Math.round(duration),
      status: 'error',
      error: error.message,
    });

    throw error;
  }
};

// Usage
const result = await measureApiCall('fetchUsers', () => api.getUsers());
```

### Error Boundary Integration

```typescript
// Global error handler
const errorLogger = LogManager.getLogger('errors.global');

window.addEventListener('error', (event) => {
  errorLogger.error('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.error('Unhandled promise rejection', {
    reason: event.reason?.message || event.reason,
    stack: event.reason?.stack,
  });
});
```

### Testing Integration

```typescript
// test-setup.ts
import { LogManager, LogLevel, ConsoleTransport } from '@hatchgrid/logger';

// Minimal logging for tests
LogManager.configure({
  level: LogLevel.ERROR, // Only show errors during tests
  levels: {
    'test.debug': LogLevel.DEBUG, // Enable debug for specific test modules
  },
  transports: [new ConsoleTransport()],
});

// In test files
const testLogger = LogManager.getLogger('test.auth');

describe('Authentication', () => {
  beforeEach(() => {
    testLogger.debug('Test setup started');
  });

  it('should authenticate user', async () => {
    testLogger.debug('Running authentication test');
    // Test implementation
  });
});
```

## Best Practices

1. **Use hierarchical naming**: Organize loggers by feature, component, or layer
2. **Configure by environment**: Use different log levels for development vs production
3. **Log structured data**: Include relevant context objects with log messages
4. **Handle errors gracefully**: Always log errors with sufficient context
5. **Monitor performance**: Log timing information for critical operations
6. **Use appropriate levels**: TRACE for detailed debugging, INFO for business events, ERROR for failures
7. **Avoid logging sensitive data**: Never log passwords, tokens, or personal information
8. **Cache logger instances**: Reuse logger instances rather than creating new ones repeatedly

## Migration from Other Loggers

### From console.log

```typescript
// Before
console.log('User logged in:', userId);
console.error('Login failed:', error);

// After
const logger = LogManager.getLogger('auth');
logger.info('User logged in', { userId });
logger.error('Login failed', error);
```

### From other logging libraries

```typescript
// Configure similar to other libraries
LogManager.configure({
  level: LogLevel.INFO, // Similar to winston levels
  levels: {
    'database': LogLevel.DEBUG,
    'api': LogLevel.INFO,
  },
  transports: [new ConsoleTransport()], // Similar to winston transports
});
```

This usage guide provides comprehensive examples for integrating `@hatchgrid/logger` into different types of applications and use cases. The hierarchical logging system and environment-based configuration make it suitable for both simple and complex applications.
