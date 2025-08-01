import { describe, expect, it } from "vitest";
import type { Workspace } from "./Workspace.ts";
import {
	createValidatedWorkspace,
	isValidISODate,
	isValidUUID,
	isValidWorkspaceDescription,
	isValidWorkspaceName,
	validateWorkspace,
} from "./WorkspaceValidation.ts";

describe("WorkspaceValidation", () => {
	describe("isValidUUID", () => {
		it("should return true for valid UUID v1-5 formats", () => {
			const validUUIDs = [
				"123e4567-e89b-12d3-a456-426614174000",
				"550e8400-e29b-41d4-a716-446655440000",
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
				"f47ac10b-58cc-4372-a567-0e02b2c3d479",
				"6ba7b811-9dad-11d1-80b4-00c04fd430c8",
			];

			for (const uuid of validUUIDs) {
				expect(isValidUUID(uuid)).toBe(true);
			}
		});

		it("should return false for invalid UUID formats", () => {
			const invalidUUIDs = [
				"invalid-uuid",
				"123",
				"",
				"123e4567-e89b-12d3-a456-42661417400", // too short
				"123e4567-e89b-12d3-a456-4266141740000", // too long
				"123e4567-e89b-12d3-a456-426614174g00", // invalid character
				"123e4567-e89b-12d3-a456-426614174000-extra", // extra characters
				"00000000-0000-0000-0000-000000000000", // all zeros (invalid version)
				"FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // all F's (invalid version)
				"123e4567e89b12d3a456426614174000", // missing hyphens
				"123e4567-e89b-12d3-a456", // incomplete
			];

			for (const uuid of invalidUUIDs) {
				expect(isValidUUID(uuid)).toBe(false);
			}
		});

		it("should be case insensitive", () => {
			const uuid = "123E4567-E89B-12D3-A456-426614174000";
			expect(isValidUUID(uuid)).toBe(true);
			expect(isValidUUID(uuid.toLowerCase())).toBe(true);
		});
	});

	describe("isValidISODate", () => {
		it("should return true for valid ISO 8601 dates", () => {
			const validDates = [
				"2024-01-01T00:00:00Z",
				"2024-12-31T23:59:59Z",
				"2024-06-15T12:30:45Z",
				"2024-01-01T00:00:00.000Z",
				"2024-01-01T00:00:00",
				"2023-02-28T14:30:00Z",
				"2024-02-29T14:30:00Z", // leap year
			];

			for (const date of validDates) {
				expect(isValidISODate(date)).toBe(true);
			}
		});

		it("should return false for invalid ISO 8601 dates", () => {
			const invalidDates = [
				"invalid-date",
				"2024-13-01T00:00:00Z", // invalid month
				"2024-01-32T00:00:00Z", // invalid day
				"2024-01-01T25:00:00Z", // invalid hour
				"2024-01-01T00:60:00Z", // invalid minute
				"2024-01-01T00:00:60Z", // invalid second
				"2023-02-29T14:30:00Z", // invalid leap year
				"2024-01-01", // missing time
				"01-01-2024T00:00:00Z", // wrong format
				"2024/01/01T00:00:00Z", // wrong separator
				"", // empty string
			];

			for (const date of invalidDates) {
				expect(isValidISODate(date)).toBe(false);
			}
		});
	});

	describe("isValidWorkspaceName", () => {
		it("should return true for valid workspace names", () => {
			const validNames = [
				"Test Workspace",
				"A",
				"My Project 123",
				"Workspace-Name_With.Special@Chars",
				"a".repeat(100), // exactly 100 characters
			];

			for (const name of validNames) {
				expect(isValidWorkspaceName(name)).toBe(true);
			}
		});

		it("should return false for invalid workspace names", () => {
			const invalidNames = [
				"", // empty
				"   ", // only whitespace
				"a".repeat(101), // too long
			];

			for (const name of invalidNames) {
				expect(isValidWorkspaceName(name)).toBe(false);
			}
		});

		it("should trim whitespace when validating", () => {
			expect(isValidWorkspaceName("  Valid Name  ")).toBe(true);
			expect(isValidWorkspaceName("  ")).toBe(false);
		});
	});

	describe("isValidWorkspaceDescription", () => {
		it("should return true for valid descriptions", () => {
			const validDescriptions = [
				undefined,
				"",
				"Short description",
				"A".repeat(500), // exactly 500 characters
				"Multi-line\ndescription\nwith\nbreaks",
			];

			for (const description of validDescriptions) {
				expect(isValidWorkspaceDescription(description)).toBe(true);
			}
		});

		it("should return false for invalid descriptions", () => {
			const invalidDescriptions = [
				"A".repeat(501), // too long
			];

			for (const description of invalidDescriptions) {
				expect(isValidWorkspaceDescription(description)).toBe(false);
			}
		});
	});

	describe("validateWorkspace", () => {
		const validWorkspace: Workspace = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Workspace",
			description: "A test workspace",
			ownerId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		it("should return valid for correct workspace data", () => {
			const result = validateWorkspace(validWorkspace);
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual([]);
		});

		it("should return valid for workspace without description", () => {
			const workspaceWithoutDescription: Omit<
				typeof validWorkspace,
				"description"
			> = (({ description, ...rest }) => rest)(validWorkspace);

			const result = validateWorkspace(workspaceWithoutDescription);
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual([]);
		});

		it("should return invalid for non-object data", () => {
			const invalidData = [null, undefined, "string", 123, []];

			for (const data of invalidData) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain("Workspace data must be an object");
			}
		});

		it("should validate id field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, id: 123 },
					expectedError: "Workspace id must be a string",
				},
				{
					data: { ...validWorkspace, id: "invalid-uuid" },
					expectedError: "Workspace id must be a valid UUID",
				},
				{
					data: { ...validWorkspace, id: undefined },
					expectedError: "Workspace id must be a string",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should validate name field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, name: 123 },
					expectedError: "Workspace name must be a string",
				},
				{
					data: { ...validWorkspace, name: "" },
					expectedError: "Workspace name must be between 1 and 100 characters",
				},
				{
					data: { ...validWorkspace, name: "a".repeat(101) },
					expectedError: "Workspace name must be between 1 and 100 characters",
				},
				{
					data: { ...validWorkspace, name: undefined },
					expectedError: "Workspace name must be a string",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should validate description field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, description: 123 },
					expectedError: "Workspace description must be a string",
				},
				{
					data: { ...validWorkspace, description: "a".repeat(501) },
					expectedError: "Workspace description must be 500 characters or less",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should validate ownerId field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, ownerId: 123 },
					expectedError: "Workspace ownerId must be a string",
				},
				{
					data: { ...validWorkspace, ownerId: "invalid-uuid" },
					expectedError: "Workspace ownerId must be a valid UUID",
				},
				{
					data: { ...validWorkspace, ownerId: undefined },
					expectedError: "Workspace ownerId must be a string",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should validate createdAt field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, createdAt: 123 },
					expectedError: "Workspace createdAt must be a string",
				},
				{
					data: { ...validWorkspace, createdAt: "invalid-date" },
					expectedError: "Workspace createdAt must be a valid ISO 8601 date",
				},
				{
					data: { ...validWorkspace, createdAt: undefined },
					expectedError: "Workspace createdAt must be a string",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should validate updatedAt field", () => {
			const testCases = [
				{
					data: { ...validWorkspace, updatedAt: 123 },
					expectedError: "Workspace updatedAt must be a string",
				},
				{
					data: { ...validWorkspace, updatedAt: "invalid-date" },
					expectedError: "Workspace updatedAt must be a valid ISO 8601 date",
				},
				{
					data: { ...validWorkspace, updatedAt: undefined },
					expectedError: "Workspace updatedAt must be a string",
				},
			];

			for (const { data, expectedError } of testCases) {
				const result = validateWorkspace(data);
				expect(result.isValid).toBe(false);
				expect(result.errors).toContain(expectedError);
			}
		});

		it("should collect multiple validation errors", () => {
			const invalidWorkspace = {
				id: "invalid-uuid",
				name: "",
				description: "a".repeat(501),
				ownerId: "invalid-owner-uuid",
				createdAt: "invalid-date",
				updatedAt: "invalid-date",
			};

			const result = validateWorkspace(invalidWorkspace);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(6);
			expect(result.errors).toContain("Workspace id must be a valid UUID");
			expect(result.errors).toContain(
				"Workspace name must be between 1 and 100 characters",
			);
			expect(result.errors).toContain(
				"Workspace description must be 500 characters or less",
			);
			expect(result.errors).toContain("Workspace ownerId must be a valid UUID");
			expect(result.errors).toContain(
				"Workspace createdAt must be a valid ISO 8601 date",
			);
			expect(result.errors).toContain(
				"Workspace updatedAt must be a valid ISO 8601 date",
			);
		});
	});

	describe("createValidatedWorkspace", () => {
		const validWorkspace: Workspace = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Workspace",
			description: "A test workspace",
			ownerId: "123e4567-e89b-12d3-a456-426614174001",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		it("should return workspace for valid data", () => {
			const result = createValidatedWorkspace(validWorkspace);
			expect(result).toEqual(validWorkspace);
		});

		it("should throw error for invalid data", () => {
			const invalidWorkspace = {
				...validWorkspace,
				id: "invalid-uuid",
				name: "",
			};

			expect(() => createValidatedWorkspace(invalidWorkspace)).toThrow(
				"Invalid workspace data: Workspace id must be a valid UUID, Workspace name must be between 1 and 100 characters",
			);
		});

		it("should throw error with all validation messages", () => {
			const invalidWorkspace = {
				id: "invalid",
				name: "",
				ownerId: "invalid",
				createdAt: "invalid",
				updatedAt: "invalid",
			};

			expect(() => createValidatedWorkspace(invalidWorkspace)).toThrow(
				"Invalid workspace data:",
			);
		});
	});
});
