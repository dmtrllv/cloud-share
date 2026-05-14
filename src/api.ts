import type { ApiResponse } from "../shared/api";

const createApiHandler = (method: string) => {
	if (method === "GET") {
		return <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
			console.log(`[${method}]`, `/api${url}?${data ?? new URLSearchParams(data)}`)
			return fetch(`/api${url}?${data ?? new URLSearchParams(data)}`, { body: data ?? JSON.stringify(data), method: method, headers: { "Content-Type": "application/json" } }).then(r => r.json());
		};
	}
	return <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
		console.log(`[${method}]`, `/api${url}`, data);
		return fetch("/api" + url, { body: data ? JSON.stringify(data) : "", method: method, headers: { "Content-Type": "application/json" } }).then(r => {
			if (r.status !== 200) {
				return { error: new Error(r.status.toString()) }
			}
			return r.json();
		});
	};
};


export const api = {
	get: createApiHandler("GET"),
	post: createApiHandler("POST"),
	put: createApiHandler("PUT"),
	delete: createApiHandler("DELETE")
};