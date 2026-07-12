"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { type ChangeEvent, Suspense, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { FavoriteButton } from "@/components/FavoriteButton";
import { HeartFilledIcon } from "@/components/icons/HeartIcon";
import { MuseumCard } from "@/components/MuseumCard";
import { SearchBar } from "@/components/SearchBar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getMuseumById } from "@/utils/museums";

function FavoritesContent() {
	const { favoriteItems, favoriteMuseums } = useFavorites();

	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const [searchInput, setSearchInput] = useState(search);
	const [debouncedSearch] = useDebounce(searchInput, 500);

	const filteredFavorites = favoriteItems.filter((favorite) => {
		if (!search) return true;

		const searchLower = search.toLowerCase();
		const museum = getMuseumById(favorite.museumId);
		const museumTitle = museum?.title.toLowerCase() || "";
		const itemTitle = favorite.title.toLowerCase();

		return itemTitle.includes(searchLower) || museumTitle.includes(searchLower);
	});

	const filteredMuseums = favoriteMuseums
		.map((id) => getMuseumById(id))
		.filter((museum) => museum !== null)
		.filter((museum) => {
			if (!search) return true;
			return museum.title.toLowerCase().includes(search.toLowerCase());
		});

	useEffect(() => {
		if (debouncedSearch !== search) {
			setSearch(debouncedSearch || null);
		}
	}, [debouncedSearch, search, setSearch]);

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
				<SearchBar
					value={searchInput}
					onChange={(e: ChangeEvent<HTMLInputElement>) => {
						setSearchInput(e.target.value);
					}}
					placeholder="Buscar nos favoritos..."
				/>
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
							<Grid columns={{ minWidth: 180, max: 6 }} gap={4}>
								{filteredFavorites.map((favorite) => {
									const museum = getMuseumById(favorite.museumId);
									return (
										<Link
											key={`${favorite.museumId}-${favorite.itemId}`}
											href={`/${favorite.museumId}/items/${favorite.itemId}`}
											isStandalone
										>
											<Card padding={0}>
												<Layout
													height="auto"
													content={
														<LayoutContent>
															<VStack>
																<FavoriteButton
																	type="item"
																	item={favorite}
																	variant="card"
																/>
																<Image
																	src={favorite.imageUrl}
																	alt={favorite.title}
																	width={400}
																	height={400}
																	style={{
																		width: "100%",
																		height: "auto",
																		objectFit: "contain",
																		objectPosition: "top",
																	}}
																	unoptimized
																/>
															</VStack>
														</LayoutContent>
													}
													footer={
														<LayoutFooter hasDivider>
															<VStack gap={1}>
																<Text type="label" maxLines={1} as="p">
																	{favorite.title}
																</Text>
																{museum ? (
																	<Text type="supporting" maxLines={1} as="p">
																		{museum.title}
																	</Text>
																) : null}
															</VStack>
														</LayoutFooter>
													}
												/>
											</Card>
										</Link>
									);
								})}
							</Grid>
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
