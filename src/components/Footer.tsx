import { Text, useColorModeValue, VStack } from "@chakra-ui/react";
import ThemeToggler from "./ThemeToggler";

const Footer = () => {
  const bg = useColorModeValue("blue.700", "teal.700");

  const currentYear = new Date().getFullYear();

  return (
    <VStack bg={bg} color="white" p={8} gap={4}>
      <Text>{`Tainacan @ ${currentYear}`}</Text>
      <ThemeToggler />
    </VStack>
  );
};

export default Footer;
