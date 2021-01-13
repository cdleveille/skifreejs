const config = require('../helpers/config');
const express = require('express');
const bodyParser = require('body-parser');
const responseTime = require('response-time');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

app.disable('x-powered-by');
app.set('json spaces', 2);
app.use(bodyParser.json());
app.use(compression());

// environment conditionals
if (config.ENV === 'development') {
	app.use(responseTime());
	app.use(morgan('combined'));
}
if (config.ENV === 'production') {
	app.use(helmet());
}

module.exports = app;