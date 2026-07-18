import { describe, expect, it } from "vitest";
import { sortFavoriteItems, sortToQueryParams } from "@/utils/itemSort";

describe("sortToQueryParams", () => {
	it("maps title ascending", () => {
		expect(sortToQueryParams("title-asc")).toEqual({
			orderby: "title",
			order: "ASC",
		});
	});

	it("returns undefined for null", () => {
		expect(sortToQueryParams(null)).toBeUndefined();
	});
});

describe("sortFavoriteItems", () => {
	const items = [{ title: "Zebra" }, { title: "Alpha" }, { title: "Beta" }];

	it("sorts by title ascending", () => {
		expect(sortFavoriteItems(items, "title-asc").map((i) => i.title)).toEqual([
			"Alpha",
			"Beta",
			"Zebra",
		]);
	});

	it("reverses for date-desc", () => {
		expect(sortFavoriteItems(items, "date-desc").map((i) => i.title)).toEqual([
			"Beta",
			"Alpha",
			"Zebra",
		]);
	});
});
