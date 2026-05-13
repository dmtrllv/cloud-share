export abstract class Service {
	private static readonly instances = new Map<typeof Service, Service>();

	public static get<T extends typeof Service>(this: T): InstanceType<T> {
		if (!Service.instances.has(this)) {
			Service.instances.set(this, new (this as any)());
		}
		return Service.instances.get(this) as InstanceType<T>;
	}
}