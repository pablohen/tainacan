"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/contexts/FavoritesContext";
import { museums } from "@/utils/museums";

export function FavoritesSection() {
	const { favorites } = useFavorites();

	if (favorites.length === 0) {
		return null;
	}

	const favoriteMuseums = museums.filter((museum) =>
		favorites.includes(museum.id),
	);

	return (
		<div className="w-full max-w-7xl space-y-6 px-4 pb-16">
			<div className="flex items-center gap-3">
				<Heart className="h-6 w-6 fill-red-500 text-red-500" />
				<h2 className="font-bold text-2xl text-gray-900">Meus Favoritos</h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{favoriteMuseums.map((museum) => (
					<Link
						key={museum.id}
						href={`/${museum.id}`}
						className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
					>
						<div className="space-y-3 p-6">
							<h3 className="font-semibold text-gray-900 text-lg transition-colors duration-200 group-hover:text-primary">
								{museum.title}
							</h3>
							<p className="line-clamp-2 text-gray-600 text-sm">
								{museum.description}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
