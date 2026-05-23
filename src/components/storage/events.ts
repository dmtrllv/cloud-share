import { EventEmitter } from "../../event-emitter";
import type { Path } from "@shared";

export const storageEvents = new EventEmitter<StorageEvents>();

export type StorageEvents = {
	readonly mkdir: MakeDirEvent;
	readonly move: MoveEvent;
	readonly upload: UploadEvent;
};

export type MakeDirEvent = {
	readonly newDirName: string;
	readonly parentPath: Path;
};

export type MoveEvent = {
	readonly entry: Path;
	readonly target: Path;
};

export type UploadEvent = {
	readonly name: string;
	readonly target: Path;
};