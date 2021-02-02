import path from 'path';
import { cwd } from 'process';
import express, { Request, Response } from 'express';

import config from './helpers/config';
import connect from './services/db';
import app from './controllers/index';
import logger from './services/logger';
import log from './services/logger';
import { _User } from './repositories/UserRepository';
import errorHandler from './middleware/errorHandler';
import { INewScore } from './types/ISocket';
import { IJwtPayload, IResponse } from './types/Abstract';
import { IUser } from './models/User';
import Jwt from './helpers/jwt';
import { Environment as Env } from './types/Constants';

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(cwd(), config.ENV === Env.dev ? './public/' : './public.min/')));
app.set('view engine', 'ejs');
app.set('views', path.join(cwd(), config.ENV === Env.dev ? './public/' : './public.min/'));

// serve static
app.get('/', async (req: Request, res: Response): Promise<void> => {
	return res.status(200).render('ski.ejs');
});
app.get('/websocket-client', async (req: Request, res: Response): Promise<void> => {
	return res.status(200).sendFile(`${cwd()}/node_modules/socket.io/client-dist/socket.io.js`);
});

// wildcard handler
app.get('*', async (req: Request, res: Response): Promise<Response> => {
	return res.status(404).send('404 not found');
});

// new websocket connection
io.on('connection', (socket: any) => {
	socket.on('new_score', async (payload: INewScore) => {
		// maybe run some checks here
		try {
			const newScore: IUser = await _User.UpdateScore(payload);

			const token: string = await Jwt.SignUser({
				_id: newScore._id,
				email: newScore.email,
				username: newScore.username,
				score: newScore.score
			} as IJwtPayload);
			// there should be a handler here on the client
			// which does something with their new high score
			await socket.emit('updated_score', { ok: true, status: 200, data: token } as IResponse);
		} catch (error) {
			await socket.emit('updated_score', { ok: false, status: 403, data: error } as IResponse);
		}
	});
});

// this must be referenced last
app.use(errorHandler);

const start = async (): Promise<void> => {
	try {
		await connect();
	} catch (e) {
		logger.error(e);
		throw Error(e);
	}
	http.listen(config.PORT, () => {
		log.info(`${config.ENV} server started http://localhost:${config.PORT}`);
	});
};

start();