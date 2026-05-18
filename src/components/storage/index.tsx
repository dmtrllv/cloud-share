import { useEffect, useRef, useState } from "react"
import { api } from "../../api";
import { PathBar } from "./path-bar";
import { storageEvents, type MakeDirEvent } from "./events";
import { useWindowContext } from "../wm";
import { Titlebar } from "./title-bar";
import { EntryView } from "./list-entry";
import { useStorageDragDropContext } from "./drag-drop";

import "./styles/storage.scss";

export const Storage = ({ path = "/" }: { path?: string }) => {
	const windowContext = useWindowContext();
	const dragDropContext = useStorageDragDropContext();

	const reqId = useRef(0);
	const [state, setState] = windowContext.useState<StorageState>({ requestingPath: path, viewingPath: null, entries: [] });
	const [addFolderState, setAddFolderState] = useState<AddFolderState>({ show: false, name: "" });

	const currentPath = state.requestingPath || state.viewingPath || "/";

	const nextId = () => {
		reqId.current += 1;
		return reqId.current;
	};

	const addFolderInputRef = useRef<HTMLInputElement>(null);

	const openPath = (path: string) => {
		const id = nextId();
		api.get<{ children: Entry[] }>(`/fs${path}`).then((res) => {
			if (id !== reqId.current)
				return;

			if (res.data) {
				setState({
					requestingPath: null,
					viewingPath: path,
					entries: res.data.children.map(s => s)
				});
			} else {
				console.error(res.error);
				setState({
					error: res.error,
					entries: []
				});
			}
		});
	};

	const addFolder = async () => {
		const name = addFolderState.name;
		if (!state.error && name && state.viewingPath) {
			const parentPath = currentPath === "/" ? "" : currentPath;
			api.post<Entry>(`/fs${parentPath}/${name}`).then(({ data, error }) => {
				if (data) {
					setAddFolderState({ show: false, name: "" });
					storageEvents.emit("mkdir", { parentPath: currentPath, newDirName: name });
				} else {
					setAddFolderState({ ...addFolderState, error });
				}
			});
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
		const handler = (e: MakeDirEvent) => {
			if (e.parentPath === currentPath) {

				const parentPath = currentPath === "/" ? "" : currentPath;
				const f = state.entries.find(u => u.path === `${parentPath}/${e.newDirName}`);
				if (!f) {
					setState({
						...state,
						entries: [
							...state.entries,
							{ isFile: false, path: `${currentPath}/${e.newDirName}` }
						]
					});
				}
			}
		};
		storageEvents.on("mkdir", handler);
		return () => { storageEvents.remove("mkdir", handler) };
	}, [currentPath]);

	const close = () => {
		if (windowContext.componentCount() > 1) {
			windowContext.close();
		}
	};

	const onMouseUp = () => {
		if (!dragDropContext.dragState)
			return;

		if ("windowId" in dragDropContext.dragState) {
			if (dragDropContext.dragState.windowId === windowContext.id)
				return;
		}

		if (!("path" in dragDropContext.dragState))
			return;

		const path = dragDropContext.dragState.path;

		if (path === currentPath)
			return;

		const parts = path.split("/");
		const filename = parts.pop();
		const parent = parts.join("/") || "/";

		if (parent === currentPath)
			return;

		console.log("Move ", path, " to ", currentPath + `/` + filename, "from parent", parent);
	};

	return (
		<div className="storage">
			<div className="dir-view" onMouseUp={onMouseUp}>
				<Titlebar onClose={close} closable={windowContext.componentCount() > 1} startDrag={windowContext.startDrag} path={state.viewingPath || "/"} />
				<PathBar openPath={openPath} path={state.viewingPath || "/"} onNewFolder={onNewFolder} />
				<div className="entries">
					{state.entries.length === 0 ? <div>Nothing here yet!</div> : null}
					{state.entries.map(e => <EntryView key={e.path} windowId={windowContext.id} openPath={openPath} {...e} />)}
					{state.error && <h1>Error: {state.error}</h1>}
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
	path: string;
	isFile: boolean;
}

type DirProps = {
	requestingPath: string | null;
	viewingPath: string | null;
};

type ErrState = {
	error: any;
};

type StorageState = OneOf<DirProps, ErrState> & {
	entries: Entry[];
};

type OneOf<T, U> = ({ [K in keyof T]?: undefined } & { [K in keyof U]: U[K] }) | ({ [K in keyof U]?: undefined } & { [K in keyof T]: T[K] });