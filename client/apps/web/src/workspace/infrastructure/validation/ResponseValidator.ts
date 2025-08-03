/**
 * Utility for validating API response structures.
 * Provides type-safe validation with descriptive error messages.
 */

import type { CollectionResponse, SingleItemResponse } from "@/shared/response";
import { InvalidResponseFormatError } from "@/workspace/domain/errors";
import type { Workspace } from "@/workspace/domain/models/Workspace";

interface ResponseWithData {
	data: unknown;
}

/**
 * Validates that a response conforms to the CollectionResponse structure
 */
export function validateCollectionResponse<T>(
	response: unknown,
	itemTypeName: string,
): asserts response is CollectionResponse<T> {
	if (!response || typeof response !== "object") {
		throw new InvalidResponseFormatError(
			`${itemTypeName} collection with data array`,
		);
	}

	const data = (response as ResponseWithData).data;
	if (!Array.isArray(data)) {
		throw new InvalidResponseFormatError(
			`${itemTypeName} collection with data array`,
		);
	}
}

/**
 * Validates that a response conforms to the SingleItemResponse structure
 */
export function validateSingleItemResponse<T>(
	response: unknown,
	itemTypeName: string,
): asserts response is SingleItemResponse<T> {
	if (!response || typeof response !== "object") {
		throw new InvalidResponseFormatError(
			`${itemTypeName} object with data property`,
		);
	}

	const data = (response as ResponseWithData).data;
	if (!data || typeof data !== "object") {
		throw new InvalidResponseFormatError(
			`${itemTypeName} object with data property`,
		);
	}
}

/**
 * Additional validation for workspace-specific data structure
 */
export function validateWorkspaceData(
	data: unknown,
): asserts data is Workspace {
	if (!data || typeof data !== "object") {
		throw new InvalidResponseFormatError("workspace object");
	}

	const workspace = data as Workspace;
	const requiredFields: (keyof Workspace)[] = [
		"id",
		"name",
		"ownerId",
		"createdAt",
		"updatedAt",
	];

	for (const field of requiredFields) {
		if (typeof workspace[field] !== "string" || !workspace[field].trim()) {
			throw new InvalidResponseFormatError(
				`workspace object with required field: ${field}`,
			);
		}
	}
}
