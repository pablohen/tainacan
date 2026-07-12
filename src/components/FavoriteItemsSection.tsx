"use client";

import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { HeartFilledIcon } from "@/components/icons/HeartIcon";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getMuseumById } from "@/utils/museums";

export function FavoriteItemsSection() {
	const { favoriteItems } = useFavorites();

	if (favoriteItems.length === 0) {
		return null;
	}

	return (
		<VStack gap={4} maxWidth={1280}>
			<HStack gap={2} vAlign="center">
				<Icon icon={HeartFilledIcon} color="error" />
				<Heading level={2}>Meus Itens Favoritos</Heading>
			</HStack>

			<Grid columns={{ minWidth: 240, max: 3 }} gap={4}>
				{favoriteItems.slice(0, 6).map((favorite) => {
					const museum = getMuseumById(favorite.museumId);
					return (
						<Link
							key={`${favorite.museumId}-${favorite.itemId}`}
							href={`/${favorite.museumId}/items/${favorite.itemId}`}
							isStandalone
						>
							<Card>
								<VStack gap={2}>
									<Heading level={3} maxLines={2}>
										{favorite.title}
									</Heading>
									{museum ? (
										<Text type="supporting" maxLines={1} as="p">
											{museum.title}
										</Text>
									) : null}
								</VStack>
							</Card>
						</Link>
					);
				})}
			</Grid>

			{favoriteItems.length > 6 ? (
				<Link href="/favorites" isStandalone>
					Ver todos os favoritos ({favoriteItems.length})
				</Link>
			) : null}
		</VStack>
	);
}
