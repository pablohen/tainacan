import { z } from "zod";

export const TainacanMetadatumSchema = z.object({
	id: z.number(),
	name: z.string(),
	value: z.any(),
	value_as_html: z.string(),
	value_as_string: z.string(),
	semantic_uri: z.string().optional(),
	multiple: z.string().optional(),
});

export const TainacanItemSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string(),
	document_as_html: z.string(),
	metadata: z.record(z.string(), TainacanMetadatumSchema),
});

export const TainacanCollectionSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	slug: z.string(),
	url: z.string().optional(),
	creation_date: z.string().optional(),
	modification_date: z.string().optional(),
});

export const TainacanTaxonomySchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	description: z.string().optional(),
	allow_insert: z.union([z.string(), z.boolean()]).optional(),
});

export const TainacanFilterMetadatumSchema = z
	.object({
		metadatum_id: z.union([z.string(), z.number()]).optional(),
		metadatum_name: z.string().optional(),
		metadata_type_object: z
			.object({
				options: z
					.object({
						taxonomy_id: z.number().optional(),
						taxonomy: z.string().optional(),
					})
					.passthrough()
					.optional(),
			})
			.passthrough()
			.optional(),
	})
	.passthrough();

export const TainacanFilterSchema = z.object({
	id: z.number(),
	name: z.string(),
	filter_type: z.string(),
	collection_id: z.union([z.number(), z.string()]),
	metadatum_id: z.union([z.number(), z.string()]).optional(),
	enabled: z.string().optional(),
	metadatum: TainacanFilterMetadatumSchema.optional(),
});

export const TainacanTermSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const GetTaxonomyTermsResponseSchema = z.array(TainacanTermSchema);

export const GetItemsResponseSchema = z.object({
	items: z.array(TainacanItemSchema),
	template: z.string().optional(),
	filters: z.array(z.unknown()).optional(),
});

export const GetCollectionsResponseSchema = z.array(TainacanCollectionSchema);
export const GetTaxonomiesResponseSchema = z.array(TainacanTaxonomySchema);
export const GetFiltersResponseSchema = z.array(TainacanFilterSchema);
