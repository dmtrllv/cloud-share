
export type Primitive =
	| StringConstructor
	| NumberConstructor
	| BooleanConstructor;

const NULLABLE = Symbol("NULLABLE");
const ONE_OF = Symbol("ONE_OF");

export type Type = Primitive | ArrayType<any> | ObjType | Nullable<Primitive | ArrayType<any> | ObjType | OneOf<readonly Type[]>> | OneOf<readonly Type[]>;

export type Nullable<T extends Type> = { readonly [NULLABLE]: T; }
export type OneOf<T extends readonly Type[]> = { readonly [ONE_OF]: T };

export type ArrayType<T extends Type, Length extends number = number> = readonly [T, Length];

export type ObjType = { readonly [K: string]: Type };

export type Validated<T extends Type> =
	T extends StringConstructor ? string :
	T extends NumberConstructor ? number :
	T extends BooleanConstructor ? boolean :
	T extends Nullable<infer U> ? Validated<U> | null :
	T extends OneOf<infer U extends readonly Type[]> ? MapOneOf<UnionToIntersection<Validated<U[number]>>> & Validated<U[number]> :
	T extends ArrayType<infer U, any> ? Validated<U>[] :
	T extends ObjType ? {
		[K in keyof T]: Validated<T[K]>;
	} :
	unknown;

type MapOneOf<T> = {
	[K in keyof T]?: T[K] | undefined;
};

type UnionToIntersection<U> =
	(U extends any ? (x: U) => void : never) extends
	(x: infer I) => void ? I : never;

export type ParseResult<T extends Type> = Readonly<{
	data: Validated<T>;
	errors?: undefined;
} | {
	data?: undefined;
	errors: ParseError[];
}>;

export class ParseError {
	public readonly targetObject: any;
	public readonly type: Type;
	public readonly error: string;

	public constructor(target: any, type: Type, error: string) {
		this.error = error;
		this.targetObject = target;
		this.type = type;
	}
}

export const oneOf = <const T extends readonly Type[]>(...types: T): OneOf<T> => ({ [ONE_OF]: types });
export const nullable = <const T extends Type>(type: T): Nullable<T> => ({ [NULLABLE]: type });

export function array<const T extends Type, const Length extends number = number>(type: T, length?: Length): ArrayType<T, Length> {
	const arr: any[] = [type];
	if (length !== undefined)
		arr.push(length);
	return arr as any;
};

export const parseType = <T extends Type>(Type: T, value: any, name: string = "value"): ParseResult<T> => {
	const isNullable = NULLABLE in Type;

	const type = NULLABLE in Type ? Type[NULLABLE] as Type : Type;

	if (value === null || value === undefined) {
		if (isNullable) {
			return { data: null } as any;
		} else {
			return { errors: [new ParseError(value, Type, `${name} is not nullable!`)] }
		}
	}

	if (typeof type === "function") { // primitive constructors
		switch (typeof value) {
			case "string":
				if (type !== String) {
					return { errors: [new ParseError(value, Type, `${name} is not a string!`)] }
				} else {
					return { data: value } as any;
				}
			case "number":
				if (type !== Number) {
					return { errors: [new ParseError(value, Type, `${name} is not a number!`)] }
				} else {
					return { data: value } as any;
				}
			case "boolean":
				if (type !== Boolean) {
					return { errors: [new ParseError(value, Type, `${name} is not a boolean!`)] }
				} else {
					return { data: value } as any;
				}
			default:
				return { errors: [new ParseError(value, Type, "unknown type!")] }
		}
	}

	if (ONE_OF in type) {
		const found = type[ONE_OF].find(t => {
			const result = parseType(t, value) as any;
			return result.data !== undefined;
		});

		if (found !== undefined) {
			return { data: value } as any;
		} else {
			return { errors: [new ParseError(value, Type, `${name} is not a one of ...!`)] }
		}
	}

	if (Array.isArray(type)) {
		if (!Array.isArray(value))
			return { errors: [new ParseError(value, Type, `${name} is not an array!`)] }

		const [t, length] = type;
		if (length !== undefined) {
			if (value.length !== length)
				return { errors: [new ParseError(value, Type, `${name} is not of length ${length}!`)] }
		}
		const errors: ParseError[] = [];

		for (const val of value) {
			const result = parseType(t, val);
			if (result.errors)
				errors.push(...result.errors);
		}

		if (errors.length > 0) {
			return { errors };
		}

		return { data: value } as any;
	}

	if (typeof type === "object") {
		if (typeof value !== "object" || Array.isArray(value)) {
			return { errors: [new ParseError(value, Type, `${name} is not an object!`)] }
		}

		let errors = [];

		for (const k in type) {
			if (!(k in value)) {
				errors.push(new ParseError(value, Type, `${name} is missing property ${k}!`));
				continue;
			}
			const t = type[k as keyof typeof type];
			const val = value[k];
			const result = parseType(t, val);
			if (result.errors)
				errors.push(...result.errors);
		}

		if (errors.length > 0) {
			return { errors };
		}

		return { data: value } as any;
	}

	console.log("TODO: parse type ", type, value);

	return { data: value as any }
};