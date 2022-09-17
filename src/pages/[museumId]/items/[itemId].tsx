/* eslint-disable @next/next/no-img-element */
import { Box, Flex, Text } from "@chakra-ui/react";
import { Loader, Property } from "@saas-ui/react";
import { motion } from "framer-motion";
import { GetStaticPropsContext } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import HeroBanner from "../../../components/HeroBanner";
import tainacanService, { Item } from "../../../services/tainacanService";
import checkImagePath from "../../../utils/checkImagePath";
import Museums from "../../../utils/museums";

interface ContextParams {
  museumId: number;
  itemId: number;
}
interface Props {
  museumName: string;
  item: Item;
}

const ItemPage = ({ museumName = "", item }: Props) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loader color="gray" />;
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

      <Box p={8} bg="Background">
        <Flex
          flexDirection={["column", "row-reverse"]}
          justifyContent="space-between"
          gap={8}
        >
          <Flex
            flexDirection="column"
            alignItems="flex-end"
            gap={4}
            maxW="container.sm"
            w="full"
          >
            <motion.img
              src={imgPath}
              alt={title}
              width={960}
              height={960}
              className="rounded-xl "
              layoutId={String(item.id)}
            />
            <Text fontStyle="italic" fontWeight="semibold">
              {title}
            </Text>
          </Flex>

          <Box>
            {metadata
              .filter((meta) => meta[1].value_as_string)
              .map((meta, index) => (
                <Property
                  key={`ItemMetadata__${index}`}
                  label={meta[1].name}
                  value={meta[1].value_as_string}
                />
              ))}
          </Box>
        </Flex>
      </Box>

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
