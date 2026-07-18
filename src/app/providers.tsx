"use client";

import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@/components/ReactQueryDevtools";
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
		<Theme theme={neutralTheme} mode="light">
			<LinkProvider component={Link}>
				<QueryClientProvider client={queryClient}>
					<NuqsAdapter>
						<FavoritesProvider>
							{children}
							<ReactQueryDevtools />
						</FavoritesProvider>
					</NuqsAdapter>
				</QueryClientProvider>
			</LinkProvider>
		</Theme>
	);
}
