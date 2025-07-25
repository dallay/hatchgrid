# Biome Configuration

This document outlines the Biome configuration used in the Hatchgrid project for linting and formatting JavaScript and TypeScript code.

## Overview

[Biome](https://biomejs.dev/) is a fast formatter and linter for JavaScript, TypeScript, JSX, and more. It's used in our project to ensure code quality and consistency across the frontend codebase.

## Configuration File

The Biome configuration is stored in `biome.json` files at various levels of the project:

- Root level: `biome.json` (main configuration)
- Client level: `client/biome.json` (extends root configuration)
- App level: `client/apps/landing-page/biome.json`, `client/apps/web/biome.json` (extend client configuration)
- Package level: `client/packages/utilities/biome.json`

The configuration follows an inheritance pattern where child configurations extend their parent configurations using the `extends` property.

## Schema Version

The Biome configuration uses schema versions that should match the CLI version being used:
- Root level: Schema version 2.1.2
- Landing page: Schema version 2.0.0

If you encounter warnings about schema version mismatch, update the schema URL in the configuration file:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.1.2/schema.json",
  // rest of configuration
}
```

Or for landing page:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  // rest of configuration
}
```

## Key Configuration Settings

### Version Control System (VCS)

```json
"vcs": {
  "enabled": true,
  "clientKind": "git",
  "useIgnoreFile": true
}
```

This configuration enables VCS integration with Git and respects `.gitignore` files.

### File Includes/Excludes

The root configuration specifies which files to include and exclude from linting and formatting:

```json
"files": {
  "ignoreUnknown": false,
  "includes": [
    "**",
    "!**/node_modules",
    "!**/coverage",
    // other exclusions
  ]
}
```

App-specific configurations may have their own file includes. For example, the landing page configuration:

```json
"files": {
  "ignoreUnknown": false,
  "includes": ["**/*.{ts,tsx,js,jsx,astro,vue}"]
}
```

### Formatter Settings

Root configuration:
```json
"formatter": {
  "enabled": true,
  "indentStyle": "tab"
}
```

Landing page configuration:
```json
"formatter": {
  "enabled": true,
  "indentStyle": "tab",
  "lineWidth": 100
}
```

The formatter uses tabs for indentation. The landing page configuration additionally specifies a line width of 100 characters.

### JavaScript-specific Settings

```json
"javascript": {
  "formatter": {
    "quoteStyle": "double"
  }
}
```

JavaScript files use double quotes for strings.

### Linter Rules

The configuration enables recommended linting rules and adds additional style rules:

```json
"linter": {
  "enabled": true,
  "rules": {
    "recommended": true,
    "style": {
      "noParameterAssign": "error",
      // other style rules
    }
  }
}
```

### Framework-specific Overrides

Special overrides are applied for framework-specific files.

Root configuration:
```json
"overrides": [
  {
    "includes": ["**/*.svelte", "**/*.astro", "**/*.vue"],
    "linter": {
      "rules": {
        "style": {
          "useConst": "off",
          "useImportType": "off"
        },
        "correctness": {
          "noUnusedVariables": "off",
          "noUnusedImports": "off"
        }
      }
    }
  }
]
```

Landing page configuration (Astro-specific):
```json
"overrides": [
  {
    "includes": ["**/*.astro"],
    "linter": {
      "rules": {
        "style": {
          "useConst": "off",
          "useImportType": "off"
        },
        "correctness": {
          "noUnusedVariables": "off",
          "noUnusedImports": "off"
        }
      }
    }
  }
]
```

These overrides relax certain rules for framework-specific files to accommodate their unique syntax and patterns.

## Integration with Git Hooks

Biome is integrated with Git hooks using Lefthook to ensure code quality before commits. See [Git Hooks](../workflows/git-hooks.md) for more details.

## CI/CD Integration

Biome is also integrated into our CI/CD pipeline with Reviewdog to provide automated code quality feedback on pull requests. See [CI Guide](../workflows/ci-guide.md) for more details.
