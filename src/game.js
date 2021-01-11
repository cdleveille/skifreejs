import Skier from "/src/skier.js";

export default class Game {
	constructor() {
		this.skier = new Skier(this);
		this.mousePos = [0, 0];
		this.lastLogTime = null;
		this.treeDensity = 0.8
		this.bumpDensity = 1.0
		this.collisionsEnabled = true;
		this.skierTrail = []
		this.liftSpeed = 50;
		this.liftX = 100;
		this.liftChairSpacing = 500;
		this.liftTowerSpacing = 1000;
		this.enforceMaxSpeed = true;

		this.mouseHeadingAccel = 0.001;
		this.mouseHeadingX = 0;
		this.mouseHeadingY = 0;

		this.loadGameImages();
		this.populateInitialGameObjects();
	}

	loadGameImages() {
		this.tree_small = new Image();
		this.tree_small.src = "/img/tree_small.png";

		this.tree2 = new Image();
		this.tree2.src = "/img/tree2.png";

		this.boarder_bro = new Image();
		this.boarder_bro.src = "/img/boarder_bro.png";

		this.lodge = new Image();
		this.lodge.src = "/img/lodge.png";
		this.lodge.xc = 50;
		this.lodge.yc = -100;

		this.bump_small = new Image();
		this.bump_small.src = "/img/bump_small.png";

		this.bump_large = new Image();
		this.bump_large.src = "/img/bump_large.png";

		this.bump_group = new Image();
		this.bump_group.src = "/img/bump_group.png";

		this.lift_tower = new Image();
		this.lift_tower.src = "/img/lift_tower.png";

		this.lift_chair_up1 = new Image();
		this.lift_chair_up1.src = "/img/lift_chair_up1.png";

		this.lift_chair_up2 = new Image();
		this.lift_chair_up2.src = "/img/lift_chair_up2.png";

		this.lift_chair_down = new Image();
		this.lift_chair_down.src = "/img/lift_chair_down.png";
	}

	// generate game objects to put on and around screen at start of game
	populateInitialGameObjects() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		let area = width * height;

		// number of game objects to generate is proportional to total screen area
		this.treeCount = Math.floor(area * (50 / 562860.0) * this.treeDensity);
		this.bumpCount = Math.floor(area * (50 / 562860.0) * this.bumpDensity);

		// create trees
		this.trees = [];
		for (let n = 0; n < this.treeCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.trees.push([x, y, false]);
		}

		// create bumps
		this.bumps = [];
		for (let n = 0; n < this.bumpCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.bumps.push([x, y, this.randomInt(0, 3)]);
		}

		// create lift tower and chairs
		this.liftTowers = [[this.liftX, 0, false]];
		this.liftChairsDown = [[this.liftX - 18, 0]];
		this.liftChairsUp = [[this.liftX + 24, 0, this.randomInt(0, 2)]];
	}

	spawnNewGameObjectOffScreen(type) {
		let x = this.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
		let y = this.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

		// if game object would be visible, spawn it nearby off screen instead
		if (x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
			y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3) {
				let flip = this.randomInt(0, 5);
				if (flip == 0) {
					x -= this.gameWidth;
				} else if (flip == 1) {
					x -= this.gameWidth;
					y += this.gameHeight;
				} else if (flip == 2) {
					y += this.gameHeight;
				} else if (flip == 3) {
					x += this.gameWidth;
					y += this.gameHeight;
				} else {
					x += this.gameWidth;
				}
			}

		if (type == 'bump') {
			return [x, y, this.randomInt(0, 3)];
		} else {
			return [x, y, false];
		}
	}

	// adapt game to the size of the window
	resize(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.adaptGameObjectCountToScreenSize();
	}

	adaptGameObjectCountToScreenSize() {
		this.treeCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.treeDensity);

		// trim excess offscreen trees
		if (this.trees.length > this.treeCount) {
			for (let i = 0; i < this.trees.length; i++) {
				let x = this.trees[i][0];
				let y = this.trees[i][1];

				// remove the tree if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.trees.splice(i, 1);
				}
			}
		// add some new trees offscreen
		} else if (this.trees.length < this.treeCount) {
			let diff = this.treeCount - this.trees.length;
			for (let n = 0; n < diff; n++) {
				this.trees.push(this.spawnNewGameObjectOffScreen());
			}
		}

		this.bumpCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.bumpDensity);

		// trim excess offscreen bumps
		if (this.bumps.length > this.bumpCount) {
			for (let i = 0; i < this.bumps.length; i++) {
				let x = this.bumps[i][0];
				let y = this.bumps[i][1];

				// remove the bump if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.bumps.splice(i, 1);
				}
			}
		// add some new bumps offscreen
		} else if (this.bumps.length < this.bumpCount) {
			let diff = this.bumpCount - this.bumps.length;
			for (let n = 0; n < diff; n++) {
				this.bumps.push(this.spawnNewGameObjectOffScreen());
			}
		}
	}
	
	update(step) {
		this.updateSkier(this.crunchSomeNumbas());
		this.updateGameObjects();

		// scale the number of game objects to the size of the screen
		if (this.treeCount != this.trees.length || this.bumpCount != this.bumps.length) {
			this.adaptGameObjectCountToScreenSize();
		}

		// update position of game objects based on speed/direction of skier
		for (let i = 0; i < this.trees.length; i++) {
			this.trees[i][0] -= this.skier.xv * step;
			this.trees[i][1] -= this.skier.yv * step;
		}
		for (let i = 0; i < this.bumps.length; i++) {
			this.bumps[i][0] -= this.skier.xv * step;
			this.bumps[i][1] -= this.skier.yv * step;
		}

		// update position of coordinate points in the skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			this.skierTrail[i][0] -= this.skier.xv * step;
			this.skierTrail[i][1] -= this.skier.yv * step;
		}

		// update position of lift towers
		for (let i = 0; i < this.liftTowers.length; i++) {
			this.liftTowers[i][0] -= this.skier.xv * step;
			this.liftTowers[i][1] -= this.skier.yv * step;
		}

		// update position of lift chairs going down
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			this.liftChairsDown[i][0] -= this.skier.xv * step;
			this.liftChairsDown[i][1] -= (this.skier.yv - this.liftSpeed) * step;
		}

		// update position of lift chairs going up
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			this.liftChairsUp[i][0] -= this.skier.xv * step;
			this.liftChairsUp[i][1] -= (this.skier.yv + this.liftSpeed) * step;
		}

		// update position of lodge
		//this.lodge.xc -= this.skier.xv * step;
		//this.lodge.yc -= this.skier.yv * step;
	}

	updateGameObjects() {
		for (let i = 0; i < this.trees.length; i++) {
			let treeX = this.trees[i][0];
			let treeY = this.trees[i][1];
			let hitThisTreeAlready = this.trees[i][2];

			// recycle uphill offscreen trees once they are passed
			if (this.skier.y - treeY > this.gameHeight * (2 / 3) + 50) {
				this.trees[i] = this.spawnNewGameObjectOffScreen();
			}

			// if the skier hits a tree they haven't hit already, set isCrashed to true
			if (Math.abs(treeX) < 20 && Math.abs(treeY) < 20) {
				if (this.collisionsEnabled && !hitThisTreeAlready) {
					this.skier.isCrashed = true;
					this.trees[i][2] = true;
				}
			}
		}

		// recycle bumps once they are passed
		for (let i = 0; i < this.bumps.length; i++) {
			if (this.skier.y - this.bumps[i][1] > this.gameHeight * (2 / 3) + 50) {
				this.bumps[i] = this.spawnNewGameObjectOffScreen('bump');
			}
		}

		// delete skier trail if offscreen
		for (let i = 0; i < this.skierTrail.length; i++) {
			let y = this.skierTrail[i][1];
			if (this.skier.y - y > this.gameHeight * (2 / 3) + 50) {
				this.skierTrail.splice(i, 1);
			}
		}

		// if the skier hits a lift tower, set isCrashed to true
		for (let i = 0; i < this.liftTowers.length; i++) {
			if (Math.abs(this.liftTowers[i][0] + 3) < 8 && Math.abs(this.liftTowers[i][1] + 40) < 20) {
				if (this.collisionsEnabled && !this.liftTowers[i][2]) {
					this.skier.isCrashed = true;
					this.liftTowers[i][2] = true;
				}
			}
		}

		this.updateLift();
	}

	updateLift() {
		let highestTower = this.liftTowers[this.liftTowers.length - 1];
		let lowestTower = this.liftTowers[0];

		// if the highest tower is on the game screen, spawn a new tower above it
		if (highestTower[1] < this.gameHeight * 2 / 3 && highestTower[1] > -this.gameHeight / 3 - this.lift_tower.height) {
			this.liftTowers.push([highestTower[0], highestTower[1] - this.liftTowerSpacing]);
		}
		// if the highest tower is offscreen upwards and is not the only remaining tower, delete it
		else if (highestTower[1] < -this.gameHeight / 3 - this.liftTowerSpacing && this.liftTowers.length > 1) {
			this.liftTowers.splice(this.liftTowers.length - 1, 1);
		}

		// if the lowest tower is on the game screen, spawn a new tower below it
		if (lowestTower[1] < this.gameHeight * 2 / 3 && lowestTower[1] > -this.gameHeight / 3 - this.lift_tower.height) {
			this.liftTowers.unshift([lowestTower[0], lowestTower[1] + this.liftTowerSpacing]);
		}

		let highestChairDown = this.liftChairsDown[this.liftChairsDown.length - 1];
		let lowestChairDown = this.liftChairsDown[0];

		// if the highest chair going down is on the game screen, spawn a new chair above it
		if (highestChairDown[1] < this.gameHeight * 2 / 3 && highestChairDown[1] > -this.gameHeight / 3 - this.lift_chair_down.height) {
			this.liftChairsDown.push([highestChairDown[0], highestChairDown[1] - this.liftChairSpacing]);
		}
		// if the highest chair going down is off-screen upwards, move it below the lowest chair going down
		else if (highestChairDown[1] < -this.gameHeight / 3 - this.lift_chair_down.height - this.liftChairSpacing) {
			this.liftChairsDown.splice(this.liftChairsDown.length - 1, 1);
			this.liftChairsDown.unshift([this.liftChairsDown[0][0], this.liftChairsDown[0][1] + this.liftChairSpacing]);
		}

		// if the lowest chair going down is on the game screen, spawn a new chair below it
		if (lowestChairDown[1] < this.gameHeight * 2 / 3 && lowestChairDown[1] > -this.gameHeight / 3 - this.lift_chair_down.height) {
			this.liftChairsDown.unshift([lowestChairDown[0], lowestChairDown[1] + this.liftChairSpacing]);
		}
		// if the lowest chair going down is off-screen downwards and is not the only remaining chair, delete it
		else if (lowestChairDown[1] > this.gameHeight * 2 / 3 + this.liftChairSpacing && this.liftChairsDown.length > 1) {
			this.liftChairsDown.splice(0, 1);
		}

		let highestChairUp = this.liftChairsUp[this.liftChairsUp.length - 1];
		let lowestChairUp = this.liftChairsUp[0];

		// if the lowest chair going up is on the game screen, spawn a new chair below it
		if (lowestChairUp[1] < this.gameHeight * 2 / 3 && lowestChairUp[1] > -this.gameHeight / 3 - this.lift_chair_up1.height) {
			this.liftChairsUp.unshift([lowestChairUp[0], lowestChairUp[1] + this.liftChairSpacing, this.randomInt(0, 2)]);
		}

		// if the highest chair going up is on the game screen, spawn a new chair above it
		if (highestChairUp[1] < this.gameHeight * 2 / 3 && highestChairUp[1] > -this.gameHeight / 3 - this.lift_chair_up1.height) {
			this.liftChairsUp.push([highestChairUp[0], highestChairUp[1] - this.liftChairSpacing, this.randomInt(0, 2)]);
		}
		// if the highest chair going up is off-screen upwards and is not the only remaining chair, delete it
		else if (highestChairUp[1] < -this.gameHeight / 3 - this.lift_chair_up1.height - this.liftChairSpacing && this.liftChairsUp.length > 1) {
			this.liftChairsUp.splice(this.liftChairsUp.length - 1, 1);
		}
	}

	// do sum mathz
	crunchSomeNumbas() {
		let mouseDiffX = -(this.mousePos[0] - ((this.gameWidth / 2) + 8));
		let mouseDiffY = -(this.mousePos[1] - ((this.gameHeight / 3) + 32));
		let mouseAtanDegrees = this.degrees(Math.atan(mouseDiffY / mouseDiffX));
		let mouseAngle = 0, mouseDiffXVector = 0, mouseDiffYVector = 0;

		if (mouseDiffX > 0) {
			mouseAngle = mouseAtanDegrees;
			mouseDiffXVector = -Math.cos(this.radians(mouseAngle));
            mouseDiffYVector = -Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffX < 0) {
			if (mouseDiffY > 0) {
				mouseAngle = 180 + mouseAtanDegrees;
			} else if (mouseDiffY < 0) {
				mouseAngle = -180 + mouseAtanDegrees;
			}
			mouseDiffXVector = -Math.cos(this.radians(mouseAngle));
            mouseDiffYVector = -Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffX == 0) {
			if (mouseDiffY > 0) {
				mouseAngle = -90;
			} else {
				mouseAngle = 90
			}
			mouseDiffXVector = Math.cos(this.radians(mouseAngle));
            mouseDiffYVector = Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffY == 0) {
			mouseAngle = 180;
			mouseDiffXVector = Math.cos(this.radians(mouseAngle));
            mouseDiffYVector = Math.sin(this.radians(mouseAngle));
		}
		let mouseDistance = Math.sqrt(Math.pow(mouseDiffX, 2) + Math.pow(mouseDiffY, 2));

		let vAtanDegrees = this.degrees(Math.atan(this.skier.yv / this.skier.xv));
		let vAngle = 0, xvVector = 0, yvVector = 0;

		if (this.skier.xv > 0) {
			vAngle = vAtanDegrees;
			xvVector = -Math.cos(this.radians(vAngle));
            yvVector = -Math.sin(this.radians(vAngle));
		} else if (this.skier.xv < 0) {
			if (this.skier.yv > 0) {
				vAngle = 180 + vAtanDegrees;
			} else if (this.skier.yv < 0) {
				vAngle = -180 + vAtanDegrees;
			}
			xvVector = -Math.cos(this.radians(vAngle));
            yvVector = -Math.sin(this.radians(vAngle));
		} else if (this.skier.xv == 0) {
			if (this.skier.yv > 0) {
				vAngle = -90;
			} else {
				vAngle = 90
			}
			xvVector = Math.cos(this.radians(vAngle));
            yvVector = Math.sin(this.radians(vAngle));
		} else if (this.skier.yv == 0) {
			vAngle = 180;
			xvVector = Math.cos(this.radians(vAngle));
            yvVector = Math.sin(this.radians(vAngle));
		}
		let speed = Math.sqrt(Math.pow(this.skier.xv, 2) + Math.pow(this.skier.yv, 2));

		return [mouseAngle, mouseDistance, [mouseDiffXVector, mouseDiffYVector], vAngle, speed, [xvVector, yvVector]];
	}

	updateSkier(someNumbers) {
		let mouseToSkierAngle = someNumbers[0];
		let mouseToSkierDistance = someNumbers[1];
		let mouseAngleVectors = someNumbers[2];

		let vAngle = someNumbers[3];
		let speed = someNumbers[4];
		let vVectors = someNumbers[5];

		// handle player jumps
		if (this.skier.isJumping) {
			this.skier.jumpOffset += this.skier.jumpV;
			this.skier.jumpV -= this.skier.jumpGravity;

			if (this.skier.jumpOffset <= 0) {
				this.skier.jumpOffset = 0;
				this.skier.isJumping = false;
			}
		}

		// mouse up / left
		if ((mouseToSkierAngle < 90 && mouseToSkierAngle > -5) || mouseToSkierAngle == -90) {
			if (this.skier.isJumping) {
				this.skier.currentImage = this.skier.skier_jump_left;
			} else if (this.skier.isSkatingLeft) {
				//this.skier.xv = -this.skier.skateV;
				//this.skier.currentImage = this.skier.skier_skate_left;
			} else if (this.skier.isSkatingRight) {
				//this.skier.xv = this.skier.skateV;
				//this.skier.currentImage = this.skier.skier_skate_right;
			} else {
				this.skier.currentImage = this.skier.skier_left;
				this.stopSkier(vVectors);
			}
		// mouse up / right
		} else if (mouseToSkierAngle < -175 || (mouseToSkierAngle > 90 && mouseToSkierAngle < 180)) {
			if (this.skier.isJumping) {
				this.skier.currentImage = this.skier.skier_jump_right;
			} else if (this.skier.isSkatingLeft) {
				//this.skier.currentImage = this.skier.skier_skate_left;
			} else if (this.skier.isSkatingRight) {
				//this.skier.currentImage = this.skier.skier_skate_right;
			} else {
				this.skier.currentImage = this.skier.skier_right;
				this.stopSkier(vVectors);
			}
		} else {
			if (mouseToSkierAngle < -5 && mouseToSkierAngle > -50) {
				if (this.skier.isJumping) {
					this.skier.currentImage = this.skier.skier_jump_left;
				} else {
					this.skier.currentImage = this.skier.skier_left_down;
				}
			} else if (mouseToSkierAngle < -50 && mouseToSkierAngle > -75) {
				if (this.skier.isJumping) {
					this.skier.currentImage = this.skier.skier_jump_left;
				} else {
					this.skier.currentImage = this.skier.skier_down_left;
				}
			} else if (mouseToSkierAngle < -75 && mouseToSkierAngle > -105) {
				if (this.skier.isJumping) {
					this.skier.currentImage = this.skier.skier_jump_down;
				} else {
					this.skier.currentImage = this.skier.skier_down;
				}
			} else if (mouseToSkierAngle < -105 && mouseToSkierAngle > -130) {
				if (this.skier.isJumping) {
					this.skier.currentImage = this.skier.skier_jump_right;
				} else {
					this.skier.currentImage = this.skier.skier_down_right;
				}
			} else if (mouseToSkierAngle < -130 && mouseToSkierAngle > -175) {
				if (this.skier.isJumping) {
					this.skier.currentImage = this.skier.skier_jump_right;
				} else {
					this.skier.currentImage = this.skier.skier_right_down;
				}
			}

			let xFlip = 1;
			if (mouseToSkierAngle > -90 && mouseToSkierAngle < 0) {
				xFlip = -1;
			}

			let maxSpeed = 400;
			let maxSpeedX = maxSpeed * mouseAngleVectors[0] * xFlip;
			let maxSpeedY = maxSpeed * mouseAngleVectors[1];

			if (!this.skier.isCrashed) {
				this.skier.isStopped = false;
				this.skier.xv += this.skier.accelX * mouseAngleVectors[0];
				this.skier.yv += this.skier.accelY * mouseAngleVectors[1];
			}

			//this.log(mouseToSkierAngle);

			if (this.enforceMaxSpeed) {
				if (this.skier.xv < -maxSpeedX) {
					this.skier.xv = -maxSpeedX;
				} else if (this.skier.xv > maxSpeedX) {
					this.skier.xv = maxSpeedX;
				}
				if (this.skier.yv > maxSpeedY) {
					this.skier.yv = maxSpeedY;
				}
			}
		}

		if (this.skier.isJumping && this.skier.isCrashed) {
			this.skier.currentImage = this.skier.skier_falling;
		} else if (this.skier.isCrashed) {
			this.skier.currentImage = this.skier.skier_sit;
			this.stopSkier(vVectors);
		}

		// add coordinate(s) to skier trail
		if (!this.skier.isStopped && !this.skier.isJumping) {
			this.skierTrail.push([10, 22]);
		}
	}

	// decelerate the skier until he is stopped
	stopSkier(vVectors) {
		if (!this.skier.isStopped) {
			let xDecelAmt = this.skier.decel * vVectors[0];
			let yDecelAmt = this.skier.decel * vVectors[1];

			this.skier.xv -= xDecelAmt;
			this.skier.yv -= yDecelAmt;

			if (this.skier.yv <= 0) {
				this.skier.yv = 0
				this.skier.xv = 0;
				this.skier.isStopped = true;
			}
		}
	}

	// handle keyboard input
    keyAction(keyDown, keyUp) {
		if (this.skier.isStopped && !this.skier.isCrashed && !this.skier.isJumping) {
			switch(keyDown) {
				case "left":
					this.skier.isSkatingLeft = true;
					break;
				case "right":
					this.skier.isSkatingRight = true;
					break;
			}
		}

		switch(keyUp) {
			case "left":
				this.skier.isSkatingLeft = false;
				break;
			case "right":
				this.skier.isSkatingRight = false;
				break;
		}
    }

	// convert radians to degrees
	degrees(radians) {
		return (radians * 180) / Math.PI;
	}

	// convert degrees to radians
	radians(degrees) {
		return (degrees * Math.PI) / 180;
	}

	// minimum is inclusive and maximum is exclusive
	randomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); 
	}

	// get the current time (high precision)
	timestamp() {
		return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	}

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

		// draw bumps
		for (let i = 0; i < this.bumps.length; i++) {
			let type = this.bumps[i][2];
			let img = this.bump_group;
			if (type == 0) {
				img = this.bump_small;
			} else if (type == 1) {
				img = this.bump_large;
			}

			ctx.drawImage(img, this.skier.x + this.bumps[i][0], this.skier.y + this.bumps[i][1]);
		}

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = "#DDDDDD";
			ctx.fillRect(this.skier.x + this.skierTrail[i][0] + 2, this.skier.y + this.skierTrail[i][1], 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i][0] - 6, this.skier.y + this.skierTrail[i][1], 2, 1);
		}
		
		// draw trees
		for (let i = 0; i < this.trees.length; i++) {
			ctx.drawImage(this.tree_small, this.skier.x + this.trees[i][0], this.skier.y + this.trees[i][1]);
		}

		// draw skier
		this.skier.draw(ctx);

		// draw lift chairs
		for (let i = 0; i < this.liftChairsDown.length; i++) {
			ctx.drawImage(this.lift_chair_down, this.skier.x + this.liftChairsDown[i][0], this.skier.y + this.liftChairsDown[i][1]);
		}
		for (let i = 0; i < this.liftChairsUp.length; i++) {
			let img = this.lift_chair_up1;
			if (this.liftChairsUp[i][2] == 1) {
				img = this.lift_chair_up2;
			}
			ctx.drawImage(img, this.skier.x + this.liftChairsUp[i][0], this.skier.y + this.liftChairsUp[i][1]);
		}

		// draw lift cables
		ctx.fillStyle = "#555555";
		ctx.fillRect(this.skier.x + this.liftTowers[0][0] + 1, this.skier.y - this.gameHeight / 3, 1, this.gameHeight);
		ctx.fillRect(this.skier.x + this.liftTowers[0][0] + 30, this.skier.y - this.gameHeight / 3, 1, this.gameHeight);

		// draw lift towers
		for (let i = 0; i < this.liftTowers.length; i++) {
			ctx.drawImage(this.lift_tower, this.skier.x + this.liftTowers[i][0], this.skier.y + this.liftTowers[i][1]);
		}

		// draw lodge
		//ctx.drawImage(this.lodge, this.skier.x + this.lodge.xc, this.skier.y + this.lodge.yc);

	}

	log(toLog) {
		if (this.lastLogTime == null) {
			this.lastLogTime = this.timestamp();
		}
		
		if (this.timestamp() - this.lastLogTime > 500) {
			console.log(toLog);
			this.lastLogTime = null;
		}
	}
}