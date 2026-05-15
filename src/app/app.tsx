import { Navbar, Storage } from "../components";
import { useAuth, WithAuth } from "../auth/context";
import { LoginPanel } from "../auth";
import { createLayout, createPanel, LayoutManager } from "../components/layout";

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

const layout = createLayout("vertical", [
	createLayout("horizontal", [
		createPanel(Storage),
		createPanel(Storage)]),
	createPanel(Storage)
]);

const LoadedApp = () => {
	return (
		<>
			<Navbar />
			<WithAuth>
				<LayoutManager {...layout} />
			</WithAuth>
			<LoginPanel />
		</>
	);
};
