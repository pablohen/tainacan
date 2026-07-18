import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItem } from "@/services/generated/items/items";
import { isTainacanApiError } from "@/services/tainacanApiError";
import { tainacanRequestInit } from "@/services/tainacanRequest";
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
): Promise<TainacanItem | "not_found"> {
	try {
		const response = await getItem(
			String(itemId),
			undefined,
			tainacanRequestInit(museumId),
		);
		return response.data as TainacanItem;
	} catch (error) {
		if (
			isTainacanApiError(error) &&
			error.code === "http" &&
			error.status === 404
		) {
			return "not_found";
		}
		throw error;
	}
}

export async function generateMetadata({
	params,
}: ItemPageProps): Promise<Metadata> {
	const { museumId, itemId: itemIdStr } = await params;
	const itemId = Number(itemIdStr);

	const museum = getMuseumById(museumId);
	const itemResult = await loadItem(museumId, itemId);
	const item = itemResult === "not_found" ? null : itemResult;

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

	const itemResult = await loadItem(museumId, itemId);

	if (itemResult === "not_found") {
		notFound();
	}

	return (
		<ItemPageClient
			item={itemResult}
			museumId={museumId}
			museumName={museum.title}
		/>
	);
}
