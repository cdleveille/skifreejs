import bcrypt from 'bcrypt';

export default class Password {

	public static async hash(string: string): Promise<string> {
		try {
			const salt: string = await bcrypt.genSalt(12);
			const hash: string = await bcrypt.hash(string, salt);
			return hash;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async compare(pass: string, hash: string): Promise<boolean> {
		try {
			const valid: boolean = await bcrypt.compare(pass, hash);
			return valid;
		} catch (e) {
			throw Error(e);
		}
	}
}
