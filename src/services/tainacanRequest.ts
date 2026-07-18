import type { TainacanRequestInit } from "@/services/tainacanMutator";

export function tainacanRequestInit(museumId: string): TainacanRequestInit {
	return { museumId };
}

export function withMuseumRequest(museumId: string): {
	request: TainacanRequestInit;
} {
	return { request: tainacanRequestInit(museumId) };
}
