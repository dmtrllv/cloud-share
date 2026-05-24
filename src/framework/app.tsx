import { createRoot, type Root } from "react-dom/client"
import { Service, type ServiceEvents, type ServiceType } from "./service.js";
import React, { useContext } from "react";

export class App {
	private static readonly contextType = React.createContext<null | App>(null);

	public static readonly useContext = () => {
		const ctx = useContext(App.contextType);
		if(ctx === null)
			throw new Error("No App Context provided!");
		return ctx as App;
	};

	private static readonly getUIRoot = (): HTMLDivElement => {
		let root = document.getElementById("root")
		if (!root) {
			root = document.createElement("root");
			root.id = "root";
			document.body.appendChild(root);
		}
		return root as HTMLDivElement;
	};

	private readonly services = new Map<ServiceType<any, any>, Service<any>>();

	private readonly uiRootElement = App.getUIRoot();

	private uiRoot: Root | null = null;

	public constructor() { }

	public registerService<T extends Service<E>, E extends ServiceEvents>(type: ServiceType<T, E>): T {
		if (this.services.has(type))
			throw new Error(`Service ${type.name} is already registered!`);
		const service = new type(this) as T;
		this.services.set(type, service);
		return service;
	}

	public getService<T extends Service<E>, E extends ServiceEvents>(type: ServiceType<T, E>): T {
		if (!this.services.has(type))
			throw new Error(`Service ${type.name} is not registered!`);
		return this.services.get(type) as T;
	}

	public async render(Component: React.FC) {
		if (this.uiRoot !== null)
			throw new Error("App is already rendering!");

		const services = Array.from(this.services.values());
		services.forEach(service => Service.initEvents(service));
		await Promise.all(this.services.values().map(service => service.onConfigure()));

		this.uiRoot = createRoot(this.uiRootElement);

		const UI = () => (
			<App.contextType.Provider value={this}>
				<Component />
			</App.contextType.Provider>
		);

		this.uiRoot.render(<UI />);
	}

	public async stop() {
		if (this.uiRoot === null)
			throw new Error("App is not running!");

		this.uiRoot.unmount();
		this.uiRoot = null;
	}
}