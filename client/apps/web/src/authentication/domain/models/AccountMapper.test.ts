import { describe, expect, it, vi } from "vitest";
import { transformUserResponseToAccount } from "./AccountMapper";
import type { UserResponse } from "./UserResponse";

vi.mock("@hatchgrid/utilities", () => ({
	avatar: (email: string, size: number) => `avatar-${email}-${size}`,
}));

describe("transformUserResponseToAccount", () => {
	it("should map UserResponse to Account with fullname and imageUrl", () => {
		const user: UserResponse = {
			username: "jane.doe",
			email: "test@example.com",
			firstname: "Jane",
			lastname: "Doe",
			authorities: new Set(["USER"]),
		};

		const account = transformUserResponseToAccount(user);

		expect(account.username).toBe("jane.doe");
		expect(account.email).toBe("test@example.com");
		expect(account.fullname).toBe("Jane Doe");
		expect(account.langKey).toBe("en");
		expect(account.activated).toBe(true);
		expect(account.imageUrl).toBe("avatar-test@example.com-100");
	});

	it("should handle missing firstname or lastname", () => {
		const user: UserResponse = {
			username: "smithy",
			email: "foo@bar.com",
			firstname: "",
			lastname: "Smith",
			authorities: new Set(["USER"]),
		};

		const account = transformUserResponseToAccount(user);

		expect(account.fullname).toBe("Smith");
	});

	it("should set fullname to undefined if both names are missing", () => {
		const user: UserResponse = {
			username: "noname",
			email: "no.name@domain.com",
			firstname: "",
			lastname: "",
			authorities: new Set(["USER"]),
		};

		const account = transformUserResponseToAccount(user);

		expect(account.fullname).toBeUndefined();
	});
});
