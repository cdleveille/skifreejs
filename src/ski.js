import Game from "/src/game.js";
import InputHandler from "/src/input.js";
import WindowHandler from "/src/window.js";

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

let game = new Game();
new InputHandler(canvas, game);
new WindowHandler(canvas, game);

let updateRate = 500;
let dt, now, last = game.timestamp(), step = 1 / updateRate;

function frame() {
	
	now = game.timestamp();
	dt = Math.min(1, (now - last) / 1000);

	while(dt > step) {
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