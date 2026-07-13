"use client";

import { Tab, TabList } from "@astryxdesign/core/TabList";
import type { TainacanCollection } from "@/types/tainacan";

export type CollectionTabsProps = {
	collections: TainacanCollection[];
	value: string;
	onChange: (value: string) => void;
	isLoading?: boolean;
};

export function CollectionTabs({
	collections,
	value,
	onChange,
	isLoading = false,
}: CollectionTabsProps) {
	if (isLoading || collections.length === 0) {
		return null;
	}

	return (
		<TabList
			value={value}
			onChange={onChange}
			size="sm"
			layout="hug"
			hasDivider
			aria-label="Coleções"
		>
			<Tab value="all" label="Todos" />
			{collections.map((collection) => (
				<Tab
					key={collection.id}
					value={String(collection.id)}
					label={collection.name}
				/>
			))}
		</TabList>
	);
}
