/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function gameWindowChangeHandler() {
			let ctx = canvas.getContext('2d');
			let [width, height] = resizeCanvas();

			let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			canvas.width = width;
			canvas.height = height;
			ctx.putImageData(imgData, 0, 0);
			
			game.resizeCanvas(canvas.width, canvas.height);
		}

		function resizeCanvas() {
			return [Math.max(screen.width, window.innerWidth), Math.max(screen.height, window.innerHeight)];
		}

		window.addEventListener('resize', () => {
			gameWindowChangeHandler();
		});

		window.addEventListener('orientationchange', () => {
			gameWindowChangeHandler();
		});

		window.addEventListener('online', () => {
			game.goOnline();
			game.style = 0;
		});

		window.addEventListener('offline', () => {
			game.goOffline();
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resizeCanvas(canvas.width, canvas.height);
	}
}