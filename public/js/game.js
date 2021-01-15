/* eslint-disable no-undef */
import Lift from './lift.js';
import Skier from './skier.js';
import Util from './util.js';
//import Collidable from './collidable.js';

export default class Game {
	constructor() {
		this.util = new Util();
		this.skier = new Skier(this);
		this.lift = new Lift(this);
		this.treeDensity = 0.8;
		this.bumpDensity = 0.5;
		this.rockDensity = 0.05;
		this.stumpDensity = 0.05;
		this.jumpDensity = 0.05;
		this.jumpVBase = 0.7;
		this.jumpVMult = 0.0022;
		this.resCoefficient = 50 / 562860.0;
		this.collisionsEnabled = true;
		this.loadImages();
		this.loadFont();
		this.init();
	}

	// initialize game settings and generate game objects for start of game
	init() {
		this.isPaused = false;
		this.yDist = 0;
		this.style = 0;
		this.mousePos = {x: 0, y: 0};
		this.startTime = this.util.timestamp();
		this.currentTime = this.startTime;
		this.timestamp1 = this.startTime;
		this.lastLogTime = null;
		this.gameWidth = window.innerWidth;
		this.gameHeight = window.innerHeight;
		this.skierTrail = [];
		this.calculateGameObjectCounts();

		// spawn game objects on and around the game screen for start of game
		this.trees = this.initializeGameObjectsAtStart('tree_small', this.treeCount);
		this.bumps = this.initializeGameObjectsAtStart('bump_group', this.bumpCount);
		this.rocks = this.initializeGameObjectsAtStart('rock', this.rockCount);
		this.jumps = this.initializeGameObjectsAtStart('jump', this.jumpCount);
		this.stumps = this.initializeGameObjectsAtStart('stump', this.stumpCount);
	}

	// restart the game
	restart() {
		this.init();
		this.skier.init();
		this.lift.init();
	}

	// load game assets
	loadImages() {
		this.tree_small = this.util.loadImage('/img/tree_small.png');
		this.tree_large = this.util.loadImage('/img/tree_large.png');
		this.tree_bare = this.util.loadImage('/img/tree_bare.png');
		this.tree_bare_fire1 = this.util.loadImage('/img/tree_bare_fire1.png');
		this.tree_bare_fire2 = this.util.loadImage('/img/tree_bare_fire2.png');
		this.lodge = this.util.loadImage('/img/lodge.png');
		this.bump_small = this.util.loadImage('/img/bump_small.png');
		this.bump_large = this.util.loadImage('/img/bump_large.png');
		this.bump_group = this.util.loadImage('/img/bump_group.png');
		this.rock = this.util.loadImage('/img/rock.png');
		this.stump = this.util.loadImage('/img/stump.png');
		this.jump = this.util.loadImage('/img/jump.png');
	}

	// load the font family used for the in-game hud
	loadFont() {
		this.font = new FontFace('ModernDOS', 'url(../font/ModernDOS8x16.ttf)');
		this.font.load().then(function (loaded_face) {
			document.fonts.add(loaded_face);
			document.body.style.fontFamily = '"ModernDOS", Arial';
		}).catch(function (error) {
			console.log('Error loading ModernDOS font: ', error);
		});
	}

	// spawn the specified number of the specified type of game object on and around the screen at start of game
	initializeGameObjectsAtStart(type, count) {
		let gameObjects = [];
		for (let n = 0; n < count; n++) {
			let x = this.util.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
			let y = this.util.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

			gameObjects.push(this.spawnNewGameObject(type, x, y));
		}
		return gameObjects;
	}

	// spawn a new object of the given type in a random location offscreen
	spawnNewGameObjectOffScreen(type) {
		let xy = this.getRandomCoordinateOffScreen();
		return this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// get an x/y coordinate pair for a location nearby offscreen
	getRandomCoordinateOffScreen() {
		let x = this.util.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
		let y = this.util.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

		// if coordinate would be onscreen, spawn it nearby offscreen instead
		if (x > -this.gameWidth / 2 - 50 && x < this.gameWidth / 2 &&
			y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3) {
			switch (this.util.randomInt(0, 5)) {
			case 0:
				x -= (this.gameWidth + 50);
				break;
			case 1:
				x -= this.gameWidth;
				y += this.gameHeight;
				break;
			case 2:
				y += this.gameHeight;
				break;
			case 3:
				x += this.gameWidth;
				y += this.gameHeight;
				break;
			default:
				x += this.gameWidth;
			}
		}
		return {x: x, y: y};
	}

	// spawn a new game object of specified type at the specified coordinates
	spawnNewGameObject(type, x, y) {
		switch (type) {
		case 'bump_group':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 64, hbHeight: 32, onCollision: this.slowOnCollision, img: this.bump_group };
		case 'tree_small':
			return { game: this, x: x, y: y, hbXOffset: 6, hbYOffset: 24, hbWidth: 16, hbHeight: 12, hasCollided: false, onCollision: this.crashOnCollision, img: this.tree_small };
		case 'rock':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 23, hbHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, img: this.rock };
		case 'jump':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 32, hbHeight: 8, hasCollided: false, onCollision: this.jumpOnCollision, img: this.jump };
		case 'stump':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, img: this.stump };
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

	calculateGameObjectCounts() {
		let area = this.gameWidth * this.gameHeight;

		// number of game objects is proportional to total game screen area
		this.treeCount = Math.floor(area * this.resCoefficient * this.treeDensity);
		this.bumpCount = Math.floor(area * this.resCoefficient * this.bumpDensity);
		this.rockCount = Math.floor(area * this.resCoefficient * this.rockDensity);
		this.jumpCount = Math.floor(area * this.resCoefficient * this.jumpDensity);
		this.stumpCount = Math.floor(area * this.resCoefficient * this.stumpDensity);
	}

	// trim or add new game objects proportionally to the size of the window
	adaptGameObjectCountToScreenSize() {
		this.calculateGameObjectCounts();
		this.correctGameObjectCount(this.trees, this.treeCount, 'tree_small');
		this.correctGameObjectCount(this.bumps, this.bumpCount, 'bump_group');
		this.correctGameObjectCount(this.rocks, this.rockCount, 'rock');
		this.correctGameObjectCount(this.jumps, this.jumpCount, 'jump');
		this.correctGameObjectCount(this.stumps, this.stumpCount, 'stump');
	}

	// trim or add new game objects until desired count matches actual
	correctGameObjectCount(gameObjects, desiredCount, type) {
		let diff = Math.abs(gameObjects.length - desiredCount);

		// trim excess offscreen objects
		if (gameObjects.length > desiredCount) {
			for (let i = 0; i < gameObjects.length; i++) {
				let trimmedCount = 0;
				let x = gameObjects[i].x;
				let y = gameObjects[i].y;

				// remove the object if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 &&
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
					gameObjects.splice(i, 1);
					trimmedCount++;
				}

				if (trimmedCount >= diff) {
					break;
				}
			}
		// add new objects offscreen
		} else if (gameObjects.length < desiredCount) {
			for (let n = 0; n < diff; n++) {
				gameObjects.push(this.spawnNewGameObjectOffScreen(type));
			}
		}
	}

	// update the gamestate
	update(step) {
		this.currentTime = this.util.timestamp();
		this.skier.update(this.getMouseAndVelocityInfo());
		this.lift.update(step);

		this.recycleGameObjects(this.bumps);
		this.recycleGameObjectsAndCheckForCollisions(this.trees);
		this.recycleGameObjectsAndCheckForCollisions(this.rocks);
		this.recycleGameObjectsAndCheckForCollisions(this.jumps);
		this.recycleGameObjectsAndCheckForCollisions(this.stumps);
		
		// update position of game objects based on x/y-velocity of skier
		this.updatePosition(this.trees, step);
		this.updatePosition(this.bumps, step);
		this.updatePosition(this.rocks, step);
		this.updatePosition(this.jumps, step);
		this.updatePosition(this.stumps, step);

		for (let i = 0; i < this.skierTrail.length; i++) {
			this.skierTrail[i][0] -= this.skier.xv * step;
			this.skierTrail[i][1] -= this.skier.yv * step;
		}

		// delete offscreen skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			if (this.skierTrail[i][1] < -this.gameHeight / 3 - 50) {
				this.skierTrail.splice(i, 1);
			}
		}

		// update total distance traveled vertically
		this.yDist += this.skier.yv * step;

		// flip the tree-on-fire image back and forth to create flicker effect
		let now = this.util.timestamp();
		if (now - this.timestamp1 >= 50) {
			if (this.currentTreeFireImg == this.tree_bare_fire1) {
				this.currentTreeFireImg = this.tree_bare_fire2;
			} else {
				this.currentTreeFireImg = this.tree_bare_fire1;
			}
			this.timestamp1 = now;
		}
	}

	// update position of game objects
	updatePosition(gameObjectList, step) {
		for (let i = 0; i < gameObjectList.length; i++) {
			gameObjectList[i].x -= this.skier.xv * step;
			gameObjectList[i].y -= this.skier.yv * step;
		}
	}
	// recycle uphill offscreen game objects once they are passed
	recycleGameObjects(gameObjects) {
		
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObjectPosition(object);
			}
		}
	}

	// recycle uphill offscreen game objects once they are passed, and also check if any are colliding with the skier
	recycleGameObjectsAndCheckForCollisions(gameObjects) {
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];

			// recycle uphill offscreen game objects once they are passed
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObjectPosition(gameObjects[i]);
			}
			// if the skier hits an object they haven't hit already, mark it as hit and 
			else if (this.isGameObjectCollidingWithSkier(object) && this.skier.jumpOffset < object.hbHeight) {
				if (this.collisionsEnabled && !object.hasCollided) {
					gameObjects[i].hasCollided = true;
					if (object.onCollision) {
						object.onCollision();
					}
				}
			}
		}
	}

	// update the x/y coordinate of the given game object to a random offscreen coordinate downhill
	recycleGameObjectPosition(gameObject) {
		let xy = this.getRandomCoordinateOffScreen();
		gameObject.x = xy.x;
		gameObject.y = xy.y;
		gameObject.hasCollided = false;
	}

	// return true if the given game object is offscreen uphill or is far enough away horizontally
	hasGameObjectBeenPassed(object) {
		return object.y < -this.gameHeight / 3 - 50 ||
				object.x < -this.gameWidth * 3 / 2 ||
				object.x > this.gameWidth * 3 / 2;
	}

	// determine if the game object with the provided rectangular dimensions is colliding with the skier
	isGameObjectCollidingWithSkier(object) {
		let rect1 = this.skier.hitbox;
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };

		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// make the skier crash
	crashOnCollision() {
		this.game.skier.isCrashed = true;
		this.game.style -= 32;
	}

	// make the skier jump
	jumpOnCollision() {
		let jumpV = this.game.skier.yv * this.game.jumpVMult + this.game.jumpVBase;
		this.game.skier.jumpV = jumpV;
		this.game.skier.isJumping = true;
		this.game.style += jumpV * 25;
	}

	// make the skier slow down
	slowOnCollision() {
		undefined;
	}

	// return info about the instantaneous skier-to-mouse angle and velocity vectors
	getMouseAndVelocityInfo() {
		let mouseDiffX = -(this.mousePos.x - ((this.gameWidth / 2) + 8));
		let mouseDiffY = -(this.mousePos.y - ((this.gameHeight / 3) + 32));
		let mouseAtanDegrees = this.util.degrees(Math.atan(mouseDiffY / mouseDiffX));
		let mouseAngle = 0, mouseDiffXVector = 0, mouseDiffYVector = 0;

		if (mouseDiffX > 0) {
			mouseAngle = mouseAtanDegrees;
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX < 0) {
			if (mouseDiffY > 0) {
				mouseAngle = 180 + mouseAtanDegrees;
			} else if (mouseDiffY < 0) {
				mouseAngle = -180 + mouseAtanDegrees;
			}
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX == 0) {
			if (mouseDiffY > 0) {
				mouseAngle = -90;
			} else {
				mouseAngle = 90;
			}
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffY == 0) {
			mouseAngle = 180;
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		}

		let vAtanDegrees = this.util.degrees(Math.atan(this.skier.yv / this.skier.xv));
		let vAngle = 0, xvVector = 0, yvVector = 0;

		if (this.skier.xv > 0) {
			vAngle = vAtanDegrees;
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv < 0) {
			if (this.skier.yv > 0) {
				vAngle = 180 + vAtanDegrees;
			} else if (this.skier.yv < 0) {
				vAngle = -180 + vAtanDegrees;
			}
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv == 0) {
			if (this.skier.yv > 0) {
				vAngle = -90;
			} else {
				vAngle = 90;
			}
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		} else if (this.skier.yv == 0) {
			vAngle = 180;
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		}

		return [mouseAngle, [mouseDiffXVector, mouseDiffYVector], [xvVector, yvVector]];
	}

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

		// draw bumps
		for (let i = 0; i < this.bumps.length; i++) {
			ctx.drawImage(this.bumps[i].img, this.skier.x + this.bumps[i].x, this.skier.y + this.bumps[i].y);
		}

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = '#DDDDDD';
			ctx.fillRect(this.skier.x + this.skierTrail[i][0], this.skier.y + this.skierTrail[i][1], 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i][0] + 8, this.skier.y + this.skierTrail[i][1], 2, 1);
		}

		// draw jumps
		for (let i = 0; i < this.jumps.length; i++) {
			ctx.drawImage(this.jumps[i].img, this.skier.x + this.jumps[i].x, this.skier.y + this.jumps[i].y);
		}

		// draw rocks
		for (let i = 0; i < this.rocks.length; i++) {
			ctx.drawImage(this.rocks[i].img, this.skier.x + this.rocks[i].x, this.skier.y + this.rocks[i].y);
		}

		// draw stumps
		for (let i = 0; i < this.stumps.length; i++) {
			ctx.drawImage(this.stumps[i].img, this.skier.x + this.stumps[i].x, this.skier.y + this.stumps[i].y);
			//this.stumps[i].draw(ctx);
		}

		// draw trees above skier
		for (let i = 0; i < this.trees.length; i++) {
			let yThreshold = -2;
			if (this.trees[i].y < yThreshold) {
				ctx.drawImage(this.trees[i].img, this.skier.x + this.trees[i].x, this.skier.y + this.trees[i].y);
			}
		}

		// draw lift towers above skier
		this.lift.drawTowersAbovePlayer(ctx);

		// draw skier
		this.skier.draw(ctx);

		// draw trees below skier
		for (let i = 0; i < this.trees.length; i++) {
			let yThreshold = -2;
			if (this.trees[i].y >= yThreshold) {
				ctx.drawImage(this.trees[i].img, this.skier.x + this.trees[i].x, this.skier.y + this.trees[i].y);
			}
		}

		// draw lift chairs
		this.lift.drawChairs(ctx);

		// draw lift cables
		this.lift.drawCables(ctx);

		// draw lift towers below skier
		this.lift.drawTowersBelowPlayer(ctx);
		this.lift.drawTowerTops(ctx);

		// draw hud (140x52 black border 1px)
		ctx.fillStyle = '#000000';
		ctx.fillRect(this.gameWidth - 140, 0, 140, 52);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(this.gameWidth - 139, 0, 139, 51);
		ctx.font = '14px ModernDOS';
		ctx.fillStyle = '#000000';
		ctx.fillText('Time:  ' + this.util.timeToString(this.currentTime - this.startTime), this.gameWidth - 136, 10);

		let leadingSpace = '     ';
		let dist = Math.ceil(this.yDist / 28.7514);
		if (dist > 999999) {
			leadingSpace = '';
		} else if (dist > 99999) {
			leadingSpace = ' ';
		} else if (dist > 9999) {
			leadingSpace = '  ';
		} else if (dist > 999) {
			leadingSpace = '   ';
		} else if (dist > 99) {
			leadingSpace = '    ';
		}

		ctx.fillText('Dist:' + leadingSpace + dist.toString().padStart(2, '0') + 'm', this.gameWidth - 136, 22);
		ctx.fillText('Speed:    ' + Math.ceil(this.skier.currentSpeed / 28.7514).toString().padStart(2, '0') + 'm/s', this.gameWidth - 136, 34);
		ctx.fillText('Style:       ' + Math.floor(this.style), this.gameWidth - 136, 46);
	}
}