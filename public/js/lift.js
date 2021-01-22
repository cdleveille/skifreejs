/* eslint-disable no-undef */
export default class Lift {
	constructor(game) {
		this.game = game;
		this.liftSpeed = 50;
		this.liftX = 100;
		this.liftChairSpacing = 500;
		this.liftTowerSpacing = 1000;
		this.images = [];
	}

	init() {
		this.liftTowers = [{ x: this.liftX, y: 0, hasCollided: false }];
		this.liftChairsDown = [{ x: this.liftX - 18, y: 0 }];
		this.liftChairsUp = [{ x: this.liftX + 24, y: 0, passengers: this.game.util.randomInt(1, 3) }];
	}

	loadAssets() {
		this.lift_tower = this.game.util.loadImage('/img/lift_tower.png', this);
		this.lift_tower_top = this.game.util.loadImage('/img/lift_tower_top.png', this);
		this.lift_chair_up1 = this.game.util.loadImage('/img/lift_chair_up1.png', this);
		this.lift_chair_up2 = this.game.util.loadImage('/img/lift_chair_up2.png', this);
		this.lift_chair_down = this.game.util.loadImage('/img/lift_chair_down.png', this);
	}

	update(step) {
		// check for collisions and update position of lift towers
		for (let i = 0; i < this.liftTowers.length; i++) {
			let tower = this.liftTowers[i];

			// if the skier hits a lift tower, set isCrashed to true
			if (this.game.isGameObjectCollidingWithSkier({ x: tower.x, y: tower.y, hbXOffset: 10, hbYOffset: 50, hbWidth: 11, hbHeight: 11 }) && this.game.skier.jumpOffset < 62) {
				if (this.game.collisionsEnabled && !tower.hasCollided) {
					this.game.skier.isCrashed = true;
					tower.hasCollided = true;
					this.game.style = 0;
				}
			}

			// if an other skier hits a lift tower, set isCrashed to true
			for (let j = 0; j < this.game.otherSkiers.length; j++) {
				let otherSkier = this.game.otherSkiers[j];
				if (!otherSkier.isCrashed && this.game.isGameObjectCollidingWithOtherSkier(otherSkier, { x: tower.x, y: tower.y, hbXOffset: 10, hbYOffset: 50, hbWidth: 11, hbHeight: 11 })) {
					if (this.game.collisionsEnabled) {
						this.game.crashOtherSkierOnCollision(otherSkier);
					}
				}
			}

			tower.x -= this.game.skier.xv * step;
			tower.y -= this.game.skier.yv * step;
		}

		// update position of lift chairs going down
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			let chairDown = this.liftChairsDown[i];
			chairDown.x -= this.game.skier.xv * step;
			chairDown.y -= (this.game.skier.yv - this.liftSpeed) * step;
		}

		// update position of lift chairs going up
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			let chairUp = this.liftChairsUp[i];
			chairUp.x -= this.game.skier.xv * step;
			chairUp.y -= (this.game.skier.yv + this.liftSpeed) * step;
		}

		let highestTower = this.liftTowers[this.liftTowers.length - 1];
		let lowestTower = this.liftTowers[0];

		// if the highest tower is on the game screen, spawn a new tower above it
		if (highestTower.y < this.game.gameHeight * 2 / 3 && highestTower.y > -this.game.gameHeight / 3 - 62) {
			this.liftTowers.push({ x: highestTower.x, y: highestTower.y - this.liftTowerSpacing, hasCollided: false });
		}
		// if the highest tower is offscreen upwards and is not the only remaining tower, delete it
		else if (highestTower.y < -this.game.gameHeight / 3 - this.liftTowerSpacing && this.liftTowers.length > 1) {
			this.liftTowers.splice(this.liftTowers.length - 1, 1);
		}

		// if the lowest tower is on the game screen, spawn a new tower below it
		if (lowestTower.y < this.game.gameHeight * 2 / 3 && lowestTower.y > -this.game.gameHeight / 3 - 62) {
			this.liftTowers.unshift({ x: lowestTower.x, y: lowestTower.y + this.liftTowerSpacing, hasCollided: false });
		}

		let highestChairDown = this.liftChairsDown[this.liftChairsDown.length - 1];
		let lowestChairDown = this.liftChairsDown[0];

		// if the highest chair going down is on the game screen, spawn a new chair above it
		if (highestChairDown.y < this.game.gameHeight * 2 / 3 && highestChairDown.y > -this.game.gameHeight / 3 - 30) {
			this.liftChairsDown.push({ x: highestChairDown.x, y: highestChairDown.y - this.liftChairSpacing });
		}
		// if the highest chair going down is off-screen upwards, move it below the lowest chair going down
		else if (highestChairDown.y < -this.game.gameHeight / 3 - 30 - this.liftChairSpacing) {
			this.liftChairsDown.splice(this.liftChairsDown.length - 1, 1);
			this.liftChairsDown.unshift({ x: lowestChairDown.x, y: lowestChairDown.y + this.liftChairSpacing });
		}

		// if the lowest chair going down is on the game screen, spawn a new chair below it
		if (lowestChairDown.y < this.game.gameHeight * 2 / 3 && lowestChairDown.y > -this.game.gameHeight / 3 - 30) {
			this.liftChairsDown.unshift({ x: lowestChairDown.x, y: lowestChairDown.y + this.liftChairSpacing });
		}
		// if the lowest chair going down is off-screen downwards and is not the only remaining chair, delete it
		else if (lowestChairDown.y > this.game.gameHeight * 2 / 3 + this.liftChairSpacing && this.liftChairsDown.length > 1) {
			this.liftChairsDown.splice(0, 1);
		}

		let highestChairUp = this.liftChairsUp[this.liftChairsUp.length - 1];
		let lowestChairUp = this.liftChairsUp[0];

		// if the lowest chair going up is on the game screen, spawn a new chair below it
		if (lowestChairUp.y < this.game.gameHeight * 2 / 3 && lowestChairUp.y > -this.game.gameHeight / 3 - 32) {
			this.liftChairsUp.unshift({ x: lowestChairUp.x, y: lowestChairUp.y + this.liftChairSpacing, passengers: this.game.util.randomInt(1, 3) });
		}

		// if the highest chair going up is on the game screen, spawn a new chair above it
		if (highestChairUp.y < this.game.gameHeight * 2 / 3 && highestChairUp.y > -this.game.gameHeight / 3 - 32) {
			this.liftChairsUp.push({ x: highestChairUp.x, y: highestChairUp.y - this.liftChairSpacing, passengers: this.game.util.randomInt(0, 2) });
		}
		// if the highest chair going up is off-screen upwards and is not the only remaining chair, delete it
		else if (highestChairUp.y < -this.game.gameHeight / 3 - 32 - this.liftChairSpacing && this.liftChairsUp.length > 1) {
			this.liftChairsUp.splice(this.liftChairsUp.length - 1, 1);
		}
	}

	drawTowersAbovePlayer(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (this.liftTowers[i].y < -38) {
				ctx.drawImage(this.lift_tower, this.game.skier.x + this.liftTowers[i].x, this.game.skier.y + this.liftTowers[i].y);
			}
		}
	}

	drawTowersBelowPlayer(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (this.liftTowers[i].y >= -38) {
				ctx.drawImage(this.lift_tower, this.game.skier.x + this.liftTowers[i].x, this.game.skier.y + this.liftTowers[i].y);
			}
		}
	}

	drawTowerTops(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			ctx.drawImage(this.lift_tower_top, this.game.skier.x + this.liftTowers[i].x, this.game.skier.y + this.liftTowers[i].y);
		}
	}

	drawChairs(ctx) {
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			ctx.drawImage(this.lift_chair_down, this.game.skier.x + this.liftChairsDown[i].x, this.game.skier.y + this.liftChairsDown[i].y);
		}
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			let img = this.lift_chair_up1;
			if (this.liftChairsUp[i].passengers == 2) {
				img = this.lift_chair_up2;
			}
			ctx.drawImage(img, this.game.skier.x + this.liftChairsUp[i].x, this.game.skier.y + this.liftChairsUp[i].y);
		}
	}

	drawCables(ctx) {
		ctx.fillStyle = '#333333';
		ctx.fillRect(this.game.skier.x + this.liftTowers[0].x + 1, this.game.skier.y - this.game.gameHeight / 3, 1, this.game.gameHeight);
		ctx.fillRect(this.game.skier.x + this.liftTowers[0].x + 30, this.game.skier.y - this.game.gameHeight / 3, 1, this.game.gameHeight);
	}
}