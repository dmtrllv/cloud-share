export const hasKeys = <T extends object, K extends string[]>(obj: T, keys: K): obj is WithKeys<T, K> => {
	return keys.find(k => !(k in obj)) === undefined;
};

type WithKeys<T extends object, Keys extends string[]> = T & {
	[K in Keys[number]]: any
};

export const objKeys = <T extends object>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[];

export const isKeyOf = <T extends object>(key: string | keyof T, obj: T): key is keyof T => {
	return key in obj;
}