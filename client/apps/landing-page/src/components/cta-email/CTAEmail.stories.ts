import type { Meta, StoryObj } from '@storybook/vue3'
import { within, userEvent } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import CTAEmailEnhanced from '../CTAEmailEnhanced.vue'
import { setupMockApi, MockEmailApi } from '@/utils/mockEmailApi'

// Setup mock API for Storybook
setupMockApi({ delay: 1000, successRate: 0.8 })

const meta: Meta<typeof CTAEmailEnhanced> = {
  title: 'Components/CTA/CTAEmailEnhanced',
  component: CTAEmailEnhanced,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced email CTA component with improved validation, loading states, and accessibility features.'
      }
    }
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg']
    },
    alignment: {
      control: { type: 'select' },
      options: ['left', 'center', 'right']
    },
    inputVariant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary']
    },
    buttonVariant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'outline']
    },
    showLoadingToast: {
      control: { type: 'boolean' }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    emailPlaceholder: 'Enter your email address',
    buttonText: 'Get Started',
    size: 'default',
    alignment: 'center',
    inputVariant: 'default',
    buttonVariant: 'primary',
    showLoadingToast: true
  }
}

// Different sizes
export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    emailPlaceholder: 'Your email',
    buttonText: 'Join'
  }
}

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    emailPlaceholder: 'Enter your email to get started',
    buttonText: 'Get Early Access'
  }
}

// Different alignments
export const LeftAligned: Story = {
  args: {
    ...Default.args,
    alignment: 'left'
  },
  parameters: {
    layout: 'padded'
  }
}

export const RightAligned: Story = {
  args: {
    ...Default.args,
    alignment: 'right'
  },
  parameters: {
    layout: 'padded'
  }
}

// Different variants
export const PrimaryVariant: Story = {
  args: {
    ...Default.args,
    inputVariant: 'primary',
    buttonVariant: 'primary'
  }
}

export const SecondaryVariant: Story = {
  args: {
    ...Default.args,
    inputVariant: 'secondary',
    buttonVariant: 'secondary'
  }
}

export const OutlineButton: Story = {
  args: {
    ...Default.args,
    buttonVariant: 'outline'
  }
}

// Interactive stories with different scenarios
export const WithValidEmail: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText(/email/i)

    await userEvent.type(emailInput, 'user@example.com')
    await expect(emailInput).toHaveValue('user@example.com')
  }
}

export const WithInvalidEmail: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText(/email/i)
    const submitButton = canvas.getByRole('button', { name: /get started/i })

    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(submitButton)

    // Check if error message appears
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument()
  }
}

export const SubmissionFlow: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText(/email/i)
    const submitButton = canvas.getByRole('button', { name: /get started/i })

    // Type valid email
    await userEvent.type(emailInput, 'test@example.com')

    // Submit form
    await userEvent.click(submitButton)

    // Check if button shows loading state
    await expect(canvas.findByText(/submitting/i)).resolves.toBeInTheDocument()
  }
}

// Error scenarios
export const AlwaysFails: Story = {
  args: {
    ...Default.args,
    apiEndpoint: '/api/waitlist?force_error=true'
  },
  parameters: {
    docs: {
      description: {
        story: 'This story simulates API failures to test error handling.'
      }
    }
  }
}

// Custom styling
export const CustomStyled: Story = {
  args: {
    ...Default.args,
    class: 'bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border',
    inputClass: 'border-blue-300 focus:border-blue-500',
    buttonClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
  },
  parameters: {
    layout: 'padded'
  }
}

// Dark mode
export const DarkMode: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    themes: {
      default: 'dark'
    }
  },
  decorators: [
    (story) => ({
      template: '<div class="dark"><story /></div>'
    })
  ]
}

// Mobile view
export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}
