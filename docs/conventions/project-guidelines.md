# Project Guidelines

This document outlines the project guidelines for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the codebase.

## Table of Contents

- [Project Guidelines](#project-guidelines)
  - [Table of Contents](#table-of-contents)
  - [Communication](#communication)
  - [Branching Strategy](#branching-strategy)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
  - [Code Reviews](#code-reviews)
  - [Testing](#testing)
  - [Documentation](#documentation)
  - [Dependency Management](#dependency-management)
  - [Deployment](#deployment)

## Communication

- All project-related communication should happen in the designated channels (e.g., Slack, Discord, etc.).
- Be respectful and considerate in all communication.

## Branching Strategy

We use a simplified Gitflow branching strategy.

- `main`: This branch represents the production-ready code. All pull requests are merged into this branch after a successful review.
- `feature/<name>`: All new features should be developed in a feature branch. The branch should be named descriptively, e.g., `feature/add-user-authentication`.
- `fix/<name>`: Bug fixes should be developed in a fix branch. The branch should be named descriptively, e.g., `fix/resolve-login-issue`.

## Code Style

We use a combination of tools to enforce a consistent code style.

- **Prettier:** For automated code formatting.
- **ESLint:** for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- **Stylelint:** For linting CSS.

Please make sure to run the linter before submitting a pull request.

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps to have a consistent commit history and to automate the release process.

A commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- **scope:** The scope of the change, e.g., `api`, `ui`, `db`, etc.
- **description:** A short description of the change.

## Pull Requests

- All pull requests should be small and focused on a single feature or bug fix.
- The pull request description should clearly explain the change and the motivation behind it.
- The pull request should be linked to the corresponding issue.

## Code Reviews

- All pull requests must be reviewed and approved by at least one other team member before being merged.
- The reviewer should provide constructive feedback and suggestions for improvement.
- The author of the pull request is responsible for addressing the feedback and making the necessary changes.

## Testing

- All new features should be accompanied by unit tests.
- All bug fixes should include a regression test.
- All tests should pass before a pull request is merged.

## Documentation

- All new features should be documented in the corresponding documentation file.
- The documentation should be clear, concise, and easy to understand.

## Dependency Management

- We use `npm` for managing dependencies.
- All dependencies should be added to the `package.json` file.
- We use `renovate` to keep our dependencies up to date.

## Deployment

- We use a continuous integration and continuous deployment (CI/CD) pipeline to automate the deployment process.
- All pull requests are automatically deployed to a staging environment for testing.
- The `main` branch is automatically deployed to the production environment.
