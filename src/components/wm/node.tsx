import { LayoutNode, type Layout, type LayoutDirection } from "./layout";
import type { Counter } from "../../utils/counter";
import { ComponentNode, type Component } from "./component";
import type { RootLayout, WmContext } from "./window-manager";

export type Node = Layout | Component<any>;

export type Nodes = Record<number, Node>;

export type WithWm<T extends {}> = T & {
	readonly nodes: Readonly<Nodes>;
	readonly wm: WmContext;
};

export const WmNode = ({ nodes, id, wm }: WithWm<{ id: number }>) => {
	const node = nodes[id];

	if (!node) {
		console.warn("Window manager node is undefined!");
		return null;
	}

	if (isComponent(node)) {
		return <ComponentNode wm={wm} nodes={nodes} {...node} />;
	}

	return <LayoutNode wm={wm} nodes={nodes} {...node} />;
};


export const isRoot = (obj: Node): obj is RootLayout => obj.parent === null;
export const isLayout = (obj: Node): obj is Layout => "direction" in obj;
export const isComponent = (obj: Node): obj is Component<any> => "Component" in obj;

export const parseTree = (idCounter: Counter, tree: NodeTree): { nodes: Nodes, rootId: number } => {
	const nodes: Nodes = [];

	const addComponent = <P extends {}>(n: NodeTreeComponent<P>, parent: Layout) => {
		const node: Component<P> = {
			id: idCounter.next(),
			Component: n.Component,
			props: n.props,
			parent: parent.id,
			state: undefined
		};
		nodes[node.id] = node;
		parent.children.push(node.id);
		return node;
	};

	const addLayout = (direction: LayoutDirection, parent: Layout | null) => {
		const node: Layout = {
			id: idCounter.next(),
			direction: direction,
			parent: parent?.id ?? null,
			children: []
		};
		nodes[node.id] = node;
		parent?.children.push(node.id);
		return node;
	};

	const walkTree = (tree: NodeTree, parentLayout: Layout | null): number => {
		const layout = addLayout(tree.direction, parentLayout);

		tree.children.forEach(child => {
			if ("Component" in child) {
				addComponent(child, layout);
			} else {
				walkTree(child, layout);
			}
		});

		return layout.id;
	};

	const rootId = walkTree(tree, null);

	return {
		nodes,
		rootId
	};
};


export type NodeTreeChild = NodeTreeComponent<any> | NodeTreeLayout;
export type NodeTreeComponent<P extends {}> = { Component: React.FC<P>, props: P };
export type NodeTreeLayout = { direction: LayoutDirection, children: NodeTreeChild[]; };

export type NodeTree = NodeTreeLayout;

export const layout = (direction: LayoutDirection, children: NodeTreeChild[] = []): NodeTreeLayout => ({
	direction,
	children
});

export function component<P extends {}>(Component: React.FC<P>, ...[props]: {} extends P ? [] | [P] : [P]): NodeTreeComponent<P> {
	return {
		Component,
		props: props || {} as any
	}
}
