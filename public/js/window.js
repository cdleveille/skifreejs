/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function resizeCanvas() {
			return [Math.max(screen.width, window.innerWidth), Math.max(screen.height, window.innerHeight)];
		}

		window.addEventListener('resize', function () {
			[canvas.width, canvas.height] = resizeCanvas();
			game.resize(canvas.width, canvas.height);
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resize(canvas.width, canvas.height);
	}
}