import { Navbar, Storage } from "../components";
import { useAuth, WithAuth } from "../auth/context";
import { LoginPanel } from "../auth";
import { layout, WindowManager } from "../components/wm";

import "./styles/app.scss";
import { StorageDragDropManager } from "../components/storage/drag-drop";

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
	layout("column", [
		Storage,
		Storage,
		Storage
	]),
	layout("column", [
		Storage,
	])
]);

const LoadedApp = () => {
	return (
		<>
			<Navbar />
			<WithAuth>
				<StorageDragDropManager>
					<WindowManager tree={tree} />
				</StorageDragDropManager>
			</WithAuth>
			<LoginPanel />
		</>
	);
};
