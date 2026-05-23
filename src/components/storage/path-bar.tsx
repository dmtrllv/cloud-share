import { useMemo, useState } from "react";
import { Path } from "@shared";

import "./styles/path-bar.scss";

type PathPart = {
	name: string;
	path: Path;
};

const rootPart = { name: "/", path: new Path("/") };

const parsePathPaths = (path: Path): PathPart[] => {
	if (path.toString() === "/") {
		return [rootPart];
	}
	let prev = ""
	return [rootPart, ...path.toString().substring(1).split("/").map(p => {
		let path = `${prev}/${p}`;
		prev = path;
		return { name: p, path: new Path(path) };
	})];
};

export const PathBar = ({ path, openPath, onNewFolder }: { path: Path, openPath: (path: Path) => void, onNewFolder: (e: React.MouseEvent) => void }) => {
	const parts = useMemo(() => parsePathPaths(path), [path]);

	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const onMouseEnter = (index: number) => () => {
		if (index >= (parts.length - 1))
			return;
		setHoverIndex(index);
	};

	const onMouseLeave = () => {
		setHoverIndex(null)
	};

	const onClick = (index: number, part: PathPart) => {
		if (index >= (parts.length - 1))
			return;
		openPath(new Path(part.path));
	}

	return (
		<div className="path-bar">
			{parts.map((part, i) => (
				<div key={i} onMouseEnter={onMouseEnter(i)} onMouseLeave={onMouseLeave} className={`part ${i < (parts.length - 1) && hoverIndex !== null && i <= hoverIndex ? "hover" : ""}`} onClick={() => onClick(i, part)}>
					{part.name}
				</div>
			))}
			<div className="btn-new-folder" onClick={onNewFolder}>+</div>
		</div>
	);
};