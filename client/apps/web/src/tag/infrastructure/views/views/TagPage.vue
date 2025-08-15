<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Tag } from "@/tag";
import { TagColors, useTags } from "@/tag";
import DeleteConfirmation from "../components/DeleteConfirmation.vue";
import TagForm from "../components/TagForm.vue";
import TagList from "../components/TagList.vue";

// Composables
const {
	tags,
	isLoading,
	hasError,
	error,
	fetchTags,
	createTag,
	updateTag,
	deleteTag,
	clearError,
} = useTags();

// Local state
const showCreateForm = ref(false);
const editingTag = ref<Tag | null>(null);
const deletingTag = ref<Tag | null>(null);
const showDeleteConfirmation = ref(false);
const formLoading = ref(false);

// Form handlers
const handleAddTag = () => {
	editingTag.value = null;
	showCreateForm.value = true;
};

const handleEditTag = (tag: Tag) => {
	editingTag.value = tag;
	showCreateForm.value = true;
};

const handleDeleteTag = (tag: Tag) => {
	deletingTag.value = tag;
	showDeleteConfirmation.value = true;
};

const handleFormSubmit = async (data: { name: string; color: TagColors }) => {
	formLoading.value = true;
	clearError();

	try {
		if (editingTag.value) {
			// Update existing tag
			await updateTag(editingTag.value.id, data);
		} else {
			// Create new tag
			await createTag(data);
		}

		// Close form on success
		showCreateForm.value = false;
		editingTag.value = null;
	} catch (err) {
		// Error is handled by the store
		console.error("Form submission error:", err);
	} finally {
		formLoading.value = false;
	}
};

const handleFormCancel = () => {
	showCreateForm.value = false;
	editingTag.value = null;
	clearError();
};

const handleDeleteConfirm = async () => {
	if (!deletingTag.value) return;

	formLoading.value = true;
	clearError();

	try {
		await deleteTag(deletingTag.value.id);
		showDeleteConfirmation.value = false;
		deletingTag.value = null;
	} catch (err) {
		// Error is handled by the store
		console.error("Delete error:", err);
	} finally {
		formLoading.value = false;
	}
};

const handleDeleteCancel = () => {
	showDeleteConfirmation.value = false;
	deletingTag.value = null;
	clearError();
};

// Lifecycle
onMounted(async () => {
	await fetchTags();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tags</h1>
        <p class="text-muted-foreground mt-1">
          Organize and categorize your subscribers with tags.
        </p>
      </div>
      <button
        v-if="!showCreateForm"
        @click="handleAddTag"
        class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        data-testid="add-tag-button"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Tag
      </button>
    </div>

    <!-- Create/Edit Form -->
    <div v-if="showCreateForm" class="mb-8">
      <div class="bg-background border rounded-lg p-6">
        <TagForm
          :tag="editingTag"
          :loading="formLoading"
          :mode="editingTag ? 'edit' : 'create'"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
        />
      </div>
    </div>

    <!-- Tags List -->
    <div class="bg-background border rounded-lg p-6">
      <TagList
        :tags="tags"
        :loading="isLoading"
        :error="hasError ? error?.message || 'An error occurred' : null"
        @edit-tag="handleEditTag"
        @delete-tag="handleDeleteTag"
        @add-tag="handleAddTag"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmation
      :tag="deletingTag"
      :open="showDeleteConfirmation"
      :loading="formLoading"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>
