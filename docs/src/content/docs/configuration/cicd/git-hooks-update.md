---
title: Git Hooks Update - July 2025
description: Changes to pre-commit linting behavior in Lefthook for stricter code quality
---
# Git Hooks Update - July 2025

## Changes to Pre-commit Linting Behavior

As of July 19, 2025, we've updated the pre-commit hook configuration in `lefthook.yml` to enforce stricter code quality standards.

### What Changed

The Biome linting command in the pre-commit hook has been modified to:

1. Block commits when linting issues are found
2. Remove the override that previously allowed commits with linting issues

```yaml
# Before
biome:
  run: pnpm run lint
  skip_output: false
  # This will allow the commit to proceed even if there are linting issues
  # Remove the || true if you want to enforce strict linting
  exit_status: 0

# After
biome:
  run: pnpm run lint
```

### Rationale

This change enforces higher code quality standards by:

- Preventing code with linting issues from being committed
- Ensuring all code in the repository meets our style and quality guidelines
- Catching issues earlier in the development process

### Best Practices

With this stricter enforcement, we recommend:

1. Running `pnpm run lint:fix` to automatically fix common issues before committing
2. Setting up your IDE to show linting issues in real-time
3. Addressing code quality issues as you work rather than at commit time

### Related Documentation

For complete information about our Git hooks configuration, please refer to:

- [Git Hooks Documentation](./git-hooks.md)
- [CI/CD Guide](./ci-guide.md)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
