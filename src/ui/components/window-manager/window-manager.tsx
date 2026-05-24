import { api } from "../../../api.js";
import { ExecutableManager } from "../../../services/exec-manager.js";
import { WindowContextProvider } from "./context.js";
import { useInstances } from "./hooks.js";

const content = "hello world\nthis is a test file";

const file = new File([content], "test.txt", {
	type: "text/plain",
});

const formData = new FormData();
formData.append("file", file);

export const WindowManager = () => {
	const mngr = ExecutableManager.ctx();

	const instances = useInstances();
	// todo: define a layout tree -> calculate to a grid for css
	return (
		<div>
			<h1 onClick={() => api.fs.writeFile(formData as any)}>WindowManager</h1>
			<button onClick={() => mngr.load("Test App")}>Open Test App</button>
			{instances.map((exec) => (
				<WindowContextProvider key={exec.id} id={exec.id}>
					<div className={`window ${exec}`}>
						<exec.render />
					</div>
				</WindowContextProvider>
			))}
		</div>
	);
};