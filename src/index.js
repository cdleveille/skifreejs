const config = require('./helpers/config');
const express = require('express');
const app = require('./controllers/index');

app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
	res.sendFile(__dirname + '/public/ski.html');
});

const start = async () => {
	app.listen(config.PORT, () => {
		console.log(`server started http://localhost:${config.PORT}`);
	});
};

start();