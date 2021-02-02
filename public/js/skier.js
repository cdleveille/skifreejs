/* eslint-disable no-undef */
export default class Skier {
	constructor(game) {
		this.game = game;
		if (this.game.util.hasTouch()) {
			this.maxSpeed = 400;
		} else if (window.devicePixelRatio > 1) {
			this.maxSpeed = 500;
		} else {
			this.maxSpeed = 600;
		}
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
		this.images = [];
	}

	init() {
		this.x = this.game.gameWidth / 2;
		this.y = this.game.gameHeight / 3;
		this.currentImage = this.skier_left;
		this.currentJumpImage = this.skier_jump_left;
		this.jumpStage = 1;
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
		this.backflipsCompleted = 0;
		this.isDoingTrick1 = false;
		this.trick1StartTime = null;
		this.trick1EndTime = null;
		this.trick1Disabled = false;
		this.isDoingTrick2 = false;
		this.trick2Times = 0;
	}

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

	update(mouseAndVelocityInfo) {
		this.currentSpeed = Math.sqrt(Math.pow(this.xv, 2) + Math.pow(this.yv, 2));
		let mouseToSkierAngle = mouseAndVelocityInfo[0];
		let mouseAngleVectors = mouseAndVelocityInfo[1];
		let vVectors = mouseAndVelocityInfo[2];

		// mouse up / left
		if ((mouseToSkierAngle < 90 && mouseToSkierAngle > -5) || mouseToSkierAngle == -90) {
			if (this.isJumping) {
				this.determineJumpImage(this.skier_jump_left, mouseToSkierAngle);
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
				this.determineJumpImage(this.skier_jump_right, mouseToSkierAngle);
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
					this.determineJumpImage(this.skier_jump_left, mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_left_down;
				}
			} else if (mouseToSkierAngle < -50 && mouseToSkierAngle > -75) {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_left, mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down_left;
				}
			} else if (mouseToSkierAngle < -75 && mouseToSkierAngle > -105 || mouseToSkierAngle == 90) {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_down, mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down;
				}
			} else if (mouseToSkierAngle < -105 && mouseToSkierAngle > -130) {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_right, mouseToSkierAngle);
				} else {
					this.currentImage = this.skier_down_right;
				}
			} else if (mouseToSkierAngle < -130 && mouseToSkierAngle > -175) {
				if (this.isJumping) {
					this.determineJumpImage(this.skier_jump_right, mouseToSkierAngle);
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

				if (!this.isCrashed) {
					this.isStopped = false;
					this.xv += this.accelX * mouseAngleVectors[0];
					this.yv += this.accelY * mouseAngleVectors[1];
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
					styleToAdd += this.game.stylePointsToAwardOnLanding + (20 * this.backflipsCompleted);

					if (this.trick1StartTime != null && this.trick1EndTime != null) {
						let duration = this.trick1EndTime - this.trick1StartTime;
						styleToAdd += Math.floor(duration / 80.0 + 5);
						this.trick1StartTime = null;
						this.trick1EndTime = null;
					}
					
					styleToAdd += 10 * this.trick2Times;

					styleToAdd = Math.floor(styleToAdd);
					if (styleToAdd > 0) {
						this.game.style = Math.floor(this.game.style + styleToAdd);
						this.game.util.newPoint(this.game.style);
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
				this.decelerateToStop(vVectors);
			}
			if (this.isStopped) {
				this.currentImage = this.skier_sit;
				this.xv = 0;
				this.yv = 0;
			}
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

	rotateJumpStage() {
		if (this.jumpStage < 3) {
			this.jumpStage++;
		} else {
			this.jumpStage = 1;
			this.backflipsCompleted++;
		}
	}

	determineJumpImage(regular, mouseToSkierAngle) {
		switch(this.jumpStage) {
		case 1:
			if (this.isDoingTrick1) {
				if (mouseToSkierAngle >= -90 && mouseToSkierAngle < 90) {
					this.currentImage = this.skier_trick1_left;
				} else {
					this.currentImage = this.skier_trick1_right;
				}
				this.isDoingTrick2 = false;
			} else if (((mouseToSkierAngle > 20 && mouseToSkierAngle < 160 && mouseToSkierAngle != 90) || mouseToSkierAngle == -90) && !this.isStopped) {
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