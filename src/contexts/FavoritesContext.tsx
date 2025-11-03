"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

interface FavoritesContextType {
	favorites: string[];
	toggleFavorite: (museumId: string) => void;
	isFavorite: (museumId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
	undefined,
);

const FAVORITES_KEY = "museum-favorites";

function loadFavorites(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(FAVORITES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveFavorites(favorites: string[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
	} catch (error) {
		console.error("Failed to save favorites:", error);
	}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
	const [favorites, setFavorites] = useState<string[]>([]);
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

	const toggleFavorite = (museumId: string) => {
		setFavorites((prev) =>
			prev.includes(museumId)
				? prev.filter((id) => id !== museumId)
				: [...prev, museumId],
		);
	};

	const isFavorite = (museumId: string) => {
		return favorites.includes(museumId);
	};

	return (
		<FavoritesContext.Provider
			value={{ favorites, toggleFavorite, isFavorite }}
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
