import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useActiveTaxonomyTermLabels } from "@/hooks/useActiveTaxonomyTermLabels";
import { createQueryClientWrapper } from "@/test/renderWithProviders";
import type { TainacanFilter } from "@/types/tainacan";

const museumId = "museum-one";
const taxonomyId = 101;

function taxonomyFilter(): TainacanFilter {
	return {
		id: 11,
		name: "Themes",
		filter_type: "TaxonomyCheckbox",
		collection_id: 1,
		metadatum: {
			metadata_type_object: {
				options: {
					taxonomy_id: taxonomyId,
					taxonomy: "themes",
				},
			},
		},
	};
}

describe("useActiveTaxonomyTermLabels", () => {
	it("selects term arrays from a shared raw taxonomy response", () => {
		const queryKey = ["taxonomy-terms", museumId, taxonomyId] as const;
		const { queryClient, wrapper } = createQueryClientWrapper();
		queryClient.setQueryDefaults(queryKey, {
			staleTime: Number.POSITIVE_INFINITY,
		});
		queryClient.setQueryData(queryKey, {
			data: [{ id: 1001, name: "Sacred Art" }],
			status: 200,
			headers: new Headers(),
		});

		const { result } = renderHook(
			() =>
				useActiveTaxonomyTermLabels(museumId, [taxonomyFilter()], {
					"11": ["1001"],
				}),
			{ wrapper },
		);

		expect(result.current).toEqual({
			[taxonomyId]: { "1001": "Sacred Art" },
		});
	});
});
