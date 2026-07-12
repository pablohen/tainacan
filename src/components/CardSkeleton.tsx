import { Card } from "@astryxdesign/core/Card";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";

export function CardSkeleton() {
	return (
		<Card padding={0}>
			<Layout
				height="auto"
				content={
					<LayoutContent>
						<Skeleton height={256} width="100%" radius="none" />
					</LayoutContent>
				}
				footer={
					<LayoutFooter hasDivider>
						<VStack hAlign="center">
							<Skeleton height={16} width="75%" radius={2} />
						</VStack>
					</LayoutFooter>
				}
			/>
		</Card>
	);
}
