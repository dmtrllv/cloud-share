import { useAuth } from "../auth/context";

import "./styles/navbar.scss";

export const Navbar = () => {
	return (
		<nav id="navbar">
			<AuthButtons />
		</nav>
	);
};

const AuthButtons = () => {
	const { isAuthenticated, logout } = useAuth();

	if (isAuthenticated)
		return <button onClick={logout} style={{ float: "right", margin: "9px" }}>Logout</button>;

	return null;
};