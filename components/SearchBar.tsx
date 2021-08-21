import { SearchIcon } from '@heroicons/react/solid';

interface Props {
  onChange: any;
  results: number;
}

const SearchBar = ({ onChange, results }: Props) => (
  <>
    <div className="flex items-center bg-white border p-2 rounded-full shadow-sm text-gray-500 focus-within:text-gray-800 focus-within:shadow-md">
      <SearchIcon className="h-6" />
      <input
        type="text"
        placeholder="buscar..."
        className="bg-transparent outline-none px-2"
        onChange={onChange}
      />
    </div>
    <p className="text-gray-700 text-sm">
      {results && `${results} items carregados`}
    </p>
  </>
);

export default SearchBar;
