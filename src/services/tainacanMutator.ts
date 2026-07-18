import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import type { z } from "zod";
import {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomyTermsResponseSchema,
	TainacanItemSchema,
} from "@/schemas/tainacan";
import { TainacanApiError } from "@/services/tainacanApiError";
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
			throw new TainacanApiError(
				`Museu não encontrado: ${options.museumId}`,
				"museum_not_found",
			);
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

function validateResponseData(
	data: unknown,
	schema: z.ZodTypeAny,
	path: string,
): unknown {
	const result = schema.safeParse(data);
	if (result.success) {
		return result.data;
	}

	if (process.env.NODE_ENV === "development") {
		console.error(
			"[tainacanMutator] Validação Zod falhou:",
			path,
			result.error,
		);
	}

	throw new TainacanApiError(
		"Resposta da API em formato inesperado.",
		"validation",
		{ cause: result.error },
	);
}

function toTainacanApiError(error: unknown): TainacanApiError {
	if (error instanceof TainacanApiError) {
		return error;
	}

	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError;
		const status = axiosError.response?.status;
		if (status === 404) {
			return new TainacanApiError("Recurso não encontrado.", "http", {
				status,
				cause: error,
			});
		}
		if (status !== undefined) {
			return new TainacanApiError(
				`Erro ao comunicar com a API (${status}).`,
				"http",
				{ status, cause: error },
			);
		}
		return new TainacanApiError(
			"Não foi possível conectar à API do museu.",
			"network",
			{ cause: error },
		);
	}

	return new TainacanApiError(
		"Erro inesperado ao processar a resposta.",
		"network",
		{ cause: error },
	);
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

	try {
		const response = await axiosInstance.request(axiosConfig);
		const schema = getResponseSchema(path);
		const validatedData = schema
			? validateResponseData(response.data, schema, path)
			: response.data;

		return {
			data: validatedData,
			status: response.status,
			headers: toHeaders(response.headers as Record<string, string>),
		} as T;
	} catch (error) {
		throw toTainacanApiError(error);
	}
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
		throw new TainacanApiError(
			"Resposta inesperada ao carregar itens.",
			"validation",
		);
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
