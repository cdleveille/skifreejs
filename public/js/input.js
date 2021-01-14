/* eslint-disable no-undef */
export default class InputHandler {
	constructor(canvas, game) {
		canvas.addEventListener('mousemove', (event) => {
			let mouseX = event.clientX - ((window.innerWidth - canvas.width) / 2);
			let mouseY = event.clientY - ((window.innerHeight - canvas.height) / 2);

			game.mousePos = [mouseX, mouseY];
		});

		canvas.addEventListener('click', () => {
			if (!game.isPaused) {
				if (!game.skier.isJumping && !game.skier.isCrashed) {
					game.skier.isJumping = true;
					game.skier.jumpV = game.skier.jumpVInit;
				} else if (game.skier.isCrashed && game.skier.isStopped) {
					game.skier.isCrashed = false;
				}
			}
		});

		let left = 65, right = 68, p = 80, r = 82;

		document.addEventListener('keydown', (event) => {
			switch (event.keyCode) {
				case left:
					if (game.skier.isStopped) {
						game.skier.isSkatingLeft = true;
					}
					break;
				case right:
					if (game.skier.isStopped) {
						game.skier.isSkatingRight = true;
					}
					break;
			}
		});

		document.addEventListener('keyup', (event) => {
			switch (event.keyCode) {
				case left:
					game.skier.isSkatingLeft = false;
					break;
				case right:
					game.skier.isSkatingRight = false;
					break;
				case p:
					if (game.isPaused) {
						game.startTime += (game.timestamp() - game.timePausedAt);
						game.isPaused = false;
					} else {
						game.timePausedAt = game.timestamp();
						game.isPaused = true;
					}
					break;
				case r:
					game.restart();
					break;
			}
		});
	}
}
