import { CircularProgress, Pagination } from "@mui/material";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/Card";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import HeroBanner from "../../components/HeroBanner";
import SearchBar from "../../components/SearchBar";
import tainacanService, {
  FormattedItemsRes,
  Items,
} from "../../services/tainacanService";
import Museums from "../../utils/museums";

interface RouterParams {
  museumId: string;
}

const MuseumPage = () => {
  const router = useRouter();
  const { museumId } = router.query as unknown as RouterParams;

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
      // Check if data is the expected object structure
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

  const { title, link, description } = Museums[Number(museumId)] || {};

  const changePage = (e: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      {museumId && (
        <div className="flex flex-col min-h-screen">
          <NextSeo title={title} description={description} />

          <Header />
          <HeroBanner title={title} link={link} description={description} />

          <div className="flex flex-col flex-grow bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col items-center p-4 space-y-4">
              {!!items?.length && data && (
                <SearchBar
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    if (page !== 1) setPage(1);
                  }}
                  results={items.length}
                />
              )}

              <div className="flex flex-wrap justify-center items-center w-full">
                {isLoading ? (
                  <CircularProgress />
                ) : isError ? (
                  <div className="text-center p-8">
                    <p className="text-red-500 text-lg">
                      Erro ao carregar os itens do museu
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {error instanceof Error
                        ? error.message
                        : "Erro desconhecido"}
                    </p>
                  </div>
                ) : !!items?.length ? (
                  items.map((item, index) => (
                    <Card key={index} museumId={museumId} item={item} />
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhum item encontrado
                    </p>
                  </div>
                )}
              </div>

              {!!items?.length && data && (
                <div className="flex justify-center">
                  <Pagination
                    count={Number(totalPages)}
                    onChange={changePage}
                    showFirstButton
                    showLastButton
                    page={page}
                  />
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default MuseumPage;
