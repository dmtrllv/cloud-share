import { useState } from "react";
import { ExecutableManager } from "../../../services/exec-manager";

export const MenuBar = () => {
	const appManager = ExecutableManager.ctx();

	const [_apps, _setApps] = useState(appManager.executables);

	

	return (
		<div>

		</div>
	);
};