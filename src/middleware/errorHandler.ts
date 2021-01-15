import { Request, Response, NextFunction, Errback } from 'express';
import IResponse from '../types/IResponse';

const errorHandler = (error: Errback, req: Request, res: Response, next: NextFunction) => {
	if (error) {
		return res.status(500).json({
			ok: false,
			status: 500,
			data: error.toString()
		} as IResponse);
	}
	else next();
};

export default errorHandler;