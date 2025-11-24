import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Buscar itens do museu...",
}: SearchBarProps) {
	return (
		<div className="w-full max-w-2xl animate-fade-in">
			<div className="relative">
				<Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
				<Input
					type="text"
					value={value}
					placeholder={placeholder}
					onChange={onChange}
					className="h-12 rounded-lg border border-gray-300 bg-white pl-12 text-base transition-colors duration-200 hover:border-gray-400 focus-visible:border-gray-900"
				/>
			</div>
		</div>
	);
}
