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
	
		canvas.addEventListener('mousemove', (event) => {
			game.mousePos.x = event.clientX - ((window.innerWidth - canvas.width) / 2);
			game.mousePos.y = event.clientY - ((window.innerHeight - canvas.height) / 2);
			game.skier.updateMouseAndVelocityInfo();
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

		document.addEventListener('keydown', (event) => {
			let key = event.code;
			if (!event.repeat && !game.isPaused) {
				if (key == 'ArrowDown' || key == 'KeyS' || key == 'Numpad2') {
					if (!game.user.isTextInputActive()) game.skier.downKeyPressed();
				} else if (key == 'ArrowLeft' || key == 'KeyA'  || key == 'Numpad4') {
					if (!game.user.isTextInputActive()) game.skier.leftKeyPressed();
				} else if (key == 'ArrowRight' || key == 'KeyD' || key == 'Numpad6') {
					if (!game.user.isTextInputActive()) game.skier.rightKeyPressed();
				} else if (key == 'ArrowUp' || key == 'KeyW' || key == 'Numpad8') {
					if (!game.user.isTextInputActive()) game.skier.upKeyPressed();
				} else if (key == 'ShiftLeft' || key == 'ControlRight' || key == 'Numpad0') {
					if (!game.user.isTextInputActive()) game.skier.trick1KeyPressed();
				} else if (key == 'Numpad1') {
					if (!game.user.isTextInputActive()) game.skier.downLeftKeyPressed();
				} else if (key == 'Numpad3') {
					if (!game.user.isTextInputActive()) game.skier.downRightKeyPressed();
				} else if (key == 'Numpad7') {
					if (!game.user.isTextInputActive()) game.skier.upLeftKeyPressed();
				} else if (key == 'Numpad9') {
					if (!game.user.isTextInputActive()) game.skier.upRightKeyPressed();
				}
			}
		});

		document.addEventListener('keyup', (event) => {
			let key = event.code;
			if (key == 'Space') {
				if (!game.user.isTextInputActive()) game.togglePause();
			}else if (key == 'F2') {
				game.restart();
			} else if (key == 'KeyC') {
				if (!game.user.isTextInputActive()) game.user.chatButtonClickHandler();
			} else if (key == 'KeyH') {
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
			}
			if (!game.isPaused) {
				if (key == 'ArrowUp' || key == 'KeyW' || key == 'Numpad8') {
					if (!game.user.isTextInputActive()) game.skier.upKeyReleased();
				} else if (key == 'ShiftLeft' || key == 'ControlRight' || key == 'Numpad0') {
					if (!game.user.isTextInputActive()) game.skier.trick1KeyReleased();
				}
			}
		});

		if (game.util.hasTouch()) {
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
		}

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
					game.skier.updateMouseAndVelocityInfo();
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
