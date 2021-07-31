/* eslint-disable no-undef */
export default class Yeti {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.speed = this.game.skier.maxSpeed / 530;
		this.runAnimTick = 150;
		this.eatAnimTick = 140;
		this.jumpVInit = 0.45;
		this.jumpGravity = 0.004;
	}

	init() {
		this.hasSpawned = false;
		this.xv = 0, this.yv = 0, this.jumpV = 0, this.jumpOffset = 0;
		this.tick = this.game.util.timestamp();
		this.setTimeUntilNextJump();
		this.isJumping = false;
	}

	loadAssets() {
		this.yeti1 = this.game.util.loadImage('/img/yeti1.png', this);
		this.yeti2 = this.game.util.loadImage('/img/yeti2.png', this);
		this.yeti_run_left1 = this.game.util.loadImage('/img/yeti_run_left1.png', this);
		this.yeti_run_left2 = this.game.util.loadImage('/img/yeti_run_left2.png', this);
		this.yeti_run_left3 = this.game.util.loadImage('/img/yeti_run_left3.png', this);
		this.yeti_run_right1 = this.game.util.loadImage('/img/yeti_run_right1.png', this);
		this.yeti_run_right2 = this.game.util.loadImage('/img/yeti_run_right2.png', this);
		this.yeti_run_right3 = this.game.util.loadImage('/img/yeti_run_right3.png', this);
		this.yeti_eat1 = this.game.util.loadImage('/img/yeti_eat1.png', this);
		this.yeti_eat2 = this.game.util.loadImage('/img/yeti_eat2.png', this);
		this.yeti_eat3 = this.game.util.loadImage('/img/yeti_eat3.png', this);
		this.yeti_eat4 = this.game.util.loadImage('/img/yeti_eat4.png', this);
		this.yeti_eat5 = this.game.util.loadImage('/img/yeti_eat5.png', this);
	}

	update(step) {
		if (!this.hasSpawned && Math.ceil(this.game.yDist / 28.7514) > 1000) {
			this.spawn();
		}
		if (!this.hasSpawned) return;

		// pursue the skier if he is alive
		if (this.game.skier.isAlive) {
			if (!this.isCollidingWithSkier()) {
				this.runTowardSkier();
			} else {
				this.stop();
				this.killSkier();
			}

			// update yeti position
			this.x -= this.game.skier.xv * step - this.xv;
			this.y -= this.game.skier.yv * step - this.yv;
		} else {
			this.stop();
			if (!this.game.skier.isEaten && this.isCollidingWithSkier()) {
				this.eatSkier();
			} else {
				this.intimidate();
			}
		}
	}

	spawn() {
		this.hasSpawned = true;
		let side = this.game.util.randomInt(0, 2);
		this.x = side == 0 ? this.game.gameWidth / 2 : -this.game.gameWidth / 2;
		this.y = this.game.gameHeight / 2;
	}

	isCollidingWithSkier() {
		return this.game.util.getDistanceBetweenPoints(this.x + 12, this.y + 20, 7, 24) <= 24;
	}

	runTowardSkier() {
		let yetiToSkierInfo = this.getYetiToSkierAngleInfo();

		this.setRunImg(yetiToSkierInfo.pursuitAngle);
		this.currentImg = this.runImg || this.runImg1;

		this.xv = yetiToSkierInfo.diffVector.x * this.speed;
		this.yv = yetiToSkierInfo.diffVector.y * this.speed;
	}

	setRunImg(pursuitAngle) {
		// set images to alternate between based on pursuit angle
		if (pursuitAngle < -90) {
			this.runImg1 = this.yeti_run_right1;
			this.runImg2 = this.yeti_run_right2;
		} else {
			this.runImg1 = this.yeti_run_left1;
			this.runImg2 = this.yeti_run_left2;
		}

		// alternate run images every tick
		if (this.game.currentTime - this.tick >= this.runAnimTick) {
			if (this.runImg == this.runImg1) {
				this.runImg = this.runImg2;
			} else {
				this.runImg = this.runImg1;
			}
			this.tick = this.game.currentTime;
		}
	}

	getYetiToSkierAngleInfo() {
		let diffX = this.x;
		let diffY = this.y;
		let atanDegrees = this.game.util.degrees(Math.atan(diffY / diffX));
		let pursuitAngle = 0, diffXVector = 0, diffYVector = 0;

		if (diffX > 0) {
			pursuitAngle = atanDegrees;
			diffXVector = -Math.cos(this.game.util.radians(pursuitAngle));
			diffYVector = -Math.sin(this.game.util.radians(pursuitAngle));
		} else if (diffX < 0) {
			if (diffY > 0) {
				pursuitAngle = 180 + atanDegrees;
			} else if (diffY < 0) {
				pursuitAngle = -180 + atanDegrees;
			}
			diffXVector = -Math.cos(this.game.util.radians(pursuitAngle));
			diffYVector = -Math.sin(this.game.util.radians(pursuitAngle));
		} else if (diffX == 0) {
			if (diffY > 0) {
				pursuitAngle = -90;
			} else {
				pursuitAngle = 90;
			}
			diffXVector = Math.cos(this.game.util.radians(pursuitAngle));
			diffYVector = Math.sin(this.game.util.radians(pursuitAngle));
		} else if (diffY == 0) {
			pursuitAngle = 180;
			diffXVector = Math.cos(this.game.util.radians(pursuitAngle));
			diffYVector = Math.sin(this.game.util.radians(pursuitAngle));
		}

		return { pursuitAngle: pursuitAngle, diffVector: { x: diffXVector, y: diffYVector } };
	}

	stop() {
		this.xv = 0;
		this.yv = 0;
	}

	killSkier() {
		this.game.skier.die();
		this.deathTime = this.game.util.timestamp();
	}

	// proceed through the eat image sequence
	eatSkier() {
		if (this.game.skier.isEaten) return;

		let now = this.game.util.timestamp();
		if (now - this.deathTime < this.eatAnimTick) {
			this.currentImg = this.yeti_eat1;
		} else if (now - this.deathTime < this.eatAnimTick * 2) {
			this.currentImg = this.yeti_eat2;
		} else if (now - this.deathTime < this.eatAnimTick * 3) {
			this.currentImg = this.yeti_eat3;
		} else if (now - this.deathTime < this.eatAnimTick * 4) {
			this.currentImg = this.yeti_eat4;
		} else if (now - this.deathTime < this.eatAnimTick * 10) {
			this.currentImg = this.yeti_eat5;
		} else {
			this.game.skier.isEaten = true;
		}
	}

	intimidate() {
		let now = this.game.util.timestamp();
		if (!this.isJumping && (!this.timeOfLastJump || now - this.timeOfLastJump >= this.timeUntilNextJump)) {
			this.isJumping = true;
			this.jumpV = this.jumpVInit;
			this.timeOfLastJump = now;
			this.setTimeUntilNextJump();
		}

		if (!this.isJumping) {
			this.currentImg = this.yeti1;
		} else {
			this.currentImg = this.yeti2;
			this.jumpOffset += this.jumpV;
			this.jumpV -= this.jumpGravity;

			if (this.jumpOffset <= 0) {
				this.currentImg = this.yeti1;
				this.isJumping = false;
				this.jumpOffset = 0;
			}
		}
	}

	setTimeUntilNextJump() {
		this.timeUntilNextJump = this.game.util.randomInt(250, 1500);
	}

	draw(ctx) {
		if (!this.hasSpawned) return;
		ctx.drawImage(this.currentImg, Math.floor(this.game.skier.x + this.x), Math.floor(this.game.skier.y + this.y - this.jumpOffset));
	}
}