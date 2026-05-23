import path from "node:path";
import posixPath from "node:path/posix";
import { mkdir } from "node:fs/promises";
import type { User } from "../models/user.js";
import { Service } from "./service.js";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { rm, cp } from "node:fs/promises";
import { FsEntry } from "../models/entry.js";
import type { Path } from "../../shared/path.js";

export class StorageService extends Service {
	public absolutePath(owner: User, p: string) {
		p = posixPath.normalize(p);
		return path.resolve(this.storageRoot, owner.id.toString(), "./" + p);
	}

	public async createFileEntry(owner: User, filePath: string): Promise<FsEntry | null> {
		filePath = posixPath.normalize(filePath);
		const absolutePath = path.resolve(this.storageRoot, owner.id.toString(), "./" + filePath);

		if (existsSync(absolutePath)) {
			throw new Error(`${filePath} already exists!`);
		}

		const parent = await FsEntry.findOne({
			what: ["id"],
			where: {
				path: posixPath.dirname(filePath)
			}
		});

		if (!parent) {
			throw new Error(`Could not get parent entry for ${filePath}!`);
		}

		return await FsEntry.insert({ parent: parent.id, path: filePath, owner, isFile: true });
	}

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

	public async getEntry(owner: User, entryPath: Path): Promise<FsEntry | null> {
		return FsEntry.findOne({ where: { path: entryPath.normalize().toString(), owner: owner.id }, include: true });
	}

	public async readDir(owner: User, entryPath: Path): Promise<FsEntry[]> {
		const entry = await FsEntry.findOne({
			where: {
				owner,
				path: entryPath.normalize().toString(),
			},
			include: true
		});

		if (!entry)
			return [];

		const children = await FsEntry.find({
			where: {
				owner,
				parent: entry,
			},
			include: true
		});

		return children;
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

	public async moveEntry(owner: User, entryPath: string, targetPath: string) {
		entryPath = posixPath.normalize(entryPath);
		const absolutePath = path.resolve(this.storageRoot, owner.id.toString(), "./" + entryPath);
		targetPath = posixPath.normalize(targetPath);
		const absoluteTargetPath = path.resolve(this.storageRoot, owner.id.toString(), "./" + targetPath, path.basename(entryPath));
		const newPath = posixPath.normalize(targetPath + "/" + path.basename(entryPath));
		const parent = await FsEntry.findOne({ where: { path: targetPath }, what: "id" });
		console.log({ entryPath });
		const entry = await FsEntry.findOne({ where: { path: entryPath }, what: "id" });

		if (!parent) {
			throw new Error("parent == null");
		}

		if (!entry) {
			throw new Error("entry == null");
		}

		await cp(absolutePath, absoluteTargetPath, { recursive: true });
		const updatedEntries = await FsEntry.update({ id: entry.id }, { parent: parent.id, path: newPath });

		if (updatedEntries.length === 0) {
			console.warn("? nothing updated?");
			return null;
		}

		await rm(absolutePath, { recursive: true, force: true });

		return updatedEntries[0]!;
	}

	// i think this must be blocking to prevent having requests coming in?
	// or maybe should i queue the requests and resume them when all the resets are done? 
	public reset() {
		rmSync(this.storageRoot, { recursive: true, force: true });
		this.initStorageRoot();
	}
}