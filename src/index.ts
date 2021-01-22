import config from './helpers/config';
import path from 'path';
import express, { Request, Response } from 'express';
import app from './controllers/index';
import { cwd } from 'process';
import log from './services/logger';
import errorHandler from './middleware/errorHandler';
import logger from './services/logger';
import { INewScore } from './types/ISocket';

const isCompiled = <boolean>path.extname(__filename).includes('js');

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(cwd(), (isCompiled ? './public.min/' : './public/'))));
app.set('view engine', 'ejs');
app.set('views', path.join(cwd(), (isCompiled ? './public.min/' : './public/')));

// serve static
app.get('/', async (req: Request, res: Response): Promise<void> => res.status(200).render('ski.ejs'));

// new websocket connection
io.on('connection', (socket: any) => {
	logger.info(socket.id);
	socket.on('new_score', (payload: INewScore) => {
		// maybe run some checks here
		logger.info(payload);
	});
});

// this must be referenced last
app.use(errorHandler);

const start = async (): Promise<void> => {
	http.listen(config.PORT, () => {
		log.info(`server started http://localhost:${config.PORT}`);
	});
};

start();