import * as dotenv from 'dotenv';
import os from 'os';
import { Environment as Env } from '../types/Constants';

dotenv.config();

const config = {
	PORT: <number>parseInt(process.env.PORT) || 3000,
	CONNECTION_STRING: <string>process.env.CONNECTION_STRING || undefined,
	JWT_SECRET: <string>process.env.JWT_SECRET || undefined,
	JWT_EXPIRATION: <string | number>'7d',
	ENV: <Env>process.env.NODE_ENV || Env.dev,
	CORES: <number>os.cpus().length,
	APPCODE: <string>process.env.APPCODE || undefined,
	APPTOKEN: <string>process.env.APPTOKEN || undefined,
	ORIGIN_DOMAIN: <string>process.env.ORIGIN_DOMAIN || undefined,
	IS_COMPILED: <boolean>(process.env.NODE_ENV == Env.dev ? false : true)
};

export default config;