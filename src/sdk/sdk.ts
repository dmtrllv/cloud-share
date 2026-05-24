export const sdk = {
	expose: (target: any, name?: any) => {
		if (typeof target === "function") {
			if (!target.name && !name) {
				throw new Error("Could not set anonymous function/class");
			}
			Object.assign(window, { [target.name || name]: target });
		}
		return target;
	}
} as const;