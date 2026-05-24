export const sdk = {
	expose: (Class: abstract new (...args: any) => any) => {
		Object.assign(window, { [Class.name]: Class });
	}
} as const;