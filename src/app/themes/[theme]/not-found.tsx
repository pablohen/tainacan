import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { Link } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/VStack";

export default function NotFound() {
	return (
		<Center minHeight={320}>
			<VStack gap={4} maxWidth={448} hAlign="center">
				<Banner status="warning" title="Theme not found" container="card" />
				<Link href="/" isStandalone>
					Back to home
				</Link>
			</VStack>
		</Center>
	);
}
