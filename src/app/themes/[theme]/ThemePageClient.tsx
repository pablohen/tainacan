"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Link } from "@astryxdesign/core/Link";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { RelatedThemes } from "@/components/RelatedThemes";
import { ThemeMuseumSection } from "@/components/ThemeMuseumSection";
import { useThemeCatalog } from "@/hooks/useThemeCatalog";
import { useThemeMuseumItems } from "@/hooks/useThemeMuseumItems";
import type { ThemeNode } from "@/types/themes";
import { findTheme, getRelatedThemes } from "@/utils/themes";

interface ThemePageClientProps {
	themeKey: string;
}

interface DiscoveryProgressProps {
	node: ThemeNode | null;
	completedCount: number;
	failedCount: number;
	totalCount: number;
}

function DiscoveryProgress({
	node,
	completedCount,
	failedCount,
	totalCount,
}: DiscoveryProgressProps) {
	return (
		<VStack gap={2} maxWidth={672}>
			<ProgressBar
				label="Museum theme discovery progress"
				value={completedCount}
				max={Math.max(totalCount, 1)}
				isLabelHidden
			/>
			<Text type="supporting" as="p">
				Known institutions: {node?.museumCount ?? 0}
			</Text>
			<Text type="supporting" as="p">
				Institutions checked: {completedCount} of {totalCount}
			</Text>
			<Text type="supporting" as="p">
				Unavailable institutions: {failedCount}
			</Text>
		</VStack>
	);
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
	const resultsByMuseum = new Map(
		museumItemResults.map((result) => [result.museumId, result]),
	);
	const occurrencesByMuseum = new Map<
		string,
		NonNullable<typeof node>["occurrences"]
	>();

	for (const occurrence of node?.occurrences ?? []) {
		const occurrences = occurrencesByMuseum.get(occurrence.museumId) ?? [];
		occurrences.push(occurrence);
		occurrencesByMuseum.set(occurrence.museumId, occurrences);
	}

	if (!node && isComplete) {
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
				<DiscoveryProgress
					node={node}
					completedCount={completedCount}
					failedCount={failedCount}
					totalCount={totalCount}
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
				<DiscoveryProgress
					node={node}
					completedCount={completedCount}
					failedCount={failedCount}
					totalCount={totalCount}
				/>
			</VStack>

			{failedCount > 0 ? (
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
			) : null}

			{[...occurrencesByMuseum.entries()].map(([museumId, occurrences]) => {
				const result = resultsByMuseum.get(museumId);
				if (!result) return null;

				return (
					<ThemeMuseumSection
						key={museumId}
						result={result}
						occurrences={occurrences}
					/>
				);
			})}

			<RelatedThemes themes={relatedThemes} />
		</VStack>
	);
}
