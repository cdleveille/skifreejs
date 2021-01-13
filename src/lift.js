export default class Lift {
	constructor(game) {
		this.game = game;
		this.liftSpeed = 50;
		this.liftX = 100;
		this.liftChairSpacing = 500;
		this.liftTowerSpacing = 1000;

		this.liftTowers = [[this.liftX, 0, false]];
		this.liftChairsDown = [[this.liftX - 18, 0]];
		this.liftChairsUp = [[this.liftX + 24, 0, game.randomInt(0, 2)]];
		
		this.loadLiftImages();
	}

	loadLiftImages() {
		this.lift_tower = new Image();
		this.lift_tower.src = "/img/lift_tower.png";

		this.lift_tower_top = new Image();
		this.lift_tower_top.src = "/img/lift_tower_top.png";

		this.lift_chair_up1 = new Image();
		this.lift_chair_up1.src = "/img/lift_chair_up1.png";

		this.lift_chair_up2 = new Image();
		this.lift_chair_up2.src = "/img/lift_chair_up2.png";

		this.lift_chair_down = new Image();
		this.lift_chair_down.src = "/img/lift_chair_down.png";
	}

	update(step) {
		// update position of lift towers
		for (let i = 0; i < this.liftTowers.length; i++) {
			this.liftTowers[i][0] -= this.game.skier.xv * step;
			this.liftTowers[i][1] -= this.game.skier.yv * step;
		}

		// update position of lift chairs going down
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			this.liftChairsDown[i][0] -= this.game.skier.xv * step;
			this.liftChairsDown[i][1] -= (this.game.skier.yv - this.liftSpeed) * step;
		}

		// update position of lift chairs going up
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			this.liftChairsUp[i][0] -= this.game.skier.xv * step;
			this.liftChairsUp[i][1] -= (this.game.skier.yv + this.liftSpeed) * step;
		}

		// if the skier hits a lift tower, set isCrashed to true
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (this.game.isCollidingWithSkier(this.liftTowers[i][0] + 10, this.liftTowers[i][1] + 50, 11, 11) && this.game.skier.jumpOffset < 61) {
				if (this.game.collisionsEnabled && !this.liftTowers[i][2]) {
					this.game.skier.isCrashed = true;
					this.liftTowers[i][2] = true;
					this.game.style -= 32;
				}
			}
		}

		let highestTower = this.liftTowers[this.liftTowers.length - 1];
		let lowestTower = this.liftTowers[0];

		// if the highest tower is on the game screen, spawn a new tower above it
		if (highestTower[1] < this.game.gameHeight * 2 / 3 && highestTower[1] > -this.game.gameHeight / 3 - this.lift_tower.height) {
			this.liftTowers.push([highestTower[0], highestTower[1] - this.liftTowerSpacing]);
		}
		// if the highest tower is offscreen upwards and is not the only remaining tower, delete it
		else if (highestTower[1] < -this.game.gameHeight / 3 - this.liftTowerSpacing && this.liftTowers.length > 1) {
			this.liftTowers.splice(this.liftTowers.length - 1, 1);
		}

		// if the lowest tower is on the game screen, spawn a new tower below it
		if (lowestTower[1] < this.game.gameHeight * 2 / 3 && lowestTower[1] > -this.game.gameHeight / 3 - this.lift_tower.height) {
			this.liftTowers.unshift([lowestTower[0], lowestTower[1] + this.liftTowerSpacing]);
		}

		let highestChairDown = this.liftChairsDown[this.liftChairsDown.length - 1];
		let lowestChairDown = this.liftChairsDown[0];

		// if the highest chair going down is on the game screen, spawn a new chair above it
		if (highestChairDown[1] < this.game.gameHeight * 2 / 3 && highestChairDown[1] > -this.game.gameHeight / 3 - this.lift_chair_down.height) {
			this.liftChairsDown.push([highestChairDown[0], highestChairDown[1] - this.liftChairSpacing]);
		}
		// if the highest chair going down is off-screen upwards, move it below the lowest chair going down
		else if (highestChairDown[1] < -this.game.gameHeight / 3 - this.lift_chair_down.height - this.liftChairSpacing) {
			this.liftChairsDown.splice(this.liftChairsDown.length - 1, 1);
			this.liftChairsDown.unshift([this.liftChairsDown[0][0], this.liftChairsDown[0][1] + this.liftChairSpacing]);
		}

		// if the lowest chair going down is on the game screen, spawn a new chair below it
		if (lowestChairDown[1] < this.game.gameHeight * 2 / 3 && lowestChairDown[1] > -this.game.gameHeight / 3 - this.lift_chair_down.height) {
			this.liftChairsDown.unshift([lowestChairDown[0], lowestChairDown[1] + this.liftChairSpacing]);
		}
		// if the lowest chair going down is off-screen downwards and is not the only remaining chair, delete it
		else if (lowestChairDown[1] > this.game.gameHeight * 2 / 3 + this.liftChairSpacing && this.liftChairsDown.length > 1) {
			this.liftChairsDown.splice(0, 1);
		}

		let highestChairUp = this.liftChairsUp[this.liftChairsUp.length - 1];
		let lowestChairUp = this.liftChairsUp[0];

		// if the lowest chair going up is on the game screen, spawn a new chair below it
		if (lowestChairUp[1] < this.game.gameHeight * 2 / 3 && lowestChairUp[1] > -this.game.gameHeight / 3 - this.lift_chair_up1.height) {
			this.liftChairsUp.unshift([lowestChairUp[0], lowestChairUp[1] + this.liftChairSpacing, this.game.randomInt(0, 2)]);
		}

		// if the highest chair going up is on the game screen, spawn a new chair above it
		if (highestChairUp[1] < this.game.gameHeight * 2 / 3 && highestChairUp[1] > -this.game.gameHeight / 3 - this.lift_chair_up1.height) {
			this.liftChairsUp.push([highestChairUp[0], highestChairUp[1] - this.liftChairSpacing, this.game.randomInt(0, 2)]);
		}
		// if the highest chair going up is off-screen upwards and is not the only remaining chair, delete it
		else if (highestChairUp[1] < -this.game.gameHeight / 3 - this.lift_chair_up1.height - this.liftChairSpacing && this.liftChairsUp.length > 1) {
			this.liftChairsUp.splice(this.liftChairsUp.length - 1, 1);
		}
	}

	drawTowersAbovePlayer(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (this.liftTowers[i][1] < -38) {
				ctx.drawImage(this.lift_tower, this.game.skier.x + this.liftTowers[i][0], this.game.skier.y + this.liftTowers[i][1]);
			}
		}
	}

	drawTowersBelowPlayer(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (this.liftTowers[i][1] >= -38) {
				ctx.drawImage(this.lift_tower, this.game.skier.x + this.liftTowers[i][0], this.game.skier.y + this.liftTowers[i][1]);
			}
		}
	}

	drawTowerTops(ctx) {
		for (let i = 0; i < this.liftTowers.length; i++) {
			ctx.drawImage(this.lift_tower_top, this.game.skier.x + this.liftTowers[i][0], this.game.skier.y + this.liftTowers[i][1]);
		}
	}

	drawChairs(ctx) {
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			ctx.drawImage(this.lift_chair_down, this.game.skier.x + this.liftChairsDown[i][0], this.game.skier.y + this.liftChairsDown[i][1]);
		}
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			let img = this.lift_chair_up1;
			if (this.liftChairsUp[i][2] == 1) {
				img = this.lift_chair_up2;
			}
			ctx.drawImage(img, this.game.skier.x + this.liftChairsUp[i][0], this.game.skier.y + this.liftChairsUp[i][1]);
		}
	}

	drawCables(ctx) {
		ctx.fillStyle = "#333333";
		ctx.fillRect(this.game.skier.x + this.liftTowers[0][0] + 1, this.game.skier.y - this.game.gameHeight / 3, 1, this.game.gameHeight);
		ctx.fillRect(this.game.skier.x + this.liftTowers[0][0] + 30, this.game.skier.y - this.game.gameHeight / 3, 1, this.game.gameHeight);
	}
}