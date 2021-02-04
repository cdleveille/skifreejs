import { NextFunction, Request, Response } from 'express';
import app from '../services/server';
import { _User } from '../repositories/UserRepository';
import IResponse from '../types/IResponse';
import { IUser } from '../models/User';
import T, { IJwtPayload, ILeaderBoard } from '../types/Abstract';
import validate from '../middleware/jwt';
import * as checks from '../helpers/checks';
import { Errors } from '../types/Constants';
import Jwt from '../helpers/jwt';

app.post('/api/register', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { username, email, password }: IUser = req.body;
	try {
		if (username == undefined || email == undefined || password == undefined)
			throw Error(Errors.invalidScoreRequest);
		if (typeof username !== T.string || typeof email !== T.string || typeof password !== T.string)
			throw Error(Errors.invalidScoreRequest);

		if (!checks.isAlphaNumeric(username)) {
			throw 'username must be alphanumeric only';
		}

		if (username.length < 3) {
			throw 'username must be at least 3 characters';
		} else if (username.length > 16) {
			throw 'username must be no more than 16 characters';
		}

		if (password.length < 8) {
			throw 'password must be at least 8 characters';
		}

		const user: IUser = await _User.Register(req.body);

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
		const user: IUser = await _User.Login(req.body);

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

app.get('/api/leaderboard/:limit', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const limit: number = parseInt(req.params.limit);
	try {
		const leaderboard: ILeaderBoard = await _User.LeaderBoard(limit);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: leaderboard
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

app.post('/api/sendrecovery', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

	const { username, email }: IUser = req.body;

	try {
		if (username == undefined || email == undefined) {
			throw 'missing username / email';
		}

		await _User.SendRecovery(email, username);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: `recovery email sent to ${email}`
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

app.post('/api/updatepassword', validate, async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

	const { password, newPassword } = req.body;

	try {
		if (password == undefined || newPassword == undefined) {
			throw 'missing password / new password';
		}

		const updated = await _User.UpdatePassword({
			password: password,
			newPassword: newPassword,
			email: res.locals.jwt.email,
			username: res.locals.jwt.username
		});

		const token: string = await Jwt.SignUser({
			_id: updated._id,
			email: updated.email,
			username: updated.username,
			score: updated.score
		} as IJwtPayload);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				token: token,
				score: updated.score
			}
		} as IResponse);
	} catch (error) {
		next(error);
	}
});

export default app;