declare interface Env {
	readonly NODE_ENV?: "development" | "production" | "test";
	readonly STORAGE_ROOT_DIR?: string;
	readonly SESSION_SECRET?: string;
	readonly DB_USER?: string;
	readonly DB_PASS?: string;
	readonly DB_HOST?: string;
	readonly DB_PORT?: string;
	readonly DB_NAME?: string;
	readonly HOST?: string;
	readonly PORT?: string;
}

declare namespace NodeJS {
	interface ProcessEnv extends Env { }
}