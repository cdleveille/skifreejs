/* eslint-disable no-unused-vars */
import { IUser } from '../../models/User';
import { INewScore } from '../../types/ISocket';
import { ILeaderBoard } from '../../types/Abstract';

export default abstract class UserRepositoryBase {
	public abstract Register(user: IUser): Promise<IUser>;
	public abstract Login(user: IUser): Promise<IUser>;
	public abstract UpdateScore(user: INewScore): Promise<IUser>;
	public abstract LeaderBoard(limit: number): Promise<ILeaderBoard>;
}