import { Executable } from "../src/executables/executable";
import { useWindow } from "../src/ui/components/window-manager/context";

export type { Executable } from "../src/executables/executable";

declare const exports: {
	Executable: typeof Executable,
	useWindow: typeof useWindow,
};

export default exports;