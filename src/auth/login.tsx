import { useRef, useState } from "react";
import { useAuth } from "./context";

import "./styles/login.scss";

export const LoginPanel = () => {
	const { isAuthenticated, login } = useAuth();

	const isLoading = useRef(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const tryLogin = async () => {
		if (isLoading.current) {
			return;
		}

		isLoading.current = true;
		await login(username, password);
		isLoading.current = false;
	};

	return (
		<div id="login-panel" className={` ${!isAuthenticated ? "show" : ""}`}>
			<h1>Login</h1>
			<form onSubmit={e => { e.preventDefault(); tryLogin(); }}>
				<input type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
				<input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
				<button type="submit" onClick={tryLogin}>Login</button>
			</form>
		</div>
	);
}