import { Request, Response, NextFunction } from 'express';
import { Errors } from '../types/Constants';
import config from '../helpers/config';

export default (req: Request, res: Response, next: NextFunction) => {
	const { appcode, apptoken } = req.headers;

	console.log(req.get('host'));

	if (appcode == undefined || apptoken == undefined)
		throw Error(Errors.notAuthorized);
	else if (appcode !== config.APPCODE || apptoken !== config.APPTOKEN)
		throw Error(Errors.notAuthorized);
	else if (req.get('host') != config.ORIGIN_DOMAIN) {
		throw Error(Errors.notAuthorized);
	}
	else {
		next();
	}
};