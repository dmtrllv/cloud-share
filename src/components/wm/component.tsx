import type { WithWm } from "./node";
import { createContext, useContext, useState } from "react";

import "./component.scss";

export type Component = {
	readonly id: number;
	parent: number;
	readonly Component: React.FC;
	state: any;
};

export type WindowContext = {
	readonly close: () => boolean;
	readonly useState: <S>(initialState: S | (() => S)) => [S, (state: S) => void];
};

const WindowContext = createContext<WindowContext>({
	close: () => false,
	useState: useState
});

export const useWindowContext = () => useContext(WindowContext);

export const ComponentNode = ({ id, Component, wm }: WithWm<Component>) => {
	const draggingCn = wm.draggingId !== null && wm.draggingId !== id ? "dragging" : "";

	return (
		<div className={`component ${draggingCn}`} onMouseDown={() => wm.startDrag(id)}>
			<WindowContext.Provider value={{ close: () => { wm.close(id); return true; }, useState: wm.useState(id) }}>
				<Component />
			</WindowContext.Provider>
			<div className="dragging-overlay">
				<div className="left" onMouseUp={() => wm.stopDrag(id, "left")} />
				<div className="right" onMouseUp={() => wm.stopDrag(id, "right")} />
				<div className="top" onMouseUp={() => wm.stopDrag(id, "top")} />
				<div className="bottom" onMouseUp={() => wm.stopDrag(id, "bottom")} />
			</div>
		</div>
	);
};
