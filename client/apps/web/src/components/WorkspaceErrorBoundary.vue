<script setup lang="ts">
import { AlertTriangle, RefreshCw } from "lucide-vue-next";
import { ref } from "vue";

interface WorkspaceErrorBoundaryProps {
	error?: Error | null;
	retry?: () => void;
}

const props = withDefaults(defineProps<WorkspaceErrorBoundaryProps>(), {
	error: null,
});

const isRetrying = ref(false);

const handleRetry = async () => {
	if (!props.retry) return;

	isRetrying.value = true;
	try {
		await props.retry();
	} finally {
		isRetrying.value = false;
	}
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4 text-center">
    <AlertTriangle class="size-8 text-destructive mb-2" />
    <h3 class="font-medium text-sm mb-1">Workspace Error</h3>
    <p class="text-xs text-muted-foreground mb-3">
      {{ error?.message || "Failed to load workspaces" }}
    </p>
    <button
      v-if="retry"
      @click="handleRetry"
      :disabled="isRetrying"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      <RefreshCw :class="{ 'animate-spin': isRetrying }" class="size-3" />
      {{ isRetrying ? 'Retrying...' : 'Try Again' }}
    </button>
  </div>
</template>
