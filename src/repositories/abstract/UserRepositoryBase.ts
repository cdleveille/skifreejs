/* eslint-disable no-unused-vars */
import { IUser } from '../../models/User';
import { INewScore, INewScoreSlalom } from '../../types/ISocket';
import { ILeaderBoard, INewPassword, INewUsername, INewEmail, INewProfile, IGetProfile } from '../../types/Abstract';

export default abstract class UserRepositoryBase {
	public abstract Register(user: IUser): Promise<IUser>;
	public abstract Login(user: IUser): Promise<IUser>;
	public abstract UpdateScore(user: INewScore): Promise<IUser>;
	public abstract UpdateScoreSlalom(user: INewScoreSlalom): Promise<IUser>;
	public abstract LeaderBoard(limit: number): Promise<ILeaderBoard>;
	public abstract LeaderBoardSlalom(limit: number): Promise<ILeaderBoard>;
	public abstract SendRecovery(email: string, username: string): Promise<void>;
	public abstract UpdatePassword(newPass: INewPassword): Promise<IUser>;
	public abstract UpdateEmail(newEmail: INewEmail): Promise<IUser>;
	public abstract UpdateUsername(newUsername: INewUsername): Promise<IUser>;
	public abstract UploadPicture(newProfile: INewProfile): Promise<IUser>;
	public abstract GetProfile(user: IGetProfile): Promise<String>;
}