import { EventEmitter } from "../../event-emitter";
import type { Path } from "../../utils/path";

export const storageEvents = new EventEmitter<StorageEvents>();

export type StorageEvents = {
	readonly mkdir: MakeDirEvent;
	readonly move: MoveEvent;
};

export type MakeDirEvent = {
	readonly newDirName: string;
	readonly parentPath: Path;
};

export type MoveEvent = {
	readonly entry: Path;
	readonly target: Path;
};