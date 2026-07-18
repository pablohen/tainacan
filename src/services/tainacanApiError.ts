export type TainacanApiErrorCode =
	| "network"
	| "http"
	| "validation"
	| "museum_not_found";

export class TainacanApiError extends Error {
	readonly code: TainacanApiErrorCode;
	readonly status?: number;

	constructor(
		message: string,
		code: TainacanApiErrorCode,
		options?: { status?: number; cause?: unknown },
	) {
		super(message, { cause: options?.cause });
		this.name = "TainacanApiError";
		this.code = code;
		this.status = options?.status;
	}
}

export function isTainacanApiError(error: unknown): error is TainacanApiError {
	return error instanceof TainacanApiError;
}

export function getTainacanErrorMessage(error: unknown): string {
	if (isTainacanApiError(error)) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "Erro desconhecido. Tente novamente mais tarde.";
}
