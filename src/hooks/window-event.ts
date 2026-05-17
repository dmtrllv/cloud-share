import { useEffect } from "react"

export function useWindowEvent<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, deps: any[]): void;
export function useWindowEvent<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options: boolean | AddEventListenerOptions, deps: any[]): void;
export function useWindowEvent<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, ...rest: any[]) {
	useEffect(() => {
		const options = rest.length === 2 ? rest[0] : undefined;
		window.addEventListener(type, listener, options);
		return () => {
			window.removeEventListener(type, listener, options);
		};
	}, [type, listener, ...rest]);
};