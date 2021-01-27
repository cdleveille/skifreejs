/* eslint-disable no-unused-vars */
import { IUser } from '../../models/User';

export default abstract class UserRepositoryBase {
	public abstract Register(user: IUser): Promise<IUser>;
	public abstract Login(user: IUser): Promise<IUser>;
	public abstract UpdateScore(user: IUser): Promise<IUser>;
}