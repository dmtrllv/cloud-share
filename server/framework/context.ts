import type { Transport, Request, TransportType } from "./transport.js";

const TAG = Symbol();

export abstract class Context<T extends Request> {
	public readonly [TAG] = TAG;

	declare private static _resolvers?: Map<typeof Transport, ContextType<any>>;

	public static resolve<T extends Context<any>>(this: ContextType<T>, transport: typeof Transport): ContextType<T> {
		const self = (this as typeof Context);
		if (!self._resolvers)
			throw new Error(`No ${this.name} registered for transport ${transport.name}!`);

		const context = self._resolvers.get(transport);
		if (!context)
			throw new Error(`No ${this.name} registered for transport ${transport.name}!`);

		return context;
	}


	public static register<T extends typeof Context, U extends Transport<any>>(this: T, transport: TransportType<U>) {
		return (target: any) => {
			if (!this._resolvers)
				this._resolvers = new Map();
			this._resolvers.set(transport, target);
		};
	}

	protected readonly req: T;

	public constructor(req: T) {
		this.req = req;
	}

	public abstract load(req: T): void | Promise<void>;
}

type ContextProps = Record<string, ContextType<any>>;

type ContextMap = Map<new (...args: any) => any, ContextProps>;

const ctxMap: ContextMap = new Map();

export const ctx = <T extends typeof Context, Target, K extends keyof Target>(Context: T) => (_target: Target, key: K) => {
	const Class = (_target as any).constructor;

	if (!ctxMap.has(Class))
		ctxMap.set(Class, {});
	const props = ctxMap.get(Class)!;
	props[key.toString()] = Context as ContextType<any>;
};

export type ContextType<T extends Context<any>> = { [K in keyof (typeof Context)]: (typeof Context)[K]; } & (new (...args: any[]) => T);

export interface ContextResolver<Req, Ctx extends Context<any>> {
	resolve(req: Req): Ctx | Promise<Ctx>;
};

export const getContextsFrom = (Class: new () => any): ContextProps => {
	return ctxMap.get(Class) || {};
};