import path from "path";
import type { Path } from "../../shared/path.js";
import { FsEntry } from "../models/entry.js";
import type { User } from "../models/user.js";
import { Service } from "./service.js";
import { existsSync, mkdirSync, rmSync } from "fs";
import { mkdir } from "fs/promises";

export class FsService extends Service {
	public readonly storageRoot: string = this.initStorageRoot();

	public async readDir(owner: User, path: Path): Promise<FsEntry[] | null> {
		const parent = await this.resolveEntry(owner, path);
		if (!parent)
			return null;

		const entries = await FsEntry.find({ where: { parent, owner }, include: true });
		console.log(entries);
		return entries;
	}

	private initStorageRoot(): string {
		const root = path.posix.normalize(path.resolve(process.cwd(), process.env["STORAGE_ROOT_DIR"] || "dist/storage"));
		console.log("init storage root", process.cwd(), process.env["STORAGE_ROOT_DIR"] || "dist/storage");
		if (!existsSync(root)) {
			mkdirSync(root);
		}
		return root;
	}

	public async createFs(owner: User) {
		const absolutePath = path.resolve(this.storageRoot, owner.id.toString());
		if (!existsSync(absolutePath)) {
			await mkdir(absolutePath, { recursive: true });
			await FsEntry.insert({ parent: null, name: "/", owner, isFile: false });
		}
	}

	public async resolveEntry(owner: User, path: Path): Promise<FsEntry | null> {
		const [, ...rest] = path.parts;
		let target = await FsEntry.findOne({ where: { name: "/", owner }, include: true });
		for (const part in rest) {
			if (!target)
				return null;
			target = await FsEntry.findOne({ where: { name: part, parent: target, owner }, include: true });
		}
		return target;
	}

	public async mkdir(owner: User, path: Path) {
		const parent = await this.resolveEntry(owner, path.dirname());
		const dirname = path.basename();
		return await FsEntry.insert({ isFile: false, name: dirname.toString(), owner, parent });
	}

	//	// i think this must be blocking to prevent having requests coming in?
	//	// or maybe should i queue the requests and resume them when all the resets are done? 
	public reset() {
		rmSync(this.storageRoot, { recursive: true, force: true });
		this.initStorageRoot();
	}
}