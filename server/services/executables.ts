import type { User } from "../models/user.js";
import { Service } from "./service.js";
import { Executable } from "../models/executable.js";
import type { Path } from "../../shared/path.js";
import { FsService } from "./fs.js";

export class ExecutablesService extends Service {
	public async getExecutables(owner: User) {
		return await Executable.find({ where: { owner } })
	}

	public async addExecutable(owner: User, path: Path, isPublic: boolean = false) {
		const fsEntry = await FsService.get().resolveEntry(owner, path);
		if (!fsEntry || fsEntry.isFile) {
			throw new Error("Cannot make executable");
		}
		return await Executable.insert({ fsEntry, owner, isPublic });
	}
}