/// <reference path="./env.d.ts" />

import dotenv from "dotenv";

dotenv.config({
	quiet: true,
	path: `.env.${process.env.NODE_ENV || "development"}`
});

export function env(key: keyof Env): string | undefined;
export function env<T extends number | string>(key: keyof Env, defaultValue: T): T;
export function env<T extends number | string>(key: keyof Env, defaultValue?: T): any {
	const val = process.env[key];
	if (defaultValue !== undefined) {
		if (val == undefined) {
			return defaultValue;
		} else if (typeof defaultValue === "number") {
			return Number(val);
		}
	}
	return process.env[key];
}

export const isDev = process.env["NODE_ENV"] !== "production";
export const isProd = !isDev;
