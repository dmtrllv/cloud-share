import { createContext, useContext, type PropsWithChildren } from "react";
import { ExecutableManager } from "../../../services/exec-manager.js";
import { sdk } from "../../../sdk/sdk.js";

export type WindowContext = {
	readonly close: () => Promise<void>;
};

const WindowContext = createContext<WindowContext | null>(null);

export const useWindow = sdk.expose(() => {
	const ctx = useContext(WindowContext);
	if (ctx === null)
		throw new Error(`No WindowContext provided!`);
	return ctx;
}, "useWindow");

export const WindowContextProvider = ({ id, children }: PropsWithChildren<{ id: number }>) => {
	const mngr = ExecutableManager.ctx();

	return (
		<WindowContext.Provider value={{ close: () => mngr.close(id) }}>
			{children}
		</WindowContext.Provider>
	);
};