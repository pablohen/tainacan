"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/Card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { SearchBar } from "@/components/SearchBar";
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Items[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["museum-items", museumId, page, searchTerm],
    queryFn: () => tainacanService.getItems(Number(museumId), page, searchTerm),
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
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl">Museu não encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { title, link, description } = museum;

  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <HeroBanner title={title} link={link} description={description} />

      <div className="flex flex-col flex-grow">
        <div className="flex flex-col items-center p-6 space-y-8">
          {!!items?.length && data && (
            <SearchBar
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                if (page !== 1) setPage(1);
              }}
              results={items.length}
            />
          )}

          <div className="w-full max-w-screen-2xl px-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <div className="relative">
                  <Spinner size={50} />
                  <p className="mt-4 text-gray-600 text-sm font-medium">
                    Carregando itens...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex justify-center">
                <div className="text-center p-12 max-w-md">
                  <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
                    <p className="text-red-600 text-lg font-bold mb-2">
                      Erro ao carregar os itens do museu
                    </p>
                    <p className="text-red-500 text-sm">
                      {error instanceof Error
                        ? error.message
                        : "Erro desconhecido"}
                    </p>
                  </div>
                </div>
              </div>
            ) : !!items?.length ? (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
                {items.map((item, index) => (
                  <Card key={index} museumId={museumId} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="text-center p-16">
                  <div className="bg-gray-100 rounded-2xl p-12 border-2 border-gray-200">
                    <p className="text-gray-600 text-lg font-medium">
                      Nenhum item encontrado
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!!items?.length && data && totalPages > 1 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      onClick={() => changePage(1)}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-primary/10 transition-colors"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => changePage(Math.max(1, page - 1))}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-primary/10 transition-colors"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, idx) => (
                    <PaginationItem key={idx}>
                      {pageNum === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => changePage(pageNum as number)}
                          isActive={page === pageNum}
                          className="cursor-pointer hover:bg-primary/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-secondary data-[active=true]:text-white transition-all"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => changePage(Math.min(totalPages, page + 1))}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-primary/10 transition-colors"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={() => changePage(totalPages)}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-primary/10 transition-colors"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
