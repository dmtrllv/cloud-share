import type { Api, ClientApi } from "../server/framework/http.js";
import type { Api as ServerApi } from "../server/controllers/api.js";

type ApiRoutes = {
	readonly [key: string]: ApiRoutes | [method: string, path: string];
};

const createApiHandler = (host: string, method: string, path: string) => (...args: any[]) => {
	console.log("fetch", method, host, path, ...args);
	const body = method === "GET" ? null : JSON.stringify(args);
	return fetch(`${host}${path}${method === "GET" ? `?${new URLSearchParams(...args)}` : ""}`, {
		method,
		body,
		headers: method === "GET" ? {} : {
			"Content-Type": "application/json",
			"Content-Length": `${body ? body.length : 0}`
		}
	}).then(r => {
		if (r.status !== 200) {
			return { error: new Error(r.status.toString()) }
		}
		try {
			return r.json();
		} catch (e) {
			return r.text();
		}
	}).catch(error => ({ error }));
};

const createApiObj = (routes: ApiRoutes, host: string): any => {
	const api: any = {};
	for (const name in routes) {
		const val = routes[name]!;
		if (Array.isArray(val)) {
			api[name] = createApiHandler(host, ...val);
		} else {
			api[name] = createApiObj(val, host);
		}
	}
	return api;
}

const createApi = async <T extends Api<any>>(path: string, host: string = ""): Promise<ClientApi<T>> => {
	const result = await fetch(`${host}${path}`).then(res => res.json());
	if ("data" in result) {
		return createApiObj(result.data, host);
	} else {
		throw new Error("Could not create api!");
	}
};


export const api = await createApi<ServerApi>("/api");