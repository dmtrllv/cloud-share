export type Menu = {
	items: MenuItem[];
};

export type MenuItem = {
	text: string;
	action: undefined | (() => void);
	children?: MenuItemChild[];
};

export type MenuItemChild = MenuItem | MenuItemSep;

export const MenuItemSep = Symbol();

export type MenuItemSep = typeof MenuItemSep;

export const createMenu = (...items: MenuItem[]): Menu => {
	return {
		items
	};
};

export function item(text: string, action: () => void, children?: MenuItemChild[]): MenuItem;
export function item(text: string, children?: MenuItemChild[]): MenuItem;
export function item(text: string, action?: (() => void) | MenuItemChild[], children?: MenuItemChild[]): MenuItem {
	return {
		text,
		action: typeof action === "function" ? action : undefined,
		children: Array.isArray(action) ? action : Array.isArray(children) ? children : []
	}
}