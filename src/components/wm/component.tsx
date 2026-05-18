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
	readonly id: number;
	readonly close: () => boolean;
	readonly startDrag: () => boolean;
	readonly useState: <S>(initialState: S | (() => S)) => [S, (state: S) => void];
	readonly componentCount: () => number;
};

const WindowContext = createContext<WindowContext>({
	id: -1,
	close: () => false,
	startDrag: () => false,
	useState: useState,
	componentCount: () => 0,
});

export const useWindowContext = () => useContext(WindowContext);

export const ComponentNode = ({ id, Component, wm }: WithWm<Component>) => {
	const draggingCn = wm.draggingId !== null && wm.draggingId !== id ? "dragging" : "";

	const ctx: WindowContext = {
		close: () => { wm.close(id); return true; },
		startDrag: () => { wm.startDrag(id); return true; },
		useState: wm.useState(id),
		componentCount: () => wm.componentCount(),
		id,
	}

	return (
		<div className={`component ${draggingCn}`}>
			<WindowContext.Provider value={ctx}>
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
