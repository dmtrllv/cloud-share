import { Executable } from "../framework";

@Executable.default("File Explorer")
export class FileExplorer extends Executable {
	public override render(): React.ReactNode {
		return (
			<div>
				<h1>{this.name}</h1>
			</div>
		);
	}
}