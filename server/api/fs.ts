import { Router } from "express";
import { isAuthorized } from "../middleware/authorized.js";
import { FsEntry } from "../models/entry.js";
import { User } from "../models/user.js";
import { StorageService } from "../services/storage.js";
import path from "node:path";

export const fs = Router({ strict: true });

fs.get("{*splat}", isAuthorized, async (req, res) => {
	const owner = User.id(req.session.userId!);
	const p = path.resolve(path.join(StorageService.get().storageRoot, owner.toString(), req.url));

	console.log(p);
	const entry = await FsEntry.findOne({ where: { owner, path: p } });

	if (!entry) {
		return res.json({ error: "?" });
	}

	if (entry.isFile) {
		return res.json({ data: "file" });
	}

	return res.json({ data: await FsEntry.find({ where: { owner, parent: entry as any } }) });
});