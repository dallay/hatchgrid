<!--
  Example component demonstrating workspace initialization and persistence
  This shows how to use the workspace module with persistence and initialization
-->
<template>
  <div class="workspace-example">
    <h2>Workspace Initialization Example</h2>

    <!-- Initialization Status -->
    <div class="status-section">
      <h3>Initialization Status</h3>
      <p>Initializing: {{ isInitializing }}</p>
      <p>Initialized: {{ isInitialized }}</p>
      <p v-if="initializationError" class="error">
        Error: {{ initializationError.message }}
      </p>
    </div>

    <!-- Workspace List -->
    <div class="workspaces-section">
      <h3>Available Workspaces</h3>
      <div v-if="store.isLoading" class="loading">Loading workspaces...</div>
      <div v-else-if="store.hasError" class="error">
        Error: {{ store.error?.message }}
      </div>
      <ul v-else-if="store.workspaces.length > 0">
        <li
          v-for="workspace in store.workspaces"
          :key="workspace.id"
          :class="{ active: workspace.id === store.currentWorkspace?.id }"
          @click="selectWorkspace(workspace.id)"
        >
          {{ workspace.name }}
          <span v-if="workspace.description"> - {{ workspace.description }}</span>
        </li>
      </ul>
      <p v-else>No workspaces available</p>
    </div>

    <!-- Current Workspace -->
    <div class="current-workspace-section">
      <h3>Current Workspace</h3>
      <div v-if="store.currentWorkspace">
        <p><strong>Name:</strong> {{ store.currentWorkspace.name }}</p>
        <p><strong>ID:</strong> {{ store.currentWorkspace.id }}</p>
        <p v-if="store.currentWorkspace.description">
          <strong>Description:</strong> {{ store.currentWorkspace.description }}
        </p>
        <p><strong>Owner:</strong> {{ store.currentWorkspace.ownerId }}</p>
        <p><strong>Created:</strong> {{ formatDate(store.currentWorkspace.createdAt) }}</p>
      </div>
      <p v-else>No workspace selected</p>
    </div>

    <!-- Actions -->
    <div class="actions-section">
      <h3>Actions</h3>
      <button @click="reinitialize" :disabled="isInitializing">
        Reinitialize
      </button>
      <button @click="clearSelection" :disabled="!store.currentWorkspace">
        Clear Selection
      </button>
      <button @click="refreshWorkspaces" :disabled="store.isLoading">
        Refresh Workspaces
      </button>
    </div>

    <!-- Persistence Info -->
    <div class="persistence-section">
      <h3>Persistence Info</h3>
      <p>Persisted Workspace ID: {{ store.getPersistedWorkspaceId() || 'None' }}</p>
      <p>Has Persisted Workspace: {{ store.hasPersistedWorkspace() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import {
	createWorkspaceStoreWithDependencies,
	useWorkspaceInitialization,
	workspaceStorage,
} from "../index";
import { WorkspaceApi } from "../infrastructure/api/WorkspaceApi";
import { AxiosHttpClient } from "../infrastructure/http/HttpClient";

// Create workspace store with dependencies
const httpClient = new AxiosHttpClient();
const workspaceApi = new WorkspaceApi(httpClient);
const storeFactory = createWorkspaceStoreWithDependencies(
	workspaceApi,
	workspaceStorage,
);
const store = storeFactory();

// Initialize workspace functionality
const {
	isInitializing,
	isInitialized,
	initializationError,
	initialize,
	resetInitialization,
} = useWorkspaceInitialization(store, {
	onInitialized: (hasSelectedWorkspace) => {
		console.log("Workspace initialization complete:", { hasSelectedWorkspace });
	},
	onError: (error) => {
		console.error("Workspace initialization failed:", error);
	},
});

// Helper functions
const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString();
};

const selectWorkspace = async (workspaceId: string) => {
	await store.selectWorkspace(workspaceId);
};

const reinitialize = async () => {
	resetInitialization();
	await initialize();
};

const clearSelection = () => {
	store.clearWorkspaceSelection();
};

const refreshWorkspaces = async () => {
	await store.loadAll(true); // Force refresh
};

// Auto-initialize on mount (this is also done by the composable, but shown for clarity)
onMounted(() => {
	if (!isInitialized.value && !isInitializing.value) {
		initialize();
	}
});
</script>

<style scoped>
.workspace-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.status-section,
.workspaces-section,
.current-workspace-section,
.actions-section,
.persistence-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.loading {
  color: #666;
  font-style: italic;
}

.error {
  color: #d32f2f;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  margin: 5px 0;
  background: #f5f5f5;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
}

li:hover {
  background: #e0e0e0;
}

li.active {
  background: #2196f3;
  color: white;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #1976d2;
}

h2, h3 {
  color: #333;
}
</style>
