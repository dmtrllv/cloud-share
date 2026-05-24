import { Executable } from "cloud-share";
import React, { useState } from "react";

@Executable.register("Test App 2")
export default class TestApp extends Executable {
	public render(): React.ReactNode {
		const [state, setState] = useState(1);		
		
		const inc = () => setState(state + 1);

		return <div onClick={inc}>{state}</div>;
	}
}