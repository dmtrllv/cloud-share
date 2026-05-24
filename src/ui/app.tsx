import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { WindowManager } from "./components/window-manager/window-manager.js";

export const AppUI = () => {
	return (
		<>
			<MenuBar />
			<WindowManager />
		</>
	);
};