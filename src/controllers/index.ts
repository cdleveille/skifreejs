import { NextFunction, Request, Response } from 'express';
import app from '../services/server';
import User from '../repositories/UserRepository';
import IResponse from '../types/IResponse';
import { IUser } from '../models/User';
import T from '../types/IGeneric';
import { Errors } from '../types/Constants';

app.post('/api/register', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { username, password, score } = <IUser>req.body;
	try {
		if (username == undefined || score == undefined || password == undefined)
			throw Error(Errors.invalidScoreRequest);
		if (typeof username !== T.string || typeof score !== T.number || typeof password !== T.string)
			throw Error(Errors.invalidScoreRequest);

		const user = await User.Register(req.body);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				username: user.username,
				score: user.score
			}
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

app.post('/api/login', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	try {
		const user = await User.Login(req.body);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				username: user.username,
				score: user.score
			}
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

export default app;