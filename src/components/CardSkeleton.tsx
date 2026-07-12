import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";

export function CardSkeleton() {
	return (
		<Card padding={0}>
			<Skeleton height={256} width="100%" radius="none" />
		</Card>
	);
}
