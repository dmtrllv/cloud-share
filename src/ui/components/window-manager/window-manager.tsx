import React, { useState } from "react";
import { ExecutableManager } from "../../../services/exec-manager";
import type { Executable } from "../../../framework";

type WindowedExecutable = Executable & {
	render(): React.ReactNode;
}

export const WindowManager = () => {
	const manager = ExecutableManager.ctx();

	const [instances, setInstances] = useState<WindowedExecutable[]>(() => {
		const i: WindowedExecutable[] = [];
		manager.instances.values().forEach(instances => {
			instances.forEach(exec => {
				if ("render" in exec) {
					i.push(exec as WindowedExecutable);
				}
			});
		});
		return i;
	});

	manager.useEvent("start", ({ executable }) => {
		console.log(executable);
		if ("render" in executable) {
			setInstances((i) => [...i, executable as any]);
		}
	});

	console.log(instances);

	return (
		<div>
			WindowManager
			{instances.map((exec) => {
				const Component = exec.render.bind(exec);
				return <Component />;
			})}
		</div>
	);
};