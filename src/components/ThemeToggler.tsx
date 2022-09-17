import { IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";

const ThemeToggler = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      variant="ghost"
      icon={colorMode === "light" ? <SunIcon /> : <MoonIcon />}
      aria-label="theme-switcher"
      onClick={toggleColorMode}
    />
  );
};

export default ThemeToggler;
