"use client";

import { type UseQueryResult, useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	discoverMuseumThemes,
	THEME_DISCOVERY_STALE_TIME,
} from "@/services/themeDiscovery";
import type { MuseumThemeDiscovery, ThemeGraph } from "@/types/themes";
import { museums } from "@/utils/museums";
import { buildThemeGraph } from "@/utils/themes";

const INITIAL_ACTIVE_LIMIT = 4;

export interface ThemeMuseumProgress {
	museumId: string;
	status: "queued" | "loading" | "success" | "error";
}

export interface UseThemeCatalogResult {
	graph: ThemeGraph;
	progress: ThemeMuseumProgress[];
	completedCount: number;
	failedCount: number;
	totalCount: number;
	isInitialLoading: boolean;
	isComplete: boolean;
	refetchFailed: () => Promise<void>;
}

function combineThemeQueries(
	results: UseQueryResult<MuseumThemeDiscovery, Error>[],
) {
	return {
		data: results.map((result) => result.data),
		states: results.map((result) => ({
			fetchStatus: result.fetchStatus,
			isError: result.isError,
			isSuccess: result.isSuccess,
		})),
		refetches: results.map((result) => result.refetch),
		settledCount: results.filter((result) => result.isSuccess || result.isError)
			.length,
	};
}

export function useThemeCatalog(_options?: {
	targetKey?: string;
}): UseThemeCatalogResult {
	const [activeLimit, setActiveLimit] = useState(() =>
		Math.min(INITIAL_ACTIVE_LIMIT, museums.length),
	);
	const combined = useQueries({
		queries: museums.map((museum, index) => ({
			queryKey: ["museum-themes", museum.id] as const,
			queryFn: ({ signal }: { signal: AbortSignal }) =>
				discoverMuseumThemes(museum.id, signal),
			enabled: index < activeLimit,
			staleTime: THEME_DISCOVERY_STALE_TIME,
		})),
		combine: combineThemeQueries,
	});

	useEffect(() => {
		const nextActiveLimit = Math.min(
			museums.length,
			INITIAL_ACTIVE_LIMIT + combined.settledCount,
		);
		setActiveLimit((currentLimit) => Math.max(currentLimit, nextActiveLimit));
	}, [combined.settledCount]);

	const graph = useMemo(
		() =>
			buildThemeGraph(
				combined.data.filter(
					(discovery): discovery is MuseumThemeDiscovery => !!discovery,
				),
			),
		[combined.data],
	);
	const progress = useMemo<ThemeMuseumProgress[]>(
		() =>
			museums.map((museum, index) => {
				const state = combined.states[index];
				let status: ThemeMuseumProgress["status"] = "queued";

				if (state.fetchStatus === "fetching") {
					status = "loading";
				} else if (state.isSuccess) {
					status = "success";
				} else if (state.isError) {
					status = "error";
				}

				return { museumId: museum.id, status };
			}),
		[combined.states],
	);
	const failedCount = useMemo(
		() => combined.states.filter((state) => state.isError).length,
		[combined.states],
	);
	const completedCount = combined.settledCount;
	const totalCount = museums.length;
	const isComplete = completedCount === totalCount;
	const isInitialLoading =
		completedCount === 0 && progress.some(({ status }) => status === "loading");
	const refetchFailed = useCallback(async () => {
		await Promise.all(
			combined.states.flatMap((state, index) =>
				state.isError ? [combined.refetches[index]()] : [],
			),
		);
	}, [combined.refetches, combined.states]);

	return {
		graph,
		progress,
		completedCount,
		failedCount,
		totalCount,
		isInitialLoading,
		isComplete,
		refetchFailed,
	};
}
