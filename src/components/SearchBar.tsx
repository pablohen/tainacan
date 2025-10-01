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
      <div className="relative group">
        {/* Animated gradient background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" />

        {/* Search input container */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70 group-hover:text-primary transition-colors duration-200 z-10" />
          <Input
            type="text"
            value={value}
            placeholder="Buscar itens do museu..."
            onChange={onChange}
            className="pl-12 h-14 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-primary/50 focus-visible:border-primary shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
