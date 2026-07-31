"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchThemeMuseumItems } from "@/services/themeItems";
import type { FormattedItemsRes } from "@/types/tainacan";
import type { ThemeNode, ThemeOccurrence } from "@/types/themes";

export interface ThemeMuseumItemsResult {
	museumId: string;
	data: FormattedItemsRes | undefined;
	isPending: boolean;
	isError: boolean;
	error: Error | null;
	refetch: () => Promise<unknown>;
}

export function useThemeMuseumItems(
	node: ThemeNode | null,
): ThemeMuseumItemsResult[] {
	const museumOccurrences = useMemo(() => {
		const grouped = new Map<string, ThemeOccurrence[]>();
		for (const occurrence of node?.occurrences ?? []) {
			const occurrences = grouped.get(occurrence.museumId) ?? [];
			occurrences.push(occurrence);
			grouped.set(occurrence.museumId, occurrences);
		}
		return [...grouped.entries()];
	}, [node]);

	const results = useQueries({
		queries: museumOccurrences.map(([museumId, occurrences]) => ({
			queryKey: ["theme-museum-items", node?.key, museumId] as const,
			queryFn: ({ signal }: { signal: AbortSignal }) =>
				fetchThemeMuseumItems(museumId, occurrences, signal),
		})),
	});

	return results.map((result, index) => ({
		museumId: museumOccurrences[index]?.[0] ?? "",
		data: result.data,
		isPending: result.isPending,
		isError: result.isError,
		error: result.error,
		refetch: result.refetch,
	}));
}
