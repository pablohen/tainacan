"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { museums } from "../utils/museums";

export function MuseumList() {
	const pathname = usePathname();
	const museumId = pathname?.split("/")[1];

	const currentPage = (id: string) =>
		museumId === id
			? "bg-gray-900 text-white"
			: "bg-white text-gray-700 hover:bg-gray-50";

	return (
		<div className="scrollbar-thin min-w-0 flex-1 overflow-x-auto">
			<div className="inline-flex min-w-max gap-2 px-4 pt-3 pb-2">
				{museums.map((museum) => (
					<Link href={`/${museum.id}`} key={museum.id}>
						<div
							className={`flex cursor-pointer items-center whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-colors duration-200 ${currentPage(
								museum.id,
							)}`}
						>
							<h2>{museum.title}</h2>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
