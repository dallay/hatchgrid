/**
 * Workspace storage utilities for localStorage persistence
 * Provides safe read/write operations for workspace selection persistence
 */

import { z } from "zod";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { InvalidWorkspaceIdError } from "@/workspace/domain/errors/WorkspaceErrors";

/**
 * Domain-specific errors for workspace storage operations
 */
export class WorkspaceStorageError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = "WorkspaceStorageError";
	}
}

export class EmptyWorkspaceIdError extends WorkspaceStorageError {
	constructor() {
		super("Workspace ID cannot be empty", "EMPTY_WORKSPACE_ID");
	}
}

/**
 * Storage key for the selected workspace ID
 * Uses namespaced key to avoid conflicts with other applications
 */
export const STORAGE_KEY_SELECTED_WORKSPACE =
	"hatchgrid:workspace:selected" as const;

/**
 * UUID validation schema using Zod
 * Provides consistent UUID validation across the application
 */
const uuidSchema = z.uuid();

/**
 * Result type for operations that can fail
 */
export type StorageResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: WorkspaceStorageError;
	  };

/**
 * Interface for workspace storage operations
 */
export interface WorkspaceStorage {
	/**
	 * Gets the currently persisted workspace ID
	 * @returns The workspace ID or null if none is persisted
	 */
	getSelectedWorkspaceId(): string | null;

	/**
	 * Persists the selected workspace ID
	 * @param workspaceId The workspace ID to persist
	 */
	setSelectedWorkspaceId(workspaceId: string): void;

	/**
	 * Clears the persisted workspace selection
	 */
	clearSelectedWorkspaceId(): void;

	/**
	 * Checks if a workspace ID is currently persisted
	 * @returns True if a workspace ID is persisted
	 */
	hasPersistedWorkspace(): boolean;

	/**
	 * Safely sets the selected workspace ID without throwing
	 * @param workspaceId The workspace ID to persist
	 * @returns Result indicating success or failure
	 */
	trySetSelectedWorkspaceId(workspaceId: string): StorageResult<void>;
}

/**
 * UUID validation utilities using Zod
 * Provides consistent and reliable UUID validation
 */

/**
 * Validates if a string is a valid UUID using Zod
 * @param id The string to validate
 * @returns True if the string is a valid UUID
 */
const isValidUUID = (id: string): boolean => {
	return uuidSchema.safeParse(id).success;
};

/**
 * Validates and sanitizes a workspace ID
 * @param id The workspace ID to validate
 * @returns The sanitized ID or null if invalid
 */
const validateWorkspaceId = (id: string | null | undefined): string | null => {
	if (!id || typeof id !== "string") {
		return null;
	}

	const trimmedId = id.trim();
	return isValidUUID(trimmedId) ? trimmedId : null;
};

/**
 * Creates a workspace storage instance using localStorage
 * @returns WorkspaceStorage implementation
 */
export const createWorkspaceStorage = (): WorkspaceStorage => {
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useLocalStorage<
		string | null
	>(STORAGE_KEY_SELECTED_WORKSPACE, null);

	return {
		getSelectedWorkspaceId(): string | null {
			const rawId = selectedWorkspaceId.value;
			const validatedId = validateWorkspaceId(rawId);

			// If we have a raw ID but validation failed, clean up storage
			if (rawId && !validatedId) {
				console.warn(
					"[WorkspaceStorage] Invalid workspace ID found in storage, clearing:",
					rawId,
				);
				setSelectedWorkspaceId(null);
				return null;
			}

			return validatedId;
		},

		setSelectedWorkspaceId(workspaceId: string): void {
			const validatedId = validateWorkspaceId(workspaceId);

			if (!validatedId) {
				if (!workspaceId || workspaceId.trim() === "") {
					throw new EmptyWorkspaceIdError();
				}
				throw new InvalidWorkspaceIdError(workspaceId);
			}

			setSelectedWorkspaceId(validatedId);
		},

		clearSelectedWorkspaceId(): void {
			setSelectedWorkspaceId(null);
		},

		hasPersistedWorkspace(): boolean {
			return validateWorkspaceId(selectedWorkspaceId.value) !== null;
		},

		trySetSelectedWorkspaceId(workspaceId: string): StorageResult<void> {
			try {
				const validatedId = validateWorkspaceId(workspaceId);

				if (!validatedId) {
					const error =
						!workspaceId || workspaceId.trim() === ""
							? new EmptyWorkspaceIdError()
							: new InvalidWorkspaceIdError(workspaceId);
					return { success: false, error };
				}

				setSelectedWorkspaceId(validatedId);
				return { success: true, data: undefined };
			} catch (error) {
				const storageError =
					error instanceof WorkspaceStorageError
						? error
						: new WorkspaceStorageError(
								"Unknown storage error",
								"UNKNOWN_ERROR",
							);
				return { success: false, error: storageError };
			}
		},
	};
};

/**
 * Default workspace storage instance
 */
export const workspaceStorage = createWorkspaceStorage();
