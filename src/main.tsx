import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { AuthProvider, type AuthCtxState } from "./context/auth";
import { api } from "./api";

const getAuthState = async (): Promise<AuthCtxState> => {
	const response = await api.get<{ username: string }>("/auth/login");

	if(response.data) {
		return { isAuthenticated: true, username: response.data.username };
	}

	return { isAuthenticated: false };
}

createRoot(document.getElementById("root")!).render(
	<AuthProvider state={await getAuthState()}>
		<App />
	</AuthProvider>
);
