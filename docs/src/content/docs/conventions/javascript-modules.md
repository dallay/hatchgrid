---
title: JavaScript Module System
description: Guidelines for using ECMAScript Modules (ESM) in Hatchgrid.
---
# JavaScript Module System

## Overview

Hatchgrid uses ECMAScript Modules (ESM) as the default module system for JavaScript and TypeScript files. This is configured at the root level of the project in the `package.json` file with the `"type": "module"` setting.

## Module Configuration

The project uses the following module-related configurations:

// package.json
```json
{
  "type": "module"
}
```

This setting means:

1. All `.js` files are treated as ES modules by default
2. CommonJS files must use the `.cjs` extension explicitly
3. ES module files can use either `.js` or `.mjs` extension

## File Extensions

- `.js` - ES module (default)
- `.mjs` - ES module (explicit)
- `.cjs` - CommonJS module (explicit)
- `.ts` - TypeScript file (compiled according to tsconfig settings)

## Configuration Files

The following configuration files in the project use ES modules:

- `commitlint.config.mjs`
- `vitest.config.ts` (uses ESM import/export syntax)
- `client/config/vite.config.shared.mjs`
- `client/config/vitest.config.shared.mjs`
- `client/apps/landing-page/astro.config.mjs`

## Import/Export Syntax

Use the standard ES module syntax for imports and exports:

```typescript
// Importing
import { something } from './module.js';
import defaultExport from './module.js';

// Exporting
export const myFunction = () => {};
export default class MyClass {};
```

## Best Practices

1. **Always use explicit file extensions in imports** for `.js`, `.mjs`, and `.cjs` files
2. **Use package imports** without file extensions (e.g., `import { useState } from 'react'`)
3. **Prefer named exports** over default exports for better tree-shaking
4. **Use dynamic imports** for code-splitting: `const module = await import('./module.js')`

## TypeScript Configuration

TypeScript is configured to work with ES modules through the `tsconfig.json` files. The base configuration in `client/packages/tsconfig/tsconfig.base.json` includes the appropriate module settings.

## Testing

Vitest is configured to work with ES modules by default. The test files use the same import/export syntax as the source files.

## Migration Notes

When migrating existing code or adding new files:

1. Use ES module syntax (`import`/`export`) in all JavaScript and TypeScript files
2. Rename any CommonJS files (using `require`/`module.exports`) to use the `.cjs` extension
3. Update imports to include file extensions for local modules
