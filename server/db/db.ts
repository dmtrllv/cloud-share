import type { PoolConfig } from "pg";
import pg from "pg";
import type { Model } from "./model.js";

export class Database {
	private static instance: Database | null = null;

	public static get(): Database {
		if (this.instance === null)
			throw new Error("Database is not configured yet!");
		return this.instance;
	}

	private static tables: Table[] = [];

	public static async configure(options: PoolConfig, initCallback?: (database: Database) => any) {
		if (!this.instance) {
			this.instance = new Database(options, initCallback);
			const names = await this.instance.getAllTableNames();

			await this.instance.setupTables();

			if (names.length === 0) {
				await initCallback?.(this.instance);
			}
		}

		return this.instance;
	}

	public static readonly getTable = (name: string): Table | null => {
		return this.tables.find(t => t.name === name) || null;
	}

	public static readonly getTableFromType = (type: typeof Model): Table | null => {
		return this.tables.find(t => t.modelType === type) || null;
	}

	public static readonly registerTable = <T extends typeof Model>(tableName?: string) => (Class: T) => {
		const name = tableName || Class.name.toLowerCase() + "s";
		if (name in this.tables) {
			throw new Error(`Duplicate table found for name "${name}"!`);
		}
		this.tables.push({
			name,
			modelType: Class,
		});
		Class["_tableName"] = name;
	};

	public readonly pool: pg.Pool;

	private readonly initCallback: ((database: Database) => any) | undefined;

	private constructor(options?: PoolConfig, initCallback?: (database: Database) => any) {
		this.pool = new pg.Pool(options);
		this.initCallback = initCallback;
	}

	public async reset() {
		await this.pool.query(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
		`);
		await this.setupTables();
		await this.initCallback?.(this);
	}

	private async getAllTableNames(): Promise<string[]> {
		const x = await this.pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`);
		return x.rows.map(r => r.table_name);
	}

	private async exists(tableName: string) {
		const exists = await this.pool.query(`
		  	SELECT EXISTS (
		  		SELECT 1
		  		FROM information_schema.tables
		  		WHERE table_schema = 'public' AND table_name = '${tableName}'
		  	) AS exists
		`);
		return exists.rows[0]?.["exists"] || false;
	}

	private async createTable<T extends typeof Model>(Class: T, tableName: string): Promise<boolean> {
		const created = !await this.exists(tableName);

		if (!created)
			return false;

		const foreignKeys = [];

		const columns = Class["columns"] || {};

		const colStrings = Object.keys(columns).map((key) => {
			const { primaryKey, type, nullable, unique } = columns![key]!;

			if (primaryKey) {
				return `"${key}" SERIAL PRIMARY KEY`;
			} else if (typeof type === "function") /* ref */ {
				foreignKeys.push(key);
				const ref = Class.getRefModel(key);

				if (!ref) {
					throw new Error(`Could not get referenced Model for ${tableName}.${key}!`);
				}

				let str = `"${key}" INT`;
				if (!nullable) {
					str += " NOT NULL";
				}
				if (unique) {
					str += " UNIQUE";
				}
				return str;
			} else {
				let str = `"${key}" ${type}`;
				if (!nullable) {
					str += " NOT NULL";
				}
				if (unique) {
					str += " UNIQUE";
				}
				return str;
			}
		});

		const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${colStrings.map(s => "\t" + s).join(",\n")}\n)`;
		console.log(sql);
		await this.pool.query(sql);
		return true;
	}

	private async createReferences<T extends typeof Model>(Class: T, name: string): Promise<void> {
		const foreignKeys = [];

		const columns = Class["columns"] || {};

		const colStrings = Object.keys(columns).map((key) => {
			const { primaryKey, type, nullable, unique } = columns![key]!;

			if (primaryKey) {
				return null;
			} else if (typeof type === "function") {
				foreignKeys.push(key);
				const ref = Class["getRefModel"](key);

				if (!ref) {
					throw new Error(`Could not get referenced Model for ${name}.${key}!`);
				}

				let str = `${key} INT`;
				if (!nullable) {
					str += " NOT NULL";
				}
				if (unique) {
					str += " UNIQUE";
				}

				const t = Database.tables.find(t => t.modelType === ref);
				if (!t) {
					throw "?";
				}
				const refIdKey = ref.getPrimaryKey();
				if (!refIdKey) {
					throw "?";
				}
				return `ADD CONSTRAINT fk_${key} FOREIGN KEY (${key}) REFERENCES ${t.name}(${refIdKey})`;
			} else {
				return null;
			}
		}).filter(s => !!s);

		if (colStrings.length > 0) {
			const query = `ALTER TABLE ${name}\n${colStrings.map(s => "\t" + s).join(",\n")}`;
			console.log(query);
		}
	}

	private async setupTables() {
		let createdTables: Table[] = [];
		for (const table of Database.tables) {
			const { name, modelType } = table;
			if (await this.createTable(modelType, name)) {
				createdTables.push(table);
			}
		}

		await Promise.all(createdTables.map(({ name, modelType }) => this.createReferences(modelType, name)));
	}
}

export const table = Database.registerTable;

type Table = {
	name: string;
	modelType: typeof Model,
};