import type { z } from "zod";
import type {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomiesResponseSchema,
	GetTaxonomyTermsResponseSchema,
	TainacanCollectionSchema,
	TainacanFilterSchema,
	TainacanItemSchema,
	TainacanMetadatumSchema,
	TainacanTaxonomySchema,
	TainacanTermSchema,
} from "../schemas/tainacan";

export type TainacanItem = z.output<typeof TainacanItemSchema>;
export type ItemEmbeddedMetadatum = z.output<typeof TainacanMetadatumSchema>;
/** @deprecated Use ItemEmbeddedMetadatum — this is embedded item metadata, not a field definition. */
export type TainacanMetadatum = ItemEmbeddedMetadatum;
export type TainacanCollection = z.output<typeof TainacanCollectionSchema>;
export type TainacanTaxonomy = z.output<typeof TainacanTaxonomySchema>;
export type TainacanFilter = z.output<typeof TainacanFilterSchema>;
export type GetItemsResponse = z.output<typeof GetItemsResponseSchema>;
export type GetCollectionsResponse = z.output<
	typeof GetCollectionsResponseSchema
>;
export type GetTaxonomiesResponse = z.output<
	typeof GetTaxonomiesResponseSchema
>;
export type GetFiltersResponse = z.output<typeof GetFiltersResponseSchema>;
export type TainacanTerm = z.output<typeof TainacanTermSchema>;
export type GetTaxonomyTermsResponse = z.output<
	typeof GetTaxonomyTermsResponseSchema
>;

export interface FormattedItemsRes {
	items: TainacanItem[];
	wpTotal: number;
	wpTotalPages: number;
}
