import { Request, Response } from 'express';
import app from '../services/server';
import IResponse from '../types/IResponse';
import IUserScore from '../types/IUserScore';
import IGeneric from '../types/IGeneric';
import { Errors } from '../types/Constants';

app.post('/api/score', async (req: Request, res: Response): Promise<Response> => {

	const { username, score } = <IUserScore>req.body;

	if (username == undefined || score == undefined) {
		return res.status(500).send({
			ok: false,
			status: 500,
			data: Errors.invalidScoreRequest
		} as IResponse);
	}

	if (typeof username !== IGeneric.string || typeof score !== IGeneric.number) {
		return res.status(500).send({
			ok: false,
			status: 500,
			data: Errors.invalidScoreRequest
		} as IResponse);
	}

	res.status(200).send({
		ok: true,
		status: 200,
		data: {
			UserName: username,
			Score: score
		}
	} as IResponse);
});

export default app;