import { describe, expect, it } from "vitest";
import {
	buildTaxonomyOccurrenceParams,
	countActiveFilters,
	getFilterFamily,
	isEmptyFilterValue,
} from "@/utils/tainacanFilters";

describe("tainacanFilters", () => {
	it("classifies taxonomy filters", () => {
		expect(getFilterFamily("TaxonomyCheckbox")).toBe("taxonomy");
	});

	it("counts active filters", () => {
		expect(
			countActiveFilters({
				"1": ["term-a"],
				"2": "",
			}),
		).toBe(1);
	});

	it("detects empty filter values", () => {
		expect(isEmptyFilterValue([])).toBe(true);
		expect(isEmptyFilterValue(["a"])).toBe(false);
		expect(isEmptyFilterValue({ min: "", max: "" })).toBe(true);
	});

	it("builds the exact taxonomy query for one theme occurrence", () => {
		expect(
			buildTaxonomyOccurrenceParams({
				taxonomyDbIdentifier: "tnc_tax_123",
				termId: 45,
			}),
		).toEqual({
			taxquery: [
				{
					taxonomy: "tnc_tax_123",
					terms: [45],
					compare: "IN",
				},
			],
		});
	});
});
