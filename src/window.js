export default class WindowHandler {
	constructor(canvas, game) {
		function resizeCanvas() {
			return [window.innerWidth, window.innerHeight];
		}

		window.addEventListener("resize", function () {
			[canvas.width, canvas.height] = resizeCanvas();
			game.resize(canvas.width, canvas.height);
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resize(canvas.width, canvas.height);
	}
}