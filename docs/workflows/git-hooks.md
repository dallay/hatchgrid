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
    - [post-commit](#post-commit)
    - [pre-push](#pre-push)
  - [Configuration](#configuration)

## Introduction

Git hooks are scripts that Git executes before or after events such as commit, push, and receive. We use Lefthook to manage our Git hooks, which allows us to define hooks in a YAML file and run them in parallel.

## Installation

Lefthook is installed as a dev dependency in the project. When you run `pnpm install`, Lefthook will automatically install the Git hooks defined in the `lefthook.yml` file.

## Available Hooks

### pre-commit

The pre-commit hook runs before a commit is created. It performs the following checks:

- **Biome**: Runs the lint script defined in package.json using Biome. If linting issues are found, the commit will be blocked until they are fixed.
- **Changed Files Summary**: Shows a summary of changed files
- **Git Update**: Updates the Git index to ensure all changes are included

### commit-msg

The commit-msg hook runs when a commit message is created. It performs the following checks:

- **Lint**: Validates the commit message format using commitlint with the --no-install flag

### post-commit

The post-commit hook runs after a commit is successfully created. It performs the following actions:

- **Notify User**: Displays a notification to the user after commit completion

### pre-push

The pre-push hook runs before code is pushed to a remote repository. It performs the following checks:

- **Link Check**: Checks for broken links in Markdown files using Lychee
- **PNPM Check**: Runs the check script defined in package.json
- **Kotlin Static Analysis**: Runs Detekt for static code analysis
- **Secret Check**: Checks for secrets in the codebase using `gitleaks detect --no-git -v --config=.gitleaks.toml`, which scans the entire repository (not just staged changes) for potential secrets before allowing a push.
- **Tests**: Runs both frontend and backend tests
- **Builds**: Builds both frontend and backend projects (skipping tests as they're run separately)

> **Note:** The pre-push hooks now run in parallel by default, which improves performance during the push operation.

## Configuration

The Git hooks are configured in the `lefthook.yml` file at the root of the project. You can modify this file to add, remove, or modify hooks.

```yaml
# @file lefthook.yml
# @ref https://evilmartians.github.io/lefthook/

pre-commit:
  parallel: true
  commands:
    biome:
      run: pnpm run lint
    i_changed_files_summary:
      run: git diff --name-only --cached
    git-update:
      run: git update-index --again

commit-msg:
  commands:
    a_lint:
      run: npx --no-install commitlint --edit

post-commit:
  commands:
    notify_user:
      run: echo "Commit successful! Don't forget to push your changes."

pre-push:
  commands:
    d_lychee_link_check:
      run: lychee --no-progress --exclude-path node_modules --exclude-path public/admin ./**/*.md
    e_pnpm_check:
      run: pnpm run check
    g_kotlin_static_analysis:
      run: ./gradlew detektAll
    h_check_secrets:
      run: ./scripts/check-secrets.sh
    tests:
      run: |
        pnpm run test
        ./gradlew test
    builds:
      run: |
        pnpm run build
        ./gradlew build -x test

# Note: The dependency audit check was removed to improve performance:
# c_dependency_audit:
#   run: pnpm audit || true && ./gradlew dependencyCheckAnalyze || true
```

For more information about Lefthook, see the [Lefthook documentation](https://github.com/evilmartians/lefthook).
