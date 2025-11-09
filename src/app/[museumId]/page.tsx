"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, PackageOpen } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { type ChangeEvent, Suspense, use, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Card } from "@/components/Card";
import { CardSkeleton } from "@/components/CardSkeleton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { SearchBar } from "@/components/SearchBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Pagination,
	PaginationContent,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { FormattedItemsRes, Items } from "@/services/tainacanService";
import { tainacanService } from "@/services/tainacanService";
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
	const [items, setItems] = useState<Items[]>([]);
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
		queryFn: () => tainacanService.getItems(museumId, page, search),
		enabled: !!museumId,
	});

	useEffect(() => {
		if (museumId && data) {
			if (data && typeof data === "object" && "items" in data) {
				const { items: fetchedItems, wpTotalPages } = data as FormattedItemsRes;
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
			<div className="flex flex-grow items-center justify-center p-4">
				<div className="animate-fade-in">
					<Alert
						variant="destructive"
						className="max-w-md rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.15)]"
					>
						<AlertCircle className="h-5 w-5" />
						<AlertTitle className="font-semibold text-lg">
							Museu não encontrado
						</AlertTitle>
						<AlertDescription className="text-sm">
							O museu que você está procurando não existe.
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	const { title, link, description } = museum;

	const changePage = (newPage: number) => {
		setQueryStates({ page: newPage });
	};

	return (
		<>
			<HeroBanner
				title={title}
				link={link}
				description={description}
				museumId={museumId}
			/>

			<div className="flex flex-grow flex-col">
				<div className="flex flex-col items-center space-y-4 p-4">
					<SearchBar
						value={searchInput}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearchInput(e.target.value);
						}}
					/>

					<div className="w-full max-w-screen-2xl">
						{isLoading ? (
							<div className="animate-fade-in columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
								{[...Array(12)].map((_, i) => (
									<CardSkeleton
										key={
											// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have unique IDs
											i
										}
									/>
								))}
							</div>
						) : isError ? (
							<div className="flex animate-fade-in justify-center">
								<Alert variant="destructive" className="max-w-md rounded-xl">
									<AlertCircle className="h-5 w-5" />
									<AlertTitle className="font-semibold text-base">
										Erro ao carregar os itens
									</AlertTitle>
									<AlertDescription className="text-sm">
										{error instanceof Error
											? error.message
											: "Erro desconhecido. Tente novamente mais tarde."}
									</AlertDescription>
								</Alert>
							</div>
						) : items?.length ? (
							<div className="animate-fade-in columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
								{items.map((item) => (
									<Card key={item.id} museumId={museumId} item={item} />
								))}
							</div>
						) : (
							<div className="flex animate-fade-in justify-center">
								<Alert className="max-w-md rounded-xl border border-gray-200 bg-white">
									<PackageOpen className="h-5 w-5 text-gray-600" />
									<AlertTitle className="font-semibold text-base text-gray-900">
										Nenhum item encontrado
									</AlertTitle>
									<AlertDescription className="text-gray-600 text-sm">
										{search
											? "Tente ajustar sua busca ou use outros termos."
											: "Não há itens disponíveis no momento."}
									</AlertDescription>
								</Alert>
							</div>
						)}
					</div>

					{!!items?.length && data && totalPages > 1 && (
						<div className="animate-fade-in">
							<div className="rounded-xl border border-gray-200 bg-white p-3">
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationFirst
												onClick={() => changePage(1)}
												className={
													page === 1
														? "pointer-events-none opacity-50"
														: "cursor-pointer transition-colors duration-200 hover:bg-gray-100"
												}
											/>
										</PaginationItem>
										<PaginationItem>
											<PaginationPrevious
												onClick={() => changePage(Math.max(1, page - 1))}
												className={
													page === 1
														? "pointer-events-none opacity-50"
														: "cursor-pointer transition-colors duration-200 hover:bg-gray-100"
												}
											/>
										</PaginationItem>

										<PaginationItem>
											<PaginationLink
												isActive={true}
												className="min-w-[60px] cursor-pointer rounded-lg transition-all duration-200"
											>
												{page} / {totalPages}
											</PaginationLink>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													changePage(Math.min(totalPages, page + 1))
												}
												className={
													page === totalPages
														? "pointer-events-none opacity-50"
														: "cursor-pointer transition-colors duration-200 hover:bg-gray-100"
												}
											/>
										</PaginationItem>
										<PaginationItem>
											<PaginationLast
												onClick={() => changePage(totalPages)}
												className={
													page === totalPages
														? "pointer-events-none opacity-50"
														: "cursor-pointer transition-colors duration-200 hover:bg-gray-100"
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default function MuseumPage({ params }: MuseumPageProps) {
	const { museumId } = use(params);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />
			<Suspense fallback={<div className="flex flex-grow" />}>
				<MuseumContent museumId={museumId} />
			</Suspense>
			<Footer />
		</div>
	);
}
