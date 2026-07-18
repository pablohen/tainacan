import { z } from "zod";
import {
	Collection,
	Filter,
	FilterMetadatum,
	Item,
	ItemEmbeddedMetadata,
	Taxonomy,
	Term,
} from "./generated/tainacan.zod";

export const TainacanMetadatumSchema = ItemEmbeddedMetadata.required({
	id: true,
	name: true,
	value: true,
	value_as_html: true,
	value_as_string: true,
});

export const TainacanItemSchema = Item.required({
	id: true,
	title: true,
	description: true,
	document_as_html: true,
}).extend({
	metadata: z.record(z.string(), TainacanMetadatumSchema),
});

export const TainacanCollectionSchema = Collection.required({
	id: true,
	name: true,
	slug: true,
});

export const TainacanTaxonomySchema = Taxonomy.required({
	id: true,
	name: true,
	slug: true,
});

export const TainacanFilterMetadatumSchema = FilterMetadatum;
export const TainacanFilterSchema = Filter.required({
	id: true,
	name: true,
	filter_type: true,
	collection_id: true,
});

export const TainacanTermSchema = Term.required({
	id: true,
	name: true,
});

export const GetItemsResponseSchema = z.object({
	items: z.array(TainacanItemSchema),
	template: z.string().optional(),
	filters: z.array(z.unknown()).optional(),
	filters_arguments: z.array(z.unknown()).optional(),
});

export const GetCollectionsResponseSchema = z.array(TainacanCollectionSchema);
export const GetTaxonomiesResponseSchema = z.array(TainacanTaxonomySchema);
export const GetFiltersResponseSchema = z.array(TainacanFilterSchema);
export const GetTaxonomyTermsResponseSchema = z.array(TainacanTermSchema);
