import { Database } from "./db.js";
import { objKeys } from "../../shared/utils/obj.js";

declare const MODEL_TAG: unique symbol;

declare const ID_TYPE: unique symbol;
declare const REF_TYPE: unique symbol;

export abstract class Model {
	declare public readonly [MODEL_TAG]: typeof MODEL_TAG;

	private static columns: Columns | null = null;
	private static _tableName: string;

	public static getTableName<T extends typeof Model>(this: T) {
		return this._tableName || this.name;
	}

	private static setColumn<T extends typeof Model>(this: T, name: string | number | symbol, meta: ColumnMeta) {
		if (!this.columns)
			this.columns = {};

		this.columns[name] = meta;
	}

	public static getPrimaryKey<T extends typeof Model>(this: T): string | null {
		return Object.keys(this.columns || {}).find(k => this.columns![k]!.primaryKey) || null;
	}

	public static getRefModel<T extends typeof Model>(this: T, key: string): typeof Model | null {
		if (!this.columns)
			return null;

		const columnType = this.columns[key]?.type;
		if (typeof columnType !== "function")
			return null;

		const refType = columnType();
		return (Array.isArray(refType) ? refType[0]! : refType) as any;
	}

	private static getRefKeys() {
		if (!this.columns)
			return [];

		return Object.keys(this.columns).filter(k => {
			return typeof this.columns![k]?.type === "function";
		});
	}

	public static readonly primaryKey = <T extends Model, K extends keyof T>() => (Class: T[K] extends ID<Model> ? T : never, key: K) => {
		const type: typeof Model = Class.constructor as any;
		type.setColumn(key, {
			primaryKey: true,
			nullable: false,
			type: "serial",
			unique: true
		});
	}

	// @internal
	public static getColumns<T extends typeof Model>(this: T): Columns | null {
		return this.columns;
	}


	// TODO: Check if the referenced table has a primary ID<T>
	public static readonly ref = <T extends Model, K extends keyof T>(refType: () => ColumnRefType<T, K>, options: ColumnOptions = {}) => (Class: T, key: K) => {
		const type: typeof Model = Class.constructor as any;
		type.setColumn(key, {
			primaryKey: false,
			type: refType,
			nullable: false,
			unique: false,
			...options
		});
	};

	// TODO: Check for nullable type and force the dev to set the `options.nullable: true` it the type is nullable
	public static readonly col = <T extends Model, K extends keyof T>(typeName: ColumnTypeOf<T[K]>, options: ColumnOptions = {}) => (Class: T, key: K) => {
		const type: typeof Model = Class.constructor as any;
		type.setColumn(key, {
			primaryKey: false,
			type: typeName,
			nullable: false,
			unique: false,
			...options
		});
	};



	public static id<T extends typeof Model>(this: T, id: number): ID<InstanceType<T>> {
		return id as ID<InstanceType<T>>;
	}

	private static parseWhat<T extends Model>(what: FindQuery<T>["what"]): string {
		if (what === undefined)
			return "*";
		if (Array.isArray(what))
			return what.join(", ");
		return what.toString();
	}

	public static async find<T extends typeof Model>(this: T, query: FindQuery<InstanceType<T>> = {}): Promise<FindResult<InstanceType<T>, typeof query>[]> {
		const tableName = this.getTableName();
		const values: any[] = [];

		const what = this.parseWhat(query.what);
		let q = `SELECT ${what} FROM ${tableName}`;

		if (query.where) {
			q += ` WHERE ${this.parseWhere(query.where, values)}`;
		}
		console.log(q, values);
		const result = await Database.get().pool.query(q, values);
		return result.rows.map((row) => Model.fromRow(this, row)) as any;
	}

	private static fromRow<T extends typeof Model>(type: T, row: any): InstanceType<T> {
		return Object.assign(new (type as any)(), row);
	}

	private static parseWhere<T extends Model>(where: Where<T> | Where<T>[], values: any[]) {
		where = Array.isArray(where) ? where : [where];

		return where.map((where: any) => {
			const ands: any[] = [];
			for (const k in where) {
				const val = where[k];
				const { type } = (this.columns as any)[k] as ColumnMeta;
				if (typeof type !== "function") {
					switch (type) {
						case "bigint":
						case "serial":
						case "int":
						case "float":
							ands.push(this.parseWhereNumber(k, where[k], values))
							break;
						case "date":
							throw new Error("TODO");
						default:
							ands.push(`${k} = $${values.push(val)}`);
							break;
					}
				} else {
					if (typeof val === "number") {
						ands.push(this.parseWhereNumber(k, where[k], values));
					} else {
						const refID = (val.constructor as typeof Model).getPrimaryKey();
						if (refID === null)
							throw new Error("ref is null");
						ands.push(this.parseWhereNumber(k, val[refID], values))

					}
				}
			}
			return `(${ands.join(" AND ")})`;
		}).join(" OR ");
	}

	private static parseWhereNumber(key: string, val: WhereOp<number>, values: any[]) {
		if (typeof val === "number") {
			return `${key} = $${values.push(val)}`;
		}

		return Object.keys(val).map(op => {
			const opVal = (val as any)[op];
			return `${key} ${op} $${values.push(opVal)}`;
		}).join(" AND ");
	}

	public static async findOne<T extends typeof Model, Q extends FindQuery<InstanceType<T>>>(this: T, query: Q): Promise<FindResult<InstanceType<T>, Q> | null> {
		const rows = await this.find(query);
		return rows[0] || null as any;
	}

	public static async insert<T extends typeof Model>(this: T, _data: NewProps<InstanceType<T>>): Promise<NewModel<InstanceType<T>>> {
		const tableName = this.getTableName();

		const refKeys = this.getRefKeys();

		const keys = objKeys(_data);
		const values: any = [];
		const placeholders = keys.map(key => {
			const v = _data[key];
			if (refKeys.includes(key.toString())) {
				if (v !== null) {
					if(typeof v === "number") {
						return `$${values.push(v)}`;
					} else {
						const Class = (v as any).constructor as typeof Model;
						const idKey = Class.getPrimaryKey();
						return `$${values.push(v![idKey as keyof typeof v])}`;
					}
				} else {
					return `$${values.push(null)}`;
				}
			} else {
				return `$${values.push(v)}`;
			}
		});

		let q = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders.join(",")}) RETURNING *`;
		console.log(q, values);
		const result = await Database.get().pool.query(q, values);

		return Model.fromRow(this, result.rows[0]);
	}

	public static update<T extends typeof Model>(this: T, _data: Partial<NewProps<InstanceType<T>>>): NewModel<InstanceType<T>> {
		throw null;
	}
}

export const id = Model.primaryKey;
export const ref = Model.ref;
export const col = Model.col;

export type ID<T extends Model> = number & {
	readonly [ID_TYPE]: T;
};

export type Ref<T extends Model | [Model] | null> =
	T extends Model ? T & { readonly [REF_TYPE]: T } :
	T extends [Model] ? T[] & { readonly [REF_TYPE]: [T] } :
	never;

type Columns = Record<string | number | symbol, ColumnMeta>;

type ColumnMeta = {
	primaryKey: boolean;
	type: ColumnTypeOf<any> | (() => ColumnRefType<any, any>);
	nullable: boolean;
	unique: boolean;
};


export type FindQuery<T extends Model> = {
	where?: Where<T> | Where<T>[];
	what?: What<T>;
	include?: boolean | Include<T>;
};

type NewKeys<T extends Model> = Exclude<ColumnKeys<T> | RefKeys<T>, IDKeys<T>>;

export type NewProps<T extends Model> = {
	[K in NewKeys<T>]:
	NonNullable<T[K]> extends Ref<infer U extends Model> ? (null extends T[K] ? U | null : U) | ID<U> :
	NonNullable<T[K]> extends Ref<infer _ extends [infer U extends Model]> ? (null extends T[K] ? U | null : U) | ID<U> :
	NonNullable<T[K]> extends string | number | boolean | Date ? T[K] :
	never;
};

export type NewModel<T extends Model> = T;

type ColumnKeys<T extends Model> = {
	[K in keyof T]: NonNullable<T[K]> extends string | number | boolean | Date ? K : never;
}[keyof T];

type RefKeys<T extends Model> = {
	[K in keyof T]: NonNullable<T[K]> extends Ref<Model> | Ref<[Model]> ? K : never;
}[keyof T];

type What<T extends Model> = ColumnKeys<T> | ColumnKeys<T>[] | "*";

type Include<T extends Model> = {
	[K in RefKeys<T>]?: boolean;
};

type Where<T extends Model> = {
	[K in WhereKeys<T>]?: WhereOp<T[K]> | WhereOp<T[K]>[];
} & {
	[K in RefKeys<T>]?: RefWhereOp<T, K>;
};

type WhereKeys<T extends Model> = {
	[K in keyof T]: T[K] extends number | boolean | string ? K : never;
}[keyof T];

type WhereOp<T> =
	T extends string ? string :
	T extends number ? number | {
		"<"?: number;
		">"?: number;
		"<="?: number;
		">="?: number;
		"!="?: number;
	} :
	T extends boolean ? boolean :
	never;

type RefModelType<T extends Model, K extends keyof T> =
	NonNullable<T[K]> extends Ref<infer U extends Model> ? U :
	NonNullable<T[K]> extends Ref<infer _ extends [infer U extends Model]> ? U :
	never;

type RefWhereOp<T extends Model, K extends keyof T> =
	RefModelType<T, K> | ID<RefModelType<T, K>> | {
		"<"?: ID<RefModelType<T, K>> | RefModelType<T, K>;
		">"?: ID<RefModelType<T, K>> | RefModelType<T, K>;
		"<="?: ID<RefModelType<T, K>> | RefModelType<T, K>;
		">="?: ID<RefModelType<T, K>> | RefModelType<T, K>;
		"!="?: ID<RefModelType<T, K>> | RefModelType<T, K>;
	};

type SelectedKeys<T extends Model, Q extends FindQuery<T>> =
	undefined extends Q["what"] ? WhereKeys<T> :
	Q["what"] extends "*" ? WhereKeys<T> :
	Q["what"] extends (WhereKeys<T>) ? Q["what"] :
	Q["what"] extends (WhereKeys<T>)[] ? Q["what"][number] :
	never;

type IncludedKeys<T extends Model, Q extends FindQuery<T>> =
	undefined extends Q["include"] ? never :
	Q["include"] extends true ? RefKeys<T> :
	keyof Q["include"] extends keyof T ? keyof Q["include"] :
	never;

type ExcludedColumnKeys<T extends Model, Q extends FindQuery<T>> = Exclude<ColumnKeys<T>, SelectedKeys<T, Q>>;
type ExcludedIncludeKeys<T extends Model, Q extends FindQuery<T>> = Exclude<keyof Include<T>, IncludedKeys<T, Q>>;

type ExcludedKeys<T extends Model, Q extends FindQuery<T>> = ExcludedColumnKeys<T, Q> | ExcludedIncludeKeys<T, Q>;

export type FindResult<T extends Model, Q extends FindQuery<T>> = Omit<T, ExcludedKeys<T, Q>>;

export type ColumnOptions = {
	unique?: boolean;
	nullable?: boolean;
};

export type ColumnOptionsOf<T extends Model, _K extends keyof T> = {
	unique?: boolean;
	nullable?: boolean;
};

export type ColumnTypeOf<T> =
	T extends number ? "serial" | "bigint" | "int" | "float" :
	T extends string ? `varchar(${number})` | "text" :
	T extends boolean ? "boolean" :
	T extends Date ? "date" :
	never;

type IDKeys<T extends Model> = {
	[K in keyof T]: T[K] extends ID<Model> ? K : never;
}[keyof T];

type WithPrimaryKey<T extends Model, U> = {} extends IDKeys<T> ? never : U;

type ColumnRefType<T extends Model, K extends keyof T> = NonNullable<T[K]> extends Ref<infer U> ? (
	U extends Model ? WithPrimaryKey<U, new () => U> :
	U extends [infer M extends Model] ? WithPrimaryKey<M, new () => M> : never
) : never;


