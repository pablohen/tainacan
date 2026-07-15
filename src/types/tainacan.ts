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

export type TainacanItem = z.infer<typeof TainacanItemSchema>;
export type TainacanMetadatum = z.infer<typeof TainacanMetadatumSchema>;
export type TainacanCollection = z.infer<typeof TainacanCollectionSchema>;
export type TainacanTaxonomy = z.infer<typeof TainacanTaxonomySchema>;
export type TainacanFilter = z.infer<typeof TainacanFilterSchema>;
export type GetItemsResponse = z.infer<typeof GetItemsResponseSchema>;
export type GetCollectionsResponse = z.infer<
	typeof GetCollectionsResponseSchema
>;
export type GetTaxonomiesResponse = z.infer<typeof GetTaxonomiesResponseSchema>;
export type GetFiltersResponse = z.infer<typeof GetFiltersResponseSchema>;
export type TainacanTerm = z.infer<typeof TainacanTermSchema>;
export type GetTaxonomyTermsResponse = z.infer<
	typeof GetTaxonomyTermsResponseSchema
>;

export interface FormattedItemsRes {
	items: TainacanItem[];
	wpTotal: number;
	wpTotalPages: number;
}
