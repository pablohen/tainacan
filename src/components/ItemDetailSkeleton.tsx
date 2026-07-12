import { Section } from "@astryxdesign/core/Section";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";

export function ItemDetailSkeleton() {
	return (
		<VStack gap={4} maxWidth={1280}>
			<Skeleton height={20} width={180} radius={2} />

			<Section variant="transparent" padding={0} className="item-detail">
				<Skeleton height={360} width="100%" radius={0} />
			</Section>

			<VStack gap={3}>
				<Skeleton height={64} width="100%" radius={2} />
				{[0, 1, 2, 3].map((i) => (
					<VStack key={i} gap={1}>
						<Skeleton height={16} width={120} radius={2} index={i} />
						<Skeleton height={20} width="80%" radius={2} index={i} />
					</VStack>
				))}
			</VStack>
		</VStack>
	);
}
