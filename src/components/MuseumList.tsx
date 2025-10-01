"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { museums } from "../utils/museums";

export function MuseumList() {
  const pathname = usePathname();
  const museumId = pathname?.split("/")[1];

  const currentPage = (index: number) =>
    Number(museumId) === index
      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-xl scale-105 border-transparent"
      : "bg-white text-gray-700 border-gray-200 hover:border-primary shadow-md hover:shadow-lg";

  return (
    <div className="flex-1 overflow-x-auto scrollbar-thin">
      <div className="inline-flex pt-4 pb-3 gap-3 px-4 min-w-max">
        {museums.map((museum, index: number) => (
          <Link href={`/${index}`} key={museum.url}>
            <div
              className={`flex items-center whitespace-nowrap border-2 rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 ${currentPage(
                index
              )}`}
            >
              <Bookmark
                className={`h-4 w-4 mr-2 transition-all duration-300 ${
                  Number(museumId) === index ? "fill-white" : ""
                }`}
              />
              <h2>{museum.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
