<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed } from "vue";
import type { HTMLAttributes } from "vue";

import {
	type CTAEmailButtonVariants,
	type CTAEmailInputVariants,
	type CTAEmailVariants,
	ctaEmailButtonVariants,
	ctaEmailInputVariants,
	ctaEmailVariants,
} from "@/components/cta-email";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEmailSubmission } from "@/composables/useEmailSubmission";
import { useEmailValidation } from "@/composables/useEmailValidation";
import { useEnhancedToast } from "@/composables/useEnhancedToast";
import { type Lang, useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";

// Props interface
interface Props {
	emailPlaceholder: string;
	buttonText: string;
	size?: CTAEmailVariants["size"];
	alignment?: CTAEmailVariants["alignment"];
	inputVariant?: CTAEmailInputVariants["variant"];
	inputSize?: CTAEmailInputVariants["size"];
	buttonVariant?: CTAEmailButtonVariants["variant"];
	buttonSize?: CTAEmailButtonVariants["size"];
	class?: HTMLAttributes["class"];
	inputClass?: HTMLAttributes["class"];
	buttonClass?: HTMLAttributes["class"];
	apiEndpoint?: string;
	source?: string;
	metadata?: Record<string, string | number | boolean>;
	showLoadingToast?: boolean;
	lang?: Lang;
}

const props = withDefaults(defineProps<Props>(), {
	size: "default",
	alignment: "center",
	inputVariant: "default",
	inputSize: "default",
	buttonVariant: "default",
	buttonSize: "default",
	showLoadingToast: true,
	lang: "en",
});

const t = useTranslations(props.lang);
// Initialize composables
const { validationSchema } = useEmailValidation({ lang: props.lang });
const { isSubmitting, submitEmail, error } = useEmailSubmission();
const { showSuccessToast, showErrorToast, showLoadingToast } = useEnhancedToast(
	{ lang: props.lang },
);

// Form setup
const { handleSubmit, resetForm, meta } = useForm({
	validationSchema: toTypedSchema(validationSchema.value),
});

// Computed loading text
const loadingText = computed(() =>
	props.lang === "es" ? "Enviando..." : "Submitting...",
);

// Enhanced submit handler
const onSubmit = handleSubmit(async (values) => {
	let loadingToastId: string | number | undefined;

	try {
		// Show loading toast if enabled
		if (props.showLoadingToast) {
			loadingToastId = showLoadingToast();
		}

		// Submit email with enhanced options
		const result = await submitEmail(values.email, {
			source: props.source || "cta-email-enhanced",
			apiEndpoint: props.apiEndpoint,
			metadata: {
				...props.metadata,
				formType: "cta-email",
				timestamp: new Date().toISOString(),
				userAgent: navigator.userAgent,
				language: props.lang,
			},
		});

		// Dismiss loading toast
		if (loadingToastId && typeof loadingToastId === "string") {
			// Note: Sonner doesn't have a direct dismiss method, so we'll let it auto-dismiss
		}

		if (result.success) {
			showSuccessToast(values.email);
			resetForm();

			// Emit success event for parent components
			console.log("✅ Email successfully submitted:", {
				email: values.email,
				response: result.data,
			});
		} else {
			showErrorToast(result.error);
		}
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		showErrorToast(errorMessage);
		console.error("❌ Email submission failed:", err);
	}
});

// Accessibility improvements
const inputAriaLabel = computed(
	() =>
		`${props.emailPlaceholder} (${props.lang === "es" ? "requerido" : "required"})`,
);
</script>

<template>
  <form
    :class="cn(ctaEmailVariants({ size, alignment }), props.class)"
    @submit="onSubmit"
    novalidate
  >
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <label
          for="email-hero-enhanced"
          class="sr-only"
        >
          {{ inputAriaLabel }}
        </label>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <FormControl class="flex-1">
            <Input
              id="email-hero-enhanced"
              type="email"
              :placeholder="props.emailPlaceholder"
              v-bind="componentField"
              :class="cn(
                ctaEmailInputVariants({ variant: inputVariant, size: inputSize }),
                props.inputClass,
                // Enhanced states
                error && 'border-destructive focus:border-destructive',
                meta.valid && meta.dirty && 'border-green-500 focus:border-green-500'
              )"
              :disabled="isSubmitting"
              :aria-label="inputAriaLabel"
              :aria-invalid="!!error"
              autocomplete="email"
              spellcheck="false"
              required
            />
          </FormControl>

          <Button
            type="submit"
            :disabled="isSubmitting || !meta.valid"
            :class="cn(
              ctaEmailButtonVariants({ variant: buttonVariant, size: buttonSize }),
              props.buttonClass,
              'min-w-[120px] transition-all duration-200'
            )"
            :aria-label="isSubmitting ? loadingText : props.buttonText"
          >
            <span v-if="!isSubmitting" class="flex items-center gap-2">
              {{ props.buttonText }}
            </span>
            <div v-else class="flex items-center gap-2">
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <span class="text-sm">{{ loadingText }}</span>
            </div>
          </Button>
        </div>

        <FormMessage
          id="email-error-enhanced"
          class="mt-1 text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        />
      </FormItem>
    </FormField>
  </form>
</template>
