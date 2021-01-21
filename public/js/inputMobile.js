/* eslint-disable no-undef */
export default class InputHandlerMobile {
	constructor(canvas, game) {
		canvas.addEventListener('touchstart', (event) => {
			event.preventDefault();
			if (!game.isPaused) {
				game.touchStartTime = game.util.timestamp();
				let touch = event.touches[0];
				game.mousePos.x = touch.clientX - ((window.innerWidth - canvas.width) / 2);
				game.mousePos.y = touch.clientY - ((window.innerHeight - canvas.height) / 2);
				if (game.skier.isCrashed) {
					game.skier.isCrashed = false;
				}
			}
		});

		canvas.addEventListener('touchmove', (event) => {
			event.preventDefault();
			if (!game.isPaused) {
				let touch = event.touches[0];
				game.mousePos.x = touch.clientX - ((window.innerWidth - canvas.width) / 2);
				game.mousePos.y = touch.clientY - ((window.innerHeight - canvas.height) / 2);
			}
		});

		canvas.addEventListener('touchend', (event) => {
			event.preventDefault();
			if (!game.isPaused) {
				if (game.util.timestamp() - game.touchStartTime < 200) {
					if (!game.skier.isCrashed) {
						if (!game.skier.isJumping) {
							game.skier.isJumping = true;
							game.skier.jumpV = game.skier.jumpVInit;
						} else {
							game.skier.rotateJumpStage();
						}
					}
				}
			}
		});
	}
}