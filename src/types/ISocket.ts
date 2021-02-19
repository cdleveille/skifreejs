export interface INewScore {
	_id: string,
	username: string,
	score: number
}

export interface INewScoreSlalom {
	_id: string,
	username: string,
	slalomScore: number
}

export interface IPlayer {
	id: string,
	score: number,
	slalomScore: number
}