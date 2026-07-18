import {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomiesResponseSchema,
	GetTaxonomyTermsResponseSchema,
	TainacanItemSchema,
} from "../src/schemas/tainacan";
import { listCollections } from "../src/services/generated/collections/collections";
import { listCollectionFilters } from "../src/services/generated/filters/filters";
import { getItem, listItems } from "../src/services/generated/items/items";
import { listTaxonomyTerms } from "../src/services/generated/taxonomies/taxonomies";
import { getPaginationMeta } from "../src/services/tainacanMutator";
import { tainacanRequestInit } from "../src/services/tainacanRequest";

const museums = [
	{
		id: "museu-casa-benjamin-constant",
		name: "Museu Casa de Benjamin Constant",
		api: "https://museucasabenjaminconstant.acervos.museus.gov.br/wp-json/tainacan/v2",
	},
	{
		id: "museu-casa-da-princesa",
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
	console.log(`collections (zod): ${collections.length} ok`);

	const items = GetItemsResponseSchema.parse(
		await fetchJson(`${museum.api}/items?perpage=2&paged=1`),
	);
	console.log(`items (zod): ${items.items.length} ok`);

	if (items.items[0]) {
		TainacanItemSchema.parse(items.items[0]);
		console.log(`item[0] id=${items.items[0].id} ok`);
	}

	const taxonomies = GetTaxonomiesResponseSchema.parse(
		await fetchJson(`${museum.api}/taxonomies?perpage=3`),
	);
	console.log(`taxonomies (zod): ${taxonomies.length} ok`);

	const collectionId = collections[0]?.id;
	if (collectionId) {
		const filters = GetFiltersResponseSchema.parse(
			await fetchJson(`${museum.api}/collection/${collectionId}/filters`),
		);
		console.log(
			`filters (zod, collection ${collectionId}): ${filters.length} ok`,
		);

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
			console.log(
				`terms (zod, taxonomy ${resolvedTaxonomyId}): ${terms.length} ok`,
			);
		}
	}

	const request = tainacanRequestInit(museum.id);

	const generatedCollections = await listCollections(undefined, request);
	const collectionData = generatedCollections.data;
	if (!Array.isArray(collectionData)) {
		throw new Error("listCollections returned unexpected data");
	}
	console.log(`listCollections (generated): ${collectionData.length} ok`);

	const generatedItems = await listItems({ perpage: 2, paged: 1 }, request);
	const itemsData = generatedItems.data;
	if (!itemsData || !("items" in itemsData) || !itemsData.items) {
		throw new Error("listItems returned unexpected data");
	}
	const pagination = getPaginationMeta(generatedItems);
	console.log(
		`listItems (generated): ${itemsData.items.length} items, total=${pagination?.wpTotal ?? "?"}`,
	);

	if (itemsData.items[0]) {
		const itemId = itemsData.items[0].id;
		const generatedItem = await getItem(String(itemId), undefined, request);
		const itemData = generatedItem.data;
		if (!itemData || typeof itemData !== "object" || !("id" in itemData)) {
			throw new Error("getItem returned unexpected data");
		}
		console.log(`getItem (generated): id=${itemData.id} ok`);
	}

	if (collectionId) {
		const generatedFilters = await listCollectionFilters(
			collectionId,
			undefined,
			request,
		);
		const filterData = generatedFilters.data;
		if (!Array.isArray(filterData)) {
			throw new Error("listCollectionFilters returned unexpected data");
		}
		console.log(`listCollectionFilters (generated): ${filterData.length} ok`);

		const taxonomyFilter = filterData.find(
			(f) => f.filter_type?.toLowerCase().includes("taxonomy") ?? false,
		);
		const taxonomyId = taxonomyFilter?.metadatum?.metadata_type_object?.options;
		const resolvedTaxonomyId =
			taxonomyId &&
			!Array.isArray(taxonomyId) &&
			typeof taxonomyId.taxonomy_id === "number"
				? taxonomyId.taxonomy_id
				: null;

		if (resolvedTaxonomyId) {
			const generatedTerms = await listTaxonomyTerms(
				resolvedTaxonomyId,
				{ perpage: 5 },
				request,
			);
			const termsData = generatedTerms.data;
			if (!Array.isArray(termsData)) {
				throw new Error("listTaxonomyTerms returned unexpected data");
			}
			console.log(`listTaxonomyTerms (generated): ${termsData.length} ok`);
		}
	}
}

console.log("\nAll smoke tests passed.");
