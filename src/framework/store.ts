export abstract class Store {
	public static new<T extends Store>(this: new () => T): T {
		return new this();
	}
}