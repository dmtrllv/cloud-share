import React from "react";
import ReactDOM from "react-dom/client";
import { api } from "../api";
import { Executable, onEvent, Service, type ExecMeta } from "../framework";
import { Auth, type LoginEvent } from "./auth";

type ExecutableManagerEvents = {
	readonly change: { readonly executables: ReadonlyArray<ExecMeta<any>> };
	readonly start: { readonly executable: Executable };
};

export class ExecutableManager extends Service<ExecutableManagerEvents> {
	private _executables: ReadonlyArray<ExecMeta<any>> = Executable.defaultExecutables;

	private readonly _instances: Map<string, Executable[]> = new Map();

	public get executables(): ReadonlyArray<ExecMeta<any>> {
		return this._executables;
	}

	public get instances(): ReadonlyMap<string, ReadonlyArray<Executable>> {
		return this._executables as any;
	}

	public override async onConfigure(): Promise<void> {
		Object.assign(window, { 
			import: (url: string) => import(/* @vite-ignore */ url), 
			process: {
				env: {
					NODE_ENV: "development"
				}
			},
			React,
			ReactDOM
		});
		await (window as any).import("cloud-share");
	}

	protected async setExecutables(executables: ReadonlyArray<ExecMeta<any>>): Promise<ReadonlyArray<ExecMeta<any>>> {
		this._executables = executables;
		await this.emit("change", { executables: this._executables });
		return this._executables;
	}

	@onEvent(Auth, "logout")
	public onLogout() {

	}

	@onEvent(Auth, "login")
	public async onLogin(e: LoginEvent) {
		console.log("on auth login :D", e);
	}

	private async getMeta(name: string) {
		let meta = this._executables.find(e => e.name === name);

		if (!meta) {
			const { data, error } = await api.executables.load(name);
			if (error) {
				console.warn(error);
				return null;
			}

			const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(data!);
			const module = await import(/* @vite-ignore */ dataUri);
			if (!("default" in module)) {
				console.warn("no default export!");
				return null;
			}

			if (!(module.default.prototype instanceof Executable)) {
				console.warn("Not an executable type!");
				return null;
			}

			meta = module.default.getMeta();
			if (!meta) {
				console.warn("Not registered!");
				return null;
			}

			this.setExecutables([...this.executables, meta]);
		}

		return meta;
	}

	public async load(name: string) {
		const meta = await this.getMeta(name);
		if (!meta) {
			console.warn(`Could not get meta for executable ${name}!`);
			return null;
		}

		if (!this._instances.has(name)) {
			this._instances.set(name, []);
		}

		const { type, options } = meta;
		const instances = this._instances.get(name)!;
		if (options.singleInstance && instances.length === 1) {
			console.warn(`Only one instance of executable ${name} can run at the same time!`);
			return;
		}
		const executable = new type(name, options);
		instances.push(executable);
		await this.emit("start", { executable });
		return executable;
	}
}
