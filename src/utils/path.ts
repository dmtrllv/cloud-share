const TAG = Symbol("PATH_TAG");

export type Path = {
	readonly value: string;
	readonly [TAG]: typeof TAG;
	readonly normalize: () => Path;
	readonly basename: () => string;
	readonly dirname: () => Path;
	readonly clone: () => Path;
	readonly toString: () => string;
	readonly equals: (other: Path | string) => boolean;
}

export const path = (string: string): Path => {
	return {
		value: string,
		[TAG]: TAG,
		normalize() {
			const p = this.value.replace("\\", "/");
			const parts = p.split("/").filter(s => !!s);
			if (p.startsWith("/"))
				return path("/" + parts.join("/"));
			return path(parts.join("/"));
		},
		basename() {
			return this.value.split("/").pop() || "";
		},
		dirname() {
			const p = this.normalize().value;
			const parts = p.split("/");
			parts.pop();
			//if(p.startsWith("/") && )
			//return path(`/${parts.join("/")}`);
			return path(parts.join("/") || "/");
		},
		clone() {
			return path(this.value)
		},
		toString() {
			return this.value;
		},
		equals(other) {
			if (typeof other === "string") {
				return other === this.value;
			}
			return other.value === this.value;
		}
	}
};