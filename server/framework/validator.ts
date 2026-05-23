import { parseType, type ParseError, type ParseResult, type Type, type Validated } from "../../shared/typed.js";


export type Validator<T extends Type> = Readonly<{
	isValid(obj: any): obj is Validated<T>;
	parse(obj: any): ParseResult<T>;
	validate(obj: any): Validated<T>;
}>;

export type TypeFromValidator<T extends Validator<any>> = T extends Validator<infer T> ? Validated<T> : never;

export class ValidationError extends Error {
	public readonly validatedObject: any;
	public readonly type: Type;
	public readonly errors: ParseError[];

	public constructor(obj: any, type: Type, errors: ParseError[]) {
		super(errors.map(e => e.error).join("\n"));
		this.validatedObject = obj;
		this.type = type;
		this.errors = errors;
	}
};

export const createValidator = <const T extends Type>(type: T): Validator<T> => {
	const isValid = (obj: any): obj is Validated<T> => {
		const result = parseType(type, obj);
		if (result.errors)
			return false;
		return true;
	};

	const validate = (obj: any) => {
		const result = parseType(type, obj) as any;
		console.log({ validationResult: result });
		if (result.errors) {
			throw new Error()
		}
		return result.data;
	};

	return ({
		parse: (obj: any) => parseType(type, obj),
		isValid,
		validate
	}) as any
};