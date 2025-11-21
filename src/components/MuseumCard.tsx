"use client";

import Link from "next/link";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Museum } from "@/interfaces/Museum";
import { cn } from "@/lib/utils";

interface MuseumCardProps {
	museum: Museum;
	className?: string;
}

export function MuseumCard({ museum, className }: MuseumCardProps) {
	return (
		<Card
			className={cn(
				"flex h-full flex-col transition-all hover:shadow-md",
				className,
			)}
		>
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-2 text-lg">
						<Link href={`/${museum.id}`} className="hover:underline">
							{museum.title}
						</Link>
					</CardTitle>
					<FavoriteButton
						type="museum"
						museumId={museum.id}
						variant="default"
						className="h-8 w-8 shrink-0"
					/>
				</div>
			</CardHeader>
			<CardContent className="flex-grow">
				<CardDescription className="line-clamp-4 text-sm">
					{museum.description}
				</CardDescription>
			</CardContent>
			<CardFooter className="pt-2">
				<Link href={`/${museum.id}`} className="w-full">
					<Button variant="outline" className="w-full">
						Ver Acervo
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
