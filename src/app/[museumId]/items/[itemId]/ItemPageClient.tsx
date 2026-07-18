"use client";

import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { MediaTheme } from "@astryxdesign/core/theme";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ItemMetadata } from "@/components/ItemMetadata";
import type { TainacanItem as Item } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";

interface ItemPageProps {
	item: Item;
	museumId: string;
	museumName: string;
}

export function ItemPageClient({ item, museumId, museumName }: ItemPageProps) {
	const metadata = Object.entries(item.metadata || {}).filter(([, meta]) =>
		Boolean(meta.value_as_string),
	);
	const { title, description } = item;
	const imgPath = checkImagePath(item);
	const trimmedDescription = description?.trim() ?? "";

	return (
		<VStack gap={4} maxWidth={1280}>
			<Link href={`/${museumId}`} isStandalone>
				Voltar para a coleção
			</Link>

			<Section variant="transparent" padding={0} className="item-detail">
				<Image
					src={imgPath}
					alt={title}
					width={960}
					height={960}
					style={{
						width: "100%",
						height: "auto",
						display: "block",
						objectFit: "contain",
						objectPosition: "top",
					}}
					unoptimized
				/>
				<Section
					variant="transparent"
					padding={2}
					className="item-detail__favorite"
				>
					<MediaTheme mode="dark">
						<FavoriteButton
							type="item"
							item={{
								museumId,
								itemId: item.id,
								title: item.title,
								imageUrl: imgPath,
							}}
							variant="card"
						/>
					</MediaTheme>
				</Section>
				<Section
					variant="transparent"
					padding={3}
					className="item-detail__meta"
				>
					<MediaTheme mode="dark">
						<VStack gap={0.5}>
							<Heading level={1} maxLines={2} color="inherit">
								{title}
							</Heading>
							<Text type="supporting" maxLines={1} color="inherit" as="p">
								{museumName}
							</Text>
						</VStack>
					</MediaTheme>
				</Section>
			</Section>

			<VStack gap={4}>
				{trimmedDescription ? (
					<Text type="body" as="p">
						{trimmedDescription}
					</Text>
				) : null}

				{metadata.length > 0 ? (
					<VStack gap={3}>
						{metadata.map(([key, meta]) => (
							<ItemMetadata key={`ItemMetadata__${key}`} metadata={meta} />
						))}
					</VStack>
				) : (
					<Text type="supporting" justify="center" as="p">
						Nenhum metadado disponível
					</Text>
				)}
			</VStack>
		</VStack>
	);
}
