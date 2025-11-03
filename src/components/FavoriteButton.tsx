"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "./ui/button";

interface FavoriteButtonProps {
	museumId: string;
	variant?: "default" | "icon";
}

export function FavoriteButton({
	museumId,
	variant = "default",
}: FavoriteButtonProps) {
	const { isFavorite, toggleFavorite } = useFavorites();
	const favorite = isFavorite(museumId);

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					toggleFavorite(museumId);
				}}
				className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
				aria-label={
					favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
				}
			>
				<Heart
					className={`h-5 w-5 transition-colors duration-200 ${
						favorite
							? "fill-red-500 text-red-500"
							: "text-gray-400 hover:text-red-500"
					}`}
				/>
			</button>
		);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() => toggleFavorite(museumId)}
			className="gap-2"
		>
			<Heart
				className={`h-4 w-4 transition-colors duration-200 ${
					favorite ? "fill-red-500 text-red-500" : "text-gray-600"
				}`}
			/>
			<span>{favorite ? "Remover favorito" : "Adicionar favorito"}</span>
		</Button>
	);
}
