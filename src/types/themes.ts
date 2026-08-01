export interface ThemeOccurrence {
	museumId: string;
	filterId: number;
	taxonomyId: number;
	taxonomyDbIdentifier: string;
	taxonomyLabel: string;
	termId: number;
	termLabel: string;
}

export interface MuseumThemeDiscovery {
	museumId: string;
	occurrences: ThemeOccurrence[];
}

export interface ThemeNode {
	key: string;
	label: string;
	museumCount: number;
	occurrences: ThemeOccurrence[];
}

export interface RelatedTheme {
	key: string;
	label: string;
	sharedMuseumTaxonomyCount: number;
}

export interface ThemeGraph {
	themes: ThemeNode[];
	byKey: Record<string, ThemeNode>;
	relatedByKey: Record<string, RelatedTheme[]>;
}
