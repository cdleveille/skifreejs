import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
	_id: string,
	username: string,
	email: string,
	password: string,
	score: number,
	slalomScore: number,
	lastUpdated: Date,
	profilePicture: string
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
		},
		slalomScore: {
			type: Number,
			required: true
		},
		lastUpdated: {
			type: Date,
			required: true
		},
		profilePicture: {
			type: String,
			required: false
		}
	},
	{
		collection: 'User',
		versionKey: false
	}
);
export default mongoose.model<IUser>('User', User);