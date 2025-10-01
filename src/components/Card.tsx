/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
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
    <div className="break-inside-avoid mb-4 animate-fade-in">
      <Link href={`/${museumId}/items/${item.id}`}>
        <ShadcnCard className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-200 hover:border-gray-300 rounded-lg">
          {/* Image container */}
          <CardContent className="p-0">
            <div className="relative flex justify-center items-start bg-gray-50">
              <motion.img
                src={imgPath}
                alt={String(item.id)}
                className="w-full h-auto object-contain object-top transition-transform duration-200 group-hover:scale-105"
                layoutId={String(item.id)}
              />
            </div>
          </CardContent>

          {/* Title section */}
          <CardFooter className="px-4 py-3 bg-white border-t border-gray-100">
            <p className="font-medium text-gray-700 text-center truncate text-sm w-full">
              {cardTitle}
            </p>
          </CardFooter>
        </ShadcnCard>
      </Link>
    </div>
  );
}
