/* eslint-disable no-unused-vars */
import { IUser } from '../../models/User';
import { INewScore } from '../../types/ISocket';

export default abstract class UserRepositoryBase {
	public abstract Register(user: IUser): Promise<IUser>;
	public abstract Login(user: IUser): Promise<IUser>;
	public abstract UpdateScore(user: INewScore): Promise<IUser>;
}