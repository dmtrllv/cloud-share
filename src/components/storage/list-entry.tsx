import type { Path } from "../../utils/path";
import { useStorageDragDropContext } from "./drag-drop";

export const EntryView = ({ openPath, path, windowId, isFile }: EntryProps) => {
	const ctx = useStorageDragDropContext();

	const onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
	};

	const onClick = () => {
		if(isFile) {
			console.log("open file: ", path);
			return;
		}
		openPath(path);
	}
	
	return (
		<div className="entry" onMouseDown={() => ctx.startDrag({ path, windowId })} onClick={onClick} onContextMenu={onContextMenu}>
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