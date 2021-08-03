import User, { IUser } from '../models/User';
import Password from '../helpers/password';
import { INewScore, INewScoreSlalom } from '../types/ISocket';
import Base from './abstract/UserRepositoryBase';
import { IGetProfile, ILeaderBoard, INewEmail, INewPassword, INewProfile, INewUsername } from '../types/Abstract';
import { Nums } from '../types/Constants';
import Mail from '../services/mailer';
import bytes from '../helpers/bytes';
import config from '../helpers/config';

class UserRepository extends Base {

	public async Register(user: IUser): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({
				$or: [
					{ username: user.username },
					{ email: user.email }
				]
			}).lean();
			if (exists) throw Error('username or email taken');

			const newUser: IUser = new User();
			newUser.username = user.username;
			newUser.email = user.email;
			newUser.password = await Password.hash(user.password);
			newUser.score = 0;
			newUser.slalomScore = 0;
			newUser.profilePicture = '';
			newUser.lastUpdated = new Date;
			newUser.isNew = true;

			return await newUser.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async Login(user: IUser): Promise<IUser> {
		try {
			const query: IUser = await User.findOne({ username: user.username }).lean();
			if (!query) throw Error('username not found');

			const pass: boolean = await Password.compare(user.password, query.password);
			if (!pass) throw Error('incorrect password');

			return query;
		} catch (e) {
			throw Error(e);
		}
	}

	public async GetUser(username: string): Promise<IUser> {
		try {
			const query: IUser = await User.findOne({ username: username, });
			if (!query) throw Error('username not found');

			return query;
		} catch (e) {
			throw Error(e);
		}
	}

	public async UpdateScore(user: INewScore): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: user.username, _id: user._id });
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

	public async UpdateScoreSlalom(user: INewScoreSlalom): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: user.username, _id: user._id });
			if (!exists) throw Error('user not found');

			user.slalomScore = 1000000000 - user.slalomScore;

			if (user.slalomScore <= exists.slalomScore) {
				return exists;
			}

			exists.slalomScore = user.slalomScore;
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

	public async LeaderBoardSlalom(limit: number): Promise<ILeaderBoard> {
		try {
			let lim: number;
			if (limit > 10 || !limit || limit == undefined) {
				lim = 10;
			}
			else lim = limit;

			return await User.find({}, { username: 1, slalomScore: 1, _id: 0 }).sort({ slalomScore: -1 }).limit(lim);
		} catch (e) {
			throw Error(e);
		}
	}

	public async SendRecovery(email: string, username: string): Promise<void> {
		try {
			const exists: IUser = await User.findOne({ username: username, email: email });
			if (!exists) throw 'invalid email or username';

			const newPass = await bytes();

			const template = {
				to: email,
				from: config.EMAIL_FROM,
				subject: 'Forgot Password (DO NOT REPLY)',
				text: `your new temporary password is ${newPass}`
			};

			exists.isNew = false;
			exists.password = await Password.hash(newPass);
			await exists.save();

			await Mail.SendMail(template);
		} catch (e) {
			throw Error(e);
		}
	}

	public async UpdatePassword(newPass: INewPassword): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: newPass.username, email: newPass.email });
			if (!exists) throw 'username / email not found';

			const pass: boolean = await Password.compare(newPass.password, exists.password);
			if (!pass) throw Error('incorrect password');

			const timestamp: number = +new Date(exists.lastUpdated);
			const now: number = +new Date();
			if (config.IS_PROD && (now - timestamp) < Nums.oneDay) {
				throw 'password updated too recently';
			}

			exists.lastUpdated = new Date();
			exists.isNew = false;
			exists.password = await Password.hash(newPass.newPassword);
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async UpdateEmail(newEmail: INewEmail): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: newEmail.username, email: newEmail.email });
			if (!exists) throw 'username / email not found';

			const pass: boolean = await Password.compare(newEmail.password, exists.password);
			if (!pass) throw Error('incorrect password');

			const taken: IUser = await User.findOne({ email: newEmail.newEmail }).lean();
			if (taken) throw 'email taken';

			exists.isNew = false;
			exists.email = newEmail.newEmail;
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async UpdateUsername(newUsername: INewUsername): Promise<IUser> {
		const exists: IUser = await User.findOne({ username: newUsername.username, email: newUsername.email });
		if (!exists) throw 'username / email not found';

		const pass: boolean = await Password.compare(newUsername.password, exists.password);
		if (!pass) throw Error('incorrect password');

		const taken: IUser = await User.findOne({ username: newUsername.newUsername }).lean();
		if (taken) throw 'username taken';

		exists.isNew = false;
		exists.username = newUsername.newUsername;
		return await exists.save();
	}

	public async UploadPicture(newProfile: INewProfile): Promise<IUser> {
		try {
			const exists: IUser = await User.findOne({ username: newProfile.username });
			if (!exists) throw Error('username not found');

			const pass: boolean = await Password.compare(newProfile.password, exists.password);
			if (!pass) throw Error('incorrect password');

			exists.profilePicture = newProfile.profile;
			exists.isNew = false;
			return await exists.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public async GetProfile(user: IGetProfile): Promise<String> {
		try {
			const exists: IUser = await User.findOne({ username: user.username, email: user.email });
			if (!exists) throw Error('user not found');

			return exists.profilePicture;
		} catch (e) {
			throw Error(e);
		}
	}
}

export const _User: Base = new UserRepository;