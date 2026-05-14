import { Navbar } from "../components";
import { Storage } from "../components/storage";
import { LoginPanel } from "../panels";

import "./styles/app.scss";

export const App = () => {
	return (
		<>
			<Navbar />
			<Storage path="/" />
			<LoginPanel />
		</>
	);
};
