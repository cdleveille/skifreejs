import * as dotenv from 'dotenv';
import os from 'os';
import { Environment as Env, ShouldCache } from '../types/Constants';

dotenv.config();

const config = {
	PORT: <number>parseInt(process.env.PORT) || 3000,
	CONNECTION_STRING: <string>process.env.CONNECTION_STRING || undefined,
	ENV: <Env>process.env.NODE_ENV || Env.dev,
	CORES: <number>os.cpus().length,
	SHOULD_CACHE: <ShouldCache>process.env.SHOULD_CACHE || ShouldCache.false
};

export default config;