"use client";

import { AppShell } from "@astryxdesign/core/AppShell";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import {
	SideNav,
	SideNavItem,
	SideNavSection,
} from "@astryxdesign/core/SideNav";
import { Text } from "@astryxdesign/core/Text";
import { TopNav, TopNavHeading } from "@astryxdesign/core/TopNav";
import { VStack } from "@astryxdesign/core/VStack";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { HeartFilledIcon, HeartIcon } from "@/components/icons/HeartIcon";
import { SearchBar } from "@/components/SearchBar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { museums } from "@/utils/museums";
import { normalizeText } from "@/utils/normalizeText";
import { partitionMuseumsByFavorite } from "@/utils/partitionMuseumsByFavorite";

function FavoritesNavAction() {
	const router = useRouter();
	const { favoriteItems, favoriteMuseums } = useFavorites();
	const favoritesCount = favoriteItems.length + favoriteMuseums.length;
	const hasFavorites = favoritesCount > 0;
	const countLabel = favoritesCount > 9 ? "9+" : String(favoritesCount);

	return (
		<HStack gap={1} vAlign="center">
			<IconButton
				label={`Favoritos (${favoritesCount})`}
				tooltip="Favoritos"
				variant="ghost"
				icon={
					<Icon
						icon={hasFavorites ? HeartFilledIcon : HeartIcon}
						color={hasFavorites ? "error" : "primary"}
					/>
				}
				onClick={() => router.push("/favorites")}
			/>
			{hasFavorites ? <Badge label={countLabel} variant="red" /> : null}
		</HStack>
	);
}

function MuseumSideNav() {
	const pathname = usePathname();
	const museumId = pathname?.split("/")[1] ?? "";
	const [query, setQuery] = useState("");
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { favoriteMuseums } = useFavorites();

	const normalizedQuery = normalizeText(query);
	const { favorites: favoriteSection, all: filteredMuseums } =
		partitionMuseumsByFavorite({
			museums,
			favoriteIds: favoriteMuseums,
			matches: (museum) =>
				normalizedQuery
					? normalizeText(museum.title).includes(normalizedQuery)
					: true,
		});

	return (
		<SideNav
			collapsible={{
				isCollapsed,
				onCollapsedChange: setIsCollapsed,
			}}
			topContent={
				isCollapsed ? undefined : (
					<SearchBar
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Filtrar museus..."
					/>
				)
			}
		>
			{favoriteSection.length > 0 ? (
				<SideNavSection title="Meus museus">
					{favoriteSection.map((museum) => (
						<SideNavItem
							key={`favorite-${museum.id}`}
							label={museum.title}
							href={`/${museum.id}`}
							isSelected={museumId === museum.id}
						/>
					))}
				</SideNavSection>
			) : null}

			<SideNavSection title="Todos os museus">
				{filteredMuseums.map((museum) => (
					<SideNavItem
						key={museum.id}
						label={museum.title}
						href={`/${museum.id}`}
						isSelected={museumId === museum.id}
					/>
				))}
				{filteredMuseums.length === 0 ? (
					<VStack paddingInline={3} paddingBlock={2}>
						<Text type="supporting">Nenhum museu encontrado</Text>
					</VStack>
				) : null}
			</SideNavSection>
		</SideNav>
	);
}

function AppFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<VStack paddingBlock={6} hAlign="center">
			<Text type="supporting">{`Tainacan © ${currentYear}`}</Text>
		</VStack>
	);
}

export function AppChrome({ children }: { children: ReactNode }) {
	return (
		<AppShell
			height="auto"
			contentPadding={4}
			topNav={
				<TopNav
					label="Navegação principal"
					heading={<TopNavHeading heading="Tainacan" headingHref="/" />}
					endContent={<FavoritesNavAction />}
				/>
			}
			sideNav={<MuseumSideNav />}
		>
			<VStack gap={4} minHeight="100%">
				{children}
				<AppFooter />
			</VStack>
		</AppShell>
	);
}
