import { useEffect, useRef, useState } from "react"
import { api } from "../api";

import "./styles/storage.scss";

export const Storage = ({ path = "/" }: { path?: string }) => {
	const reqId = useRef(0);
	const [state, setState] = useState<StorageState>({ requestingPath: path, viewingPath: null, entries: [] });

	const nextId = () => {
		reqId.current += 1;
		return reqId.current;
	};

	const openEntry = (path: string) => {
		const id = nextId();
		api.get<{ children: Entry[] }>(`/fs${path}`).then((res) => {
			if (id !== reqId.current)
				return;

			if (res.data) {
				console.log({ children: res.data.children });
				setState({
					requestingPath: null,
					entries: res.data.children.map(s => s),
					viewingPath: path,
				})
			} else {
				console.error(res.error);
				setState({ error: res.error });
			}
		});
	};

	useEffect(() => {
		openEntry(path);
	}, [path]);

	if ("error" in state) {
		return (
			<div className="storage">
				<StorageError error={state.error} />
			</div>
		);
	}

	return (
		<div className="storage">
			<DirView openEntry={openEntry} entries={state.entries} requestingPath={state.requestingPath} viewingPath={state.viewingPath} />
		</div>
	);
};

type AddFolderState = {
	readonly show: boolean;
	readonly name: string;
};

const DirView = ({ entries, viewingPath, requestingPath, openEntry }: DirProps & { openEntry: (path: string) => void }) => {
	const [entriesState, setEntries] = useState([...entries]);
	const [addFolderState, setAddFolderState] = useState<AddFolderState>({ show: false, name: "" });

	const currentPath = requestingPath || viewingPath || "/";
	
	const addFolder = async () => {
		const name = addFolderState.name;
		if (name && viewingPath) {
			const parentPath = currentPath === "/" ? "" : currentPath;
			api.post<Entry>(`/fs${parentPath}/${name}`, { isFile: false }).then(({ data }) => {
				if (data) {
					setEntries([...entriesState, data]);
					setAddFolderState({ show: false, name: "" });
				}
			});
		}
	};

	useEffect(() => {
		setEntries(entries);
		setAddFolderState({ show: false, name: "" });
	}, [entries, viewingPath, requestingPath, openEntry]);

	return (
		<div className="dir-view">
			<div className="url">
				{currentPath}
				<button onClick={() => setAddFolderState({ show: true, name: "" })}>Add Folder</button>
			</div>
			<div className="entries">
				{entriesState.length === 0 ? <div>Nothing here yet!</div> : null}
				{entriesState.map(e => <div className="entry" onClick={() => openEntry(e.path)} key={e.path}>{e.path.split("/").pop()}</div>)}
				{addFolderState.show ? (
					<div className="add-folder-panel">
						<input type="text" placeholder="folder name" onChange={e => setAddFolderState({ ...addFolderState, name: e.target.value })} />
						<button onClick={addFolder}>add</button>
					</div>
				) : null}
			</div>
		</div>
	);
};

const StorageError = ({ error }: { error: any }) => {
	return <h1>Error?!? {error}</h1>
};

type Entry = {
	path: string;
	isFile: boolean;
}

type DirProps = {
	requestingPath: string | null;
	viewingPath: string | null;
	entries: Entry[];
};

type ErrState = {
	error: any;
};

type StorageState = DirProps | ErrState;