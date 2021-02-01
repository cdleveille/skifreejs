import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
	_id: string,
	username: string,
	email: string,
	password: string,
	score: number
}

const User = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		score: {
			type: Number,
			required: true
		}
	},
	{
		collection: 'User',
		versionKey: false
	}
);
export default mongoose.model<IUser>('User', User);