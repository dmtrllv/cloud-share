import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { api, api2 } from "../api";

export type AuthCtx = AuthCtxState & {
	readonly login: (username: string, password: string) => Promise<boolean>;
	readonly register: (username: string, password: string) => Promise<boolean>;
	readonly logout: () => Promise<void>;
};

export type AuthCtxState = {
	isLoading: boolean;
	isAuthenticated: false;
	username?: never;
} | {
	isLoading: false;
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


const initAuthState = async (): Promise<AuthCtxState> => {
	const response = await api2.auth.getSession();

	if (response.data) {
		return { isAuthenticated: true, username: response.data.username, isLoading: false };
	}

	return { isAuthenticated: false, isLoading: false };
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [ctx, setCtx] = useState<AuthCtxState>({ isAuthenticated: false, isLoading: true });

	const state = useRef<AuthCtxState>(ctx);
	const setState = useRef(setCtx);
	state.current = ctx;
	setState.current = setCtx;

	const login = async (username: string, password: string) => {
		const response = await api2.auth.login({ username, password });
		if (response.data) {
			setState.current({ isAuthenticated: true, username, isLoading: false });
			return true;
		}
		return false;
	};

	const register = async (username: string, password: string) => {
		const response = api2.auth.register({ username, password });
		if (response.data) {
			setState.current({ isAuthenticated: true, username, isLoading: false });
			return true;
		}
		return false;
	};

	const logout = async () => {
		if(!await api2.auth.logout()) {
			console.error("Could not successfully logout!");
		}
		setState.current({ isAuthenticated: false, isLoading: false });
	};

	useEffect(() => {
		initAuthState().then((s) => {
			if (state.current.isLoading) {
				setState.current(s);
			}
		});
	}, []);

	return (
		<Context.Provider value={{ ...ctx, login, register, logout }}>
			{children}
		</Context.Provider>
	);
};

export const WithAuth = ({ children }: PropsWithChildren) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated)
		return null;

	return children;
};