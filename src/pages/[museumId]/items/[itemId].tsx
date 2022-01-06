/* eslint-disable @next/next/no-img-element */
import { GetStaticPropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import HeroBanner from '../../../components/HeroBanner';
import ItemMetadata from '../../../components/ItemMetadata';
import Loading from '../../../components/Loading';
import Museums from '../../../utils/museums';
import tainacanService, { Item } from '../../../services/tainacanService';
import checkImagePath from '../../../utils/checkImagePath';
import { motion } from 'framer-motion';

interface ContextParams {
  museumId: number;
  itemId: number;
}
interface Props {
  museumName: string;
  item: Item;
}

const ItemPage = ({ museumName = '', item }: Props) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loading />;
  }

  const metadata = Object.entries(item?.metadata);
  const { title, description } = item;

  const pageTitle = `${title} - ${museumName}`;
  const imgPath = checkImagePath(item);

  return (
    <>
      <NextSeo title={pageTitle} description={description} />

      <Header />
      <HeroBanner title={title} description={description} link="#" />

      <div className="flex flex-col bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row-reverse bg-white dark:bg-gray-800 m-4 p-4 rounded-xl shadow">
          <div className="sm:ml-4 sm:w-3/12 md:w-4/12 lg:w-6/12">
            <motion.img
              src={imgPath}
              alt={title}
              width={960}
              height={960}
              className="rounded-xl "
              layoutId={String(item.id)}
            />
          </div>

          <div className="sm:text-left pt-4 sm:pt-0 sm:w-9/12 space-y-4">
            {metadata.map((meta, index) => (
              <ItemMetadata key={`ItemMetadata__${index}`} metadata={meta[1]} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export const getStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const { museumId, itemId } = context.params as unknown as ContextParams;

  const newItem = await tainacanService.getItem(museumId, itemId);
  const museumName = Museums[museumId].title;

  return {
    props: {
      museumName,
      item: newItem,
      revalidate: 60 * 60 * 24,
    },
  };
};

export default ItemPage;
