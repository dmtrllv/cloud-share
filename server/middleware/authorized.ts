import type { Request, Response, NextFunction } from "express";

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
	if(req.session?.userId === undefined) {
		return res.send("<h1>Unauthorized!</h1>").status(401).end();
	}

	return next();
}