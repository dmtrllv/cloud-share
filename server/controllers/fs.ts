import { Path } from "../../shared/path.js";
import { Session } from "../contexts/session.js";
import { ctx } from "../framework/context.js";
import { Controller, data } from "../framework/controller.js";
import { del, get, post } from "../framework/http.js";
import type { FsEntry } from "../models/entry.js";
import { StorageService } from "../services/storage.js";

export class Fs extends Controller {
	private readonly fs = StorageService.get();

	@ctx(Session)
	public readonly session!: Session<any>;

	@get("/fs/stat")
	public async getEntry(@data(String) path: string): Promise<FsEntry | null> {
		const owner = await this.session.getUser();
		return this.fs.getEntry(owner, new Path(path));
	}

	@post("/fs/file")
	public writeFile(_path: string, _buffer: Buffer): Promise<boolean> {
		throw new Error("TODO");
	}

	@get("/fs/file")
	public readFile(_path: string | FsEntry): Promise<Buffer> {
		throw new Error("TODO");
	}

	@del("/fs/file")
	public removeFile(_path: string | FsEntry): Promise<boolean> {
		throw new Error("TODO");
	}

	@post("/fs/dir")
	public async mkDir(path: string): Promise<boolean> {
		const owner = await this.session.getUser();
		await this.fs.addSubDirectory(owner, path);
		return true;
	}

	@get("/fs/dir")
	public async readDir(@data(String) path: string): Promise<FsEntry[]> {
		const owner = await this.session.getUser();
		return this.fs.readDir(owner, new Path(path));
	}

	@del("/fs/dir")
	public removeDir(_path: string | FsEntry): Promise<boolean> {
		throw new Error("TODO");
	}

	@post("/fs/copy")
	public copy(_source: Path | FsEntry, _target: Path | FsEntry): Promise<boolean> {
		throw new Error("TODO");
	}

	@post("/fs/move")
	public move(_source: Path | FsEntry, _target: Path | FsEntry): Promise<boolean> {
		throw new Error("TODO");
	}
}


export interface FsContext {

}