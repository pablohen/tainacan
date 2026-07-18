import { useListTaxonomyTerms } from "@/services/generated/taxonomies/taxonomies";
import type { TainacanTerm } from "@/types/tainacan";
import { getMuseumApiBase } from "./museumRequest";

export function useMuseumTaxonomyTerms(
	museumId: string,
	taxonomyId: number | null,
) {
	const baseURL = getMuseumApiBase(museumId);

	return useListTaxonomyTerms<TainacanTerm[]>(taxonomyId ?? 0, undefined, {
		request: baseURL ? { baseURL } : undefined,
		query: {
			queryKey: ["taxonomy-terms", museumId, taxonomyId],
			enabled: Boolean(baseURL) && taxonomyId !== null,
			select: (response) =>
				[...(response.data as TainacanTerm[])].sort((a, b) =>
					(a.name ?? "").localeCompare(b.name ?? "", "pt-BR", {
						sensitivity: "base",
					}),
				),
		},
	});
}
