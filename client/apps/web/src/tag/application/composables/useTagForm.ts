/**
 * Composable for tag form management
 * Handles form validation, submission, and state management
 */

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, type Ref, watch } from "vue";
import type { Tag } from "../../domain/models";
import { TagColors } from "../../domain/models";
import {
	createTagRequestSchema,
	updateTagRequestSchema,
} from "../../domain/models/schemas";

/**
 * Type for form field return from vee-validate defineField
 */
type FormFieldReturn = [Ref<unknown>, Ref<Record<string, unknown>>];

export interface UseTagFormOptions {
	readonly mode: Ref<"create" | "edit">;
	readonly tag: Ref<Tag | null | undefined>;
	readonly loading: Ref<boolean>;
}

export interface TagFormData {
	readonly name: string;
	readonly color: TagColors;
}

export interface UseTagFormReturn {
	readonly handleSubmit: (
		onSubmit: (data: TagFormData) => void,
	) => (e?: Event) => Promise<void>;
	readonly errors: Ref<Record<string, string | undefined>>;
	readonly defineField: (name: string) => FormFieldReturn;
	readonly resetForm: (options?: { values?: Partial<TagFormData> }) => void;
	readonly meta: Ref<{ valid: boolean; dirty: boolean; touched: boolean }>;
	readonly isFormDisabled: Ref<boolean>;
	readonly formTitle: Ref<string>;
	readonly submitButtonText: Ref<string>;
	readonly isCreateMode: Ref<boolean>;
}

/**
 * Composable for managing tag form state and validation
 */
export const useTagForm = (options: UseTagFormOptions): UseTagFormReturn => {
	const { mode, tag, loading } = options;

	// Form validation schema based on mode
	const validationSchema = computed(() => {
		return mode.value === "create"
			? toTypedSchema(createTagRequestSchema)
			: toTypedSchema(updateTagRequestSchema);
	});

	// Form setup with validation
	const { handleSubmit, errors, defineField, resetForm, meta } = useForm({
		validationSchema: validationSchema,
		initialValues: {
			name: "",
			color: TagColors.Blue,
		},
	});

	// Update form values when tag prop changes
	const updateFormValues = (newTag: Tag | null | undefined) => {
		const formValues = {
			name: newTag?.name ?? "",
			color: newTag?.color ?? TagColors.Blue,
		};

		resetForm({ values: formValues });
	};

	watch(tag, updateFormValues, { immediate: true });

	// Computed properties
	const isCreateMode = computed(() => mode.value === "create");
	const formTitle = computed(() =>
		isCreateMode.value ? "Create New Tag" : "Edit Tag",
	);
	const submitButtonText = computed(() =>
		isCreateMode.value ? "Create Tag" : "Update Tag",
	);

	// Form state helpers
	const isFormDisabled = computed(() => loading.value || !meta.value.valid);

	// Enhanced submit handler with data transformation
	const enhancedHandleSubmit = (onSubmit: (data: TagFormData) => void) => {
		return handleSubmit((values) => {
			onSubmit({
				name: values.name?.trim() ?? "",
				color: values.color ?? TagColors.Blue,
			});
		});
	};

	return {
		handleSubmit: enhancedHandleSubmit,
		errors,
		defineField: (name: string) => defineField(name as "name" | "color"),
		resetForm,
		meta,
		isFormDisabled,
		formTitle,
		submitButtonText,
		isCreateMode,
	};
};
