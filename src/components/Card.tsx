"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
	CardContent,
	CardFooter,
	Card as ShadcnCard,
} from "@/components/ui/card";
import type { Item } from "@/types/Item";
import { checkImagePath } from "@/utils/checkImagePath";
import { FavoriteButton } from "./FavoriteButton";

interface CardProps {
	museumId: string;
	item: Item;
}

export function Card({ museumId, item }: CardProps) {
	const imgPath = checkImagePath(item);
	const cardTitle = `${item.id} - ${item.title}`;

	return (
		<div className="mb-4 animate-fade-in break-inside-avoid">
			<Link href={`/${museumId}/items/${item.id}`}>
				<ShadcnCard className="group relative overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
					<CardContent className="p-0">
						<div className="relative flex items-start justify-center bg-gray-50">
							<FavoriteButton
								type="item"
								item={{
									museumId,
									itemId: item.id,
									title: item.title,
									imageUrl: imgPath,
								}}
								variant="card"
							/>
							<motion.img
								src={imgPath}
								alt={String(item.id)}
								className="h-auto w-full object-contain object-top transition-transform duration-200 group-hover:scale-105"
								layoutId={String(item.id)}
							/>
						</div>
					</CardContent>

					<CardFooter className="border-gray-100 border-t bg-white px-4 py-3">
						<p className="w-full truncate text-center font-medium text-gray-700 text-sm">
							{cardTitle}
						</p>
					</CardFooter>
				</ShadcnCard>
			</Link>
		</div>
	);
}
