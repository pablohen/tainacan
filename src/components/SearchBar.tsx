import { Search } from "lucide-react";
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={value}
          placeholder="Buscar itens do museu..."
          onChange={onChange}
          className="pl-12 h-12 text-base bg-white border border-gray-300 hover:border-gray-400 focus-visible:border-gray-900 transition-colors duration-200 rounded-lg"
        />
      </div>
    </div>
  );
}
