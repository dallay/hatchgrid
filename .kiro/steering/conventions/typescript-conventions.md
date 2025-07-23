

# TypeScript Conventions and Best Practices

This document defines the conventions and best practices for writing and maintaining TypeScript code across the codebase.

## General Style

- Use [Biome](https://biomejs.dev/) for linting and formatting.
- Follow the Airbnb style guide where applicable.
- Use 2 spaces for indentation.
- Always use semicolons.

## Types

- Prefer `type` over `interface` unless you need declaration merging or extension.
- Use `interface` for public APIs or when extending existing types.
- Always type function arguments and return values explicitly.
- Prefer specific types over `any` or `unknown`.

## Naming Conventions

- Files: `kebab-case.ts`
- Types and Interfaces: `PascalCase`
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Functions

- Use arrow functions (`const fn = () => {}`) by default.
- Keep functions small and focused on a single task.
- Use default parameter values instead of `||`.

## Imports & Exports

- Use ES modules (`import`/`export`) syntax only.
- Use absolute imports from `@/` for base project paths (via `tsconfig.json`).
- Prefer named exports over default exports.
- Group imports logically: external libraries, internal modules, styles, etc.

## Error Handling

- Use `try/catch` blocks when working with promises and async/await.
- Wrap errors with descriptive messages or use a structured error model.
- Avoid silent failures; always log or propagate appropriately.

## Safety & Code Quality

- Enable `strict` mode in `tsconfig.json`.
- Use `readonly` where applicable.
- Avoid mutation—prefer immutability by default.
- Use utility types (`Partial`, `Pick`, `Omit`, etc.) for shaping objects.
- Use `as const` for literal types when you want to preserve the exact type.
- Use `Record<string, unknown>` for objects with dynamic keys.
- Use `satisfy` for type assertions only when absolutely necessary.

## Testing

- Use `vitest` for unit tests.
- Follow the pattern `filename.test.ts` or `filename.spec.ts`.
- Test both the success and failure cases.
- Use `@testing-library` for DOM interaction (if applicable).

## Tooling & CI

- Use `pnpm run check` and `pnpm run test` before committing.
- Include type checks and linter in CI.
- Use GitHub Actions to enforce format, type safety, and coverage thresholds.

---

These practices are designed to keep TypeScript code predictable, safe, and scalable across the entire project.
