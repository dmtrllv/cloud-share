import { Storage } from "../components";
import { useAuth, WithAuth } from "../auth/context";
import { LoginPanel } from "../auth";
import { component, layout, WindowLayoutRenderer, WindowManagerContext } from "../components/wm";
import { StorageDragDropManager } from "../components/storage/drag-drop";
import { Menubar } from "../components/menubar/menubar";
import { item, createMenu } from "../components/menubar/menu";

import "./styles/app.scss";

export const App = () => {
	const auth = useAuth();

	return (
		<>
			{!auth.isLoading && <LoadedApp />}
			<div id="app-overlay" className={auth.isLoading ? "show" : ""} />
		</>
	);
};

const tree = layout("row", [
	component(Storage),
]);

const menu = createMenu(
	item("apps", [
		item("file explorer", () => {

		})
	]),
);

const LoadedApp = () => {
	return (
		<>
			<WithAuth>
				<WindowManagerContext tree={tree}>
					<Menubar menu={menu} />
					<StorageDragDropManager>
						<WindowLayoutRenderer />
					</StorageDragDropManager>
				</WindowManagerContext>
			</WithAuth>
			<LoginPanel />
		</>
	);
};
