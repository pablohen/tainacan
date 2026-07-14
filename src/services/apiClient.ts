import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { z } from "zod";

const apiClient: AxiosInstance = axios.create({
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface ValidatedResponse<T> {
	data: T;
	headers: Record<string, string | number>;
}

export const fetchAndValidate = async <T extends z.ZodTypeAny>(
	url: string,
	schema: T,
	params?: Record<string, unknown>,
): Promise<ValidatedResponse<z.infer<T>>> => {
	const response: AxiosResponse = await apiClient.get(url, { params });

	const validatedData = schema.parse(response.data);

	return {
		data: validatedData,
		headers: {
			"x-wp-total": response.headers["x-wp-total"],
			"x-wp-totalpages": response.headers["x-wp-totalpages"],
		},
	};
};

export default apiClient;
