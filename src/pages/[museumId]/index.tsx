import { ChangeEvent, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import tainacanService, {
  FormattedItemsRes,
  Items,
} from '../../services/tainacanService';
import Museums from '../../utils/museums';
import HeroBanner from '../../components/HeroBanner';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Pagination from '@material-ui/lab/Pagination';
import useSWR from 'swr';
import { TailSpin } from 'react-loader-spinner';
import Card from '../../components/Card';

interface RouterParams {
  museumId: string;
}

const MuseumPage = () => {
  const router = useRouter();
  const { museumId } = router.query as unknown as RouterParams;

  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Items[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const { data } = useSWR(
    [museumId, page, searchTerm],
    tainacanService.getItems
  );

  useEffect(() => {
    if (museumId && !!data) {
      const { items, wpTotalPages } = data as FormattedItemsRes;
      setItems(items);
      setTotalPages(wpTotalPages);
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
              {!!items.length && data && (
                <SearchBar
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    if (page !== 1) setPage(1);
                  }}
                  results={items.length}
                />
              )}

              <div className="flex flex-wrap justify-center items-center w-full">
                {!!items.length && !!data ? (
                  items.map((item, index) => (
                    <Card key={index} museumId={museumId} item={item} />
                  ))
                ) : (
                  <TailSpin color="#298596" height={80} width={80} />
                )}
              </div>

              {!!items.length && data && (
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
