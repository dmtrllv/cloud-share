import express, { type Request, type Response } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import PgStore from "connect-pg-simple";

import { Database } from "./db/db.js";
import { AccountService } from "./services/account.js";
import { env, isDev } from "./env.js";
import { Cli } from "./cli/cli.js";
import { getHttpHandlers, Html, HttpTransport, Js, type HttpHandler, type HttpMethod } from "./framework/http.js";
import { getControllerArgTypes } from "./framework/controller.js";
import { getContextsFrom } from "./framework/context.js";

import "./controllers/index.js";
import { ParseError, parseType } from "../shared/typed.js";
import multer from "multer";

const dbInit = async (db: Database) => {
	await AccountService.get().createAccount("admin", "admin");

	await db.pool.query(`
		CREATE TABLE IF NOT EXISTS user_sessions (
			sid character varying PRIMARY KEY NOT NULL,
			sess json NOT NULL,
			expire timestamp(6) without time zone NOT NULL
		);
	`);
};

await Database.configure({
	user: env("DB_USER", "postgres"),
	password: env("DB_PASS", "root"),
	database: env("DB_NAME", "cloud-share"),
	host: env("DB_HOST", "localhost"),
	port: env("DB_PORT", 5432),
}, dbInit);

const app = express();

app.use(session({
	store: new (PgStore(session))({
		tableName: "user_sessions",
		pool: Database.get().pool,
	}),
	secret: process.env.SESSION_SECRET || "waterbears",
	resave: false,
	rolling: true,
	saveUninitialized: false
}));


if (isDev)
	app.get("/", (_, res) => res.redirect("http://localhost:5173"));

app.use(bodyParser.json());

const mapError = (e: any) => {
	if (e instanceof Error) {
		return isDev ? { name: e.name, stack: e.stack } : { name: "Internal server error!" };
	}
	return e;
}

const transport = new HttpTransport();

const initHandler = ({ target, key }: HttpHandler<any>) => async (req: Request, res: Response) => {
	try {
		const controller = new target();
		const contexts = getContextsFrom(target);

		for (const k in contexts) {
			const Context = contexts[k]!;
			controller[k] = await transport.getContext(Context, req);
		}

		let args = (req.method === "GET" ? Object.keys(req.query) : req.body);

		if (!Array.isArray(args))
			return res.json({ error: { name: "Passed data should be an array!" } });

		const argTypes = getControllerArgTypes(target, key);

		for (let i = args.length; i < argTypes.length; i++) {
			args[i] = undefined;
		}

		let parseErrors: ParseError[] = [];

		args = await Promise.all(args.map(async (arg: any, index: number) => {
			const argType = argTypes[index] as any;
			if (Array.isArray(argType)) {
				const [, pathInit] = argType;
				const filePath = await pathInit(controller);
				const x = multer({ dest: filePath }).single("file");
				await new Promise(resolve => x(req, res, (val) => resolve(val)));
				console.log(filePath, req.file);
			} else if (argType === undefined || argType.type === undefined) {
				return arg;
			} else {
				const result = parseType(argType.type, arg) as any;

				if (result.errors) {
					parseErrors.push(...result.errors);
				}
				return result.data as any;
			}
		}));

		if (parseErrors.length) {
			return res.json({ error: { name: "ParseError", errors: parseErrors } });
		}

		const result = await controller[key](...args);

		res.status(200);

		if (result instanceof Html) {
			return res.end(result.data);
		} else if (result instanceof Js) {
			res.setHeader("Content-Type", "application/javascript");
			return res.end(result.data);
		} else {
			return res.json({ data: result });
		}
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: mapError(e) });
	}
};

const handlers = getHttpHandlers();
for (const [path, methods] of handlers) {
	for (const key in methods) {
		const method = key as HttpMethod;
		const handler = methods[method]!;
		console.log(`init http handler [${method}] ${path}`);
		switch (method as HttpMethod) {
			case "GET":
				app.get(path, initHandler(handler));
				break;
			case "POST":
				app.post(path, initHandler(handler));
				break;
			case "PUT":
				app.put(path, initHandler(handler));
				break;
			case "DELETE":
				app.delete(path, initHandler(handler));
				break;
		}
	}
}

app.use((req, res) => {
	console.log(`${req.url} not found!`);
	res.status(404).end();
});

const HOST = env("HOST", "127.0.0.1");
const PORT = env("PORT", 3001);

app.listen(PORT, HOST, (err) => {
	if (err) {
		console.log(err);
		process.exit(0);
	}
	console.log(`Server listening on http://127.0.0.1:3001`);
});

Cli.get().start();
