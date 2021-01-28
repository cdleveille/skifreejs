/* eslint-disable no-undef */
export default class WindowHandler {
	constructor(canvas, game) {
		function resizeCanvas() {
			return [Math.max(screen.width, window.innerWidth), Math.max(screen.height, window.innerHeight)];
		}

		window.addEventListener('resize', function () {
			let [width, height] = resizeCanvas();
			let scale = window.devicePixelRatio;

			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			[canvas.width, canvas.height] = [width * scale, height * scale];
			
			game.resizeCanvas(canvas.width, canvas.height);
		});

		window.addEventListener('online', function () {
			console.log('switched online');
			game.isOffline = false;
			game.user.signInButton.disabled = false;
			game.user.registerButton.disabled = false;
			game.recordAndResetStyle();
		});

		window.addEventListener('offline', function () {
			console.log('switched offline');
			game.isOffline = true;
			game.user.signInButton.disabled = true;
			game.user.registerButton.disabled = true;
		});

		[canvas.width, canvas.height] = resizeCanvas();
		game.resizeCanvas(canvas.width, canvas.height);
	}
}