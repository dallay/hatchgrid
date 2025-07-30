---
title: Vue 3 Translation Integration
description: Integrate vue-i18n with Vue 3 using Pinia stores and Composition API
---
# Vue 3 Translation Integration Documentation

## Overview

This document explains the integration of vue-i18n translation system with the existing Vue 3 application, inspired by the JHipster pattern but adapted for modern Vue 3 with Composition API and Pinia stores.

## Architecture Components

### 1. Translation Store (`stores/translation.ts`)

The Pinia store manages the translation state across the application:

```typescript
export interface TranslationState {
  currentLanguage: string;
  availableLanguages: { code: string; name: string; flag: string }[];
  isLoading: boolean;
}
```

**Key features:**

- Persists language preference in localStorage
- Provides reactive language switching
- Supports multiple languages with metadata (name, flag)
- Loading state management for async language changes

### 2. Translation Service (`services/translation.service.ts`)

Handles the actual translation operations:

**Key methods:**

- `refreshTranslation(newLanguage: string)`: Dynamically loads translation files
- `setLocale(language: string)`: Updates the i18n instance locale
- `isLanguageSupported(language: string)`: Validates language support
- `translate(key: string, params?)`: Direct translation method

**Features:**

- Dynamic import of translation files from `locales/` directory
- Fallback to English if translation loading fails
- Document language attribute updating
- Local storage integration

### 3. Account Service Integration

Enhanced account service with language awareness:

```typescript
// Language preference handling
const userLanguage = this.authStore.account?.langKey;
await this.changeLanguage(userLanguage);
```

### 4. Initialization Service (`services/initialization.service.ts`)

Orchestrates the startup sequence:

**Initialization flow:**

1. Load language from localStorage
2. Determine best language (stored → user profile → browser → fallback)
3. Set up reactive watchers for language changes
4. Initialize authentication
5. Configure router guards

## Integration with Vue 3 Main Application

### Enhanced main.ts Structure

```typescript
import { createI18n } from "vue-i18n";
import { i18nConfig } from "@/config/i18n.config";
import { InitializationService } from "@/services/initialization.service";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  const i18n = createI18n(i18nConfig);

  // Plugin registration
  app.use(pinia);
  app.use(router);
  app.use(i18n);

  // Service initialization
  const initializationService = new InitializationService({
    app,
    router,
    i18n: i18n.global,
  });

  await initializationService.initialize();

  // Global service provision
  const translationService = initializationService.getTranslationService();
  const accountService = initializationService.getAccountService();
  app.provide('translationService', translationService);
  app.provide('accountService', accountService);

  app.mount("#app");
}
```

### Key Differences from JHipster Modal-based Auth

1. **Page-based authentication**: Uses Vue Router navigation instead of Bootstrap modals
2. **shadcn/vue components**: Modern UI components instead of Bootstrap
3. **Composition API**: All services use Vue 3 Composition API patterns
4. **Pinia stores**: Modern state management instead of Vuex
5. **TypeScript-first**: Full TypeScript integration with proper typing

## Router Integration

### Enhanced Router Guards

```typescript
import { useAuthStore } from '@/stores/auth';
import { inject } from 'vue';

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();
  const accountService = inject('accountService');

  // Authentication check
  if (!authStore.authenticated) {
    await accountService.update();
  }

  // Authority checking
  if (to.meta?.authorities?.length > 0) {
    const hasAuth = await accountService.hasAnyAuthorityAndCheckAuth(to.meta.authorities);
    if (!hasAuth) {
      next({ path: authStore.authenticated ? '/forbidden' : '/login' });
      return;
    }
  }

  next();
});
```

## Axios Interceptor Enhancements

### Updated Request/Response Handling

**Request interceptor:**

- XSRF token handling for non-GET requests
- Bearer token authentication
- Request logging

**Response interceptor:**

- Enhanced 401/403 error handling
- Token cleanup on logout
- Redirect with query parameters for login flow
- Network error handling

## Language Switching Flow

### Reactive Language Management

1. **User changes language** → Translation store updated
2. **Store change detected** → Translation service updates i18n instance
3. **i18n instance updated** → DOM language attribute updated
4. **Components reactive** → UI updates automatically

### Priority Order for Language Selection

1. Stored language preference (localStorage)
2. User account language (`account.langKey`)
3. Browser language (`navigator.language`)
4. Fallback to English

## Component Integration

### Using Translation Service in Components

```vue
<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const translationService = inject('translationService');

// Direct translation
const message = t('welcome.message');

// Programmatic language change
await translationService.refreshTranslation('es');
</script>
```

### Using Translation Store

```vue
<script setup>
import { useTranslationStore } from '@/stores/translation';

const translationStore = useTranslationStore();

// Access current language
const currentLang = translationStore.currentLanguage;

// Change language
translationStore.setCurrentLanguage('es');
</script>
```

## Service Injection Pattern

### Global Service Provision

Services are provided globally in main.ts and can be injected in any component:

```typescript
// In main.ts
const translationService = initializationService.getTranslationService();
const accountService = initializationService.getAccountService();
app.provide('translationService', translationService);
app.provide('accountService', accountService);

// In any component
const translationService = inject('translationService');
const accountService = inject('accountService');
```

## Error Handling and Fallbacks

### Translation Loading Errors

- Failed language loads fall back to English
- Error logging for debugging
- Graceful degradation without breaking the app

#### User Notification Strategy

When a translation fails to load or the system falls back to English, users are notified via non-intrusive toast notifications. These notifications appear briefly at the bottom or top of the screen, informing users that their preferred language could not be loaded and that English is being used as a fallback. This approach ensures users are aware of the issue without interrupting their workflow or navigation. The notification system is implemented using a composable toast component (e.g., Vue Toastification or similar), and all error messages are localized where possible. No modal dialogs or blocking UI elements are used, maintaining a smooth and uninterrupted app experience.

### Network Errors

- 401: Logout and redirect to login with return URL
- 403: Redirect to forbidden page
- Network errors: Console logging (could be enhanced with toast notifications)

## Testing Considerations

### Unit Testing

```typescript
// Mock translation service
const mockTranslationService = {
  refreshTranslation: vi.fn(),
  setLocale: vi.fn(),
  getCurrentLanguage: () => 'en',
  translate: (key: string) => key,
};

// Mock i18n instance
const mockI18n = {
  global: {
    locale: { value: 'en' },
    t: (key: string) => key,
  }
};
```

### Integration Testing

- Test language switching flow
- Test authentication with different languages
- Test router guard behavior with auth states

## Performance Considerations

### Lazy Loading

Translation files are dynamically imported only when needed:

```typescript
const messages = await import(`../locales/${newLanguage}.json`);
```

### Memory Management

- Only load required translation files
- Clean up old translations when switching languages
- Efficient reactive watchers that don't cause memory leaks

## Future Enhancements

1. **Toast notifications** for network errors
2. **Language detection** based on user location
3. **Plural forms** and advanced translation features
4. **Translation management** for content creators
5. **A/B testing** for different language versions

## Migration from JHipster Pattern

### Key Changes Made

1. Replaced `useLoginModal()` with router-based navigation
2. Updated store watchers to use Vue 3 `watch()` API
3. Enhanced error handling in axios interceptors
4. Integrated with shadcn/vue component library
5. Added TypeScript interfaces for better type safety
6. Modernized service injection pattern

This integration provides a robust, scalable, and modern approach to internationalization in Vue 3 applications while maintaining the proven patterns from JHipster but adapted for modern frontend architecture.
