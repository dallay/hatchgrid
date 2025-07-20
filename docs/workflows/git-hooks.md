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
  - Enforces the [Conventional Commits](https://www.conventionalcommits.org/) specification
  - Ensures header length does not exceed 120 characters
  - Ensures body line length does not exceed 220 characters (though manual wrapping at 72-100 characters is recommended for better readability)
  - See [Commit Conventions](../conventions/commit-conventions.md) for more details

A commit message template is provided in the `.gitmessage` file at the root of the project. To use this template by default, run:

```bash
git config --local commit.template .gitmessage
```

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
  commands:
    generate_structure_docs:
      run: ./scripts/generate-structure-docs.sh
    biome:
      run: pnpm run lint
    git-update:
      run: git update-index --again

commit-msg:
  commands:
    a_lint:
      run: npx --no-install commitlint --edit

post-commit:
  commands:
    notify_user:
      run: echo "✅ Commit successful! Don't forget to push your changes."

pre-push:
  parallel: true
  commands:
    lychee_link_check:
      run: lychee --no-progress --exclude-path node_modules --exclude-path public/admin ./**/*.md
    pnpm_check:
      run: pnpm run check
    kotlin_static_analysis:
      run: ./gradlew detektAll
    check_secrets:
      run: ./scripts/check-secrets.sh

```

For more information about Lefthook, see the [Lefthook documentation](https://github.com/evilmartians/lefthook).
