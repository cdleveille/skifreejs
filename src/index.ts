//import cluster from 'cluster';
import config from './helpers/config';
import path from 'path';
import express, { Request, Response } from 'express';
import app from './controllers/index';
import { cwd } from 'process';
import log from './services/logger';
import errorHandler from './middleware/errorHandler';
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(cwd(), './public/')));
app.set('view engine', 'ejs');
app.set('views', path.join(cwd(), './public/'));

// serve static
app.get('/', async (req: Request, res: Response): Promise<void> => res.status(200).render('ski.ejs'));

// new websocket connection
interface IPayload {
	username: string,
	score: number
}

io.on('connection', (socket: any) => {
	socket.on('new_score', (payload: IPayload) => {
		console.log(payload);
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
//if (cluster.isMaster) {
//	for (let i = 0; i < config.CORES; i++) {
//		cluster.fork();
//	}
//}
//else {
//	start();
//}