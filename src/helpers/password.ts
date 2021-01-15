import bcrypt from 'bcrypt';

export const hash = async (string: string): Promise<string> => {
	try {
		const salt = await bcrypt.genSalt(12);
		const hash = await bcrypt.hash(string, salt);
		return hash;
	} catch (e) {
		throw Error(e);
	}
};

export const compare = async (pass: string, hash: string): Promise<boolean> => {
	try {
		const valid = await bcrypt.compare(pass, hash);
		return valid;
	} catch (e) {
		throw Error(e);
	}
};
