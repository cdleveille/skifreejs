/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function gameWindowChangeHandler() {
			let [width, height] = resizeCanvas();
			let scale = window.devicePixelRatio;

			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			[canvas.width, canvas.height] = [width * scale, height * scale];
			
			game.resizeCanvas(canvas.width, canvas.height);
		}

		function resizeCanvas() {
			return [Math.max(screen.width, window.innerWidth), Math.max(screen.height, window.innerHeight)];
		}

		window.addEventListener('resize', function () {
			gameWindowChangeHandler();
		});

		window.addEventListener('orientationchange', function () {
			gameWindowChangeHandler();
		});

		window.addEventListener('online', function () {
			game.goOnline();
			game.recordAndResetStyle();
		});

		window.addEventListener('offline', function () {
			game.goOffline();
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resizeCanvas(canvas.width, canvas.height);
	}
}