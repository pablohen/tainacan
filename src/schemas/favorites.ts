import { z } from "zod";

export const FavoriteItemSchema = z.object({
	museumId: z.string().min(1),
	itemId: z.number().int().positive(),
	title: z.string(),
	imageUrl: z.string(),
});

export const FavoriteMuseumsSchema = z.array(z.string().min(1));

export type FavoriteItem = z.infer<typeof FavoriteItemSchema>;
