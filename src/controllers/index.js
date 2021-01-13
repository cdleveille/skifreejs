const app = require('../services/server');

app.post('/api/score', async (req, res) => {
	const { username, score } = req.body;
	if (username == undefined || score == undefined) {
		return res.status(500).send({
			ok: false,
			status: 500,
			message: 'missing required body { username: <string>, score: <number> }'
		});
	}
	if (typeof (username) !== 'string' || typeof (score) !== 'number') {
		return res.status(500).send({
			ok: false,
			status: 500,
			message: 'missing required body { username: <string>, score: <number> }'
		});
	}
	res.send({
		UserName: username,
		Score: score
	});
});

module.exports = app;