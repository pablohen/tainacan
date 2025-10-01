import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { museums } from "@/utils/museums";
import { tainacanService } from "@/services/tainacanService";
import ItemPageClient from "./ItemPageClient";

interface ItemPageProps {
  params: Promise<{
    museumId: string;
    itemId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { museumId: museumIdStr, itemId: itemIdStr } = await params;
  const museumId = Number(museumIdStr);
  const itemId = Number(itemIdStr);

  const museum = museums[museumId];
  const item = await tainacanService.getItem(museumId, itemId);

  if (!museum || !item) {
    return {
      title: "Item não encontrado",
    };
  }

  const pageTitle = `${item.title} - ${museum.title}`;

  return {
    title: pageTitle,
    description: item.description,
    openGraph: {
      title: pageTitle,
      description: item.description,
      type: "website",
    },
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { museumId: museumIdStr, itemId: itemIdStr } = await params;
  const museumId = Number(museumIdStr);
  const itemId = Number(itemIdStr);

  const museum = museums[museumId];

  if (!museum) {
    notFound();
  }

  const item = await tainacanService.getItem(museumId, itemId);

  if (!item) {
    notFound();
  }

  return (
    <ItemPageClient
      item={item}
      museumId={museumIdStr}
      museumName={museum.title}
    />
  );
}
