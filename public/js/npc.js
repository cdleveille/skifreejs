/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
export default class NPCHandler {
	constructor(game) {
		this.game = game;
		this.resCoefficient = 1 / 200000;
		this.maxDogCount = 1;
		this.images = [];
	}

	loadAssets() {
		this.otherSkier1 = this.game.util.loadImage('/img/other_skier1.png', this);
		this.otherSkier2 = this.game.util.loadImage('/img/other_skier2.png', this);
		this.otherSkier3 = this.game.util.loadImage('/img/other_skier3.png', this);
		this.otherSkier_crash = this.game.util.loadImage('/img/other_skier_crash.png', this);
		this.snowboarder_left = this.game.util.loadImage('/img/snowboarder_left.png', this);
		this.snowboarder_right = this.game.util.loadImage('/img/snowboarder_right.png', this);
		this.snowboarder_crash = this.game.util.loadImage('/img/snowboarder_crash.png', this);
		this.dog1 = this.game.util.loadImage('/img/dog1.png', this);
		this.dog2 = this.game.util.loadImage('/img/dog2.png', this);
		this.dog_woof1 = this.game.util.loadImage('/img/dog_woof1.png', this);
		this.dog_woof2 = this.game.util.loadImage('/img/dog_woof2.png', this);
	}

	setUpNPCs() {
		this.otherSkiers = [];
		this.snowboarders = [];
		this.dogs = [];

		this.calculateNPCCount();
		for (let n = 0; n < this.npcCount; n++) {
			let type = n < this.npcCount / 2 ? 'other_skier' : 'snowboarder';
			this.spawnNewNPCAtStart(type);
		}

		this.timeUntilSpawnNewDog = this.game.util.randomInt(5000, 15000);
		this.timeLastDogDeleted = this.game.util.timestamp();
	}

	calculateNPCCount() {
		let area = window.innerWidth * window.innerHeight;
		this.npcCount = Math.max(2, Math.floor(area * this.resCoefficient));

		console.log('npc count: ' + this.npcCount);
	}

	spawnNewNPCAtStart(type) {
		let xy = this.game.getRandomCoordinateAtStart();
		this.spawnNewNPC(type, xy.x, xy.y);
	}

	spawnNewNPC(type, x, y) {
		let newNPC;
		switch(type) {
		case 'other_skier':
			newNPC = { x: x, y: y, xv: 0, yv: 0.1, xSpeed: 0.15, hbXOffset: 7, hbYOffset: 13, hbWidth: 11, hbHeight: 11, hasCollided: false, isCrashed: false, timestamp: this.game.util.timestamp() + this.game.util.randomInt(0, 1000), img: this.otherSkier3 };
			this.otherSkiers.push(newNPC);
			return;
		case 'snowboarder':
			newNPC = { x: x, y: y, xv: -0.25, yv: 0.75, xSpeed: 0.15, hbXOffset: 7, hbYOffset: 16, hbWidth: 13, hbHeight: 9, hasCollided: false, isCrashed: false, timestamp: this.game.util.timestamp() + this.game.util.randomInt(0, 1000), img: this.snowboarder_left };
			this.snowboarders.push(newNPC);
			return;
		default:
			console.log('invalid npc type: ' + type);
		}
	}

	spawnNewDog() {
		let x = -window.innerWidth / 2 - 40;
		let y = this.game.util.randomInt(window.innerHeight / 3, window.innerHeight * 2);
		let dog = { x: x, y: y, xv: 0.3, yv: 0, hbXOffset: -5, hbYOffset: -5, hbWidth: 31, hbHeight: 25, isCrashed: false, hasCollided: false, timestamp: this.game.util.timestamp(), img: this.dog1 };
		this.dogs.push(dog);
	}

	update(step) {
		this.updateOtherSkiers(step);
		this.updateSnowboarders(step);
		this.updateDogs(step);
	}

	updateOtherSkiers(step) {
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];

			// give the other skier a random xv (left, center, or right) every 1 sec
			if (!otherSkier.isCrashed) {
				let now = this.game.util.timestamp();
				if (now - otherSkier.timestamp >= 1000) {
					let newXV = this.game.util.randomInt(0, 3);
					switch (newXV) {
					case 0:
						otherSkier.xv = -otherSkier.xSpeed;
						otherSkier.img = this.otherSkier1;
						break;
					case 1:
						otherSkier.xv = otherSkier.xSpeed;
						otherSkier.img = this.otherSkier2;
						break;
					default:
						otherSkier.xv = 0;
						otherSkier.img = this.otherSkier3;
						break;
					}
					otherSkier.timestamp = now;
					otherSkier.yv = 0.1;
				}
			
				// if the other skier hits another npc, crash them both
				for (let j = 0; j < this.otherSkiers.length; j++) {
					if (i != j) {
						let otherOtherSkier = this.otherSkiers[j];
						if (this.isGameObjectCollidingWithNPC(otherSkier, otherOtherSkier)) {
							this.crashOtherSkierOnCollision(otherSkier);
							this.crashOtherSkierOnCollision(otherOtherSkier);
						}
					}
				}
				for (let j = 0; j < this.snowboarders.length; j++) {
					let snowboarder = this.snowboarders[j];
					if (this.isGameObjectCollidingWithNPC(otherSkier, snowboarder)) {
						this.crashOtherSkierOnCollision(otherSkier);
						this.crashSnowboarderOnCollision(snowboarder);
					}
				}

			// recycle the other skier's position if they are crashed and have been passed
			} else if (this.game.hasGameObjectBeenPassed(otherSkier)) {
				this.recycleNPCPosition(otherSkier);
			}
			
			// if the other skier hits the skier, crash them both
			if (!otherSkier.hasCollided && this.game.isGameObjectCollidingWithSkier(otherSkier) && this.game.skier.jumpOffset < 29) {
				this.game.skier.isCrashed = true;
				this.game.recordAndResetStyle();
				otherSkier.hasCollided = true;
				this.crashOtherSkierOnCollision(otherSkier);
			}
			
			// if the other skier (crashed or not) is far enough away, recyle its position
			if (otherSkier.y < -2000 || otherSkier.y > 5000 || otherSkier.x > 3000 || otherSkier.x < -3000) {
				this.recycleNPCPosition(otherSkier);
			}

			// update position
			otherSkier.x -= this.game.skier.xv * step - otherSkier.xv;
			otherSkier.y -= this.game.skier.yv * step - otherSkier.yv;
		}
	}

	updateSnowboarders(step) {
		for (let i = 0; i < this.snowboarders.length; i++) {
			let snowboarder = this.snowboarders[i];

			// give the snowboarder a random xv (left, center, or right) every 0.5 sec
			if (!snowboarder.isCrashed) {
				let now = this.game.util.timestamp();
				if (now - snowboarder.timestamp >= 500) {
					let newXV = this.game.util.randomInt(0, 2);
					switch (newXV) {
					case 0:
						snowboarder.xv = -snowboarder.xSpeed;
						snowboarder.img = this.snowboarder_left;
						break;
					case 1:
						snowboarder.xv = snowboarder.xSpeed;
						snowboarder.img = this.snowboarder_right;
						break;
					}
					snowboarder.timestamp = now;
					snowboarder.yv = 0.75;
				}

				// if the snowboarder another npc, crash them both
				for (let j = 0; j < this.snowboarders.length; j++) {
					if (i != j) {
						let otherSnowboarder = this.snowboarders[j];
						if (this.isGameObjectCollidingWithNPC(snowboarder, otherSnowboarder)) {
							this.crashSnowboarderOnCollision(snowboarder);
							this.crashSnowboarderOnCollision(otherSnowboarder);
						}
					}
				}
				for (let j = 0; j < this.otherSkiers.length; j++) {
					let otherSkier = this.otherSkiers[j];
					if (this.isGameObjectCollidingWithNPC(snowboarder, otherSkier)) {
						this.crashSnowboarderOnCollision(snowboarder);
						this.crashOtherSkierOnCollision(otherSkier);
					}
				}

			} else {
				// recover from crash after 1 sec
				if (this.game.util.timestamp() - snowboarder.crashTimestamp >= snowboarder.recoveryTime) {
					snowboarder.y += 30;
					snowboarder.isCrashed = false;
					snowboarder.hasCollided = false;
				}
			}

			// if the snowboarder hits the skier, crash them both
			if (!snowboarder.hasCollided && this.game.isGameObjectCollidingWithSkier(snowboarder) && this.game.skier.jumpOffset < 30) {
				this.game.skier.isCrashed = true;
				this.game.recordAndResetStyle();
				snowboarder.hasCollided = true;
				this.crashSnowboarderOnCollision(snowboarder);
			}

			// if the snowboarder (crashed or not) is far enough away, recyle its position
			if (snowboarder.y < -2000 || snowboarder.y > 5000 || snowboarder.x > 3000 || snowboarder.x < -3000) {
				this.recycleNPCPosition(snowboarder);
			}
			
			snowboarder.x -= this.game.skier.xv * step - snowboarder.xv;
			snowboarder.y -= this.game.skier.yv * step - snowboarder.yv;
		}
	}

	updateDogs(step) {
		let now = this.game.util.timestamp();

		// spawn new dog if below max count and enough time has passed
		if (this.dogs.length < this.maxDogCount && now - this.timeLastDogDeleted > this.timeUntilSpawnNewDog) {
			this.spawnNewDog();
		}

		for (let i = 0; i < this.dogs.length; i++) {
			let dog = this.dogs[i];

			// delete dog if out of bounds
			if (dog.y < -window.innerHeight / 3 - 80 || dog.x > window.innerWidth / 2 + 1000) {
				this.dogs.splice(i, 1);
				this.timeLastDogDeleted = now;
				this.timeUntilSpawnNewDog = this.game.util.randomInt(5000, 15000);
				return;
			}

			// change dog image every 50ms
			if (now - dog.timestamp >= 50) {
				if (dog.isCrashed) {
					dog.xv = 0, dog.yv = 0;
					dog.img = dog.img == this.dog_woof1 ? this.dog_woof2 : this.dog_woof1;
					if (now - dog.crashTimestamp > 2000) {
						dog.isCrashed = false;
					}
				} else {
					dog.img = dog.img == this.dog1 ? this.dog2 : this.dog1;
					let newYV = this.game.util.randomInt(0, 3);
					switch (newYV) {
					case 0:
						dog.yv = -0.05;
						break;
					case 1:
						dog.yv = 0.05;
						break;
					default:
						dog.yv = 0;
						break;
					}
					dog.xv = 0.3;

					if (this.game.isGameObjectCollidingWithSkier(dog)) {
						this.crashDogOnCollision(dog);
					}
				}

				dog.timestamp = now;
			}
			
			dog.x -= this.game.skier.xv * step - dog.xv;
			dog.y -= this.game.skier.yv * step - dog.yv;
		}
	}

	// determine if the game object is colliding with an other skier
	isGameObjectCollidingWithNPC(otherSkier, object) {
		if (!this.game.collisionsEnabled) return false;
		let rect1 = { x: otherSkier.x + otherSkier.hbXOffset, y: otherSkier.y + otherSkier.hbYOffset, width: otherSkier.hbWidth, height: otherSkier.hbHeight };
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };
		return this.game.util.areRectanglesColliding(rect1, rect2);
	}

	// make the other skier crash
	crashOtherSkierOnCollision(otherSkier) {
		if (!otherSkier.isCrashed) {
			otherSkier.isCrashed = true;
			otherSkier.xv = 0;
			otherSkier.yv = 0;
			otherSkier.img = this.otherSkier_crash;
		}
	}

	// make the snowboarder crash
	crashSnowboarderOnCollision(snowboarder) {
		if (!snowboarder.isCrashed) {
			snowboarder.isCrashed = true;
			snowboarder.crashTimestamp = this.game.util.timestamp();
			snowboarder.recoveryTime = this.game.util.randomInt(1000, 2001);
			snowboarder.xv = 0;
			snowboarder.yv = 0;
			snowboarder.img = this.snowboarder_crash;
		}
	}

	// make the dog crash
	crashDogOnCollision(dog) {
		if (!dog.isCrashed && !dog.hasCollided) {
			dog.isCrashed = true;
			dog.hasCollided = true;
			dog.crashTimestamp = this.game.util.timestamp();
		}
	}

	recycleNPCPosition(npc) {
		npc.isCrashed = false;
		npc.hasCollided = false;
		let xy = this.getRandomNPCCoordinateOffScreen();
		npc.x = xy.x;
		npc.y = xy.y;
	}

	getRandomNPCCoordinateOffScreen() {
		let rand = this.game.util.randomInt(0, 3);
		switch (rand) {
		case 0:
			// offscreen up
			return { x: this.game.util.randomInt(-window.innerWidth / 2, window.innerWidth / 2), y: -window.innerHeight / 3 - 40 };
		default:
			// offscreen left, right, or down
			return this.game.getRandomCoordinateOffScreen();
		}
	}

	draw(ctx) {
		this.drawOtherSkiers(ctx);
		this.drawSnowboarders(ctx);
		this.drawDogs(ctx);
	}

	drawOtherSkiers(ctx) {
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];
			ctx.drawImage(otherSkier.img, this.game.skier.x + otherSkier.x, this.game.skier.y + otherSkier.y);
		}
	}

	drawSnowboarders(ctx) {
		for (let i = 0; i < this.snowboarders.length; i++) {
			let snowboarder = this.snowboarders[i];
			ctx.drawImage(snowboarder.img, this.game.skier.x + snowboarder.x, this.game.skier.y + snowboarder.y);
		}
	}

	drawDogs(ctx) {
		for (let dog of this.dogs) {
			ctx.drawImage(dog.img, Math.floor(this.game.skier.x + dog.x), Math.floor(this.game.skier.y + dog.y));
		}
	}
}