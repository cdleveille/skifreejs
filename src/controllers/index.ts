import { NextFunction, Request, Response } from 'express';
import app from '../services/server';
import IResponse from '../types/IResponse';
import IUserScore from '../types/IUserScore';
import T from '../types/IGeneric';
import { Errors } from '../types/Constants';

app.post('/api/score', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

	const { username, score } = <IUserScore>req.body;

	try {
		if (username == undefined || score == undefined) throw Error(Errors.invalidScoreRequest);
		if (typeof username !== T.string || typeof score !== T.number) throw Error(Errors.invalidScoreRequest);

		return res.status(200).send({
			ok: true,
			status: 200,
			data: {
				UserName: username,
				Score: score
			}
		} as IResponse);

	} catch (error) {
		next(error);
	}
});

export default app;