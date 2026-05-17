import { Navbar } from "../components";
import { useAuth, WithAuth } from "../auth/context";
import { LoginPanel } from "../auth";
//import { createLayout, createPanel, LayoutManager } from "../components/layout";
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

//const layout = createLayout("vertical", [
//	createLayout("horizontal", [
//		createPanel(Storage),
//		createPanel(Storage)]),
//	createPanel(Storage)
//]);

const Test = () => <h1 style={{ margin: 0, padding: 0 }}>Test</h1>;

const tree = layout("row", [
	layout("column", [
		Test,
		Test,
		Test
	]),
	layout("column", [
		Test,
		layout("row", [
			Test,
			Test,
			Test
		]),
		Test
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
