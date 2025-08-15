# Vue 3 Conventions and Best Practices

This document outlines the conventions and best practices adopted for Vue 3 development within our codebase. These guidelines ensure consistency, maintainability, and high code quality.

## Project Structure

- Use the [feature folders](https://feature-sliced.design/) pattern whenever possible.
- Group components, composables, and stores by domain context.
- Use `index.ts` files for clean imports at folder level.

## Component Conventions

- Use the `<script setup lang="ts">` syntax for all components.
- Always define props with `defineProps()` and use `withDefaults()` when needed.
- Name components using PascalCase (`UserProfileCard.vue`).
- Keep components focused: extract subcomponents when needed.
- Use `defineEmits()` explicitly for all emitted events.
- Co-locate styles using `<style scoped>` unless global.

## State Management

- Use [Pinia](https://pinia.vuejs.org/) for state management.
- One store per domain context (e.g., `useUserStore`, `useProjectStore`).
- Always type state, getters, and actions.
- Do not access Pinia stores outside of `setup()` unless necessary.

## Composition API

- Encapsulate logic into reusable composables (`useX`) inside the `composables/` folder.
- Always return reactive references (`ref`, `computed`) from composables.
- Composables must be pure and not rely on UI side effects.

## UI Components

- Use [Vue ShadCN](https://www.shadcn-vue.com/docs/introduction.html) as the UI component system.
- Prefer composition over inheritance.
- Use slots for customization and extensibility.
- Apply accessibility (a11y) best practices in interactive components.

## Internationalization (i18n)

- Use `vue-i18n` and wrap all visible text with `$t()`.
- Use keys in the format `componentName.key` or `domain.key`.
- Centralize translations under `locales/`.

## Code Quality

- Use [Biome](https://biomejs.dev/) for linting and formatting.
- Use TypeScript with strict mode enabled.
- Avoid `any` types — always prefer explicit typing.
- Use `defineExpose` sparingly.

## Testing

- Write unit tests for all components and composables using `vitest`.
- Use `@testing-library/vue` for rendering and interaction testing.
- Prefer test IDs over class selectors.
- Aim for >90% coverage for all new features.

## Naming

- Components: `PascalCase.vue`
- Files and folders: `kebab-case`
- Composables: `useSomething.ts`
- Stores: `useSomethingStore.ts`

## Communication Between Components

- Use props and events for parent-child communication.
- For distant communication, use Pinia or composables.
- Avoid event buses or global event emitters.

## Performance

- Use `v-memo`, `v-once`, and lazy loading where appropriate.
- Avoid unnecessary reactivity or deeply nested watchers.

## Lifecycle and Effects

- Always clean up side effects in `onUnmounted`.
- Use `watch` and `watchEffect` with clear intent.
- Avoid overusing `watch` to mimic two-way binding — prefer `v-model`.

---

These conventions are enforced across the codebase through CI checks, reviews, and linting. Every new contribution must follow these standards.
