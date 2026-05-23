import { useEffect, useState } from "react";

export const useAsync = <T>(asyncCallback: () => Promise<T>, initValue?: T): AsyncStateArr<T> => {
	const [state, setState] = useState<AsyncState<T>>(() => initValue !== undefined ? { isLoading: false, data: initValue, error: undefined } : { isLoading: true, data: undefined, error: undefined });

	const resolve = () => asyncCallback().then(res => setState({ error: undefined, isLoading: false, data: res })).catch(e => setState({ error: e as any, isLoading: false, data: undefined }));

	useEffect(() => {
		if (state.isLoading && state.data === undefined && state.error === undefined) {
			resolve();
		}
	}, []);

	const update = (data: T | undefined, error?: Error | string | undefined) => {
		setState({ data, isLoading: false, error } as any);
	};

	const invalidate = (clear?: boolean) => {
		if (clear) {
			setState(() => ({ isLoading: true, data: undefined, error: undefined }));
		} else {
			setState((state) => ({ ...state, isLoading: true }));
		}
		resolve();
	};

	return [state, update as any, invalidate];
};

export interface AsyncStateUpdateFn<T> {
	update(data: T, error: undefined): void;
	update(data: undefined, error: Error | string): void;
}

export type AsyncStateArr<T> = [state: AsyncState<T>, update: AsyncStateUpdateFn<T>, invalidate: (clear?: boolean) => void]

export type AsyncState<T> = {
	data: undefined;
	error: undefined;
	isLoading: true;
} | {
	data: T;
	error: undefined;
	isLoading: boolean;
} | {
	data: undefined;
	error: Error | string;
	isLoading: boolean;
}