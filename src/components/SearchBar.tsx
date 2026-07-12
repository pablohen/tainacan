import { TextInput } from "@astryxdesign/core/TextInput";
import type { ChangeEvent } from "react";

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
		<TextInput
			label="Buscar"
			isLabelHidden
			value={value}
			placeholder={placeholder}
			startIcon="search"
			hasClear
			onChange={(_value, e) => onChange(e)}
		/>
	);
}
