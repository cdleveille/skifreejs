/* eslint-disable no-undef */
export default class Gamepad {
	constructor(game) {
		this.game = game;
		this.controllers = {};
		this.deadzone = 0.35;
		if ('GamepadEvent' in window) {
			window.addEventListener('gamepadconnected', (e) => { this.connectHandler(e); });
			window.addEventListener('gamepaddisconnected', (e) => { this.disconnectHandler(e); });
		} else if ('WebKitGamepadEvent' in window) {
			window.addEventListener('webkitgamepadconnected', (e) => { this.connectHandler(e); });
			window.addEventListener('webkitgamepaddisconnected', (e) => { this.disconnectHandler(e); });
		} else {
			setInterval(this.scanForGamepad(), 500);
		}
	}

	connectHandler(e) {
		let gamepad = e.gamepad;
		if (Object.keys(this.controllers).length < 1) {
			this.controllers[gamepad.index] = gamepad;
			console.log('gamepad connected');
		}
	}

	disconnectHandler(e) {
		let gamepad = e.gamepad;
		if (this.controllers[gamepad.index]) {
			delete this.controllers[gamepad.index];
			console.log('gamepad disconnected');
		}
	}

	scanForGamepad() {
		let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		let gamepad = gamepads[0];
		if (gamepad && (gamepad.index in this.controllers)) {
			this.controllers[gamepad.index] = gamepad;
		}
	}

	update() {
		this.scanForGamepad();
		if (Object.keys(this.controllers).length < 1) return;
		let controller = this.controllers[0];
		
		if (!this.game.isPaused) {
			// jump button (a)
			if (controller.buttons[0].value == 1 && !this.jumpPressedLastFrame) {
				this.jumpPressed();
			} else if (controller.buttons[0].value == 0 && this.jumpPressedLastFrame) {
				this.jumpReleased();
			}

			// trick 1 button (b)
			if (controller.buttons[1].value == 1 && !this.trick1PressedLastFrame) {
				this.trick1Pressed();
			} else if (controller.buttons[1].value == 0 && this.trick1PressedLastFrame) {
				this.trick1Released();
			}

			// d-pad up
			if (controller.buttons[12].value == 1 && !this.dpadUpPressedLastFrame) {
				this.dpadUpPressedLastFrame = true;
				this.game.skier.upKeyPressed();
			} else if (controller.buttons[12].value == 0 && this.dpadUpPressedLastFrame) {
				this.dpadUpPressedLastFrame = false;
				this.game.skier.upKeyReleased();
			}

			// d-pad down
			if (controller.buttons[13].value == 1 && !this.dpadDownPressedLastFrame) {
				this.dpadDownPressedLastFrame = true;
				this.game.skier.downKeyPressed();
			} else if (controller.buttons[13].value == 0 && this.dpadDownPressedLastFrame) {
				this.dpadDownPressedLastFrame = false;
			}

			// d-pad left
			if (controller.buttons[14].value == 1 && !this.dpadLeftPressedLastFrame) {
				this.dpadLeftPressedLastFrame = true;
				this.game.skier.leftKeyPressed();
			} else if (controller.buttons[14].value == 0 && this.dpadLeftPressedLastFrame) {
				this.dpadLeftPressedLastFrame = false;
			}

			// d-pad right
			if (controller.buttons[15].value == 1 && !this.dpadRightPressedLastFrame) {
				this.dpadRightPressedLastFrame = true;
				this.game.skier.rightKeyPressed();
			} else if (controller.buttons[15].value == 0 && this.dpadRightPressedLastFrame) {
				this.dpadRightPressedLastFrame = false;
			}
		}

		// pause button (start)
		if (controller.buttons[9].value == 1 && !this.pauseButtonPressedLastFrame) {
			this.pauseButtonPressed();
		} else if (controller.buttons[9].value == 0 && this.pauseButtonPressedLastFrame) {
			this.pauseButtonReleased();
		}

		// restart button (back)
		if (controller.buttons[8].value == 1 && !this.restartButtonPressedLastFrame) {
			this.restartButtonPressed();
		} else if (controller.buttons[8].value == 0 && this.restartButtonPressedLastFrame) {
			this.restartButtonReleased();
		}
		
		let xAxis = controller.axes[0];
		let yAxis = controller.axes[1];
		let magnitude = Math.sqrt(Math.pow(xAxis, 2) + Math.pow(yAxis, 2));
		let ang;

		// left / up
		if (xAxis < 0 && yAxis <= 0) {
			ang = Math.abs(Math.atan(yAxis / xAxis));
		
		// right / up
		} else if (xAxis >= 0 && yAxis < 0) {
			ang = Math.PI / 2 + Math.abs(Math.atan(xAxis / yAxis));

		// right / down
		} else if (xAxis > 0 && yAxis >= 0) {
			ang = -Math.PI / 2 - Math.abs(Math.atan(xAxis / yAxis));

		// left / down
		} else if (xAxis <= 0 && yAxis > 0) {
			ang = -Math.abs(Math.atan(yAxis / xAxis));
		}

		let angDegrees = this.game.util.degrees(ang);
		if (Math.abs(angDegrees) == 90) angDegrees *= -1;

		if (magnitude > this.deadzone) {
			return { gamepadAnalogAngle: angDegrees, gamepadAnalogVectors: [xAxis, yAxis] };
		}

	}

	jumpPressed() {
		this.jumpPressedLastFrame = true;
		if (!this.game.skier.isCrashed && this.game.skier.isJumping) {
			this.game.skier.rotateJumpStage();
		}
	}

	jumpReleased() {
		if (this.game.skier.isAlive && !this.game.skier.isEaten) {
			this.jumpPressedLastFrame = false;
			if (!this.game.skier.isCrashed) {
				if (!this.game.skier.isJumping) {
					this.game.skier.isJumping = true;
					this.game.skier.jumpV = this.game.skier.jumpVInit;
				}
			} else if (this.game.skier.isStopped) {
				this.game.skier.isCrashed = false;
				this.game.style = 0;
			}
		} else {
			this.game.restart();
		}
	}

	trick1Pressed() {
		this.trick1PressedLastFrame = true;
		if (!this.game.skier.trick1Disabled && !this.game.skier.isCrashed && this.game.skier.isJumping) {
			this.game.skier.isDoingTrick1 = true;
			this.game.skier.trick1Disabled = true;
			this.game.skier.trick1StartTime = this.game.util.timestamp();
		}
	}

	trick1Released() {
		this.trick1PressedLastFrame = false;
		this.game.skier.isDoingTrick1 = false;
		this.game.skier.trick1EndTime = this.game.util.timestamp();
	}

	pauseButtonPressed() {
		this.pauseButtonPressedLastFrame = true;
	}

	pauseButtonReleased() {
		this.pauseButtonPressedLastFrame = false;
		this.game.togglePause();
	}

	restartButtonPressed() {
		this.restartButtonPressedLastFrame = true;
	}

	restartButtonReleased() {
		this.restartButtonPressedLastFrame = false;
		this.game.restart();
	}
}