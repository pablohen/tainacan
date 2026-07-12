"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Layout, LayoutContent, LayoutHeader } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
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

export default function ItemPageClient({
	item,
	museumId,
	museumName,
}: ItemPageProps) {
	const metadata = Object.entries(item?.metadata || {});
	const { title } = item;
	const imgPath = checkImagePath(item);

	return (
		<VStack gap={4} maxWidth={1280}>
			<Link href={`/${museumId}`} isStandalone>
				Voltar para a coleção
			</Link>

			<Card padding={0}>
				<Layout
					height="auto"
					header={
						<LayoutHeader hasDivider>
							<HStack gap={4} vAlign="start" hAlign="between" wrap="wrap">
								<VStack gap={1}>
									<Heading level={1}>Detalhes do Item</Heading>
									<Text type="supporting" as="p">
										{museumName}
									</Text>
									<Text type="body" as="p">
										{title}
									</Text>
								</VStack>
								<FavoriteButton
									type="item"
									item={{
										museumId,
										itemId: item.id,
										title: item.title,
										imageUrl: checkImagePath(item),
									}}
									variant="detail"
								/>
							</HStack>
						</LayoutHeader>
					}
					content={
						<LayoutContent>
							<HStack gap={6} wrap="wrap" vAlign="start">
								<Image
									src={imgPath}
									alt={title}
									width={480}
									height={480}
									style={{
										width: "100%",
										maxWidth: 480,
										height: "auto",
										borderRadius: "var(--radius-container)",
									}}
									unoptimized
								/>
								<VStack gap={3} maxWidth={480} isScrollable height={600}>
									{metadata.length > 0 ? (
										metadata.map((meta) => (
											<ItemMetadata
												key={`ItemMetadata__${meta[0]}`}
												metadata={meta[1]}
											/>
										))
									) : (
										<Text type="supporting" justify="center" as="p">
											Nenhum metadado disponível
										</Text>
									)}
								</VStack>
							</HStack>
						</LayoutContent>
					}
				/>
			</Card>
		</VStack>
	);
}
