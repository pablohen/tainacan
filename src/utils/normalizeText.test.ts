import { describe, expect, it } from "vitest";
import { normalizeText } from "@/utils/normalizeText";

describe("normalizeText", () => {
	it("lowercases and strips diacritics", () => {
		expect(normalizeText("  São Paulo  ")).toBe("sao paulo");
	});

	it("handles empty string", () => {
		expect(normalizeText("")).toBe("");
	});
});
