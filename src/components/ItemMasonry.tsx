"use client";

import { Section } from "@astryxdesign/core/Section";
import { Children, type ReactNode } from "react";

interface ItemMasonryProps {
	children: ReactNode;
}

export function ItemMasonry({ children }: ItemMasonryProps) {
	return (
		<Section
			variant="transparent"
			padding={0}
			width="100%"
			className="item-masonry"
		>
			{Children.map(children, (child) =>
				child == null ? null : (
					<Section
						variant="transparent"
						padding={0}
						className="item-masonry__item"
					>
						{child}
					</Section>
				),
			)}
		</Section>
	);
}
