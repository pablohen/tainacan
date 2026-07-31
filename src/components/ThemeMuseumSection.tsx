"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Heading } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Card } from "@/components/Card";
import { CardSkeleton } from "@/components/CardSkeleton";
import { ItemMasonry } from "@/components/ItemMasonry";
import { MuseumQueryErrorBanner } from "@/components/MuseumPageStates";
import type { ThemeMuseumItemsResult } from "@/hooks/useThemeMuseumItems";
import type { ThemeOccurrence } from "@/types/themes";
import { checkImagePath } from "@/utils/checkImagePath";
import { getMuseumById } from "@/utils/museums";
import type { FiltersState } from "@/utils/tainacanFilters";

interface ThemeMuseumSectionProps {
	result: ThemeMuseumItemsResult;
	occurrences: ThemeOccurrence[];
}

function firstOccurrence(
	occurrences: ThemeOccurrence[],
): ThemeOccurrence | undefined {
	let first: ThemeOccurrence | undefined;
	for (const occurrence of occurrences) {
		if (
			!first ||
			occurrence.taxonomyId < first.taxonomyId ||
			(occurrence.taxonomyId === first.taxonomyId &&
				occurrence.termId < first.termId)
		) {
			first = occurrence;
		}
	}
	return first;
}

function getViewAllHref(
	museumId: string,
	occurrences: ThemeOccurrence[],
): string | null {
	const occurrence = firstOccurrence(occurrences);
	if (!occurrence) return null;

	const filters = {
		[String(occurrence.filterId)]: [String(occurrence.termId)],
	} satisfies FiltersState;
	const searchParams = new URLSearchParams();
	searchParams.set("filters", JSON.stringify(filters));
	return `/${museumId}?${searchParams.toString()}`;
}

export function ThemeMuseumSection({
	result,
	occurrences,
}: ThemeMuseumSectionProps) {
	const museumTitle = getMuseumById(result.museumId)?.title ?? result.museumId;
	const headingId = `theme-museum-${result.museumId}`;
	const items = result.data?.items ?? [];
	const viewAllHref = getViewAllHref(result.museumId, occurrences);

	return (
		<Section
			variant="transparent"
			padding={0}
			width="100%"
			role="region"
			aria-labelledby={headingId}
		>
			<VStack gap={4}>
				<HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
					<Heading id={headingId} level={2}>
						{museumTitle}
					</Heading>
					{items.length > 0 && viewAllHref ? (
						<Link href={viewAllHref} isStandalone>
							View all
						</Link>
					) : null}
				</HStack>

				{result.isPending ? (
					<ItemMasonry>
						{Array.from({ length: 8 }, (_, index) => (
							<CardSkeleton
								key={
									// biome-ignore lint/suspicious/noArrayIndexKey: loading placeholders have no stable identity
									index
								}
							/>
						))}
					</ItemMasonry>
				) : result.isError ? (
					<MuseumQueryErrorBanner
						title="This museum is temporarily unavailable."
						description="Try again to load this museum's items."
						retryLabel="Retry museum"
						onRetry={() => {
							void result.refetch();
						}}
					/>
				) : items.length > 0 ? (
					<ItemMasonry>
						{items.map((item) => (
							<Card
								key={item.id}
								museumId={result.museumId}
								itemId={item.id}
								title={item.title}
								imageUrl={checkImagePath(item)}
							/>
						))}
					</ItemMasonry>
				) : (
					<Banner
						status="info"
						container="section"
						title="No items found for this theme."
					/>
				)}
			</VStack>
		</Section>
	);
}
