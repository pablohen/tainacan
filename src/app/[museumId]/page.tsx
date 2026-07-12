"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Center } from "@astryxdesign/core/Center";
import { Pagination } from "@astryxdesign/core/Pagination";
import { VStack } from "@astryxdesign/core/VStack";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { type ChangeEvent, Suspense, use, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Card } from "@/components/Card";
import { CardSkeleton } from "@/components/CardSkeleton";
import { HeroBanner } from "@/components/HeroBanner";
import { ItemMasonry } from "@/components/ItemMasonry";
import { SearchBar } from "@/components/SearchBar";
import { getItems } from "@/services/tainacanService";
import type { TainacanItem as Item } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";
import { getMuseumById } from "@/utils/museums";

interface MuseumPageProps {
	params: Promise<{
		museumId: string;
	}>;
}

function MuseumContent({ museumId }: { museumId: string }) {
	const [{ search, page }, setQueryStates] = useQueryStates({
		search: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
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

	const { data, isLoading, error, isError } = useQuery({
		queryKey: ["museum-items", museumId, page, search],
		queryFn: () => getItems(museumId, page, search),
		enabled: !!museumId,
	});

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

			<VStack gap={4} hAlign="center">
				<VStack maxWidth={672} width="100%">
					<SearchBar
						value={searchInput}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearchInput(e.target.value);
						}}
					/>
				</VStack>

				{isLoading ? (
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
							search
								? "Tente ajustar sua busca ou use outros termos."
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
