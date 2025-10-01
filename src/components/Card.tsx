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
        <ShadcnCard className="group relative overflow-hidden transform transition-all ease-out duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] border-2 border-gray-200 hover:border-primary/30 rounded-2xl">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

          {/* Image container */}
          <CardContent className="p-0">
            <div className="relative flex justify-center items-start bg-gradient-to-br from-gray-50 to-gray-100">
              <motion.img
                src={imgPath}
                alt={String(item.id)}
                className="w-full h-auto object-contain object-top group-hover:scale-110 transition-transform duration-500"
                layoutId={String(item.id)}
              />
            </div>
          </CardContent>

          {/* Title section with gradient accent */}
          <CardFooter className="relative px-4 py-4 bg-white border-t border-gray-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <p className="font-semibold text-gray-700 text-center truncate text-sm group-hover:text-primary transition-colors duration-300 w-full">
              {cardTitle}
            </p>
          </CardFooter>
        </ShadcnCard>
      </Link>
    </div>
  );
}
