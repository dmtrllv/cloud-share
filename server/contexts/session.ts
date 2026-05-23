import { User } from "../models/user.js";
import type { ID } from "../db/model.js";
import { Context } from "../framework/context.js";
import { HttpTransport } from "../framework/http.js";
import { type Request } from "../framework/transport.js";
import { type Request as Req } from "express";

export type SessionData = {
	readonly userId: ID<User>;
	readonly username: string;
};

export abstract class Session<T extends Request> extends Context<T> {
	abstract get isLoggedIn(): boolean;
	abstract get data(): SessionData | null;

	abstract start(userId: ID<User>): Promise<SessionData | false>;
	abstract end(): Promise<boolean>;
	abstract getUser(): Promise<User>;
}

@Session.register(HttpTransport)
export class HttpSession extends Session<Req> {
	private _data: SessionData | null = null;

	public constructor(req: Req) {
		super(req);
	}

	public override async load(req: Req): Promise<void> {
		if (req.session.userId === undefined)
			return;

		const user = await User.findOne({ where: { id: req.session.userId } });

		if (!user)
			return;

		this._data = {
			userId: user?.id,
			username: user?.username
		};
	}

	override get isLoggedIn(): boolean {
		return this._data !== null;
	}

	override get data(): SessionData | null {
		return this._data;
	}

	override async start(userId: ID<User>): Promise<SessionData | false> {
		const user = await User.findOne({ where: { id: userId } });

		if (!user)
			return false;

		this._data = {
			userId: user?.id,
			username: user?.username
		};

		this.req.session.userId = userId;
		return this._data;
	}

	override end(): Promise<boolean> {
		return new Promise(res => this.req.session.destroy(() => res(true)));
	}

	override async getUser(): Promise<User> {
		if(!this._data)
			throw new Error("Not logged in!");
		const user = await User.findOne({ where: { id: this._data.userId } });
	
		if (!user)
			throw new Error("Could not get user!");
		
		return user;
	}
}
