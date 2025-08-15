/**
 * Test constants for consistent test configuration
 */

export const TEST_CONSTANTS = {
	PERFORMANCE: {
		RENDER_THRESHOLD_MS:
			Number(process.env.PERF_THRESHOLD_MS) ||
			(process.env.CI?.toLowerCase() === "true" ? 1500 : 1000),
		UPDATE_THRESHOLD_MS: 100,
		LARGE_DATASET_SIZE: 1000,
		MEDIUM_DATASET_SIZE: 100,
	},
	TIMEOUTS: {
		ASYNC_OPERATION: 100,
		VALIDATION: 50,
		FORM_SUBMISSION: 200,
	},
	TEST_IDS: {
		TAG_NAME_INPUT: "tag-name-input",
		SUBMIT_BUTTON: "submit-button",
		CANCEL_BUTTON: "cancel-button",
		EDIT_BUTTON: "edit-button",
		DELETE_BUTTON: "delete-button",
		CONFIRM_DELETE: "confirm-delete",
		CANCEL_DELETE: "cancel-delete",
		NAME_ERROR: "name-error",
		TAG_FORM: "tag-form",
		DELETE_CONFIRMATION: "delete-confirmation",
		CREATE_TAG_BUTTON: "create-tag-button",
		EDIT_TAG_BUTTON: "edit-tag-button",
		DELETE_TAG_BUTTON: "delete-tag-button",
		TAG_ITEM: "tag-item",
		COLOR_RED: "color-red",
		COLOR_BLUE: "color-blue",
		COLOR_GREEN: "color-green",
	},
	MESSAGES: {
		LOADING: "Loading",
		NO_TAGS: "No tags yet",
		DELETE_TAG: "Delete Tag",
		VALIDATION_REQUIRED: "required",
		VALIDATION_EMPTY: "empty",
		TAG_NAME: "Tag name",
		ERROR_LOADING: "Error loading",
		FAILED: "Failed",
		DELETING: "Deleting",
	},
} as const;
