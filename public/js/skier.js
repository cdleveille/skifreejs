/* eslint-disable no-undef */
export default class Skier {
	constructor(game) {
		this.game = game;
		this.maxSpeed = 600;
		this.enforceMaxSpeed = true;
		this.skateV = 225;
		this.accelX = 2;
		this.accelY = 3;
		this.decel = -2.75;
		this.decelCrash = -4;
		this.jumpVInit = 0.7;
		this.jumpGravity = .01;
		this.hitbox = {
			x: 2,
			y: 24,
			width: 10,
			height: 2
		};
		this.loadImages();
		this.init();
	}

	init() {
		this.x = this.game.gameWidth / 2;
		this.y = this.game.gameHeight / 3;
		this.currentImage = this.skier_left;
		this.isSkatingLeft = false;
		this.isSkatingRight = false;
		this.xv = 0;
		this.yv = 0;
		this.jumpOffset = 0;
		this.jumpV = 0;
		this.currentSpeed = 0;
		this.isStopped = true;
		this.isCrashed = false;
		this.isJumping = false;
	}

	loadImages() {
		this.skier_left = this.game.util.loadImage('/img/skier_left.png');
		this.skier_left_down = this.game.util.loadImage('/img/skier_left_down.png');
		this.skier_down_left = this.game.util.loadImage('/img/skier_down_left.png');
		this.skier_down = this.game.util.loadImage('/img/skier_down.png');
		this.skier_down_right = this.game.util.loadImage('/img/skier_down_right.png');
		this.skier_right_down = this.game.util.loadImage('/img/skier_right_down.png');
		this.skier_right = this.game.util.loadImage('/img/skier_right.png');
		this.skier_jump_down = this.game.util.loadImage('/img/skier_jump_down.png');
		this.skier_jump_left = this.game.util.loadImage('/img/skier_jump_left.png');
		this.skier_jump_right = this.game.util.loadImage('/img/skier_jump_right.png');
		this.skier_falling = this.game.util.loadImage('/img/skier_falling.png');
		this.skier_sit = this.game.util.loadImage('/img/skier_sit.png');
		this.skier_skate_left = this.game.util.loadImage('/img/skier_skate_left.png');
		this.skier_skate_right = this.game.util.loadImage('/img/skier_skate_right.png');
	}

	update(mouseAndVelocityInfo) {
		this.currentSpeed = Math.sqrt(Math.pow(this.xv, 2) + Math.pow(this.yv, 2));
		let mouseToSkierAngle = mouseAndVelocityInfo[0];
		let mouseAngleVectors = mouseAndVelocityInfo[1];
		let vVectors = mouseAndVelocityInfo[2];

		// handle jumps
		if (this.isJumping) {
			this.jumpOffset += this.jumpV;
			this.jumpV -= this.jumpGravity;

			if (this.jumpOffset <= 0) {
				this.jumpOffset = 0;
				this.isJumping = false;
			}
		}

		// mouse up / left
		if ((mouseToSkierAngle < 90 && mouseToSkierAngle > -5) || mouseToSkierAngle == -90) {
			if (this.isJumping) {
				this.currentImage = this.skier_jump_left;
			} else if (this.isSkatingLeft && !this.isCrashed) {
				this.currentImage = this.skier_skate_left;
				this.xv = -this.skateV;
				this.isStopped = false;
			} else if (this.isSkatingRight && !this.isCrashed) {
				this.currentImage = this.skier_skate_right;
				this.xv = this.skateV;
				this.isStopped = false;
			} else {
				this.currentImage = this.skier_left;
				this.decelerateToStop(vVectors);
			}
			// mouse up / right
		} else if (mouseToSkierAngle < -175 || (mouseToSkierAngle > 90 && mouseToSkierAngle < 180)) {
			if (this.isJumping) {
				this.currentImage = this.skier_jump_right;
			} else if (this.isSkatingLeft && !this.isCrashed) {
				this.currentImage = this.skier_skate_left;
				this.xv = -this.skateV;
				this.isStopped = false;
			} else if (this.isSkatingRight && !this.isCrashed) {
				this.currentImage = this.skier_skate_right;
				this.xv = this.skateV;
				this.isStopped = false;
			} else {
				this.currentImage = this.skier_right;
				this.decelerateToStop(vVectors);
			}
		} else {
			if (mouseToSkierAngle < -5 && mouseToSkierAngle > -50) {
				if (this.isJumping) {
					this.currentImage = this.skier_jump_left;
				} else {
					this.currentImage = this.skier_left_down;
				}
			} else if (mouseToSkierAngle < -50 && mouseToSkierAngle > -75) {
				if (this.isJumping) {
					this.currentImage = this.skier_jump_left;
				} else {
					this.currentImage = this.skier_down_left;
				}
			} else if (mouseToSkierAngle < -75 && mouseToSkierAngle > -105) {
				if (this.isJumping) {
					this.currentImage = this.skier_jump_down;
				} else {
					this.currentImage = this.skier_down;
				}
			} else if (mouseToSkierAngle < -105 && mouseToSkierAngle > -130) {
				if (this.isJumping) {
					this.currentImage = this.skier_jump_right;
				} else {
					this.currentImage = this.skier_down_right;
				}
			} else if (mouseToSkierAngle < -130 && mouseToSkierAngle > -175) {
				if (this.isJumping) {
					this.currentImage = this.skier_jump_right;
				} else {
					this.currentImage = this.skier_right_down;
				}
			}

			if (!this.isStopped) {
				this.isSkatingLeft = false;
				this.isSkatingRight = false;
			}

			let xFlip = 1;
			if (mouseToSkierAngle > -90 && mouseToSkierAngle < 0) {
				xFlip = -1;
			}

			let maxSpeedX = this.maxSpeed * mouseAngleVectors[0] * xFlip * .75;
			let maxSpeedY = this.maxSpeed * mouseAngleVectors[1];

			if (!this.isJumping) {
				this.maxSpeedXBeforeJump = maxSpeedX;
				this.maxSpeedYBeforeJump = maxSpeedY;
			} else {
				maxSpeedX = this.maxSpeedXBeforeJump;
				maxSpeedY = this.maxSpeedYBeforeJump;
			}

			if (!this.isCrashed && !this.isJumping) {
				this.isStopped = false;
				this.xv += this.accelX * mouseAngleVectors[0];
				this.yv += this.accelY * mouseAngleVectors[1];
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

		if (this.isJumping && this.isCrashed) {
			this.currentImage = this.skier_falling;
		} else if (this.isCrashed) {
			this.currentImage = this.skier_sit;
			this.decelerateToStop(vVectors);

			if (this.isStopped) {
				this.xv = 0;
				this.yv = 0;
			}
		}

		// add coordinate(s) to skier trail
		if (!this.isStopped && !this.isJumping) {
			this.game.skierTrail.push([2, 24]);
		}
	}

	// decelerate the skier until he is stopped
	decelerateToStop(vVectors) {
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

	draw(ctx) {
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
		}
		ctx.drawImage(this.currentImage, this.x + xOffset, this.y - this.jumpOffset);
	}
}