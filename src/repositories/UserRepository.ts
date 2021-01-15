import User, { IUser } from '../models/User';

export default class UserRepository {

	public static async UpdateScore(user: IUser): Promise<IUser> {
		try {
			const exists = await User.findOne({ username: user.username });
			if (!exists) throw Error('username not found');

			exists.score = user.score;
			exists.isNew = false;
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public static async NewScore(user: IUser): Promise<IUser> {
		try {
			const exists = await User.findOne({ username: user.username }).lean();
			if (exists) throw Error('username taken');

			const newUser = new User();
			newUser.username = user.username;
			newUser.score = user.score;
			newUser.isNew = true;

			return await newUser.save();
		} catch (e) {
			throw Error(e);
		}
	}
}