import { Router } from "express";
import { AccountService } from "../services/account.js";

export const users = Router({ strict: true });

users.post("/register", async (req, res): Promise<any> => {
	if (!("username" in req.body))
		return res.json({ error: "missing username" });
	if (!("password" in req.body))
		return res.json({ error: "missing password" });

	if (!await AccountService.get().createAccount(req.body.username, req.body.password)) {
		return res.json({ error: "could not create account" });
	}

	return res.json({ data: true });
});