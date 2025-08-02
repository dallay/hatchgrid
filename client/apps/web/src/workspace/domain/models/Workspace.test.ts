import { describe, expect, it } from "vitest";
import { isWorkspace, type Workspace } from "./Workspace.ts";

describe("Workspace", () => {
	describe("isWorkspace", () => {
		const validWorkspace: Workspace = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Workspace",
			description: "A test workspace",
			ownerId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		it("should return true for valid workspace objects", () => {
			expect(isWorkspace(validWorkspace)).toBe(true);
		});

		it("should return true for workspace without optional description", () => {
			const workspaceWithoutDescription = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Workspace",
				ownerId: "123e4567-e89b-12d3-a456-426614174001",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			expect(isWorkspace(workspaceWithoutDescription)).toBe(true);
		});

		it("should return true for workspace with undefined description", () => {
			const workspaceWithUndefinedDescription = {
				...validWorkspace,
				description: undefined,
			};

			expect(isWorkspace(workspaceWithUndefinedDescription)).toBe(true);
		});

		it("should return false for null or undefined", () => {
			expect(isWorkspace(null)).toBe(false);
			expect(isWorkspace(undefined)).toBe(false);
		});

		it("should return false for non-object types", () => {
			const nonObjects = ["string", 123, true, [], () => {}];

			for (const nonObject of nonObjects) {
				expect(isWorkspace(nonObject)).toBe(false);
			}
		});

		it("should return false when required string fields are missing", () => {
			const requiredFields = [
				"id",
				"name",
				"ownerId",
				"createdAt",
				"updatedAt",
			] as const;

			for (const field of requiredFields) {
				const { [field]: _, ...rest } = validWorkspace;
				const incompleteWorkspace: Omit<Workspace, typeof field> = rest;
				expect(isWorkspace(incompleteWorkspace)).toBe(false);
			}
		});

		it("should return false when required string fields are not strings", () => {
			const requiredFields = [
				"id",
				"name",
				"ownerId",
				"createdAt",
				"updatedAt",
			];
			const nonStringValues = [123, true, null, undefined, {}, []];

			for (const field of requiredFields) {
				for (const nonStringValue of nonStringValues) {
					const invalidWorkspace = {
						...validWorkspace,
						[field]: nonStringValue,
					};
					expect(isWorkspace(invalidWorkspace)).toBe(false);
				}
			}
		});

		it("should return false when description is not a string or undefined", () => {
			const invalidDescriptions = [123, true, null, {}, []];

			for (const invalidDescription of invalidDescriptions) {
				const invalidWorkspace = {
					...validWorkspace,
					description: invalidDescription,
				};
				expect(isWorkspace(invalidWorkspace)).toBe(false);
			}
		});

		it("should return true for workspace with empty string description", () => {
			const workspaceWithEmptyDescription = {
				...validWorkspace,
				description: "",
			};

			expect(isWorkspace(workspaceWithEmptyDescription)).toBe(true);
		});

		it("should handle objects with extra properties", () => {
			const workspaceWithExtraProps = {
				...validWorkspace,
				extraProperty: "should not affect validation",
				anotherExtra: 123,
			};

			expect(isWorkspace(workspaceWithExtraProps)).toBe(true);
		});

		it("should return false for empty object", () => {
			expect(isWorkspace({})).toBe(false);
		});

		it("should return false for object with only some required fields", () => {
			const partialWorkspace = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Workspace",
				// missing ownerId, createdAt, updatedAt
			};

			expect(isWorkspace(partialWorkspace)).toBe(false);
		});
	});
});
