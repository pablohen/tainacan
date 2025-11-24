import {
	CardContent,
	CardFooter,
	Card as ShadcnCard,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
	return (
		<div className="mb-4 break-inside-avoid">
			<ShadcnCard className="overflow-hidden rounded-lg border border-gray-200">
				<CardContent className="p-0">
					<div className="relative flex items-start justify-center bg-gray-50">
						{/* Image skeleton */}
						<Skeleton className="h-64 w-full rounded-none" />
					</div>
				</CardContent>

				<CardFooter className="border-gray-100 border-t bg-white px-4 py-3">
					{/* Title skeleton */}
					<Skeleton className="mx-auto h-4 w-3/4" />
				</CardFooter>
			</ShadcnCard>
		</div>
	);
}
