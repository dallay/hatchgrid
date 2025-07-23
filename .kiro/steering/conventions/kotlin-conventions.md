# Kotlin Conventions and Best Practices

This document outlines the standard conventions and best practices when writing Kotlin code across the entire codebase.

## General Style

- Follow the [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html).
- Use 4 spaces for indentation.
- Use `val` over `var` whenever possible.
- Prefer expression bodies for functions when concise.

## Null Safety

- Avoid using `!!` operator.
- Leverage Kotlin's null safety and use `?.`, `?:`, and `requireNotNull` when necessary.
- Model optional data as nullable types (`?`) or sealed classes.

## Functions and Expressions

- Use top-level functions when possible.
- Prefer extension functions for utilities.
- Mark functions as `inline`, `reified`, or `tailrec` when applicable.
- Keep functions small and focused (ideally 5–20 lines).

## Object-Oriented Design

- Use data classes for immutable models.
- Use sealed classes for restricted class hierarchies and result/error types.
- Prefer composition over inheritance.
- Minimize the use of `open` unless extension is required.

## Collections and Functional Style

- Use functional operations (`map`, `filter`, `fold`, etc.) over loops when appropriate.
- Avoid mutating collections; prefer immutable operations and `toList()`, `toMap()`.
- Favor `associateBy`, `groupBy`, and other collection helpers for transformation.

## Error Handling

- Use sealed classes or `Result<T>` types instead of exceptions when modeling recoverable failures.
- Avoid catching generic exceptions.
- Use `runCatching {}` for wrapping operations with failure semantics.

## Naming Conventions

- Classes and interfaces: PascalCase
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Test methods: `should do something when condition`

## Coroutines

- Use structured concurrency: launch coroutines in `viewModelScope`, `lifecycleScope`, or `coroutineScope`.
- Mark long-running or suspendable functions with `suspend`.
- Always cancel coroutines when the associated job is no longer needed.
- Use `flow` for reactive streams; avoid `LiveData` unless interoperating with Android.

## Immutability and Safety

- Use immutable data structures whenever possible.
- Avoid sharing mutable state across threads.
- Use `copy()` from data classes for mutation.

## Testing

- Write unit tests for all business logic.
- Use Kotlin DSLs (e.g., `kotest`, `mockk`) for expressive tests.
- Test both happy paths and edge cases.

## Tooling

- Use `ktlint` for formatting and style.
- Use `detekt` for static code analysis and rule enforcement.
- Integrate these tools into the CI/CD pipeline.

---

These conventions are enforced in our codebase to ensure consistency, readability, and long-term maintainability across all Kotlin projects.
