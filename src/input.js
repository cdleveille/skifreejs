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

		let left = 37, right = 39;

		document.addEventListener("keydown", (event) => {
            switch(event.keyCode) {
                case left:
                    game.keyAction("left", null);
                    break;
                case right:
                    game.keyAction("right", null);
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch(event.keyCode) {
                case left:
                    game.keyAction(null, "left");
                    break;
                case right:
                    game.keyAction(null, "right");
                    break;
            }
        });
	}
}