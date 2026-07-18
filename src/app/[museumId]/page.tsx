"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { HStack } from "@astryxdesign/core/HStack";
import { Pagination } from "@astryxdesign/core/Pagination";
import { VStack } from "@astryxdesign/core/VStack";
import {
	parseAsInteger,
	parseAsJson,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { type ChangeEvent, Suspense, use, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Card } from "@/components/Card";
import { CardSkeleton } from "@/components/CardSkeleton";
import { CollectionTabs } from "@/components/CollectionTabs";
import { HeroBanner } from "@/components/HeroBanner";
import { ItemMasonry } from "@/components/ItemMasonry";
import {
	ItemResultsTable,
	ItemResultsTableSkeleton,
} from "@/components/ItemResultsTable";
import { ItemSortSelector } from "@/components/ItemSortSelector";
import { ItemViewModeSelector } from "@/components/ItemViewModeSelector";
import { MuseumActiveStateBar } from "@/components/MuseumActiveStateBar";
import { MuseumFiltersPanel } from "@/components/MuseumFiltersPanel";
import { SearchBar } from "@/components/SearchBar";
import { useActiveTaxonomyTermLabels } from "@/hooks/useActiveTaxonomyTermLabels";
import { useListCollections } from "@/services/generated/collections/collections";
import {
	useListCollectionFilters,
	useListFilters,
} from "@/services/generated/filters/filters";
import {
	useListCollectionItems,
	useListItems,
} from "@/services/generated/items/items";
import type { ListItemsParams } from "@/services/generated/tainacanV2.schemas";
import { formatItemsResponse } from "@/services/tainacanMutator";
import type {
	FormattedItemsRes,
	TainacanCollection,
	TainacanFilter,
} from "@/types/tainacan";
import {
	buildActiveStateChips,
	parseFacetChipId,
	removeFacetFromFilters,
} from "@/utils/activeStateChips";
import { checkImagePath } from "@/utils/checkImagePath";
import { ITEM_SORT_VALUES, sortToQueryParams } from "@/utils/itemSort";
import { ITEM_VIEW_VALUES, toItemViewMode } from "@/utils/itemView";
import { getMuseumById } from "@/utils/museums";
import {
	buildFilterQueryParams,
	countActiveFilters,
	FiltersStateSchema,
	sanitizeFiltersState,
} from "@/utils/tainacanFilters";

interface MuseumPageProps {
	params: Promise<{
		museumId: string;
	}>;
}

function MuseumContent({ museumId }: { museumId: string }) {
	const [{ search, page, collection, filters, sort, view }, setQueryStates] =
		useQueryStates({
			search: parseAsString.withDefault(""),
			page: parseAsInteger.withDefault(1),
			collection: parseAsInteger,
			filters: parseAsJson((value) => {
				const parsed = FiltersStateSchema.safeParse(value);
				return parsed.success ? parsed.data : null;
			}),
			sort: parseAsStringLiteral(ITEM_SORT_VALUES),
			view: parseAsStringLiteral(ITEM_VIEW_VALUES),
		});

	const viewMode = toItemViewMode(view);
	const [searchInput, setSearchInput] = useState(search);
	const [debouncedSearch] = useDebounce(searchInput, 500);

	useEffect(() => {
		if (debouncedSearch !== search) {
			setQueryStates({
				search: debouncedSearch || null,
				page: 1,
			});
		}
	}, [debouncedSearch, search, setQueryStates]);

	const {
		data: collections = [],
		isLoading: isCollectionsLoading,
		isError: isCollectionsError,
		isSuccess: isCollectionsSuccess,
	} = useListCollections<TainacanCollection[]>(undefined, {
		request: { museumId },
		query: {
			queryKey: ["museum-collections", museumId],
			enabled: Boolean(museumId),
			select: (response) => response.data as TainacanCollection[],
		},
	});

	useEffect(() => {
		if (!isCollectionsSuccess) return;
		if (collection === null) return;
		const exists = collections.some((c) => c.id === collection);
		if (!exists) {
			setQueryStates({ collection: null });
		}
	}, [collection, collections, isCollectionsSuccess, setQueryStates]);

	const museumFilterDefs = useListFilters<TainacanFilter[]>(undefined, {
		request: { museumId },
		query: {
			queryKey: ["museum-filters", museumId, null],
			enabled: Boolean(museumId) && collection === null,
			select: (response) => response.data as TainacanFilter[],
		},
	});

	const collectionFilterDefs = useListCollectionFilters<TainacanFilter[]>(
		collection ?? 0,
		undefined,
		{
			request: { museumId },
			query: {
				queryKey: ["museum-filters", museumId, collection ?? null],
				enabled: Boolean(museumId) && collection !== null,
				select: (response) => response.data as TainacanFilter[],
			},
		},
	);

	const {
		data: filterDefs = [],
		isLoading: isFiltersLoading,
		isError: isFiltersError,
		isSuccess: isFiltersSuccess,
	} = collection === null ? museumFilterDefs : collectionFilterDefs;

	useEffect(() => {
		if (!isFiltersSuccess) return;
		const sanitized = sanitizeFiltersState(filters, filterDefs);
		const currentJson = JSON.stringify(filters ?? null);
		const nextJson = JSON.stringify(sanitized);
		if (currentJson !== nextJson) {
			setQueryStates({ filters: sanitized });
		}
	}, [filters, filterDefs, isFiltersSuccess, setQueryStates]);

	const filterParams = buildFilterQueryParams(filters, filterDefs);
	const sortParams = sortToQueryParams(sort);
	const hasActiveFilters = countActiveFilters(filters) > 0;
	const filtersReadyForItems =
		!hasActiveFilters || isFiltersSuccess || isFiltersError;

	const itemParams = {
		perpage: 50,
		paged: page,
		...filterParams,
		...(search.trim() ? { search: search.trim() } : {}),
		...(sortParams
			? { orderby: sortParams.orderby, order: sortParams.order }
			: {}),
	} as ListItemsParams;

	const museumItemsQuery = useListItems<FormattedItemsRes>(itemParams, {
		request: { museumId },
		query: {
			queryKey: [
				"museum-items",
				museumId,
				page,
				search,
				null,
				filterParams ?? null,
				sortParams ?? null,
			],
			enabled: Boolean(museumId) && filtersReadyForItems && collection === null,
			select: formatItemsResponse,
		},
	});

	const collectionItemsQuery = useListCollectionItems<FormattedItemsRes>(
		String(collection ?? 0),
		itemParams,
		{
			request: { museumId },
			query: {
				queryKey: [
					"museum-items",
					museumId,
					page,
					search,
					collection,
					filterParams ?? null,
					sortParams ?? null,
				],
				enabled:
					Boolean(museumId) && filtersReadyForItems && collection !== null,
				select: formatItemsResponse,
			},
		},
	);

	const { data, isLoading, isPending, error, isError } =
		collection === null ? museumItemsQuery : collectionItemsQuery;

	const items = data?.items ?? [];
	const totalPages = data?.wpTotalPages ?? 1;
	const showItemsLoading = isLoading || isPending;

	const museum = getMuseumById(museumId);
	const termLabels = useActiveTaxonomyTermLabels(museumId, filterDefs, filters);
	const activeChips = buildActiveStateChips({
		search,
		collectionId: collection,
		collections,
		filters,
		filterDefs,
		sort,
		termLabels,
	});

	const handleRemoveChip = (id: string) => {
		if (id === "search") {
			setSearchInput("");
			setQueryStates({ search: null, page: 1 });
			return;
		}
		if (id === "collection") {
			setQueryStates({ collection: null, page: 1 });
			return;
		}
		if (id === "sort") {
			setQueryStates({ sort: null, page: 1 });
			return;
		}
		const facet = parseFacetChipId(id);
		if (facet) {
			setQueryStates({
				filters: removeFacetFromFilters(filters, facet.filterId, facet.termId),
				page: 1,
			});
		}
	};

	const handleClearAll = () => {
		setSearchInput("");
		setQueryStates({
			search: null,
			collection: null,
			filters: null,
			sort: null,
			page: 1,
		});
	};

	if (!museum) {
		return (
			<Center minHeight={240}>
				<Banner
					status="error"
					title="Museu não encontrado"
					description="O museu que você está procurando não existe."
					container="card"
				/>
			</Center>
		);
	}

	const { title, link, description } = museum;

	return (
		<VStack gap={4}>
			<HeroBanner
				title={title}
				link={link}
				description={description}
				museumId={museumId}
			/>

			{!isCollectionsError ? (
				<CollectionTabs
					collections={collections}
					isLoading={isCollectionsLoading}
					value={collection === null ? "all" : String(collection)}
					onChange={(next) => {
						setQueryStates({
							collection: next === "all" ? null : Number(next),
							page: 1,
							filters: null,
						});
					}}
				/>
			) : null}

			<VStack gap={4} hAlign="center">
				<VStack maxWidth={672} width="100%" gap={3}>
					<SearchBar
						value={searchInput}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearchInput(e.target.value);
						}}
					/>
					<HStack gap={3} wrap="wrap" vAlign="end" width="100%">
						<ItemSortSelector
							value={sort}
							onChange={(next) => {
								setQueryStates({
									sort: next,
									page: 1,
								});
							}}
						/>
						<ItemViewModeSelector
							value={view}
							onChange={(next) => {
								setQueryStates({ view: next });
							}}
						/>
					</HStack>
				</VStack>

				{!isFiltersError ? (
					<MuseumFiltersPanel
						museumId={museumId}
						filters={filters}
						filterDefs={filterDefs}
						isLoading={isFiltersLoading}
						onChange={(next) => {
							setQueryStates({
								filters: next,
								page: 1,
							});
						}}
					/>
				) : null}

				<MuseumActiveStateBar
					chips={activeChips}
					onRemove={handleRemoveChip}
					onClearAll={handleClearAll}
				/>

				{showItemsLoading ? (
					viewMode === "table" ? (
						<ItemResultsTableSkeleton />
					) : (
						<ItemMasonry>
							{[...Array(12)].map((_, i) => (
								<CardSkeleton
									key={
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have unique IDs
										i
									}
								/>
							))}
						</ItemMasonry>
					)
				) : isError ? (
					<Banner
						status="error"
						title="Erro ao carregar os itens"
						description={
							error instanceof Error
								? error.message
								: "Erro desconhecido. Tente novamente mais tarde."
						}
						container="card"
					/>
				) : items?.length ? (
					viewMode === "table" ? (
						<ItemResultsTable
							items={items.map((item) => ({
								museumId,
								itemId: item.id,
								title: item.title,
								imageUrl: checkImagePath(item),
							}))}
						/>
					) : (
						<ItemMasonry>
							{items.map((item) => (
								<Card
									key={item.id}
									museumId={museumId}
									itemId={item.id}
									title={item.title}
									imageUrl={checkImagePath(item)}
								/>
							))}
						</ItemMasonry>
					)
				) : (
					<Banner
						status="info"
						title="Nenhum item encontrado"
						description={
							search || countActiveFilters(filters) > 0
								? "Tente ajustar sua busca ou os filtros."
								: "Não há itens disponíveis no momento."
						}
						container="card"
					/>
				)}

				{items?.length && data && totalPages > 1 ? (
					<Pagination
						page={page}
						totalPages={totalPages}
						onChange={(newPage) => setQueryStates({ page: newPage })}
						variant="pages"
						label="Paginação do acervo"
					/>
				) : null}
			</VStack>
		</VStack>
	);
}

export default function MuseumPage({ params }: MuseumPageProps) {
	const { museumId } = use(params);

	return (
		<Suspense fallback={null}>
			<MuseumContent museumId={museumId} />
		</Suspense>
	);
}
