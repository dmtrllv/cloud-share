import { Router } from "express";
import { isAuthenticated } from "../middleware/authenticated.js";
import { User } from "../models/user.js";
import { StorageService } from "../services/storage.js";
import { FsEntry } from "../models/entry.js";

export const fs = Router({ strict: true });

fs.get("{*splat}", isAuthenticated, async (req, res) => {
	const owner = await User.findOne({ where: { id: req.session.userId! } });

	if (!owner)
		return res.json({ error: "Could not get user info!" });

	const entry = await StorageService.get().getEntry(owner, req.url);

	if (!entry) {
		return res.json({ error: "Could not find entry!" });
	}

	if (entry.isFile) {
		return res.json({ data: entry });
	}

	return res.json({
		data: {
			entry,
			children: await FsEntry.find({ where: { owner, parent: entry } })
		}
	});
});

fs.post("{*splat}", isAuthenticated, async (req, res) => {
	const owner = await User.findOne({ where: { id: req.session.userId! } });
	if (!owner)
		return res.json({ error: "Could not get user info!" });
	console.log("create path", req.url, " for owner", owner.id);

	if (req.body.isFile) {
		return res.json({ error: "TODO" })
	}

	try {
		return res.json({ data: await StorageService.get().addSubDirectory(owner, req.url) });
	} catch (e) {
		console.log(e);
		return res.json({ error: e });
	}
});