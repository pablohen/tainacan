"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { museums } from "../utils/museums";

export function MuseumList() {
  const pathname = usePathname();
  const museumId = pathname?.split("/")[1];

  const currentPage = (index: number) =>
    Number(museumId) === index
      ? "bg-gray-900 text-white"
      : "bg-white text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex-1 overflow-x-auto scrollbar-thin">
      <div className="inline-flex pt-3 pb-2 gap-2 px-4 min-w-max">
        {museums.map((museum, index: number) => (
          <Link href={`/${index}`} key={museum.url}>
            <div
              className={`flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${currentPage(
                index
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
