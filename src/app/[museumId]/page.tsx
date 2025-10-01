"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, PackageOpen } from "lucide-react";
import { Card } from "@/components/Card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { SearchBar } from "@/components/SearchBar";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import { tainacanService } from "@/services/tainacanService";
import type { FormattedItemsRes, Items } from "@/services/tainacanService";
import { museums } from "@/utils/museums";

interface MuseumPageProps {
  params: Promise<{
    museumId: string;
  }>;
}

export default function MuseumPage({ params }: MuseumPageProps) {
  const { museumId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [items, setItems] = useState<Items[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (page !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL params when search term or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }
    if (page > 1) {
      params.set("page", String(page));
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/${museumId}${newUrl}`, { scroll: false });
  }, [debouncedSearchTerm, page, museumId, router]);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["museum-items", museumId, page, debouncedSearchTerm],
    queryFn: () =>
      tainacanService.getItems(Number(museumId), page, debouncedSearchTerm),
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

  const museum = museums[Number(museumId)];
  if (!museum) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="animate-fade-in">
            <Alert
              variant="destructive"
              className="max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.15)] rounded-2xl"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Museu não encontrado
              </AlertTitle>
              <AlertDescription className="text-sm">
                O museu que você está procurando não existe.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { title, link, description } = museum;

  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <HeroBanner title={title} link={link} description={description} />

      <div className="flex flex-col flex-grow">
        <div className="flex flex-col items-center p-6 space-y-8">
          <SearchBar
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
            }}
          />

          <div className="w-full max-w-screen-2xl px-4">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center p-16 gap-4 animate-fade-in">
                <Spinner size={50} />
                <p className="text-gray-600 text-sm font-medium">
                  Carregando itens...
                </p>
              </div>
            ) : isError ? (
              <div className="flex justify-center animate-fade-in">
                <Alert variant="destructive" className="max-w-md rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-base font-semibold">
                    Erro ao carregar os itens
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {error instanceof Error
                      ? error.message
                      : "Erro desconhecido. Tente novamente mais tarde."}
                  </AlertDescription>
                </Alert>
              </div>
            ) : !!items?.length ? (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 animate-fade-in">
                {items.map((item, index) => (
                  <Card key={index} museumId={museumId} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center animate-fade-in">
                <Alert className="max-w-md border border-gray-200 bg-white rounded-xl">
                  <PackageOpen className="h-5 w-5 text-gray-600" />
                  <AlertTitle className="text-base font-semibold text-gray-900">
                    Nenhum item encontrado
                  </AlertTitle>
                  <AlertDescription className="text-sm text-gray-600">
                    {searchTerm
                      ? "Tente ajustar sua busca ou use outros termos."
                      : "Não há itens disponíveis no momento."}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {!!items?.length && data && totalPages > 1 && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-xl border border-gray-200 p-3">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationFirst
                        onClick={() => changePage(1)}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => changePage(Math.max(1, page - 1))}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        }
                      />
                    </PaginationItem>

                    {/* Current page number */}
                    <PaginationItem>
                      <PaginationLink
                        isActive={true}
                        className="cursor-pointer transition-all duration-200 rounded-lg min-w-[60px]"
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
                            : "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLast
                        onClick={() => changePage(totalPages)}
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
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
      <Footer />
    </div>
  );
}
