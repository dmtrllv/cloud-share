export class Path {
	public static join(a: Path | string, b: Path | string) {
		return new Path(`${a}${b}`).normalize();
	}

	private _data: string;

	public constructor(path: string | Path = "/") {
		this._data = typeof path === "string" ? path : path._data;
	}

	public get isAbsolute(): boolean {
		return this._data.startsWith("/");
	}

	public normalize(): this {
		let prefix = this.isAbsolute ? "/" : ""
		let parts: string[] = [];
		this._data.split("/").forEach(part => {
			if(!part)
				return;
			if(part === "..") {
				parts.pop();
			} else if(part !== ".") {
				parts.push(part);
			}
		});

		this._data = prefix + parts.join("/");
		return this;
	}

	public toString(): string {
		return this._data;
	}

	public toJSON(): { _data: string } {
		return { _data: this._data };
	}

	public equals(other: string | Path): boolean {
		return this._data === (typeof other === "string" ? other : other._data);
	}

	public basename(): Path {
		const parts = this._data.split("/");
		return new Path(parts.pop() || "/");
	}

	public dirname() {
		const parts = this._data.split("/");
		parts.pop();
		return new Path(parts.join("/"));
	}
}