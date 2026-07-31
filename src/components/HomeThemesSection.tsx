"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useThemeCatalog } from "@/hooks/useThemeCatalog";

const HOME_THEME_LIMIT = 12;

export function HomeThemesSection() {
	const {
		graph,
		completedCount,
		failedCount,
		totalCount,
		isInitialLoading,
		isComplete,
		refetchFailed,
	} = useThemeCatalog();
	const visibleThemes = graph.themes.slice(0, HOME_THEME_LIMIT);
	const hasThemes = visibleThemes.length > 0;
	const isTotalFailure =
		totalCount > 0 && failedCount === totalCount && !hasThemes;

	return (
		<Section variant="transparent" padding={0}>
			<VStack gap={3}>
				<Heading level={2}>Explore by theme</Heading>

				{isInitialLoading ? (
					<VStack gap={2}>
						<Text type="supporting" as="p">
							Discovering themes…
						</Text>
						<HStack gap={2} wrap="wrap">
							<Skeleton width={128} height={24} radius="rounded" />
							<Skeleton width={160} height={24} radius="rounded" index={1} />
							<Skeleton width={112} height={24} radius="rounded" index={2} />
						</HStack>
					</VStack>
				) : null}

				{hasThemes ? (
					<HStack gap={3} wrap="wrap">
						{visibleThemes.map((node) => (
							<Link
								key={node.key}
								href={`/themes/${encodeURIComponent(node.key)}`}
								isStandalone
							>
								{node.label}
							</Link>
						))}
					</HStack>
				) : null}

				{hasThemes && !isComplete ? (
					<Text type="supporting" as="p">
						{completedCount} of {totalCount} museums checked
					</Text>
				) : null}

				{isTotalFailure ? (
					<Banner
						status="error"
						container="section"
						title="Themes are temporarily unavailable."
						endContent={
							<Button
								label="Retry unavailable museums"
								variant="secondary"
								clickAction={refetchFailed}
							/>
						}
					/>
				) : null}

				{failedCount > 0 && !isTotalFailure ? (
					<Banner
						status="warning"
						container="section"
						title={`${failedCount} museums unavailable`}
						endContent={
							<Button
								label="Retry unavailable museums"
								variant="secondary"
								clickAction={refetchFailed}
							/>
						}
					/>
				) : null}

				{isComplete && !hasThemes && !isTotalFailure ? (
					<Text type="supporting" as="p">
						No shared themes were found.
					</Text>
				) : null}
			</VStack>
		</Section>
	);
}
