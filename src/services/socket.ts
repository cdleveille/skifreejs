import { io } from '../index';
import logger from '../services/logger';
import { INewScore } from '../types/ISocket';

// new websocket connection
io.on('connection', (socket: any) => {
	socket.on('new_score', (payload: INewScore) => {
		// maybe run some checks here
		logger.info(payload);
	});
});