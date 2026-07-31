import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { RelatedTheme } from "@/types/themes";

interface RelatedThemesProps {
	themes: RelatedTheme[];
}

export function RelatedThemes({ themes }: RelatedThemesProps) {
	if (themes.length === 0) return null;

	return (
		<Section variant="transparent" padding={0}>
			<VStack gap={3}>
				<Heading level={2}>Related themes</Heading>
				<VStack gap={2}>
					{themes.slice(0, 8).map((theme) => (
						<Section key={theme.key} variant="transparent" padding={0}>
							<VStack gap={0.5}>
								<Link
									href={`/themes/${encodeURIComponent(theme.key)}`}
									isStandalone
								>
									{theme.label}
								</Link>
								<Text type="supporting" as="p">
									Shared across {theme.sharedMuseumTaxonomyCount} museum
									taxonomies
								</Text>
							</VStack>
						</Section>
					))}
				</VStack>
			</VStack>
		</Section>
	);
}
