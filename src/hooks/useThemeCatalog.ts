"use client";

import {
	type QueryClient,
	type UseQueryResult,
	useQueries,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	discoverMuseumThemes,
	THEME_DISCOVERY_STALE_TIME,
} from "@/services/themeDiscovery";
import type { MuseumThemeDiscovery, ThemeGraph } from "@/types/themes";
import { museums } from "@/utils/museums";
import { buildThemeGraph } from "@/utils/themes";

const INITIAL_ACTIVE_LIMIT = 4;
const museumIndexById = new Map(
	museums.map((museum, index) => [museum.id, index]),
);

interface ThemeDiscoverySchedule {
	activeMuseumIds: string[];
	completedMuseumIds: string[];
}

interface QueuedDiscoveryRequest {
	task: () => Promise<MuseumThemeDiscovery>;
	resolve: (value: MuseumThemeDiscovery) => void;
	reject: (reason: unknown) => void;
	signal: AbortSignal;
	started: boolean;
	cancelled: boolean;
	onAbort: () => void;
}

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
	};
}

function hasFreshDiscovery(queryClient: QueryClient, museumId: string) {
	const state = queryClient.getQueryState<MuseumThemeDiscovery>([
		"museum-themes",
		museumId,
	]);

	return (
		state?.status === "success" &&
		!state.isInvalidated &&
		state.dataUpdatedAt + THEME_DISCOVERY_STALE_TIME > Date.now()
	);
}

function createInitialSchedule(
	queryClient: QueryClient,
): ThemeDiscoverySchedule {
	const completedMuseumIds = museums
		.filter((museum) => hasFreshDiscovery(queryClient, museum.id))
		.map((museum) => museum.id);
	const completedMuseumIdSet = new Set(completedMuseumIds);
	const activeMuseumIds = museums
		.filter((museum) => !completedMuseumIdSet.has(museum.id))
		.slice(0, INITIAL_ACTIVE_LIMIT)
		.map((museum) => museum.id);

	return { activeMuseumIds, completedMuseumIds };
}

async function runWithConcurrency(
	tasks: (() => Promise<unknown>)[],
	limit: number,
) {
	let nextTaskIndex = 0;

	async function runWorker() {
		while (nextTaskIndex < tasks.length) {
			const taskIndex = nextTaskIndex;
			nextTaskIndex += 1;
			await tasks[taskIndex]();
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(limit, tasks.length) }, () => runWorker()),
	);
}

function abortReason(signal: AbortSignal) {
	return (
		signal.reason ??
		new DOMException("The operation was aborted.", "AbortError")
	);
}

function createDiscoveryRequestQueue(limit: number) {
	let activeCount = 0;
	const queuedRequests: QueuedDiscoveryRequest[] = [];

	function drainQueue() {
		while (activeCount < limit && queuedRequests.length > 0) {
			const request = queuedRequests.shift();
			if (!request || request.cancelled) continue;

			request.started = true;
			request.signal.removeEventListener("abort", request.onAbort);
			activeCount += 1;
			void Promise.resolve()
				.then(request.task)
				.then(request.resolve, request.reject)
				.finally(() => {
					activeCount -= 1;
					drainQueue();
				});
		}
	}

	return (task: () => Promise<MuseumThemeDiscovery>, signal: AbortSignal) =>
		new Promise<MuseumThemeDiscovery>((resolve, reject) => {
			if (signal.aborted) {
				reject(abortReason(signal));
				return;
			}

			const request: QueuedDiscoveryRequest = {
				task,
				resolve,
				reject,
				signal,
				started: false,
				cancelled: false,
				onAbort: () => undefined,
			};
			request.onAbort = () => {
				if (request.started) return;
				request.cancelled = true;
				reject(abortReason(signal));
				drainQueue();
			};
			signal.addEventListener("abort", request.onAbort, { once: true });
			queuedRequests.push(request);
			drainQueue();
		});
}

export function useThemeCatalog(_options?: {
	targetKey?: string;
}): UseThemeCatalogResult {
	const queryClient = useQueryClient();
	const [schedule, setSchedule] = useState(() =>
		createInitialSchedule(queryClient),
	);
	const startedMuseumIds = useRef(new Set<string>());
	const discoveryRequestQueue = useRef<
		ReturnType<typeof createDiscoveryRequestQueue> | undefined
	>(undefined);
	if (!discoveryRequestQueue.current) {
		discoveryRequestQueue.current =
			createDiscoveryRequestQueue(INITIAL_ACTIVE_LIMIT);
	}
	const runDiscoveryRequest = discoveryRequestQueue.current;
	const activeMuseumIdSet = useMemo(
		() => new Set(schedule.activeMuseumIds),
		[schedule.activeMuseumIds],
	);
	const completedMuseumIdSet = useMemo(
		() => new Set(schedule.completedMuseumIds),
		[schedule.completedMuseumIds],
	);
	const combined = useQueries({
		queries: museums.map((museum) => ({
			queryKey: ["museum-themes", museum.id] as const,
			queryFn: ({ signal }: { signal: AbortSignal }) => {
				startedMuseumIds.current.add(museum.id);
				return runDiscoveryRequest(
					() => discoverMuseumThemes(museum.id, signal),
					signal,
				);
			},
			enabled: activeMuseumIdSet.has(museum.id),
			staleTime: THEME_DISCOVERY_STALE_TIME,
		})),
		combine: combineThemeQueries,
	});

	useEffect(() => {
		const settledMuseumIds = schedule.activeMuseumIds.filter((museumId) => {
			const index = museumIndexById.get(museumId);
			if (index === undefined) return false;
			const state = combined.states[index];

			return (
				startedMuseumIds.current.has(museumId) &&
				state?.fetchStatus === "idle" &&
				(state.isSuccess || state.isError)
			);
		});

		if (settledMuseumIds.length === 0) {
			return;
		}

		for (const museumId of settledMuseumIds) {
			startedMuseumIds.current.delete(museumId);
		}

		const settledMuseumIdSet = new Set(settledMuseumIds);
		setSchedule((currentSchedule) => {
			const actuallySettledMuseumIds = currentSchedule.activeMuseumIds.filter(
				(museumId) => settledMuseumIdSet.has(museumId),
			);
			if (actuallySettledMuseumIds.length === 0) {
				return currentSchedule;
			}

			const completedMuseumIds = [
				...currentSchedule.completedMuseumIds,
				...actuallySettledMuseumIds,
			];
			const completedMuseumIdsSet = new Set(completedMuseumIds);
			const activeMuseumIds = currentSchedule.activeMuseumIds.filter(
				(museumId) => !settledMuseumIdSet.has(museumId),
			);
			const activeMuseumIdsSet = new Set(activeMuseumIds);

			for (const museum of museums) {
				if (activeMuseumIds.length >= INITIAL_ACTIVE_LIMIT) {
					break;
				}
				if (
					!completedMuseumIdsSet.has(museum.id) &&
					!activeMuseumIdsSet.has(museum.id)
				) {
					activeMuseumIds.push(museum.id);
					activeMuseumIdsSet.add(museum.id);
				}
			}

			return { activeMuseumIds, completedMuseumIds };
		});
	}, [combined.states, schedule.activeMuseumIds]);

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

				if (
					activeMuseumIdSet.has(museum.id) ||
					state.fetchStatus === "fetching"
				) {
					status = "loading";
				} else if (completedMuseumIdSet.has(museum.id) && state.isError) {
					status = "error";
				} else if (completedMuseumIdSet.has(museum.id)) {
					status = "success";
				}

				return { museumId: museum.id, status };
			}),
		[activeMuseumIdSet, combined.states, completedMuseumIdSet],
	);
	const failedCount = useMemo(
		() =>
			museums.filter(
				(museum, index) =>
					completedMuseumIdSet.has(museum.id) && combined.states[index].isError,
			).length,
		[combined.states, completedMuseumIdSet],
	);
	const completedCount = schedule.completedMuseumIds.length;
	const totalCount = museums.length;
	const isComplete =
		completedCount === totalCount &&
		combined.states.every(({ fetchStatus }) => fetchStatus === "idle");
	const isInitialLoading =
		completedCount === 0 && progress.some(({ status }) => status === "loading");
	const refetchFailed = useCallback(async () => {
		await runWithConcurrency(
			combined.states.flatMap((state, index) =>
				state.isError && completedMuseumIdSet.has(museums[index].id)
					? [combined.refetches[index]]
					: [],
			),
			INITIAL_ACTIVE_LIMIT,
		);
	}, [combined.refetches, combined.states, completedMuseumIdSet]);

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
