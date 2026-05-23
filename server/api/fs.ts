import { Router } from "express";
import { isAuthenticated } from "../middleware/authenticated.js";
import { User } from "../models/user.js";
import { StorageService } from "../services/storage.js";
import { FsEntry } from "../models/entry.js";

import { createWriteStream } from "fs";
import { Path } from "../../shared/path.js";

export const fs = Router({ strict: true });

fs.get("/ls/{*splat}", isAuthenticated, async (req, res) => {
	const path = req.url.replace("/ls", "");
	const owner = await User.findOne({ where: { id: req.session.userId! } });

	if (!owner)
		return res.json({ error: "Could not get user info!" });

	const entry = await StorageService.get().getEntry(owner, new Path(path));

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

fs.post("/mkdir/{*splat}", isAuthenticated, async (req, res) => {
	const path = req.url.replace("/mkdir", "");
	const owner = await User.findOne({ where: { id: req.session.userId! } });
	if (!owner)
		return res.json({ error: "Could not get user info!" });

	if (req.body.isFile) {
		return res.json({ error: "TODO" })
	}

	try {
		return res.json({ data: await StorageService.get().addSubDirectory(owner, path) });
	} catch (e) {
		console.log(e);
		const error = e instanceof Error ? e.message : e;
		return res.json({ error });
	}
});

fs.post("/move/{*splat}", isAuthenticated, async (req, res) => {
	const path = req.url.replace("/move", "");
	const owner = await User.findOne({ where: { id: req.session.userId! } });
	if (!owner)
		return res.json({ error: "Could not get user info!" });

	if (!req.body.target) {
		return res.json({ error: "TODO" });
	}

	try {
		return res.json({ data: await StorageService.get().moveEntry(owner, path, req.body.target) !== null });
	} catch (e) {
		console.log(e);
		const error = e instanceof Error ? e.message : e;
		return res.json({ error });
	}
});

fs.post("/upload/{*splat}", isAuthenticated, async (req, res) => {
	const path = req.url.replace("/upload", "");
	const owner = await User.findOne({ where: { id: req.session.userId! } });
	if (!owner)
		return res.json({ error: "Could not get user info!" });

	let filename = req.header("X-Filename");

	if (!filename)
		return res.json({ error: "Missing filename!" });

	filename = decodeURIComponent(filename);
	console.log(`uploading ${filename}`);
	let fullPath = (path === "/" ? "" : path) + "/" + filename;

	const entry = await StorageService.get().createFileEntry(owner, fullPath);
	if (!entry) {
		return res.json({ error: "Could not create file!" });
	}

	const absolutePath = StorageService.get().absolutePath(owner, entry.path);

	const writeStream = createWriteStream(absolutePath);

	req.pipe(writeStream);
	let didError = false;
	req.on("end", () => {
		if (!didError)
			res.json({ data: true });
		else
			res.end();
	});

	return req.on("error", (err) => {
		didError = true;
		console.error(err);
		res.json({ error: { name: err.name, message: err.message } });
	});
});