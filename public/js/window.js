/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function resizeCanvas() {
			return [Math.max(screen.width, window.innerWidth), Math.max(screen.height, window.innerHeight)];
		}

		window.addEventListener('resize', function () {
			let [x, y] = resizeCanvas();
			canvas.style.width = x + 'px';
			canvas.style.height = y + 'px';

			let scale = window.devicePixelRatio;
			[canvas.width, canvas.height] = [x * scale, y * scale];
			
			game.resize(canvas.width, canvas.height);
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resize(canvas.width, canvas.height);
	}
}