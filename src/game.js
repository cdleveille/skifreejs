import Skier from "/src/skier.js";

export default class Game {
	constructor() {
		this.skier = new Skier(this);
		this.mousePos = [0, 0];
		this.lastLogTime = null;
		this.treeDensity = 1.0
		this.treeCount;
		this.collisionsEnabled = true;

		this.loadGameImages();
		this.populateInitialTrees();
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
	}

	populateInitialTrees() {
		// generate trees to put on screen at start of game
		this.trees = [];

		// number of trees to generate is proportional to total screen area
		let width = window.innerWidth;
		let height = window.innerHeight;
		let area = width * height;

		this.treeCount = Math.floor(area * (50 / 562860.0) * this.treeDensity);

		for (let n = 0; n < this.treeCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);

			this.trees.push([x, y, false]);
		}
	}

	spawnNewTreeOffScreen() {
		let x = this.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
		let y = this.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

		// if tree would be visible, spawn it nearby off screen instead
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
		return [x, y, false];
	}

	// adapt game to the size of the window
	resize(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.adaptTreeCountToScreenSize();
	}

	adaptTreeCountToScreenSize() {
		this.treeCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.treeDensity);

		// trim excess offscreen trees
		if (this.trees.length > this.treeCount) {
			let diff = this.trees.length - this.treeCount;
			let trimCount = 0;
			for (let i = 0; i < this.trees.length; i++) {
				let x = this.trees[i][0];
				let y = this.trees[i][1];

				// remove the tree if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						trimCount++;
						this.trees.splice(i, 1);
				}
			}
		// add some new trees offscreen
		} else if (this.trees.length < this.treeCount) {
			let diff = this.treeCount - this.trees.length;
			for (let n = 0; n < diff; n++) {
				this.trees.push(this.spawnNewTreeOffScreen());
			}
		}
	}

	// get the current time (high precision)
	timestamp() {
		return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	}
	
	// update game objects
	update(step) {
		this.updateSkier(this.crunchSomeNumbas(), step);
		this.handleCollisions();

		// scale the number of trees to the size of the screen
		if (this.treeCount != this.trees.length) {
			this.adaptTreeCountToScreenSize();
		}

		// update position of game objects based on speed/direction of skier
		for (let i = 0; i < this.trees.length; i++) {
			this.trees[i][0] -= this.skier.xv * step;
			this.trees[i][1] -= this.skier.yv * step;
		}

		this.lodge.xc -= this.skier.xv * step;
		this.lodge.yc -= this.skier.yv * step;
	}

	// account for collions between game objects
	handleCollisions() {
		for (let i = 0; i < this.trees.length; i++) {
			let treeX = this.trees[i][0];
			let treeY = this.trees[i][1];
			let hitThisTreeAlready = this.trees[i][2];

			// delete uphill offscreen trees once they are passed
			if (this.skier.y - treeY > this.gameHeight * (2 /3 ) + 50) {
				this.trees[i] = this.spawnNewTreeOffScreen();
			}

			// if the skier hits a tree they haven't hit already, set isCrashed to true
			if (Math.abs(treeX) < 20 && Math.abs(treeY) < 20) {
				if (this.collisionsEnabled && !hitThisTreeAlready) {
					this.skier.isCrashed = true;
					this.trees[i][2] = true;
				}
			}
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

	updateSkier(mouseToSkierDifferential, step) {
		let mouseToSkierAngle = mouseToSkierDifferential[0];
		let mouseToSkierDistance = mouseToSkierDifferential[1];
		let mouseAngleVectors = mouseToSkierDifferential[2];

		let vAngle = mouseToSkierDifferential[3];
		let speed = mouseToSkierDifferential[4];
		let vVectors = mouseToSkierDifferential[5];

		let maxSpeedX = 500;
		let maxSpeedY = 600;

		//this.log([this.skier.xv, this.skier.yv]);
		//this.log(vVectors);
		//this.log(mouseAngleVectors);
		//this.log(mouseToSkierDistance);
		//this.log(speed);

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
		if (mouseToSkierAngle < 90 && mouseToSkierAngle > -5) {
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

			let allowYVIncr = true;
			if (Math.abs(this.skier.xv) >= maxSpeedX) {
				allowYVIncr = true;
			}

			if (!this.skier.isCrashed) {
				this.skier.isStopped = false;

				this.skier.xv += this.skier.accelX * mouseAngleVectors[0];
				if (allowYVIncr) {
					this.skier.yv += this.skier.accelY * mouseAngleVectors[1];
				}
			}

			let enforceMaxSpeed = true;
			if (enforceMaxSpeed) {
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
	}

	stopSkier(vVectors) {
		if (!this.skier.isStopped) {
			let xDecelAmt = this.skier.decel * vVectors[0];
			let yDecelAmt = this.skier.decel * vVectors[1];

			this.skier.xv -= xDecelAmt;
			this.skier.yv -= yDecelAmt;

			if (this.skier.yv < 0) {
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

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
		
		// draw trees
		for (let i = 0; i < this.trees.length; i++) {
			ctx.drawImage(this.tree_small, this.skier.x + this.trees[i][0], this.skier.y + this.trees[i][1]);
		}

		ctx.drawImage(this.lodge, this.skier.x + this.lodge.xc, this.skier.y + this.lodge.yc);

		// draw skier
		this.skier.draw(ctx);

		//ctx.drawImage(this.boarder_bro, this.skier.x + 50, this.skier.y - 200);
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