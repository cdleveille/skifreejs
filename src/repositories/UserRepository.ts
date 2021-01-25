import User, { IUser } from '../models/User';
import Password from '../helpers/password';

export default class UserRepository {

	public static async Register(user: IUser): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: user.username });
			if (exists) throw Error('username taken');

			const newUser: IUser = new User();
			newUser.username = user.username;
			newUser.password = await Password.hash(user.password);
			newUser.score = user.score || 0;
			newUser.isNew = true;

			return await newUser.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public static async Login(user: IUser): Promise<IUser> {
		try {
			const query: IUser = await User.findOne({ username: user.username });
			if (!query) throw Error('username not found');

			const pass: boolean = await Password.compare(user.password, query.password);
			if (!pass) throw Error('incorrect password');

			return query;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateScore(user: IUser): Promise<IUser> {
		try {
			const exists = await User.findOne({ username: user.username });
			if (!exists) throw Error('username not found');

			const pass = await Password.compare(user.password, exists.password);
			if (!pass) throw Error('incorrect password');

			exists.score = user.score;
			exists.isNew = false;
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}
}