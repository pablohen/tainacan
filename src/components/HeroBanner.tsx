import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";

interface Props {
  title: string;
  link?: string;
  description: string;
}

const HeroBanner = ({
  title = "Lorem ipsum",
  link = "#",
  description = "",
}: Props) => {
  const bg = useColorModeValue("blue.700", "teal.700");

  return (
    <Box bg={bg} color="white" p={8}>
      <Flex flexDirection="column" gap={4}>
        <Heading>{title}</Heading>

        {description && <Text>{description}</Text>}

        {link !== "#" && (
          <Link href={link} passHref>
            <Button w="fit-content" type="button" leftIcon={<ArrowRightIcon />}>
              Ir para o site
            </Button>
          </Link>
        )}
      </Flex>
    </Box>
  );
};

export default HeroBanner;
