import { Path } from "../../shared/path.js";
import { Session } from "../contexts/session.js";
import { ctx } from "../framework/context.js";
import { Controller, data } from "../framework/controller.js";
import { del, get, post } from "../framework/http.js";
import type { FsEntry } from "../models/entry.js";
import { FsService } from "../services/fs.js";

export class Fs extends Controller {
	private readonly fs = FsService.get();

	@ctx(Session)
	public readonly session!: Session<any>;

	@get("/fs/stat")
	public async stat(@data(String) path: string): Promise<FsEntry | null> {
		const owner = await this.session.getUser();
		return this.fs.resolveEntry(owner, new Path(path));
	}

	@post("/fs/file")
	public writeFile(@data(String) path: string, buffer: Uint8Array<ArrayBuffer>): Promise<boolean> {
		console.log("write file", path, buffer);
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
		await this.fs.mkdir(owner, new Path(path));
		return true;
	}

	@get("/fs/dir")
	public async readDir(@data(String) path: string): Promise<FsEntry[] | null> {
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
	public async move(_source: string, _target: string): Promise<boolean> {
		//const _owner = await this.session.getUser();
		//const result = await this.fs.moveEntry(owner, source, target);
		//return result !== null;
		return false;
	}
}

export interface FsContext {

}