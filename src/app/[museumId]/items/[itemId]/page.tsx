import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tainacanService } from "@/services/tainacanService";
import { getMuseumById } from "@/utils/museums";
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
	const { museumId, itemId: itemIdStr } = await params;
	const itemId = Number(itemIdStr);

	const museum = getMuseumById(museumId);
	const item = await tainacanService.getItem(museumId, itemId);

	if (!museum || !item) {
		return {
			title: "Item não encontrado | Tainacan",
			description: "O item solicitado não foi encontrado.",
		};
	}

	const pageTitle = `${item.title} - ${museum.title} | Tainacan`;
	const description =
		item.description || `Item da coleção ${museum.title} no Tainacan`;

	return {
		title: pageTitle,
		description,
		openGraph: {
			title: pageTitle,
			description,
			type: "website",
		},
	};
}

export default async function ItemPage({ params }: ItemPageProps) {
	const { museumId, itemId: itemIdStr } = await params;
	const itemId = Number(itemIdStr);

	const museum = getMuseumById(museumId);

	if (!museum) {
		notFound();
	}

	const item = await tainacanService.getItem(museumId, itemId);

	if (!item) {
		notFound();
	}

	return (
		<ItemPageClient item={item} museumId={museumId} museumName={museum.title} />
	);
}
