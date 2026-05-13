export type ApiResponse<T> = {
	data: T;
	error?: undefined;
} | {
	data?: undefined;
	error: string;
};

export const ApiResponse = {
	data: <T>(data: T): ApiResponse<T> => ({ data }),
	error: <T>(error: string): ApiResponse<T> => ({ error })
} as const;