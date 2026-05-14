import path from "node:path";
import posixPath from "node:path/posix";
import { mkdir } from "node:fs/promises";
import type { User } from "../models/user.js";
import { Service } from "./service.js";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { FsEntry } from "../models/entry.js";

export class StorageService extends Service {
	public readonly storageRoot: string = this.initStorageRoot();

	private initStorageRoot(): string {
		const root = path.resolve(process.cwd(), process.env.STORAGE_ROOT_DIR || "dist/storage");
		if (!existsSync(root)) {
			mkdirSync(root);
		}
		return root;
	}

	public async initStorage(owner: User) {
		const absolutePath = path.resolve(this.storageRoot, owner.id.toString());
		if (!existsSync(absolutePath)) {
			await mkdir(absolutePath, { recursive: true });
			await FsEntry.insert({ parent: null, path: "/", owner, isFile: false });
		}
	}

	public async getEntry(owner: User, entryPath: string): Promise<FsEntry | null> {
		return FsEntry.findOne({ where: { path: posixPath.normalize(entryPath), owner: owner.id }, include: true });
	}

	// TODO: handle recursive creation (fs and database)
	public async addSubDirectory(owner: User, dir: string) {
		dir = posixPath.normalize(dir);
		const absolutePath = path.resolve(this.storageRoot, owner.id.toString(), "./" + dir);

		if (existsSync(absolutePath)) {
			throw new Error(`${dir} already exists!`);
		}

		await mkdir(absolutePath, { recursive: true });
		const parent = await FsEntry.findOne({ what: ["id"], where: { path: posixPath.dirname(dir) } });

		if (!parent) {
			throw new Error(`Could not get parent entry for ${dir}!`);
		}

		return await FsEntry.insert({ parent: parent.id, path: dir, owner, isFile: false });
	}

	// i think this must be blocking to prevent having requests coming in?
	// or maybe should i queue the requests and resume them when all the resets are done? 
	public reset() {
		rmSync(this.storageRoot, { recursive: true, force: true });
		this.initStorageRoot();
	}
}