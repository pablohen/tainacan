"use client";

import { motion } from "framer-motion";
import { Heart, PackageOpen } from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	CardContent,
	CardFooter,
	Card as ShadcnCard,
} from "@/components/ui/card";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getMuseumById } from "@/utils/museums";

export default function FavoritesPage() {
	const { favorites } = useFavorites();
	const [searchTerm, setSearchTerm] = useState("");

	// Filter favorites based on search term
	const filteredFavorites = favorites.filter((favorite) => {
		if (!searchTerm) return true;

		const searchLower = searchTerm.toLowerCase();
		const museum = getMuseumById(favorite.museumId);
		const museumTitle = museum?.title.toLowerCase() || "";
		const itemTitle = favorite.title.toLowerCase();

		return itemTitle.includes(searchLower) || museumTitle.includes(searchLower);
	});

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />

			<div className="flex flex-grow flex-col px-4 py-8">
				<div className="mx-auto w-full max-w-screen-2xl space-y-8">
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<Heart className="h-8 w-8 fill-red-500 text-red-500" />
							<h1 className="font-bold text-3xl text-gray-900">
								Meus Favoritos
							</h1>
						</div>
						<p className="text-gray-600">
							{favorites.length > 0
								? `Você tem ${favorites.length} ${favorites.length === 1 ? "item favoritado" : "itens favoritados"}`
								: "Você ainda não possui itens favoritos"}
						</p>
					</div>

					{favorites.length > 0 && (
						<SearchBar
							value={searchTerm}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								setSearchTerm(e.target.value);
							}}
							placeholder="Buscar nos favoritos..."
						/>
					)}

					{favorites.length > 0 ? (
						filteredFavorites.length > 0 ? (
							<div className="animate-fade-in columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
								{filteredFavorites.map((favorite) => {
									const museum = getMuseumById(favorite.museumId);
									return (
										<div
											key={`${favorite.museumId}-${favorite.itemId}`}
											className="mb-4 break-inside-avoid"
										>
											<Link
												href={`/${favorite.museumId}/items/${favorite.itemId}`}
											>
												<ShadcnCard className="group relative overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
													<CardContent className="p-0">
														<div className="relative flex items-start justify-center bg-gray-50">
															<FavoriteButton item={favorite} variant="card" />
															<motion.img
																src={favorite.imageUrl}
																alt={favorite.title}
																className="h-auto w-full object-contain object-top transition-transform duration-200 group-hover:scale-105"
																layoutId={`favorite-${favorite.itemId}`}
															/>
														</div>
													</CardContent>

													<CardFooter className="flex flex-col items-start gap-1 border-gray-100 border-t bg-white px-4 py-3">
														<p className="w-full truncate font-medium text-gray-700 text-sm">
															{favorite.title}
														</p>
														{museum && (
															<p className="w-full truncate text-gray-500 text-xs">
																{museum.title}
															</p>
														)}
													</CardFooter>
												</ShadcnCard>
											</Link>
										</div>
									);
								})}
							</div>
						) : (
							<div className="flex animate-fade-in justify-center py-16">
								<Alert className="max-w-md rounded-xl border border-gray-200 bg-white">
									<PackageOpen className="h-5 w-5 text-gray-600" />
									<AlertTitle className="font-semibold text-base text-gray-900">
										Nenhum resultado encontrado
									</AlertTitle>
									<AlertDescription className="text-gray-600 text-sm">
										Nenhum favorito corresponde à sua busca. Tente usar outros
										termos.
									</AlertDescription>
								</Alert>
							</div>
						)
					) : (
						<div className="flex animate-fade-in justify-center py-16">
							<Alert className="max-w-md rounded-xl border border-gray-200 bg-white">
								<PackageOpen className="h-5 w-5 text-gray-600" />
								<AlertTitle className="font-semibold text-base text-gray-900">
									Nenhum favorito ainda
								</AlertTitle>
								<AlertDescription className="text-gray-600 text-sm">
									Explore os museus e adicione itens aos seus favoritos clicando
									no ícone de coração.
								</AlertDescription>
							</Alert>
						</div>
					)}
				</div>
			</div>

			<Footer />
		</div>
	);
}
