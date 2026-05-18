import type { Path } from "../../utils/path";
import { useStorageDragDropContext } from "./drag-drop";

export const EntryView = ({ openPath, path, windowId, isFile }: EntryProps) => {
	const ctx = useStorageDragDropContext();

	const onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
	};
	console.log(isFile)
	return (
		<div className="entry" onMouseDown={() => ctx.startDrag({ path, windowId })} onClick={() => openPath(path)} onContextMenu={onContextMenu}>
			{!isFile ? <span>&#x1F5C0;</span> : ""} {path.basename()}
		</div>
	);
};

export type EntryProps = {
	windowId: number;
	openPath: (path: Path) => void;
	path: Path;
	isFile: boolean;
};