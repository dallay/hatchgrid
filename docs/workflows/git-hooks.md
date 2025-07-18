# Git Hooks

This document outlines the Git hooks used in the Hatchgrid project. We use [Lefthook](https://github.com/evilmartians/lefthook) to manage our Git hooks.

## Table of Contents

- [Git Hooks](#git-hooks)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Available Hooks](#available-hooks)
    - [pre-commit](#pre-commit)
    - [commit-msg](#commit-msg)
    - [pre-push](#pre-push)
  - [Configuration](#configuration)

## Introduction

Git hooks are scripts that Git executes before or after events such as commit, push, and receive. We use Lefthook to manage our Git hooks, which allows us to define hooks in a YAML file and run them in parallel.

## Installation

Lefthook is installed as a dev dependency in the project. When you run `pnpm install`, Lefthook will automatically install the Git hooks defined in the `lefthook.yml` file.

## Available Hooks

### pre-commit

The pre-commit hook runs before a commit is created. It performs the following checks:

- **Link Check**: Checks for broken links in Markdown files using Lychee
- **PNPM Check**: Runs the check script defined in package.json
- **Structure Docs Generation**: Generates structure documentation
- **Kotlin Static Analysis**: Runs Detekt for static code analysis
- **Secret Check**: Checks for secrets in the codebase
- **Changed Files Summary**: Shows a summary of changed files

### commit-msg

The commit-msg hook runs when a commit message is created. It performs the following checks:

- **Lint**: Validates the commit message format using commitlint

### pre-push

The pre-push hook runs before code is pushed to a remote repository. It performs the following checks:

- **Frontend Test**: Runs frontend tests
- **Backend Test**: Runs backend tests
- **Build Check**: Builds the frontend and backend projects

> **Note:** The dependency audit check (`pnpm audit` and `./gradlew dependencyCheckAnalyze`) was removed from the pre-push hooks to improve performance. Dependency auditing is now handled by the CI/CD pipeline.

## Configuration

The Git hooks are configured in the `lefthook.yml` file at the root of the project. You can modify this file to add, remove, or modify hooks.

```yaml
# @file lefthook.yml
# @ref https://evilmartians.github.io/lefthook/

pre-commit:
  parallel: true
  commands:
    d_lychee_link_check:
      run: lychee --no-progress --exclude-path node_modules --exclude-path public/admin ./**/*.md
    e_pnpm_check:
      run: pnpm run check
    f_generate_structure_docs:
      run: ./scripts/generate-structure-docs.sh
    g_kotlin_static_analysis:
      run: ./gradlew detektAll
    h_check_secrets:
      run: ./scripts/check-secrets.sh
    i_changed_files_summary:
      run: git diff --name-only --cached

commit-msg:
  parallel: true
  commands:
    a_lint:
      run: npx commitlint --edit

pre-push:
  parallel: true
  commands:
    a_frontend_test:
      run: pnpm run test
    b_backend_test:
      run: ./gradlew test
    d_build_check:
      run: pnpm run build && ./gradlew build

# Note: The dependency audit check was removed to improve performance:
# c_dependency_audit:
#   run: pnpm audit || true && ./gradlew dependencyCheckAnalyze || true
```

For more information about Lefthook, see the [Lefthook documentation](https://github.com/evilmartians/lefthook).
