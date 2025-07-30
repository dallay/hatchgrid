---
title: Commit Conventions
description: Guidelines for writing consistent and meaningful commit messages in the Hatchgrid project.
---
# Commit Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages with some customizations to improve developer experience.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Header

The header is mandatory and has a special format that includes a **type**, an optional **scope**, and a **subject**:

- **type**: Describes the kind of change (e.g., feat, fix, docs)
- **scope**: Optional, describes what part of the codebase is affected (e.g., auth, api, ui)
- **subject**: Brief description of the change

The header has a maximum length of **120 characters**.

### Body

The body is optional and should provide context about the change and explain what it does rather than how it does it.

While the linter allows each line of the body to have a maximum length of **220 characters**, developers are strongly encouraged to manually wrap their commit message bodies at around 72-100 characters for better readability in narrower editors, terminals, and git log outputs.

### Footer

The footer is optional and contains additional information such as breaking changes and references to issues.

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Examples

```commit
feat(auth): implement OAuth2 login flow

Add OAuth2 authentication flow using Keycloak as the identity provider.
This includes:
- Login page with OAuth redirect
- Token handling and refresh logic
- User profile retrieval

Closes #123
```

```text
fix(api): correct pagination in user listing endpoint

The pagination was incorrectly calculating the total pages when the
result set was empty.

Fixes #456
```

## Configuration

The commit message format is enforced using commitlint with the following custom rules:

- Header max length: 120 characters
- Body line max length: 220 characters (though manual wrapping at 72-100 characters is recommended)

These rules are defined in `commitlint.config.mjs` at the root of the project.

```javascript
/**
 * commitlint.config.mjs
 * @ref http://commitlint.js.org/
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [2, 'always', 220]
  }
};
```

The commit message format is enforced using the commit-msg Git hook, which is managed by Lefthook. See [Git Hooks](../workflows/git-hooks.md) for more information.

## Commit Message Template

A commit message template is provided in the `.gitmessage` file at the root of the project. This template includes guidelines for formatting commit messages, including the recommended line length for the body.

To configure Git to use this template by default, run:

```bash
git config --local commit.template .gitmessage
```

This will pre-populate your commit message editor with the template whenever you run `git commit` without the `-m` flag.
