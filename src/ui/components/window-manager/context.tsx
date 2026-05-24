import { createContext, useContext, type PropsWithChildren } from "react";
import { ExecutableManager } from "../../../services/exec-manager.js";
import { runtime } from "../../../sdk/runtime.js";

export type WindowContext = {
	readonly close: () => Promise<void>;
};

const WindowContext = createContext<WindowContext | null>(null);

export const useWindow = runtime.export("useWindow", "cloud-share", () => {
	const ctx = useContext(WindowContext);
	if (ctx === null)
		throw new Error(`No WindowContext provided!`);
	return ctx;
});

export const WindowContextProvider = ({ id, children }: PropsWithChildren<{ id: number }>) => {
	const mngr = ExecutableManager.ctx();

	return (
		<WindowContext.Provider value={{ close: () => mngr.close(id) }}>
			{children}
		</WindowContext.Provider>
	);
};