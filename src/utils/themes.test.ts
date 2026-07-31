import { describe, expect, it } from "vitest";
import type { ThemeOccurrence } from "@/types/themes";
import {
	buildThemeGraph,
	findTheme,
	getRelatedThemes,
	normalizeThemeLabel,
} from "@/utils/themes";

describe("normalizeThemeLabel", () => {
	it("normalizes case, diacritics, edge punctuation, and whitespace", () => {
		expect(normalizeThemeLabel("  Arte   Sacra! ")).toBe("arte sacra");
	});

	it("removes diacritics", () => {
		expect(normalizeThemeLabel("São Paulo")).toBe("sao paulo");
	});

	it("preserves internal punctuation", () => {
		expect(normalizeThemeLabel("Arte & Cultura")).toBe("arte & cultura");
	});

	it("returns an empty key for blank or punctuation-only labels", () => {
		expect(normalizeThemeLabel("   ")).toBe("");
		expect(normalizeThemeLabel("!@#$%")).toBe("");
	});
});

const occurrence = (
	museumId: string,
	filterId: number,
	taxonomyId: number,
	termId: number,
	termLabel: string,
): ThemeOccurrence => ({
	museumId,
	filterId,
	taxonomyId,
	taxonomyDbIdentifier: "temas",
	taxonomyLabel: "Temas",
	termId,
	termLabel,
});

describe("buildThemeGraph", () => {
	const arteMasp = occurrence("masp", 1, 10, 100, "Arte Sacra");
	const discoveries = [
		{
			museumId: "masp",
			occurrences: [
				arteMasp,
				arteMasp,
				occurrence("masp", 2, 10, 101, "Barroco"),
				occurrence("masp", 3, 10, 101, "Barroco"),
				occurrence("masp", 4, 10, 102, "Escultura"),
				occurrence("masp", 5, 10, 103, "Imaginária religiosa"),
			],
		},
		{
			museumId: "pinacoteca",
			occurrences: [
				occurrence("pinacoteca", 11, 10, 200, "Arte Sacra"),
				occurrence("pinacoteca", 12, 10, 201, "Barroco"),
				occurrence("pinacoteca", 13, 11, 202, "Escultura"),
			],
		},
	];

	it("deduplicates occurrences and exposes only themes found in two museums", () => {
		const graph = buildThemeGraph(discoveries);

		expect(graph.themes.map((theme) => theme.key)).toEqual([
			"barroco",
			"arte sacra",
			"escultura",
		]);
		expect(graph.byKey["arte sacra"].occurrences).toHaveLength(2);
		expect(graph.byKey["imaginaria religiosa"]).toBeUndefined();
	});

	it("keeps only themes sharing a taxonomy context in two museums as related", () => {
		const graph = buildThemeGraph(discoveries);

		expect(getRelatedThemes(graph, "arte%20sacra")).toEqual([
			{
				key: "barroco",
				label: "Barroco",
				sharedMuseumTaxonomyCount: 2,
			},
		]);
	});

	it("finds safely decoded route keys and rejects invalid encodings", () => {
		const graph = buildThemeGraph(discoveries);

		expect(findTheme(graph, "arte%20sacra")?.label).toBe("Arte Sacra");
		expect(findTheme(graph, "%E0%A4%A")).toBeNull();
		expect(findTheme(graph, "inexistente")).toBeNull();
	});
});
