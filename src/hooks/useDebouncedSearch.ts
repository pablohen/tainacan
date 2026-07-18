import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export function useDebouncedLocalSearch(delay = 300) {
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounce(search, delay);
	return { search, setSearch, debouncedSearch };
}

export function useDebouncedUrlSearch(
	urlValue: string,
	onCommit: (value: string) => void,
	delay = 500,
) {
	const [searchInput, setSearchInput] = useState(urlValue);
	const [debouncedSearch] = useDebounce(searchInput, delay);

	useEffect(() => {
		setSearchInput(urlValue);
	}, [urlValue]);

	useEffect(() => {
		if (debouncedSearch !== urlValue) {
			onCommit(debouncedSearch);
		}
	}, [debouncedSearch, urlValue, onCommit]);

	return { searchInput, setSearchInput };
}
