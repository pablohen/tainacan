"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getMuseumById } from "@/utils/museums";

export function FavoritesSection() {
	const { favorites } = useFavorites();

	if (favorites.length === 0) {
		return null;
	}

	return (
		<div className="w-full max-w-7xl space-y-6 px-4 pb-16">
			<div className="flex items-center gap-3">
				<Heart className="h-6 w-6 fill-red-500 text-red-500" />
				<h2 className="font-bold text-2xl text-gray-900">
					Meus Itens Favoritos
				</h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{favorites.slice(0, 6).map((favorite) => {
					const museum = getMuseumById(favorite.museumId);
					return (
						<Link
							key={`${favorite.museumId}-${favorite.itemId}`}
							href={`/${favorite.museumId}/items/${favorite.itemId}`}
							className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
						>
							<div className="space-y-3 p-6">
								<h3 className="line-clamp-2 font-semibold text-gray-900 text-lg transition-colors duration-200 group-hover:text-primary">
									{favorite.title}
								</h3>
								{museum && (
									<p className="line-clamp-1 text-gray-600 text-sm">
										{museum.title}
									</p>
								)}
							</div>
						</Link>
					);
				})}
			</div>

			{favorites.length > 6 && (
				<div className="text-center">
					<Link
						href="/favorites"
						className="inline-block font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900"
					>
						Ver todos os favoritos ({favorites.length})
					</Link>
				</div>
			)}
		</div>
	);
}
