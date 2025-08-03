# Dependency Analysis Report

Generated on: 2025-08-03T12:51:16.018Z

## File Statistics

- VUE: 315 files
- TS: 151 files
- **Total**: 466 files

## Domain Classification

### Authentication (18 files)

- account/activate/activate.vue
- account/change-password/change-password.vue
- account/login/allowedRoutes.ts
- account/login/login.vue
- account/register/register.vue
- account/reset-password/finish/reset-password-finish.vue
- account/reset-password/init/reset-password-init.vue
- account/settings/settings.vue
- components/UserNav.vue
- components/UserProfile.vue
- ... and 8 more files

### Dashboard (7 files)

- dashboard/Dashboard.vue
- dashboard/components/DateRangePicker.vue
- dashboard/components/Overview.vue
- dashboard/components/RecentSales.vue
- layouts/DashboardLayout.vue
- views/HomeView.vue
- views/WorkspaceDashboard.vue

### Workspace (34 files)

- components/WorkspaceErrorBoundary.vue
- components/WorkspaceSelector.vue
- components/WorkspaceSelectorSkeleton.vue
- components/composables/useWorkspaceDisplay.ts
- components/composables/useWorkspaceErrorHandling.ts
- components/composables/useWorkspacePerformance.ts
- components/composables/useWorkspaceSearch.ts
- components/composables/useWorkspaceSelection.ts
- workspace/composables/index.ts
- workspace/composables/useWorkspaceInitialization.ts
- ... and 24 more files

### Subscribers (29 files)

- subscribers/composables/index.ts
- subscribers/composables/useSubscribers.ts
- subscribers/di/container.ts
- subscribers/di/index.ts
- subscribers/di/initialization.ts
- subscribers/domain/index.ts
- subscribers/domain/models/CountByStatusResponse.ts
- subscribers/domain/models/CountByTagsResponse.ts
- subscribers/domain/models/Subscriber.ts
- subscribers/domain/models/index.ts
- ... and 19 more files

### Shared (363 files)

- cache/lru.cache.ts
- components/MainMenuNav.vue
- components/MainNav.vue
- components/NavProjects.vue
- components/ThemeSwitcher.vue
- components/composables/index.ts
- components/ribbon/ribbon.vue
- components/ui/accordion/Accordion.vue
- components/ui/accordion/AccordionContent.vue
- components/ui/accordion/AccordionItem.vue
- ... and 353 more files

### Unclassified (15 files)

- App.vue
- composables/useLocalStorage.ts
- error/error.vue
- i18n/index.ts
- i18n/load.locales.ts
- i18n/types.ts
- main.ts
- router/audience.ts
- router/index.ts
- shared/index.ts
- ... and 5 more files

## Dependency Analysis

### Most Connected Files (Top 10)

- **lib/utils.ts**: 224 connections (0 deps, 224 dependents)
- **components/ui/button/index.ts**: 30 connections (0 deps, 30 dependents)
- **stores/auth.ts**: 12 connections (1 deps, 11 dependents)
- **components/WorkspaceSelector.vue**: 11 connections (10 deps, 1 dependents)
- **layouts/components/AppHeader.vue**: 11 connections (10 deps, 1 dependents)
- **components/ui/card/index.ts**: 9 connections (0 deps, 9 dependents)
- **components/ui/sidebar/index.ts**: 9 connections (0 deps, 9 dependents)
- **router/account.ts**: 9 connections (8 deps, 1 dependents)
- **components/UserNav.vue**: 8 connections (6 deps, 2 dependents)
- **components/ui/input/index.ts**: 8 connections (0 deps, 8 dependents)

### Potential Issues

#### Circular Dependencies Detected:
- layouts/components/sidebar/composables/useItemValidation.ts → layouts/components/sidebar/composables/useItemValidation.ts
- workspace/index.ts → workspace/index.ts
