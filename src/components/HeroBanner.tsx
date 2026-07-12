import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { FavoriteButton } from "@/components/FavoriteButton";

interface HeroBannerProps {
	title: string;
	link?: string;
	description: string;
	museumId?: string;
}

export function HeroBanner({
	title = "Lorem ipsum",
	link = "#",
	description = "",
	museumId,
}: HeroBannerProps) {
	return (
		<VStack gap={2} padding={4} paddingBlock={6}>
			<HStack gap={2} vAlign="center" wrap="wrap">
				<Heading level={1}>{title}</Heading>
				{museumId ? <FavoriteButton type="museum" museumId={museumId} /> : null}
			</HStack>

			{description ? (
				<Text type="large" color="secondary" as="p" maxLines={6}>
					{description}
				</Text>
			) : null}

			{link !== "#" ? (
				<Link href={link} isExternalLink isStandalone>
					<Button label="Ir para o site" variant="primary" />
				</Link>
			) : null}
		</VStack>
	);
}
