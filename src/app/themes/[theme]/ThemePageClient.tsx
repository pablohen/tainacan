"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Link } from "@astryxdesign/core/Link";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useEffect, useMemo, useState } from "react";
import { RelatedThemes } from "@/components/RelatedThemes";
import { ThemeMuseumSection } from "@/components/ThemeMuseumSection";
import { useThemeCatalog } from "@/hooks/useThemeCatalog";
import {
	type ThemeMuseumItemsResult,
	useThemeMuseumItems,
} from "@/hooks/useThemeMuseumItems";
import type { ThemeNode } from "@/types/themes";
import { findTheme, getRelatedThemes } from "@/utils/themes";

interface ThemePageClientProps {
	themeKey: string;
}

interface GlobalDiscoveryProgressProps {
	completedCount: number;
	failedCount: number;
	totalCount: number;
}

function GlobalDiscoveryProgress({
	completedCount,
	failedCount,
	totalCount,
}: GlobalDiscoveryProgressProps) {
	return (
		<VStack gap={2} maxWidth={672}>
			<Text type="label" as="p">
				Global theme discovery
			</Text>
			<ProgressBar
				label="Global theme discovery progress"
				value={completedCount}
				max={Math.max(totalCount, 1)}
				isLabelHidden
			/>
			<Text type="supporting" as="p">
				Museums checked globally: {completedCount} of {totalCount}
			</Text>
			<Text type="supporting" as="p">
				Museums unavailable globally: {failedCount}
			</Text>
		</VStack>
	);
}

function FederatedResultsProgress({
	results,
}: {
	results: ThemeMuseumItemsResult[];
}) {
	const knownCount = results.length;
	let completedCount = 0;
	let unavailableCount = 0;
	for (const result of results) {
		if (!result.isPending) completedCount += 1;
		if (result.isError) unavailableCount += 1;
	}

	return (
		<VStack gap={2} maxWidth={672}>
			<Text type="label" as="p">
				Federated theme results
			</Text>
			<ProgressBar
				label="Federated theme results progress"
				value={completedCount}
				max={Math.max(knownCount, 1)}
				isLabelHidden
			/>
			<Text type="supporting" as="p">
				Known institutions: {knownCount}
			</Text>
			<Text type="supporting" as="p">
				Completed institutions: {completedCount} of {knownCount}
			</Text>
			<Text type="supporting" as="p">
				Unavailable institutions: {unavailableCount}
			</Text>
		</VStack>
	);
}

function DiscoveryWarning({
	failedCount,
	refetchFailed,
}: {
	failedCount: number;
	refetchFailed: () => Promise<void>;
}) {
	if (failedCount === 0) return null;

	return (
		<Banner
			status="warning"
			container="section"
			title="Theme discovery is incomplete."
			description="Some museums could not be checked, but available results remain visible."
			endContent={
				<Button
					label="Retry unavailable museums"
					variant="secondary"
					clickAction={refetchFailed}
				/>
			}
		/>
	);
}

function StableMuseumSections({
	node,
	results,
}: {
	node: ThemeNode;
	results: ThemeMuseumItemsResult[];
}) {
	const resultsByMuseum = useMemo(
		() => new Map(results.map((result) => [result.museumId, result])),
		[results],
	);
	const occurrencesByMuseum = useMemo(() => {
		const grouped = new Map<string, ThemeNode["occurrences"]>();

		for (const occurrence of node.occurrences) {
			const occurrences = grouped.get(occurrence.museumId) ?? [];
			occurrences.push(occurrence);
			grouped.set(occurrence.museumId, occurrences);
		}

		return grouped;
	}, [node]);
	const observedMuseumIds = useMemo(
		() => [...occurrencesByMuseum.keys()],
		[occurrencesByMuseum],
	);
	const [museumOrder, setMuseumOrder] = useState(observedMuseumIds);

	useEffect(() => {
		setMuseumOrder((currentOrder) => {
			const knownMuseumIds = new Set(currentOrder);
			const appendedMuseumIds = observedMuseumIds.filter(
				(museumId) => !knownMuseumIds.has(museumId),
			);

			return appendedMuseumIds.length > 0
				? [...currentOrder, ...appendedMuseumIds]
				: currentOrder;
		});
	}, [observedMuseumIds]);

	return museumOrder.map((museumId) => {
		const occurrences = occurrencesByMuseum.get(museumId);
		const result = resultsByMuseum.get(museumId);
		if (!occurrences || !result) return null;

		return (
			<ThemeMuseumSection
				key={museumId}
				result={result}
				occurrences={occurrences}
			/>
		);
	});
}

export function ThemePageClient({ themeKey }: ThemePageClientProps) {
	const {
		graph,
		completedCount,
		failedCount,
		totalCount,
		isComplete,
		refetchFailed,
	} = useThemeCatalog({ targetKey: themeKey });
	const node = findTheme(graph, themeKey);
	const museumItemResults = useThemeMuseumItems(node);
	const relatedThemes = getRelatedThemes(graph, themeKey);

	if (!node && isComplete && failedCount === 0) {
		return (
			<Center minHeight={320}>
				<VStack gap={4} maxWidth={448} hAlign="center">
					<Banner status="warning" title="Theme not found" container="card" />
					<Link href="/" isStandalone>
						Back to home
					</Link>
				</VStack>
			</Center>
		);
	}

	if (!node) {
		return (
			<VStack gap={4}>
				<Heading level={1}>Finding this theme across museums…</Heading>
				<GlobalDiscoveryProgress
					completedCount={completedCount}
					failedCount={failedCount}
					totalCount={totalCount}
				/>
				<DiscoveryWarning
					failedCount={failedCount}
					refetchFailed={refetchFailed}
				/>
			</VStack>
		);
	}

	return (
		<VStack gap={6}>
			<VStack gap={2} maxWidth={672}>
				<Heading level={1}>{node.label}</Heading>
				<Text type="body" as="p">
					This theme groups matching taxonomy terms from participating museum
					collections.
				</Text>
				<FederatedResultsProgress results={museumItemResults} />
				<GlobalDiscoveryProgress
					completedCount={completedCount}
					failedCount={failedCount}
					totalCount={totalCount}
				/>
			</VStack>

			<DiscoveryWarning
				failedCount={failedCount}
				refetchFailed={refetchFailed}
			/>

			<StableMuseumSections
				key={node.key}
				node={node}
				results={museumItemResults}
			/>

			<RelatedThemes themes={relatedThemes} />
		</VStack>
	);
}
