import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import config from '../helpers/config';
import log from '../services/logger';

export interface IDevMail {
	preview: string | false,
	raw: any
}

export interface IMailOptions {
	to: string,
	from?: string,
	subject: string,
	text: string
}

export default class Mailer {

	private static readonly transporter: Mail = nodemailer.createTransport(config.MAIL_TRANSPORTER);

	private static async DevMailer(options: IMailOptions): Promise<IDevMail | Error> {

		const testAccount: nodemailer.TestAccount = await nodemailer.createTestAccount();

		const devMail: Mail = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // only true on 465
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});

		return new Promise((resolve, reject) => {
			devMail.sendMail(options, (error: Error, info: any) => {
				if (error) return reject(error);

				log.info(`preview: ${nodemailer.getTestMessageUrl(info)}`, info);
				return resolve({ preview: nodemailer.getTestMessageUrl(info), raw: info });
			});
		});

	}

	public static async SendMail(options: IMailOptions): Promise<void | IDevMail | Error> {

		if (!config.IS_PROD) {
			return await Mailer.DevMailer(options);
		}

		return new Promise((resolve, reject) => {
			Mailer.transporter.sendMail(options, (error: Error, info: any) => {
				if (error) return reject(error);
				return resolve(info);
			});
		});
	}
}