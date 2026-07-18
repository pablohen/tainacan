import axios, { type AxiosRequestConfig } from "axios";
import type { z } from "zod";
import {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomyTermsResponseSchema,
	TainacanItemSchema,
} from "@/schemas/tainacan";
import type { FormattedItemsRes, TainacanItem } from "@/types/tainacan";
import { getMuseumById } from "@/utils/museums";

const axiosInstance = axios.create({
	timeout: 10_000,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface TainacanMutatorMeta {
	wpTotal: number;
	wpTotalPages: number;
}

export type TainacanRequestInit = RequestInit & {
	baseURL?: string;
	museumId?: string;
	/** Axios query params (supports nested taxquery/metaquery). */
	params?: Record<string, unknown>;
};

function getResponseSchema(url: string): z.ZodTypeAny | null {
	if (/\/items\/[^/?]+/.test(url) && !url.includes("/collection/")) {
		return TainacanItemSchema;
	}
	if (url.includes("/items")) {
		return GetItemsResponseSchema;
	}
	if (url.includes("/collections")) {
		return GetCollectionsResponseSchema;
	}
	if (url.includes("/filters")) {
		return GetFiltersResponseSchema;
	}
	if (url.includes("/terms")) {
		return GetTaxonomyTermsResponseSchema;
	}
	return null;
}

function isItemsListUrl(url: string): boolean {
	return (
		(url.endsWith("/items") || /\/collection\/[^/]+\/items/.test(url)) &&
		!/\/items\/[^/?]+/.test(url)
	);
}

function resolveBaseURL(options?: TainacanRequestInit): string | undefined {
	if (options?.baseURL) {
		return options.baseURL;
	}
	if (options?.museumId) {
		const museum = getMuseumById(options.museumId);
		if (!museum) {
			throw new Error(`Museu não encontrado: ${options.museumId}`);
		}
		return museum.api;
	}
	return undefined;
}

function toHeaders(record: Record<string, string>): Headers {
	const headers = new Headers();
	for (const [key, value] of Object.entries(record)) {
		if (value !== undefined) {
			headers.set(key, String(value));
		}
	}
	return headers;
}

function queryStringToParams(search: string): Record<string, string> {
	return Object.fromEntries(new URLSearchParams(search).entries());
}

export const tainacanMutator = async <T>(
	url: string,
	options?: TainacanRequestInit,
): Promise<T> => {
	const {
		baseURL: _baseURL,
		museumId: _museumId,
		method = "GET",
		signal,
		headers,
		params: explicitParams,
		...rest
	} = options ?? {};

	const resolvedBaseURL = resolveBaseURL(options);

	const [path, search] = url.split("?");
	const params =
		explicitParams ?? (search ? queryStringToParams(search) : undefined);

	const axiosConfig: AxiosRequestConfig = {
		url: path,
		baseURL: resolvedBaseURL,
		method: typeof method === "string" ? method : "GET",
		signal: signal ?? undefined,
		headers: headers
			? Object.fromEntries(new Headers(headers).entries())
			: undefined,
		params,
		...rest,
	};

	const response = await axiosInstance.request(axiosConfig);
	const schema = getResponseSchema(path);
	const validatedData = schema ? schema.parse(response.data) : response.data;

	return {
		data: validatedData,
		status: 200,
		headers: toHeaders(response.headers as Record<string, string>),
	} as T;
};

export function getPaginationMeta(response: {
	headers: Headers;
}): TainacanMutatorMeta | undefined {
	const wpTotal = response.headers.get("x-wp-total");
	const wpTotalPages = response.headers.get("x-wp-totalpages");
	if (wpTotal === null && wpTotalPages === null) {
		return undefined;
	}
	return {
		wpTotal: Number(wpTotal) || 0,
		wpTotalPages: Number(wpTotalPages) || 1,
	};
}

export function formatItemsResponse(response: {
	headers: Headers;
	data: unknown;
}): FormattedItemsRes {
	const meta = getPaginationMeta(response);
	const body = response.data;
	if (!body || typeof body !== "object" || !("items" in body)) {
		throw new Error("Resposta inesperada ao carregar itens");
	}
	const items = (body as { items?: TainacanItem[] }).items ?? [];
	return {
		items,
		wpTotal: meta?.wpTotal ?? 0,
		wpTotalPages: meta?.wpTotalPages ?? 1,
	};
}

export function isItemsListResponseUrl(url: string): boolean {
	return isItemsListUrl(url);
}
