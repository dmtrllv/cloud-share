import { useState } from "react";
import { ExecutableManager } from "../../../services/exec-manager";
import type { Executable } from "../../../framework";

type WindowedExecutable = Executable & {
	render(): React.ReactNode;
};

export const useInstances = () => {
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
		if ("render" in executable) {
			setInstances((i) => [...i, executable as any]);
		}
	});

	manager.useEvent("close", ({ executable }) => {
		setInstances((instances) => {
			const index = instances.indexOf(executable as any);
			if (index > -1) {
				const i = [...instances];
				i.splice(index, 1);
				return i;
			}
			return instances;
		});
	});

	return instances;
};
