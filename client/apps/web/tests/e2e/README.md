# E2E Tests for Workspace Switching

This directory contains end-to-end tests for the workspace switching functionality using Playwright.

## Overview

The E2E tests validate the complete user flow for workspace management:

- Loading and displaying available workspaces
- Switching between workspaces
- Persisting workspace selection in localStorage
- Handling loading states and errors
- Keyboard navigation support
- Mobile responsiveness

## Prerequisites

1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Ensure the development server is running:
   ```bash
   pnpm dev
   ```

## Running Tests

### Run all E2E tests
```bash
pnpm test:e2e
```

### Run tests with UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Debug tests
```bash
pnpm test:e2e:debug
```

### Run specific test file
```bash
npx playwright test workspace-switching.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
```

## Test Structure

### `workspace-switching.spec.ts`

Main test file covering:

- **Basic functionality**: Loading workspaces, switching between them
- **Persistence**: localStorage integration and page refresh behavior
- **Error handling**: API failures, retry mechanisms
- **Loading states**: Skeleton loading, empty states
- **Accessibility**: Keyboard navigation support

## Test Data

Tests use mock workspace data:

```typescript
const mockWorkspaces = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Development Workspace',
    description: 'Main development environment',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Testing Workspace',
    description: 'Testing and QA environment',
  },
];
```

## API Mocking

Tests mock the following endpoints:

- `GET /api/workspace` - Returns list of workspaces
- `GET /api/workspace/:id` - Returns specific workspace details

## Test Selectors

Tests rely on `data-testid` attributes:

- `workspace-selector` - Main workspace selector component
- `workspace-selector-trigger` - Button to open workspace dropdown
- `workspace-dropdown` - Dropdown menu container
- `workspace-item-{id}` - Individual workspace items
- `workspace-display-text` - Currently selected workspace name
- `workspace-loading` - Loading state indicator
- `workspace-error` - Error state container
- `workspace-retry-button` - Retry button for failed requests
- `workspace-empty-state` - Empty state when no workspaces

## Configuration

E2E tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Traces**: On first retry

## CI Integration

Tests are designed to run in CI environments:

- Automatic server startup/shutdown
- Retry logic for flaky tests
- Parallel execution support
- Artifact collection (screenshots, videos, traces)

## Troubleshooting

### Tests failing locally

1. Ensure dev server is running on port 5173
2. Check that all Playwright browsers are installed
3. Verify test selectors match actual component implementation

### Slow test execution

1. Reduce browser projects in `playwright.config.ts`
2. Use `--workers=1` for sequential execution
3. Check for unnecessary `page.waitFor()` calls

### Authentication issues

Tests currently mock API responses. For full integration:

1. Set up test user accounts
2. Implement login flow in test setup
3. Handle authentication tokens

## Future Enhancements

- Integration with real backend API
- User authentication flow testing
- Multi-tenant workspace scenarios
- Performance testing with large workspace lists
- Visual regression testing
- Cross-browser compatibility validation
