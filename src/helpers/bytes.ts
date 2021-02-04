import crypto from 'crypto';

export default async (num?: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			const bytes = crypto.randomBytes(num || 20).toString('hex');
			return resolve(bytes);
		} catch (error) {
			return reject(error);
		}
	});
};