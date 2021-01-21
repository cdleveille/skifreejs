/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function resizeCanvas() {
			return [screen.width, screen.height];
		}

		window.addEventListener('resize', function () {
			[canvas.width, canvas.height] = resizeCanvas();
			game.resize(canvas.width, canvas.height);
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resize(canvas.width, canvas.height);
	}
}