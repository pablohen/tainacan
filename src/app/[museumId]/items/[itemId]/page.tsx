import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItem } from "@/services/generated/items/items";
import type { TainacanRequestInit } from "@/services/tainacanMutator";
import type { TainacanItem } from "@/types/tainacan";
import { getMuseumById } from "@/utils/museums";
import { ItemPageClient } from "./ItemPageClient";

interface ItemPageProps {
	params: Promise<{
		museumId: string;
		itemId: string;
	}>;
}

async function loadItem(
	museumId: string,
	itemId: number,
): Promise<TainacanItem | null> {
	try {
		const response = await getItem(String(itemId), undefined, {
			museumId,
		} as TainacanRequestInit);
		return response.data as TainacanItem;
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params,
}: ItemPageProps): Promise<Metadata> {
	const { museumId, itemId: itemIdStr } = await params;
	const itemId = Number(itemIdStr);

	const museum = getMuseumById(museumId);
	const item = await loadItem(museumId, itemId);

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

	const item = await loadItem(museumId, itemId);

	if (!item) {
		notFound();
	}

	return (
		<ItemPageClient item={item} museumId={museumId} museumName={museum.title} />
	);
}
