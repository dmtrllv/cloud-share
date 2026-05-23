import type { Validated } from "../../shared/typed.js";
import { Session, type SessionData } from "../contexts/index.js";
import { command } from "../framework/cli.js";
import { Controller, ctx, get, post, data } from "../framework/index.js";
import { AccountService } from "../services/account.js";

const LoginData = {
	username: String,
	password: String,
};

type LoginData = Validated<typeof LoginData>;

export class Auth extends Controller {
	@ctx(Session)
	public readonly session!: Session<any>;

	@get("/auth/session")
	@command("session")
	public async getSession(): Promise<SessionData | null> {
		return this.session?.data || null;
	}

	@post("/auth/login")
	@command("login")
	public async login(@data(LoginData) { username, password }: LoginData): Promise<false | SessionData> {
		if (this.session.isLoggedIn)
			return false;

		const user = await AccountService.get().login(username, password);
		
		if (user) {
			return await this.session.start(user.id);
		}

		return false;
	}

	@post("/auth/register")
	@command("register")
	public async register(@data(LoginData) { username, password }: LoginData): Promise<boolean | { error: string }> {
		return await AccountService.get().createAccount(username, password);
	}

	@post("/auth/logout")
	@command("logout")
	public async logout(): Promise<boolean> {
		return this.session?.end() || false;
	}
}
