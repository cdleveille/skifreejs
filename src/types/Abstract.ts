/* eslint-disable no-unused-vars */
import { IUser } from '../models/User';

const enum IGeneric {
	string = 'string',
	number = 'number',
	boolean = 'boolean'
}


export interface ILeaderBoard {
	[index: number]: IUser
}

export interface IResponse {
	ok: boolean,
	status: number,
	data: any
}

export interface IJwtPayload {
	_id: string,
	email: string,
	username: string,
	score: number
}

export interface IJWT {
	_id: string,
	email: string,
	username: string,
	score: number,
	iat: string,
	exp: string,
	issued: string,
	expires: string
}

export interface IMailOptions {
	to: string,
	from?: string,
	subject: string,
	text: string
}


export default IGeneric;