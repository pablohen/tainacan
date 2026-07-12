"use client";

import { Card as AstryxCard } from "@astryxdesign/core/Card";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import type { TainacanItem as Item } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";
import { FavoriteButton } from "./FavoriteButton";

interface CardProps {
	museumId: string;
	item: Item;
}

export function Card({ museumId, item }: CardProps) {
	const imgPath = checkImagePath(item);
	const cardTitle = `${item.id} - ${item.title}`;

	return (
		<Link href={`/${museumId}/items/${item.id}`} isStandalone>
			<AstryxCard padding={0}>
				<Layout
					height="auto"
					content={
						<LayoutContent>
							<VStack>
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
								<Image
									src={imgPath}
									alt={String(item.id)}
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
							<Text type="label" maxLines={1} justify="center" as="p">
								{cardTitle}
							</Text>
						</LayoutFooter>
					}
				/>
			</AstryxCard>
		</Link>
	);
}
