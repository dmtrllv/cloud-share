//import { createContext, useContext, useState, type PropsWithChildren } from "react";
//import { Path } from "@shared";

//export type FsEntry = {
//	readonly path: string;
//	readonly isFile: boolean;
//};

//export interface FsContext {
//	get cwd(): Path;
//	setCwd(value: Path | string): void;

//	getEntry(path: Path): Promise<FsEntry>;
//	writeFile(path: Path, buffer: Buffer): Promise<boolean>;
//	readFile(path: Path | FsEntry): Promise<Buffer>;
//	removeFile(path: Path | FsEntry): Promise<boolean>;
//	mkDir(path: Path): Promise<boolean>;
//	readDir(path: Path | FsEntry): Promise<FsEntry>;
//	removeDir(path: Path | FsEntry): Promise<boolean>;
//	copy(source: Path | FsEntry, target: Path | FsEntry): Promise<boolean>;
//	move(source: Path | FsEntry, target: Path | FsEntry): Promise<boolean>;
//}

//export const FsContext = createContext<FsContext | null>(null);

//export const useFs = () => {
//	const ctx = useContext(FsContext);
//	if (ctx === null) {
//		throw new Error("No FsContext provided!");
//	}
//	return ctx;
//};

//export const Fs = ({ children, cwd }: PropsWithChildren<{ cwd: Path | string }>) => {
//	const [currentCwd, setCwd] = useState(() => new Path(cwd));
	
//	const ctx: FsContext = {
//		get cwd() {
//			return currentCwd as Path;
//		},
//		setCwd: (path) => setCwd(new Path(path)),
//		copy(source, target) {
//			throw new Error("TODO");
//		},
//		getEntry(path) {
//			throw new Error("TODO");
//		},
//		mkDir(path) {
//			throw new Error("TODO");
//		},
//		move(source, target) {
//			throw new Error("TODO");
//		},
//		readDir(path) {
//			throw new Error("TODO");
//		},
//		readFile(path) {
//			throw new Error("TODO");
//		},
//		removeDir(path) {
//			throw new Error("TODO");
//		},
//		removeFile(path) {
//			throw new Error("TODO");
//		},
//		writeFile(path, buffer) {
//			throw new Error("TODO");
//		},
//	};
	
//	return (
//		<FsContext.Provider value={ctx}>
//			{children}
//		</FsContext.Provider>
//	);
//};