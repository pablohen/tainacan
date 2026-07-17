/** Non-default views stored in the URL. Absent `view` = masonry. */
export const ITEM_VIEW_VALUES = ["table"] as const;

export type ItemView = (typeof ITEM_VIEW_VALUES)[number];

export type ItemViewMode = "masonry" | ItemView;

export function toItemViewMode(view: ItemView | null): ItemViewMode {
	return view ?? "masonry";
}

export function fromItemViewMode(mode: ItemViewMode): ItemView | null {
	return mode === "masonry" ? null : mode;
}
