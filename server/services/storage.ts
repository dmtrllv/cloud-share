import path from "node:path";
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
		const relativePath = owner.id.toString();
		const absolutePath = path.resolve(this.storageRoot, relativePath);

		if (!existsSync(absolutePath)) {
			await mkdir(absolutePath, { recursive: true });
			await FsEntry.insert({ parent: null, path: relativePath, owner, isFile: false });
		}
	}

	public async addSubDirectory(owner: User, parent: FsEntry, name: string) {
		const relativePath = path.join(parent.path, name);
		const absolutePath = path.resolve(this.storageRoot, relativePath);

		if (!existsSync(absolutePath)) {
			await mkdir(absolutePath, { recursive: true });
			await FsEntry.insert({ parent: null, path: relativePath, owner, isFile: false });
		}
	}

	// i think this must be blocking to prevent having requests coming in?
	// or maybe should i queue the requests and resume them when all the resets are done? 
	public reset() {
		rmSync(this.storageRoot, { recursive: true, force: true });
		this.initStorageRoot();
	}
}