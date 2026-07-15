"use client";

import { Selector } from "@astryxdesign/core/Selector";
import { ITEM_SORT_OPTIONS, type ItemSort } from "@/utils/itemSort";

export type ItemSortSelectorProps = {
	value: ItemSort | null;
	onChange: (next: ItemSort | null) => void;
};

export function ItemSortSelector({ value, onChange }: ItemSortSelectorProps) {
	return (
		<Selector
			label="Ordenar"
			placeholder="Padrão"
			options={ITEM_SORT_OPTIONS}
			value={value}
			onChange={(next) => {
				onChange(next === null ? null : (next as ItemSort));
			}}
			hasClear
			size="sm"
		/>
	);
}
