"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { type FavoriteItem, useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FavoriteButtonProps {
	item: FavoriteItem;
	variant?: "default" | "card" | "detail";
	className?: string;
}

export function FavoriteButton({
	item,
	variant = "default",
	className,
}: FavoriteButtonProps) {
	const { toggleFavorite, isFavorite } = useFavorites();
	const [isAnimating, setIsAnimating] = useState(false);

	const favorited = isFavorite(item.museumId, item.itemId);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		toggleFavorite(item);
		setIsAnimating(true);
		setTimeout(() => setIsAnimating(false), 300);
	};

	if (variant === "card") {
		return (
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					"absolute top-2 right-2 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-md",
					className,
				)}
				aria-label={
					favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
				}
			>
				<Heart
					className={cn(
						"h-4 w-4 transition-all duration-200",
						favorited ? "fill-red-500 text-red-500" : "text-gray-600",
						isAnimating && "scale-125",
					)}
				/>
			</button>
		);
	}

	if (variant === "detail") {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={handleClick}
				className={cn("gap-2", className)}
			>
				<Heart
					className={cn(
						"h-4 w-4 transition-all duration-200",
						favorited ? "fill-red-500 text-red-500" : "text-gray-600",
						isAnimating && "scale-125",
					)}
				/>
				<span>
					{favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
				</span>
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleClick}
			className={cn("h-9 w-9 rounded-full", className)}
			aria-label={
				favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
			}
		>
			<Heart
				className={cn(
					"h-5 w-5 transition-all duration-200",
					favorited ? "fill-red-500 text-red-500" : "text-gray-600",
					isAnimating && "scale-125",
				)}
			/>
		</Button>
	);
}
