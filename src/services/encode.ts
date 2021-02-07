import path from 'path';
import { cwd } from 'process';
import fs from 'fs';

export default (file: string | number | Buffer | URL): any => {
	const filePath = path.join(cwd(), `profiles/${file}`);
	return new Promise((resolve, reject) => {
		try {
			const bitmap = fs.readFileSync(filePath);
			fs.unlinkSync(filePath);
			return resolve(Buffer.from(bitmap).toString('base64'));
		} catch (error) {
			return reject(error);
		}
	});
};