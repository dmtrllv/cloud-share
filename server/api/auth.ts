import { Router } from "express";
import { string, validateBody } from "../middleware/body.js";
import { User } from "../models/user.js";
import { AccountService } from "../services/account.js";

export const auth = Router();

const validate = () => validateBody({ username: string, password: string });

auth.get("/login", async (req, res) => {
	if (req.session.userId !== undefined) {
		const user = await User.findOne({ where: { id: req.session.userId } });
		if (user) {
			return res.json({ data: { username: user.username } });
		}
	}
	return res.json({ data: false });
});

auth.post("/login", validate(), async (req, res) => {
	console.log("/login")
	try {
		const ok = await AccountService.get().login(req.body.username, req.body.password);
		if (ok) {
			const user = await User.findOne({ where: { username: req.body.username } });
			if (!user)
				return res.json({ data: false });

			req.session.userId = user.id;
		}

		return res.json({ data: ok });
	} catch (e) {
		console.log(e);
		return res.end();
	}
});

auth.post("/register", validate(), (_req, res) => {
	res.json("/register");
});

auth.post("/logout", (_req, res) => {
	_req.session.destroy((err) => {
		if(err)
			console.error(err);
		res.json({ data: true });
	});
});