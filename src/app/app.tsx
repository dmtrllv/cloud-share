import { Navbar, Storage } from "../components";
import { useAuth, WithAuth } from "../auth/context";
import { LoginPanel } from "../auth";
import { layout, WindowManager } from "../components/wm";

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
				{/*<LayoutManager {...layout} />*/}
				<WindowManager tree={tree} />
			</WithAuth>
			<LoginPanel />
		</>
	);
};
