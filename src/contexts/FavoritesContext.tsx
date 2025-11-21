"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export interface FavoriteItem {
	museumId: string;
	itemId: number;
	title: string;
	imageUrl: string;
}

interface FavoritesContextType {
	favoriteItems: FavoriteItem[];
	toggleFavoriteItem: (item: FavoriteItem) => void;
	isFavoriteItem: (museumId: string, itemId: number) => boolean;
	getFavoritesByMuseum: (museumId: string) => FavoriteItem[];
	favoriteMuseums: string[];
	toggleFavoriteMuseum: (museumId: string) => void;
	isFavoriteMuseum: (museumId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
	undefined,
);

const ITEM_FAVORITES_KEY = "item-favorites";
const MUSEUM_FAVORITES_KEY = "museum-favorites";

function loadFavoriteItems(): FavoriteItem[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(ITEM_FAVORITES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function loadFavoriteMuseums(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(MUSEUM_FAVORITES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveFavoriteItems(favorites: FavoriteItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(ITEM_FAVORITES_KEY, JSON.stringify(favorites));
	} catch (error) {
		console.error("Failed to save favorite items:", error);
	}
}

function saveFavoriteMuseums(favorites: string[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(MUSEUM_FAVORITES_KEY, JSON.stringify(favorites));
	} catch (error) {
		console.error("Failed to save favorite museums:", error);
	}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
	const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
	const [favoriteMuseums, setFavoriteMuseums] = useState<string[]>([]);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setFavoriteItems(loadFavoriteItems());
		setFavoriteMuseums(loadFavoriteMuseums());
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		if (isHydrated) {
			saveFavoriteItems(favoriteItems);
		}
	}, [favoriteItems, isHydrated]);

	useEffect(() => {
		if (isHydrated) {
			saveFavoriteMuseums(favoriteMuseums);
		}
	}, [favoriteMuseums, isHydrated]);

	const toggleFavoriteItem = (item: FavoriteItem) => {
		setFavoriteItems((prev) => {
			const exists = prev.find(
				(fav) => fav.museumId === item.museumId && fav.itemId === item.itemId,
			);
			if (exists) {
				return prev.filter(
					(fav) =>
						!(fav.museumId === item.museumId && fav.itemId === item.itemId),
				);
			}
			return [...prev, item];
		});
	};

	const isFavoriteItem = (museumId: string, itemId: number) => {
		return favoriteItems.some(
			(fav) => fav.museumId === museumId && fav.itemId === itemId,
		);
	};

	const getFavoritesByMuseum = (museumId: string) => {
		return favoriteItems.filter((fav) => fav.museumId === museumId);
	};

	const toggleFavoriteMuseum = (museumId: string) => {
		setFavoriteMuseums((prev) => {
			const exists = prev.includes(museumId);
			if (exists) {
				return prev.filter((id) => id !== museumId);
			}
			return [...prev, museumId];
		});
	};

	const isFavoriteMuseum = (museumId: string) => {
		return favoriteMuseums.includes(museumId);
	};

	return (
		<FavoritesContext.Provider
			value={{
				favoriteItems,
				toggleFavoriteItem,
				isFavoriteItem,
				getFavoritesByMuseum,
				favoriteMuseums,
				toggleFavoriteMuseum,
				isFavoriteMuseum,
			}}
		>
			{children}
		</FavoritesContext.Provider>
	);
}

export function useFavorites() {
	const context = useContext(FavoritesContext);
	if (context === undefined) {
		throw new Error("useFavorites must be used within a FavoritesProvider");
	}
	return context;
}
