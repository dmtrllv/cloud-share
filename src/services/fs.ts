import type { Path } from "@shared";
import { Service } from "../framework";

export type FsEvents = {
	readonly mkdir: { readonly dir: Path };
	readonly move: { readonly source: Path, readonly dest: Path  };
};

export class Fs extends Service<FsEvents> {
	public override async onConfigure(): Promise<void> {
		
	}
};