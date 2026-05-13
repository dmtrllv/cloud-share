import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import PgStore from "connect-pg-simple";

import { api } from "./api/index.js";
import { Database } from "./db/db.js";
import { AccountService } from "./services/account.js";
import { env } from "./env.js";
import { Cli } from "./cli/cli.js";

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


if (process.env.NODE_ENV !== "production") {
	app.get("/", (_, res) => res.redirect("http://localhost:5173"));
}

app.use("/api", bodyParser.json());
app.use("/api", api);

app.use((req, res) => {
	console.log(`${req.url} not found!`);
	res.status(404).end();
});

const HOST = env("HOST", "127.0.0.1");
const PORT = env("PORT", 3001);

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://127.0.0.1:3001`);
});

Cli.get().start();