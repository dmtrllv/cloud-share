import { Executable, useWindow } from "cloud-share";
import React, { useState } from "react";

@Executable.register("Test App 2")
export default class TestApp extends Executable {
	public render(): React.ReactNode {
		const window = useWindow();
		const [state, setState] = useState(1);

		const dec = () => setState(state - 1);
		const inc = () => setState(state + 1);

		return (
			<div>
				<button onClick={dec}>dec</button>
				<h3>count: {state}</h3>
				<button onClick={inc}>inc</button>
				<button onClick={window.close}>Close App</button>
			</div>
		);
	}
}