/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
	CardContent,
	CardFooter,
	Card as ShadcnCard,
} from "@/components/ui/card";
import { checkImagePath } from "../utils/checkImagePath";

interface Item {
	id: number;
	title: string;
}

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
					{/* Image container */}
					<CardContent className="p-0">
						<div className="relative flex items-start justify-center bg-gray-50">
							<motion.img
								src={imgPath}
								alt={String(item.id)}
								className="h-auto w-full object-contain object-top transition-transform duration-200 group-hover:scale-105"
								layoutId={String(item.id)}
							/>
						</div>
					</CardContent>

					{/* Title section */}
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
