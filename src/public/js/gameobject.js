export default class GameObject {
	constructor(game, x, y, hasBeenHit, hbX, hbY, hbW, hbH, collisionAction, img) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.hasBeenHit = hasBeenHit;
		this.hitbox = {
			x: hbX,
			y: hbY,
			width: hbW,
			height: hbH
		};
		this.collisionAction = collisionAction;
		this.img = img;
	}

	isCollidingWithSkier() {
		let rect1 = { x: this.game.skier.hitbox.x, y: this.game.skier.hitbox.y, width: this.game.skier.hitbox.width, height: this.game.skier.hitbox.height };
		let rect2 = { x: this.hitbox.x, y: this.hitbox.y, width: this.hitbox.width, height: this.hitbox.height };

		if (rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y) {
			return true;
		}
		return false;
	}

	update(step) {
		// update position based on x/y-velocity of skier
		this.x -= this.game.skier.xv * step;
		this.y -= this.game.skier.yv * step;

		// check for collision with skier
		if (this.isCollidingWithSkier()) {
			this.collisionAction();
		}
	}

	draw(ctx) {
		ctx.drawImage(this.img, this.game.skier.x + this.x, this.game.skier.y + this.y);
	}
}