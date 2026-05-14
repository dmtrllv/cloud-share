import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { api } from "../api";

export type AuthCtx = AuthCtxState & {
	readonly login: (username: string, password: string) => Promise<boolean>;
	readonly register: (username: string, password: string) => Promise<boolean>;
	readonly logout: () => Promise<void>;
};

export type AuthCtxState = {
	isAuthenticated: false;
	username?: never;
} | {
	isAuthenticated: true;
	username: string;
};

const Context = createContext<AuthCtx | null>(null);

export const useAuth = (): AuthCtx => {
	const ctx = useContext(Context);
	if (ctx === null)
		throw new Error(`No AuthCtx provided!`);
	return ctx;
};

export const AuthProvider = ({ children, state = { isAuthenticated: false } }: PropsWithChildren<{ state?: AuthCtxState }>) => {
	const [ctx, setState] = useState<AuthCtxState>(state);

	const login = async (username: string, password: string) => {
		const response = await api.post<boolean>("/auth/login", { username, password });
		if (response.data) {
			setState({ isAuthenticated: true, username });
			return true;
		}
		return false;
	};

	const register = async (username: string, password: string) => {
		const response = await api.post<boolean>("/auth/register", { username, password });
		if (response.data) {
			setState({ isAuthenticated: true, username });
			return true;
		}
		return false;
	};

	const logout = async () => {
		api.post("/auth/logout");
		setState({ isAuthenticated: false });
	};

	return (
		<Context.Provider value={{ ...ctx, login, register, logout }}>
			{children}
		</Context.Provider>
	);
};


export const WithAuth = ({ children }: PropsWithChildren) => {
	const { isAuthenticated } = useAuth();

	if(!isAuthenticated)
		return null;

	return children;
}