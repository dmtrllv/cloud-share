export class Counter {
	private _next: number;

	public constructor(next: number = 0) {
		this._next = next;
	}

	public next() {
		return this._next++;
	}
}