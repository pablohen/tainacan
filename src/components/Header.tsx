"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";
import { MuseumList } from "./MuseumList";

export function Header() {
	const { favorites } = useFavorites();
	const favoritesCount = favorites.length;

	return (
		<header className="sticky top-0 z-50 border-gray-200/80 border-b bg-white/95 backdrop-blur-sm">
			<div className="mx-auto flex max-w-screen-2xl items-center overflow-hidden">
				<div className="flex shrink-0 items-center px-6 py-5">
					<Link
						href="/"
						className="group flex items-center gap-2 font-semibold text-2xl text-gray-900 transition-colors duration-200 hover:text-gray-600"
					>
						Tainacan
					</Link>
				</div>
				<div className="flex min-w-0 flex-1 items-center">
					<MuseumList />
					<Link
						href="/favorites"
						className="relative mr-6 shrink-0 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
						aria-label={`Favoritos (${favoritesCount})`}
					>
						<Heart
							className={cn(
								"h-6 w-6 transition-colors duration-200",
								favoritesCount > 0
									? "fill-red-500 text-red-500"
									: "text-gray-600",
							)}
						/>
						{favoritesCount > 0 && (
							<span className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-white text-xs">
								{favoritesCount > 9 ? "9+" : favoritesCount}
							</span>
						)}
					</Link>
				</div>
			</div>
		</header>
	);
}
