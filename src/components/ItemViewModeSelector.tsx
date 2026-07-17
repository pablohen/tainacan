"use client";

import {
	SegmentedControl,
	SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import {
	fromItemViewMode,
	type ItemView,
	type ItemViewMode,
	toItemViewMode,
} from "@/utils/itemView";

export type ItemViewModeSelectorProps = {
	value: ItemView | null;
	onChange: (next: ItemView | null) => void;
};

export function ItemViewModeSelector({
	value,
	onChange,
}: ItemViewModeSelectorProps) {
	const mode = toItemViewMode(value);

	return (
		<SegmentedControl
			label="Visualização"
			size="sm"
			value={mode}
			onChange={(next) => {
				onChange(fromItemViewMode(next as ItemViewMode));
			}}
		>
			<SegmentedControlItem value="masonry" label="Galeria" />
			<SegmentedControlItem value="table" label="Tabela" />
		</SegmentedControl>
	);
}
