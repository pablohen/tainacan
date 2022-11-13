import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "next-themes";

const ThemeToggler = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <button className="flex text-white" onClick={toggleTheme}>
      {resolvedTheme === "light" ? (
        <LightModeIcon className="h-6" />
      ) : (
        <DarkModeIcon className="h-6" />
      )}
    </button>
  );
};

export default ThemeToggler;
