import { Button, Flex, Heading } from "@chakra-ui/react";
import { BookmarkIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import Museums from "../utils/museums";

const Header = () => {
  const router = useRouter();
  const { museumId } = router.query;

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Flex p={2}>
        <Link href="/" passHref>
          <Button as="a" variant="ghost">
            <Heading>Tainacan</Heading>
          </Button>
        </Link>
      </Flex>

      <Flex overflowX="scroll">
        <Flex p={4} pb={2} gap={4}>
          {Museums.map((museum, index: number) => (
            <Link href={`/${index}`} passHref key={museum.url}>
              <Button
                as="a"
                size="xs"
                borderRadius="full"
                variant={Number(museumId) === index ? "solid" : "outline"}
                leftIcon={<BookmarkIcon />}
              >
                {museum.title}
              </Button>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;
