import { WmNode, type WithWm } from "./node";

export type Layout = {
	readonly id: number;
	readonly parent: number | null;
	readonly direction: LayoutDirection;
	readonly children: number[];
};

export type LayoutDirection = "row" | "column";

export const LayoutNode = ({ children, direction, nodes, wm }: WithWm<Layout>) => {
	return (
		<div className="layout" style={{ flexDirection: direction }}>
			{children.map(id => <WmNode wm={wm} key={id} id={id} nodes={nodes} />)}
		</div>
	);
};
