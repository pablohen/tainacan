/* eslint-disable @next/next/no-img-element */
import { Text } from "@chakra-ui/react";
import { Card as SaasCard, CardFooter, CardMedia } from "@saas-ui/react";
import Link from "next/link";
import checkImagePath from "../utils/checkImagePath";

interface Item {
  id: number;
  title: string;
}

interface Props {
  museumId: string;
  item: Item;
}

const Card = ({ museumId, item }: Props) => {
  const imgPath = checkImagePath(item);
  const cardTitle = `${item.id} - ${item.title}`;

  return (
    <Link key={`ItemMuseu__${museumId}`} href={`/${museumId}/items/${item.id}`}>
      <SaasCard
        w="80"
        h="80"
        css={{
          cursor: "pointer",
        }}
        _hover={{
          shadow: "md",
        }}
      >
        <CardMedia height="256px" bgImage={imgPath} borderTopRadius="lg" />

        <CardFooter p={4}>
          <Text fontSize="md" fontWeight="bold" noOfLines={1}>
            {cardTitle}
          </Text>
        </CardFooter>
      </SaasCard>
    </Link>
  );
};

export default Card;
