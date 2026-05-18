export class EventEmitter<T extends Events> {
	private readonly listeners: Record<keyof T, ((e: any) => any)[]> = {} as any;

	private readonly getListeners = (event: keyof T): any[] => {
		if (!(event in this.listeners))
			this.listeners[event] = [];
		return this.listeners[event];
	}

	public readonly on = <K extends keyof T>(event: K, listener: (e: T[K]) => any): this => {
		this.getListeners(event).push(listener);
		return this;
	}

	public readonly remove = <K extends keyof T>(event: K, listener: (e: T[K]) => any): this => {
		const listeners = this.getListeners(event);
		const index = listeners.indexOf(listener);
		if(index > -1)
			listeners.splice(index, 1);
		return this;
	}

	public readonly emit = <K extends keyof T>(event: K, value: T[K]) => {
		this.getListeners(event).forEach(listener => listener(value));
	}
};

type Events = Record<string, any>;