import User, { IUser } from '../models/User';
import Password from '../helpers/password';
import { INewScore } from '../types/ISocket';
import Base from './abstract/UserRepositoryBase';
import { ILeaderBoard } from '../types/Abstract';

class UserRepository extends Base {

	public async Register(user: IUser): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({
				$or: [
					{ username: user.username },
					{ email: user.email }
				]
			});
			if (exists) throw Error('username or email taken');

			const newUser: IUser = new User();
			newUser.username = user.username;
			newUser.email = user.email;
			newUser.password = await Password.hash(user.password);
			newUser.score = 0;
			newUser.isNew = true;

			return await newUser.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async Login(user: IUser): Promise<IUser> {
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

	public async UpdateScore(user: INewScore): Promise<IUser> {
		try {
			const exists = await User.findOne({ username: user.username, _id: user._id });
			if (!exists) throw Error('user not found');

			if (user.score <= exists.score) {
				return exists;
			}

			exists.score = user.score;
			exists.isNew = false;
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async LeaderBoard(limit: number): Promise<ILeaderBoard> {
		try {
			let lim: number;
			if (limit > 10 || !limit || limit == undefined) {
				lim = 10;
			}
			else lim = limit;

			return await User.find({}, { username: 1, score: 1, _id: 0 }).sort({ score: -1 }).limit(lim);
		} catch (e) {
			throw Error(e);
		}
	}
}

export const _User: Base = new UserRepository;