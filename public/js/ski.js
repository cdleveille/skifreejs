/* eslint-disable no-undef */
import Game from './game.js';
import InputHandler from './input.js';
import WindowHandler from './window.js';

let canvas = document.getElementById('gameScreen');
canvas.oncontextmenu = function (e) {
	e.preventDefault();
};
let ctx = canvas.getContext('2d');

let game = new Game();
if (game.util.isOnMobile()) {
	screen.orientation.lock('portrait');
}
new InputHandler(canvas, game);
new WindowHandler(canvas, game);

let updateRate = 500;
let dt, now, last = game.util.timestamp(), step = 1 / updateRate;

function frame() {
	now = game.util.timestamp();
	dt = Math.min(1, (now - last) / 1000);

	while (dt > step) {
		dt = dt - step;
		if (!game.isPaused) {
			game.update(step);
		}
	}

	game.draw(ctx);
	last = now - (dt % step);
	requestAnimationFrame(frame);
}

requestAnimationFrame(frame);