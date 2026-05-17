export const notNullOr = <T>(val: T, onError: () => Error): NonNullable<T> => {
	if(val === null || val === undefined) {
		throw onError();
	}
	return val;
}