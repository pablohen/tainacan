import {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomiesResponseSchema,
	GetTaxonomyTermsResponseSchema,
	TainacanItemSchema,
} from "../src/schemas/tainacan";

const museums = [
	{
		name: "Museu Casa de Benjamin Constant",
		api: "https://museucasabenjaminconstant.acervos.museus.gov.br/wp-json/tainacan/v2",
	},
	{
		name: "Museu Casa da Princesa",
		api: "https://museusibramgoias.acervos.museus.gov.br/wp-json/tainacan/v2",
	},
];

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`${url} → ${res.status}`);
	}
	return res.json();
}

for (const museum of museums) {
	console.log(`\n=== ${museum.name} ===`);

	const collections = GetCollectionsResponseSchema.parse(
		await fetchJson(`${museum.api}/collections?perpage=3`),
	);
	console.log(`collections: ${collections.length} ok`);

	const items = GetItemsResponseSchema.parse(
		await fetchJson(`${museum.api}/items?perpage=2&paged=1`),
	);
	console.log(`items: ${items.items.length} ok`);

	if (items.items[0]) {
		TainacanItemSchema.parse(items.items[0]);
		console.log(`item[0] id=${items.items[0].id} ok`);
	}

	const taxonomies = GetTaxonomiesResponseSchema.parse(
		await fetchJson(`${museum.api}/taxonomies?perpage=3`),
	);
	console.log(`taxonomies: ${taxonomies.length} ok`);

	const collectionId = collections[0]?.id;
	if (collectionId) {
		const filters = GetFiltersResponseSchema.parse(
			await fetchJson(`${museum.api}/collection/${collectionId}/filters`),
		);
		console.log(`filters (collection ${collectionId}): ${filters.length} ok`);

		const taxonomyFilter = filters.find((f) =>
			f.filter_type.toLowerCase().includes("taxonomy"),
		);
		const taxonomyId = taxonomyFilter?.metadatum?.metadata_type_object?.options;
		const resolvedTaxonomyId =
			taxonomyId &&
			!Array.isArray(taxonomyId) &&
			typeof taxonomyId.taxonomy_id === "number"
				? taxonomyId.taxonomy_id
				: null;

		if (resolvedTaxonomyId) {
			const terms = GetTaxonomyTermsResponseSchema.parse(
				await fetchJson(
					`${museum.api}/taxonomy/${resolvedTaxonomyId}/terms?perpage=5`,
				),
			);
			console.log(`terms (taxonomy ${resolvedTaxonomyId}): ${terms.length} ok`);
		}
	}
}

console.log("\nAll smoke tests passed.");
