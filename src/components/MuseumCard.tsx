"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import {
	Layout,
	LayoutContent,
	LayoutFooter,
	LayoutHeader,
} from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { Museum } from "@/types/Museum";

interface MuseumCardProps {
	museum: Museum;
}

export function MuseumCard({ museum }: MuseumCardProps) {
	return (
		<Card>
			<Layout
				height="auto"
				header={
					<LayoutHeader hasDivider>
						<HStack gap={2} vAlign="start" hAlign="between">
							<Link href={`/${museum.id}`} isStandalone>
								<Heading level={3} maxLines={2}>
									{museum.title}
								</Heading>
							</Link>
							<FavoriteButton type="museum" museumId={museum.id} />
						</HStack>
					</LayoutHeader>
				}
				content={
					<LayoutContent>
						<Text type="supporting" maxLines={4} as="p">
							{museum.description}
						</Text>
					</LayoutContent>
				}
				footer={
					<LayoutFooter hasDivider>
						<Link href={`/${museum.id}`} isStandalone>
							Ver Acervo
						</Link>
					</LayoutFooter>
				}
			/>
		</Card>
	);
}
