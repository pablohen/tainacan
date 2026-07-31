import type {
	MuseumThemeDiscovery,
	RelatedTheme,
	ThemeGraph,
	ThemeNode,
	ThemeOccurrence,
} from "@/types/themes";

export const normalizeThemeLabel = (label: string) =>
	label
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.trim()
		.replace(/\s+/gu, " ")
		.replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, "")
		.trim();

const occurrenceId = (value: ThemeOccurrence) =>
	`${value.museumId}:${value.filterId}:${value.taxonomyId}:${value.termId}`;

const taxonomyContextId = (value: ThemeOccurrence) =>
	`${value.museumId}:${value.taxonomyId}`;

const getDisplayLabel = (occurrences: ThemeOccurrence[]) => {
	const counts = new Map<string, number>();

	for (const occurrence of occurrences) {
		counts.set(
			occurrence.termLabel,
			(counts.get(occurrence.termLabel) ?? 0) + 1,
		);
	}

	return [...counts.entries()].sort(
		([firstLabel, firstCount], [secondLabel, secondCount]) =>
			secondCount - firstCount || firstLabel.localeCompare(secondLabel, "en"),
	)[0][0];
};

const sortThemes = (first: ThemeNode, second: ThemeNode) =>
	second.museumCount - first.museumCount ||
	second.occurrences.length - first.occurrences.length ||
	first.label.localeCompare(second.label, "en");

export const buildThemeGraph = (
	discoveries: MuseumThemeDiscovery[],
): ThemeGraph => {
	const occurrencesByKey = new Map<string, Map<string, ThemeOccurrence>>();

	for (const discovery of discoveries) {
		for (const occurrence of discovery.occurrences) {
			const key = normalizeThemeLabel(occurrence.termLabel);

			if (!key) {
				continue;
			}

			const occurrences = occurrencesByKey.get(key) ?? new Map();
			occurrences.set(occurrenceId(occurrence), occurrence);
			occurrencesByKey.set(key, occurrences);
		}
	}

	const themes = [...occurrencesByKey.entries()]
		.map(([key, occurrencesById]) => {
			const occurrences = [...occurrencesById.values()];
			const museumCount = new Set(
				occurrences.map((occurrence) => occurrence.museumId),
			).size;

			return {
				key,
				label: getDisplayLabel(occurrences),
				museumCount,
				occurrences,
			};
		})
		.filter((theme) => theme.museumCount >= 2)
		.sort(sortThemes);
	const byKey = Object.fromEntries(
		themes.map((theme) => [theme.key, theme]),
	) as Record<string, ThemeNode>;
	const keysByTaxonomyContext = new Map<string, Set<string>>();

	for (const theme of themes) {
		for (const occurrence of theme.occurrences) {
			const contextId = taxonomyContextId(occurrence);
			const keys = keysByTaxonomyContext.get(contextId) ?? new Set<string>();
			keys.add(theme.key);
			keysByTaxonomyContext.set(contextId, keys);
		}
	}

	const relationshipCounts = new Map<string, Map<string, number>>();

	for (const keys of keysByTaxonomyContext.values()) {
		const contextKeys = [...keys];

		for (let index = 0; index < contextKeys.length; index += 1) {
			for (
				let relatedIndex = index + 1;
				relatedIndex < contextKeys.length;
				relatedIndex += 1
			) {
				const key = contextKeys[index];
				const relatedKey = contextKeys[relatedIndex];

				for (const [sourceKey, targetKey] of [
					[key, relatedKey],
					[relatedKey, key],
				]) {
					const counts =
						relationshipCounts.get(sourceKey) ?? new Map<string, number>();
					counts.set(targetKey, (counts.get(targetKey) ?? 0) + 1);
					relationshipCounts.set(sourceKey, counts);
				}
			}
		}
	}

	const relatedByKey = Object.fromEntries(
		themes.map((theme) => {
			const relatedThemes: RelatedTheme[] = [
				...(relationshipCounts.get(theme.key) ?? new Map()),
			]
				.filter(([, count]) => count >= 2)
				.map(([key, sharedMuseumTaxonomyCount]) => ({
					key,
					label: byKey[key].label,
					sharedMuseumTaxonomyCount,
				}))
				.sort(
					(first, second) =>
						second.sharedMuseumTaxonomyCount -
							first.sharedMuseumTaxonomyCount ||
						first.label.localeCompare(second.label, "en"),
				)
				.slice(0, 8);

			return [theme.key, relatedThemes];
		}),
	) as Record<string, RelatedTheme[]>;

	return { themes, byKey, relatedByKey };
};

export const findTheme = (graph: ThemeGraph, key: string): ThemeNode | null => {
	try {
		return graph.byKey[decodeURIComponent(key)] ?? null;
	} catch {
		return null;
	}
};

export const getRelatedThemes = (
	graph: ThemeGraph,
	key: string,
	limit = 8,
): RelatedTheme[] => {
	const theme = findTheme(graph, key);

	if (!theme) {
		return [];
	}

	return graph.relatedByKey[theme.key].slice(0, Math.max(0, limit));
};
