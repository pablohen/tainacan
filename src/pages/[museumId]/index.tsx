import { Flex, Text, VStack } from "@chakra-ui/react";
import Pagination from "@material-ui/lab/Pagination";
import { Loader, SearchInput } from "@saas-ui/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "usehooks-ts";
import Card from "../../components/Card";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import HeroBanner from "../../components/HeroBanner";
import tainacanService from "../../services/tainacanService";
import Museums from "../../utils/museums";

interface RouterParams {
  museumId: string;
}

const MuseumPage = () => {
  const router = useRouter();
  const { museumId } = router.query as unknown as RouterParams;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(search, 500);

  const { data, error } = useSWR(
    [museumId, page, debouncedSearchTerm],
    tainacanService.getItems
  );

  const { title, link, description } = Museums[Number(museumId)] || {};

  const changePage = (e: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  if (error) {
    return <div>failed to load</div>;
  }

  return (
    <Flex flexDirection="column" minH="calc(100vh)">
      <NextSeo title={title} description={description} />

      <Header />
      <HeroBanner title={title} link={link} description={description} />

      <Flex justifyContent="center" flexGrow={1} bg="Background">
        {!data ? (
          <Flex justifyContent="center" alignItems="center">
            <Loader />
          </Flex>
        ) : (
          <VStack p={4} gap={2}>
            <Flex w="full" maxW="xl">
              <SearchInput
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onReset={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            </Flex>

            <Text fontSize="sm" fontWeight="semibold" color="GrayText">
              {data.items.length === 1
                ? "1 item"
                : `${data.items.length} itens`}
            </Text>

            <Flex wrap="wrap" justifyContent="center" gap="4">
              {data.items.map((item, index) => (
                <Card key={index} museumId={museumId} item={item} />
              ))}
            </Flex>

            <Flex alignContent="center">
              <Pagination
                count={Number(data.wpTotalPages)}
                onChange={changePage}
                showFirstButton
                showLastButton
                page={page}
              />
            </Flex>
          </VStack>
        )}
      </Flex>
      <Footer />
    </Flex>
  );
};

// export const getStaticPaths = async () => {
//   const paths = Museums.map((museum, index) => ({
//     params: {
//       museumId: index.toString(),
//     },
//   }));

//   return {
//     paths,
//     fallback: true,
//   };
// };

// export const getStaticProps = async (context: GetStaticPropsContext) => {
//   console.log(context.params);
//   const { museumId } = context.params || {};
//   let page = 1;
//   let items: any[] = [];

//   try {
//     const res = await tainacanService.getItems(Number(museumId) || 0, page, '');
//     items = [...res];
//   } catch (error) {
//     console.log(`erro`);
//     return [];
//   }

//   return {
//     props: {
//       museumId: museumId || '0',
//       items,
//     },
//     revalidate: 60 * 60 * 24,
//   };
// };

export default MuseumPage;
