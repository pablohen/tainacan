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
import type { ReactNode } from "react";
import { HeartFilledIcon, HeartIcon } from "@/components/icons/HeartIcon";
import { useFavorites } from "@/contexts/FavoritesContext";
import { museums } from "@/utils/museums";

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

	return (
		<SideNav collapsible>
			<SideNavSection title="Museus">
				{museums.map((museum) => (
					<SideNavItem
						key={museum.id}
						label={museum.title}
						href={`/${museum.id}`}
						isSelected={museumId === museum.id}
					/>
				))}
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
