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

export interface INewPassword {
	password: string,
	newPassword: string,
	email: string,
	username: string
}

export interface INewEmail {
	password: string,
	newEmail: string,
	email: string,
	username: string
}

export interface INewUsername {
	password: string,
	newUsername: string,
	email: string,
	username: string
}


export default IGeneric;