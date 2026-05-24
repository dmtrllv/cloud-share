import { Counter } from "@shared";
import { sdk } from "../sdk/sdk";
import type React from "react";

const DEFAULT_OPTIONS: ExecutableOptions = {};

export type ExecMeta<T extends Executable> = {
	readonly name: string;
	readonly type: new (name: string, options: Partial<ExecutableOptions>) => T;
	readonly options: Partial<ExecutableOptions>;
	readonly isDefault: boolean;
};

@sdk.expose
export abstract class Executable {
	private static readonly _defaultExecutables: ExecMeta<any>[] = [];

	declare static _meta?: ExecMeta<any>;

	public static get defaultExecutables(): ReadonlyArray<ExecMeta<any>> {
		return this._defaultExecutables;
	}

	public static getMeta<T extends typeof Executable>(this: T): ExecMeta<InstanceType<T>> | null {
		return this._meta || null;
	}

	public static default<T extends Executable>(name: string, options: Partial<ExecutableOptions> = {}) {
		return (type: new (name: string, options: Partial<ExecutableOptions>) => T) => {
			this._defaultExecutables.push({
				name,
				type,
				options,
				isDefault: true
			});
		};
	};

	public static register<T extends Executable>(name: string, options: Partial<ExecutableOptions> = {}) {
		return (type: new (name: string, options: Partial<ExecutableOptions>) => T) => {
			const self: typeof Executable = type as any;
			self._meta = { name, options, isDefault: false, type };
		};
	};

	private static readonly idCounter = new Counter();

	public readonly id: number = Executable.idCounter.next();

	public readonly name: string;
	public readonly options: Readonly<ExecutableOptions>;

	public constructor(name: string, options: Partial<ExecutableOptions>) {
		this.name = name;
		this.options = { ...DEFAULT_OPTIONS, ...options };
	}

	public render?(): React.ReactNode;
};

export type ExecutableOptions = {
	singleInstance?: boolean;
};