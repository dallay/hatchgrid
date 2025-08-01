import { describe, expect, it } from "vitest";
import { orderBy } from "./order-by";

describe("orderBy", () => {
	it("sorts items by multiple keys and orders", () => {
		const result = orderBy(
			[
				{ name: "banana", type: "fruit" },
				{ name: "apple", type: "fruit" },
				{ name: "carrot", type: "vegetable" },
				{ name: "broccoli", type: "vegetable" },
			],
			["type", "name"],
			["asc", "desc"],
		);
		expect(result).toEqual([
			{ name: "banana", type: "fruit" },
			{ name: "apple", type: "fruit" },
			{ name: "carrot", type: "vegetable" },
			{ name: "broccoli", type: "vegetable" },
		]);
	});

	it("returns an empty array for an empty array input", () => {
		const result = orderBy([], ["name"], ["asc"]);
		expect(result).toEqual([]);
	});
});
