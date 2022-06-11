/* eslint-disable no-undef */
import socket from './socket.js';
export default class Skier {
	constructor(game) {
		this.game = game;
		if (this.game.util.hasTouch()) {
			this.maxSpeed = 400;
			this.jumpGravity = 0.008;
		} else if (window.devicePixelRatio > 1) {
			this.maxSpeed = 500;
			this.jumpGravity = 0.009;
		} else {
			this.maxSpeed = 600;
			this.jumpGravity = 0.01;
		}
		this.enforceMaxSpeed = true;
		this.accelX = 2;
		this.accelY = 3;
		this.decel = -2.75;
		this.decelCrash = -4;
		this.jumpVInit = 0.7;
		this.hitbox = {
			x: 2,
			y: 24,
			width: 10,
			height: 2
		};
		this.images = [];
	}

	// initialize the skier for a new run
	init() {
		this.x = this.game.gameWidth / 2;
		this.y = this.game.gameHeight / 3;
		this.currentImage = this.skier_left;
		this.currentJumpImage = this.skier_jump_left;
		this.jumpStage = 1;
		this.xv = 0;
		this.yv = 0;
		this.jumpOffset = 0;
		this.jumpV = 0;
		this.currentSpeed = 0;
		this.isStopped = true;
		this.isCrashed = false;
		this.isJumping = false;
		this.backflipsCompleted = 0;
		this.isDoingTrick1 = false;
		this.trick1StartTime = null;
		this.trick1EndTime = null;
		this.trick1Disabled = false;
		this.isDoingTrick2 = false;
		this.trick2Times = 0;
		this.isAlive = true;
		this.isEaten = false;
		this.heading = 'left';
		this.updateMouseAndVelocityInfo();
	}

	// load skier assets
	loadAssets() {
		this.skier_left = this.game.util.loadImage('/img/skier_left.png', this);
		this.skier_left_down = this.game.util.loadImage('/img/skier_left_down.png', this);
		this.skier_down_left = this.game.util.loadImage('/img/skier_down_left.png', this);
		this.skier_down = this.game.util.loadImage('/img/skier_down.png', this);
		this.skier_down_right = this.game.util.loadImage('/img/skier_down_right.png', this);
		this.skier_right_down = this.game.util.loadImage('/img/skier_right_down.png', this);
		this.skier_right = this.game.util.loadImage('/img/skier_right.png', this);
		this.skier_jump_down = this.game.util.loadImage('/img/skier_jump_down.png', this);
		this.skier_jump_left = this.game.util.loadImage('/img/skier_jump_left.png', this);
		this.skier_jump_right = this.game.util.loadImage('/img/skier_jump_right.png', this);
		this.skier_falling = this.game.util.loadImage('/img/skier_falling.png', this);
		this.skier_sit = this.game.util.loadImage('/img/skier_sit.png', this);
		this.skier_skate_left = this.game.util.loadImage('/img/skier_skate_left.png', this);
		this.skier_skate_right = this.game.util.loadImage('/img/skier_skate_right.png', this);
		this.skier_upside_down1 = this.game.util.loadImage('/img/skier_upside_down1.png', this);
		this.skier_upside_down2 = this.game.util.loadImage('/img/skier_upside_down2.png', this);
		this.skier_trick1_left = this.game.util.loadImage('/img/skier_trick1_left.png', this);
		this.skier_trick1_right = this.game.util.loadImage('/img/skier_trick1_right.png', this);
		this.skier_trick2 = this.game.util.loadImage('/img/skier_trick2.png', this);
	}

	// update the state of the skier
	update(gamepadInfo) {
		this.updateMouseAndVelocityInfo(gamepadInfo);
		if (!this.isAlive) return;

		if (this.heading == 'left') {
			if (this.isJumping) {
				this.determineJumpImage(this.skier_jump_left, this.mouseToSkierAngle);
			} else {
				this.currentImage = this.skier_left;
				this.decelerateToStop(this.vVectors);
			}
		} else if (this.heading == 'right') {
			if (this.isJumping) {
				this.determineJumpImage(this.skier_jump_right, this.mouseToSkierAngle);
			} else {
				this.currentImage = this.skier_right;
				this.decelerateToStop(this.vVectors);
			}
		} else {
			if (this.heading == 'left_down') {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_left, this.mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_left_down;
				}
			} else if (this.heading == 'down_left') {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_left, this.mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down_left;
				}
			} else if (this.heading == 'down') {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_down, this.mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down;
				}
			} else if (this.heading == 'down_right') {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_right, this.mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down_right;
				}
			} else if (this.heading == 'right_down') {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_right, this.mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_right_down;
				}
			}

			let xFlip = 1;
			if (this.mouseToSkierAngle > -90 && this.mouseToSkierAngle < 0) {
				xFlip = -1;
			}

			let maxSpeedX = this.maxSpeed * this.mouseAngleVectors[0] * xFlip * .75;
			let maxSpeedY = this.maxSpeed * this.mouseAngleVectors[1];

			if (!this.isJumping) {
				this.maxSpeedXBeforeJump = maxSpeedX;
				this.maxSpeedYBeforeJump = maxSpeedY;

				if (!this.isCrashed) {
					this.isStopped = false;
					this.xv += this.accelX * this.mouseAngleVectors[0];
					this.yv += this.accelY * this.mouseAngleVectors[1];
				}
			} else {
				maxSpeedX = this.maxSpeedXBeforeJump;
				maxSpeedY = this.maxSpeedYBeforeJump;
			}

			if (this.enforceMaxSpeed) {
				if (this.xv < -maxSpeedX) {
					this.xv = -maxSpeedX;
				} else if (this.xv > maxSpeedX) {
					this.xv = maxSpeedX;
				}
				if (this.yv > maxSpeedY) {
					this.yv = maxSpeedY;
				}
			}
		}

		// handle jumps
		if (this.isJumping) {
			this.jumpOffset += this.jumpV;
			this.jumpV -= this.jumpGravity;

			// skier lands back on ground at the end of a jump
			if (this.jumpOffset <= 0) {

				// crash the skier if in the middle of a trick
				if (this.jumpStage != 1 || this.isDoingTrick1 || this.isDoingTrick2) {
					this.isCrashed = true;
					this.game.recordAndResetStyle();
					this.trick1StartTime = null;
					this.trick1EndTime = null;
					this.trick2Times = 0;
				}

				// award style points for landing jumps and doing tricks
				if (!this.isCrashed) {
					let styleToAdd = 0;

					if (this.yv > 0 && this.game.stylePointsToAwardOnLanding > 0) {
						styleToAdd += this.game.stylePointsToAwardOnLanding + (20 * this.backflipsCompleted);
					}

					if (this.trick1StartTime != null && this.trick1EndTime != null) {
						let duration = this.trick1EndTime - this.trick1StartTime;
						if (this.yv > 0) styleToAdd += ((duration / 80.0) + 5);
						this.trick1StartTime = null;
						this.trick1EndTime = null;
					}
					
					styleToAdd += 10 * this.trick2Times;

					styleToAdd = Math.floor(styleToAdd);
					if (styleToAdd > 0) {
						this.game.style = Math.floor(this.game.style + styleToAdd);
						socket.emit('new_point', this.game.style);
					}
				}

				this.jumpOffset = 0;
				this.game.stylePointsToAwardOnLanding = 0;
				this.backflipsCompleted = 0;
				this.didTrick2 = false;
				this.isJumping = false;
				this.isDoingTrick1 = false;
				this.trick2Times = 0;
				this.trick1Disabled = false;
				this.jumpStage = 1;
			}
		}

		if (this.isCrashed) {
			this.currentImage = this.skier_falling;
			if (!this.isJumping) {
				this.decelerateToStop(this.vVectors);
			}
			if (this.isStopped) {
				this.currentImage = this.skier_sit;
				this.xv = 0;
				this.yv = 0;
			}
		}
	}

	// return a string indicating the orientation of the skier based on the angle between the mouse cursor and the skier
	getSkierHeading(angle) {
		// above skier
		if ((angle < 90 && angle > -5) || angle == -90) {
			return 'left';
		} else if ((angle > 90 && angle < 180) || angle < -175) {
			return 'right';
		// below skier
		} else {
			if (angle < -5 && angle > -50) {
				return 'left_down';
			} else if (angle < -50 && angle > -75) {
				return 'down_left';
			} else if ((angle < -75 && angle > -105) || angle == 90) {
				return 'down';
			} else if (angle < -105 && angle > -130) {
				return 'down_right';
			} else if (angle < -130 && angle > -175) {
				return 'right_down';
			}
		}
	}

	// calculate info on the angle between the mouse cursor and skier, and the skier's current velocity vectors.
	// this info will be used in determining how the skier should move based on his current state and user input.
	updateMouseAndVelocityInfo(gamepadInfo) {
		this.mouseAndVelocityInfo = this.game.getMouseAndVelocityInfo(gamepadInfo);
		this.mouseToSkierAngle = this.mouseAndVelocityInfo[0];
		this.mouseAngleVectors = this.mouseAndVelocityInfo[1];
		this.vVectors = this.mouseAndVelocityInfo[2];
		this.heading = this.getSkierHeading(this.mouseToSkierAngle);
		this.calculateCurrentSpeed();
	}

	leftKeyPressed() {
		if (this.isCrashed) {
			this.updateMousePosOnKeyPress(-50, -50);
			this.game.skier.isCrashed = false;
			this.game.style = 0;
		} else {
			if (this.heading == 'right') {
				this.updateMousePosOnKeyPress(50, 14);
			} else if (this.heading == 'right_down') {
				this.updateMousePosOnKeyPress(32, 50);
			} else if (this.heading == 'down_right') {
				this.updateMousePosOnKeyPress(0, 50);
			} else if (this.heading == 'down') {
				this.updateMousePosOnKeyPress(-32, 50);
			} else if (this.heading == 'down_left') {
				this.updateMousePosOnKeyPress(-50, 14);
			} else if (this.heading == 'left_down') {
				this.updateMousePosOnKeyPress(-50, -50);
			}
		}
		
	}

	rightKeyPressed() {
		if (this.isCrashed) {
			this.updateMousePosOnKeyPress(50, -50);
			this.game.skier.isCrashed = false;
			this.game.style = 0;
			
		} else {
			if (this.heading == 'left') {
				this.updateMousePosOnKeyPress(-50, 14);
			} else if (this.heading == 'left_down') {
				this.updateMousePosOnKeyPress(-32, 50);
			} else if (this.heading == 'down_left') {
				this.updateMousePosOnKeyPress(0, 50);
			} else if (this.heading == 'down') {
				this.updateMousePosOnKeyPress(32, 50);
			} else if (this.heading == 'down_right') {
				this.updateMousePosOnKeyPress(50, 14);
			} else if (this.heading == 'right_down') {
				this.updateMousePosOnKeyPress(50, -50);
			}
		}
	}

	downKeyPressed() {
		if (this.isCrashed) {
			this.isCrashed = false;
			this.game.style = 0;
		}
		this.updateMousePosOnKeyPress(0, 50);
	}

	upKeyPressed() {
		if (!this.isCrashed && this.isJumping) {
			this.rotateJumpStage();
		}
	}

	downLeftKeyPressed() {
		if (this.isCrashed) {
			this.game.skier.isCrashed = false;
			this.game.style = 0;
		}
		this.updateMousePosOnKeyPress(-32, 50);
	}

	downRightKeyPressed() {
		if (this.isCrashed) {
			this.game.skier.isCrashed = false;
			this.game.style = 0;
		}
		this.updateMousePosOnKeyPress(32, 50);
	}

	upLeftKeyPressed() {
		if (this.isCrashed) {
			this.game.skier.isCrashed = false;
			this.game.style = 0;
		}
		this.updateMousePosOnKeyPress(-50, -50);
	}

	upRightKeyPressed() {
		if (this.isCrashed) {
			this.game.skier.isCrashed = false;
			this.game.style = 0;
		}
		this.updateMousePosOnKeyPress(50, -50);
	}

	trick1KeyPressed() {
		if (!this.trick1Disabled && !this.isCrashed && this.isJumping) {
			this.isDoingTrick1 = true;
			this.trick1Disabled = true;
			this.trick1StartTime = this.game.util.timestamp();
		}
	}

	upKeyReleased() {
		if (!this.isCrashed) {
			if (!this.isJumping) {
				this.isJumping = true;
				this.jumpV = this.jumpVInit;
			}
		} else if (this.isStopped) {
			this.isCrashed = false;
			this.game.style = 0;
			this.updateMousePosOnKeyPress(-50, -50);
		}
		if (!this.isAlive && this.isEaten) {
			this.game.restart();
		}
	}

	trick1KeyReleased() {
		this.isDoingTrick1 = false;
		this.trick1EndTime = this.game.util.timestamp();
	}

	// set the game's 'mousePos' values to the given x, y coordinates
	updateMousePosOnKeyPress(x, y) {
		this.game.mousePos.x = this.x + 7 + x;
		this.game.mousePos.y = this.y + 32 + y;
		this.updateMouseAndVelocityInfo();
	}

	// decelerate the skier until stopped
	decelerateToStop(vVectors) {
		this.updateMouseAndVelocityInfo();
		if (!this.isStopped && !this.isJumping) {
			let xDecelAmt = this.decel * vVectors[0];
			let yDecelAmt = this.decel * vVectors[1];

			if (this.isCrashed) {
				xDecelAmt = this.decelCrash * vVectors[0];
				yDecelAmt = this.decelCrash * vVectors[1];
			}

			this.xv -= xDecelAmt;
			this.yv -= yDecelAmt;

			if (this.yv <= 0) {
				this.yv = 0;
				this.xv = 0;
				this.isStopped = true;
			}
		}
	}

	calculateCurrentSpeed() {
		this.currentSpeed = Math.sqrt(Math.pow(this.xv, 2) + Math.pow(this.yv, 2));
	}

	// move between jump/backflip stages
	rotateJumpStage() {
		if (this.jumpStage < 3) {
			this.jumpStage++;
		} else {
			this.jumpStage = 1;
			this.backflipsCompleted++;
		}
	}

	// find the proper image to use for the skier while jumping
	determineJumpImage(regular, angle) {
		switch(this.jumpStage) {
		case 1:
			if (this.isDoingTrick1) {
				if (angle >= -90 && angle < 90) {
					this.currentImage = this.skier_trick1_left;
				} else {
					this.currentImage = this.skier_trick1_right;
				}
				this.isDoingTrick2 = false;
			} else if (((angle > 20 && angle < 160 && angle != 90) || angle == -90) && !this.isStopped) {
				this.currentImage = this.skier_trick2;
				if (!this.isDoingTrick2) {
					this.isDoingTrick2 = true;
					this.trick2Times++;
				}
			} else {
				this.currentImage = regular;
				this.isDoingTrick2 = false;
			}
			break;
		case 2:
			this.currentImage = this.skier_upside_down1;
			this.isDoingTrick2 = false;
			break;
		case 3:
			this.currentImage = this.skier_upside_down2;
			this.isDoingTrick2 = false;
			break;
		}
	}

	// after the skier is eaten by the yeti, record the current score and reset variables appropriately
	die() {
		this.game.recordAndResetStyle();
		this.xv = 0, this.yv = 0;
		this.currentSpeed = 0;
		this.isAlive = false;
	}

	// render the current state of the skier
	draw(ctx) {
		if (!this.isAlive) return;
		let xOffset = 0;
		switch (this.currentImage) {
		case this.skier_left:
			xOffset = -4;
			break;
		case this.skier_left_down:
			xOffset = -2;
			break;
		case this.skier_down_left:
			xOffset = -1;
			break;
		case this.skier_right_down:
			xOffset = -5;
			break;
		case this.skier_right:
			xOffset = -4;
			break;
		case this.skier_sit:
			xOffset = -8;
			break;
		case this.skier_jump_down:
			xOffset = -6;
			break;
		case this.skier_falling:
			xOffset = -9;
			break;
		case this.skier_jump_left:
			xOffset = -7;
			break;
		case this.skier_jump_right:
			xOffset = -6;
			break;
		case this.skier_upside_down1:
			xOffset = -7;
			break;
		case this.skier_upside_down2:
			xOffset = -8;
			break;
		case this.skier_trick1_left:
			xOffset = -6;
			break;
		case this.skier_trick1_right:
			xOffset = -4;
			break;
		case this.skier_trick2:
			xOffset = -6;
			break;
		}
		ctx.drawImage(this.currentImage, this.x + xOffset, this.y - this.jumpOffset);
	}
}