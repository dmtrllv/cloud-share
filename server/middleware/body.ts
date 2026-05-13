import type { Request, Response, NextFunction } from "express";

export const validateBody = (schema: ValidateSchema) => (req: Request, res: Response, next: NextFunction) => {
	if (!validate(req.body, schema)) {
		res.send({ error: "invalid body" });
	} else {
		next();
	}
};

type PrimitiveType<T extends PrimitiveNames> = {
	name: T;
	optional: () => Optional<T>;
	isOptional: boolean;
};

type PrimitiveNames = keyof typeof primitives;

const primitives = {
	null: () => null,
	string: String,
	number: Number,
	bigint: BigInt,
	boolean: Boolean,
} as const;

type Optional<T extends PrimitiveNames> = Omit<PrimitiveType<T>, "optional">

export type ValidateSchema = {
	[key: string]: PrimitiveType<PrimitiveNames> | Optional<PrimitiveNames>;
};

const createPrimitive = <T extends PrimitiveNames>(name: T): PrimitiveType<T> => {
	const primitive = {
		name,
		optional: () => ({ ...primitives, isOptional: true }) as any,
		isOptional: false
	};
	return primitive;
};

export const string = createPrimitive("string");
export const number = createPrimitive("number");
export const bigint = createPrimitive("bigint");
export const boolean = createPrimitive("boolean");

export const validate = <T extends object>(obj: T, schema: ValidateSchema) => {
	for (const k in schema) {
		const { isOptional, name } = schema[k]!;
		if (!(k in obj)) {
			if (!isOptional)
				return false;
		} else {
			const val = obj[k as keyof typeof obj];

			if (val === null && !isOptional)
				return false;

			if (typeof val !== name) {
				return false;
			}
		}
	}

	return true;
};