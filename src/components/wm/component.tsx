import type { WithWm } from "./node";

import "./component.scss";

export type Component = {
	readonly id: number;
	parent: number;
	readonly Component: React.FC;
};

export const ComponentNode = ({ id, Component, wm }: WithWm<Component>) => {
	const draggingCn = wm.draggingId !== null && wm.draggingId !== id ? "dragging" : "";

	return (
		<div className={`component ${draggingCn}`} onMouseDown={() => wm.startDrag(id)}>
			<Component />
			<div className="btn close" onClick={() => wm.close(id)}>close</div>
			<div className="dragging-overlay">
				<div className="left" onMouseUp={() => wm.stopDrag(id, "left")} />
				<div className="right" onMouseUp={() => wm.stopDrag(id, "right")} />
				<div className="top" onMouseUp={() => wm.stopDrag(id, "top")} />
				<div className="bottom" onMouseUp={() => wm.stopDrag(id, "bottom")} />
			</div>
		</div>
	);
};