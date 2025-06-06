# CTAEmail Component Documentation

## Overview

The CTAEmail components provide a flexible, accessible, and internationalized email capture form for landing pages and call-to-action sections.

## Available Components

### 1. CTAEmail (Basic)
The original component with basic functionality.

### 2. CTAEmailEnhanced (Recommended)
An enhanced version with improved features:
- ✅ Internationalization support
- ✅ Loading states with visual feedback
- ✅ Enhanced accessibility (ARIA labels, screen reader support)
- ✅ Better error handling and user feedback
- ✅ Integrated toast notifications
- ✅ Form validation with real-time feedback
- ✅ API integration with retry logic
- ✅ Metadata collection for analytics

## Basic Usage

```vue
<script setup>
import { CTAEmailEnhanced } from '@/components/cta-email'
</script>

<template>
  <CTAEmailEnhanced
    email-placeholder="Enter your email"
    button-text="Get Started"
    size="default"
    alignment="center"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `emailPlaceholder` | `string` | Required | Placeholder text for email input |
| `buttonText` | `string` | Required | Text displayed on submit button |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Component size variant |
| `alignment` | `'left' \| 'center' \| 'right'` | `'center'` | Component alignment |
| `inputVariant` | `'default' \| 'primary' \| 'secondary'` | `'default'` | Input field styling variant |
| `inputSize` | `'sm' \| 'default' \| 'lg'` | `'default'` | Input field size |
| `buttonVariant` | `'default' \| 'primary' \| 'secondary' \| 'outline'` | `'default'` | Button styling variant |
| `buttonSize` | `'sm' \| 'default' \| 'lg'` | `'default'` | Button size |
| `class` | `string` | `undefined` | Additional CSS classes for the form |
| `inputClass` | `string` | `undefined` | Additional CSS classes for the input |
| `buttonClass` | `string` | `undefined` | Additional CSS classes for the button |
| `apiEndpoint` | `string` | `'/api/waitlist'` | API endpoint for form submission |
| `source` | `string` | `'cta-email-enhanced'` | Source identifier for analytics |
| `metadata` | `Record<string, any>` | `{}` | Additional metadata to include with submission |
| `showLoadingToast` | `boolean` | `true` | Whether to show loading toast during submission |

## Advanced Usage

### Custom API Endpoint
```vue
<CTAEmailEnhanced
  email-placeholder="Join our newsletter"
  button-text="Subscribe"
  api-endpoint="/api/newsletter/subscribe"
  source="homepage-newsletter"
  :metadata="{ campaign: 'summer-2024', utm_source: 'organic' }"
/>
```

### Custom Styling
```vue
<CTAEmailEnhanced
  email-placeholder="Your email address"
  button-text="Get Access"
  size="lg"
  input-variant="primary"
  button-variant="primary"
  class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg"
  input-class="border-blue-300 focus:border-blue-500"
  button-class="bg-gradient-to-r from-blue-600 to-indigo-600"
/>
```

### Left-Aligned for Sidebars
```vue
<CTAEmailEnhanced
  email-placeholder="Email"
  button-text="Join"
  size="sm"
  alignment="left"
  class="max-w-sm"
/>
```

## Accessibility Features

The CTAEmailEnhanced component includes comprehensive accessibility features:

- **ARIA Labels**: Proper labeling for screen readers
- **Error Announcements**: Real-time error feedback with `aria-live` regions
- **Keyboard Navigation**: Full keyboard accessibility
- **Loading States**: Clear indication of form submission status
- **Form Validation**: Real-time validation with accessible error messages

## Internationalization

The component automatically detects the current language and provides localized:
- Error messages
- Loading states
- Success notifications

Supported languages:
- English (`en`)
- Spanish (`es`)

## Testing

### Unit Tests
```bash
npm run test composables/useEmailValidation
npm run test composables/useEmailSubmission
```

### Integration Tests
```bash
npm run test:e2e CTAEmail
```

### Storybook
```bash
npm run storybook
```
Navigate to "Components/CTA/CTAEmailEnhanced" to see all variants and interactive examples.

## Development Mode

In development, the component uses a mock API for testing. You can configure the mock behavior:

```typescript
import { setupMockApi } from '@/utils/mockEmailApi'

// Configure mock API
setupMockApi({
  delay: 1000,        // Response delay in ms
  successRate: 0.9,   // Success rate (0.0 to 1.0)
})
```

## API Integration

### Expected Request Format
```json
{
  "email": "user@example.com",
  "source": "cta-email-enhanced",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "formType": "cta-email",
    "userAgent": "Mozilla/5.0...",
    "language": "en"
  }
}
```

### Expected Response Format

**Success (201):**
```json
{
  "id": "sub_abc123",
  "email": "user@example.com",
  "status": "subscribed",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error (400):**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid email address",
  "details": {
    "field": "email",
    "value": "invalid-email"
  }
}
```

## Performance Considerations

- **Bundle Size**: The enhanced component adds ~3KB to the bundle
- **Validation**: Email validation is debounced to avoid excessive API calls
- **Toast Notifications**: Automatically dismiss after 4 seconds to avoid UI clutter
- **Error Handling**: Graceful fallback for network failures

## Migration from CTAEmail

Replace the component import and add required props:

```vue
<!-- Before -->
<CTAEmail
  email-placeholder="Email"
  button-text="Submit"
/>

<!-- After -->
<CTAEmailEnhanced
  email-placeholder="Email"
  button-text="Submit"
/>
```

The enhanced version is backward compatible with all existing props.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to the CTAEmail components:

1. Add tests for new features
2. Update this documentation
3. Test accessibility with screen readers
4. Verify internationalization works
5. Test across different devices and browsers
