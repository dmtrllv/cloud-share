import { Navbar } from "../components";
import { Storage } from "../components/storage";
import { WithAuth } from "../context/auth";
import { LoginPanel } from "../panels";

import "./styles/app.scss";

export const App = () => {
	return (
		<>
			<Navbar />
			<div id="app">
				<WithAuth>
					<Storage path="/" />
					<Storage path="/" />
				</WithAuth>
			</div>
			<LoginPanel />
		</>
	);
};
