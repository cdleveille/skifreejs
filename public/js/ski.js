/* eslint-disable no-undef */
import Game from './game.js';
import InputHandler from './input.js';
import WindowHandler from './window.js';

let canvas = document.getElementById('gameScreen');
let ctx = canvas.getContext('2d');

let game = new Game();
new InputHandler(canvas, game);
new WindowHandler(canvas, game);

let dt, now, last = game.util.timestamp(), step = 1 / 500;

function frame() {
	now = game.util.timestamp();
	dt = Math.min(1, (now - last) / 1000);
	while (dt > step) {
		dt = dt - step;
		game.update(now, step);
	}
	game.draw(ctx);
	last = now - (dt % step);
	requestAnimationFrame(frame);
}

requestAnimationFrame(frame);