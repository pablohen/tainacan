"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { type ChangeEvent, Suspense, useCallback } from "react";
import { Card } from "@/components/Card";
import { ItemMasonry } from "@/components/ItemMasonry";
import { ItemResultsTable } from "@/components/ItemResultsTable";
import { ItemSortSelector } from "@/components/ItemSortSelector";
import { ItemViewModeSelector } from "@/components/ItemViewModeSelector";
import { HeartFilledIcon } from "@/components/icons/HeartIcon";
import { MuseumCard } from "@/components/MuseumCard";
import { SearchBar } from "@/components/SearchBar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useDebouncedUrlSearch } from "@/hooks/useDebouncedSearch";
import { ITEM_SORT_VALUES, sortFavoriteItems } from "@/utils/itemSort";
import { ITEM_VIEW_VALUES, toItemViewMode } from "@/utils/itemView";
import { getMuseumById } from "@/utils/museums";

function FavoritesContent() {
	const { favoriteItems, favoriteMuseums } = useFavorites();

	const [{ search, view, sort }, setQueryStates] = useQueryStates({
		search: parseAsString.withDefault(""),
		view: parseAsStringLiteral(ITEM_VIEW_VALUES),
		sort: parseAsStringLiteral(ITEM_SORT_VALUES),
	});

	const viewMode = toItemViewMode(view);

	const commitSearch = useCallback(
		(value: string) => {
			setQueryStates({ search: value || null });
		},
		[setQueryStates],
	);

	const { searchInput, setSearchInput } = useDebouncedUrlSearch(
		search,
		commitSearch,
	);

	const filteredFavorites = sortFavoriteItems(
		favoriteItems.filter((favorite) => {
			if (!search) return true;

			const searchLower = search.toLowerCase();
			const museum = getMuseumById(favorite.museumId);
			const museumTitle = museum?.title.toLowerCase() || "";
			const itemTitle = favorite.title.toLowerCase();

			return (
				itemTitle.includes(searchLower) || museumTitle.includes(searchLower)
			);
		}),
		sort,
	);

	const filteredMuseums = favoriteMuseums
		.map((id) => getMuseumById(id))
		.filter((museum) => museum !== null)
		.filter((museum) => {
			if (!search) return true;
			return museum.title.toLowerCase().includes(search.toLowerCase());
		});

	const hasAnyFavorites =
		favoriteItems.length > 0 || favoriteMuseums.length > 0;
	const hasAnyResults =
		filteredFavorites.length > 0 || filteredMuseums.length > 0;
	const totalCount = favoriteItems.length + favoriteMuseums.length;

	return (
		<VStack gap={4}>
			<VStack gap={2}>
				<HStack gap={2} vAlign="center">
					<Icon icon={HeartFilledIcon} color="error" size="lg" />
					<Heading level={1}>Meus Favoritos</Heading>
				</HStack>
				<Text type="supporting" as="p">
					{hasAnyFavorites
						? `Você tem ${totalCount} ${
								totalCount === 1 ? "item favoritado" : "itens favoritados"
							}`
						: "Você ainda não possui itens favoritos"}
				</Text>
			</VStack>

			{hasAnyFavorites ? (
				<VStack gap={3} maxWidth={672} width="100%">
					<SearchBar
						value={searchInput}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearchInput(e.target.value);
						}}
						placeholder="Buscar nos favoritos..."
					/>
					{favoriteItems.length > 0 ? (
						<HStack gap={3} wrap="wrap" vAlign="end" width="100%">
							<ItemSortSelector
								value={sort}
								onChange={(next) => {
									setQueryStates({ sort: next });
								}}
							/>
							<ItemViewModeSelector
								value={view}
								onChange={(next) => {
									setQueryStates({ view: next });
								}}
							/>
						</HStack>
					) : null}
				</VStack>
			) : null}

			{hasAnyFavorites ? (
				<VStack gap={6}>
					{filteredMuseums.length > 0 ? (
						<VStack gap={3}>
							<Heading level={2}>Museus</Heading>
							<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
								{filteredMuseums.map((museum) => (
									<MuseumCard key={museum.id} museum={museum} />
								))}
							</Grid>
						</VStack>
					) : null}

					{filteredFavorites.length > 0 ? (
						<VStack gap={3}>
							<Heading level={2}>Itens</Heading>
							{viewMode === "table" ? (
								<ItemResultsTable
									showMuseum
									items={filteredFavorites.map((favorite) => {
										const museum = getMuseumById(favorite.museumId);
										return {
											museumId: favorite.museumId,
											itemId: favorite.itemId,
											title: favorite.title,
											imageUrl: favorite.imageUrl,
											museumTitle: museum?.title,
										};
									})}
								/>
							) : (
								<ItemMasonry>
									{filteredFavorites.map((favorite) => {
										const museum = getMuseumById(favorite.museumId);
										return (
											<Card
												key={`${favorite.museumId}-${favorite.itemId}`}
												museumId={favorite.museumId}
												itemId={favorite.itemId}
												title={favorite.title}
												imageUrl={favorite.imageUrl}
												subtitle={museum?.title}
											/>
										);
									})}
								</ItemMasonry>
							)}
						</VStack>
					) : null}

					{!hasAnyResults ? (
						<Center minHeight={200}>
							<Banner
								status="info"
								title="Nenhum resultado encontrado"
								description="Nenhum favorito corresponde à sua busca. Tente usar outros termos."
								container="card"
							/>
						</Center>
					) : null}
				</VStack>
			) : (
				<Center minHeight={200}>
					<Banner
						status="info"
						title="Nenhum favorito ainda"
						description="Explore os museus e adicione itens aos seus favoritos clicando no ícone de coração."
						container="card"
					/>
				</Center>
			)}
		</VStack>
	);
}

export default function FavoritesPage() {
	return (
		<Suspense fallback={null}>
			<FavoritesContent />
		</Suspense>
	);
}
