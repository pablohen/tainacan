"use client";

import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { MediaTheme } from "@astryxdesign/core/theme";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import { FavoriteButton } from "./FavoriteButton";

interface CardProps {
	museumId: string;
	itemId: number;
	title: string;
	imageUrl: string;
	subtitle?: string;
}

export function Card({
	museumId,
	itemId,
	title,
	imageUrl,
	subtitle,
}: CardProps) {
	return (
		<ClickableCard
			href={`/${museumId}/items/${itemId}`}
			label={title}
			padding={0}
			className="item-card"
		>
			<Image
				src={imageUrl}
				alt={title}
				width={400}
				height={400}
				style={{
					width: "100%",
					height: "auto",
					display: "block",
					objectFit: "contain",
					objectPosition: "top",
				}}
				unoptimized
			/>
			{/* Absolute chrome — not Astryx Overlay. Overlay sets data-pressable-container
			    which makes ClickableCard treat every click as nested interactive. */}
			<Section
				variant="transparent"
				padding={2}
				className="item-card__favorite"
			>
				<MediaTheme mode="dark">
					<FavoriteButton
						type="item"
						item={{
							museumId,
							itemId,
							title,
							imageUrl,
						}}
						variant="card"
					/>
				</MediaTheme>
			</Section>
			<Section variant="transparent" padding={3} className="item-card__meta">
				<MediaTheme mode="dark">
					<VStack gap={0.5}>
						<Text type="label" maxLines={2} color="inherit" as="p">
							{title}
						</Text>
						{subtitle ? (
							<Text type="supporting" maxLines={1} color="inherit" as="p">
								{subtitle}
							</Text>
						) : null}
						<Text type="supporting" maxLines={1} color="inherit" as="p">
							{String(itemId)}
						</Text>
					</VStack>
				</MediaTheme>
			</Section>
		</ClickableCard>
	);
}
