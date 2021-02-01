import { Request, Response, NextFunction } from 'express';
import Jwt from '../helpers/jwt';

export default async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
	try {
		const authHeader = req.headers['authorization'];

		const token = authHeader && authHeader.split(' ')[1];

		if (token == null) {
			res.locals.jwt = null;
			throw Error('invalid jwt');
		}

		const payload = await Jwt.Verify(token);
		if (!payload) {
			res.locals.jwt = null;
			throw Error('invalid jwt');
		}

		res.locals.jwt = payload;
		return next();
	} catch (e) {
		res.locals.jwt = null;
		next(e);
	}
};