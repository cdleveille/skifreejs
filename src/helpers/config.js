require('dotenv').config();

const config = {
	PORT: process.env.PORT || 3000,
	ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;