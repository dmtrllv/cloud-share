import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { AuthProvider } from "./auth";

createRoot(document.getElementById("root")!).render(
	<AuthProvider>
		<App />
	</AuthProvider>
);