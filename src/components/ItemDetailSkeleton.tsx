import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function ItemDetailSkeleton() {
	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />

			<div className="flex flex-grow flex-col p-4">
				<div className="mx-auto w-full max-w-7xl space-y-4">
					{/* Back button skeleton */}
					<div className="flex items-center justify-between">
						<div className="inline-flex items-center gap-2">
							<ArrowLeft className="h-5 w-5 text-gray-400" />
							<div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
						</div>
					</div>

					{/* Main content skeleton */}
					<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<div className="flex flex-col lg:flex-row-reverse">
							{/* Image skeleton */}
							<div className="flex items-center justify-center bg-gray-50 p-8 lg:w-1/2">
								<div className="h-96 w-full max-w-lg animate-pulse rounded-lg bg-gray-200" />
							</div>

							{/* Details skeleton */}
							<div className="space-y-6 p-8 lg:w-1/2">
								{/* Header skeleton */}
								<div className="space-y-2 border-gray-200 border-b pb-4">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
											<div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
										</div>
										<div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
									</div>
								</div>

								{/* Metadata skeleton */}
								<div className="space-y-4">
									{[...Array(6)].map((_, i) => (
										<div
											key={`metadata-skeleton-${
												// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have unique IDs
												i
											}`}
											className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4"
										>
											<div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
											<div className="h-3 w-full animate-pulse rounded bg-gray-200" />
											<div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
