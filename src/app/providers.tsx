"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useState } from "react";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>
				<FavoritesProvider>
					{children}
					<ReactQueryDevtools initialIsOpen={false} />
				</FavoritesProvider>
			</NuqsAdapter>
		</QueryClientProvider>
	);
}
