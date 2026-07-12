import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Layout, LayoutContent, LayoutHeader } from "@astryxdesign/core/Layout";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";

export function ItemDetailSkeleton() {
	return (
		<VStack gap={4}>
			<HStack gap={2} vAlign="center">
				<Icon icon="chevronLeft" color="secondary" />
				<Skeleton height={20} width={160} radius={2} />
			</HStack>

			<Card padding={0}>
				<Layout
					height="auto"
					header={
						<LayoutHeader hasDivider>
							<HStack gap={4} vAlign="start" hAlign="between">
								<VStack gap={2}>
									<Skeleton height={32} width={192} radius={2} />
									<Skeleton height={16} width={128} radius={2} />
								</VStack>
								<Skeleton height={40} width={40} radius="rounded" />
							</HStack>
						</LayoutHeader>
					}
					content={
						<LayoutContent>
							<HStack gap={4} wrap="wrap" vAlign="start">
								<Skeleton height={384} width={320} radius={3} />
								<VStack gap={3}>
									{[0, 1, 2, 3, 4, 5].map((i) => (
										<Skeleton
											key={i}
											height={72}
											width={280}
											radius={3}
											index={i}
										/>
									))}
								</VStack>
							</HStack>
						</LayoutContent>
					}
				/>
			</Card>
		</VStack>
	);
}
