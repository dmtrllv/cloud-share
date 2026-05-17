export class Counter {
	private _next: number = 0;

	public next() {
		return this._next++;
	}

	public get current() {
		if (this._next === 0) {
			return null;
		}
		return this._next - 1;
	}

	public constructor() {

	}
} 