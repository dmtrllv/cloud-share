import { useRef } from "react";
import { useWindowManager } from "../wm";
import { createMenu, item, type Menu, type MenuItem, MenuItemSep } from "./menu";

import "./styles/menu-bar.scss";
import { Storage } from "../storage";

type MenubarProps = {
	menu: Menu
};

export const Menubar = (props: MenubarProps) => {
	const wm = useWindowManager();

	const menu = useRef<Menu>(createMenu(
		item("Apps", [
			item("File explorer", () => wm.open(Storage))
		])
	));

	return (
		<div className="menu-bar">
			{menu.current.items.map((item, i) => <MenubarItem key={i} {...item} />)}
		</div>
	);
};

const MenubarItem = ({ text, action, children }: MenuItem) => {
	return (
		<div className="item">
			<div className="text" onClick={action}>{text}</div>
			{children && children.length > 0 ? (
				<div className="children">
					{children.map((item, i) => {
						if (item === MenuItemSep) {
							return <div className="sep" />;
						} else {
							return <MenubarItem key={i} {...item} />;
						}
					})}
				</div>
			) : null}
		</div>
	);
};