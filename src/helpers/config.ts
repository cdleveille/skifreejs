import * as dotenv from 'dotenv';
import { Environment as Env, ShouldCache } from '../types/Constants';

dotenv.config();

const config = {
	PORT: <number>parseInt(process.env.PORT) || 3000,
	ENV: <Env>process.env.NODE_ENV || Env.dev,
	SHOULD_CACHE: <ShouldCache>process.env.SHOULD_CACHE || ShouldCache.false
};

export default config;