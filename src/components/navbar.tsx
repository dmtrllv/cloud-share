import { useAuth } from "../context/auth";

import "./styles/navbar.scss";

export const Navbar = () => {
	return (
		<nav>
			<AuthButtons />
		</nav>
	);
};

const AuthButtons = () => {
	const { isAuthenticated, logout } = useAuth();

	if (isAuthenticated)
		return <button onClick={logout}>Logout</button>;

	return null;
};