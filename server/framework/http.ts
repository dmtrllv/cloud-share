import { type Request } from "express";
import { Response, type Controller, type ControllerMap, type ControllerType } from "./controller.js";
import { Transport } from "./transport.js";

const handlers = new Map<string, HttpHandlers>;

const handlerControllerMap = new Map<typeof Controller, Record<string, HttpHandlers>>();

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type HttpHandlers = Partial<Record<HttpMethod, HttpHandler<any>>>;

export type HttpHandler<T extends typeof Controller> = {
	readonly target: T;
	readonly key: ControllerFunctionKeys<InstanceType<T>>;
	readonly path: string;
	readonly method: HttpMethod;
};

type ControllerFunctionKeys<T extends Controller> = {
	[K in keyof T]: T[K];
}[keyof T];

const setHandler = (path: string, method: HttpMethod, target: any, key: string) => {
	if (!handlers.has(path))
		handlers.set(path, {});

	if (!handlerControllerMap.has(target.constructor)) {
		handlerControllerMap.set(target.constructor, {});
	}

	const handler: HttpHandler<any> = {
		key,
		path,
		target: target.constructor,
		method
	};

	handlers.get(path)![method] = handler;
	if (!handlerControllerMap.get(target.constructor)![path])
		handlerControllerMap.get(target.constructor)![path] = {};
	handlerControllerMap.get(target.constructor)![path]![method] = handler;
}

export const get = (path: string) => (target: any, key: string) => { setHandler(path, "GET", target, key); };
export const post = (path: string) => (target: any, key: string) => { setHandler(path, "POST", target, key); };
export const put = (path: string) => (target: any, key: string) => { setHandler(path, "PUT", target, key); };
export const del = (path: string) => (target: any, key: string) => { setHandler(path, "DELETE", target, key); };

export const getHttpHandler = (path: string, method: HttpMethod): HttpHandler<any> | null => {
	const methods = handlers.get(path);
	if (!methods) {
		return null;
	}
	return methods[method] || null;
};

export const getHandlersFromType = <T extends typeof Controller>(type: T): Record<string, HttpHandlers> => {
	return handlerControllerMap.get(type) || {};
}

export const getHttpHandlers = (): ReadonlyMap<string, HttpHandlers> => handlers;

export type Api<T extends ControllerMap> = {
	readonly routes: Readonly<T>;
	readonly schema: ApiSchema<T>;
};

export type ApiSchema<T extends ControllerMap> = {
	[K in keyof T]: any;
};

const createSchema = <T extends ControllerMap>(routes: T): ApiSchema<T> => {
	const schema: Record<string, any> = {};
	for (const k in routes) {
		if (!schema[k.toLowerCase()])
			schema[k.toLowerCase()] = {};


		if (typeof routes[k] === "object") {
			schema[k.toLowerCase()] = { ...schema[k.toLowerCase()], ...createSchema(schema[k].routes) };
		} else {

			const handlers = getHandlersFromType(routes[k]!);

			for (const path in handlers) {
				const h = handlers[path]!;
				for(const method in h) {
					const handler = h[method as keyof typeof h]!;
					schema[k.toLowerCase()][handler.key] = [method, handler.path];
				}
			}

			if (routes[k]!.routes) {
				schema[k.toLowerCase()] = { ...schema[k.toLowerCase()], ...createSchema(schema[k].routes) };
			}
		}
	}
	
	return schema as ApiSchema<T>;
};

export const createApi = <T extends ControllerMap>(routes: T): Api<T> => {
	return {
		routes,
		schema: createSchema(routes)
	}
};

export type ApiResult<T> = {
	readonly data: T;
	readonly error?: undefined;
} | {
	readonly data?: undefined;
	readonly error: string | Error;
};

type ControllerFunctions<T extends Controller> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type ClientApiMap<T extends ControllerMap> = LowercaseKeys<{
	[K in keyof T]: T[K] extends ControllerType<any, any> ? ParseController<T[K]> : never;
}>;

type ParseController<T extends ControllerType<any, any>> = T extends ControllerType<infer A, infer U> ? ClientApiMap<U> & Pick<{
	[K in keyof A]: A[K] extends (...args: infer Args) => infer R ? (...args: Args) => ApiResult<Awaited<R>> : never;
}, ControllerFunctions<A>> : never;

type LowercaseKeys<T extends {}> = {
	[K in keyof T as K extends string ? Lowercase<K> : K]: T[K];
};

export type ClientApi<T extends Api<any>> = T extends Api<infer U> ? ClientApiMap<U> : never;

export class HttpTransport extends Transport<Request> {
	
}

export class Html extends Response<string> { }
export class Js extends Response<string> { }

export const html = (html: string) => new Html(html);
export const js = (code: string) => new Js(code);