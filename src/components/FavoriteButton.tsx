"use client";

import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HeartFilledIcon, HeartIcon } from "@/components/icons/HeartIcon";
import { type FavoriteItem, useFavorites } from "@/contexts/FavoritesContext";

export type FavoriteButtonProps = {
	variant?: "default" | "card";
} & (
	| { type: "item"; item: FavoriteItem }
	| { type: "museum"; museumId: string }
);

export function FavoriteButton({
	variant = "default",
	...props
}: FavoriteButtonProps) {
	const {
		toggleFavoriteItem,
		isFavoriteItem,
		toggleFavoriteMuseum,
		isFavoriteMuseum,
	} = useFavorites();

	const isItem = props.type === "item";
	const favorited = isItem
		? isFavoriteItem(props.item.museumId, props.item.itemId)
		: isFavoriteMuseum(props.museumId);

	const label = favorited ? "Remover dos favoritos" : "Adicionar aos favoritos";

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isItem) {
			toggleFavoriteItem(props.item);
		} else {
			toggleFavoriteMuseum(props.museumId);
		}
	};

	const heart = (
		<Icon
			icon={favorited ? HeartFilledIcon : HeartIcon}
			color={favorited ? "error" : "primary"}
		/>
	);

	return (
		<IconButton
			label={label}
			tooltip={label}
			variant="ghost"
			size={variant === "card" ? "sm" : "md"}
			icon={heart}
			onClick={handleClick}
		/>
	);
}
