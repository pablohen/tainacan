import { useEffect, useState } from "react";

export function useFavoriteMuseums() {
	const [favorites, setFavorites] = useState<string[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("favoriteMuseums");
		if (stored) {
			try {
				setFavorites(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse favorites", e);
			}
		}
		setIsInitialized(true);
	}, []);

	const toggleFavorite = (museumId: string) => {
		setFavorites((prev) => {
			const next = prev.includes(museumId)
				? prev.filter((id) => id !== museumId)
				: [...prev, museumId];
			localStorage.setItem("favoriteMuseums", JSON.stringify(next));
			return next;
		});
	};

	const isFavorite = (museumId: string) => favorites.includes(museumId);

	return { favorites, toggleFavorite, isFavorite, isInitialized };
}
