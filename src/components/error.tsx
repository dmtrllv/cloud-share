export const parseError = (error: any): string => {
	if(error instanceof Error) {
		return error.name + " " + error.message;
	}

	if(typeof error === "string")
		return error;

	if("name" in error)
	{
		let str = error.name;
		if("message" in error) {
			str += " " + error.message;
		}
		return str;
	}

	return error.toString();
};