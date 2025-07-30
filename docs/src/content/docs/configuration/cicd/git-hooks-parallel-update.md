---
title: Git Hooks Update - Parallel Pre-Push Execution
description: Update to pre-push hook configuration in Lefthook for parallel execution.
---
# Git Hooks Update - Parallel Pre-Push Execution

## Changes to Pre-Push Hook Configuration

As of July 19, 2025, we've updated the pre-push hook configuration in `lefthook.yml` to improve performance by enabling parallel execution.

### What Changed

The `parallel: false` configuration has been removed from the pre-push hook section in `lefthook.yml`:

```yaml
# Before
pre-push:
  parallel: false
  commands:
    # commands here...

# After
pre-push:
  commands:
    # commands here...
```

### Benefits

This change offers several advantages:

1. **Improved Performance**: Pre-push checks now run in parallel, significantly reducing the time required before pushing changes
2. **Better Resource Utilization**: Parallel execution makes better use of system resources
3. **Faster Feedback**: Developers get feedback on all checks simultaneously rather than sequentially

### Considerations

When working with parallel pre-push hooks:

1. Be aware that output from different commands may be interleaved in the terminal
2. System resource usage may be higher during pre-push operations
3. If you experience issues with parallel execution, you can add `parallel: false` back to your local configuration

### Related Documentation

For complete information about our Git hooks configuration, please refer to:

- [Git Hooks Documentation](./git-hooks.md)
- [CI/CD Guide](./ci-guide.md)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
