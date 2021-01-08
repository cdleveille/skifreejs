export default class InputHandler{
	constructor(canvas, game) {
		canvas.addEventListener('mousemove', (event) => {
			let mouseX = event.clientX - ((window.innerWidth - canvas.width) / 2);
			let mouseY = event.clientY - ((window.innerHeight - canvas.height) / 2);

			game.mousePos = [mouseX, mouseY];
		});

		canvas.addEventListener('click', (event) => {
			if (!game.skier.isJumping && !game.skier.isCrashed) {
				game.skier.isJumping = true;
				game.skier.jumpV = game.skier.jumpVInit;
			} else if (game.skier.isCrashed && game.skier.yv == 0) {
				game.skier.isCrashed = false;
			}
		});
	}
}