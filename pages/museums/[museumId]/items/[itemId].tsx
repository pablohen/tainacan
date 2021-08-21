/* eslint-disable @next/next/no-img-element */
import React from 'react';
import PropTypes from 'prop-types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import tainacanService from '../../../../services/tainacanService';
import HeroBanner from '../../../../components/HeroBanner';
import ItemMetadata from '../../../../components/ItemMetadata';

import checkImagePath from '../../../../utils/checkImagePath';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Museums from '../../../../models/museums';
import Loading from '../../../../components/Loading';
import { GetStaticPropsContext } from 'next';

interface Props {
  museumName: string;
  item: any;
}

const ItemPage = ({ museumName = '', item }: Props) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loading />;
  }

  const metadata = Object.entries(item?.metadata);
  const { title, description } = item;

  const pageTitle = `${title} - ${museumName}`;

  return (
    <>
      <NextSeo title={pageTitle} description={description} />

      <Header />
      <HeroBanner title={title} description={description} link="#" />
      <div className="flex flex-col bg-gray-100">
        <div className="">
          <div className="flex flex-col sm:flex-row-reverse bg-white m-5 p-4 rounded-xl shadow">
            <div className="sm:ml-4 sm:w-3/12 md:w-4/12 lg:w-6/12">
              <img
                src={checkImagePath(item)}
                alt={title}
                width={960}
                height={960}
                className="rounded-xl "
              />
            </div>

            <div className="sm:text-left pt-4 sm:pt-0 sm:w-9/12 space-y-4">
              {metadata.map((meta: any, index) => (
                <ItemMetadata
                  key={`ItemMetadata__${index}`}
                  metadata={meta[1]}
                />
              ))}
            </div>
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
  const { museumId, itemId }: any = context.params;

  const newItem = await tainacanService.getItem(museumId, itemId);
  const museumName = Museums[museumId]?.title;

  return {
    props: {
      museumName,
      item: newItem,
      revalidate: 60 * 60 * 24,
    },
  };
};

export default ItemPage;
