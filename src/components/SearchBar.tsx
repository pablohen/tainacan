import { Search, Package } from "lucide-react";
import { ChangeEvent } from "react";

interface SearchBarProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  results: number;
}

export function SearchBar({ onChange, results }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
        <div className="relative flex items-center bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-lg text-gray-500 focus-within:border-primary focus-within:text-primary transition-all duration-300">
          <Search className="h-6 w-6 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar itens do museu..."
            className="bg-transparent outline-none px-4 flex-1 text-gray-900 placeholder:text-gray-400 font-medium"
            onChange={onChange}
          />
        </div>
      </div>
      {results > 0 && (
        <div className="flex items-center justify-center gap-2 text-gray-700 text-sm font-medium bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 w-fit mx-auto border border-gray-200">
          <Package className="h-4 w-4 text-primary" />
          <span>{`${results} ${results === 1 ? "item" : "itens"} encontrado${
            results === 1 ? "" : "s"
          }`}</span>
        </div>
      )}
    </div>
  );
}
