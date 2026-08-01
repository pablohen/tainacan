import { listFilters } from "@/services/generated/filters/filters";
import { listTaxonomyTerms } from "@/services/generated/taxonomies/taxonomies";
import { tainacanRequestInit } from "@/services/tainacanRequest";
import type { TainacanFilter, TainacanTerm } from "@/types/tainacan";
import type { MuseumThemeDiscovery, ThemeOccurrence } from "@/types/themes";
import {
	getFilterFamily,
	getTaxonomyDbIdentifier,
	getTaxonomyId,
} from "@/utils/tainacanFilters";

export const THEME_TERM_PAGE_SIZE = 100;
export const THEME_DISCOVERY_STALE_TIME = 5 * 60_000;

interface PaginatedResponse<T> {
	data: T[];
	headers: Headers;
}

interface TaxonomyDescriptor {
	filterId: number;
	taxonomyId: number;
	taxonomyDbIdentifier: string;
	taxonomyLabel: string;
}

async function fetchAllPages<T>(
	fetchPage: (paged: number) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
	const values: T[] = [];
	let paged = 1;
	let totalPages = 1;

	do {
		const response = await fetchPage(paged);
		values.push(...response.data);
		const reportedTotal = Number(response.headers.get("x-wp-totalpages"));
		totalPages =
			Number.isFinite(reportedTotal) && reportedTotal > 0
				? Math.floor(reportedTotal)
				: 1;
		paged += 1;
	} while (paged <= totalPages);

	return values;
}

function compatibleTaxonomies(filters: TainacanFilter[]): TaxonomyDescriptor[] {
	const descriptors = new Map<number, TaxonomyDescriptor>();

	for (const filter of filters) {
		if (getFilterFamily(filter.filter_type) !== "taxonomy") continue;

		const taxonomyId = getTaxonomyId(filter);
		const taxonomyDbIdentifier = getTaxonomyDbIdentifier(filter);
		if (taxonomyId === null || taxonomyDbIdentifier === null) continue;

		const descriptor: TaxonomyDescriptor = {
			filterId: filter.id,
			taxonomyId,
			taxonomyDbIdentifier,
			taxonomyLabel: filter.name,
		};
		const current = descriptors.get(taxonomyId);
		if (!current || descriptor.filterId < current.filterId) {
			descriptors.set(taxonomyId, descriptor);
		}
	}

	return [...descriptors.values()];
}

function toOccurrences(
	museumId: string,
	descriptor: TaxonomyDescriptor,
	terms: TainacanTerm[],
): ThemeOccurrence[] {
	return terms.map((term) => ({
		museumId,
		filterId: descriptor.filterId,
		taxonomyId: descriptor.taxonomyId,
		taxonomyDbIdentifier: descriptor.taxonomyDbIdentifier,
		taxonomyLabel: descriptor.taxonomyLabel,
		termId: term.id,
		termLabel: term.name,
	}));
}

export async function discoverMuseumThemes(
	museumId: string,
	signal?: AbortSignal,
): Promise<MuseumThemeDiscovery> {
	const options = tainacanRequestInit(museumId);
	const request = signal ? { ...options, signal } : options;
	const filters = await fetchAllPages(async (paged) => {
		const response = await listFilters(
			{ perpage: THEME_TERM_PAGE_SIZE, paged },
			request,
		);
		return {
			data: response.data as TainacanFilter[],
			headers: response.headers,
		};
	});

	const occurrences: ThemeOccurrence[] = [];
	for (const descriptor of compatibleTaxonomies(filters)) {
		const terms = await fetchAllPages(async (paged) => {
			const response = await listTaxonomyTerms(
				descriptor.taxonomyId,
				{ perpage: THEME_TERM_PAGE_SIZE, paged },
				request,
			);
			return {
				data: response.data as TainacanTerm[],
				headers: response.headers,
			};
		});
		occurrences.push(...toOccurrences(museumId, descriptor, terms));
	}

	return { museumId, occurrences };
}
