/* eslint-disable no-unused-vars */
export const enum Errors {
	invalidScoreRequest = 'missing required body { username: <string>, password: <string>, score: <number> }',
	notAuthorized = 'not authorized'
}

export const enum Environment {
	dev = 'development',
	stg = 'staging',
	prod = 'production'
}

export const enum AttachSW {
	true = 'true',
	false = 'false'
}