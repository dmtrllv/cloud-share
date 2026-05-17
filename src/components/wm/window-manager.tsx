import { useMemo, useState } from "react";
import { notNullOr } from "../../utils";
import { isComponent, isLayout, isRoot, parseTree, type Node, type Nodes, type NodeTree } from "./node";
import { type Component } from "./component";
import { LayoutNode, type Layout, type LayoutDirection } from "./layout";
import { Counter } from "../../utils/counter";

import { useWindowEvent } from "../../hooks/window-event";

import "./window-manager.scss";

export type RootLayout = Layout & { readonly parent: null };

export const WindowManager = ({ tree }: { tree: NodeTree }) => {
	const idCounter = useMemo(() => new Counter(), []);

	const [state, setState] = useState(() => parseTree(idCounter, tree));
	const [draggingId, setDraggingId] = useState<number | null>(null);

	const createLayout = (nodes: Nodes, parent: number, direction: LayoutDirection, children: number[] = []) => {
		const layout: Layout = {
			id: idCounter.next(),
			parent,
			direction,
			children,
		};
		nodes[layout.id] = layout;
		return layout;
	};

	const setNodes = (nodes: Nodes) => setState(state => ({ ...state, nodes }));

	const getNode = (id: number): Node => notNullOr(state.nodes[id], () => new Error(`Could not get node with id ${id}!`));

	function getParent(node: Node): Layout | null {
		return node.parent !== null ? getNode(node.parent) as Layout : null;
	};

	const upgradeLayout = (nodes: Nodes, layout: Layout) => {
		if (!layout.parent)
			return;

		if (layout.children.length !== 1)
			throw new Error("Layout does not have 1 child?");

		const child = layout.children[0]!;

		const parent = getParent(layout)!;

		const index = parent.children.indexOf(layout.id);
		if (index < 0)
			throw new Error("Not a child?");

		parent.children[index] = child;
		(getNode(child) as any).parent = parent.id;

		if (!(layout.id in nodes))
			throw new Error("Not a node?");

		delete nodes[layout.id];
	};

	const removeNode = (nodes: Nodes, id: number, deleteFromNodes: boolean = true): Nodes => {
		const node = getNode(id);

		if (isRoot(node))
			return nodes;

		const parent = getParent(node);

		if (parent) {
			const index = parent.children.indexOf(id);

			if (index < 0) {
				throw new Error("node is not a child!");
			}

			parent.children.splice(index, 1);


			if (parent.children.length === 1) {
				upgradeLayout(nodes, parent);
			} else if (parent.children.length === 0) {
				removeNode(nodes, parent.id);
			}
		} else {
			console.warn("could not get parent", id);
		}


		if (deleteFromNodes) {
			if (!(id in nodes)) {
				throw new Error("Not a node?");
			}
			delete nodes[id];
		}

		return nodes;
	};

	const rootNode = getNode(state.rootId);

	if (!isLayout(rootNode))
		throw new Error("Rootnode must be a layout node!");

	useWindowEvent("mouseup", () => {
		if (draggingId) {

			setDraggingId(null);
		}
	}, [draggingId]);

	const ctx: WmContext = {
		draggingId,
		close(id) {
			setNodes(removeNode({ ...state.nodes }, id));
		},
		startDrag(id) {
			const node = getNode(id);
			if (!isComponent(node))
				return;
			setDraggingId(id);
		},
		stopDrag(targetId: number, position: "left" | "right" | "top" | "bottom") {
			setState((state) => {
				if (!draggingId)
					return state;

				const nodes = { ...state.nodes };

				const draggingNode = (getNode(draggingId) as Component);
				removeNode(nodes, draggingId, false);

				const targetNode = getNode(targetId);

				if (isLayout(targetNode)) {
					setDraggingId(null);
					console.warn("TODO");
					return state;
				}

				const layout = getParent(targetNode);
				if (!layout)
					throw new Error("Missing parent?");

				const targetChildIndex = layout.children.indexOf(targetId);

				draggingNode.parent = layout.id;

				if (layout?.direction === "column") {
					switch (position) {
						case "left":
							{
								const wrapper = createLayout(nodes, layout.id, "row", [
									draggingNode.id,
									targetId
								]);
								draggingNode.parent = wrapper.id;
								targetNode.parent = wrapper.id;
								layout.children[targetChildIndex] = wrapper.id;
								break;
							}
						case "right":
							{
								const wrapper = createLayout(nodes, layout.id, "row", [
									targetId,
									draggingNode.id,
								]);
								draggingNode.parent = wrapper.id;
								targetNode.parent = wrapper.id;
								layout.children[targetChildIndex] = wrapper.id;
								break;
							}
						case "top":
							layout.children.splice(targetChildIndex, 0, draggingNode.id);
							break;
						case "bottom":
							layout.children.splice(targetChildIndex + 1, 0, draggingNode.id);
							break;
					}
				} else {
					switch (position) {
						case "left":
							layout.children.splice(targetChildIndex, 0, draggingNode.id);
							break;
						case "right":
							layout.children.splice(targetChildIndex + 1, 0, draggingNode.id);
							break;
						case "top":
							{
								const wrapper = createLayout(nodes, layout.id, "column", [
									targetId,
									draggingNode.id,
								]);
								layout.children[targetChildIndex] = wrapper.id;
								draggingNode.parent = wrapper.id;
								targetNode.parent = wrapper.id;
								break;
							}
						case "bottom":
							{
								const wrapper = createLayout(nodes, layout.id, "column", [
									draggingNode.id,
									targetId
								]);
								layout.children[targetChildIndex] = wrapper.id;
								draggingNode.parent = wrapper.id;
								targetNode.parent = wrapper.id;
								break;
							}
					}
				}

				return {
					...state,
					nodes
				}
			});
			setDraggingId(null);
		},
		useState(id: number) {
			const node = getNode(id) as Component;
			return <S extends any>(initialState: S | (() => S)): [S, (state: S) => void] => {
				const [s, setState] = useState(() => {
					if(node.state === undefined) {
						node.state = initialState;
					}
					console.log(node.state, id);
					return node.state;
				});
				return [s, (newState) => {
					node.state = newState;
					setState(newState);
				}];
			};
		}
	};

	return (
		<div className="window-manager">
			<LayoutNode wm={ctx} nodes={state.nodes} {...rootNode} />
		</div>
	);
};

export type WmContext = {
	readonly startDrag: (id: number) => void;
	readonly stopDrag: (id: number, position: "left" | "right" | "top" | "bottom") => void;
	readonly close: (id: number) => void;
	readonly useState: (id: number) => <S>(initialState: S | (() => S)) => [S, (state: S) => void];
	readonly draggingId: number | null;
};