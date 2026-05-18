import type { ApiResponse } from "../shared/api";

const log = (...args: any[]) => {
	//console.log(...args);
};

const createApiHandler = (method: string) => {
	if (method === "GET") {
		return <T>(url: string, data: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> => {
			const query = data ? `?${new URLSearchParams(data)}` : ""
			url = `/api${url}${query}`;
			log(`[${method}]`, url)
			return fetch(url, options).then(r => {
				if (r.status !== 200) {
					return { error: new Error(r.status.toString()) }
				}
				try {
					return r.json();
				} catch (e) {
					return r.text();
				}
			}).catch((e) => ({ error: e }));
		};
	}
	return <T>(url: string, data: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> => {
		log(`[${method}]`, `/api${url}`, data);
		return fetch("/api" + url, { body: data ? JSON.stringify(data) : "", method: method, headers: { "Content-Type": "application/json" }, ...options }).then(r => {
			if (r.status !== 200) {
				return { error: new Error(r.status.toString()) }
			}
			try {
				return r.json();
			} catch (e) {
				return r.text();
			}
		}).catch((e) => ({ error: e }));
	};
};


export const api = {
	get: createApiHandler("GET"),
	post: createApiHandler("POST"),
	put: createApiHandler("PUT"),
	delete: createApiHandler("DELETE")
};