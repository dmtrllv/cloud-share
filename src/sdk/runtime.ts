import * as react from "react";

type ModuleExports = Partial<Record<string | symbol, any>>;

type Runtime = {
	readonly modules: Record<string, ModuleExports>;

	getModule(name: string): ModuleExports;

	export(name: string, module?: string): ClassDecorator;
	export<T>(name: string, module: string, value: T): T;

	exportDefault(module?: string): ClassDecorator;
	exportDefault<T>(module: string, value: T): T;
};

export const runtime: Runtime = {
	modules: {},
	getModule(name) {
		if (!this.modules[name]) {
			this.modules[name] = {};
		}
		return this.modules[name]!;
	},
	export<T>(...args: any[]): T | ClassDecorator {
		const [name, module = "cloud-share"] = args
		const mod = this.getModule(module);

		if (args.length === 3) {
			const value = args[2]!;
			mod[name] = value;
			return value;
		}

		return (Class) => {
			mod[name] = Class;
		}
	},
	exportDefault<T>(...args: any[]): T | ClassDecorator {
		const [module = "cloud-share"] = args
		const mod = this.getModule(module);

		if (args.length === 3) {
			const value = args[2]!;
			mod["default"] = value;
			return value;
		}

		return (Class) => {
			mod["default"] = Class;
		}
	}
};

Object.assign(globalThis, { runtime });

const exportModule = (name: string, module: any) => {
	for (const k in module)
		runtime.export(k, name, module[k])
};

exportModule("react", react);
