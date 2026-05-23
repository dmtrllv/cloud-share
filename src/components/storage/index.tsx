import { useEffect, useRef, useState } from "react"
import { api2 } from "../../api";
import { PathBar } from "./path-bar";
import { storageEvents, type MakeDirEvent, type MoveEvent, type UploadEvent } from "./events";
import { useWindowContext } from "../wm";
import { Titlebar } from "./title-bar";
import { EntryView } from "./list-entry";
import { useStorageDragDropContext } from "./drag-drop";
import { parseError } from "../error";
import { Path } from "@shared";

import "./styles/storage.scss";

export const Storage = ({ path = "/" }: { path?: string }) => {
	const windowContext = useWindowContext();
	const dragDropContext = useStorageDragDropContext();

	const reqId = useRef(0);
	const [state, setState] = windowContext.useState<StorageState>({ requestingPath: new Path(path), viewingPath: null, entries: [] });
	const [addFolderState, setAddFolderState] = useState<AddFolderState>({ show: false, name: "" });

	const currentPath = state.requestingPath || state.viewingPath || new Path("/");

	const nextId = () => {
		reqId.current += 1;
		return reqId.current;
	};

	const addFolderInputRef = useRef<HTMLInputElement>(null);

	const openPath = async (path: Path) => {
		const id = nextId();
		const res = await api2.fs.readDir(path.toString());
		if (id !== reqId.current)
			return;

		if (res.data) {
			setState({
				requestingPath: null,
				viewingPath: path,
				entries: res.data.map(e => ({ ...e, path: Path.join(path, e.name) }))
			});
		} else {
			console.error(res.error);
			setState({
				error: res.error,
				entries: []
			});
		}
	};

	const addFolder = async () => {
		const name = addFolderState.name;
		if (!state.error && name && state.viewingPath) {
			const { data, error } = await api2.fs.mkDir(Path.join(currentPath, name).toString());
			if (data) {
				setAddFolderState({ show: false, name: "" });
				storageEvents.emit("mkdir", { parentPath: currentPath, newDirName: name });
			} else {
				setAddFolderState({ ...addFolderState, error: typeof error === "string" ? error : error?.message });
			}
		}
	};

	const onNewFolder = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setAddFolderState({ show: !addFolderState.show, name: "" });
	};

	const onNewFolderSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		e.stopPropagation();
		addFolder();
	};

	useEffect(() => {
		if (state.requestingPath)
			openPath(state.requestingPath);
	}, [path]);

	useEffect(() => {
		const handler = () => {
			if (addFolderState.show)
				setAddFolderState({ show: false, name: "" });
		};

		window.addEventListener("click", handler);

		if (addFolderState.show && addFolderInputRef.current !== null) {
			addFolderInputRef.current.focus();
		}

		return () => {
			window.removeEventListener("click", handler);
		};
	}, [addFolderState]);

	useEffect(() => {
		const onMakeDir = (e: MakeDirEvent) => {
			if (e.parentPath.equals(currentPath)) {
				const p = Path.join(currentPath, e.newDirName);
				const f = state.entries.find(u => p.equals(u.path));
				if (!f) {
					setState((state) => ({
						...state,
						entries: [
							...state.entries,
							{ isFile: false, path: p }
						]
					}));
				}
			}
		};

		const onMove = (e: MoveEvent) => {
			if (e.target.equals(currentPath)) {
				const newEntryName = e.entry.basename();
				const p = Path.join(currentPath, newEntryName);
				const f = state.entries.find(u => p.equals(u.path));
				console.log("on move", p, f);
				if (!f) {
					setState((state) => ({
						...state,
						entries: [
							...state.entries,
							{ isFile: false, path: p }
						]
					}));
				}
			}
			else {
				const parentPath = e.entry.dirname();
				if (parentPath.equals(currentPath)) {
					setState((state) => {
						const newEntries = [...state.entries];
						const index = newEntries.findIndex(entry => e.entry.equals(entry.path));
						if (index > -1)
							newEntries.splice(index, 1);

						return {
							...state,
							entries: newEntries
						};
					});
				}
			}
		};

		const onUpload = (e: UploadEvent) => {
			if (e.target.equals(currentPath)) {
				const p = Path.join(currentPath, e.name);
				const f = state.entries.find(u => p.equals(u.path));
				if (!f) {
					setState((state) => ({
						...state,
						entries: [
							...state.entries,
							{ isFile: true, path: p }
						]
					}));
				}
			}
		}

		storageEvents.on("mkdir", onMakeDir);
		storageEvents.on("move", onMove)
		storageEvents.on("upload", onUpload);
		return () => {
			storageEvents.remove("mkdir", onMakeDir);
			storageEvents.remove("move", onMove);
			storageEvents.remove("upload", onUpload);
		};
	}, [currentPath]);

	const close = () => {
		if (windowContext.componentCount() > 1) {
			windowContext.close();
		}
	};

	const onMouseUp = async () => {
		if (!dragDropContext.dragState)
			return;

		if ("windowId" in dragDropContext.dragState) {
			if (dragDropContext.dragState.windowId === windowContext.id)
				return;
		}

		if (!("path" in dragDropContext.dragState))
			return;

		const path = dragDropContext.dragState.path as Path;

		if (path.equals(currentPath)) {
			console.log(`path === currentPath`, path);
			return;
		}

		const result = await api2.fs.move(path.toString(), currentPath.toString());

		if (result.data) {
			console.log("emit move", { entry: path, target: currentPath });
			storageEvents.emit("move", { entry: path, target: currentPath });
		} else {
			console.error(result.error);
		}
	};

	const vp = state.viewingPath || new Path("/");

	const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		const file = e.dataTransfer?.files?.[0];
		if (!file)
			return;
		const path = Path.join(currentPath, file.name);
		const res = await api2.fs.writeFile(path.toString(), file as any);

		if (res.data) {
			storageEvents.emit("upload", { name: file.name, target: currentPath });
		}
	};

	return (
		<div className="storage">
			<div className="dir-view" onMouseUp={onMouseUp} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
				<Titlebar onClose={close} closable={windowContext.componentCount() > 1} startDrag={windowContext.startDrag} path={vp} />
				<PathBar openPath={openPath} path={vp} onNewFolder={onNewFolder} />
				<div className="entries">
					{state.entries.length === 0 ? <div>Nothing here yet!</div> : null}
					{state.entries.map(e => <EntryView key={e.path.toString()} windowId={windowContext.id} openPath={openPath} path={new Path(e.path)} isFile={e.isFile} />)}
					{state.error && <h1>Error: {parseError(state.error)}</h1>}
				</div>
				<form onSubmit={onNewFolderSubmit} className={`add-folder-panel ${addFolderState.show ? "show" : ""}`} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
					<input ref={addFolderInputRef} type="text" placeholder="folder name" value={addFolderState.name} onChange={e => setAddFolderState({ ...addFolderState, name: e.target.value })} />
					{addFolderState.error && <div className="error">Error: {addFolderState.error}</div>}
					<button onClick={addFolder}>add</button>
				</form>
			</div>
		</div>
	);
};

type AddFolderState = {
	readonly show: boolean;
	readonly name: string;
	readonly error?: string | undefined;
};

type Entry = {
	path: Path;
	isFile: boolean;
}

type DirProps = {
	requestingPath: Path | null;
	viewingPath: Path | null;
};

type ErrState = {
	error: any;
};

type StorageState = OneOf<DirProps, ErrState> & {
	entries: Entry[];
};

type OneOf<T, U> = ({ [K in keyof T]?: undefined } & { [K in keyof U]: U[K] }) | ({ [K in keyof U]?: undefined } & { [K in keyof T]: T[K] });