import { Center } from "@astryxdesign/core/Center";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export default function Loading() {
	return (
		<Center minHeight={320}>
			<VStack gap={3} maxWidth={448} width="100%">
				<Text type="body" as="p">
					Finding themes…
				</Text>
				<ProgressBar label="Finding themes" isIndeterminate isLabelHidden />
			</VStack>
		</Center>
	);
}
