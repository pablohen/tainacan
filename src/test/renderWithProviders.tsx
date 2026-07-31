import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";

export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
}

export function createQueryClientWrapper(
	queryClient = createTestQueryClient(),
) {
	function QueryClientWrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	return { queryClient, wrapper: QueryClientWrapper };
}

export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	const { queryClient, wrapper } = createQueryClientWrapper();

	return {
		queryClient,
		...render(ui, { ...options, wrapper }),
	};
}
