/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ItemMetadata } from "@/components/ItemMetadata";
import { checkImagePath } from "@/utils/checkImagePath";
import type { Item } from "@/services/tainacanService";

interface ItemPageProps {
  item: Item;
  museumId: string;
  museumName: string;
}

export default function ItemPageClient({
  item,
  museumId,
  museumName,
}: ItemPageProps) {
  const metadata = Object.entries(item?.metadata || {});
  const { title, description } = item;
  const imgPath = checkImagePath(item);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <HeroBanner title={title} description={description} link="#" />

      <div className="flex flex-col flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Back button */}
          <Link
            href={`/${museumId}`}
            className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para a coleção</span>
          </Link>

          {/* Main content card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
            <div className="flex flex-col lg:flex-row-reverse">
              {/* Image section */}
              <div className="lg:w-1/2 p-8 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <motion.img
                  src={imgPath}
                  alt={title}
                  width={960}
                  height={960}
                  className="rounded-2xl shadow-2xl max-w-full h-auto"
                  layoutId={String(item.id)}
                />
              </div>

              {/* Metadata section */}
              <div className="lg:w-1/2 p-8 space-y-6">
                <div className="space-y-2 pb-4 border-b-2 border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Detalhes do Item
                  </h1>
                  <p className="text-sm text-gray-600">{museumName}</p>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                  {metadata.length > 0 ? (
                    metadata.map((meta, index) => (
                      <ItemMetadata
                        key={`ItemMetadata__${index}`}
                        metadata={meta[1]}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Nenhum metadado disponível
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
