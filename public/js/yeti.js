export default class Yeti {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.speed = this.game.skier.maxSpeed / 530;
		this.runAnimTick = 150;
		this.eatAnimTick = 100;
	}

	init() {
		this.x = -100;
		this.y = -200;
		this.xv = 0;
		this.yv = 0;
		this.tick = this.game.util.timestamp();
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
		if (this.game.skier.isAlive) {
			if (this.isAwayFromSkier()) {
				this.runTowardSkier();
			} else {
				this.stop();
				this.killSkier();
			}
			this.x -= this.game.skier.xv * step - this.xv;
			this.y -= this.game.skier.yv * step - this.yv;
		} else {
			this.eatSkier();
		}
	}

	isAwayFromSkier() {
		return this.game.util.getDistanceBetweenPoints(this.x + 12, this.y + 20, 7, 24) > 24;
	}

	runTowardSkier() {
		let yetiToSkierInfo = this.getYetiToSkierAngleInfo();

		this.setRunImg(yetiToSkierInfo.pursuitAngle);
		this.currentImg = this.runImg;

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
		let now = this.game.util.timestamp();
		if (now - this.deathTime < this.eatAnimTick) {
			this.currentImg = this.yeti_eat1;
		} else if (now - this.deathTime < this.eatAnimTick * 2) {
			this.currentImg = this.yeti_eat2;
		} else if (now - this.deathTime < this.eatAnimTick * 3) {
			this.currentImg = this.yeti_eat3;
		} else if (now - this.deathTime < this.eatAnimTick * 4) {
			this.currentImg = this.yeti_eat4;
		} else if (now - this.deathTime < this.eatAnimTick * 5) {
			this.currentImg = this.yeti_eat5;
		} else {
			this.currentImg = this.yeti1;
		}
	}

	draw(ctx) {
		ctx.drawImage(this.currentImg, Math.floor(this.game.skier.x + this.x), Math.floor(this.game.skier.y + this.y));
	}
}