import { Database } from "../../db/db.js";
//import { StorageService } from "../../services/storage.js";
import { FsService } from "../../services/fs.js";
import { Command } from "./command.js";

export class Reset extends Command {
	public override async run(_args: string[]) {
		await FsService.get().reset();
		await Database.get().reset();
	}
}