import { useMemo, useState } from "react";
import { type Path, path as createPath } from "../../utils/path";

import "./styles/path-bar.scss";


type PathPart = {
	name: string;
	path: string;
};

const rootPart = { name: "/", path: "/" };

const parsePathPaths = (path: string): PathPart[] => {
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

export const PathBar = ({ path, openPath, onNewFolder }: { path: Path, openPath: (path: Path) => void, onNewFolder: (e: React.MouseEvent) => void }) => {
	const parts = useMemo(() => parsePathPaths(path.value), [path.value]);

	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const onMouseEnter = (index: number) => () => {
		setHoverIndex(index);
	};

	const onMouseLeave = () => {
		setHoverIndex(null)
	};

	return (
		<div className="path-bar">
			{parts.map((part, i) => (
				<div key={i} onMouseEnter={onMouseEnter(i)} onMouseLeave={onMouseLeave} className={`part ${hoverIndex !== null && i <= hoverIndex ? "hover" : ""}`} onClick={() => openPath(createPath(part.path))}>
					{part.name}
				</div>
			))}
			<div className="btn-new-folder" onClick={onNewFolder}>+</div>
		</div>
	);
};