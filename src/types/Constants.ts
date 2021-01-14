/* eslint-disable no-unused-vars */
export const enum Errors {
	invalidScoreRequest = 'missing required body { username: <string>, score: <number> }'
}

export const enum Environment {
	dev = 'development',
	stg = 'staging',
	prod = 'production'
}