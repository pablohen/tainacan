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
	favorites: FavoriteItem[];
	toggleFavorite: (item: FavoriteItem) => void;
	isFavorite: (museumId: string, itemId: number) => boolean;
	getFavoritesByMuseum: (museumId: string) => FavoriteItem[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
	undefined,
);

const FAVORITES_KEY = "item-favorites";

function loadFavorites(): FavoriteItem[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(FAVORITES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveFavorites(favorites: FavoriteItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
	} catch (error) {
		console.error("Failed to save favorites:", error);
	}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
	const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setFavorites(loadFavorites());
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		if (isHydrated) {
			saveFavorites(favorites);
		}
	}, [favorites, isHydrated]);

	const toggleFavorite = (item: FavoriteItem) => {
		setFavorites((prev) => {
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

	const isFavorite = (museumId: string, itemId: number) => {
		return favorites.some(
			(fav) => fav.museumId === museumId && fav.itemId === itemId,
		);
	};

	const getFavoritesByMuseum = (museumId: string) => {
		return favorites.filter((fav) => fav.museumId === museumId);
	};

	return (
		<FavoritesContext.Provider
			value={{ favorites, toggleFavorite, isFavorite, getFavoritesByMuseum }}
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
