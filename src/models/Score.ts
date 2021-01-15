import mongoose, { Document } from 'mongoose';

export interface IScore extends Document {
	_id: string,
	username: number,
	score: number
}

const Score = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true
		},
		score: {
			type: Number,
			required: true
		}
	},
	{
		collection: 'Score',
		versionKey: false
	}
);
export default mongoose.model<IScore>('Score', Score);