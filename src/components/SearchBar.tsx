import { Search } from "lucide-react";
import { ChangeEvent } from "react";

interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  results: number;
}

const SearchBar = ({ onChange, results }: Props) => (
  <>
    <div className="flex items-center bg-white dark:bg-gray-800 border dark:border-gray-900 p-2 rounded-full shadow-sm text-gray-500 focus-within:text-gray-800 dark:focus-within:text-gray-200 focus-within:shadow-md">
      <Search className="h-6 w-6" />
      <input
        type="text"
        placeholder="buscar..."
        className="bg-transparent outline-none px-2"
        onChange={onChange}
      />
    </div>
    {results && (
      <p className="text-gray-700 dark:text-gray-200 text-sm">{`${results} items carregados`}</p>
    )}
  </>
);

export default SearchBar;
