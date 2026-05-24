import { api } from "../api";
import { Service } from "../framework/service";

export type AuthEvents = {
	login: { username: string };
	logout: {};
};

export type LoginEvent = { username: string };

type AuthSession = {
	username: string;
};

export class Auth extends Service<AuthEvents> {
	private _session: AuthSession | null = null;

	public get isLoggedIn(): boolean {
		return this._session !== null;
	}

	public async login(username: string, password: string): Promise<{ username: string }> {
		const { data, error } = await api.auth.login({ username, password });
		if (data) {
			this._session = {
				username
			}
			await this.emit("login", this._session);
			return this._session;
		} else {
			console.warn(error);
			throw error;
		}
	}

	public async logout() {
		this._session = null;
		await api.auth.logout();
		await this.emit("logout");
	}

	public override async onConfigure(): Promise<void> {
		const { data, error } = await api.auth.getSession();
		if (data) {
			this._session = {
				username: data.username
			}
			await this.emit("login", this._session);
		} else {
			console.warn(error);
		}
	}
}

