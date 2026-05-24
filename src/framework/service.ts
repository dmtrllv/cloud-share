import { useEffect } from "react";
import { App } from "./app.js";

export type ServiceEvents = Record<string, {}>;

export type EventHandler<T> = (event: T) => any;

const EVENT_LISTENERS = Symbol("EVENT_LISTENERS");

export abstract class Service<Events extends ServiceEvents = {}> {
	/**
	 * React Hook 
	 */
	public static ctx<T extends Service<E>, E extends ServiceEvents>(this: ServiceType<T, E>): T {
		const appContext = App.useContext();
		return appContext.getService(this);
	};

	public static initEvents(service: Service<{}>) {
		const ctor = service.constructor as typeof Service;
		if (!(EVENT_LISTENERS in ctor)) {
			return;
		}

		const listeners = ctor[EVENT_LISTENERS]!;

		for (const key in listeners) {
			const [ServiceType, eventName] = (listeners as any)[key] as [ServiceType<any, any>, string | number | symbol];
			if (key in service) {
				let handler = service[key as keyof typeof service] as Function;
				if (typeof handler === "function") {
					handler = handler.bind(service);
					//todo: store a reference to the handler and remove the handler when the services get terminated 
					service.app.getService(ServiceType).on(eventName, handler);
				}
			}
		}
	}

	declare public static [EVENT_LISTENERS]?: Record<string, [ServiceType<any, any>, string | number | symbol]>;

	private readonly app: App;
	private readonly handlers: Map<keyof Events, EventHandler<any>[]> = new Map();

	public constructor(app: App) {
		this.app = app;
	}

	/**
	 * React Hook 
	 */
	public useEvent<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>, deps: any[] = []) {
		useEffect(() => {
			this.on(event, handler);
			return () => {
				this.remove(event, handler);
			};
		}, [event, handler, ...deps]);
	};


	protected useService<T extends Service<E>, E extends ServiceEvents>(type: ServiceType<T, E>) {
		return this.app.registerService(type);
	}

	public async onConfigure(): Promise<void> { }

	protected async emit<K extends keyof Events>(event: K, ...args: {} extends Events[K] ? [] | [value: {}] : [value: Events[K]]) {
		const handlers = this.handlers.get(event) || [];
		await Promise.all(handlers.map(h => {
			try {
				return h(args[0] || {});
			} catch (e) {
				console.warn(e);
			}
		}));
	}

	public on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, []);
		}
		this.handlers.get(event)!.push(handler);
	}

	public remove<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
		if (!this.handlers.has(event)) {
			return;
		}

		const handlers = this.handlers.get(event)!
		const index = handlers.indexOf(handler);
		if (index > -1) {
			handlers.splice(index, 1);
		}
	}
}

export const onEvent = <T extends new (app: App) => Service<any>, K extends ServiceEventKey<T>, Target extends Service<any>, TargetKey extends keyof Target>(type: T, key: K): OnEventDecorator<T, K, Target, TargetKey> => {
	return ((_target: Target, targetKey: TargetKey) => {
		const ctor = _target.constructor as typeof Service;
		if (!(EVENT_LISTENERS in ctor)) {
			ctor[EVENT_LISTENERS] = {};
		}
		ctor[EVENT_LISTENERS]![targetKey.toString()] = [type, key];
	}) as any;
};

export type ServiceType<T extends Service<E>, E extends ServiceEvents> = new (app: App) => T & Service<any>;

export type ServiceEventKey<T extends new (app: App) => Service<any>> = T extends new (app: App) => Service<infer E> ? keyof E : never;

export type ServiceEvent<T extends new (app: App) => Service<any>, K extends ServiceEventKey<T>> = T extends new (app: App) => Service<infer E> ? E[K] : never;

export type OnEventDecorator<T extends new (app: App) => Service<any>, K extends ServiceEventKey<T>, Target, TargetKey extends keyof Target> = ServiceEventHandler<T, K> extends Target[TargetKey] ? ((target: Target, key: TargetKey) => any) : "ERRPRPPPP";

export type ServiceEventHandler<T extends new (app: App) => Service<any>, K extends ServiceEventKey<T>> = (event?: ServiceEvent<T, K>) => any;
