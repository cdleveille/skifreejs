import jwt from 'jsonwebtoken';
import dateFormat from 'dateformat';
import config from './config';
import { IJWT, IJwtPayload } from '../types/IGeneric';

export default class Jwt {

	public static async Sign(payload: IJwtPayload): Promise<string> {
		try {
			return jwt.sign(payload, config.JWT_SECRET, {
				expiresIn: config.JWT_EXPIRATION
			});
		} catch (e) {
			throw Error(e);
		}
	}

	public static async Verify(token: string): Promise<IJWT> {
		try {
			const data: IJWT = <IJWT>jwt.verify(token, config.JWT_SECRET);
			return {
				_id: data._id,
				username: data.username,
				email: data.email,
				score: data.score,
				iat: data.iat,
				exp: data.exp,
				issued: dateFormat(new Date(parseInt(data.iat) * 1000), 'yyyy-mm-dd h:MM:ss'),
				expires: dateFormat(new Date(parseInt(data.exp) * 1000), 'yyyy-mm-dd h:MM:ss')
			};
		} catch (e) {
			throw Error(e);
		}
	}

	public static async SignUser(user: IJwtPayload): Promise<string> {
		const token: string = await Jwt.Sign({
			_id: user._id,
			email: user.email,
			username: user.username
		} as IJwtPayload);
		return token;
	}
}