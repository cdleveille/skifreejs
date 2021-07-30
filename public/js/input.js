/* eslint-disable no-undef */
export default class InputHandler {
	constructor(canvas, game) {
		canvas.oncontextmenu = (e) => {
			e.preventDefault();
		};

		document.addEventListener('mouseup', () => {
			if (game.darkMode) {
				game.user.profileImage.src = game.user.isLoggedIn ? game.user.logged_in_inverted.src : game.user.logged_out_inverted.src;
			} else {
				game.user.profileImage.src = game.user.isLoggedIn ? game.user.logged_in.src : game.user.logged_out.src;
			}
			game.restartImg.src = game.restart_img.src;
		});
		
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
					} else if (event.button == 2) {
						if (!game.skier.trick1Disabled && !game.skier.isCrashed && game.skier.isJumping) {
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
							game.style = 0;
						}
						if (!game.skier.isAlive && game.skier.isEaten) {
							game.restart();
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
					game.restart();
					break;
				case c:
					if (!game.user.isTextInputActive()) game.user.chatButtonClickHandler();
					break;
				case h:
					if (!game.user.isTextInputActive()) {
						game.hideHUD = !game.hideHUD;
						if (game.hideHUD) {
							game.user.userSection.style.display = 'none';
							game.gamePausedText.style.display = 'none';
							game.gameInfo.style.display = 'none';
							game.restartBtn.style.display = 'none';
							game.restartImg.style.display = 'none';
							game.chat.chatArea.style.display = 'none';
						} else {
							game.user.userSection.style.display = 'block';
							game.gamePausedText.style.display = 'block';
							game.gameInfo.style.display = 'block';
							game.restartBtn.style.display = 'block';
							game.restartImg.style.display = 'block';
							if (!game.chat.isChatHidden) game.chat.showChat(true);
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
								
							} else if (game.skier.isCrashed && game.skier.isStopped) {
								game.skier.isCrashed = false;
								game.style = 0;
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
					if (game.skier.isAlive && !game.skier.isEaten) {
						if (game.skier.isDoingTrick1) {
							game.skier.isDoingTrick1 = false;
							game.skier.trick1EndTime = game.util.timestamp();
						}
					} else {
						game.restart();
					}
				}
			});
		}
	}
}
