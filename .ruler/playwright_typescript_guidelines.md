---
title: Playwright TypeScript Guidelines
description: 'Playwright test generation instructions'
applyTo:
  - 'tests/**/*.{spec,test}.{ts,tsx}'
  - '{apps,packages}/*/tests/**/*.{spec,test}.{ts,tsx}'
  - 'e2e/**/*.{spec,test}.{ts,tsx}'
---

## Test Writing Guidelines

### Code Quality Standards

- **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`, etc.) for resilience and accessibility. Use `test.step()` to group interactions and improve test readability and reporting.
- **Assertions**: Use auto-retrying web-first assertions. These assertions start with the `await` keyword (e.g., `await expect(locator).toHaveText()`). Avoid `expect(locator).toBeVisible()` unless specifically testing for visibility changes.
- **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
- **Clarity**: Use descriptive test and step titles that clearly state the intent. Add comments only to explain complex logic or non-obvious interactions.

### Test Structure

- **Imports**: Start with `import { test, expect } from '@playwright/test';`.
- **Organization**: Group related tests for a feature under a `test.describe()` block.
- **Hooks**: Use `beforeEach` for setup actions common to all tests in a `describe` block (e.g., navigating to a page).
- **Titles**: Prefer behavior-driven titles like `should <do something> when <condition>`. If grouping by feature, use `Feature - should <do something> when <condition>`.

### File Organization

- **Location**: Store all test files in the `tests/` directory.
  - In monorepos it's common to place tests under per-app or per-package folders such as `apps/*/tests`, `packages/*/tests`, or a top-level `e2e/` directory. Teams may also colocate tests next to each app/package (for example: `apps/web/tests/login.spec.ts`) — keep the same `<feature>.spec.ts` naming and scope rules when using these alternate paths.
- **Naming**: Use the convention `<feature-or-page>.spec.ts` (e.g., `login.spec.ts`, `search.spec.ts`).
- **Scope**: Aim for one test file per major application feature or page.

### Assertion Best Practices

- **UI Structure**: Use `toMatchAriaSnapshot` to verify the accessibility tree structure of a component. This provides a comprehensive and accessible snapshot.
  - Prerequisites: Ensure you're using a Playwright version that supports ARIA snapshots (upgrade `@playwright/test` to a recent stable), for example:
    - pnpm: `pnpm add -D @playwright/test@latest`
    - npm: `npm i -D @playwright/test@latest`
    - yarn: `yarn add -D @playwright/test@latest`
  - Snapshot updates: When UI changes are expected, update snapshots:
    - npm/yarn: `npx playwright test --update-snapshots`
- **Element Counts**: Use `toHaveCount` to assert the number of elements found by a locator.
- **Text Content**: Use `toHaveText` for exact text matches and `toContainText` for partial matches.
- **Navigation**: Use `toHaveURL` to verify the page URL after an action, but avoid brittle exact matches when URLs include volatile query parameters (analytics UTM params, session IDs, trace IDs, etc.). Prefer one of these approaches:

- Canonicalize the URL before asserting by removing known volatile params (for example: `utm_source`, `utm_medium`, `sessionId`, `trace_id`) and compare the normalized URL.
- Use a stable regular expression with `toHaveURL(/.../)` that matches the invariant parts of the URL.

Examples:

```typescript
// 1) Canonicalize and compare
const u = new URL(page.url());
['utm_source', 'utm_medium', 'sessionId', 'trace_id'].forEach(p => u.searchParams.delete(p));
await expect(u.toString()).toBe('https://example.com/path?stable=1');

// 2) Use a regex with toHaveURL to match stable parts only
await expect(page).toHaveURL(/\/products\/\d+(?:\?.*)?$/);
```

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Movie Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application before each test
    await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  });

  test('Search for a movie by title', async ({ page }) => {
    await test.step('Activate and perform search', async () => {
      await page.getByRole('search').click();
      const searchInput = page.getByRole('textbox', { name: 'Search Input' });
      await searchInput.fill('Garfield');
      await searchInput.press('Enter');
    });

    await test.step('Verify search results', async () => {
      // Verify the accessibility tree of the search results
      await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - main:
          - heading "Garfield" [level=1]
          - heading "search results" [level=2]
          - list "movies":
            - listitem "movie":
              - link "poster of The Garfield Movie The Garfield Movie rating":
                - /url: /playwright-movies-app/movie?id=tt5779228&page=1
                - img "poster of The Garfield Movie"
                - heading "The Garfield Movie" [level=2]
      `);
    });
  });
});
```

## Test Execution Strategy

1. **Initial Run**: Execute tests with `npx playwright test --project=chromium`
2. **Debug Failures**: Analyze test failures and identify root causes
3. **Iterate**: Refine locators, assertions, or test logic as needed
4. **Validate**: Ensure tests pass consistently and cover the intended functionality
5. **Report**: Provide feedback on test results and any issues discovered

## Quality Checklist

- [ ] All locators are accessible, specific, and avoid strict mode violations
- [ ] Tests are grouped logically and follow a clear structure
- [ ] Assertions are meaningful and reflect user expectations
- [ ] Tests follow consistent naming conventions
- [ ] Code is properly formatted and commented
