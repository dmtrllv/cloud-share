import type { Context, ContextType } from "./context.js";

export interface Request {

}

export abstract class Transport<T extends Request> {
	public async getContext<C extends Context<T>>(context: ContextType<C>, req: T): Promise<C> {
		const ContextType = context.resolve(this.constructor as typeof Transport);
		const ctx = new ContextType(req) as Context<any>;
		await ctx.load(req);
		return ctx as C;
	}

	public configure() {

	}
}

export type TransportType<T extends Transport<any>> = new () => T;