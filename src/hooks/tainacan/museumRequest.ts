import type { TainacanRequestInit } from "@/services/tainacanMutator";
import { getMuseumById } from "@/utils/museums";

export function getMuseumRequestOptions(museumId: string): TainacanRequestInit {
	const museum = getMuseumById(museumId);
	if (!museum) {
		throw new Error(`Museu não encontrado: ${museumId}`);
	}
	return { baseURL: museum.api };
}

export function getMuseumApiBase(museumId: string): string | null {
	return getMuseumById(museumId)?.api ?? null;
}
