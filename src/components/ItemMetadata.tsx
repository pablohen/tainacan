import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { TainacanMetadatum as Metadata } from "../types/tainacan";

interface ItemMetadataProps {
	metadata: Metadata;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
	if (!metadata.value_as_string) {
		return null;
	}
	return (
		<VStack gap={1}>
			<Heading level={4}>{metadata.name}</Heading>
			<Text type="body" as="p">
				{metadata.value_as_string}
			</Text>
		</VStack>
	);
}
