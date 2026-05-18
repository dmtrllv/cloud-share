import { useStorageDragDropContext } from "./drag-drop";

export const EntryView = ({ openPath, path, windowId }: EntryProps) => {
	const ctx = useStorageDragDropContext();

	const onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
	};

	return (
		<div className="entry" onMouseDown={() => ctx.startDrag({ path, windowId })} onClick={() => openPath(path)} onContextMenu={onContextMenu}>
			&#x1F5C0; {path.split("/").pop()}
		</div>
	);
};

export type EntryProps = {
	windowId: number;
	openPath: (path: string) => void;
	path: string;
	isFile: boolean;
};