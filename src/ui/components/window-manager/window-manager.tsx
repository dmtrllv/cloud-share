import { ExecutableManager } from "../../../services/exec-manager.js";
import { WindowContextProvider } from "./context.js";
import { useInstances } from "./hooks.js";

export const WindowManager = () => {
	const mngr = ExecutableManager.ctx();

	const instances = useInstances();

	return (
		<div>
			WindowManager
			<button onClick={() => mngr.load("Test App")}>Open Test App</button>
			{instances.map((exec) => {
				const Component = exec.render.bind(exec);
				return (
					<WindowContextProvider key={exec.id} id={exec.id}>
						<Component />
					</WindowContextProvider>
				);
			})}
		</div>
	);
};