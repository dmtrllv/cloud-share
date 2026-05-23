import { createContext, useContext, useRef, useState, type PropsWithChildren } from "react";
import { useAsync, type AsyncState } from "../hooks";

export abstract class Context<State extends {}> {
	declare private static _ctx: React.Context<any>;

	protected static getContext<T extends Context<S>, S extends {}>(ContextClass: ContextType<T, S>): React.Context<any> {
		const self: typeof Context = ContextClass as any;
		if (!self._ctx)
			self._ctx = createContext<any>(null);
		return self._ctx;
	}

	public static Provider<T extends Context<S>, S extends {}>(this: ContextType<T, S>, props: PropsWithChildren<{ state: S } | { context: T }>) {
		const CtxType = useRef(Context.getContext(this));
		const ctx = useRef("state" in props ? new this(props.state) : props.context);
		const [state, setState] = useState(ctx.current.state);

		ctx.current.stateDispatcher = setState;

		return (
			<ctx.current.Provider>
				<CtxType.current.Provider value={state}>
					{props.children}
				</CtxType.current.Provider>
			</ctx.current.Provider>
		);
	}


	private stateDispatcher: React.Dispatch<React.SetStateAction<Readonly<State>>> = () => { };

	public static use<T extends Context<S>, S extends {}>(this: ContextType<T, S>): T {
		const CtxType = useRef(Context.getContext(this));
		const ctx = useContext(CtxType.current);
		if (ctx === null)
			throw new Error(`No ${this.name} context provided!`);
		return ctx;
	}

	protected readonly state: Readonly<State>;

	public constructor(state: State) {
		this.state = state;
	}

	public update(updater: (state: State) => State) {
		this.stateDispatcher(updater);
	}

	public Provider({ children }: PropsWithChildren) {
		return children;
	}
}

export abstract class AsyncContext<State extends {}> extends Context<AsyncState<State>> { }

export const AsyncProvider = <T extends Context<S>, S extends {}>(props: PropsWithChildren<{ type: ContextType<T, S>, resolver: () => Promise<S> }>) => {
	const CtxType = useRef(Context["getContext"](props.type));
	const [state, setState] = useAsync(props.resolver);
	const ctx = useRef(new (this as any)(state));
	ctx.current.state = state;
	ctx.current.stateDispatcher = setState;

	return (
		<ctx.current.Provider>
			<CtxType.current.Provider value={state}>
				{props.children}
			</CtxType.current.Provider>
		</ctx.current.Provider>
	);
};

type ContextType<T extends Context<S>, S extends {}> = { [K in keyof typeof Context]: typeof Context[K] } & (new (state: S) => T);