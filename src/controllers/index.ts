import { NextFunction, Request, Response } from 'express';
import app from '../services/server';
import User from '../repositories/UserRepository';
import IResponse from '../types/IResponse';
import { IUser } from '../models/User';
import T, { IJwtPayload } from '../types/IGeneric';
import validate from '../middleware/jwt';
import { Errors } from '../types/Constants';
import Jwt from '../helpers/jwt';

app.post('/api/register', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { username, email, password }: IUser = req.body;
	try {
		if (username == undefined || email == undefined || password == undefined)
			throw Error(Errors.invalidScoreRequest);
		if (typeof username !== T.string || typeof email !== T.string || typeof password !== T.string)
			throw Error(Errors.invalidScoreRequest);

		const user: IUser = await User.Register(req.body);

		const token: string = await Jwt.SignUser({
			_id: user._id,
			email: user.email,
			username: user.username,
			score: user.score
		} as IJwtPayload);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				token: token
			}
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

app.post('/api/login', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	try {
		const user: IUser = await User.Login(req.body);

		const token: string = await Jwt.SignUser({
			_id: user._id,
			email: user.email,
			username: user.username,
			score: user.score
		} as IJwtPayload);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				token: token,
				score: user.score
			}
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

app.post('/api/validate', validate, async (req: Request, res: Response): Promise<Response> => {
	return res.status(200).send({
		ok: true,
		status: 200,
		data: res.locals.jwt
	} as IResponse);
});

export default app;