import type { Museum } from "@/types/Museum";
import { getMuseumById } from "@/utils/museums";

export type PartitionMuseumsByFavoriteArgs = {
	museums: Museum[];
	favoriteIds: string[];
	matches: (museum: Museum) => boolean;
};

export type PartitionMuseumsByFavoriteResult = {
	favorites: Museum[];
	all: Museum[];
};

export function partitionMuseumsByFavorite({
	museums,
	favoriteIds,
	matches,
}: PartitionMuseumsByFavoriteArgs): PartitionMuseumsByFavoriteResult {
	const all = museums.filter(matches);

	const favorites = favoriteIds
		.map((id) => getMuseumById(id))
		.filter((museum): museum is Museum => museum !== null)
		.filter(matches);

	return { favorites, all };
}
