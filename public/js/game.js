/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */
import Lift from './lift.js';
import Skier from './skier.js';
import User from './user.js';
import Util from './util.js';
import socket from './socket.js';

export default class Game {
	constructor() {
		this.util = new Util();
		this.user = new User(this);
		this.skier = new Skier(this);
		this.lift = new Lift(this);
		this.resCoefficient = 1 / 18000;
		this.objectFreq = {
			treeSmallFreq: [24, 'tree_small'],
			treeLargeFreq: [12, 'tree_large'],
			treeBareFreq: [12, 'tree_bare'],
			bumpGroupFreq: [12, 'bump_group'],
			bumpSmallFreq: [12, 'bump_small'],
			bumpLargeFreq: [12, 'bump_large'],
			rockFreq: [4, 'rock'],
			stumpFreq: [4, 'stump'],
			jumpFreq: [4, 'jump']
		};
		this.otherSkierFreq = 0.00;
		this.snowboarderFreq = 0.00;
		this.jumpVBase = 0.7;
		this.jumpVMult = 0.0022;
		this.collisionsEnabled = true;
		this.doImageLoadCheck = true;
		this.hideHUD = false;
		this.hideControls = true;
		this.images = [];
		this.scoreToSend = 0;
		this.gamePausedText = document.getElementById('game-paused-text');
		this.gameInfo = document.getElementById('game-info');
		this.gameInfoBtn = document.getElementById('game-info-btn');
		this.gameInfoBtn.owner = this;
		this.gameInfoBtn.onclick = this.gameInfoBtnClickHandler;
		this.gameInfoTime = document.getElementById('game-info-time');
		this.gameInfoDist = document.getElementById('game-info-dist');
		this.gameInfoSpeed = document.getElementById('game-info-speed');
		this.gameInfoStyle = document.getElementById('game-info-style');
		this.offlineInd = document.getElementById('offline-ind');
		navigator.onLine ? this.goOnline() : this.goOffline();
		this.loadAssets();
		this.init();
	}

	// initialize game settings and generate game objects for start of game
	init() {
		this.gameWidth = Math.max(screen.width, window.innerWidth);
		this.gameHeight = Math.max(screen.height, window.innerHeight);
		this.skier.init();
		this.lift.init();
		this.isPaused = false;
		this.yDist = 0;
		this.style = 0;
		this.mousePos = {x: 0, y: 0};
		this.startTime = this.util.timestamp();
		this.timestampFire = this.startTime;
		this.skierTrail = [];
		this.currentTreeFireImg = this.tree_bare_fire1;
		this.stylePointsToAwardOnLanding = 0;
	}

	// load game assets
	loadAssets() {
		this.tree_small = this.util.loadImage('/img/tree_small.png', this);
		this.tree_large = this.util.loadImage('/img/tree_large.png', this);
		this.tree_bare = this.util.loadImage('/img/tree_bare.png', this);
		this.tree_bare_fire1 = this.util.loadImage('/img/tree_bare_fire1.png', this);
		this.tree_bare_fire2 = this.util.loadImage('/img/tree_bare_fire2.png', this);
		this.bump_small = this.util.loadImage('/img/bump_small.png', this);
		this.bump_large = this.util.loadImage('/img/bump_large.png', this);
		this.bump_group = this.util.loadImage('/img/bump_group.png', this);
		this.rock = this.util.loadImage('/img/rock.png', this);
		this.stump = this.util.loadImage('/img/stump.png', this);
		this.jump = this.util.loadImage('/img/jump.png', this);
		this.otherSkier1 = this.util.loadImage('/img/other_skier1.png', this);
		this.otherSkier2 = this.util.loadImage('/img/other_skier2.png', this);
		this.otherSkier3 = this.util.loadImage('/img/other_skier3.png', this);
		this.otherSkier_crash = this.util.loadImage('/img/other_skier_crash.png', this);
		this.snowboarder_left = this.util.loadImage('/img/snowboarder_left.png', this);
		this.snowboarder_right = this.util.loadImage('/img/snowboarder_right.png', this);
		this.snowboarder_crash = this.util.loadImage('/img/snowboarder_crash.png', this);
		this.offlineImg = this.util.loadImage('/img/offline.png', this);

		this.loadFont();
		this.user.loadAssets();
		this.skier.loadAssets();
		this.lift.loadAssets();
		this.images = this.images.concat(this.user.images, this.skier.images, this.lift.images);
	}

	// load the font family used for the game hud
	loadFont() {
		this.font = new FontFace('ModernDOS', 'url(../font/ModernDOS8x16.ttf)');
		this.font.load().then(function (loaded_face) {
			document.fonts.add(loaded_face);
			document.body.style.fontFamily = '"ModernDOS", Arial';
		}).catch(function (error) {
			console.log('Error loading ModernDOS font: ', error);
		});
	}

	// adapt game to the size of the window
	resizeCanvas(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.setUpGameObjectsOnScreen();
	}

	// initialize game objects on screen at start of game
	setUpGameObjectsOnScreen() {
		this.treesSmall = [];
		this.treesLarge = [];
		this.treesBare = [];
		this.bumpsGroup = [];
		this.bumpsSmall = [];
		this.bumpsLarge = [];
		this.rocks = [];
		this.jumps = [];
		this.stumps = [];
		this.otherSkiers = [];
		this.snowboarders = [];

		this.calculateGameObjectCount();
		for (let n = 0; n < this.gameObjectCount; n++) {
			let type = this.getRandomGameObjectType();
			this.spawnNewGameObjectOnScreen(type);
		}
	}

	// determine the total number of game objects proportional to game window area
	calculateGameObjectCount() {
		let area = window.innerWidth * window.innerHeight;
		this.gameObjectCount = Math.floor(area * this.resCoefficient);
		console.log('game object count: ' + this.gameObjectCount);
	}

	// create array to manage the weighted frequencies of the different game object types
	createGameObjectFreqArray() {
		this.objectFreqArray = [];
		for (let key in this.objectFreq) {
			if (this.objectFreq.hasOwnProperty(key)) {
				let count = this.objectFreq[key][0];
				for (let n = 0; n < count; n++) {
					this.objectFreqArray.push(this.objectFreq[key][1]);
				}
			}
		}
	}

	// return a random game object type, weighted based on the frequency value for each type
	getRandomGameObjectType() {
		if (!this.objectFreqArray) {
			this.createGameObjectFreqArray();
		}
		let i = this.util.randomInt(0, this.objectFreqArray.length);
		return this.objectFreqArray[i];
	}

	spawnNewGameObjectOnScreen(type) {
		let xy = this.getRandomCoordinateOnScreen();
		return this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// determine whether or not a game object is occupying the specified location
	isLocationOccupiedByGameObject(xy, getDistanceBetweenPointsFunc) {
		let gameObjectsListsToCheck = [[{ x: 0, y: 0 }], this.treesSmall, this.treesLarge, this.treesBare, this.rocks, this.jumps, this.stumps, this.lift.liftTowers];
		for (let i = 0; i < gameObjectsListsToCheck.length; i++) {
			let gameObjectList = gameObjectsListsToCheck[i];
			if (locationOccupiedHelper(gameObjectList)) return true;
		}
		return false;

		function locationOccupiedHelper(gameObjectList) {
			let minSpaceBetween = 80;
			for (let i = 0; i < gameObjectList.length; i++) {
				let obj = gameObjectList[i];
				let dist = getDistanceBetweenPointsFunc(xy.x, xy.y, obj.x, obj.y);
				if (dist < minSpaceBetween) return true;
			}
			return false;
		}
	}

	getRandomCoordinateOnScreen() {
		let space = 80, width = window.innerWidth, height = this.gameHeight;
		let searching = true, attempts = 0, maxAttempts = 10, xy;

		while (searching && attempts < maxAttempts) {
			xy = getCoordinateHelper(this.util.randomInt);
			if (!this.isLocationOccupiedByGameObject(xy, this.util.getDistanceBetweenPoints)) {
				searching = false;
				break;
			} else {
				attempts++;
			}
		}
		return xy;

		function getCoordinateHelper(randomIntFunc) {
			return { x: randomIntFunc(-width * 3 / 4, width * 3 / 4), y: randomIntFunc(-height / 3 - space, height) };
		}
	}

	// get an x/y coordinate pair for a location nearby offscreen
	getRandomCoordinateOffScreen() {
		let space = 80, width = window.innerWidth, height = this.gameHeight;
		let searching = true, attempts = 0, maxAttempts = 10, xy;

		while (searching && attempts < maxAttempts) {
			xy = getCoordinateHelper(this.util.randomInt);
			if (!this.isLocationOccupiedByGameObject(xy, this.util.getDistanceBetweenPoints)) {
				searching = false;
				break;
			} else {
				attempts++;
			}
		}

		return xy;

		function getCoordinateHelper(randomIntFunc) {
			switch (randomIntFunc(0, 3)) {
			case 0:
				// offscreen left
				return { x: randomIntFunc(-width * 3 / 4, -width / 2 - space), y: randomIntFunc(-height / 3 - space, height * 2 / 3) };
			case 1:
				// offscreen right
				return { x: randomIntFunc(width / 2, width * 3 / 4), y: randomIntFunc(-height / 3 - space, height * 2 / 3) };
			default:
				// offscreen down
				return { x: randomIntFunc(-width * 3 / 4, width * 3 / 4), y: randomIntFunc(height * 2 / 3, height) };
			}
		}
	}

	// spawn a new game object of specified type at the specified coordinates
	spawnNewGameObject(type, x, y) {
		let newObj;
		switch (type) {
		case 'bump_group':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 64, hbHeight: 32, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_group };
			this.bumpsGroup.push(newObj);
			break;
		case 'bump_small':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 4, jumpOverHeight: 4, onCollision: this.slowOnCollision, img: this.bump_small };
			this.bumpsSmall.push(newObj);
			break;
		case 'bump_large':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 24, hbHeight: 8, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_large };
			this.bumpsLarge.push(newObj);
			break;
		case 'tree_small':
			newObj = { game: this, x: x, y: y, hbXOffset: 8, hbYOffset: 22, hbWidth: 14, hbHeight: 10, jumpOverHeight: 32, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_small, drawThresholdY: -5 };
			this.treesSmall.push(newObj);
			break;
		case 'tree_large':
			newObj = { game: this, x: x, y: y, hbXOffset: 9, hbYOffset: 52, hbWidth: 15, hbHeight: 12, jumpOverHeight: 64, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_large, drawThresholdY: -37 };
			this.treesLarge.push(newObj);
			break;
		case 'tree_bare':
			newObj = { game: this, x: x, y: y, hbXOffset: 7, hbYOffset: 18, hbWidth: 9, hbHeight: 9, jumpOverHeight: 27, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_bare, drawThresholdY: 1 , isOnFire: false};
			this.treesBare.push(newObj);
			break;
		case 'rock':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 23, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.rock };
			this.rocks.push(newObj);
			break;
		case 'jump':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 32, hbHeight: 8, jumpOverHeight: 8, hasCollided: false, onCollision: this.jumpOnCollision, img: this.jump };
			this.jumps.push(newObj);
			break;
		case 'stump':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.stump };
			this.stumps.push(newObj);
			break;
		case 'other_skier':
			return { x: x, y: y, xv: 0, yv: 0.1, xSpeed: 0.15, hbXOffset: 7, hbYOffset: 13, hbWidth: 11, hbHeight: 11, hasCollided: false, isCrashed: false, timestamp: this.startTime + this.util.randomInt(0, 1000), img: this.otherSkier3 };
		case 'snowboarder':
			return { x: x, y: y, xv: -0.25, yv: 0.75, xSpeed: 0.15, hbXOffset: 7, hbYOffset: 16, hbWidth: 13, hbHeight: 9, hasCollided: false, isCrashed: false, timestamp: this.startTime + this.util.randomInt(0, 1000), img: this.snowboarder_left };
		default:
			console.log('Invalid game object type: ' + type);
		}
		return newObj;
	}

	// update the gamestate
	update(now, step) {
		if (this.isPaused) return;
		this.currentTime = now;
		this.skier.update(this.getMouseAndVelocityInfo());
		this.lift.update(step);
		this.updateOtherSkiers(step);
		this.updateSnowboarders(step);
		this.updateSkierTrail(step);

		this.updateGameObjects(this.bumpsGroup, step);
		this.updateGameObjects(this.bumpsSmall, step);
		this.updateGameObjects(this.bumpsLarge, step);
		this.updateGameObjects(this.treesSmall, step);
		this.updateGameObjects(this.treesLarge, step);
		this.updateGameObjects(this.treesBare, step);
		this.updateGameObjects(this.rocks, step);
		this.updateGameObjects(this.jumps, step);
		this.updateGameObjects(this.stumps, step);

		// update total distance traveled vertically
		this.yDist += this.skier.yv * step;

		// flip the tree-on-fire image back and forth to create flicker effect
		if (now - this.timestampFire >= 50) {
			if (this.currentTreeFireImg == this.tree_bare_fire1) {
				this.currentTreeFireImg = this.tree_bare_fire2;
			} else {
				this.currentTreeFireImg = this.tree_bare_fire1;
			}
			this.timestampFire = now;
		}
	}

	// recycle position of uphill offscreen game objects once they are passed, check if any are colliding with the skier or other skiers/snowboarders, and update position
	updateGameObjects(gameObjects, step) {
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];

			// recycle the position of uphill offscreen game objects once they are passed
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObject(gameObjects, i);
				
			}
			// if the skier hits an object they haven't hit already, mark it as hit and do collision action if applicable
			else if (this.collisionsEnabled && this.isGameObjectCollidingWithSkier(object) && this.skier.jumpOffset < object.jumpOverHeight) {
				if (typeof object.onCollision !== 'undefined') {
					if (typeof object.hasCollided !== 'undefined') {
						if (!object.hasCollided) {
							object.onCollision();
							object.hasCollided = true;
						}
					} else {
						object.onCollision();
					}
				}
			}

			// if an other skier hits an object...
			for (let i = 0; i < this.otherSkiers.length; i++) {
				let otherSkier = this.otherSkiers[i];
				if (this.collisionsEnabled && !otherSkier.isCrashed && this.isGameObjectCollidingWithOtherSkier(otherSkier, object)) {
					if (typeof object.npcCanCrashInto !== 'undefined' && object.npcCanCrashInto) {
						this.crashOtherSkierOnCollision(otherSkier);
					}
				}
			}

			// if a snowboarder hits an object...
			for (let i = 0; i < this.snowboarders.length; i++) {
				let snowboarder = this.snowboarders[i];
				if (this.collisionsEnabled && !snowboarder.isCrashed && this.isGameObjectCollidingWithOtherSkier(snowboarder, object)) {
					if (typeof object.npcCanCrashInto !== 'undefined' && object.npcCanCrashInto) {
						this.crashSnowboarderOnCollision(snowboarder);
					}
				}
			}
			
			// update position of game objects
			object.x -= this.skier.xv * step;
			object.y -= this.skier.yv * step;
		}
	}

	// update the trail behind the skier
	updateSkierTrail(step) {
		// add coordinate to skier trail
		if (!this.skier.isStopped && !this.skier.isJumping) {
			this.skierTrail.push({ x: 2, y: 24 });
		}
		
		for (let i = 0; i < this.skierTrail.length; i++) {
			// update position of skier trail coordinates
			this.skierTrail[i].x -= this.skier.xv * step;
			this.skierTrail[i].y -= this.skier.yv * step;

			// delete offscreen skier trail
			if (this.skierTrail[i].y < -window.innerHeight / 3) {
				this.skierTrail.splice(i, 1);
			}
		}
	}

	// delete the game object and spawn a new game object of random type off screen
	recycleGameObject(gameObjects, i) {
		gameObjects.splice(i, 1);
		let xy = this.getRandomCoordinateOffScreen();
		let type = this.getRandomGameObjectType();
		this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// return true if the given game object is offscreen uphill or is far enough away horizontally
	hasGameObjectBeenPassed(object) {
		let space = 80, width = window.innerWidth, height = window.innerHeight;
		return object.y < -height / 3 - space
			|| object.x < -width * 3 / 4
			|| object.x > width * 3 / 4;
	}

	// update image, velocity, and position of the other skiers
	updateOtherSkiers(step) {
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];

			// give the other skier a random xv (left, center, or right) every 1 sec
			if (!otherSkier.isCrashed) {
				let now = this.util.timestamp();
				if (now - otherSkier.timestamp >= 1000) {
					let newXV = this.util.randomInt(0, 3);
					switch(newXV){
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

				// if the other skier hits another other skier, crash them both
				for (let j = 0; j < this.otherSkiers.length; j++) {
					if (i != j) {
						let otherOtherSkier = this.otherSkiers[j];
						if (this.isGameObjectCollidingWithOtherSkier(otherSkier, otherOtherSkier)) {
							this.crashOtherSkierOnCollision(otherSkier);
							this.crashOtherSkierOnCollision(otherOtherSkier);
						}
					}
				}
			// recycle the other skier's position if they are crashed and have been passed
			} else if (this.hasGameObjectBeenPassed(otherSkier)) {
				otherSkier.isCrashed = false;
			}

			// if the other skier hits the skier, crash them both
			if (!otherSkier.hasCollided && this.isGameObjectCollidingWithSkier(otherSkier) && this.skier.jumpOffset < 29) {
				this.skier.isCrashed = true;
				otherSkier.hasCollided = true;
				this.crashOtherSkierOnCollision(otherSkier);
			}

			// if the other skier (crashed or not) is far enough away, recyle its position
			if (otherSkier.y < -2000 || otherSkier.y > 5000 || otherSkier.x > 3000 || otherSkier.x < -3000) {
				otherSkier.isCrashed = false;
			}
	
			// update position
			otherSkier.x -= this.skier.xv * step - otherSkier.xv;
			otherSkier.y -= this.skier.yv * step - otherSkier.yv;
		}
	}

	updateSnowboarders(step) {
		for (let i = 0; i < this.snowboarders.length; i++) {
			let snowboarder = this.snowboarders[i];

			// give the snowboarder a random xv (left, center, or right) every 0.5 sec
			if (!snowboarder.isCrashed) {
				let now = this.util.timestamp();
				if (now - snowboarder.timestamp >= 500) {
					let newXV = this.util.randomInt(0, 2);
					switch(newXV){
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

				// if the snowboarder another snowboarder, crash them both
				for (let j = 0; j < this.snowboarders.length; j++) {
					if (i != j) {
						let otherSnowboarder = this.snowboarders[j];
						if (this.isGameObjectCollidingWithOtherSkier(snowboarder, otherSnowboarder)) {
							this.crashSnowboarderOnCollision(snowboarder);
							this.crashSnowboarderOnCollision(otherSnowboarder);
						}
					}
				}
			} else {
				// recover from crash after 1 sec
				if (this.util.timestamp() - snowboarder.crashTimestamp >= 1000) {
					snowboarder.y += 30;
					snowboarder.isCrashed = false;
				}

				// recycle the snowboarder's position if they are crashed and have been passed
				if (this.hasGameObjectBeenPassed(snowboarder)) {
					snowboarder.isCrashed = false;
				}
			}

			// if the snowboarder hits the skier, crash them both
			if (!snowboarder.hasCollided && this.isGameObjectCollidingWithSkier(snowboarder) && this.skier.jumpOffset < 30) {
				this.skier.isCrashed = true;
				snowboarder.hasCollided = true;
				this.crashSnowboarderOnCollision(snowboarder);
			}

			// if the snowboarder (crashed or not) is far enough away, recyle its position
			if (snowboarder.y < -2000 || snowboarder.y > 5000 || snowboarder.x > 3000 || snowboarder.x < -3000) {
				snowboarder.isCrashed = false;
			}

			// update position
			snowboarder.x -= this.skier.xv * step - snowboarder.xv;
			snowboarder.y -= this.skier.yv * step - snowboarder.yv;
		}
	}

	// determine if the game object is colliding with the skier
	isGameObjectCollidingWithSkier(object) {
		let rect1 = this.skier.hitbox;
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };

		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// determine if the game object is colliding with an other skier
	isGameObjectCollidingWithOtherSkier(otherSkier, object) {
		let rect1 = { x: otherSkier.x + otherSkier.hbXOffset, y: otherSkier.y + otherSkier.hbYOffset, width: otherSkier.hbWidth, height: otherSkier.hbHeight };
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };

		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// make the skier crash
	crashOnCollision() {
		this.game.skier.isCrashed = true;
		this.game.recordAndResetStyle();
		if (typeof this.isOnFire !== undefined) {
			if (this.game.skier.isJumping) {
				this.isOnFire = true;
			}
		}
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
			snowboarder.crashTimestamp = this.util.timestamp();
			snowboarder.xv = 0;
			snowboarder.yv = 0;
			snowboarder.img = this.snowboarder_crash;
		}
	}

	// make the skier jump
	jumpOnCollision() {
		if (!this.game.skier.isCrashed && !this.game.skier.isSkatingLeft && !this.game.skier.isSkatingRight && !this.game.skier.isJumping) {
			let jumpV = this.game.skier.yv * this.game.jumpVMult + this.game.jumpVBase;
			this.game.skier.jumpV = jumpV;
			this.game.skier.isJumping = true;
			this.game.stylePointsToAwardOnLanding = jumpV * 5;
		}
	}

	// make the skier slow down
	slowOnCollision() {
		undefined;
	}

	// send score to server and then reset back to 0
	recordAndResetStyle() {
		let currentStyle = Math.floor(this.style);
		if (currentStyle > this.scoreToSend) {
			this.scoreToSend = currentStyle;
		}

		if (this.user.isLoggedIn && this.scoreToSend > this.user.userData.score) {
			if (!this.isOffline) {
				socket.emit('new_score', { _id: this.user.userData._id, username: this.user.userData.username, score: this.scoreToSend });
				socket.once('updated_score', (res) => {
					console.log('socket: updated_score', res);
					this.scoreToSend = 0;
					if (res.ok) {
						window.localStorage.removeItem('loginToken');
						window.localStorage.setItem('loginToken', res.data);
						this.user.validateLoginToken();
						this.user.refreshLeaderboard(this.user.leaderboardScoreCount);
					} else {
						this.user.signOut();
					}
				});
			} else {
				this.user.loggedInUsername.innerText = this.user.userData.username + ' ' + this.scoreToSend + '*';
			}
		}
		this.style = 0;
	}

	clearScore() {
		socket.emit('new_score', { _id: this.user.userData._id, username: this.user.userData.username, score: 0 });
		socket.on('updated_score', (res) => {
			console.log(res);
			if (res.ok) {
				window.localStorage.removeItem('loginToken');
				window.localStorage.setItem('loginToken', res.data);
				this.user.validateLoginToken();
			} else {
				this.user.signOut();
			}
		});
	}

	// return info about the instantaneous skier-to-mouse angle and velocity vectors
	getMouseAndVelocityInfo() {
		let mouseDiffX = -(this.mousePos.x - ((this.gameWidth / 2) + 7));
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

	goOnline() {
		console.log('network: online');
		this.isOffline = false;
		this.user.signInButton.disabled = false;
		this.user.registerButton.disabled = false;
		this.offlineInd.style.display = 'none';
	}

	goOffline() {
		console.log('network: offline');
		this.isOffline = true;
		this.user.signInButton.disabled = true;
		this.user.registerButton.disabled = true;
		this.offlineInd.style.display = 'block';
	}

	gameInfoBtnClickHandler() {
		this.owner.togglePause();
	}

	togglePause() {
		if (!this.user.isTextInputActive()) {
			if (this.isPaused) {
				this.startTime += (this.util.timestamp() - this.timePausedAt);
				this.isPaused = false;
				this.gamePausedText.style.display = 'none';
			} else {
				this.timePausedAt = this.util.timestamp();
				this.isPaused = true;
				this.gamePausedText.style.display = 'block';
			}
		}
	}

	// check to see if all images have been loaded and are ready to render
	confirmImagesAreAllLoaded() {
		for (let i = 0; i < this.images.length; i++) {
			let image = this.images[i];
			if (!image.isLoaded) {
				return false;
			}
		}
		return true;
	}

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

		if (this.doImageLoadCheck) {
			if (this.confirmImagesAreAllLoaded()) {
				this.doImageLoadCheck = false;
				this.user.profileImage.style.display = 'block';
				this.gameInfo.style.display = 'block';
			} else return;
		}

		// draw bumps
		for (let i = 0; i < this.bumpsGroup.length; i++) {
			let bump = this.bumpsGroup[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsSmall.length; i++) {
			let bump = this.bumpsSmall[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsLarge.length; i++) {
			let bump = this.bumpsLarge[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = '#DDDDDD';
			ctx.fillRect(this.skier.x + this.skierTrail[i].x, this.skier.y + this.skierTrail[i].y, 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i].x + 8, this.skier.y + this.skierTrail[i].y, 2, 1);
		}

		// draw jumps
		for (let i = 0; i < this.jumps.length; i++) {
			let jump = this.jumps[i];
			ctx.drawImage(jump.img, this.skier.x + jump.x, this.skier.y + jump.y);
		}

		// draw other skiers
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];
			ctx.drawImage(otherSkier.img, this.skier.x + otherSkier.x, this.skier.y + otherSkier.y);
		}

		// draw snowboarders
		for (let i = 0; i < this.snowboarders.length; i++) {
			let snowboarder = this.snowboarders[i];
			ctx.drawImage(snowboarder.img, this.skier.x + snowboarder.x, this.skier.y + snowboarder.y);
		}

		// draw rocks
		for (let i = 0; i < this.rocks.length; i++) {
			let rock = this.rocks[i];
			ctx.drawImage(rock.img, this.skier.x + rock.x, this.skier.y + rock.y);
		}

		// draw stumps
		for (let i = 0; i < this.stumps.length; i++) {
			let stump = this.stumps[i];
			ctx.drawImage(stump.img, this.skier.x + stump.x, this.skier.y + stump.y);
		}

		// draw trees above skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y < tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw lift towers above skier
		this.lift.drawTowersAbovePlayer(ctx);

		// draw skier
		this.skier.draw(ctx);

		// draw trees below skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y >= tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw lift chairs
		this.lift.drawChairs(ctx);

		// draw lift cables
		this.lift.drawCables(ctx);

		// draw lift towers below skier
		this.lift.drawTowersBelowPlayer(ctx);
		this.lift.drawTowerTops(ctx);

		if (!this.hideHUD) {
			// draw game info section
			let timeText = 'Time:\xa0\xa0' + this.util.timeToString(this.currentTime - this.startTime);
			this.gameInfoTime.innerText = timeText;

			let leadingSpace = '\xa0\xa0\xa0\xa0\xa0';
			let dist = Math.ceil(this.yDist / 28.7514);
			if (dist > 999999) {
				leadingSpace = '';
			} else if (dist > 99999) {
				leadingSpace = '\xa0';
			} else if (dist > 9999) {
				leadingSpace = '\xa0\xa0';
			} else if (dist > 999) {
				leadingSpace = '\xa0\xa0\xa0';
			} else if (dist > 99) {
				leadingSpace = '\xa0\xa0\xa0\xa0';
			}
			let distText = 'Dist:' + leadingSpace + dist.toString().padStart(2, '0') + 'm';
			this.gameInfoDist.innerText = distText;

			let speedText = 'Speed:\xa0\xa0\xa0\xa0' + Math.ceil(this.skier.currentSpeed / 28.7514).toString().padStart(2, '0') + 'm/s';
			this.gameInfoSpeed.innerText = speedText;

			let styleText = 'Style:\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + Math.floor(this.style);
			this.gameInfoStyle.innerText = styleText;

			// control visibility of game paused text html element
			if (this.isPaused) {
				this.gamePausedText.style.display = 'block';
			} else {
				this.gamePausedText.style.display = 'none';
			}

		} else {
			this.gamePausedText.style.display = 'none';
		}
	}
}