import { EventEmitter } from "../../event-emitter";

export const storageEvents = new EventEmitter<StorageEvents>();

export type StorageEvents = {
	readonly mkdir: MakeDirEvent;
};

export type MakeDirEvent = {
	readonly newDirName: string;
	readonly parentPath: string;
};