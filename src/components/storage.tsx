import { useEffect, useRef, useState } from "react"
import { api } from "../api";

import "./styles/storage.scss";

const rootPart = { name: "/", path: "/" };

const parsePathPaths = (path: string) => {
	if (path === "/") {
		return [rootPart];
	}
	let prev = ""
	return [rootPart, ...path.substring(1).split("/").map(p => {
		let path = `${prev}/${p}`;
		prev = path;
		return { name: p, path };
	})];
};

export const Storage = ({ path = "/" }: { path?: string }) => {
	const reqId = useRef(0);
	const [entries, setEntries] = useState<Entry[]>([]);
	const [state, setState] = useState<StorageState>({ requestingPath: path, viewingPath: null });
	const [addFolderState, setAddFolderState] = useState<AddFolderState>({ show: false, name: "" });

	const nextId = () => {
		reqId.current += 1;
		return reqId.current;
	};

	const addFolderInputRef = useRef<HTMLInputElement>(null);

	const openEntry = (path: string) => {
		console.log("open entry", path);
		const id = nextId();
		api.get<{ children: Entry[] }>(`/fs${path}`).then((res) => {
			if (id !== reqId.current)
				return;

			if (res.data) {
				setState({
					requestingPath: null,
					viewingPath: path,
				});
				setEntries(res.data.children.map(s => s));
			} else {
				console.error(res.error);
				setState({ error: res.error });
				setEntries([]);
			}
		});
	};

	useEffect(() => {
		openEntry(path);
	}, [path]);

	useEffect(() => {
		const handler = () => {
			if (addFolderState.show)
				setAddFolderState({ show: false, name: "" });
		};
		window.addEventListener("click", handler);

		return () => {
			window.removeEventListener("click", handler);
		};
	}, [addFolderState]);

	const currentPath = state.requestingPath || state.viewingPath || "/";

	const addFolder = async () => {
		const name = addFolderState.name;
		if (!state.error && name && state.viewingPath) {
			const parentPath = currentPath === "/" ? "" : currentPath;
			api.post<Entry>(`/fs${parentPath}/${name}`).then(({ data, error }) => {
				if (data) {
					setEntries([...entries, data]);
					setAddFolderState({ show: false, name: "" });
				} else {
					setAddFolderState({ ...addFolderState, error });
				}
			});
		}
	};

	const addFolderClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setAddFolderState({ show: !addFolderState.show, name: "" });
	};

	useEffect(() => {
		if (addFolderState.show && addFolderInputRef.current !== null) {
			addFolderInputRef.current.focus();
		}
	}, [addFolderState]);

	const parts = parsePathPaths(state.viewingPath || "/");
	console.log(parts);
	return (
		<div className="storage">
			<div className="dir-view">
				<div className="url">
					{parts.map((part, i) => (
						<div key={i} className="url-part" onClick={() => openEntry(part.path)}>
							{i !== 1 && <span className="sep">/</span>}
							{i !== 0 ? part.name : ""}
						</div>
					))}
					<button style={{ float: "right" }} onClick={addFolderClick}>Add Folder</button>
				</div>
				<div className="entries">
					{entries.length === 0 ? <div>Nothing here yet!</div> : null}
					{entries.map(e => <div className="entry" onClick={() => openEntry(e.path)} key={e.path}>&#x1F5C0; {e.path.split("/").pop()}</div>)}
					{state.error && <h1>Error: {state.error}</h1>}
				</div>
				<form onSubmit={e => { e.preventDefault(); e.stopPropagation(); addFolder(); }} className={`add-folder-panel ${addFolderState.show ? "show" : ""}`} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
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

type StorageState = OneOf<DirProps, ErrState>;

type OneOf<T, U> = ({ [K in keyof T]?: undefined } & { [K in keyof U]: U[K] }) | ({ [K in keyof U]?: undefined } & { [K in keyof T]: T[K] });