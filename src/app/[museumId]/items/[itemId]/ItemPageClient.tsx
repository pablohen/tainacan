/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ItemMetadata } from "@/components/ItemMetadata";
import { checkImagePath } from "@/utils/checkImagePath";
import type { Item } from "@/services/tainacanService";

interface ItemPageProps {
  item: Item;
  museumName: string;
}

export default function ItemPageClient({ item, museumName }: ItemPageProps) {
  const metadata = Object.entries(item?.metadata || {});
  const { title, description } = item;
  const imgPath = checkImagePath(item);

  return (
    <>
      <Header />
      <HeroBanner title={title} description={description} link="#" />

      <div className="flex flex-col bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row-reverse bg-white dark:bg-gray-800 m-4 p-4 rounded-xl shadow">
          <div className="sm:ml-4 sm:w-3/12 md:w-4/12 lg:w-6/12">
            <motion.img
              src={imgPath}
              alt={title}
              width={960}
              height={960}
              className="rounded-xl "
              layoutId={String(item.id)}
            />
          </div>

          <div className="sm:text-left pt-4 sm:pt-0 sm:w-9/12 space-y-4">
            {metadata.map((meta, index) => (
              <ItemMetadata key={`ItemMetadata__${index}`} metadata={meta[1]} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
