/* eslint-disable no-undef */
export default class InputHandler {
	constructor(canvas, game) {
		document.oncontextmenu = (e) => {
			e.preventDefault();
		};
		
		if (!game.util.hasTouch()) {
			canvas.addEventListener('mousemove', (event) => {
				game.mousePos.x = event.clientX - ((window.innerWidth - canvas.width) / 2);
				game.mousePos.y = event.clientY - ((window.innerHeight - canvas.height) / 2);
			});

			canvas.addEventListener('mousedown', (event) => {
				if (!game.isPaused) {
					if (event.button == 0) {
						if (!game.skier.isCrashed && game.skier.isJumping) {
							game.skier.rotateJumpStage();
						}
					} else if (event.button == 2 && !game.skier.trick1Disabled) {
						if (!game.skier.isCrashed && game.skier.isJumping) {
							game.skier.isDoingTrick1 = true;
							game.skier.trick1Disabled = true;
							game.skier.trick1StartTime = game.util.timestamp();
						}
					}
				}
			});

			canvas.addEventListener('mouseup', (event) => {
				if (!game.isPaused) {
					if (event.button == 0) {
						if (!game.skier.isCrashed) {
							if (!game.skier.isJumping) {
								game.skier.isJumping = true;
								game.skier.jumpV = game.skier.jumpVInit;
							}
						} else if (game.skier.isStopped) {
							game.skier.isCrashed = false;
						}
					} else if (event.button == 2) {
						game.skier.isDoingTrick1 = false;
						game.skier.trick1EndTime = game.util.timestamp();
					}
				}
			});

			let left = 65, right = 68, f2 = 113, space = 32, c = 67, h = 72;

			document.addEventListener('keydown', (event) => {
				if (!game.user.isTextInputActive()) {
					switch (event.keyCode) {
					case left:
						if (game.skier.isStopped) {
							game.skier.isSkatingLeft = true;
						}
						break;
					case right:
						if (game.skier.isStopped) {
							game.skier.isSkatingRight = true;
						}
						break;
					}
				}
			});

			document.addEventListener('keyup', (event) => {
				switch (event.keyCode) {
				case left:
					game.skier.isSkatingLeft = false;
					break;
				case right:
					game.skier.isSkatingRight = false;
					break;
				case space:
					game.togglePause();
					break;
				case f2:
					game.init();
					game.setUpGameObjectsOnScreen();
					break;
				case c:
					if (!game.user.isTextInputActive()) {
						game.hideControls = !game.hideControls;
					}
					break;
				case h:
					if (!game.user.isTextInputActive()) {
						game.hideHUD = !game.hideHUD;
						if (game.hideHUD) {
							game.user.userSection.style.display = 'none';
							game.gamePausedText.style.display = 'none';
							game.gameInfo.style.display = 'none';
						} else {
							game.user.userSection.style.display = 'block';
							game.gamePausedText.style.display = 'block';
							game.gameInfo.style.display = 'block';
						}
						
					}
					break;
				}
			});

		} else {
			// remove :hover styles on touch screens
			try { // prevent exception on browsers not supporting DOM styleSheets properly
				for (var si in document.styleSheets) {
					var styleSheet = document.styleSheets[si];
					if (!styleSheet.rules) continue;

					for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
						if (!styleSheet.rules[ri].selectorText) continue;

						if (styleSheet.rules[ri].selectorText.match(':hover')) {
							styleSheet.deleteRule(ri);
						}
					}
				}
			} catch (ex) { console.log(ex); }

			canvas.addEventListener('touchstart', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					for (let i = 0; i < event.touches.length; i++) {
						let touch = event.touches[i];
						let touchX = touch.clientX - ((window.innerWidth - canvas.width) / 2);
						let touchY = touch.clientY - ((window.innerHeight - canvas.height) / 2);

						// touch start below skier
						if (touchY > game.skier.y) {
							game.mousePos.x = touchX;
							game.mousePos.y = touchY;
							if (game.skier.isJumping && !game.skier.trick1Disabled) {
								game.skier.isDoingTrick1 = true;
								game.skier.trick1Disabled = true;
								game.skier.trick1StartTime = game.util.timestamp();
								
							} else if (game.skier.isCrashed) {
								game.skier.isCrashed = false;
							}
						// touch start above skier
						} else {
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
				}
			});

			canvas.addEventListener('touchmove', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					let touch = event.touches[0];
					let touchX = touch.clientX - ((window.innerWidth - canvas.width) / 2);
					let touchY = touch.clientY - ((window.innerHeight - canvas.height) / 2);
					
					// touch move below skier
					if (touchY > game.skier.y) {
						game.mousePos.x = touchX;
						game.mousePos.y = touchY;
					}
				}
			});

			canvas.addEventListener('touchend', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					if (game.skier.isDoingTrick1) {
						game.skier.isDoingTrick1 = false;
						game.skier.trick1EndTime = game.util.timestamp();
					}
				}
			});
		}
	}
}
