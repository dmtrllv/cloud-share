import type { Type, Validated } from "../../shared/typed.js";
import { createValidator, type Validator } from "./validator.js";

type ControllerFunctionArgs = ({ type: Type, validator: Validator<Type> } | undefined)[];

type ControllerFunctions = Record<string, ControllerFunctionArgs>;

type ControllerFunctionsMap = Map<ControllerType<any, any>, ControllerFunctions>;

const controllerFunctionsMap: ControllerFunctionsMap = new Map();

export type ControllerMap = {
	[K: string]: ControllerType<any, any> | ControllerMap;
};

export abstract class Controller {
	public static with<T extends Controller, U extends ControllerMap>(this: new () => T, routes: U): ControllerType<T, U> & { readonly routes: U; } {
		const Wrapper = (class extends (this as any) {
			public static readonly routes = routes;
		});

		return Object.assign(Wrapper, { name: this.name }) as any;
	}
};

export type ControllerType<T extends Controller, U extends ControllerMap> = (new () => T) & {
	[K in keyof (typeof Controller)]: (typeof Controller)[K];
} & {
	readonly routes?: U;
};

export const data = <T, K extends keyof T, I extends number, T2 extends Type>(type: T2): ValidateDecorator<T, K, I, T2> => {
	return ((target: T, key: K, index: I) => {
		const validator = createValidator(type);

		const Class = (target as any).constructor

		if (!controllerFunctionsMap.has(Class)) {
			controllerFunctionsMap.set(Class, {});
		}

		const functions = controllerFunctionsMap.get(Class)!;
		const functionName = key.toString();

		if (!(functionName in functions))
			functions[functionName] = [];

		functions[functionName]![index] = { type, validator } as any;
	}) as any;
};

export const getControllerArgTypes = (target: ControllerType<any, any>, key: string): ControllerFunctionArgs => {
	const map = controllerFunctionsMap.get(target);
	if (!map)
		return [];
	return map[key] || [];
}

type ValidateDecoratorError<Error extends string, T> = { error: Error, type: T };

type ValidateDecorator<T, K extends keyof T, I extends number, T2 extends Type> = T[K] extends (...args: infer Args) => any ?
	((T2 extends Type ? Validated<T2> : (T2 extends new () => infer U ? U : never)) extends Args[I] ?
		(target: T, key: K, index: I) => any :
		(target: T, key: K, index: I) => ValidateDecoratorError<"Decorated argument does not match the validated type!", T2>
	) : (target: T, key: K, index: I) => ValidateDecoratorError<"Decorated target is not a function parameter!", T2>;


export class Response<T> {
	public readonly data: T;

	public constructor(data: T) {
		this.data = data;
	}
}

export class Html extends Response<string> { }

export const html = (html: string) => new Html(html);