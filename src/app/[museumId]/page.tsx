"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { Pagination } from "@astryxdesign/core/Pagination";
import { VStack } from "@astryxdesign/core/VStack";
import { useQuery } from "@tanstack/react-query";
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
import { ItemSortSelector } from "@/components/ItemSortSelector";
import { MuseumActiveStateBar } from "@/components/MuseumActiveStateBar";
import { MuseumFiltersPanel } from "@/components/MuseumFiltersPanel";
import { SearchBar } from "@/components/SearchBar";
import {
	getCollections,
	getFilters,
	getItems,
} from "@/services/tainacanService";
import type { TainacanItem as Item } from "@/types/tainacan";
import {
	buildActiveStateChips,
	removeFacetFromFilters,
} from "@/utils/activeStateChips";
import { checkImagePath } from "@/utils/checkImagePath";
import { ITEM_SORT_VALUES, sortToQueryParams } from "@/utils/itemSort";
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
	const [{ search, page, collection, filters, sort }, setQueryStates] =
		useQueryStates({
			search: parseAsString.withDefault(""),
			page: parseAsInteger.withDefault(1),
			collection: parseAsInteger,
			filters: parseAsJson((value) => {
				const parsed = FiltersStateSchema.safeParse(value);
				return parsed.success ? parsed.data : null;
			}),
			sort: parseAsStringLiteral(ITEM_SORT_VALUES),
		});

	const [searchInput, setSearchInput] = useState(search);
	const [debouncedSearch] = useDebounce(searchInput, 500);
	const [items, setItems] = useState<Item[]>([]);
	const [totalPages, setTotalPages] = useState(1);

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
	} = useQuery({
		queryKey: ["museum-collections", museumId],
		queryFn: async () => {
			const data = await getCollections(museumId);
			if (data === null) {
				throw new Error("Falha ao carregar coleções");
			}
			return data;
		},
		enabled: !!museumId,
	});

	useEffect(() => {
		if (!isCollectionsSuccess) return;
		if (collection === null) return;
		const exists = collections.some((c) => c.id === collection);
		if (!exists) {
			setQueryStates({ collection: null });
		}
	}, [collection, collections, isCollectionsSuccess, setQueryStates]);

	const {
		data: filterDefs = [],
		isLoading: isFiltersLoading,
		isError: isFiltersError,
		isSuccess: isFiltersSuccess,
	} = useQuery({
		queryKey: ["museum-filters", museumId, collection],
		queryFn: async () => {
			const data = await getFilters(
				museumId,
				collection === null ? undefined : collection,
			);
			if (data === null) {
				throw new Error("Falha ao carregar filtros");
			}
			return data;
		},
		enabled: !!museumId,
	});

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

	const { data, isLoading, isPending, error, isError } = useQuery({
		queryKey: [
			"museum-items",
			museumId,
			page,
			search,
			collection,
			filters,
			sort,
		],
		queryFn: () =>
			getItems(
				museumId,
				page,
				search,
				collection === null ? undefined : collection,
				filterParams,
				sortParams,
			),
		enabled: !!museumId && filtersReadyForItems,
	});

	const showItemsLoading = isLoading || isPending;

	useEffect(() => {
		if (museumId && data) {
			if (data && typeof data === "object" && "items" in data) {
				const { items: fetchedItems, wpTotalPages } = data;
				setItems(fetchedItems || []);
				setTotalPages(wpTotalPages || 1);
			} else {
				setItems([]);
				setTotalPages(1);
			}
		}
	}, [data, museumId]);

	const museum = getMuseumById(museumId);
	const activeChips = buildActiveStateChips({
		search,
		collectionId: collection,
		collections,
		filters,
		filterDefs,
		sort,
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
		if (id.startsWith("facet:")) {
			const filterId = id.slice("facet:".length);
			setQueryStates({
				filters: removeFacetFromFilters(filters, filterId),
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
					<ItemSortSelector
						value={sort}
						onChange={(next) => {
							setQueryStates({
								sort: next,
								page: 1,
							});
						}}
					/>
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
