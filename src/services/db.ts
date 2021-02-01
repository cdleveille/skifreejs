import mongoose from 'mongoose';
import logger from '../services/logger';
import config from '../helpers/config';

const { CONNECTION_STRING } = config;

const connect = async (): Promise<void> => {
	let connection: string | undefined;
	try {
		connection = mongoose.connection.host;
	} catch (e) {
		logger.error('error connecting to database', e);
	}

	try {
		if (connection) {
			await mongoose.connect(connection);
		} else {
			await mongoose.connect(CONNECTION_STRING, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true,
				poolSize: 10,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000
			});
		}
		logger.info('successfully connected to database');
	} catch (e) {
		logger.error('error connecting to database', e);
		throw Error(e);
	}
};

export default connect;