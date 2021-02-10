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
import cache from './helpers/cache';
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

const loggedInUsers: { [key: string]: string; } = {};

io.on('connection', (socket: any) => {
	cache.set(`player_${socket.id}_score`, { score: 0 });

	socket.on('disconnect', () => {
		cache.del(`player_${socket.id}_score`);

		if (loggedInUsers[socket.id]) {
			socket.broadcast.emit('user-disconnected', loggedInUsers[socket.id]);
			delete loggedInUsers[socket.id];
		}
	});

	socket.on('user-connected', (username: string) => {
		loggedInUsers[socket.id] = username;
		socket.broadcast.emit('user-connected', username);
	});

	socket.on('user-disconnected', () => {
		if (loggedInUsers[socket.id]) {
			socket.broadcast.emit('user-disconnected', loggedInUsers[socket.id]);
			delete loggedInUsers[socket.id];
		}
	});

	socket.on('user-changed-username', (newUsername: string) => {
		if (loggedInUsers[socket.id]) {
			let oldUsername = loggedInUsers[socket.id];
			loggedInUsers[socket.id] = newUsername;
			socket.broadcast.emit('user-changed-username', oldUsername, newUsername);
		}
	});

	socket.on('chat-message', (message: string) => {
		socket.broadcast.emit('chat-message', { username: loggedInUsers[socket.id], message: message });
	});

	socket.on('new_point', (curScore: number) => {
		const cacheScore = cache.get(`player_${socket.id}_score`);

		if (!cacheScore) {
			throw 'user not found';
		}
		else if (curScore - cacheScore.score > 100) {
			throw 'suspicious activity detected';
		}
		cache.set(`player_${socket.id}_score`, { score: curScore });
	});

	socket.on('new_score', async (payload: INewScore) => {
		// maybe run some checks here
		const cacheScore = cache.get(`player_${socket.id}_score`);

		if (!cacheScore) {
			throw 'user not found';
		}
		else if (cacheScore.score != payload.score) {
			throw 'suspicious activity detected';
		}
		else if (payload.score - cacheScore.score > 100) {
			throw 'suspicious activity detected';
		}
		else if (payload.score % 1 != 0) {
			throw 'suspicious activity detected';
		}

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